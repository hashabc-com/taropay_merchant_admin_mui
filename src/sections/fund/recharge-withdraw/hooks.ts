import type { RechargeWithdrawParams } from 'src/api/fund';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getRechargeWithdrawList } from 'src/api/fund';

// ----------------------------------------------------------------------

export type RechargeWithdrawRecord = {
  id?: number;
  localTime?: string;
  type?: string;
  rechargeAmountTwo?: string;
  rechargeAmount: string;
  withdrawalType?: string;
  exchangeRate?: string;
  finalAmountTwo?: string;
  finalAmount: string;
  remark?: string;
  processStatus?: string;
};

export const AUDIT_STATUS_MAP: Record<
  string,
  { label: string; color: 'success' | 'error' | 'info' }
> = {
  '0': { label: 'fund.rechargeWithdraw.auditFailed', color: 'error' },
  '1': { label: 'fund.rechargeWithdraw.auditPassed', color: 'success' },
  '2': { label: 'fund.rechargeWithdraw.auditing', color: 'info' },
};

export const FIELD_KEYS = ['type', 'status', 'startTime', 'endTime'] as const;

export function useRechargeWithdrawList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as RechargeWithdrawParams;
  const convertAmount = useConvertAmount();
  const key = useListSWRKey('fund', 'recharge-withdraw', params);

  const { data, isLoading, mutate } = useSWR(key, () => getRechargeWithdrawList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records: RechargeWithdrawRecord[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((item: RechargeWithdrawRecord, i: number) => ({
        ...item,
        id: i,
        rechargeAmount: convertAmount(item.rechargeAmount || 0, false),
        finalAmount: convertAmount(item.finalAmount || 0, false),
      })),
    [data, convertAmount]
  );

  const totalRecord: number = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate };
}
