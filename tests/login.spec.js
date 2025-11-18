// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';
//import { readExcel } from '../utils/readExcel';
//import { LoginPage } from '../pages/login.page';

// ✅ Đọc dữ liệu Excel
const dataFile = path.resolve(__dirname, '../data/login-data.xlsx');
const testData = readExcel(dataFile); 
// Kết quả dạng: [{ rcId, userId, password, expectedResult, expectedMessage }, ...]

test.describe('Login form data-driven', () => {

  testData.forEach((row, index) => {
    const name = `Login[${index + 1}]: ${row.rcId || '<empty>'} -> ${row.expectedResult}`;

    test(name, async ({ page }) => {
      const login = new LoginPage(page);
      await login.goto();
     

      // ✅ Clear input fields trước khi nhập
      await login.fillRcId('');
      await login.fillUserId('');
      await login.fillPassword('');

      // ✅ Điền dữ liệu nếu không rỗng
      if (row.rcId && row.rcId !== 'empty') {
        await login.fillRcId(row.rcId);
      }
      if (row.userId && row.userId !== 'empty') {
        await login.fillUserId(row.userId);
      }
      if (row.password && row.password !== 'empty') {
        await login.fillPassword(row.password);
      }

      // ✅ Submit form
      await login.submit();

      // ✅ Xử lý kết quả
      if (row.expectedResult === 'success') {
        // Ví dụ: chuyển hướng đến dashboard hoặc hiển thị text "Dashboard"
        await expect(page).toHaveURL('https://rcd.vnclever.com/');
        // if (row.expectedMessage) {
        //   await expect(page.getByText(row.expectedMessage, { exact: false })).toBeVisible();
        // }
      } else {
        // ❌ Case lỗi
        const err = login.getErrorMessageLocator();
        //await expect(err).toBeVisible();
        if (row.expectedMessage) {
          await expect(err).toContainText(row.expectedMessage);
        }
      }

        const popup = login.getPopup();
//const closeX = await login.closePopupBtn();

try {
  const popup = login.getPopup();

  if (await popup.isVisible({ timeout: 6000 })) {
    console.log("Popup đã xuất hiện.");

    const closeX = await login.closePopupXBtn();
    if (await closeX.isVisible()) {
      await closeX.click();
      console.log("Đã đóng popup bằng nút X.");
    } else {
      const closeBtn = await login.closePopupBtn();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        console.log("Đã đóng popup bằng nút Close.");
      }
    }
  }
} catch (err) {
  console.log("Không tìm thấy popup hoặc lỗi khi đóng popup:", err.message);
}


});
  });
});


