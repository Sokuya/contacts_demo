//Style 'console.log' command to highlight in Debug Console
const consoleLogYellow = (message: string) => {
  const yellow = '\x1b[33m'; // Yellow text
  const reset = '\x1b[0m'; // Reset all styles
  console.log(`${yellow}${message}${reset}`);
};

import { remote, RemoteOptions } from 'webdriverio';
let appiumPort = 4723;
const envAppiumPort = process.env.APPIUM_PORT;
if (envAppiumPort != null) {
  appiumPort = parseInt(envAppiumPort, 10);
}
const appiumOptions: RemoteOptions = {
  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port: appiumPort,
  logLevel: 'info',
  capabilities: {},
};

class App {
  private driver: WebdriverIO.Browser | undefined;

  public getDriver(){
    return this.driver;
  }
  async init(capabilities: any) {
    appiumOptions.capabilities = capabilities;
    this.driver = await remote(appiumOptions);
  }
  async quit() {
    // Quit the session and close the driver
    if (this.driver == null) {
      return;
    }
    await this.driver.pause(1000);
    await this.driver.deleteSession();
  }
  async enterText(fieldName: string, text: string)  {
      if (!this.driver) {
          throw new Error('Driver is not initialized');
      }
      consoleLogYellow(`${fieldName}...`);
      await this.driver.$(`~${fieldName}`).setValue(text);
      consoleLogYellow("added successfully!");
  }
  async addPhoneNumber(phoneNumber: string) {
    consoleLogYellow('Phone number...');
    if (!this.driver) {
        throw new Error('Driver is not initialized');
    }
    await this.driver.$('~Insert add phone').click();
    await this.driver.$("-ios class chain:**/XCUIElementTypeStaticText[`name == \"mobile\"`]").click();
    await this.driver.$("-ios class chain:**/XCUIElementTypeCell[`name == \"iPhone\"`]").click();
    await this.driver.$("-ios class chain:**/XCUIElementTypeTextField[`name == \"iPhone\"`]").setValue(phoneNumber);
    //await this.driver.$(`-ios class chain:**/XCUIElementTypeStaticText[\`name == "mobile"\`]`).click();
    //await this.driver.$(`-ios class chain:**/XCUIElementTypeStaticText[\`name == "iPhone"\`]`).click();
    //await this.driver.$(`-ios class chain:**/XCUIElementTypeTextField[\`name == "iPhone"\`]`).setValue(phoneNumber);
    consoleLogYellow('added successfully!');
  }
  async addEmail(email: string) {
    consoleLogYellow('Email...');
    if (!this.driver) {
        throw new Error('Driver is not initialized');
    }
    await this.driver.$('~Insert add email').click();
    await this.driver.$(`-ios class chain:**/XCUIElementTypeTextField[\`name == "home"\`]`).setValue(email);
    consoleLogYellow('added successfully!');
  }
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
  public async addNewContact(firstName: string, lastName: string, company: string, phoneNumber: string, email: string, socialProfile: string) {
    consoleLogYellow('Opening Contacts app');
    if (!this.driver) {
        throw new Error('Driver is not initialized');
    }
    try {
        consoleLogYellow('Adding a new contact...');
        await this.driver.$("~Add").click(); //Add new contact
        await this.enterText("First name", firstName);
        await this.enterText("Last name", lastName);
        await this.enterText("Company", company);
        await this.addPhoneNumber(phoneNumber);
        await this.addEmail(email);
        await this.addSocialProfile(socialProfile);
        await this.driver.$("~Done").click(); // Save the contact
        consoleLogYellow('Done. Contact was added');
    } catch (error) {
        console.error('Failed to add contact:', error);
    }
  }
  async openContactLinkedIn() {
    if (!this.driver) {
      throw new Error('Driver is not initialized');
    }
    try {
        // Start a loop to scroll until the "LinkedIn" element is found and visable
        let found = false;
        let linkedInElements: WebdriverIO.Element[];
        while (!found) {
            linkedInElements = await this.driver.$$("-ios class chain:**/XCUIElementTypeCell[`name == \"LinkedIn\"`]");
            if (linkedInElements.length > 0) {
                // If the element is found (length at least 1), click it and break the loop
                await linkedInElements[0].click();
                found = true;
                consoleLogYellow("Contact LinkedIn element found and clicked.");
            } else {
                consoleLogYellow("Contact LinkedIn element not found, scrolling down.");
                await this.driver.execute('mobile: swipe', { direction: 'up', percent: 0.3 });
            }
        }
    } catch (e: any) {
        console.error("Failed to load contact LinkedIn: " + e);
    }
  }
  async closeKeychain() {
    if (!this.driver) {
      throw new Error('Driver is not initialized');
    }
    try {
      // Checking if the keyboard is hiding the URL bar (happens if password is saved in keychain)
      let keyboardButton: WebdriverIO.Element[] = await this.driver.$$('~Keyboard');
      if (keyboardButton.length > 0) {
        const isDisplayed = await keyboardButton[0].isDisplayed();
        if (isDisplayed) {
          await keyboardButton[0].click();
          consoleLogYellow("Element 'Keyboard' found and clicked.");
          await this.driver.$('~TabBarItemTitle').click();
        }
      }
    } catch (e: any) {
      if (e.name == 'NoSuchElementError') {
        console.log("Element 'Keyboard' not found. Continuing test..."); // Log if element is not found
      } else {
        throw e; // Rethrow other unexpected errors
      }
    }
  }
  async closedPopUps() {
    if (!this.driver) {
      throw new Error('Driver is not initialized');
    }
    try {
      // Wait for a few seconds to allow pop-ups to appear
      await new Promise(resolve => setTimeout(resolve, 3000));
      consoleLogYellow("waiting 3 seconds...");

      //Locate popups using accessibility ID "Dismiss"
      let popups: WebdriverIO.Element[] = await this.driver.$$('~Dismiss');
      if (popups.length > 0) {
        consoleLogYellow("Closing popups...");
        const dismissButton = await this.driver.$('~Dismiss'); // Click first visible "Dismiss" button
        if (await dismissButton.isDisplayed()) {
          await dismissButton.click();
        }
      }
    } catch (e: any) {
      console.log("Error in closedPopUps():", e.message);
    }
  }
  async getURL(): Promise<string> {
    if (!this.driver) {
      throw new Error('Driver is not initialized');
  }
    await this.closedPopUps(); // Ensure all pop-ups are closed before proceeding
    await this.driver.$('~TabBarItemTitle').click(); // Navigate to the URL field
    const currentUrl = await this.driver.$('~URL').getAttribute("value"); // Get the current URL
    
    //Deal with the Spotlight search pop-up occurring on first use
    try {
      let continueButton: WebdriverIO.Element[]  = await this.driver.$$(`-ios class chain:**/XCUIElementTypeStaticText[\`name == "Continue"\`]`);
      if (continueButton.length > 0 && (await continueButton[0].isDisplayed())) {
        await continueButton[0].click();
        consoleLogYellow("Closing Spotlight Search information menu, Continue button was found and clicked.");
      }
    } catch (e: any) {
      if (e.name == 'NoSuchElementError') {
        console.log("No Spotlight Search popup. Continuing test...");
      } else {
        throw e; // Rethrow unexpected errors
      }
    }
    await this.driver.$('~CancelBarItemButton').click(); // Close the URL bar
    consoleLogYellow(`Current URL: ${currentUrl}`);
    return currentUrl;
  }
  async returnToContactsApp() {
    if (!this.driver) {
      throw new Error('Driver is not initialized');
    }
    try {
      console.log("Returning to the Contacts app...");
      await this.driver.execute('mobile: activateApp', { bundleId: 'com.apple.MobileAddressBook' });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for the app to load
      consoleLogYellow("waiting 2 seconds...");
    } catch (e: any) {
      console.error("Error in returnToContactsApp():", e.message);
    }
  }
  async loginToLinkedIn(username: string, password: string) {
  if (!this.driver) {
    throw new Error('Driver is not initialized');
  }
  try {
    let signInButton: WebdriverIO.Element | null = null;
    let passwordField: WebdriverIO.Element;

    //Step 1: Navigate to LinkedIn login page
    consoleLogYellow("Navigating to LinkedIn login page...");
    await this.driver.$('~TabBarItemTitle').click();
    await this.driver.$('~URL').setValue("https://www.linkedin.com/login");
    await this.driver.$('~Go').click();

    //Step 2: Fill in username and dealing with 'Welcome back' screen vs default login
    //because 'Welcome back' screen has the username already pre-filled
    let isDefaultLogin = false;
    try {
      let welcomeBackElements: WebdriverIO.Element[] = await this.driver.$$('~Welcome back');
      if (welcomeBackElements.length == 0) {
        //"'Welcome back' screen not present.
        consoleLogYellow("Filling in username...");
        
        const linkedInUserName = await this.driver.$('~Email or phone');
        await linkedInUserName.click();
        await linkedInUserName.setValue(username);
        //in default login screen the element for Sign in button is diffrent, and keyboard may blocking it
        isDefaultLogin = true;
        signInButton = await this.driver.$("-ios class chain:**/XCUIElementTypeButton[`name == \"Sign in\"`]");
      } else {
        consoleLogYellow("'Welcome back' screen detected. Skipping enterting username.");
      }
    } catch (error: any) {
      console.error("Error handling 'Welcome back' screen:", error.message);
    }

    //Step 3: Fill in the password and submit
    consoleLogYellow("Filling in password...");
    passwordField = await this.driver.$('~Password');
    await passwordField.click();
    await passwordField.setValue(password);
    //closing keyboard to reveal covered Sign in button
    await (await this.driver.$("accessibility id:Vertical scroll bar, 2 pages")).click();
    //Ensure signInButton is reassigned
    if (!isDefaultLogin) { 
      consoleLogYellow("Sign-in button not found earlier. Using normal selector.");
      signInButton = await this.driver.$('~Sign in');
    }
    if (signInButton) {
      await signInButton.click();
      consoleLogYellow("Login submitted.");
    } else {
      console.error("Sign-in button not found.");
      return;
    }

    //Step 4: Handle "Save password" prompt
    let savePasswordPrompt: WebdriverIO.Element[] = await this.driver.$$(
      '//XCUIElementTypeOther[@name="Would you like to save this password to use with apps and websites?"]/XCUIElementTypeOther'
    );
    if (savePasswordPrompt.length > 0) {
      const notNowButton = await this.driver.$('~Not Now').click();
      consoleLogYellow("Skipped saving password.");
    }

    //Step 5: Verify login success
    consoleLogYellow("Verifying login...");
    const currentUrl = await this.getURL();
    //Check if the current URL matches the LinkedIn main feed URL
    if (currentUrl.startsWith("https://www.linkedin.com/feed")) {
      consoleLogYellow("Login successful! Now on the LinkedIn main feed.");
    } else {
      consoleLogYellow("Login failed. Not logged in...");
    }
  } catch (error: any) {
    console.error("Error during loginToLinkedIn():", error.message);
  }
  }
  public async showLinkedIn(username: string, password: string, SOCIALPROFILE: string): Promise<void> {
    if (!this.driver) {
      throw new Error('Driver is not initialized');
    }
    try {
      //Load LinkedIn from the contact app
      await this.openContactLinkedIn();
      await new Promise((resolve) => setTimeout(resolve, 4500)); // wait a few second to let it load
      // Check if the "Sign in" element is present
      consoleLogYellow("Checking LinkedIn login status...");
      await this.closeKeychain(); //handles cases with saved passwords in keychain

      // Check if the current URL matches the LinkedIn auth wall URL
      const currentUrl = await this.getURL();
      if (currentUrl.startsWith("https://www.linkedin.com/authwall")) {
        consoleLogYellow("Not logged in, on sign-in page. Signing in...");
        //Proceed to login
        await this.loginToLinkedIn(username, password);
        //Return to the Contacts app and click the LinkedIn profile again
        await this.returnToContactsApp();
        await this.openContactLinkedIn();
      } else if (currentUrl.includes(SOCIALPROFILE)) {
        //URL is already showing the social profile of contact
        await this.closedPopUps(); //make sure popups are closed
        try {
          //make sure that we are logged in
          let signInButton: WebdriverIO.Element[] = await this.driver.$$(
            `-ios class chain:**/XCUIElementTypeLink[\`name == "Sign in"\`]`
          );
          //checking for sign-in button
          if (signInButton.length > 0) {
            consoleLogYellow(`Showing contact LinkedIn profile, but not logged in. Current URL: ${currentUrl}`);
            await this.loginToLinkedIn(username, password);
            await this.returnToContactsApp();
            await this.openContactLinkedIn();
          } else {
            consoleLogYellow(`Logged in and showing contact LinkedIn profile. Current URL: ${currentUrl}`);
          }
        } catch (error: any) {
          console.error(`Error in showLinkedIn() when URL is already contact social profile ${error.message}`);
        }
      } else {
        console.log(`Not logged in. Current URL: ${currentUrl}`);
      }

    } catch (error: any) {
      console.error(`Error in showLinkedIn(): ${error.message}`);
    }
  }
}
export { App };
