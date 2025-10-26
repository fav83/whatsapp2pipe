# WhatsApp Inspector - Usage Instructions

## Purpose

The WhatsApp Inspector is a research utility that tests different methods for accessing WhatsApp Web's internal state. This helps us determine the most reliable approach for extracting chat information.

## Prerequisites

1. Build the extension in development mode: `npm run dev`
2. Load the extension in Chrome (see main README)
3. Navigate to https://web.whatsapp.com
4. Wait for WhatsApp to fully load
5. **Open a chat** (1:1 or group chat)

## How to Use

### 1. Open Browser Console

- Press `F12` or `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Option+J` (Mac)
- Navigate to the "Console" tab

### 2. Run Inspector

#### Test All Methods (Recommended)

```javascript
__whatsappInspector.inspectAll()
```

This will:

- Test all 4 extraction methods
- Display detailed results for each method
- Show a summary with recommended approaches
- Log the current chat's JID, name, and type (if found)

#### Test Individual Methods

```javascript
// Test only window.Store method
__whatsappInspector.testMethod('store')

// Test only React Fiber method
__whatsappInspector.testMethod('fiber')

// Test only Webpack modules method
__whatsappInspector.testMethod('webpack')

// Test only DOM parsing method
__whatsappInspector.testMethod('dom')
```

#### Get Current Chat (Quick Test)

```javascript
__whatsappInspector.getCurrentChat()
```

This attempts to retrieve the current chat using the best available method.

### 3. Interpret Results

#### Success Output Example

```
================================================================================
WhatsApp Inspector - Testing All Access Methods
================================================================================

📊 Method 1: window.Store
----------------------------------------
✓ window.Store exists
  Available modules: ['Chat', 'Msg', 'Contact', 'Cmd', 'Conn', ...]
✓ Active chat found:
  JID: 1234567890@c.us
  Name: John Doe
  Type: individual
✅ SUCCESS

⚛️  Method 2: React Fiber
----------------------------------------
✓ React Fiber found: __reactFiber$...
❌ FAILED: Fiber traversal not yet implemented

📦 Method 3: Webpack Modules
----------------------------------------
❌ FAILED: Webpack module extraction not implemented

🌳 Method 4: DOM Parsing
----------------------------------------
✓ Chat header found
  Contact name: John Doe
✅ SUCCESS

================================================================================
Summary
================================================================================

Results:
  ✅ window.Store
      JID: 1234567890@c.us
      Name: John Doe
      Type: individual
  ✅ DOM Parsing
      Name: John Doe

✅ Recommended approach:
   Primary: window.Store
   Fallback: DOM Parsing
```

### 4. What to Test

Please test the inspector in these scenarios:

#### Scenario 1: Individual Chat (Mobile Number)

1. Open a 1:1 chat with a contact that has a phone number
2. Run `__whatsappInspector.inspectAll()`
3. Copy the console output (including any errors)

#### Scenario 2: Group Chat

1. Open a group chat
2. Run `__whatsappInspector.inspectAll()`
3. Copy the console output

#### Scenario 3: No Chat Open

1. Click on WhatsApp's main area (not in any chat)
2. Run `__whatsappInspector.inspectAll()`
3. Copy the console output

#### Scenario 4: Business Contact

1. If you have any business contacts, open a chat with them
2. Run `__whatsappInspector.inspectAll()`
3. Copy the console output

### 5. Report Back

Please provide:

1. The console output from each scenario (you can copy/paste)
2. Which methods showed `✅ SUCCESS`
3. Any errors or warnings you see
4. The recommended approach shown in the summary

## Expected Behavior

The inspector will:

- Show which methods work and which don't
- Extract JID (Jabber ID) in format: `1234567890@c.us` (individual) or `123456789@g.us` (group)
- Extract contact/group name
- Identify chat type (individual vs group)
- Provide clear recommendations

## Troubleshooting

### Inspector Not Found

```
Error: __whatsappInspector is not defined
```

**Solution:** Make sure you built with `npm run dev` (not `npm run build`) and reloaded the extension.

### No Methods Work

```
⚠️  No working methods found!
```

**Solution:**

1. Ensure you're on web.whatsapp.com (not wa.me or other WhatsApp domains)
2. Wait for WhatsApp to fully load (you should see your chat list)
3. **Open a chat** before running the inspector
4. Try refreshing the page and reloading the extension

### All Methods Show "Not Implemented"

This is expected for some methods (React Fiber, Webpack) - they are placeholders. We're primarily interested in:

- `window.Store` - Most important
- `DOM Parsing` - Fallback for contact name

## Next Steps

After testing, we'll:

1. Analyze which methods work reliably
2. Implement the `JidExtractor` class using the working methods
3. Add retry logic and fallbacks based on what we learned
4. Remove the inspector code (dev mode only)
