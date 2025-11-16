# Demo Phone Number Override

**Purpose:** Replace real phone numbers with demo number `+12125550104` for demo/recording purposes.

## Files to Modify

### 1. Extension/src/content-script/utils/WhatsAppInspector.ts

**Location:** Line 237 (in `testWebpackModuleRaid()` method)

**Change:**
```typescript
// ORIGINAL (production):
const phone = '+' + (jid.includes('@') ? jid.split('@')[0] : jid)

// DEMO (temporary):
const phone = '+12125550104' // Original: '+' + (jid.includes('@') ? jid.split('@')[0] : jid)
```

---

### 2. Extension/src/content-script/whatsapp-integration/chat-monitor-main.ts

**Location 1:** Line 112 (in `detectCurrentChat()` - group participants)

**Change:**
```typescript
// ORIGINAL (production):
phone: '+' + participant.__x_contact.__x_id.user,

// DEMO (temporary):
phone: '+12125550104', // Original: '+' + participant.__x_contact.__x_id.user,
```

**Location 2:** Line 132 (in `detectCurrentChat()` - individual chat)

**Change:**
```typescript
// ORIGINAL (production):
const phone = '+' + activeChat.__x_contact.__x_id.user

// DEMO (temporary):
const phone = '+12125550104' // Original: '+' + activeChat.__x_contact.__x_id.user
```

---

## Quick Apply/Revert

**To Enable Demo Mode:**
Replace the 3 phone extraction lines with hardcoded `'+12125550104'`

**To Revert to Production:**
Restore the original phone extraction logic from inline comments

**Demo Number:** `+12125550104` (New York area code, safe for demos)
