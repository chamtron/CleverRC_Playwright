// pages/login.page.ts
import { Page } from '@playwright/test';

export class HeaderPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async searchBtn() {
    await this.page.getByRole('textbox', { name: 'Search patient name or phone number' });
  }
  async addPatientBtn() {
    await this.page.locator("//button[@class='MuiButtonBase-root MuiButton-root MuiButton-primary MuiButton-primaryDefault MuiButton-sizeMedium MuiButton-primarySizeMedium MuiButton-colorDefault MuiButton-root MuiButton-primary MuiButton-primaryDefault MuiButton-sizeMedium MuiButton-primarySizeMedium MuiButton-colorDefault css-w1xnjr']//img[@loading='lazy']");
  }
  async chatBtn() {
    await this.page.locator("//body/div[@id='root']/div[@class='MuiBox-root css-ejaywg']/main[@class='MuiBox-root css-1vsqtjm']/header[@class='MuiPaper-root MuiPaper-elevation MuiPaper-elevation4 MuiAppBar-root MuiAppBar-colorPrimary MuiAppBar-positionSticky css-1cneg2f']/div[@class='MuiBox-root css-1pc4irz']/div[@class='MuiBox-root css-njtqgb']/button[2]/span[1]//*[name()='svg']//*[name()='path' and contains(@fill-rule,'evenodd')]");
  }
  async notificationBtn() {
    await this.page.locator('button').filter({ hasText: '0' }).first();
  }
  async helpBtn() {
    await this.page.locator('button').nth(3);
  }
  async settingsBtn() {
    await this.page.locator('button').nth(4);
  }


}
