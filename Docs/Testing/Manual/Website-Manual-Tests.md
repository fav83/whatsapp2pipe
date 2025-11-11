# Dashboard Website Manual Test Cases

## Overview
Manual test cases for the Chat2Deal dashboard website

**Test Environment:**
- URL: https://chat2deal.com/dashboard
- Browser: Chrome (latest), Firefox (latest), Safari (latest)
- **Pre-requisite:** Valid Pipedrive account

---

## Feature: OAuth Authentication Flow

### Scenario: New user signs in with Pipedrive
**Priority:** High

```gherkin
Given I am an unauthenticated user
And I have a valid Pipedrive account
And I am on "https://chat2deal.com"
When I click "Sign in with Pipedrive"
And I am redirected to Pipedrive OAuth page
And I click "Allow" to authorize Chat2Deal
Then I should be redirected to "https://chat2deal.com/dashboard"
And I should see my Pipedrive user profile
And I should see the extension installation status
```

### Scenario: Existing user signs in with Pipedrive
**Priority:** High

```gherkin
Given I am a registered user who has previously authorized Chat2Deal
And I am on "https://chat2deal.com"
When I click "Sign in with Pipedrive"
And I am redirected to Pipedrive OAuth page
And I click "Allow" to authorize Chat2Deal
Then I should be redirected to "https://chat2deal.com/dashboard"
And I should see my existing user profile
And my last login timestamp should be updated
```

### Scenario: User denies OAuth authorization
**Priority:** High

```gherkin
Given I am an unauthenticated user
And I am on the Pipedrive OAuth authorization page
When I click "Deny" or close the authorization window
Then I should be redirected back to "https://chat2deal.com"
And I should see an error message explaining authorization was denied
And I should remain unauthenticated
```

### Scenario: OAuth callback with invalid state
**Priority:** Medium

```gherkin
Given I am on the OAuth callback page
And the state parameter does not match the session
When the callback is processed
Then I should see an error message "Invalid state parameter"
And I should be redirected to the home page
```

---

## Feature: User Dashboard

### Scenario: Authenticated user views dashboard
**Priority:** High

```gherkin
Given I am an authenticated user
When I navigate to "/dashboard"
Then I should see the following components:
  | Component               |
  | User profile card       |
  | Extension status widget |
  | How to use instructions |
And the user profile should display my name
And the user profile should display my email
And the user profile should display my avatar
```

### Scenario: User views extension installation status - Not Installed
**Priority:** High

```gherkin
Given I am an authenticated user
And the Chrome extension is NOT installed
When I view the dashboard
Then the extension status should show "Not Installed"
And I should see a link to the Chrome Web Store
And I should see installation instructions
```

### Scenario: User views extension installation status - Installed
**Priority:** High

```gherkin
Given I am an authenticated user
And the Chrome extension is installed
When I view the dashboard
Then the extension status should show "Installed"
And I should see a confirmation message
And I should see a link to open WhatsApp Web
```

### Scenario: User views "How to Use" instructions
**Priority:** Medium

```gherkin
Given I am an authenticated user
When I view the dashboard
Then I should see "How to Use" section
And the section should contain step-by-step instructions
And the instructions should include:
  | Step                           |
  | Install the Chrome extension   |
  | Open WhatsApp Web              |
  | Start chatting                 |
  | View contact details in sidebar|
```

---

## Feature: User Profile Management

### Scenario: User signs out
**Priority:** High

```gherkin
Given I am an authenticated user
And I am on the dashboard
When I click the "Sign Out" button in the user profile card
Then I should be logged out
And I should be redirected to the home page "/"
And my session should be cleared
```

### Scenario: User session expires
**Priority:** Medium

```gherkin
Given I am an authenticated user
And my session has expired
When I try to access "/dashboard"
Then I should be redirected to the home page
And I should see a message indicating my session has expired
```

---

## Feature: Protected Routes

### Scenario: Unauthenticated user tries to access dashboard
**Priority:** High

```gherkin
Given I am NOT authenticated
When I navigate directly to "/dashboard"
Then I should be redirected to "/"
And I should see a message to sign in
```

### Scenario: Authenticated user accesses dashboard directly
**Priority:** High

```gherkin
Given I am an authenticated user with a valid session
When I navigate directly to "/dashboard"
Then I should see the dashboard
And I should NOT be redirected
```

---

## Feature: OAuth Callback Handling

### Scenario: OAuth callback with valid authorization code
**Priority:** High

```gherkin
Given I have authorized Chat2Deal on Pipedrive
When I am redirected to "/auth/callback?code=VALID_CODE&state=VALID_STATE"
Then the backend should exchange the code for access token
And a user session should be created
And I should be redirected to "/dashboard"
```

### Scenario: OAuth callback with error from Pipedrive
**Priority:** Medium

```gherkin
Given Pipedrive returns an error during OAuth
When I am redirected to "/auth/callback?error=access_denied"
Then I should see an error message
And I should be redirected to the home page
And no session should be created
```

### Scenario: OAuth callback without required parameters
**Priority:** Medium

```gherkin
Given I navigate directly to "/auth/callback" without parameters
When the page loads
Then I should see an error message "Missing authorization code"
And I should be redirected to the home page
```

---

## Feature: Error Handling

### Scenario: Backend service is unavailable
**Priority:** High

```gherkin
Given the backend API is unavailable
When I try to sign in with Pipedrive
Then I should see an error message "Service temporarily unavailable"
And I should be able to retry the sign-in
```

### Scenario: Network error during authentication
**Priority:** Medium

```gherkin
Given I am in the middle of the OAuth flow
When a network error occurs
Then I should see an appropriate error message
And I should be given option to retry
```

---

## Feature: Responsive Design

### Scenario: Dashboard displays correctly on mobile
**Priority:** High

```gherkin
Given I am an authenticated user
And I am viewing the dashboard on mobile (375px width)
Then the layout should adapt to mobile view
And all cards should stack vertically
And the user profile should be readable
And all buttons should be easily tappable
```

### Scenario: Dashboard displays correctly on desktop
**Priority:** High

```gherkin
Given I am an authenticated user
And I am viewing the dashboard on desktop (1920px width)
Then the layout should use the full width appropriately
And cards should be arranged in a grid
And all content should be properly aligned
```

---

## Feature: Browser Compatibility

### Scenario: Dashboard works in Chrome
**Priority:** High

```gherkin
Given I am using Google Chrome (latest version)
When I sign in and access the dashboard
Then all features should work correctly
And there should be no console errors
```

### Scenario: Dashboard works in Firefox
**Priority:** Medium

```gherkin
Given I am using Firefox (latest version)
When I sign in and access the dashboard
Then all features should work correctly
And there should be no console errors
```

### Scenario: Dashboard works in Safari
**Priority:** Medium

```gherkin
Given I am using Safari (latest version)
When I sign in and access the dashboard
Then all features should work correctly
And there should be no console errors
```

---

## Test Execution Notes

**Pre-conditions:**
- Have a valid Pipedrive account ready
- Clear browser cookies and cache before testing
- Ensure backend API is running and accessible
- Test on multiple browsers and devices

**Test Data Requirements:**
- Valid Pipedrive account credentials
- Test invite codes (if applicable)

**Post-conditions:**
- Document any authentication failures
- Report any visual inconsistencies
- Note any performance issues
- Capture screenshots of error states
- Verify session management works correctly

**Known Limitations:**
- Extension status detection requires Chrome extension to be installed
- OAuth flow requires internet connection
- Pipedrive account must be active
