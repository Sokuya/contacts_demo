import { App } from './app';

const FIRSTNAME: string = "John";
const SURNAME: string = "Doe";
const COMPANY: string = "MyCompany";
const PHONE: string = "0525381648";
const EMAIL: string = "john@mycompany.com";
const SOCIALPROFILE: string = "simu-liu-47946a2b1";

//LinkedIn login info
const USERNAME: string = "assf.tst57120@gmail.com";
const PASSWORD: string = "linkedin4test";

const capabilities = {
  platformName: 'iOS',
  'appium:platformVersion': '17.2',
  'appium:deviceName': 'iPhone SE (3rd generation)',
  'appium:automationName': 'XCUITest',
  'appium:app': 'com.apple.MobileAddressBook', // Bundle ID for Contacts app
  'appium:wdaLocalPort': 8100,
};

describe('Create iOS Appium connection', function () {
  this.timeout(360000);  // Set timeout for test to 360 seconds 
  let app: App;

  //ensures that the environment is ready for the tests.
  beforeEach(async () => {
    app = new App();
    await app.init(capabilities);
  });

  it('Test for adding new contact and opening its LinkedIn profile and singing-in', async() => {
    await app.addNewContact(FIRSTNAME, SURNAME, COMPANY, PHONE, EMAIL, SOCIALPROFILE);
		await app.showLinkedIn(USERNAME, PASSWORD, SOCIALPROFILE);
  })

  // after(async () => {
  //   await new Promise(resolve => setTimeout(resolve,5000)); //time to get a look at the results of the test
  //   await app.quit();
  // });
});

