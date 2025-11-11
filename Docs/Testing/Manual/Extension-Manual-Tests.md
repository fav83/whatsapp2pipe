# Chrome Extension Manual Test Cases

## Overview
Manual test cases for the Chat2Deal Chrome extension

**Test Environment:**
- Browser: Google Chrome (latest version)
- Extension: Chat2Deal (loaded from `Extension/dist/`)
- Target Site: https://web.whatsapp.com
- **Pre-requisites:**
  - Valid Pipedrive account
  - Authenticated via dashboard website
  - WhatsApp account with active chats

---

## Feature: Extension Installation

### Scenario: User installs extension from Chrome Web Store
**Priority:** High

```gherkin
Given I am using Google Chrome
And I have navigated to the Chat2Deal extension page on Chrome Web Store
When I click "Add to Chrome"
And I confirm the installation in the permission dialog
Then the extension should be installed
And the extension icon should appear in the Chrome toolbar
And I should see a success notification
```

### Scenario: Developer loads unpacked extension
**Priority:** High

```gherkin
Given I have built the extension using "npm run build"
And I have navigated to "chrome://extensions"
And I have enabled "Developer mode"
When I click "Load unpacked"
And I select the "Extension/dist/" folder
Then the extension should load successfully
And no errors should appear in the console
And the extension should appear in the extensions list
```

### Scenario: Extension updates automatically
**Priority:** Medium

```gherkin
Given I have an older version of the extension installed
When a new version is available on Chrome Web Store
And Chrome checks for updates
Then the extension should update automatically
And I should see a notification about the update
And the version number should reflect the new version
```

---

## Feature: WhatsApp Web Sidebar Injection

### Scenario: Sidebar appears when opening WhatsApp Web
**Priority:** High

```gherkin
Given the extension is installed and enabled
And I am authenticated with Pipedrive
When I navigate to "https://web.whatsapp.com"
And WhatsApp Web loads completely
Then I should see the Chat2Deal sidebar on the right side
And the WhatsApp content should shift left by 350px
And the sidebar should not overlap the WhatsApp interface
```

### Scenario: Sidebar maintains position during chat navigation
**Priority:** High

```gherkin
Given I am on WhatsApp Web
And the sidebar is visible
When I click on different chat conversations
Then the sidebar should remain fixed on the right
And the WhatsApp content should maintain the 350px left margin
And there should be no layout flickering
```

### Scenario: Sidebar does not appear on non-WhatsApp pages
**Priority:** Medium

```gherkin
Given the extension is installed and enabled
When I navigate to a non-WhatsApp website (e.g., "https://google.com")
Then the sidebar should NOT be injected
And the page should display normally without modifications
```

### Scenario: Sidebar appearance on page reload
**Priority:** High

```gherkin
Given I am on WhatsApp Web
And the sidebar is visible
When I reload the page (F5 or Ctrl+R)
Then the sidebar should reappear after WhatsApp loads
And the layout should be correct without overlap
```

---

## Feature: Extension Authentication

### Scenario: User signs in via extension popup
**Priority:** High

```gherkin
Given the extension is installed
And I am NOT authenticated
When I click the extension icon in the toolbar
Then I should see a popup with "Sign in with Pipedrive" button
When I click the button
Then I should be redirected to the OAuth flow
And after successful authentication, the extension should be connected
```

### Scenario: Authenticated user opens extension popup
**Priority:** Medium

```gherkin
Given I am authenticated with Pipedrive
When I click the extension icon in the toolbar
Then I should see my user profile information
And I should see my Pipedrive connection status
And I should see a "Sign Out" button
```

### Scenario: User signs out from extension
**Priority:** High

```gherkin
Given I am authenticated
And I have the extension popup open
When I click "Sign Out"
Then I should be signed out
And the next time I open WhatsApp Web, I should see an unauthenticated state in the sidebar
```

---

## Feature: Person Auto-Lookup Flow

### Scenario: Lookup finds exact match by phone number
**Priority:** High

```gherkin
Given I am authenticated with Pipedrive
And I am on WhatsApp Web
And I have a contact in Pipedrive with phone number "+1234567890"
When I click on a WhatsApp chat with the number "+1234567890"
Then the sidebar should show a loading state
And within 2 seconds, the sidebar should display the person's details:
  | Field        |
  | Name         |
  | Email        |
  | Phone        |
  | Organization |
And I should see a link to view the person in Pipedrive
```

### Scenario: Lookup finds no match (new contact)
**Priority:** High

```gherkin
Given I am authenticated with Pipedrive
And I am on WhatsApp Web
When I click on a WhatsApp chat with an unknown number "+9999999999"
Then the sidebar should show a loading state
And the sidebar should display "Person not found"
And I should see two action buttons:
  | Button                          |
  | Create New Person               |
  | Attach to Existing Person       |
```

### Scenario: Lookup handles network error
**Priority:** Medium

```gherkin
Given I am authenticated with Pipedrive
And the network connection is lost
When I click on a WhatsApp chat
Then the sidebar should show a loading state
And after timeout, an error message should appear
And I should see a "Retry" button
```

### Scenario: Lookup handles API error (500)
**Priority:** Medium

```gherkin
Given I am authenticated with Pipedrive
And the Pipedrive API returns a 500 error
When I click on a WhatsApp chat
Then the sidebar should show an error state
And the error message should indicate a temporary issue
And I should see a "Retry" button
```

---

## Feature: Create Person Flow

### Scenario: User creates a new person with valid data
**Priority:** High

```gherkin
Given I am viewing a chat with an unknown contact
And the sidebar shows "Person not found"
When I click "Create New Person"
Then I should see a form with the following fields:
  | Field        | Pre-filled              |
  | Name         | WhatsApp contact name   |
  | Phone        | WhatsApp number         |
  | Email        | Empty                   |
  | Organization | Empty (autocomplete)    |
When I fill in the name "John Doe"
And I click "Create Person"
Then the person should be created in Pipedrive
And the sidebar should update to show the person's details
And I should see a success message
```

### Scenario: User creates person with organization
**Priority:** High

```gherkin
Given I am creating a new person
And I have filled in the name and phone
When I start typing in the organization field
Then I should see autocomplete suggestions from Pipedrive
When I select an organization from the suggestions
And I click "Create Person"
Then the person should be created
And the person should be linked to the selected organization
```

### Scenario: User cancels person creation
**Priority:** Medium

```gherkin
Given I am viewing the "Create New Person" form
When I click "Cancel"
Then the form should close
And I should return to the "Person not found" state
And no person should be created in Pipedrive
```

### Scenario: Create person with validation errors
**Priority:** High

```gherkin
Given I am viewing the "Create New Person" form
When I leave the name field empty
And I click "Create Person"
Then I should see a validation error "Name is required"
And the person should NOT be created
And the form should remain open for correction
```

### Scenario: Create person with duplicate phone number
**Priority:** Medium

```gherkin
Given a person already exists in Pipedrive with phone "+1234567890"
When I try to create a new person with the same phone number
And I click "Create Person"
Then I should see an error "A person with this phone number already exists"
And I should be given the option to view the existing person
```

---

## Feature: Attach Number to Existing Person Flow

### Scenario: User searches for existing person
**Priority:** High

```gherkin
Given I am viewing a chat with an unknown contact
And I click "Attach to Existing Person"
Then I should see a search interface
When I type "John" in the search field
Then I should see a list of matching persons from Pipedrive
And each result should show:
  | Field        |
  | Name         |
  | Email        |
  | Organization |
```

### Scenario: User attaches number to selected person
**Priority:** High

```gherkin
Given I am searching for an existing person
And I see search results
When I select "John Doe" from the results
Then I should see a confirmation dialog
And the dialog should show the WhatsApp number to be added
When I confirm the action
Then the phone number should be added to the person in Pipedrive
And the sidebar should update to show the person's details
And I should see a success message
```

### Scenario: User cancels attach flow
**Priority:** Medium

```gherkin
Given I am viewing the search interface
When I click "Cancel"
Then the search should close
And I should return to the "Person not found" state
And no changes should be made in Pipedrive
```

### Scenario: Search returns no results
**Priority:** Medium

```gherkin
Given I am searching for an existing person
When I type "XYZNONEXISTENT" in the search field
And no persons match the query
Then I should see "No results found"
And I should be able to modify my search
```

---

## Feature: User Avatar and Profile Dropdown

### Scenario: User views avatar in sidebar header
**Priority:** High

```gherkin
Given I am authenticated with Pipedrive
And I am on WhatsApp Web
When the sidebar loads
Then I should see my user avatar in the sidebar header
And hovering over the avatar should show my name in a tooltip
```

### Scenario: User opens profile dropdown
**Priority:** High

```gherkin
Given I am viewing the sidebar
When I click on my user avatar
Then a dropdown menu should appear
And the menu should contain:
  | Menu Item              |
  | My name and email      |
  | View Dashboard         |
  | Sign Out               |
```

### Scenario: User navigates to dashboard from dropdown
**Priority:** Medium

```gherkin
Given the profile dropdown is open
When I click "View Dashboard"
Then a new tab should open
And the tab should navigate to "https://chat2deal.com/dashboard"
And I should remain signed in
```

### Scenario: User signs out from dropdown
**Priority:** High

```gherkin
Given the profile dropdown is open
When I click "Sign Out"
Then I should be signed out
And the sidebar should update to show unauthenticated state
And I should see a "Sign in with Pipedrive" button
```

---

## Feature: Error Handling and UI States

### Scenario: Module raid loading overlay appears
**Priority:** Medium

```gherkin
Given I navigate to WhatsApp Web
And the page is loading
When the extension initializes
Then I should briefly see a loading overlay
And the overlay should disappear once WhatsApp loads
And the sidebar should appear
```

### Scenario: Error boundary catches React errors
**Priority:** High

```gherkin
Given the extension is running
When a React component throws an error
Then I should see an error boundary UI
And the error should be reported to Sentry
And I should see an option to reload the extension
And the error should not crash the entire extension
```

### Scenario: Unauthenticated state in sidebar
**Priority:** High

```gherkin
Given I am NOT authenticated with Pipedrive
And I am on WhatsApp Web
When the sidebar loads
Then I should see a message "Sign in to connect your Pipedrive"
And I should see a "Sign in with Pipedrive" button
And no person lookup should occur
```

---

## Feature: Extension Performance

### Scenario: Sidebar loads within acceptable time
**Priority:** High

```gherkin
Given I am on WhatsApp Web
When the page finishes loading
Then the sidebar should appear within 1 second
And the sidebar should not cause layout shifts
```

### Scenario: Person lookup completes quickly
**Priority:** High

```gherkin
Given I am authenticated
When I click on a chat
Then the person lookup should start immediately
And results should appear within 2 seconds
And the UI should show loading state during lookup
```

### Scenario: Extension does not slow down WhatsApp
**Priority:** High

```gherkin
Given the extension is installed and running
When I use WhatsApp Web normally (send messages, switch chats, etc.)
Then WhatsApp should remain responsive
And there should be no noticeable performance degradation
And messages should send without delay
```

---

## Feature: Extension Compatibility

### Scenario: Extension works after WhatsApp Web update
**Priority:** High

```gherkin
Given WhatsApp Web has updated their interface
When I navigate to "https://web.whatsapp.com"
Then the sidebar should still inject correctly
And all features should work as expected
And no layout issues should occur
```

### Scenario: Extension handles multiple WhatsApp tabs
**Priority:** Medium

```gherkin
Given I have the extension installed
When I open WhatsApp Web in multiple tabs
Then the sidebar should appear in each tab
And each tab should maintain its own state
And no interference should occur between tabs
```

---

## Feature: Data Synchronization

### Scenario: Changes in Pipedrive reflect in sidebar
**Priority:** Medium

```gherkin
Given I am viewing a person's details in the sidebar
When I update the person's name in Pipedrive web interface
And I return to WhatsApp Web
And I click on the chat again
Then the sidebar should show the updated name
```

### Scenario: Newly created person appears immediately
**Priority:** High

```gherkin
Given I create a new person via the sidebar
When the creation is successful
Then the sidebar should immediately display the new person's details
And I should not need to refresh or re-lookup
```

---

## Test Execution Notes

**Pre-conditions:**
- Build extension: `cd Extension && npm run build`
- Load extension in Chrome from `Extension/dist/`
- Ensure you have active Pipedrive account
- Authenticate via dashboard website first
- Have test contacts in WhatsApp and Pipedrive

**Test Data Requirements:**
- At least 3 test contacts in Pipedrive with phone numbers
- At least 2 test WhatsApp chats (one matching Pipedrive, one new)
- Test organization in Pipedrive for creation flow

**Browser Console Monitoring:**
- Keep DevTools open during testing
- Monitor for console errors
- Check Network tab for failed API requests
- Verify no CORS errors
- Check Sentry integration (if enabled)

**Post-conditions:**
- Document any UI glitches or layout issues
- Report any performance degradation
- Capture screenshots of error states
- Note any WhatsApp Web compatibility issues
- Verify all created test data in Pipedrive

**Known Limitations:**
- Extension only works on web.whatsapp.com domain
- Requires Chrome browser (Manifest V3)
- Requires active internet connection
- Pipedrive API rate limits may apply
