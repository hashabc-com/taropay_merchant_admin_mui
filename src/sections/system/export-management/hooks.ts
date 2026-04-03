import useSWR from 'swr';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getExportList } from 'src/api/common';

// ----------------------------------------------------------------------

export const FIELD_KEYS = [] as const;

// ----------------------------------------------------------------------

export function useExportList() {
  const params = useSearchParamsObject(FIELD_KEYS) as Record<string, unknown>;

  const key = useListSWRKey('system', 'export-management', params);

  const { data, isLoading, mutate } = useSWR(key, () => getExportList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records = data?.result?.list || [];
  const totalRecord = data?.result?.total || 0;

  return { records, totalRecord, isLoading, mutate, params };
}
