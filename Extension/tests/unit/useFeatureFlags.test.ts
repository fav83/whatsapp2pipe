/**
 * useFeatureFlags Hook Unit Tests
 *
 * Tests feature flag access and isEnabled helper function.
 */

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFeatureFlags } from '../../src/content-script/hooks/useFeatureFlags'
import { DEFAULT_FEATURE_FLAGS } from '../../src/types/featureFlags'
import type { FeatureFlags } from '../../src/types/featureFlags'

describe('useFeatureFlags', () => {
  describe('with provided flags', () => {
    it('returns the provided flags', () => {
      const flags: FeatureFlags = { enableDeals: true }

      const { result } = renderHook(() => useFeatureFlags(flags))

      expect(result.current.flags).toEqual(flags)
    })

    it('isEnabled returns true when flag is enabled', () => {
      const flags: FeatureFlags = { enableDeals: true }

      const { result } = renderHook(() => useFeatureFlags(flags))

      expect(result.current.isEnabled('enableDeals')).toBe(true)
    })

    it('isEnabled returns false when flag is disabled', () => {
      const flags: FeatureFlags = { enableDeals: false }

      const { result } = renderHook(() => useFeatureFlags(flags))

      expect(result.current.isEnabled('enableDeals')).toBe(false)
    })
  })

  describe('with undefined flags', () => {
    it('returns DEFAULT_FEATURE_FLAGS when flags are undefined', () => {
      const { result } = renderHook(() => useFeatureFlags(undefined))

      expect(result.current.flags).toEqual(DEFAULT_FEATURE_FLAGS)
    })

    it('isEnabled returns false for enableDeals (default behavior)', () => {
      const { result } = renderHook(() => useFeatureFlags(undefined))

      // DEFAULT_FEATURE_FLAGS has enableDeals: false
      expect(result.current.isEnabled('enableDeals')).toBe(false)
    })
  })

  describe('isEnabled memoization', () => {
    it('returns stable isEnabled function reference', () => {
      const flags: FeatureFlags = { enableDeals: true }

      const { result, rerender } = renderHook(() => useFeatureFlags(flags))
      const firstIsEnabled = result.current.isEnabled

      rerender()
      const secondIsEnabled = result.current.isEnabled

      expect(firstIsEnabled).toBe(secondIsEnabled)
    })

    it('updates isEnabled when flags change', () => {
      let flags: FeatureFlags = { enableDeals: true }

      const { result, rerender } = renderHook(() => useFeatureFlags(flags))

      expect(result.current.isEnabled('enableDeals')).toBe(true)

      flags = { enableDeals: false }
      rerender()

      expect(result.current.isEnabled('enableDeals')).toBe(false)
    })
  })
})

describe('DEFAULT_FEATURE_FLAGS', () => {
  it('has enableDeals set to false', () => {
    expect(DEFAULT_FEATURE_FLAGS.enableDeals).toBe(false)
  })
})
