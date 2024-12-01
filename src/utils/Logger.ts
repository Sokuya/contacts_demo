const yellow = '\x1b[33m'; // Yellow text
const red = '\x1b[31m'; // Red text
const reset = '\x1b[0m'; // Reset all styles

/**
 * A class for logging messages to the console with color formatting.
 */
export class Logger {
    /**
     * Logs an informational message in yellow.
     * @param {string} message - The message to log.
     * @param {string} [context] - Optional method name or context for the log.
     */
    static info(message: string, context?: string) {
        console.log(`${yellow}[INFO][${context}] ${message}${reset}`);
    }
    /**
     * Logs an error message in red with an error object.
     * @param {string} message - The error message to log.
     * @param {Error} error - The error object to log.
     * @param {string} [context] - Optional method name or context for the log.
     */
    static error(message: string, error: Error, context?: string) {
        console.error(`${red}[ERROR][${context}] ${message}${reset}`, error);
    }
  };