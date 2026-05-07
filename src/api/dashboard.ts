import http from 'src/lib/http';

// ----------------------------------------------------------------------

// Types
// ----------------------------------------------------------------------

export interface AmountInfo {
  id: number | null;
  merchantId: string | null;
  rechargeAmount: number;
  frozenAmount: number;
  availableAmount: number;
  consumptionAmount: number | null;
  version: string | null;
  createTime: string | null;
  updateTime: string | null;
  rechargeAmountTwo: string;
  frozenAmountTwo: string;
  availableAmountTwo: string;
  rechargeAmountAll: number;
  availableAmountUsd: number;
  frozenAmountUsd: number;
  rechargeAmountUsd: number;
}

export interface DayChartData {
  date: string;
  collectAmount: string;
  payoutAmount: string;
  collectCount: string;
  payoutCount: string;
  collectServiceAmount: string;
  payoutServiceAmount: string;
  collectServiceAmountUsd: string;
  payoutServiceAmountUsd: string;
  collectAmountUsd: string;
  payoutAmountUsd: string;
}

export interface ChartDataOfDay {
  data: DayChartData[];
  withdrawalAmount: string;
  rechargeAmount: string;
  withdrawalAmountUsd: string;
  rechargeAmountUsd: string;
}

// API Functions
// ----------------------------------------------------------------------

export const getAmountInformation = () =>
  http.get<AmountInfo>('/customer/bill/v1/getAmountInformation');

export const getChartDataOfDay = (params?: { startTime?: string; endTime?: string }) =>
  // const fd = new FormData();
  // if (params?.startTime) fd.append('startTime', params.startTime);
  // if (params?.endTime) fd.append('endTime', params.endTime);
  http.post<ChartDataOfDay>('/customer/home/v1/chartDataOfDay', params);
