// ----------------------------------------------------------------------

/**
 * Build a SWR cache key for list data requests.
 *
 * In the merchant admin, country and merchant are determined by the logged-in
 * user (via `userInfo.merchantId` in the HTTP interceptor), so no selection
 * is needed. The key is simply the provided segments.
 *
 * @example
 * ```ts
 * const params = useSearchParamsObject(FIELD_KEYS);
 * const key = useListSWRKey('orders', 'receive-list', params);
 * // → ['orders', 'receive-list', params]
 * ```
 */
export function useListSWRKey(...segments: unknown[]) {
  return segments;
}
