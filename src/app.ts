//Style 'console.log' command to highlight in Debug Console
const consoleLogYellow = (message: string) => {
  const yellow = '\x1b[33m'; // Yellow text
  const reset = '\x1b[0m'; // Reset all styles
  console.log(`${yellow}${message}${reset}`);
};

import { remote } from 'webdriverio';
import { Capabilities } from '@wdio/types'
import { Logger } from './utils/Logger';
import { WaitHelper } from './utils/WaitHelper';
import fs from 'fs';

let appiumPort = 4723;
const envAppiumPort = process.env.APPIUM_PORT;
if (envAppiumPort != null) {
  appiumPort = parseInt(envAppiumPort, 10);
}
const appiumOptions: Capabilities.WebdriverIOConfig  = {
  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port: appiumPort,
  logLevel: 'info',
  capabilities: {},
};

/**
 * Represents the main application class for handling WebDriver sessions and interactions.
 */
class App {
  private driver: WebdriverIO.Browser | undefined;;

  /**
   * Retrieves the current WebDriver instance.
   * @returns {WebdriverIO.Browser | undefined} The WebDriver instance or undefined if not initialized.
   */
  public getDriver() {
    return this.driver;
  }

  /**
   * Initializes the WebDriver session with the specified capabilities.
   * This method sets up the Appium session based on the provided capabilities and assigns the WebDriver instance.
   * 
   * @param {any} capabilities - The capabilities to use for the Appium session: device name, platform version, etc.
   * @returns {Promise<void>} A promise that resolves when the driver is successfully initialized.
   */
  async init(capabilities: any) {
    appiumOptions.capabilities = capabilities;
    this.driver = await remote(appiumOptions);
  }

  /**
  * Cleans up after the test by quitting the current WebDriver session and closing the driver.
  * This method ensures the session is properly terminated, releasing any resources associated with it.
  * 
  * @returns {Promise<void>} A promise that resolves when the WebDriver session is closed.
  */
  async quit() {
    // Quit the session and close the driver
    if (this.driver == null) {
      return;
    }
    await this.driver.pause(1000); // Give the user time to observe the final the test results before quitting.
    await this.driver.deleteSession();
  }

/**
 * Takes a screenshot, saves it, and returns the base64-encoded image data.
 * This method captures the current state of the app and saves the screenshot as a file within the './screenshots' directory.
 * 
 * @param {string} [fileName] - The name of the screenshot file (without the extension) to be saved. If `fileName` is not provided, the screenshot will be saved with a timestamp.
 * @returns {Promise<string>} A promise that resolves with the base64-encoded screenshot data, or an empty string if the capture fails.
 * @throws {Error} Throws an error if the screenshot cannot be captured or saved.
 */
  async takeScreenshot(fileName?: string): Promise<string> {
    if (this.driver == null) {
      return '';
    }
    try {
      let filePath;
      const screenshot = await this.driver.takeScreenshot();
      if (fileName == null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        filePath = `./screenshots/screenshot_${timestamp}.png`;
      }
      else {
        filePath = `./screenshots/${fileName}.png`;
      }
      // Ensure the directory exists
      fs.mkdirSync('./screenshots', { recursive: true });

      // Save the screenshot
      fs.writeFileSync(filePath, screenshot, 'base64');
      console.log(`Screenshot saved: ${filePath}`);
      // Return the base64-encoded screenshot data
      return screenshot;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error taking screenshot:", error.message);
        return '';
      } else {
        console.error("Error taking screenshot:", error);
        return '';
      }
    }
  }
}
export { App }