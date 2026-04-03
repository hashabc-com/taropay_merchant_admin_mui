import type { ReceiveSummaryParams } from 'src/api/order';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getReceiveSummary } from 'src/api/order';

export type ReceiveSummaryRow = {
  id?: number;
  companyName?: string;
  paymentCompany?: string;
  dealTime?: string;
  billCount?: number;
  amount: number | string;
  serviceAmount: number | string;
  totalAmount: number | string;
};

export type ReceiveSummaryTotals = {
  orderTotal?: string | number;
  amountTotal?: string | number;
  amountServiceTotal?: string | number;
  totalAmountTotal?: string | number;
};

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = ['channel', 'startTime', 'endTime'] as const;

// ----------------------------------------------------------------------

export function useReceiveSummaryList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as ReceiveSummaryParams;
  const convertAmount = useConvertAmount();

  const key = useListSWRKey('orders', 'receive-summary', params);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => getReceiveSummary(params),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const rows: ReceiveSummaryRow[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((r: ReceiveSummaryRow, i: number) => ({
        ...r,
        id: r.id ?? i,
        amount: convertAmount(r.amount, false),
        serviceAmount: convertAmount(r.serviceAmount, false),
        totalAmount: convertAmount(r.totalAmount, false),
      })),
    [data, convertAmount]
  );
  const totalRecord: number = data?.result?.totalRecord || 0;
  const totals: ReceiveSummaryTotals = useMemo(
    () => ({
      orderTotal: data?.result?.orderTotal,
      amountTotal: convertAmount(data?.result?.amountTotal, false),
      amountServiceTotal: convertAmount(data?.result?.amountServiceTotal, false),
      totalAmountTotal: convertAmount(data?.result?.totalAmountTotal, false),
    }),
    [data, convertAmount]
  );

  return { rows, totalRecord, totals, error, isLoading, isValidating, mutate, params };
}
