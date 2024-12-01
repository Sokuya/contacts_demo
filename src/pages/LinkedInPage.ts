import { WaitHelper } from '../utils/WaitHelper';

//Style 'console.log' command to highlight in Debug Console
const consoleLogYellow = (message: string) => {
    const yellow = '\x1b[33m'; // Yellow text
    const reset = '\x1b[0m'; // Reset all styles
    console.log(`${yellow}${message}${reset}`);
};

enum ElementIdentifiers { 
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

enum URLs {
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

    /**
     * Creates an instance of the LinkedInPage class.
     * @param driver - An instance of WebDriverIO.Browser used to interact with the browser.
     */
    constructor(driver: WebdriverIO.Browser) {
        this.driver = driver;
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

    /**
     * Closes the keychain keyboard if it is displayed, allowing access to the URL bar.
     * This is typically needed when a password is already saved to keychain, causing the keyboard to block the 'TabBarItemTitle' element on the page.
     * 
     * @throws {Error} If an unexpected error occurs that is not related to the element's existence.
     * @returns {Promise<void>}
     */
    async closeKeychain() {
        if (!this.driver) {
            throw new Error('Driver is not initialized');
        }
        try {
            // Checking if the keyboard is hiding the URL bar (happens if password is saved in keychain)
            let keyboardButton: WebdriverIO.Element[] = await this.driver.$$(ElementIdentifiers.KEYBOARD);
            if (keyboardButton.length > 0) {
                const isDisplayed = await keyboardButton[0].isDisplayed();
                if (isDisplayed) {
                    await keyboardButton[0].click();
                    consoleLogYellow("Element 'Keyboard' found and clicked.");
                    await this.driver.$(ElementIdentifiers.TAB_BAR_TITLE).click();
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

    /**
     * Closes displayed pop-ups that may appear when viewing a LinkedIn profile without logging in (for example "View Person's full profile").
     * This method waits for a few seconds to allow any pop-ups to appear and then attempts to find and click
     * the "Dismiss" button to ensure uninterrupted profile viewing.
     * 
     * @throws {Error} If the driver is not initialized.
     * @returns {Promise<void>} Resolves when the method completes its execution.
     */
    async closedPopUps() {
        if (!this.driver) {
            throw new Error('Driver is not initialized');
        }
        try {
            // Wait for a few seconds to allow pop-ups to appear
            await new Promise(resolve => setTimeout(resolve, 3000));
            consoleLogYellow("waiting 3 seconds...");

            //Locate popups using accessibility ID "Dismiss"
            let popups: WebdriverIO.Element[] = await this.driver.$$(ElementIdentifiers.DISMISS_BUTTON);
            if (popups.length > 0) {
                consoleLogYellow("Closing popups...");
                const dismissButton = await this.driver.$(ElementIdentifiers.DISMISS_BUTTON); // Click first visible "Dismiss" button
                if (await dismissButton.isDisplayed()) {
                    await dismissButton.click();
                }
            }
        } catch (e: any) {
            console.log("Error in closedPopUps():", e.message);
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
            throw new Error('Driver is not initialized');
        }
        await this.closedPopUps(); // Ensure all pop-ups are closed before proceeding
        await this.driver.$(ElementIdentifiers.TAB_BAR_TITLE).click(); // Navigate to the URL field
        const currentUrl = await this.driver.$(ElementIdentifiers.URL_ADDRESS).getAttribute("value"); // Get the current URL

        //Deal with the Spotlight search pop-up occurring on first use
        try {
            let continueButton: WebdriverIO.Element[] = await this.driver.$$(`-ios class chain:**/XCUIElementTypeStaticText[\`name == "Continue"\`]`);
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

    /**
     * Logs into a LinkedIn account using the provided credentials.
     *
     * This method automates the LinkedIn login process through the WebDriver.
     *
     * @param username - The email or username of the LinkedIn account.
     * @param password - The password for the LinkedIn account.
     * @throws {AuthenticationError} When login fails due to incorrect credentials or network issues.
     * @returns {Promise<void>} Resolves when login is successful.
     */
    async loginToLinkedIn(username: string, password: string) {
        if (!this.driver) {
            throw new Error('Driver is not initialized');
        }
        try {
            let signInButton: WebdriverIO.Element | null = null;
            let passwordField: WebdriverIO.Element;

            //Step 1: Navigate to LinkedIn login page
            consoleLogYellow("Navigating to LinkedIn login page...");
            await this.driver.$(ElementIdentifiers.TAB_BAR_TITLE).click();
            await this.driver.$(ElementIdentifiers.URL_ADDRESS).setValue(URLs.LINKEDIN_LOGIN);
            await this.driver.$(ElementIdentifiers.GO_BUTTON).click();

            //Step 2: Fill in username and dealing with 'Welcome back' screen vs default login
            //because 'Welcome back' screen has the username already pre-filled
            let isDefaultLogin = false;
            try {
                let welcomeBackElements: WebdriverIO.Element[] = await this.driver.$$(ElementIdentifiers.WELCOME_BACK);
                if (welcomeBackElements.length == 0) {
                    //"'Welcome back' screen not present.
                    consoleLogYellow("Filling in username...");

                    const linkedInUserName = await this.driver.$(ElementIdentifiers.USERNAME);
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
            passwordField = await this.driver.$(ElementIdentifiers.PASSWORD);
            await passwordField.click();
            await passwordField.setValue(password);
            //closing keyboard to reveal covered Sign in button
            await (await this.driver.$(ElementIdentifiers.VERTICAL_SCROLL)).click();
            //Ensure signInButton is reassigned
            if (!isDefaultLogin) {
                consoleLogYellow("Sign-in button not found earlier. Using normal selector.");
                signInButton = await this.driver.$(ElementIdentifiers.NORMAL_SIGN_IN_BUTTON);
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
                const notNowButton = await this.driver.$(ElementIdentifiers.NOT_NOW_BUTTON).click();
                consoleLogYellow("Skipped saving password.");
            }

            //Step 5: Verify login success
            consoleLogYellow("Verifying login...");
            const currentUrl = await this.getURL();
            //Check if the current URL matches the LinkedIn main feed URL
            if (currentUrl.startsWith(URLs.LINKEDIN_FEED)) {
                consoleLogYellow("Login successful! Now on the LinkedIn main feed.");
            } else {
                consoleLogYellow("Login failed. Not logged in...");
            }
        } catch (error: any) {
            console.error("Error during loginToLinkedIn():", error.message);
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
    public async showLinkedIn(username: string, password: string, socialProfile: string): Promise<void> {
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
            if (currentUrl.startsWith(URLs.LINKEDIN_AUTH)) {
                consoleLogYellow("Not logged in, on sign-in page. Signing in...");
                //Proceed to login
                await this.loginToLinkedIn(username, password);
                //Return to the Contacts app and click the LinkedIn profile again
                await this.returnToContactsApp();
                await this.openContactLinkedIn();
            } else if (currentUrl.includes(socialProfile)) {
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