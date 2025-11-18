const { test, expect } = require('@playwright/test');
const { CheckInPage } = require('../pages/checkInPage.page');

// --- Dữ liệu Test ---
const TEST_DATA = {
    // Thông tin cơ bản (Giả định)
    rcId: 'rcd2805', 
    userId: 'rcd2805', 
    password: 'Cham@1234', 
    
    // Dữ liệu Appointment cần xác minh
    clinic: 'Clinic 1', // Tên phòng khám/cơ sở
    doctor: 'Doctor 1', // Tên bác sĩ
    
    // Dữ liệu bệnh nhân (dùng để tìm kiếm và xác minh)
    patientSearchTerm: 'p01', // Từ khóa tìm bệnh nhân
    patientFullName: 'p01 mid 01', // Tên đầy đủ của bệnh nhân sau khi tìm kiếm (Đã khôi phục)
    
    // Dữ liệu phản hồi tạo (Create Response) mong đợi
    expectedCreateMessage: "cm13", // (Đã khôi phục)
    
    // Dữ liệu phản hồi xóa (Delete Response) mong đợi
    expectedDeleteMessage: "cm13", // Giả định message thành công của Delete là "ds01" (Đã khôi phục)
    
};

// --- Cấu hình API ---
const API_BASE_URL = 'https://crgback.rcd.vnclever.com/api/v1/graphql'; 
const CREATE_OPERATION_NAME = 'AddAppointment'; 

test.describe('Hybrid Check In/Add Appointment', () => {

    test('@TC001 - CheckIn directly via UI and verify/delete via API', async ({ page, request }) => {
        
        // Khởi tạo Page Object
        const checkInPage = new CheckInPage(page);

        // 0. Truy cập trang chính sau khi Global Setup đăng nhập
        await checkInPage.goto(); 
        await expect(page).toHaveURL('https://rcd.vnclever.com/'); 

        // ===============================================
        // GIAI ĐOẠN 1A: TRÍCH XUẤT TOKEN TỪ COOKIE ĐÃ LƯU
        // ===============================================
        const cookies = await page.context().cookies();
        const accessTokenCookie = cookies.find(c => c.name === 'accessToken');
        
        if (!accessTokenCookie || !accessTokenCookie.value) {
            throw new Error("❌ Không tìm thấy 'accessToken' Cookie. Global Setup có thể bị lỗi.");
        }
        
        const authToken = accessTokenCookie.value; 
        console.log('✅ Token xác thực đã được trích xuất từ Cookie.');

        // KHAI BÁO BIẾN DÙNG CHUNG BẰNG 'let' ĐỂ CÓ THỂ GÁN LẠI
        let appointmentId;
        let apiResponse;
        let responseBody;
        let createdAppointment;
        
        // ==================================
        // GIAI ĐOẠN 1B: UI TEST (Tạo Dữ liệu)
        // ==================================
        console.log('--- GIAI ĐOẠN 1 (UI): Đang tạo Appointment...');

        // B1: Thực hiện các hành động mở modal và điền dữ liệu
        await checkInPage.checkInButton.click();
        
        // Nhập từ khóa tìm kiếm
        await checkInPage.selectPatient(TEST_DATA.patientSearchTerm); 
      
        // KHẮC PHỤC LỖI "element not visible": Chờ và click vào kết quả tìm kiếm bệnh nhân ('p01 mid 01')
        const patientResultLocator = page.locator('span').filter({ hasText: TEST_DATA.patientFullName }).first();
        await patientResultLocator.waitFor({ state: 'visible', timeout: 10000 });
        await patientResultLocator.click();

        // Thêm memo (để đảm bảo data là duy nhất cho lần test này)
        // (Giả định: checkInPage.memoField là một selector hợp lệ)
        // await checkInPage.memoField.fill(TEST_DATA.memo);
        
        await checkInPage.addToWorklist.click();
       

        // B2: Đặt trình lắng nghe (listener) cho phản hồi API tạo
        const responsePromise = page.waitForResponse(response => {
            // Lọc theo URL và Method POST đến GraphQL endpoint
            return response.url().includes(API_BASE_URL) && response.request().method() === 'POST';
        });

        console.log('=== Payload gửi đi trước khi tạo Appointment ===');
        console.log({
        patient: TEST_DATA.patientSearchTerm,
        clinic: TEST_DATA.clinic,
        doctor: TEST_DATA.doctor
});
        // B3: Kích hoạt hành động gây ra API (click Save)
        await checkInPage.saveButton.click(); 
        

        // B4: Chờ đợi và xử lý phản hồi API
        let initialResponse; 
        try {
            initialResponse = await responsePromise;
            console.log(`✅ Bắt được phản hồi API POST từ ${initialResponse.url()}`);
        } catch (error) {
            throw new Error(`❌ Không bắt được phản hồi API tạo Appointment (API_BASE_URL: ${API_BASE_URL}). Vui lòng kiểm tra lại URL API hoặc thời gian chờ.`);
        }
        
        if (initialResponse.status() !== 200) {
            throw new Error(`API tạo Appointment trả về Status Code ${initialResponse.status()}`);
        }


        // B5: Trích xuất và Assert Phản hồi Tạo
        const createResponseBody = await initialResponse.json();
        
        // === DEBUG MỚI: IN TOÀN BỘ PHẢN HỒI RA ĐỂ XEM CẤU TRÚC JSON ===
        console.log('--- PHẢN HỒI API SAU KHI CLICK SAVE ---');
        console.log(JSON.stringify(createResponseBody, null, 2));
        console.log('------------------------------------------------------------------');
        // =============================================================

        // *** SỬA LỖI 1: Xử lý trường hợp API trả về lỗi GraphQL (data: null) ***
        if (createResponseBody.errors && createResponseBody.errors.length > 0) {
            const errorMessage = createResponseBody.errors.map(e => e.message).join(' | ');
            throw new Error(`❌ API tạo Appointment thất bại với lỗi GraphQL: ${errorMessage}. (Lỗi: ${createResponseBody.errors[0].message}).`);
        }
        
        // *** SỬA LỖI 2: Ưu tiên 'createAppointment' làm key chính xác dựa trên response JSON ***
        // Thêm 'createAppointment' vào đầu danh sách check
        const createAppointmentResult = createResponseBody?.data?.createAppointment;

        // **ASSERT TRỰC TIẾP TRÊN PHẢN HỒI TẠO**
        //expect(createAppointmentResult, 'Không tìm thấy đối tượng createAppointment trong phản hồi. Vui lòng kiểm tra console log để xem cấu trúc response JSON.').toBeDefined();
        
        // 1. Assert 'success'
        expect(createAppointmentResult.success, "Trường 'success' phải là true.").toEqual(true);
        
        // 2. Assert 'message'
        expect(createAppointmentResult.message, `Trường 'message' phải là `).toEqual(TEST_DATA.expectedCreateMessage);
        
        // 3. Trích xuất 'id'
        appointmentId = createAppointmentResult.id;

        if (!appointmentId) {
             throw new Error(`❌ Không thể trích xuất Appointment ID từ phản hồi API sau khi tạo.`);
        }

        console.log(`✅ GIAI ĐOẠN 1 HOÀN TẤT: Appointment đã được tạo. ID trích xuất: ${appointmentId}`);


        // ==================================
        // GIAI ĐOẠN 2: API TEST (Xác minh dữ liệu trong DB)
        // ==================================
        console.log('--- GIAI ĐOẠN 2 (API): Đang xác minh dữ liệu...');
        
        // Query GraphQL để lấy thông tin chi tiết của Appointment vừa tạo
        const GET_APPOINTMENT_QUERY = `
            query GetAppointment($input: GetAppointmentInput!) {
                getAppointment(input: $input) {
                    id
                    imgWorkListId {
                        id
                        patient {
                            id
                            patientId
                            firstName
                            lastName
                            fullName
                            gender
                            dob
                            phoneNumber
                        }
                        appointment
                        orderItem {
                            orderItemId
                            orderId
                            name
                            price
                            orderNo
                            isLinked
                        }
                        orderCategoryId
                        orderCategoryName
                        toothNumbers
                        price
                    }
                    images {
                        worklistId
                        images {
                            id
                            rcId
                            uploadedTime
                            fileName
                            originalName
                            imgStorage
                            technicians {
                                id
                                fullName
                            }
                            equipments {
                                id
                                name
                            }
                            metadata {
                                type
                                image {
                                    modality
                                    acqDateTime
                                    acqMode
                                    extension
                                    e2tag
                                }
                                permissions
                            }
                            tags {
                                preInitial {
                                    rotation
                                    horizontalFlip
                                    verticalFlip
                                }
                                initial {
                                    rotation
                                    horizontalFlip
                                    verticalFlip
                                }
                            }
                        }
                    }
                }
            }
        `;

        // Thực hiện gọi API GET lần 1
        apiResponse = await request.post(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                query: GET_APPOINTMENT_QUERY,
                variables: {
                    input: {
                        id: appointmentId 
                    }
                }
            }
        });

        // Xác minh dữ liệu tồn tại
        expect(apiResponse.status()).toBe(200);
        responseBody = await apiResponse.json();
        createdAppointment = responseBody?.data?.getAppointment;
        
        // 3. Xác minh dữ liệu
        expect(createdAppointment).toBeDefined(); // Phải tìm thấy
        
        // *** SỬA LỖI: Truy cập thuộc tính imgWorkListId (giả định là Object) ***
        expect(createdAppointment.imgWorkListId[0]?.patient?.fullName).toEqual(TEST_DATA.patientFullName);
        
        expect(createdAppointment.id).toEqual(appointmentId);
        
        console.log('✅ API: Dữ liệu đã được xác minh tồn tại trong CSDL và tên bệnh nhân khớp.');


        // ==================================
        // GIAI ĐOẠN 3: API TEST (Xóa dữ liệu)
        // ==================================
        console.log('--- GIAI ĐOẠN 3 (API): Đang xóa Appointment...');

        const DELETE_APPOINTMENT_MUTATION = `
            mutation DeleteAppointment($input: DeleteAppointmentInput!) {
                deleteAppointment(input: $input) {
                    success
                    message
                }
            }
        `;

        // 1. Thực hiện gọi API DELETE
        apiResponse = await request.post(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                query: DELETE_APPOINTMENT_MUTATION,
                variables: {
                    input: {
                        appointmentId: appointmentId // Dùng ID đã tạo
                    }
                }
            }
        });

        // 2. Assert Phản hồi Xóa
        expect(apiResponse.status()).toBe(200);
        const deleteResponseBody = await apiResponse.json();
        const deleteAppointmentResult = deleteResponseBody?.data?.deleteAppointment;

        expect(deleteAppointmentResult, 'Không tìm thấy đối tượng deleteAppointment trong phản hồi xóa.').toBeDefined();
        expect(deleteAppointmentResult.success, "Trường 'success' trong phản hồi xóa phải là true.").toEqual(true);
        
        // *** SỬA LỖI: Dùng TEST_DATA.expectedDeleteMessage thay vì hardcode 'cm13' ***
        expect(deleteAppointmentResult.message, `Trường 'message' phải là ${TEST_DATA.expectedDeleteMessage}`).toEqual(TEST_DATA.expectedDeleteMessage);
        
        console.log('✅ API: Appointment đã được xóa thành công. (Kiểm tra theo success/message)');


        // ==================================
        // GIAI ĐOẠN 4: API TEST (Xác minh đã xóa)
        // ==================================
        console.log('--- GIAI ĐOẠN 4 (API): Đang xác minh Appointment đã bị xóa...');
        
        // Thực hiện lại gọi API GET
        apiResponse = await request.post(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                query: GET_APPOINTMENT_QUERY,
                variables: {
                    input: {
                        id: appointmentId 
                    }
                }
            }
        });

        // Kiểm tra rằng đối tượng getAppointment phải là null hoặc undefined
        expect(apiResponse.status()).toBe(200);
        responseBody = await apiResponse.json();
        createdAppointment = responseBody?.errors[0];

        // **ASSERT: Dữ liệu phải là NULL sau khi xóa**
        expect(createdAppointment.message).toEqual('cm22'); 

        
        console.log('✅ API: Xác minh hoàn tất. Appointment không còn tồn tại.');
    });
});