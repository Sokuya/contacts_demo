//Style 'console.log' command to highlight in Debug Console
const consoleLogYellow = (message: string) => {
  const yellow = '\x1b[33m'; // Yellow text
  const reset = '\x1b[0m'; // Reset all styles
  console.log(`${yellow}${message}${reset}`);
};
//import { Logger } from '../utils/Logger';
//import { ContactDetails } from '../types/Interfaces'; // Type definition for contact details

// Enums specific to ContactsPage
enum ElementIdentifiers {
  ADD_BUTTON = "~Add",
  FIRST_NAME = "First name",
  LAST_NAME = "Last name",
  COMPANY = "Company",
  PHONE = "~Insert add phone",
  EMAIL = "~Insert add email",
  DONE_BUTTON = "~Done",
}

/**
 * Provides methods for interacting with the Contacts page in the application.
 * This class requires a WebDriver instance to drive the interactions.
 */
export class ContactsPage {
  private driver: WebdriverIO.Browser;

  /**
   * Represents the Contacts page and provides methods for interacting with it.
   * 
   * @class ContactsPage
   * @param {WebdriverIO.Browser} driver - The WebDriver instance used to interact with the Contacts page.
   */
  constructor(driver: WebdriverIO.Browser) {
    this.driver = driver;
  }

  /**
   * Inputs text into a specified field on the Contacts page.
   * 
   * @param {string} fieldName - The accessibility ID or name of the field where the text will be entered.
   * @param {string} text - The text to input into the specified field.
   * @throws {Error} Throws an error if the WebDriver instance is not initialized.
   * @returns {Promise<void>} Resolves when the text is successfully entered.
   */
  async enterText(fieldName: string, text: string) {
    if (!this.driver) {
      throw new Error('Driver is not initialized');
    }
    consoleLogYellow(`${fieldName}...`);
    await this.driver.$(`~${fieldName}`).setValue(text);
    consoleLogYellow("added successfully!");
  }

  /**
   * Adds a phone number to a contact on the Contacts page.
   * 
   * @param {string} phoneNumber - The phone number to be added.
   * @throws {Error} Throws an error if the WebDriver instance is not initialized.
   * @returns {Promise<void>} Resolves when the phone number is successfully added.
   */
  async addPhoneNumber(phoneNumber: string) {
    consoleLogYellow('Phone number...');
    if (!this.driver) {
      throw new Error('Driver is not initialized');
    }
    await this.driver.$(ElementIdentifiers.PHONE).click();
    await this.driver.$("-ios class chain:**/XCUIElementTypeStaticText[`name == \"mobile\"`]").click();
    await this.driver.$("-ios class chain:**/XCUIElementTypeCell[`name == \"iPhone\"`]").click();
    await this.driver.$("-ios class chain:**/XCUIElementTypeTextField[`name == \"iPhone\"`]").setValue(phoneNumber);
    consoleLogYellow('added successfully!');
  }

  /**
   * Adds an email address to a contact on the Contacts page.
   * 
   * @param {string} email - The email address to be added.
   * @throws {Error} Throws an error if the WebDriver instance is not initialized.
   * @returns {Promise<void>} Resolves when the email address is successfully added.
   */
  async addEmail(email: string) {
    consoleLogYellow('Email...');
    if (!this.driver) {
      throw new Error('Driver is not initialized');
    }
    await this.driver.$(ElementIdentifiers.EMAIL).click();
    await this.driver.$(`-ios class chain:**/XCUIElementTypeTextField[\`name == "home"\`]`).setValue(email);
    consoleLogYellow('added successfully!');
  }

  /**
   * Adds a social profile to a contact on the Contacts page.
   * 
   * @param {string} socialProfile - The social profile URL or identifier to be added.
   * @throws {Error} Throws an error if the WebDriver instance is not initialized.
   * @returns {Promise<void>} Resolves when the social profile is successfully added.
   */
  async addSocialProfile(socialProfile: string) {
    consoleLogYellow('Social profile...');
    if (!this.driver) {
      throw new Error('Driver is not initialized');
    }
    await this.driver.$(`-ios predicate string:name == 'add social profile'`).click();
    await this.driver.$(`-ios class chain:**/XCUIElementTypeStaticText[\`name == "Twitter"\`]`).click();
    await this.driver.$(`-ios class chain:**/XCUIElementTypeStaticText[\`name == "LinkedIn"\`]`).click();
    await this.driver.$(`-ios class chain:**/XCUIElementTypeTextField[\`name == "LinkedIn"\`]`).setValue(socialProfile);
    consoleLogYellow('added successfully!');
  }

  /**
   * Adds a new contact to the iOS Contacts application.
   *
   * Fills in the contact's details (name, phone, email, etc.) and saves the contact.
   *
   * @param firstName - The first name of the contact.
   * @param surname - The last name (surname) of the contact.
   * @param company - The company name associated with the contact.
   * @param phone - The contact's phone number.
   * @param email - The contact's email address.
   * @param socialProfile - The contact's LinkedIn or other social profile link.
   * @returns {Promise<void>} Resolves when the contact is successfully added.
   */
  public async addNewContact(firstName: string, lastName: string, company: string, phoneNumber: string, email: string, socialProfile: string) {
    consoleLogYellow('Opening Contacts app');
    if (!this.driver) {
      throw new Error('Driver is not initialized');
    }
    try {
      consoleLogYellow('Adding a new contact...');
      await this.driver.$(ElementIdentifiers.ADD_BUTTON).click(); //Add new contact
      await this.enterText(ElementIdentifiers.FIRST_NAME, firstName);
      await this.enterText(ElementIdentifiers.LAST_NAME, lastName);
      await this.enterText(ElementIdentifiers.COMPANY, company);
      await this.addPhoneNumber(phoneNumber);
      await this.addEmail(email);
      await this.addSocialProfile(socialProfile);
      await this.driver.$(ElementIdentifiers.DONE_BUTTON).click(); // Save the contact
      consoleLogYellow('Done. Contact was added');
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  }

  // async verifyContactExists(contactName: string): Promise<boolean> {
  //   // Implementation code
  // }
}