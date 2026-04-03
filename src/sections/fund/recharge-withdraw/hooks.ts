import type { RechargeWithdrawParams } from 'src/api/fund';

import useSWR from 'swr';
import { useMemo, useState, useEffect } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getImg, getRechargeWithdrawList } from 'src/api/fund';

// ----------------------------------------------------------------------

export type RechargeWithdrawRecord = {
  id: number;
  merchantId: string;
  companyName?: string;
  createTime?: string;
  type?: string;
  rechargeAmount: string;
  rechargeAmountTemp?: string | number;
  withdrawalType?: string | null;
  exchangeRate?: string | number | null;
  costRate?: string | number | null;
  profitAmountTwo?: string | number | null;
  finalAmount: string;
  withdrawalAddress?: string | null;
  mediaId?: string | null;
  local_url?: string;
  remark?: string | null;
  processStatus?: number | null;
  country?: string;
  currencyType?: string | null;
};

export const AUDIT_STATUS_MAP: Record<
  number,
  { label: string; color: 'success' | 'error' | 'info' }
> = {
  0: { label: 'fund.settlement.reviewNotApproved', color: 'error' },
  1: { label: 'fund.settlement.reviewApproved', color: 'success' },
  2: { label: 'fund.settlement.reviewing', color: 'info' },
};

export const FIELD_KEYS = ['status', 'startTime', 'endTime'] as const;

export function useRechargeWithdrawList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as RechargeWithdrawParams;
  const convertAmount = useConvertAmount();
  const key = useListSWRKey('fund', 'recharge-withdraw', params);
  const [dataWithImages, setDataWithImages] = useState<RechargeWithdrawRecord[]>([]);

  const { data, isLoading, mutate } = useSWR(key, () => getRechargeWithdrawList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const dataList: RechargeWithdrawRecord[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((item: RechargeWithdrawRecord) => ({
        ...item,
        rechargeAmount: convertAmount(item.rechargeAmount, false),
        rechargeAmountTemp: item.rechargeAmount,
        finalAmount: convertAmount(item.finalAmount, false),
      })),
    [data, convertAmount]
  );

  const totalRecord: number = data?.result?.totalRecord || 0;

  // Load images for items with mediaId
  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      if (!dataList || dataList.length === 0) {
        if (isMounted) setDataWithImages([]);
        return;
      }

      const updatedData = await Promise.all(
        dataList.map(async (item) => {
          if (!item.mediaId) return item;
          try {
            const urlObj = new URL(item.mediaId);
            const mediaId = urlObj.searchParams.get('mediaId');
            if (mediaId) {
              const res = await getImg({ mediaId, type: true });
              const imageUrl = (res?.data ?? res) as string;
              return { ...item, local_url: imageUrl };
            }
          } catch (error) {
            console.error('Failed to load image:', error);
          }
          return item;
        })
      );

      if (isMounted) setDataWithImages(updatedData);
    };

    loadImages();
    return () => {
      isMounted = false;
    };
  }, [dataList]);

  return {
    records: dataWithImages.length > 0 ? dataWithImages : dataList,
    totalRecord,
    isLoading,
    mutate,
  };
}
