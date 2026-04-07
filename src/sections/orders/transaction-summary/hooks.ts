import type { TransactionSummaryRow, TransactionSummaryParams } from 'src/api/order';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getTransactionSummary } from 'src/api/order';

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = ['startTime', 'endTime'] as const;

// ----------------------------------------------------------------------

export function useTransactionSummaryList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as TransactionSummaryParams;
  const convertAmount = useConvertAmount();

  const key = useListSWRKey('orders', 'transaction-summary', params);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => getTransactionSummary(params),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const rows: TransactionSummaryRow[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((r: TransactionSummaryRow, i: number) => ({
        ...r,
        id: r.id ?? i,
        payinAmount: convertAmount(r.payinAmount || 0, false),
        payinServiceAmount: convertAmount(r.payinServiceAmount || 0, false),
        payinTotalAmount: convertAmount(r.payinTotalAmount || 0, false),
        payoutAmount: convertAmount(r.payoutAmount || 0, false),
        payoutServiceAmount: convertAmount(r.payoutServiceAmount || 0, false),
        payoutTotalAmount: convertAmount(r.payoutTotalAmount || 0, false),
        rechargeAmount: convertAmount(r.rechargeAmount || 0, false),
        withdrawalAmount: convertAmount(r.withdrawalAmount || 0, false),
        finalAmount: convertAmount(r.finalAmount || 0, false),
      })),
    [data, convertAmount]
  );
  const totalRecord: number = data?.result?.totalRecord || 0;

  return { rows, totalRecord, error, isLoading, isValidating, mutate, params };
}
