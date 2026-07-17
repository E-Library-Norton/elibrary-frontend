// hooks/useABTest.ts
// Lightweight client-side A/B testing hook.
// Assigns visitors to a variant (persisted in localStorage) and tracks impressions.
// ──────────────────────────────────────────────────────────────────────────────
// Usage:
//   const variant = useABTest('hero-cta', ['control', 'new-cta', 'minimal']);
//   // variant === 'control' | 'new-cta' | 'minimal'  (stable per visitor)
// ──────────────────────────────────────────────────────────────────────────────

'use client';

import { useEffect, useMemo } from 'react';

const AB_STORAGE_PREFIX = 'ab_test_';

/**
 * Deterministically assign a visitor to an A/B test variant.
 * - The variant is persisted in localStorage so repeat visits see the same experience.
 * - Fires a `CustomEvent('ab_impression')` on first mount so analytics can pick it up.
 *
 * @param experimentId  Unique experiment name (e.g. 'hero-layout-v2')
 * @param variants      Array of variant names; first is typically 'control'
 * @returns             The variant string assigned to this visitor
 */
export function useABTest<T extends string>(
  experimentId: string,
  variants: T[],
): T {
  const variant = useMemo(() => {
    if (typeof window === 'undefined' || variants.length === 0) {
      return variants[0]; // SSR fallback → control
    }

    const key = `${AB_STORAGE_PREFIX}${experimentId}`;

    // Check for existing assignment
    try {
      const stored = localStorage.getItem(key);
      if (stored && variants.includes(stored as T)) {
        return stored as T;
      }
    } catch {
      // Private browsing — fall through to random assignment
    }

    // Random assignment
    const chosen = variants[Math.floor(Math.random() * variants.length)];

    try {
      localStorage.setItem(key, chosen);
    } catch {
      // Ignore storage errors
    }

    return chosen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  // Fire impression event (once per mount)
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('ab_impression', {
        detail: { experimentId, variant },
      }),
    );
  }, [experimentId, variant]);

  return variant;
}

/**
 * Track an A/B conversion event (e.g. button click, sign-up).
 * Call this from onClick handlers or effect hooks.
 */
export function trackABConversion(
  experimentId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  if (typeof window === 'undefined') return;

  const key = `${AB_STORAGE_PREFIX}${experimentId}`;
  let variant = 'unknown';
  try {
    variant = localStorage.getItem(key) ?? 'unknown';
  } catch {
    // ignore
  }

  window.dispatchEvent(
    new CustomEvent('ab_conversion', {
      detail: { experimentId, variant, action, ...metadata },
    }),
  );

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[A/B] ${experimentId} | variant=${variant} | action=${action}`, metadata);
  }
}

/**
 * Helper: Get all active experiments for the current visitor.
 * Useful for including in analytics payloads.
 */
export function getActiveExperiments(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const experiments: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(AB_STORAGE_PREFIX)) {
        const name = key.slice(AB_STORAGE_PREFIX.length);
        experiments[name] = localStorage.getItem(key) ?? 'unknown';
      }
    }
  } catch {
    // ignore
  }
  return experiments;
}
