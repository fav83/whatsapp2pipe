# WhatsApp Contact Extraction - Module Raid Approach

## Overview

The Module Raid approach extracts contact information by intercepting WhatsApp Web's internal JavaScript modules. This method accesses WhatsApp's internal data structures directly, providing reliable and formatted contact data.

## How It Works

### 1. Module Detection

WhatsApp Web uses different module loading systems depending on version:
- **Legacy versions**: Use webpack chunks accessible via `webpackChunkwhatsapp_web_client`
- **Modern versions (v2.3000+)**: Use Comet architecture with modules in `require('__debug').modulesMap`

The inspector detects which system is available and adapts accordingly.

### 2. Module Raid Initialization

```typescript
// Detect webpack/module system
const debugInfo = (window as any).require?.('__debug')
const modulesMap = debugInfo?.modulesMap

// For Comet (v2.3000+)
if (modulesMap) {
  const moduleKeys = Object.keys(modulesMap)
  // Lazy loading: modules loaded on-demand when accessed
}

// For legacy webpack
const webpackChunk = (window as any).webpackChunkwhatsapp_web_client
if (webpackChunk) {
  // Module raid captures all loaded modules
}
```

### 3. Chat Module Discovery

The module raid searches for WhatsApp's internal chat store:

```typescript
// Search for module containing active chat
for (const moduleId of moduleKeys) {
  const module = modulesMap[moduleId]
  const moduleExports = module?.defaultExport

  // Look for chat-related modules
  if (moduleExports?._models) {
    // Found chat store
  }
}
```

### 4. Active Chat Extraction

Once the chat module is found:

```typescript
const activeChat = chatStore._models.find(chat => chat.__x_isActive)
if (activeChat) {
  const jid = activeChat.id._serialized  // e.g., "34679297297@c.us"
  const contact = activeChat.contact
}
```

### 5. Contact Data Extraction

Extract contact information from the active chat:

```typescript
// Extract JID (unique identifier)
const jid = activeChat.id._serialized  // "34679297297@c.us"

// Extract phone number with E.164 format (+prefix)
const rawJid = jid.split('@')[0]  // "34679297297"
const phone = '+' + rawJid  // "+34679297297"

// Extract name (prioritize pushname over other fields)
const name = contact?.__x_pushname ||
             contact?.__x_name ||
             contact?.__x_formattedName ||
             contact?.__x_displayName ||
             'Unknown'

// Determine chat type
const isGroup = jid.endsWith('@g.us')
const chatType = isGroup ? 'group' : 'individual'
```

## What Works ✅

### 1. **Phone Number Extraction**
- ✅ Extracts phone numbers in E.164 format (with '+' prefix)
- ✅ Works for individual chats
- ✅ Compact format: `+34679297297` (no spaces)
- ✅ Reliable - directly from WhatsApp's internal data

**Example Output:**
```
Phone: +34679297297
JID: 34679297297@c.us
```

### 2. **Contact Name Extraction**
- ✅ Extracts contact display name
- ✅ Prioritizes `__x_pushname` (user's saved name in your contacts)
- ✅ Fallback chain: pushname → name → formattedName → displayName
- ✅ Reliable for contacts saved in phone

**Example Output:**
```
Name: Massimo Magnani
```

### 3. **Chat Type Detection**
- ✅ Accurately distinguishes individual vs group chats
- ✅ Based on JID suffix: `@c.us` (individual) vs `@g.us` (group)

**Example Output:**
```
Type: individual
```

### 4. **WhatsApp Version Compatibility**
- ✅ Works on WhatsApp v2.3000+ (Comet architecture)
- ✅ Detects version: `2.3000.1028950586`
- ✅ Adapts to WhatsApp's module loading system

### 5. **Performance**
- ✅ Fast - no DOM parsing overhead
- ✅ No visual side effects (doesn't open panels)
- ✅ No race conditions with React rendering

## What Doesn't Work ❌

### 1. **Unsaved Contacts**
- ❌ If contact is not saved in phone, `__x_pushname` may return generic values
- ⚠️ Fallback to `__x_name` may return "Unknown" for unsaved contacts
- **Impact**: Name extraction less reliable for unknown numbers

### 2. **Group Chat Details**
- ⚠️ Group JID extracted correctly, but group details limited
- ❌ No participant list extraction
- ❌ No group admin information
- **Impact**: Minimal - groups identified correctly, but limited metadata

### 3. **Formatted Phone Numbers**
- ⚠️ Phone numbers are compact without spaces/formatting
- **Output**: `+34679297297` (compact)
- **User sees**: `+34 679 29 72 97` (formatted in WhatsApp UI)
- **Impact**: Minor - numbers are correct, just formatting differs

### 4. **WhatsApp Internal Changes**
- ⚠️ Relies on WhatsApp's internal module structure
- ❌ WhatsApp updates could change module structure
- ❌ No official API - reverse-engineered approach
- **Mitigation**: Module detection adapts to version changes

### 5. **Module Loading Timing**
- ⚠️ Comet uses lazy loading - modules load on-demand
- ❌ Chat module might not be loaded until first interaction
- **Impact**: Small delay (6-7 seconds) before module raid ready
- **Mitigation**: Extension waits for webpack chunks to load

## Technical Details

### JID Format

WhatsApp uses JID (Jabber ID) format internally:
- **Individual**: `[country_code][phone_number]@c.us`
  - Example: `34679297297@c.us`
- **Group**: `[group_id]@g.us`
  - Example: `120363012345678@g.us`

### Contact Object Structure

```typescript
interface Contact {
  __x_pushname?: string      // User's saved name (most reliable)
  __x_name?: string           // WhatsApp name
  __x_formattedName?: string  // Formatted display name
  __x_displayName?: string    // Display name
  id: {
    _serialized: string       // JID
  }
}
```

### Active Chat Detection

```typescript
interface Chat {
  __x_isActive: boolean       // True if currently viewing this chat
  id: {
    _serialized: string       // JID of the chat
  }
  contact: Contact            // Contact object
}
```

## Reliability Assessment

| Feature | Reliability | Notes |
|---------|-------------|-------|
| Phone extraction | **High** | Direct from JID, always available |
| Name extraction | **Medium-High** | Good for saved contacts, may show "Unknown" for unsaved |
| Chat type detection | **High** | Based on JID suffix, very reliable |
| Version compatibility | **Medium** | Adapts to Comet, but WhatsApp changes could break |
| Performance | **High** | Fast, no DOM overhead |

## Comparison to Alternatives

### vs DOM Parsing
- **Faster**: No need to open panels or wait for React rendering
- **Cleaner**: No visual side effects
- **More reliable**: Direct data access, not affected by UI changes
- **Less formatted**: Numbers are compact, not formatted with spaces

### vs Official API
- **No official API exists** for WhatsApp Web extensions
- Module raid is the only programmatic approach
- Reverse-engineered, subject to changes

## Recommendations

1. **Use as primary method** - Most reliable for phone and basic contact info
2. **Accept compact phone format** - Numbers are correct, just not space-formatted
3. **Handle "Unknown" names gracefully** - Fallback logic in place, but some contacts may not have names
4. **Monitor WhatsApp updates** - Watch for version changes that could affect module structure
5. **Future enhancement**: Consider DOM parsing as fallback for formatted phone numbers (see [WhatsApp-Contact-Extraction-DOM-Parsing.md](WhatsApp-Contact-Extraction-DOM-Parsing.md))

## Implementation Files

- **Main Logic**: [Extension/src/content-script/utils/WhatsAppInspector.ts](../../Extension/src/content-script/utils/WhatsAppInspector.ts)
- **Inspector Entry**: [Extension/src/content-script/inspector-main.ts](../../Extension/src/content-script/inspector-main.ts)

## Version History

- **v0.29.0-v0.30.0**: Module raid working reliably for phone (+prefix), name, and chat type
- **v0.18.0**: Added '+' prefix to phone numbers for E.164 format
- **v0.18.0**: Fixed name extraction priority (__x_pushname first)
