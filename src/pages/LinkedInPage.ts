import { Constants, WaitHelper } from "../utils/WaitHelper";
import { LinkedInLogin } from "./LinkedInLogin";
//Style 'console.log' command to highlight in Debug Console
const consoleLogYellow = (message: string) => {
  const yellow = "\x1b[33m"; // Yellow text
  const reset = "\x1b[0m"; // Reset all styles
  console.log(`${yellow}${message}${reset}`);
};

export enum ElementIdentifiers {
  KEYBOARD = "~Keyboard",
  TAB_BAR_TITLE = "~TabBarItemTitle",
  DISMISS_BUTTON = "~Dismiss",
  URL_ADDRESS = "~URL",
  CANCEL_BUTTON = "~CancelBarItemButton",
  GO_BUTTON = "~Go",
  WELCOME_BACK = "~Welcome back",
  USERNAME = "~Email or phone",
  PASSWORD = "~Password",
  VERTICAL_SCROLL = "accessibility id:Vertical scroll bar, 2 pages",
  NORMAL_SIGN_IN_BUTTON = "~Sign in",
  NOT_NOW_BUTTON = "~Not Now",
}

export enum URLs {
  LINKEDIN_LOGIN = "https://www.linkedin.com/login",
  LINKEDIN_FEED = "https://www.linkedin.com/feed",
  LINKEDIN_AUTH = "https://www.linkedin.com/authwall",
}

/**
 * Represents the LinkedIn page and provides methods for interacting with elements on that page.
 * This class requires a WebDriver instance to drive the interactions.
 */
export class LinkedInPage {
  private driver: WebdriverIO.Browser;
  private linkedinLogin: LinkedInLogin;

  /**
   * Creates an instance of the LinkedInPage class.
   * @param driver - An instance of WebDriverIO.Browser used to interact with the browser.
   */
  constructor(driver: WebdriverIO.Browser) {
    this.driver = driver;
    this.linkedinLogin = new LinkedInLogin(this.driver);
  }

  /**
   * Opens a LinkedIn profile contact link by scrolling until the "LinkedIn" element is found and clicked.
   * This method assumes the current page is already the contact page. It searches for the "LinkedIn" element on
   * the page and clicks it when found. If the element is not initially visible, the method scrolls down the page
   * and continues searching until the element is found and clicked.
   *
   * @throws {Error} If the driver is not initialized or if an error occurs while trying to find or click the element.
   * @returns {Promise<void>} Resolves when the method completes its execution.
   */
  async openContactLinkedIn() {
    if (!this.driver) {
      throw new Error("Driver is not initialized");
    }
    try {
      // Start a loop to scroll until the "LinkedIn" element is found and visable
      let found = false;
      let linkedInElements: WebdriverIO.Element[];
      while (!found) {
        linkedInElements = (await this.driver.$$(
          '-ios class chain:**/XCUIElementTypeCell[`name == "LinkedIn"`]',
        ) as unknown) as WebdriverIO.Element[];
        //
        // linkedInElements = await this.driver.$$(
        //   '-ios class chain:**/XCUIElementTypeCell[`name == "LinkedIn"`]',
        // )
        //
        if (linkedInElements.length > 0) {
          // If the element is found (length at least 1), click it and break the loop
          await linkedInElements[0].click();
          found = true;
          consoleLogYellow("Contact LinkedIn element found and clicked.");
        } else {
          consoleLogYellow(
            "Contact LinkedIn element not found, scrolling down.",
          );
          await this.driver.execute("mobile: swipe", {
            direction: "up",
            percent: 0.3,
          });
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to load contact LinkedIn:", error.message);
      } else {
        console.error(
          "An unknown error occurred while loading contact LinkedIn:",
          error,
        );
      }
    }
  }

  /**
   * Closes the keychain keyboard if it is displayed, allowing access to the URL bar.
   * This is typically needed when a password is already saved to keychain, causing the keyboard to block the 'TabBarItemTitle' element on the page.
   *
   * @throws {Error} If an unexpected error occurs that is not related to the element's existence.
   * @returns {Promise<void>}
   */
  async closeKeychain() {
    if (!this.driver) {
      throw new Error("Driver is not initialized");
    }
    try {
      // Checking if the keyboard is hiding the URL bar (happens if password is saved in keychain)
      const keyboardButton: WebdriverIO.Element[] = await this.driver.$$(
        ElementIdentifiers.KEYBOARD,
      ) as unknown as WebdriverIO.Element[];
      if (keyboardButton.length > 0) {
        const isDisplayed = await keyboardButton[0].isDisplayed();
        if (isDisplayed) {
          await keyboardButton[0].click();
          consoleLogYellow("Element 'Keyboard' found and clicked.");
          await this.driver.$(ElementIdentifiers.TAB_BAR_TITLE).click();
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "NoSuchElementError") {
          console.log("Element 'Keyboard' not found. Continuing test..."); // Log if element is not found
        } else {
          throw e; // Rethrow other unexpected errors
        }
      } else {
        console.error("An unknown error occurred:", e);
      }
    }
  }

  /**
   * Closes displayed pop-ups that may appear when viewing a LinkedIn profile without logging in (for example "View Person's full profile").
   * This method waits for a few seconds to allow any pop-ups to appear and then attempts to find and click
   * the "Dismiss" button to ensure uninterrupted profile viewing.
   *
   * @throws {Error} If the driver is not initialized.
   * @returns {Promise<void>} Resolves when the method completes its execution.
   */
  async closePopUps() {
    if (!this.driver) {
      throw new Error("Driver is not initialized");
    }
    try {
      // Wait for a few seconds to allow pop-ups to appear
      const timeout = Constants.TIMEOUTS.MEDIUM;
      await WaitHelper.delay(timeout);
      consoleLogYellow(`waiting ${timeout / 1000} seconds...`);

      //Locate popups using accessibility ID "Dismiss"
      const popups: WebdriverIO.Element[] = await this.driver.$$(
        ElementIdentifiers.DISMISS_BUTTON,
      ) as unknown as WebdriverIO.Element[];
      if (popups.length > 0) {
        consoleLogYellow("Closing popups...");
        const dismissButton = await this.driver.$(
          ElementIdentifiers.DISMISS_BUTTON,
        ); // Click first visible "Dismiss" button
        if (await dismissButton.isDisplayed()) {
          await dismissButton.click();
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Error in closePopUps():", error.message);
      } else {
        console.error("An unknown error occurred in closePopUps():", error);
      }
    }
  }

  /**
   * Retrieves the current URL of Safari after ensuring any pop-ups are closed.
   * This method navigates to the URL field, captures the current URL, and handles pop-ups,
   * such as the Spotlight Search information menu that appears on first use.
   *
   * @throws {Error} If an unexpected error occurs during the process.
   * @returns {Promise<string>} The current URL of the page.
   */
  async getURL(): Promise<string> {
    if (!this.driver) {
      throw new Error("Driver is not initialized");
    }
    await this.closePopUps(); // Ensure all pop-ups are closed before proceeding
    await this.driver.$(ElementIdentifiers.TAB_BAR_TITLE).click(); // Navigate to the URL field
    const currentUrl = await this.driver
      .$(ElementIdentifiers.URL_ADDRESS)
      .getAttribute("value"); // Get the current URL

    //Deal with the Spotlight search pop-up occurring on first use
    try {
      const continueButton: WebdriverIO.Element[] = await this.driver.$$(
        `-ios class chain:**/XCUIElementTypeStaticText[\`name == "Continue"\`]`,
      ) as unknown as WebdriverIO.Element[];
      if (
        continueButton.length > 0 &&
        (await continueButton[0].isDisplayed())
      ) {
        await continueButton[0].click();
        consoleLogYellow(
          "Closing Spotlight Search information menu, Continue button was found and clicked.",
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "NoSuchElementError") {
          console.log("No Spotlight Search popup. Continuing test...");
        } else {
          throw error; // Rethrow unexpected errors
        }
      } else {
        console.error("An unknown error occurred in getURL():", error);
      }
    }
    await this.driver.$(ElementIdentifiers.CANCEL_BUTTON).click(); // Close the URL bar
    consoleLogYellow(`Current URL: ${currentUrl}`);
    return currentUrl;
  }

  /**
   * Returns to the Contacts app on the device.
   * This method activates the app using its bundle ID and waits for it to load.
   * @throws {Error} If the driver is not initialized or an unexpected error occurs.
   * @returns {Promise<void>} A promise that resolves when the app is activated and ready.
   */
  async returnToContactsApp() {
    if (!this.driver) {
      throw new Error("Driver is not initialized");
    }
    try {
      console.log("Returning to the Contacts app...");
      await this.driver.execute("mobile: activateApp", {
        bundleId: "com.apple.MobileAddressBook",
      });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for the app to load
      consoleLogYellow("waiting 2 seconds...");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error in returnToContactsApp():", error.message);
      } else {
        console.error(
          "An unknown error occurred in returnToContactsApp():",
          error,
        );
      }
    }
  }
  /**
   * Verifies the success of the login operation by checking the current URL.
   * Checks if the user has successfully navigated to the LinkedIn main feed.
   * @returns {Promise<void>} Resolves once the verification process is complete.
   */
  async verifyLogin() {
    consoleLogYellow("Verifying login...");
    const currentUrl = await this.getURL();
    //Check if the current URL matches the LinkedIn main feed URL
    if (currentUrl.startsWith(URLs.LINKEDIN_FEED)) {
      consoleLogYellow("Login successful! Now on the LinkedIn main feed.");
    } else {
      consoleLogYellow("Login failed. Not logged in...");
    }
  }

  /**
   * Navigates to and displays a LinkedIn profile from the Contacts app, logging in if necessary.
   * This method handles the navigation, checking if the user is already logged in, and logging in if needed.
   * It ensures that pop-ups are closed and that the driver navigates to the specified LinkedIn profile.
   * This method should be called from the contact profile of the contact.
   *
   * @param username - email or username of LinkedIn account for authentication.
   * @param password - password of LinkedIn account for authentication.
   * @param socialProfile - a substring representing the URL of the social profile to verify the login.
   * @throws {Error} If the WebDriver session is not initialized.
   * @throws {Error} If there is an issue with navigating or interacting with the LinkedIn page.
   * @returns {Promise<void>} Resolves when the navigation and login (if necessary) are completed.
   */
  public async showLinkedIn(
    username: string,
    password: string,
    socialProfile: string,
  ): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver is not initialized");
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
      if (currentUrl.startsWith(URLs.LINKEDIN_AUTH)) {
        consoleLogYellow("Not logged in, on sign-in page. Signing in...");
        //Proceed to login
        await this.linkedinLogin.login(username, password);
        //Return to the Contacts app and click the LinkedIn profile again
        await this.returnToContactsApp();
        await this.openContactLinkedIn();
      } else if (currentUrl.includes(socialProfile)) {
        //URL is already showing the social profile of contact
        await this.closePopUps(); //make sure popups are closed
        try {
          //make sure that we are logged in, if not 'Sign in' is presented
          const signInButton: WebdriverIO.Element[] = await this.driver.$$(
            `-ios class chain:**/XCUIElementTypeLink[\`name == "Sign in"\`]`,
          ) as unknown as WebdriverIO.Element[];
          //checking for sign-in button
          if (signInButton.length > 0) {
            //meaning not logged in
            consoleLogYellow(
              `Showing contact LinkedIn profile, but not logged in. Current URL: ${currentUrl}`,
            );
            await this.linkedinLogin.login(username, password);
            await this.verifyLogin();
            await this.returnToContactsApp();
            await this.openContactLinkedIn();
          } else {
            consoleLogYellow(
              `Logged in and showing contact LinkedIn profile. Current URL: ${currentUrl}`,
            );
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(
              `Error in showLinkedIn() when URL is already the contact social profile: ${error.message}`,
            );
          } else {
            console.error(
              "An unknown error occurred in showLinkedIn():",
              error,
            );
          }
        }
      } else {
        console.log(`Not logged in. Current URL: ${currentUrl}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error in showLinkedIn(): ${error.message}`);
      } else {
        console.error("An unknown error occurred in showLinkedIn():", error);
      }
    }
  }
}
