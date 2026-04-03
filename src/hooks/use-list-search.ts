import { useSearchParams } from 'react-router';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

/**
 * Read URL search params as a typed object.
 *
 * Used by SWR hooks to build query params **from the same field-key array**
 * that the search component declares. `pageNum` and `pageSize` are always included.
 *
 * @example
 * ```ts
 * const params = useSearchParamsObject(FIELD_KEYS);
 * // → { pageNum: 1, pageSize: 10, channel: undefined, startTime: undefined, … }
 * ```
 */
export function useSearchParamsObject<K extends string>(
  fieldKeys: readonly K[]
): Record<K | 'pageNum' | 'pageSize', string | number | undefined> {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const result = {} as Record<K | 'pageNum' | 'pageSize', string | number | undefined>;
    result.pageNum = Number(searchParams.get('pageNum')) || 1;
    result.pageSize = Number(searchParams.get('pageSize')) || 10;
    for (const key of fieldKeys) {
      (result as any)[key] = searchParams.get(key) || undefined;
    }
    return result;
  }, [searchParams, fieldKeys]);
}

/**
 * Reusable list-search params hook.
 *
 * Pass a **stable** array of field keys (define it outside the component or
 * with `as const`). The hook owns:
 *  - `values`       – controlled field values (local state)
 *  - `setField`     – update a single field
 *  - `hasFilters`   – whether any field is non-empty
 *  - `handleSearch` – write local values → URL (resets pageNum to 1)
 *  - `handleReset`  – clear all fields + URL (keeps pageSize)
 *  - `handleKeyDown`– call handleSearch on Enter (bind to text inputs)
 *
 * When URL search params are changed externally (e.g. country / merchant
 * switch resets the URL), local `values` auto-sync via `useEffect`.
 *
 * @example
 * ```ts
 * const FIELDS = ['channel', 'startTime', 'endTime'] as const;
 *
 * function MySearch() {
 *   const { values, setField, hasFilters, handleSearch, handleReset } =
 *     useListSearch(FIELDS);
 *   // …render inputs bound to values.channel, etc.
 * }
 * ```
 */
export function useListSearch<K extends string>(fieldKeys: readonly K[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Keep a ref so the read helper never goes stale if caller passes a new array
  const keysRef = useRef(fieldKeys);
  keysRef.current = fieldKeys;

  /** Read current field values from URL search params */
  const readFromURL = useCallback((): Record<K, string> => {
    const result = {} as Record<K, string>;
    for (const key of keysRef.current) {
      result[key] = searchParams.get(key) || '';
    }
    return result;
  }, [searchParams]);

  const [values, setValues] = useState<Record<K, string>>(readFromURL);

  // Sync from URL when searchParams change (e.g. external reset)
  useEffect(() => {
    setValues(readFromURL());
  }, [readFromURL]);

  /** Update a single field in local state */
  const setField = useCallback((key: K, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Whether any filter field is non-empty */
  const hasFilters = useMemo(() => Object.values(values).some(Boolean), [values]);

  /** Write local values → URL and reset to page 1 */
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set('pageNum', '1');

    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        params.set(key, value as string);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  }, [values, searchParams, setSearchParams]);

  /** Clear all fields and URL (keep only pageNum + pageSize) */
  const handleReset = useCallback(() => {
    const params = new URLSearchParams();
    params.set('pageNum', '1');
    params.set('pageSize', searchParams.get('pageSize') || '10');
    setSearchParams(params);
    // Note: setSearchParams triggers re-render → useEffect syncs local values
  }, [searchParams, setSearchParams]);

  /** Trigger search on Enter key */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch]
  );

  return { values, setField, hasFilters, handleSearch, handleReset, handleKeyDown };
}
