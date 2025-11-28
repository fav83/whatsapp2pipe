# Spec-140: Feature Flags System

**Status:** Complete
**Created:** 2025-01-28
**Completed:** 2025-01-28

## Overview

This specification defines a lightweight feature flags system for gradual rollout of new features. Flags are simple on/off toggles stored in backend App Settings and delivered to the extension via the existing `/api/config` endpoint.

## Goals

1. **Simple global toggles** — Flags are either ON or OFF for all users (no percentage rollouts in v1)
2. **Backend-controlled** — Flags defined in Azure App Settings, changeable without code deployment
3. **Extension-aware** — Extension fetches flags on startup and conditionally renders UI
4. **Resilient** — Cached flags provide fallback when backend is unreachable
5. **Extensible** — Data model can evolve to support targeting/A/B testing in the future

## Non-Goals (v1)

- Percentage-based rollouts
- User or company targeting
- A/B testing with analytics
- Real-time flag updates (requires page refresh)

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Feature Flags Flow                          │
└─────────────────────────────────────────────────────────────────┘

1. Backend App Settings
   FeatureFlags__enableDeals=true
   FeatureFlags__someFeature=false
       ↓
2. FeatureFlagsSettings class binds settings
       ↓
3. GetConfigFunction includes flags in response
   GET /api/config → { ..., featureFlags: { enableDeals: true } }
       ↓
4. Extension service worker receives config
       ↓
5. Flags stored in:
   - React state (for UI reactivity)
   - chrome.storage.local (for persistence/fallback)
       ↓
6. Components check flags before rendering
   {isEnabled('enableDeals') && <DealSection />}
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend Storage** | Azure App Settings | Flag definitions |
| **Backend Binding** | .NET Configuration | Settings class binding |
| **API Delivery** | `/api/config` endpoint | Flags included in response |
| **Extension Storage** | React state + chrome.storage.local | UI reactivity + persistence |
| **Access Pattern** | `useFeatureFlags()` hook | Type-safe flag checking |

## Implementation Design

### Part 1: Backend Implementation

#### 1.1 App Settings Structure

Flags use the `FeatureFlags` prefix with double-underscore notation (matching existing patterns like `Pipedrive__ClientId`):

**File:** `Backend/WhatsApp2Pipe.Api/local.settings.json`

```json
{
  "Values": {
    "FeatureFlags__enableDeals": "true"
  }
}
```

**Azure App Settings (Production):**
```
FeatureFlags__enableDeals = true
```

#### 1.2 FeatureFlagsSettings Class

**File:** `Backend/WhatsApp2Pipe.Api/Configuration/FeatureFlagsSettings.cs`

```csharp
namespace WhatsApp2Pipe.Api.Configuration;

/// <summary>
/// Configuration class for feature flags.
/// Binds to app settings with FeatureFlags__ prefix.
/// </summary>
public class FeatureFlagsSettings
{
    /// <summary>
    /// Controls visibility of all deal-related functionality in the extension.
    /// When false, deal UI is completely hidden from users.
    /// Defaults to false - must be explicitly enabled in App Settings.
    /// </summary>
    public bool EnableDeals { get; set; } = false;

    // Future flags added here as properties
}
```

**Design Notes:**
- Each flag is a boolean property defaulting to `false` (opt-in)
- Features must be explicitly enabled in App Settings
- Property names use PascalCase (C# convention), mapped from snake_case in settings

#### 1.3 Register Settings in DI

**File:** `Backend/WhatsApp2Pipe.Api/Program.cs`

Add configuration binding alongside existing settings:

```csharp
// Existing settings
services.Configure<PipedriveSettings>(
    context.Configuration.GetSection("Pipedrive"));

// Feature flags
services.Configure<FeatureFlagsSettings>(
    context.Configuration.GetSection("FeatureFlags"));
```

#### 1.4 Update GetConfigFunction

**File:** `Backend/WhatsApp2Pipe.Api/Functions/GetConfigFunction.cs`

Inject `FeatureFlagsSettings` and include in response:

```csharp
public class GetConfigFunction
{
    private readonly IOptions<FeatureFlagsSettings> featureFlagsSettings;

    public GetConfigFunction(
        // ... existing dependencies
        IOptions<FeatureFlagsSettings> featureFlagsSettings)
    {
        this.featureFlagsSettings = featureFlagsSettings;
    }

    [Function("GetConfig")]
    public async Task<HttpResponseData> Run(...)
    {
        // ... existing logic

        var config = new UserConfig
        {
            Message = configMessage,
            Pipelines = pipelines,
            Stages = stages,
            FeatureFlags = new FeatureFlagsDto
            {
                EnableDeals = featureFlagsSettings.Value.EnableDeals
            }
        };

        // ... return response
    }
}
```

#### 1.5 Response DTOs

**File:** `Backend/WhatsApp2Pipe.Api/Models/FeatureFlagsDto.cs`

```csharp
namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Feature flags returned to the extension.
/// </summary>
public class FeatureFlagsDto
{
    public bool EnableDeals { get; set; }
}
```

**Updated UserConfig:**

```csharp
public class UserConfig
{
    public string? Message { get; set; }
    public List<Pipeline> Pipelines { get; set; } = new();
    public List<Stage> Stages { get; set; } = new();
    public FeatureFlagsDto FeatureFlags { get; set; } = new();
}
```

### Part 2: Extension Implementation

#### 2.1 Type Definitions

**File:** `Extension/src/types/featureFlags.ts`

```typescript
/**
 * Feature flags returned from the backend.
 * All flags default to false if missing.
 */
export type FeatureFlags = {
  enableDeals: boolean;
  // Future flags added here
};

/**
 * Default values for all feature flags.
 * Used when backend is unreachable or flags are missing.
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableDeals: false,
};
```

#### 2.2 Update Config Types

**File:** `Extension/src/types/config.ts` (or wherever UserConfig is defined)

```typescript
import { FeatureFlags } from './featureFlags';

export interface UserConfig {
  message: string | null;
  pipelines: Pipeline[];
  stages: Stage[];
  featureFlags: FeatureFlags;
}
```

#### 2.3 Chrome Storage Integration

**File:** `Extension/src/service-worker/index.ts`

When config is received, persist feature flags to storage:

```typescript
// In CONFIG_GET handler, after receiving response
if (response.featureFlags) {
  await chrome.storage.local.set({
    featureFlags: response.featureFlags
  });
}
```

#### 2.4 useFeatureFlags Hook

**File:** `Extension/src/content-script/hooks/useFeatureFlags.ts`

```typescript
import { useCallback } from 'react';
import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from '@/types/featureFlags';

interface UseFeatureFlagsResult {
  flags: FeatureFlags;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
}

/**
 * Hook for accessing feature flags in components.
 *
 * @param flags - Feature flags from config (passed from parent)
 * @returns Object with flags and isEnabled helper
 *
 * @example
 * const { isEnabled } = useFeatureFlags(config.featureFlags);
 * if (isEnabled('enableDeals')) {
 *   // render deal UI
 * }
 */
export function useFeatureFlags(
  flags: FeatureFlags | undefined
): UseFeatureFlagsResult {
  const resolvedFlags = flags ?? DEFAULT_FEATURE_FLAGS;

  const isEnabled = useCallback(
    (flag: keyof FeatureFlags): boolean => {
      return resolvedFlags[flag] ?? false;
    },
    [resolvedFlags]
  );

  return {
    flags: resolvedFlags,
    isEnabled,
  };
}
```

#### 2.5 Fallback Loading from Storage

**File:** `Extension/src/content-script/App.tsx` (or config fetching logic)

When fetching config fails, attempt to load cached flags:

```typescript
async function loadCachedFeatureFlags(): Promise<FeatureFlags> {
  try {
    const result = await chrome.storage.local.get('featureFlags');
    return result.featureFlags ?? DEFAULT_FEATURE_FLAGS;
  } catch {
    return DEFAULT_FEATURE_FLAGS;
  }
}

// In config fetch error handler:
if (fetchError) {
  const cachedFlags = await loadCachedFeatureFlags();
  setFeatureFlags(cachedFlags);
}
```

#### 2.6 Component Usage

**Pattern: Conditional Rendering**

```tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

function SidebarContent({ config }: Props) {
  const { isEnabled } = useFeatureFlags(config?.featureFlags);

  return (
    <div>
      {/* Always visible */}
      <PersonSection person={person} />

      {/* Only visible when deals are enabled */}
      {isEnabled('enableDeals') && (
        <DealsSection
          deals={deals}
          onCreateDeal={handleCreateDeal}
        />
      )}
    </div>
  );
}
```

**Pattern: Early Return**

```tsx
function DealsSection({ deals }: Props) {
  const { isEnabled } = useFeatureFlags(config?.featureFlags);

  // Hide entire component when disabled
  if (!isEnabled('enableDeals')) {
    return null;
  }

  return (
    <div className="deals-section">
      {/* Deal UI */}
    </div>
  );
}
```

### Part 3: The `enableDeals` Flag

#### Purpose

Controls visibility of all deal-related functionality. When disabled, users see the extension as a contact/person management tool only.

#### UI Elements Affected

| Element | Location | Behavior When Disabled |
|---------|----------|------------------------|
| Deal creation button | Person matched card | Hidden |
| Deal list section | Sidebar | Hidden |
| Pipeline/stage selectors | Deal forms | Hidden |
| Deal status indicators | Various | Hidden |
| "Save to Deal" notes option | Notes UI | Hidden |

#### Implementation Strategy

Hide at the highest practical level to minimize conditional checks:

```tsx
// Good: Hide parent component
{isEnabled('enableDeals') && <DealsSection />}

// Avoid: Many scattered checks
{isEnabled('enableDeals') && <CreateDealButton />}
{isEnabled('enableDeals') && <DealList />}
{isEnabled('enableDeals') && <DealStatusBadge />}
```

#### Default Value

`enableDeals` defaults to `false` in the backend code (opt-in). To enable deals, explicitly set `FeatureFlags__EnableDeals=true` in App Settings. This ensures new deployments don't accidentally expose unfinished features.

## Adding New Flags

When a new feature needs a flag:

1. **Backend:**
   - Add property to `FeatureFlagsSettings.cs` with default value
   - Add property to `FeatureFlagsDto.cs`
   - Map in `GetConfigFunction.cs`
   - Add to App Settings (disabled by default for safety)

2. **Extension:**
   - Add property to `FeatureFlags` type
   - Add default in `DEFAULT_FEATURE_FLAGS`
   - Wrap relevant components with `isEnabled()` checks

3. **Enable:**
   - Set flag to `true` in Azure App Settings when ready
   - Users see changes on next page refresh

### Naming Convention

| Pattern | Example | Use Case |
|---------|---------|----------|
| `enable[Feature]` | `enableDeals`, `enableBulkExport` | Features that can be turned on/off |
| `show[Element]` | `showDevBanner`, `showBetaLabel` | UI elements |

## Testing Strategy

### Backend Testing

1. **Unit test** `FeatureFlagsSettings` binding from configuration
2. **Integration test** `/api/config` response includes `featureFlags`
3. **Verify** missing settings use default values

### Extension Testing

1. **Unit test** `useFeatureFlags` hook with various inputs
2. **Unit test** `isEnabled()` returns `false` for missing flags
3. **Integration test** components hide when flags are disabled
4. **Test** fallback loading from chrome.storage when backend is unreachable

### Manual Testing Checklist

- [ ] Flag `true` in App Settings → feature visible in extension
- [ ] Flag `false` in App Settings → feature hidden in extension
- [ ] Flag missing → uses default value (feature visible/hidden based on default)
- [ ] Backend unreachable → uses cached flags from last successful fetch
- [ ] No cache exists → all flags default to `false`
- [ ] Page refresh → picks up flag changes from backend

## Security Considerations

- Feature flags are not sensitive data — safe to return in API response
- Flags control UI visibility only — backend should still validate permissions
- Hidden features should not be accessible via direct API calls when disabled

## Future Extensibility

When percentage rollouts or A/B testing are needed, the structure can evolve:

**Current (v1):**
```json
{
  "featureFlags": {
    "enableDeals": true
  }
}
```

**Future (v2):**
```json
{
  "featureFlags": {
    "enableDeals": {
      "enabled": true,
      "variant": "A",
      "percentage": 50
    }
  }
}
```

The extension hook can be updated to handle both formats with backward compatibility.

## Implementation Checklist

### Backend
- [x] Create `FeatureFlagsSettings.cs` configuration class
- [x] Create `FeatureFlagsDto.cs` response model
- [x] Register settings in `Program.cs` DI container
- [x] Update `UserConfig` to include `FeatureFlags` property
- [x] Inject and map flags in `GetConfigFunction.cs`
- [x] Add `FeatureFlags__enableDeals=true` to `local.settings.json`
- [x] Add flag to Azure App Settings (production)

### Extension
- [x] Create `FeatureFlags` type definition
- [x] Create `DEFAULT_FEATURE_FLAGS` constant
- [x] Update `UserConfig` type to include `featureFlags`
- [x] Persist flags to `chrome.storage.local` on config fetch
- [x] Create `useFeatureFlags()` hook
- [x] Implement fallback loading from storage
- [x] Wrap deal-related UI with `isEnabled('enableDeals')` checks

### Testing
- [x] Backend unit tests for settings binding
- [x] Backend integration test for `/api/config` response
- [x] Extension unit tests for `useFeatureFlags` hook
- [x] Extension integration tests for conditional rendering
- [x] Manual end-to-end testing

## References

- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md) — Extension configuration patterns
- [Spec-106b: Extension Pipedrive API Integration](Spec-106b-Extension-Pipedrive-API-Integration.md) — Config fetching pattern
- [Backend CLAUDE.md](../../Backend/CLAUDE.md) — C# coding conventions
