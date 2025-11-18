// pages/login.page.ts
import { Page } from '@playwright/test';

export class DeskPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async checkinBtn() {
    // chỉnh selector button
    await this.page.getByRole('button', { name: 'Check In' });
  }
  async appointmentBtn() {
    await this.page.getByRole('button', { name: 'New Appointment' });
  }
  async cardModeBtn() {
    await this.page.locator('button').nth(0);
  }
  async listModeBtn() {
    await this.page.locator('svg').nth(0);
  }
  async dayBtn() {
    await this.page.getByText('Day');
  }
  async weekBtn() {
    await this.page.getByText('Week');
  }
  async monthBtn() {
    await this.page.getByText('Month');
  }
  async customBtn() {
    await this.page.getByText('Custom');
  }
  async todayBtn() {
    await this.page.getByText('Today');
  }
  async allBtn() {
    await this.page.getByText('All');
  }
  async scheduledBtn() {
    await this.page.getByText('Scheduled', { exact: true });
  }
  async waitingBtn() {
    await this.page.getByText('Waiting', { exact: true });  
  }
  async imageTakingBtn() {
    await this.page.getByText('Image Taking', { exact: true });
  }
  async completedBtn() {
    await this.page.getByText('Completed', { exact: true });
  }
  async deliveredBtn() {
    await this.page.getByText('Delivered', { exact: true });
  }
  async searchPatientTrackBtn() {
    await this.page.getByPlaceholder('Search a patient to track');
  }
  async downloadExelBtn() {
    await this.page.locator('div.MuiBox-root.css-1xubo5n');
  }

}
