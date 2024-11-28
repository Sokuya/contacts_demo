# contacts_demo
1. [Overview](#overview)
2. [Setup Steps](#setup-steps)
3. [Prerequisites](#prerequisites)
   - [Installing Node.js](#installing-nodejs)
     - [Option 1: Install from the Official Website](#option-1-install-from-the-official-website)
     - [Option 2: Install via Package Manager (Optional)](#option-2-install-via-package-manager-optional)
   - [Installing Appium](#installing-appium)
   - [Setting Up the iOS Simulator](#setting-up-the-ios-simulator)
     - [Configuring Test Capabilities](#configuring-test-capabilities)
4. [Run a TypeScript Test](#run-a-typescript-test)
5. [Test Case Description](#test-case-description)
   - [Troubleshooting](#troubleshooting)
   - [Handling Edge Cases in the Test](#handling-edge-cases-in-the-test)
   - [Test Chronology](#test-chronology)

## Overview
A demo project for testing iOS applications using Appium, WebDriverIO, and TypeScript.

## Setup Steps
1. Clone this repository `git clone https://github.com/Sokuya/contacts_demo.git` in destination folder
2. Run `npm install` to install project dependencies
3. Launch the Xcode Simulator
4. Run `appium` in the background
5. Run TypeScript test script using `npm test src/contacts.test.ts`

## Prerequisites
Ensure the following tools are installed and properly set up before running the tests:
- Node.js (includes npm)
- Appium (with the XCUITest driver for iOS)
- Xcode

### Installing Node.js
Before installing Appium, you need to have Node.js installed.
#### Option 1: Install from the Official Website
Visit the official Node.js website: [https://nodejs.org](https://nodejs.org).
Download the **LTS** version (Long Term Support), which is the most stable version for most users.
#### Option 2: Install via Package Manager (Optional)
Alternatively, you can [install Node.js using a package manager](https://nodejs.org/en/download/package-manager) based on your operating system:
#### For example on macOS install Node.js using Homebrew:
```bash
brew install node
```
Install Homebrew if you haven't already by following the instructions on [https://brew.sh](https://brew.sh)

Verify that `Node.js` and `npm` (Node Package Manager) are successfully installed:
```bash
node --version
npm --version
```

### Installing Appium
Global installation is recommended. Install [Appium](https://appium.io/) using the following command (-g flag stand for global instalation)
```bash
npm install -g appium
``` 
Install appium driver `XCUITest` for iOS tests
```bash
appium driver install xcuitest
```

### Setting Up the iOS Simulator
Install [Xcode](https://developer.apple.com/xcode/) from the [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12) or via the Command Line
```bash
xcode-select --install
```

View available simulated devices through the command line
```bash
xcrun simctl list devices
```
Example output:
```bash
#== Devices ==
#-- iOS 17.2 --
#    iPhone SE (3rd generation) (6D2E8845-E2AF-4F11-9626-2E4ECA877278) (Booted) 
#    iPhone 15 (122D7465-52EA-47F5-8BD7-8F4EFC86A6FC) (Shutdown) 
#    iPhone 15 Plus (B37F2D65-1B47-49E4-B68E-7D1DAD1315CB) (Shutdown) 
#    iPhone 15 Pro (19452815-91F9-4F3A-A884-94CB69C1983F) (Shutdown) 
#    iPhone 15 Pro Max (F7BA76A0-ED6F-4BED-9C2D-8CE67F81A43B) (Shutdown) 
#    iPad Air (5th generation) (ECC70B39-D98D-41E2-9621-D6399D114581) (Shutdown) 
#    iPad (10th generation) (B5E9DE7C-0799-429B-9504-0750977F5BE1) (Shutdown) 
#    iPad mini (6th generation) (CC38399F-B02C-4AE5-8537-007BCE9CD716) (Shutdown) 
#    iPad Pro (11-inch) (4th generation) (E7871F60-695D-4D56-8C8F-BCD222F72D14) (Shutdown) 
#    iPad Pro (12.9-inch) (6th generation) (81D0C0ED-CDA6-45E3-8AFF-6BF34863E172) (Shutdown) 
```
The variety of simulators is depends on your Xcode version and macOS system.

If you encounter errors like ``xcrun: error: unable to find utility “xcdevice”, not a developer tool or in PATH``, fix it with:
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```
Devices can be booted using its UUID: with the command:
```bash
xcrun simctl boot <DEVICE_UUID>
```
#### Configuring Test Capabilities
Make sure to modify `contacts.test.ts` file with desired capabilities. For example for a iPhone SE (3rd generation) running iOS 17.2 simulator, change `deviceName` and `platformVersion` as follows:
```bash
const capabilities = {
  platformName: 'iOS',
  'appium:platformVersion': '17.2',
  'appium:deviceName': 'iPhone SE (3rd generation)',
  'appium:automationName': 'XCUITest',
  'appium:app': 'com.apple.MobileAddressBook', // Bundle ID for Contacts app
  'appium:wdaLocalPort': 8100,
};
```
Verify that the correct simulator is booted and matches the `deviceName` and `platformVersion` in your test capabilities.

## Run a TypeScript test
1. Launch the Simulator by open the application manually or by using the command line:
```bash
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
```
Allow the simulator a few seconds to fully load before proceeding.

2. It’s necessary to launch Appium and keep it running in the background throughout the test execution. Open terminal and run:
```bash
appium
``` 
3. Run test script, for example:
```bash
npm test src/contacts.test.ts
```

## Test Case Description
The script adds a new contact with the following details: first name, last name, company, phone number, and social profile (LinkedIn). Afterward, the script opens the contact's social profile and ensures successful login to LinkedIn for a full view of the profile.

### Troubleshooting
I have created a dummy account specifically for this test. The login information is saved under the 'LinkedIn login info' parameters in `contacts.test.ts` and can be replaced with another account by updating the `USERNAME` and `PASSWORD` values. Since this account has been used repeatedly across many tests, LinkedIn may flag it for suspicious activity and request additional verification during login, such as a code sent to the associated email.

To prevent this issue, it is recommended to manually log in to LinkedIn on the simulator once before starting the tests.

After completing the manual login, reset the simulator for a clean testing environment by navigating to `Device` > `Erase All Content and Settings...` in the Simulator application. Then, proceed to run the tests.

![Simulator Screenshot - iPhone SE (3rd generation) - 2024-11-27 at 18 10 33 copy](https://github.com/user-attachments/assets/f0f66b7c-9a16-404a-88e1-5390d96d5318) ![Simulator Screenshot - iPhone SE (3rd generation) - 2024-11-27 at 23 02 30 copy](https://github.com/user-attachments/assets/1176a0f6-01b4-4ff1-ac76-ce2ee8eb52bb)

### Handling Edge Cases in the Test
The test accounts for several edge cases and includes mechanisms to handle them:

1. **Spotlight Search Instructions in Safari:** On the first use of Safari, clicking the URL bar may trigger a Spotlight Search instructions popup. The test ensures this popup is closed before proceeding.

<img width="326" alt="Screenshot 2024-11-28 at 1 47 04" src="https://github.com/user-attachments/assets/3c28f100-5348-4030-936d-360d23fb3dbf">

2. **LinkedIn Profile Viewing Without Login:** When opening a LinkedIn profile, the platform may display the profile without requiring login or may show popups such as "View Person's full profile." The test ensures these popups are closed and verifies that the login process is completed.

<img width="326" alt="Simulator Screenshot - iPhone SE (3rd generation) - 2024-11-27 at 16 32 16 copy" src="https://github.com/user-attachments/assets/264eee8e-a630-4104-b9b9-701d828fd288"><img width="326" alt="Screenshot 2024-11-27 at 22 18 19 copy" src="https://github.com/user-attachments/assets/2da8d6b6-a7b9-4016-9af3-1ced08053614">

3. **Custom Keyboard on Keychain-Saved Passwords:** If there are passwords saved in the keychain, a custom keyboard may appear during login instead of the default keyboard. The test adapts to handle this scenario seamlessly.

<img width="326" alt="Screenshot 2024-11-28 at 1 51 51" src="https://github.com/user-attachments/assets/51d3f134-d737-4a34-adbf-098fc9e8f801">

4. **'Welcome Back' Menu on Login:** After logging out of an existing account, LinkedIn presents a 'Welcome back' screen during the next login, with the username already pre-filled. The test accommodates this behavior to ensure the login process continues smoothly.

<img width="326" alt="Screenshot 2024-11-28 at 1 48 07" src="https://github.com/user-attachments/assets/a17c4093-33a8-44fd-a2c1-1d2d1b01fcef">

### Test chronology
You can watch a walkthrough recording of the test at this [link].
1. Open the Contacts app and tap the **Add (+)** button to create a new contact.
2. Fill in the contact details, including:
- First name
- Last name
- Company
- Phone number (set as iPhone)
- Email address
- LinkedIn social profile
3. Tap **Done** to save the contact.
4. On the contact's page, scroll down and tap the LinkedIn link.
5. Check the current URL. Handle edge cases #1, #2, and #3 as necessary. If login is required, navigate to `https://linkedin.com/login`.
6. Enter the login credentials and sign in, addressing edge case #4 as needed.
7. When prompted to save the password, click **Not Now** to dismiss the popup.
8. Verify successful login by confirming the URL redirects to the LinkedIn feed.
9. Return to the Contacts app and tap the contact's LinkedIn profile link again.
10. Verify that the current URL matches the LinkedIn social profile.

Run the test a second time while already logged in, and a third time after logging out.
To test the Keychain-saved edge case, erase all content for a fresh start (`Device` > `Erase All Content and Settings...` in the Simulator application) and make sure the login information is saved in the **Passwords** section within **Settings** before starting the initial test.
