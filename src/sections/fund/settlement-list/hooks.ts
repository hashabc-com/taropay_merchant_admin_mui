import type { SettlementListParams } from 'src/api/fund';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getSettlementList } from 'src/api/fund';

// ----------------------------------------------------------------------

export type SettlementRecord = {
  companyName?: string;
  type?: string;
  createTime?: string;
  rechargeAmount?: number | string;
  withdrawalType?: string;
  exchangeRate?: string | number;
  finalAmount?: number | string;
  remark?: string;
  processStatus?: number;
};

export const AUDIT_STATUS_MAP: Record<
  number,
  { label: string; color: 'success' | 'error' | 'info' }
> = {
  0: { label: 'fund.settlement.reviewNotApproved', color: 'error' },
  1: { label: 'fund.settlement.reviewApproved', color: 'success' },
  2: { label: 'fund.settlement.reviewing', color: 'info' },
};

export const FIELD_KEYS = ['status', 'type', 'startTime', 'endTime'] as const;

export function useSettlementList() {
  const params = useSearchParamsObject(FIELD_KEYS) as SettlementListParams;
  const convertAmount = useConvertAmount();
  const key = useListSWRKey('fund', 'settlement-list', params);

  const { data, isLoading, mutate } = useSWR(key, () => getSettlementList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records: SettlementRecord[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((item: SettlementRecord, i: number) => ({
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
