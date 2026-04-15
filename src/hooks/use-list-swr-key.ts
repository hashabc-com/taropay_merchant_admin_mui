import { useSearchParams } from 'react-router';

import { useMerchantStore } from 'src/stores/merchant-store';

// ----------------------------------------------------------------------

/**
 * Build a SWR cache key for list data requests.
 *
 * Includes the selected merchant's `appid` so that switching merchants
 * automatically invalidates all SWR caches and triggers refetch.
 *
 * @example
 * ```ts
 * const params = useSearchParamsObject(FIELD_KEYS);
 * const key = useListSWRKey('orders', 'receive-list', params);
 * // → ['orders', 'receive-list', params, 'CJdVOvutS5qD2', '1718000000000']
 * ```
 */
export function useListSWRKey(...segments: unknown[]) {
  const [searchParams] = useSearchParams();
  const merchantAppid = useMerchantStore((s) => s.selectedMerchant?.appid);

  // Read _t so clicking "search" always busts the SWR cache
  const refreshToken = searchParams.get('_t');

  return [...segments, merchantAppid, refreshToken];
}
