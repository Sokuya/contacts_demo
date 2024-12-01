// contacts.test.ts
import { App } from './app';
import { ContactsPage } from './pages/ContactsPage';
import { LinkedInPage } from './pages/LinkedInPage';
import { TestData } from './config/TestData';
import { devices } from './config/DeviceConfig'; // Import device matrix
import { WaitHelper } from './utils/WaitHelper';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env into process.env
// Ensure variables are loaded
if (!process.env.LINKEDIN_USERNAME || !process.env.LINKEDIN_PASSWORD) {
  throw new Error("LinkedIn credentials are missing in environment variables. They must be set.");
}
// LinkedIn login info, environment variables
const credentials = {
  username: process.env.LINKEDIN_USERNAME,
  password: process.env.LINKEDIN_PASSWORD
};

/*
 * Select the device configuration
 * Can runs tests dynamically on a specified device configuration using the DEVICE environment variable.
 * Example usage command:
 * DEVICE=iPhone15 npm test
 * Default device is 'iPhoneSE'. Change the value in the DEVICE variable to test other devices.
 */
const selectedDevice = process.env.DEVICE || 'iPhoneSE'; // selectedDevice default to iPhoneSE
if (process.env.DEVICE){
  console.log("Selected DEVICE from environment:", process.env.DEVICE);
}
const deviceConfig = devices[selectedDevice as keyof typeof devices];
if (!deviceConfig) {
  throw new Error(`Device configuration for "${selectedDevice}" not found.`);
}

const capabilities = {
  platformName: 'iOS',
  'appium:platformVersion': deviceConfig.platformVersion,
  'appium:deviceName': deviceConfig.deviceName,
  'appium:automationName': 'XCUITest',
  'appium:app': 'com.apple.MobileAddressBook', // Bundle ID for Contacts app
  'appium:wdaLocalPort': 8100,
};

describe('Create iOS Appium connection', function () {
  this.timeout(360000);  // Set timeout for test to 360 seconds 
  let app: App;
  let contactsPage: ContactsPage;
  let linkedInPage: LinkedInPage;

  /**
   * Sets up the environment for each test by initializing the app and page objects.
   * Ensures that the driver is initialized and environment is ready for the tests.
   * Throws an error if the driver is not initialized.
   */
  beforeEach(async () => {
    app = new App();

    // Clear any existing session if present
    if (app.getDriver()) {
      console.log("An existing session was found. Quitting the session...");
      await app.quit();
    }
    // Reinitialize with the correct capabilities
    console.log("Initializing new session with capabilities...");
    await app.init(capabilities);

    // Pass the driver to page classes
    const driver = app.getDriver();
    if (driver) {
      contactsPage = new ContactsPage(driver);
      linkedInPage = new LinkedInPage(driver);
    } else {
      throw new Error("Driver is not initialized.");
    }
  });

  /**
   * Test case for adding a new contact to the Contacts app and opening its LinkedIn profile.
   * Signs in to LinkedIn using the provided credentials.
   */
  it('Test for adding new contact and opening its LinkedIn profile and singing-in', async () => {
    const { firstName, lastName, company, phone, email, socialProfile } = TestData.contacts.default;
    await contactsPage.addNewContact(firstName, lastName, company, phone, email, socialProfile);
    console.log(`Using LinkedIn username: ${credentials.username}`)
    await linkedInPage.showLinkedIn(credentials.username, credentials.password, socialProfile);
  })
  it('Test should create new contact and take a screenshot at the end', async () => {
    const { firstName, lastName, company, phone, email, socialProfile } = TestData.contacts.default;
    await contactsPage.addNewContact(firstName, lastName, company, phone, email, socialProfile);
    await WaitHelper.delay(1000); // Wait for 1 second before taking a screenshot to allow the animations to finish.
    await app.takeScreenshot();
  });

  /**
   * Cleans up after each test by taking a screenshot if the test fails and quitting the app.
   * Ensures that the application state is reset after each test run.
   */
  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await app.takeScreenshot(`failed_${this.currentTest.title}_${timestamp}`);
    }
    await app.quit();
  });

});