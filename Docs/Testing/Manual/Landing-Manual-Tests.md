# Landing Page Manual Test Cases

## Overview
Manual test cases for the Chat2Deal landing page (https://chat2deal.com)

**Test Environment:**
- URL: https://chat2deal.com
- Browser: Chrome (latest), Firefox (latest), Safari (latest)

---

## Feature: Landing Page Navigation

### Scenario: User visits landing page
**Priority:** High

```gherkin
Given I am an unauthenticated user
When I navigate to "https://chat2deal.com"
Then I should see the landing page
And the page title should contain "Chat2Deal"
And the header should display the logo
And the header should display a "Sign in with Pipedrive" button
```

### Scenario: User scrolls through landing page sections
**Priority:** Medium

```gherkin
Given I am on the landing page
When I scroll down the page
Then I should see the following sections in order:
  | Section         |
  | Hero            |
  | Features        |
  | How It Works    |
  | Pricing         |
  | Get Started CTA |
  | Footer          |
```

---

## Feature: Sign In with Pipedrive

### Scenario: User clicks sign in button from header
**Priority:** High

```gherkin
Given I am on the landing page
When I click the "Sign in with Pipedrive" button in the header
Then I should be redirected to the Pipedrive OAuth authorization page
And the URL should contain "oauth.pipedrive.com"
```

### Scenario: User clicks sign in button from hero section
**Priority:** High

```gherkin
Given I am on the landing page
And I am viewing the hero section
When I click the "Sign in with Pipedrive" button in the hero
Then I should be redirected to the Pipedrive OAuth authorization page
And the URL should contain "oauth.pipedrive.com"
```

### Scenario: User clicks sign in button from final CTA section
**Priority:** High

```gherkin
Given I am on the landing page
And I scroll to the "Get Started" section
When I click the "Sign in with Pipedrive" button
Then I should be redirected to the Pipedrive OAuth authorization page
And the URL should contain "oauth.pipedrive.com"
```

---

## Feature: Legal Pages

### Scenario: User navigates to Privacy Policy
**Priority:** Medium

```gherkin
Given I am on the landing page
When I click the "Privacy Policy" link in the footer
Then I should be navigated to "/privacy-policy"
And the page should display the privacy policy content
And the page should have proper SEO meta tags
And the og:url meta tag should match the canonical URL
```

### Scenario: User navigates to Terms of Service
**Priority:** Medium

```gherkin
Given I am on the landing page
When I click the "Terms of Service" link in the footer
Then I should be navigated to "/terms-of-service"
And the page should display the terms of service content
And the page should have proper SEO meta tags
And the og:url meta tag should match the canonical URL
```

### Scenario: User navigates back to home from legal pages
**Priority:** Low

```gherkin
Given I am on the "/privacy-policy" page
When I click the logo in the header
Then I should be navigated back to the home page "/"
```

---

## Feature: Responsive Design

### Scenario: Landing page displays correctly on mobile
**Priority:** High

```gherkin
Given I am on the landing page
When I resize the browser to mobile width (375px)
Then the layout should adapt to mobile view
And the navigation should collapse to a mobile menu
And all content should be readable without horizontal scrolling
And images should scale appropriately
```

### Scenario: Landing page displays correctly on tablet
**Priority:** Medium

```gherkin
Given I am on the landing page
When I resize the browser to tablet width (768px)
Then the layout should adapt to tablet view
And all content should be readable without horizontal scrolling
And the grid layout should adjust appropriately
```

### Scenario: Landing page displays correctly on desktop
**Priority:** High

```gherkin
Given I am on the landing page
When I view the page on desktop width (1920px)
Then the layout should display in full desktop view
And all sections should be properly aligned
And images should display at full resolution
```

---

## Feature: SEO and Performance

### Scenario: Landing page has proper SEO meta tags
**Priority:** High

```gherkin
Given I am on the landing page
When I inspect the page source
Then the page should have a proper <title> tag
And the page should have a meta description
And the page should have Open Graph meta tags
And the page should have Twitter Card meta tags
```

### Scenario: Landing page loads within acceptable time
**Priority:** High

```gherkin
Given I am an unauthenticated user
When I navigate to "https://chat2deal.com"
Then the page should load completely within 3 seconds
And all images should load without errors
And there should be no console errors
```

---

## Feature: External Links

### Scenario: User clicks on external documentation links
**Priority:** Low

```gherkin
Given I am on the landing page
When I click an external link (e.g., Pipedrive API docs)
Then the link should open in a new tab
And I should remain on the landing page in the original tab
```

---

## Test Execution Notes

**Pre-conditions:**
- Ensure you are logged out of Pipedrive and Chat2Deal
- Clear browser cookies and cache before testing
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on different devices (mobile, tablet, desktop)

**Post-conditions:**
- Document any visual inconsistencies
- Report any broken links
- Note any performance issues
- Capture screenshots of failures
