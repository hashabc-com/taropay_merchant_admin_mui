import type { FundChangesParams } from 'src/api/fund';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getFundChanges } from 'src/api/fund';

// ----------------------------------------------------------------------

export type FundsDetailRecord = {
  id?: number;
  typeName?: string;
  orderNo?: string;
  befAmountChanges?: number | string;
  amount?: number | string;
  aftAmountChanges?: number | string;
  localTime?: string;
};

export const FUND_TYPE_MAP: Record<string, string> = {
  '2': 'fund.fundsDetail.paymentDeduction',
  '3': 'fund.fundsDetail.paymentFailureRefund',
  '4': 'fund.fundsDetail.receiveSettlement',
  '1': 'fund.fundsDetail.merchantRecharge',
  '5': 'fund.fundsDetail.merchantWithdrawal',
};

export const FIELD_KEYS = ['type', 'startTime', 'endTime'] as const;

export function useFundsDetailList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as FundChangesParams;
  const convertAmount = useConvertAmount();
  const key = useListSWRKey('fund', 'funds-detail', params);

  const { data, isLoading, mutate } = useSWR(key, () => getFundChanges(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records: FundsDetailRecord[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((item: FundsDetailRecord, i: number) => ({
        ...item,
        id: i,
        befAmountChanges: convertAmount(item.befAmountChanges || 0),
        amount: convertAmount(item.amount || 0),
        aftAmountChanges: convertAmount(item.aftAmountChanges || 0),
      })),
    [data, convertAmount]
  );

  const totalRecord: number = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate };
}
