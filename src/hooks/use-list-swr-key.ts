import { useSearchParams } from 'react-router';

// ----------------------------------------------------------------------

/**
 * Build a SWR cache key for list data requests.
 *
 * In the merchant admin, country and merchant are determined by the logged-in
 * user (via `userInfo.merchantId` in the HTTP interceptor), so no selection
 * is needed. The key is simply the provided segments plus a refresh token.
 *
 * @example
 * ```ts
 * const params = useSearchParamsObject(FIELD_KEYS);
 * const key = useListSWRKey('orders', 'receive-list', params);
 * // → ['orders', 'receive-list', params, '1718000000000']
 * ```
 */
export function useListSWRKey(...segments: unknown[]) {
  const [searchParams] = useSearchParams();

  // Read _t so clicking "search" always busts the SWR cache
  const refreshToken = searchParams.get('_t');

  return [...segments, refreshToken];
}
