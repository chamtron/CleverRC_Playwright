// pages/login.page.ts
import { Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('https://rcd.vnclever.com/login'); // chỉnh url
  }

  async fillRcId(rcId: string) {
    // chỉnh selector theo app, ví dụ input[name="username"]
    await this.page.fill('input[name="rcId"]', rcId);
  }
  async fillUserId(userId: string) {
    // chỉnh selector theo app, ví dụ input[name="username"]
    await this.page.fill('input[name="userId"]', userId);
  }

  async fillPassword(password: string) {
    await this.page.fill('input[name="password"]', password);
  }

  async submit() {
    // chỉnh selector button
    await this.page.click('button[type="submit"]');
  }
  
  async closePopupXBtn() {
    return this.page.getByTestId('CloseRoundedIcon');
  }
  async closePopupBtn() {
    return this.page.getByRole('button', { name: 'Close' });
  }
  async moveLogoutBtn() {
    await this.page.locator("//div[@class='MuiBox-root css-w05rdp']//*[name()='svg']");
  }
  async logoutBtn() {
    await this.page.getByText('Logout');
  }
  async confirmLogoutBtn() {
    await this.page.getByRole('button', { name: 'Confirm' })
  }
  async cancelLogoutBtn() {
    await this.page.getByRole('button', { name: 'Cancel' })
  }


   getErrorMessageLocator() {
    // ví dụ snackbar / error message locator, chỉnh theo app
    return this.page.getByText('Información incorrecta. Inténtalo de nuevo.'); 
  }

  getPopup() {
    return this.page.getByText('Popup', { exact: true });
}

}
