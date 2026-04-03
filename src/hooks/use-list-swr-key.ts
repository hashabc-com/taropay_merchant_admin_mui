import { useDeferredValue } from 'react';

import { useCountryStore } from 'src/stores/country-store';
import { useMerchantStore } from 'src/stores/merchant-store';

// ----------------------------------------------------------------------

/**
 * Build a SWR cache key that includes country & merchant context.
 *
 * Returns `null` when no country is selected (skip fetch).
 * Appends `selectedCountry.code` and `selectedMerchant.appid` to the key
 * so that switching country / merchant automatically triggers a refetch
 * without duplicating requests.
 *
 * ## Why `useDeferredValue`?
 *
 * Zustand uses `useSyncExternalStore`, which forces React to fall back to
 * **urgent (synchronous) rendering** even inside `startTransition` — this is
 * React 18's tearing prevention mechanism. Meanwhile `setSearchParams`
 * stays in a low-priority transition. The priority mismatch causes two
 * separate renders → two SWR key changes → two requests.
 *
 * `useDeferredValue` keeps returning the **old** Zustand value during the
 * urgent render (SWR key unchanged → no request), then updates in a
 * background render that batches with the URL transition → single key
 * change → single request.
 *
 * @example
 * ```ts
 * const params = useSearchParamsObject(FIELD_KEYS);
 * const key = useListSWRKey('orders', 'receive-list', params);
 * // → ['orders', 'receive-list', params, 'NG', 'app123'] | null
 * ```
 */
export function useListSWRKey(...segments: unknown[]) {
  const countryCode = useCountryStore((s) => s.selectedCountry?.code);
  const merchantAppid = useMerchantStore((s) => s.selectedMerchant?.appid);

  // Defer Zustand values so they update in the same render pass as URL params,
  // avoiding the urgent-render-before-transition-settles double-request issue.
  const deferredCountry = useDeferredValue(countryCode);
  const deferredMerchant = useDeferredValue(merchantAppid);

  return deferredCountry ? [...segments, deferredCountry, deferredMerchant] : null;
}
