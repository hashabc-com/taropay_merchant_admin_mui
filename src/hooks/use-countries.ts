import useSWR from 'swr';

import { getCountryList } from 'src/api/common';
import { type Country } from 'src/stores/country-store';

// ----------------------------------------------------------------------

/**
 * Shared hook for fetching the country list.
 * Uses SWR with `dedupingInterval` so multiple consumers (header, forms, etc.)
 * share the same cached result without redundant requests.
 */
export function useCountries() {
  const { data, error, isLoading } = useSWR('countries', () => getCountryList(), {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000,
  });

  const countries: Country[] = (data?.result || []) as Country[];

  return { countries, error, isLoading };
}
