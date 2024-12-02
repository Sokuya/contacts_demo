/**
 * Represents the details of a contact, including first name, surname, company, phone, email and social profile.
 */
export interface ContactDetails {
    /** The first name of the contact */
    firstName: string;
    /** The surname of the contact */
    surname: string;
    /** The company the contact is associated with */
    company: string;
    /** The phone number of the contact */
    phone: string;
    /** The email address of the contact */
    email: string;
    /** The social profile of the contact */
    socialProfile: string;
  }

// /**
//  * Represents an error related to Appium, with potential properties for name, message, and stack trace.
//  */
// interface AppiumError {
//     /** The name of the error */
//     name: string;
//     /** A description of the error */
//     message: string;
//     /** The stack trace of the error (optional) */
//     stack?: string;
// }