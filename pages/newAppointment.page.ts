// pages/CheckInPage.js
import { Page, Locator } from '@playwright/test';

export class NewAppointmentPage {
  /**
   * @param {Page} page 
   */
    readonly page: Page;
    readonly newAppointmentBtn: Locator;
   readonly searchPatient: Locator;
    readonly selectPatientOption: Locator;
    readonly addToWorklist: Locator;
    readonly saveButton: Locator;
    readonly url: string;   

  constructor(page: Page) {
    this.page = page;

    // Selectors
    this.newAppointmentBtn    = page.getByText('New Appointment');
    this.searchPatient = page.locator("(//input[@type='text'])[6]");
  this.selectPatientOption = page.getByText('p01 mid 01');
    this.addToWorklist      = page.getByText('Add to Worklist', { exact: true });
    this.saveButton         = page.getByText('Save', { exact: true });
    // URL
    this.url = 'https://rcd.vnclever.com/login';
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async selectPatient(patientName: string) {
    await this.searchPatient.fill(patientName);
    await this.selectPatientOption.waitFor({ state: 'visible', timeout: 5000 });
    await this.selectPatientOption.click();
  
  }

  async selectAndSave() {
    // await this.clinicDropdown.click();
    // await this.clinicOption.click();
    // await this.doctorDropdown.click();
    // await this.doctorOption.click();
    await this.addToWorklist.click();
    await this.saveButton.click();
  }
}
