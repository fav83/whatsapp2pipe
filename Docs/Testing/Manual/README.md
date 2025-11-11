# Manual Testing Documentation

This directory contains manual test cases for the Chat2Deal project, organized by component.

## Test Files

### [Landing-Manual-Tests.md](Landing-Manual-Tests.md)
Manual test cases for the landing page (https://chat2deal.com)

**Key Areas:**
- Landing page navigation
- Sign in with Pipedrive flow
- Legal pages (Privacy Policy, Terms of Service)
- Responsive design (mobile, tablet, desktop)
- SEO and performance
- External links

**Priority Tests:** 15 scenarios (8 High, 5 Medium, 2 Low)

---

### [Website-Manual-Tests.md](Website-Manual-Tests.md)
Manual test cases for the dashboard website

**Key Areas:**
- OAuth authentication flow
- User dashboard components
- Profile management and sign out
- Protected routes
- OAuth callback handling
- Error handling
- Responsive design
- Browser compatibility

**Priority Tests:** 22 scenarios (13 High, 9 Medium)

---

### [Extension-Manual-Tests.md](Extension-Manual-Tests.md)
Manual test cases for the Chrome extension

**Key Areas:**
- Extension installation
- WhatsApp Web sidebar injection
- Extension authentication
- Person auto-lookup flow
- Create person flow
- Attach number to existing person flow
- User avatar and profile dropdown
- Error handling and UI states
- Extension performance
- Extension compatibility
- Data synchronization

**Priority Tests:** 42 scenarios (26 High, 16 Medium)

---

## Test Execution Guidelines

### Pre-Test Setup

1. **Environment Preparation:**
   - Clear browser cache and cookies
   - Ensure stable internet connection
   - Have test accounts ready (Pipedrive, WhatsApp)

2. **Required Accounts:**
   - Valid Pipedrive account
   - WhatsApp account with active chats
   - Test contacts in both systems

3. **Build and Deploy:**
   - Landing page: Ensure latest deployment
   - Dashboard website: Ensure latest deployment
   - Extension: Build using `cd Extension && npm run build`

### Test Execution Process

1. **Read the Test Scenario:**
   - Understand the Given/When/Then structure
   - Note the priority level
   - Review pre-conditions

2. **Execute the Test:**
   - Follow each step exactly as written
   - Document any deviations
   - Capture screenshots of failures

3. **Record Results:**
   - Mark test as PASS or FAIL
   - Note any unexpected behavior
   - Document error messages verbatim
   - Include screenshots for visual issues

4. **Report Issues:**
   - Create GitHub issue for each failure
   - Include test scenario name
   - Attach screenshots and logs
   - Note browser version and OS

### Priority Levels

- **High:** Critical functionality that must work for the product to be usable
- **Medium:** Important functionality that affects user experience but has workarounds
- **Low:** Nice-to-have functionality or edge cases

### Test Coverage

Focus on high-priority tests first:
- **Landing:** 8 high-priority scenarios (53%)
- **Website:** 13 high-priority scenarios (59%)
- **Extension:** 26 high-priority scenarios (62%)

### Recommended Testing Order

1. **Smoke Test (Quick Validation):**
   - Landing: Sign in button works
   - Website: OAuth flow completes
   - Extension: Sidebar appears on WhatsApp Web

2. **Core Functionality:**
   - Landing: All sign-in entry points
   - Website: Dashboard displays correctly
   - Extension: Person lookup and creation flows

3. **Edge Cases:**
   - Error handling scenarios
   - Network failure cases
   - Validation and boundary tests

4. **Cross-Browser/Device:**
   - Repeat high-priority tests on different browsers
   - Test responsive design on multiple screen sizes

---

## Gherkin Syntax Reference

All test cases use Gherkin syntax for clarity and structure:

- **Given:** Initial context or pre-conditions
- **When:** Action or event that triggers the test
- **Then:** Expected outcome or result
- **And:** Additional conditions or actions

Example:
```gherkin
Given I am an authenticated user
And I am on the dashboard
When I click "Sign Out"
Then I should be logged out
And I should be redirected to the home page
```

---

## Bug Report Template

When reporting issues found during manual testing:

```markdown
**Test Scenario:** [Name of test scenario]
**Priority:** [High/Medium/Low]
**Status:** FAIL

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Environment:**
- Browser: Chrome 120.0.6099.129
- OS: Windows 11
- Extension Version: 0.32.171

**Screenshots:**
[Attach screenshots]

**Console Errors:**
[Include any console errors]
```

---

## Test Metrics

Track testing progress using these metrics:

- **Test Coverage:** % of scenarios executed
- **Pass Rate:** % of executed tests that passed
- **Defect Density:** Number of bugs per test scenario
- **Time to Execute:** Time taken for full test suite

Example:
```
Landing Tests: 15/15 executed (100%), 14 passed (93%)
Website Tests: 22/22 executed (100%), 21 passed (95%)
Extension Tests: 42/42 executed (100%), 39 passed (93%)
```

---

## Continuous Improvement

- Update test cases when features change
- Add new scenarios for bug fixes
- Remove obsolete tests
- Refine priority levels based on user impact

---

## Questions or Issues?

If you have questions about these test cases or need clarification:
1. Check the relevant specification document in `Docs/Specs/`
2. Review the architecture documentation in `Docs/Architecture/`
3. Open a GitHub issue with the `testing` label
