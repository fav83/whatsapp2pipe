/**
 * Feature flags returned from the backend.
 * All flags default to false if missing.
 */
export type FeatureFlags = {
  enableDeals: boolean
  // Future flags added here
}

/**
 * Default values for all feature flags.
 * Used when backend is unreachable or flags are missing.
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableDeals: false,
}
