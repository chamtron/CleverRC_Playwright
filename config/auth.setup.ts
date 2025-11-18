// config/auth.setup.ts (HOẶC setup/auth.setup.ts nếu bạn đặt tên là setup)

// Đảm bảo file setup sử dụng 'require' (CommonJS) để tương thích với globalSetup
const { test: setup, expect } = require('@playwright/test');
const path = require('path');
// Cập nhật đường dẫn tương đối sau khi file setup được di chuyển
const { readExcel } = require('../utils/readExcel'); 
const { LoginPage } = require('../pages/login.page'); 

const STORAGE_STATE_FILE = path.resolve(__dirname, '../storageState.json');

// Tạo hàm Setup chính
async function globalSetup() {
    console.log('--- Bắt đầu Global Setup: Đăng nhập...');

    // Playwright KHÔNG cho phép gọi test() hoặc setup() trong ngữ cảnh này,
    // nhưng chúng ta cần gọi để tạo trạng thái. 
    // Chúng ta sẽ dùng cách đóng gói toàn bộ logic vào một test duy nhất.

    // 1. Chạy logic setup bên trong một khối 'setup' giả lập
    // Đây là nơi lỗi xảy ra. Hãy giữ logic này đơn giản nhất:
    
    // (LƯU Ý: Vì bạn đã di chuyển file, bạn nên dùng 'setup' thay vì 'test')
    
    // Nếu bạn đang dùng cú pháp ES Module (import)
    // Tạm thời, hãy giữ cú pháp hiện tại và đảm bảo 'require' đã được áp dụng đúng.

    // Khởi tạo page và request cần thiết
    const { chromium, request } = require('@playwright/test');
    
    // Tạo trình duyệt (chỉ cần context để đăng nhập)
    const browser = await chromium.launch(); 
    const page = await browser.newPage();

    // 1. Đọc dữ liệu
    const dataFile = path.resolve(__dirname, '../data/login-data.xlsx');
    const testData = readExcel(dataFile);
    const loginData = testData[0]; 
    
    if (!loginData || loginData.expectedResult !== 'success') {
        throw new Error('Dữ liệu login ở index 1 không hợp lệ hoặc không phải là "success"');
    }

    // 2. Thực hiện đăng nhập
    const login = new LoginPage(page);
    await page.goto('https://rcd.vnclever.com/login'); // Dùng đường dẫn đầy đủ
    
    await login.fillRcId(loginData.rcId);
    await login.fillUserId(loginData.userId);
    await login.fillPassword(loginData.password);
    await login.submit();

    // 3. Chờ đợi đăng nhập thành công
    await page.waitForURL('https://rcd.vnclever.com/');
    console.log('✅ Đăng nhập thành công.');

    // 4. LƯU TRẠNG THÁI
    await page.context().storageState({ path: STORAGE_STATE_FILE });
    console.log('✅ Trạng thái đăng nhập đã được lưu vào ${STORAGE_STATE_FILE}');

    await browser.close();
}

// Export hàm này để Playwright gọi nó, KHÔNG phải hàm setup()
module.exports = globalSetup;