/**
 * A collection of test data for contacts, including both valid and invalid entries.
 *
 * @type {Object}
 * @property {Object} contacts - The main category for contact data.
 * @property {Object} contacts.default - A valid contact entry.
 * @property {Object} contacts.invalid - An invalid or malformed contact entry.
 */
export const TestData = {
  contacts: {
    default: {
      firstName: "John",
      lastName: "Doe",
      company: "Acme Corp",
      phone: "0525381648",
      email: "john.doe@example.com",
      socialProfile: "simu-liu-47946a2b1",
    },
    invalid: {
      firstName: "",
      lastName: "",
      company: "Test Corp",
      phone: "abc",
      email: "invalid-email",
      socialProfile: "",
    },
  },
};
