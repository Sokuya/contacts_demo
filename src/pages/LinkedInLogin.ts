import { ElementIdentifiers, URLs } from "./LinkedInPage";

//Style 'console.log' command to highlight in Debug Console
const consoleLogYellow = (message: string) => {
  const yellow = "\x1b[33m"; // Yellow text
  const reset = "\x1b[0m"; // Reset all styles
  console.log(`${yellow}${message}${reset}`);
};

// Decleration of global variables that are been used across multiple methods of the class
let signInButton: WebdriverIO.Element | null = null;
let isDefaultLogin: boolean;

/**
 * Handles LinkedIn login-related operations such as navigating to the login page,
 * filling in credentials, and managing related prompts.
 */
export class LinkedInLogin {
  private driver: WebdriverIO.Browser;

  constructor(driver: WebdriverIO.Browser) {
    this.driver = driver;
  }

  /**
   * Logs into LinkedIn by navigating to the login page, entering credentials,
   * and handling additional prompts.
   * @param {string} username - LinkedIn username (email or phone number).
   * @param {string} password - LinkedIn account password.
   * @throws {Error} If the WebDriver is not initialized or an error occurs during the login process.
   */
  async login(username: string, password: string) {
    if (!this.driver) {
      throw new Error("Driver is not initialized");
    }
    try {
      await this.navigateToLoginPage();
      await this.handleWelcomeBack(username);
      await this.enterPassword(password);
      await this.handleSavePasswordPrompt();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error during login:", error.message);
      } else {
        console.error("Unknown error during login:", error);
      }
    }
  }

  /**
   * Navigates to the LinkedIn login page by interacting with browser elements.
   * @returns {Promise<void>} Resolves once navigation is complete.
   */
  async navigateToLoginPage() {
    consoleLogYellow("Navigating to LinkedIn login page...");
    await this.driver.$(ElementIdentifiers.TAB_BAR_TITLE).click();
    await this.driver
      .$(ElementIdentifiers.URL_ADDRESS)
      .setValue(URLs.LINKEDIN_LOGIN);
    await this.driver.$(ElementIdentifiers.GO_BUTTON).click();
  }

  /**
   * Handles the "Welcome Back" screen or the default login screen. Fills in the username
   * if the "Welcome Back" screen is not detected (because otherwise it already pre-filled)
   * @param {string} username - The LinkedIn username to input.
   * @returns {Promise<void>} Resolves once the screen has been processed.
   */
  async handleWelcomeBack(username: string) {
    isDefaultLogin = false;

    try {
      const welcomeBackElements: WebdriverIO.Element[] = Array.from(await this.driver.$$(ElementIdentifiers.WELCOME_BACK));
      if (welcomeBackElements.length == 0) {
        //"'Welcome back' screen not present.
        consoleLogYellow("Filling in username...");

        const linkedInUserName = await this.driver.$(
          ElementIdentifiers.USERNAME,
        );
        await linkedInUserName.click();
        await linkedInUserName.setValue(username);
        //in default login screen the element for Sign in button is diffrent, and keyboard may blocking it
        isDefaultLogin = true;
        signInButton = await this.driver.$(
          '-ios class chain:**/XCUIElementTypeButton[`name == "Sign in"`]',
        ) as unknown as WebdriverIO.Element | null;
      } else {
        consoleLogYellow(
          "'Welcome back' screen detected. Skipping enterting username.",
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error handling 'Welcome back' screen:", error.message);
      } else {
        console.error("Unknown error handling 'Welcome back' screen:", error);
      }
    }
  }

  /**
   * Enters the password into the designated input field and submits the login form.
   * @param {string} password - password to input.
   * @returns {Promise<void>} Resolves once the form has been submitted.
   */
  async enterPassword(password: string) {
    //Step 3: Fill in the password and submit
    consoleLogYellow("Filling in password...");
    const passwordField = await this.driver.$(ElementIdentifiers.PASSWORD);
    await passwordField.click();
    await passwordField.setValue(password);
    //closing keyboard to reveal covered Sign in button
    await (await this.driver.$(ElementIdentifiers.VERTICAL_SCROLL)).click();
    //Ensure signInButton is reassigned
    if (!isDefaultLogin) {
      consoleLogYellow(
        "Sign-in button not found earlier. Using normal selector.",
      );
      signInButton = await this.driver.$(
        ElementIdentifiers.NORMAL_SIGN_IN_BUTTON,
      )  as unknown as WebdriverIO.Element | null;
    }
    if (signInButton) {
      await signInButton.click();
      consoleLogYellow("Login submitted.");
    } else {
      console.error("Sign-in button not found.");
      return;
    }
  }

  /**
   * Handles "Save Password" prompt that may appear after login.
   * Skips saving the password if the prompt is displayed.
   * @returns {Promise<void>} Resolves once the prompt is handled.
   */
  async handleSavePasswordPrompt() {
    //Step 4: Handle "Save password" prompt
    const savePasswordPrompt: WebdriverIO.Element[] = await this.driver.$$(
      '//XCUIElementTypeOther[@name="Would you like to save this password to use with apps and websites?"]/XCUIElementTypeOther',
    ) as unknown as WebdriverIO.Element[];
    if (savePasswordPrompt.length > 0) {
      await this.driver.$(ElementIdentifiers.NOT_NOW_BUTTON).click(); //notNowButton
      consoleLogYellow("Skipped saving password.");
    }
  }
}
