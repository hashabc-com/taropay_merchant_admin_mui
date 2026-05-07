import useSWR from 'swr';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';

import { getChartDataOfDay, getAmountInformation } from 'src/api/dashboard';

// ----------------------------------------------------------------------

export function useDashboardAmount() {
  const key = useListSWRKey('dashboard', 'amount-info');

  const { data, isLoading } = useSWR(key, () => getAmountInformation(), {
    revalidateOnFocus: false,
  });

  const amountInfo = data?.result ?? data?.data ?? null;

  return { amountInfo, isLoading };
}

export function useDashboardChart(params?: { startTime?: string; endTime?: string }) {
  const key = useListSWRKey('dashboard', 'chart-data', params);

  const { data, isLoading } = useSWR(key, () => getChartDataOfDay(params), {
    revalidateOnFocus: false,
  });

  const chartResult = data?.result ?? data?.data ?? null;

  return { chartResult, isLoading };
}
