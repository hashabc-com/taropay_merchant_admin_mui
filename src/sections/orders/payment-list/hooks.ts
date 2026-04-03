import type { PaymentListParams } from 'src/api/order';
import type { OrderStats } from '../receive-list/types';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getPaymentLists, getDisbursementOrderStats } from 'src/api/order';

// ----------------------------------------------------------------------

export type PaymentOrder = {
  id?: number;
  companyName?: string;
  localTime?: string;
  localSuccessTime?: string;
  updateTime?: string;
  transactionReferenceNo?: string;
  certificateId?: string;
  transactionid?: string;
  mobile?: string;
  userName?: string;
  pickupCenter?: string;
  paymentCompany?: string;
  accountNumber?: string;
  amount?: number | string;
  serviceAmount?: number | string;
  status?: string;
  address?: string;
  referenceno?: string;
  transId?: string;
  country?: string;
};

export const PAYMENT_STATUS_MAP: Record<
  string,
  { label: string; color: 'success' | 'info' | 'error' }
> = {
  '0': { label: '付款成功', color: 'success' },
  '1': { label: '待付款', color: 'info' },
  '2': { label: '付款失败', color: 'error' },
};

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = [
  'refNo',
  'transId',
  'mobile',
  'userName',
  'accountNumber',
  'status',
  'pickupCenter',
  'startTime',
  'endTime',
] as const;

// ----------------------------------------------------------------------

export function usePaymentList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as PaymentListParams;
  const convertAmount = useConvertAmount();

  const key = useListSWRKey('orders', 'payment-list', params);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => getPaymentLists(params),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const orders: PaymentOrder[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((r: PaymentOrder, i: number) => ({
        ...r,
        id: r.id ?? i,
        amount: convertAmount(r.amount || 0, false),
        serviceAmount: convertAmount(r.serviceAmount || 0, false),
      })),
    [data, convertAmount]
  );
  const totalRecord: number = data?.result?.totalRecord || 0;

  return { orders, totalRecord, error, isLoading, isValidating, mutate, params };
}

export function usePaymentStats() {
  const params = useSearchParamsObject(['startTime', 'endTime', 'pickupCenter', 'status'] as const);

  const key = useListSWRKey(
    'orders',
    'payment-stat',
    params.startTime,
    params.endTime,
    params.pickupCenter,
    params.status
  );

  const { data, isLoading } = useSWR(
    key,
    () =>
      getDisbursementOrderStats({
        startTime: params.startTime as string | undefined,
        endTime: params.endTime as string | undefined,
        pickupCenter: params.pickupCenter as string | undefined,
        status: params.status as string | undefined,
      }),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const stats: OrderStats = useMemo(() => {
    const r = data?.result;
    if (r) {
      return {
        totalOrders: Number(r.allOrder) || 0,
        successOrders: Number(r.successOrder) || 0,
        successRate: (r.successRate ?? '0').replace('%', ''),
      };
    }
    return { totalOrders: 0, successOrders: 0, successRate: '0' };
  }, [data?.result]);

  return { stats, isLoading };
}
