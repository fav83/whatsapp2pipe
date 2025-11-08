# Spec-124: User Feedback System - Manual Testing Checklist

**Feature:** Feature 24 - User Feedback System
**Date:** 2025-11-08
**Status:** Ready for Manual Testing
**Related Document:** [Spec-124-User-Feedback-System.md](./Spec-124-User-Feedback-System.md)

---

## Purpose

This checklist ensures comprehensive manual testing of the User Feedback System before deployment. Complete all tests in both development and production builds.

---

## Prerequisites

- [ ] Extension built with `npm run build`
- [ ] Backend deployed to Azure (or running locally)
- [ ] Database migration applied
- [ ] Test user authenticated in extension
- [ ] Chrome DevTools open for monitoring console errors

---

## 1. UI Component Rendering

### FeedbackButton Visibility

- [ ] **Authenticated User:** Button appears at bottom of sidebar when signed in
- [ ] **Unauthenticated User:** Button NOT visible when signed out
- [ ] **Development Mode:** Button appears above DevModeIndicator with proper spacing
- [ ] **Production Mode:** Button appears at absolute bottom of sidebar
- [ ] **Button Styling:** White background, border, "Send Feedback" text, speech bubble icon
- [ ] **Button Width:** Full width of sidebar (minus padding)
- [ ] **Button Height:** 38px

### FeedbackModal Rendering

- [ ] **Modal Opens:** Clicking button opens modal with backdrop
- [ ] **Modal Centered:** Modal is horizontally and vertically centered
- [ ] **Modal Width:** 544px width
- [ ] **Modal Styling:** White background, rounded corners, shadow
- [ ] **Modal Title:** "Send Feedback" displays in header
- [ ] **Close Button:** X button visible in top-right of modal
- [ ] **Cancel Button:** "Cancel" button visible in footer
- [ ] **Submit Button:** "Submit" button visible in footer

---

## 2. User Input & Validation

### Textarea Behavior

- [ ] **Auto-focus:** Textarea automatically focused when modal opens
- [ ] **Placeholder Text:** "Tell us what's on your mind..." appears when empty
- [ ] **Character Counter:** Shows "0 / 5000" initially
- [ ] **Counter Updates:** Updates in real-time as user types (e.g., "10 / 5000")
- [ ] **Newlines:** User can insert newlines with Enter key
- [ ] **Resizable:** Textarea can be manually resized vertically (between 120px-240px)

### Character Limit Enforcement

- [ ] **5000 Chars Accepted:** User can type up to 5000 characters
- [ ] **5001+ Chars Blocked:** Typing beyond 5000 characters is prevented
- [ ] **Counter at Max:** Counter shows "5000 / 5000" when limit reached
- [ ] **Paste Overflow:** Pasting >5000 characters truncates to 5000

### Submit Button State

- [ ] **Empty Message:** Submit button disabled when textarea is empty
- [ ] **Whitespace Only:** Submit button disabled with only spaces/newlines
- [ ] **Valid Message:** Submit button enabled when message has content
- [ ] **After Clearing:** Submit button re-disabled if message cleared

---

## 3. Form Submission Flow

### Successful Submission

- [ ] **Submitting State:** Clicking Submit shows loading spinner
- [ ] **Form Disabled:** Textarea, Cancel, Submit, and Close X all disabled during submission
- [ ] **Success State:** Success screen appears after successful submission
- [ ] **Success Icon:** Green checkmark icon displays
- [ ] **Thank You Message:** "Thank you!" heading and message display
- [ ] **Close Button:** "Close" button appears in success state
- [ ] **Modal Closes:** Clicking Close button closes modal
- [ ] **State Reset:** Reopening modal shows empty form (default state)

### Backend Verification

- [ ] **Database Record:** New record appears in Feedback table
- [ ] **Correct UserId:** Record has correct UserId (matches authenticated user)
- [ ] **Message Content:** Record has exact message text (trimmed)
- [ ] **CreatedAt:** Record has UTC timestamp close to submission time
- [ ] **UserAgent:** Record has browser User-Agent string
- [ ] **ExtensionVersion:** Record has extension version (e.g., "0.32.156")

---

## 4. Error Handling

### Network Error Simulation

- [ ] **Disconnect Network:** Turn off Wi-Fi/Ethernet before submitting
- [ ] **Error Banner:** Red error banner appears with network error message
- [ ] **Message Preserved:** User's message remains in textarea
- [ ] **Form Enabled:** User can edit message after error
- [ ] **Dismiss Error:** Clicking X on error banner dismisses it
- [ ] **Retry Success:** Reconnecting network and resubmitting succeeds

### Token Expiration Simulation

- [ ] **Expired Token:** Manually expire access token in chrome.storage
- [ ] **401 Error:** Error banner shows authentication error message
- [ ] **Message Preserved:** User's message remains in textarea
- [ ] **Can Copy Message:** User can select and copy message before signing in again

### Server Error Simulation

- [ ] **Stop Backend:** Stop Azure Functions or local backend
- [ ] **500 Error:** Error banner shows server error message
- [ ] **Message Preserved:** User's message remains in textarea
- [ ] **Restart and Retry:** Restarting backend and resubmitting succeeds

---

## 5. Modal Closing Behavior

### Closing Without Content

- [ ] **Empty Textarea:** Clicking Cancel with empty textarea closes immediately
- [ ] **Empty Textarea:** Clicking X with empty textarea closes immediately
- [ ] **Empty Textarea:** Pressing Escape with empty textarea closes immediately
- [ ] **Empty Textarea:** Clicking outside modal closes immediately
- [ ] **No Confirmation:** No browser confirm dialog appears

### Closing With Unsaved Content

- [ ] **With Content:** Clicking Cancel with typed message shows confirm dialog
- [ ] **With Content:** Clicking X with typed message shows confirm dialog
- [ ] **With Content:** Pressing Escape with typed message shows confirm dialog
- [ ] **With Content:** Clicking outside modal shows confirm dialog
- [ ] **Confirm Dialog:** Dialog says "Discard your feedback?"
- [ ] **Confirm Yes:** Clicking OK discards message and closes modal
- [ ] **Confirm No:** Clicking Cancel keeps modal open with message preserved

### Closing After Submission

- [ ] **Success State:** Modal only has Close button (no Cancel/X)
- [ ] **Close Works:** Clicking Close button closes modal and resets state
- [ ] **No Confirmation:** No confirm dialog when closing success state

---

## 6. Keyboard Navigation & Accessibility

### Tab Order

- [ ] **Tab 1:** Focus moves to Close X button
- [ ] **Tab 2:** Focus moves to textarea
- [ ] **Tab 3:** Focus moves to Cancel button
- [ ] **Tab 4:** Focus moves to Submit button
- [ ] **Tab 5 (Wrap):** Focus wraps back to Close X button
- [ ] **Shift+Tab:** Reverse tab order works correctly

### Keyboard Shortcuts

- [ ] **Escape:** Pressing Escape closes modal (with confirmation if needed)
- [ ] **Enter in Textarea:** Pressing Enter inserts newline (does NOT submit)
- [ ] **Space on Button:** Pressing Space on focused button triggers click
- [ ] **Enter on Button:** Pressing Enter on focused button triggers click

### ARIA Attributes

- [ ] **role="dialog":** Modal has dialog role
- [ ] **aria-modal="true":** Modal has aria-modal attribute
- [ ] **aria-labelledby:** Modal references title ID
- [ ] **Textarea aria-label:** Textarea has "Feedback message" label
- [ ] **Textarea aria-required:** Textarea has aria-required="true"
- [ ] **Close aria-label:** Close X has "Close feedback modal" label
- [ ] **Dismiss aria-label:** Error dismiss X has "Dismiss error" label

### Screen Reader Testing

- [ ] **Modal Announce:** Screen reader announces "Send Feedback" dialog when opened
- [ ] **Textarea Label:** Screen reader reads "Feedback message" label
- [ ] **Button Labels:** Screen reader reads all button labels correctly
- [ ] **Error Announce:** Screen reader announces error messages (implicit live region)
- [ ] **Success Announce:** Screen reader announces success message

---

## 7. Edge Cases & Stress Testing

### Long Messages

- [ ] **4000 Characters:** Submitting 4000-char message succeeds
- [ ] **5000 Characters:** Submitting exactly 5000-char message succeeds
- [ ] **Newlines:** Message with 50+ newlines renders correctly in database
- [ ] **Special Characters:** Message with emojis, accents, symbols stores correctly
- [ ] **SQL Injection:** Message with `'; DROP TABLE Feedback;--` safely escaped
- [ ] **HTML/XSS:** Message with `<script>alert(1)</script>` safely escaped

### Multiple Submissions

- [ ] **Sequential Submissions:** Submitting 3 times in a row creates 3 records
- [ ] **Different Messages:** Each submission stores unique message content
- [ ] **Same Message:** Submitting same message twice creates 2 separate records
- [ ] **Rapid Clicks:** Clicking Submit rapidly doesn't create duplicate submissions

### UI Stress Testing

- [ ] **Resize Window:** Modal remains centered when browser window resized
- [ ] **Small Window:** Modal doesn't overflow on 1024x768 screen
- [ ] **Large Window:** Modal doesn't stretch on 4K screen
- [ ] **Zoom 150%:** UI remains usable at 150% browser zoom
- [ ] **Zoom 200%:** UI remains usable at 200% browser zoom

---

## 8. Browser Compatibility

### Chrome Versions

- [ ] **Chrome Stable:** Works on latest stable Chrome (M120+)
- [ ] **Chrome Beta:** Works on Chrome Beta
- [ ] **Chrome Dev:** Works on Chrome Dev channel

### Operating Systems

- [ ] **Windows 10:** Works on Windows 10
- [ ] **Windows 11:** Works on Windows 11
- [ ] **macOS:** Works on macOS (if available for testing)
- [ ] **Linux:** Works on Linux (if available for testing)

---

## 9. Console & Network Monitoring

### Console Errors

- [ ] **No Errors:** No console errors during normal operation
- [ ] **No Warnings:** No console warnings during normal operation
- [ ] **Expected Logs:** Service worker logs show "Feedback submitted successfully"

### Network Requests

- [ ] **Correct Endpoint:** POST request to `/api/feedback`
- [ ] **Authorization Header:** Request includes `Authorization: Bearer <token>`
- [ ] **Content-Type Header:** Request includes `Content-Type: application/json`
- [ ] **Request Body:** Body includes `{ "message": "...", "extensionVersion": "..." }`
- [ ] **Response 200:** Successful submission returns 200 OK
- [ ] **Response Body:** Response is `{ "success": true }`

---

## 10. Performance

### Load Times

- [ ] **Modal Opens Fast:** Modal opens within 100ms of button click
- [ ] **Typing Responsive:** No lag when typing in textarea
- [ ] **Counter Updates:** Character counter updates without delay
- [ ] **Submission Fast:** API call completes within 2 seconds (typical network)

### Memory Leaks

- [ ] **Open/Close 10x:** Opening and closing modal 10 times doesn't cause memory leak
- [ ] **Submit 5x:** Submitting 5 times doesn't cause memory leak
- [ ] **DevTools Memory:** Memory usage remains stable over time

---

## 11. Development Mode Specific

### DevModeIndicator Positioning

- [ ] **Button Above Dev:** Feedback button appears above DevModeIndicator
- [ ] **Proper Spacing:** 8px gap between button and dev indicator
- [ ] **Both Visible:** Both button and dev indicator fully visible
- [ ] **No Overlap:** Button doesn't overlap dev indicator

---

## 12. Production Mode Specific

### Final Position

- [ ] **Absolute Bottom:** Button at absolute bottom of sidebar
- [ ] **No DevModeIndicator:** DevModeIndicator not visible in production
- [ ] **Scrolling:** Button remains at bottom when sidebar content scrolls

---

## 13. Regression Testing

### Existing Features

- [ ] **Person Lookup:** Person lookup still works after feedback feature added
- [ ] **Create Person:** Create person flow still works
- [ ] **Attach Phone:** Attach phone flow still works
- [ ] **Sign In:** OAuth sign-in flow still works
- [ ] **Sign Out:** Sign-out flow still works
- [ ] **Sidebar Injection:** Sidebar still injects correctly on WhatsApp Web

---

## Test Results Summary

**Date Tested:** ___________

**Tested By:** ___________

**Build Version:** ___________

**Backend Environment:** ☐ Local ☐ Azure Production

**Total Tests:** 165

**Passed:** _____

**Failed:** _____

**Blocked:** _____

**Notes:**
```
[Add any additional notes, issues discovered, or observations here]
```

---

## Sign-Off

- [ ] All critical tests passed
- [ ] All accessibility tests passed
- [ ] No console errors or warnings
- [ ] Backend records verified in database
- [ ] Ready for production deployment

**Tester Signature:** _____________________ **Date:** ___________

**Reviewer Signature:** _____________________ **Date:** ___________
