export const Constants = {
  TIMEOUTS: {
    SHORT: 1000,
    MEDIUM: 3000,
    LONG: 10000
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000
  }
};

/**
 * A helper class for waiting operations in WebDriver tests.
 */
export class WaitHelper {
  /**
   * Waits until the specified element is visible within a given timeout.
   * 
   * @param {WebdriverIO.Element} element - The element to wait for visibility.
   * @param {number} [timeout=10000] - The maximum time to wait for the element to be visible, in milliseconds (default is 10,000ms).
   * @throws {Error} Throws an error if the element is not visible within the specified timeout.
   */
  static async untilElementVisible(element: WebdriverIO.Element, timeout = 10000) {
    await element.waitForDisplayed({
      timeout,
      timeoutMsg: `Element ${element.selector} not visible after ${timeout}ms`
    });
  }

/**
* Pauses the execution for a given number of milliseconds.
* 
* @param {number} ms - The number of milliseconds to wait. Default to 'Constants.TIMEOUTS.SHORT'
*/
  static async delay(ms: number = Constants.TIMEOUTS.SHORT) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}