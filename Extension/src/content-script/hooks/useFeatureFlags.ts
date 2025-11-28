import { useCallback } from 'react'
import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from '@/types/featureFlags'

interface UseFeatureFlagsResult {
  flags: FeatureFlags
  isEnabled: (flag: keyof FeatureFlags) => boolean
}

/**
 * Hook for accessing feature flags in components.
 *
 * @param flags - Feature flags from config (passed from parent)
 * @returns Object with flags and isEnabled helper
 *
 * @example
 * const { isEnabled } = useFeatureFlags(config.featureFlags)
 * if (isEnabled('enableDeals')) {
 *   // render deal UI
 * }
 */
export function useFeatureFlags(flags: FeatureFlags | undefined): UseFeatureFlagsResult {
  const resolvedFlags = flags ?? DEFAULT_FEATURE_FLAGS

  const isEnabled = useCallback(
    (flag: keyof FeatureFlags): boolean => {
      return resolvedFlags[flag] ?? false
    },
    [resolvedFlags]
  )

  return {
    flags: resolvedFlags,
    isEnabled,
  }
}
