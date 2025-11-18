// @ts-check
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Đường dẫn đến file trạng thái đăng nhập sẽ được tạo bởi auth.setup.ts
 */
const STORAGE_STATE = path.join(__dirname, 'storageState.json');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /**
   * Thư mục chứa các file test
   */
  testDir: './tests',
  testIgnore: '**/auth.setup.ts', // Bỏ qua file setup

  /* Chạy file setup toàn cục TRƯỚC TIÊN */
  // Sử dụng logic kiểm tra file tồn tại của bạn để tránh lỗi
  globalSetup: fs.existsSync(path.resolve(__dirname, './config/auth.setup.ts'))
    ? require.resolve('./config/auth.setup.ts')
    : undefined,

  /* Cài đặt chung cho tất cả các project */
  use: {
    /* Base URL chung cho tất cả test */
    baseURL: 'https://rcd.vnclever.com',

    /* Các cài đặt chung từ file gốc của bạn */
    trace: 'on-first-retry',
    headless: true, // Chạy ở chế độ có giao diện
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Cấu hình cho API testing
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      // Thêm Authorization header nếu cần (sẽ được Playwright tự thêm từ storageState)
    },
  },

  /* Các cài đặt nâng cao */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  
  // Đặt workers: 1 để chạy tuần tự.
  workers: 1, 
  
  reporter: [['list'], ['html', { open: 'never' }]],

  /* Cấu hình các Project (Dự án) test */
  projects: [
    {
      // Project A: Chạy các test cần đăng nhập
      name: 'Authenticated Tests',
      // ĐÃ SỬA: Dùng regex OR (|) để khớp cả hai file test cần đăng nhập
      testMatch: /checkInPage\.spec\.js|newAppointment\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        locale: 'vi-VN',
        timezoneId: 'Asia/Ho_Chi_Minh', // Ép buộc dùng giờ VN thay vì UTC
        // 3. Sử dụng trạng thái đã lưu để duy trì đăng nhập
        storageState: STORAGE_STATE,
      },
    },

    {
      // Project B: Chạy các test login data-driven
      name: 'Login Tests',
      testMatch: /login\.spec\.js/, // Chỉ chạy file này
      use: {
        ...devices['Desktop Chrome'],
        // 4. KHÔNG DÙNG storageState ở đây
      },
    },
    // ...
  ],
});