import type { SWRConfiguration } from 'swr';

// ----------------------------------------------------------------------
// Global SWR configuration — import in App and pass to <SWRConfig value={swrConfig}>
// ----------------------------------------------------------------------

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  dedupingInterval: 5000,
};
