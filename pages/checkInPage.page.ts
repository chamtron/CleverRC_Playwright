// pages/CheckInPage.js
import { Page, Locator } from '@playwright/test';

export class CheckInPage {
  /**
   * @param {Page} page 
   */
    readonly page: Page;
    readonly clinicDropdown: Locator;
    readonly clinicOption: Locator;
    readonly doctorDropdown: Locator;
    readonly doctorOption: Locator;
    readonly patientSearchInput: Locator;
    readonly patientSearchButton: Locator;
    //readonly patientOption: Locator;
    readonly addToWorklist: Locator;
    readonly saveButton: Locator;
    readonly cancelButton: Locator;
    readonly checkInButton: Locator;
    readonly cardModal: Locator;
    readonly deleteAppointment: Locator;
    readonly confirmDeleteAppointment: Locator;
    
    readonly url: string;   

  constructor(page: Page) {
    this.page = page;

    // Selectors
    this.checkInButton    = page.getByText('Check In');
    this.clinicDropdown     = page.getByPlaceholder('Select Clinic')
    this.clinicOption       = page.getByRole('option', { name: 'Clinic 1' });

    this.doctorDropdown     = page.getByRole('combobox', { name: 'Doctor' });
    this.doctorOption       = page.getByRole('option', { name: 'Doctor 1' });

    this.patientSearchInput = page.locator('input').nth(3);
    this.patientSearchButton = page.locator('span').filter({ hasText: 'p01 mid 01' }).first()
    //this.patientOption      = page.getByText('p01 mid 01');

    this.addToWorklist      = page.getByText('Add to Worklist', { exact: true });

    this.saveButton         = page.locator('//button[normalize-space()="Save"]');
    
    this.cancelButton       = page.getByRole('button', { name: 'Cancel' });

    this.cardModal          = page.locator('div.MuiCardContent-root.css-wmn98');
    this.deleteAppointment  = page.locator("//button[contains(@class,'MuiButtonBase-root MuiButton-root MuiButton-primary MuiButton-primaryDefault MuiButton-sizeMini MuiButton-primarySizeMini MuiButton-colorDefault MuiButton-root MuiButton-primary MuiButton-primaryDefault MuiButton-sizeMini MuiButton-primarySizeMini MuiButton-colorDefault css-11ak52r')]//img[contains(@loading,'lazy')]");
    this.confirmDeleteAppointment = page.getByRole('button', { name: 'OK' });

    // URL
    this.url = 'https://rcd.vnclever.com/login';
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async selectPatient(patientName: string) {
    await this.patientSearchInput.fill(patientName);
    await this.patientSearchButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.patientSearchButton.click();
  
  }

  async selectAndClick() {
    await this.clinicDropdown.click();
    await this.clinicOption.click();
    await this.doctorDropdown.click();
    await this.doctorOption.click();
    await this.addToWorklist.click();
    await this.saveButton.click();
  }
}
