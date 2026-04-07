import http from 'src/lib/http';

// ----------------------------------------------------------------------

export interface OrderListParams {
  pageNum: number;
  pageSize: number;
  country?: string;
  referenceno?: string;
  tripartiteOrder?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  transId?: string;
  mobile?: string;
  userName?: string;
  pickupCenter?: string;
}

export const getOrderList = (params: OrderListParams) =>
  http.get('/customer/collection/v1/list', params);

export const getCollectionOrderStats = (params: {
  startTime?: string;
  endTime?: string;
  pickupCenter?: string;
  status?: string;
}) => http.get('/customer/collection/orderdata', params);

// -- Receive summary --

export interface ReceiveSummaryParams {
  pageNum: number;
  pageSize: number;
  channel?: string;
  startTime?: string;
  endTime?: string;
}

export const getReceiveSummary = (params: ReceiveSummaryParams) =>
  http.get('/customer/collection/v1/summaryList', params);

export const prepareExportReceive = (params: { startTime?: string; endTime?: string }) =>
  http.get('/customer/collection/prepareExport', params);

// -- Payment (disbursement) list --

export interface PaymentListParams {
  pageNum: number;
  pageSize: number;
  refNo?: string;
  transId?: string;
  mobile?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  userName?: string;
  accountNumber?: string;
}

export const getPaymentLists = (params: PaymentListParams) =>
  http.get('/customer/disbursement/v1/list', params);

export const getDisbursementOrderStats = (params: {
  startTime?: string;
  endTime?: string;
  pickupCenter?: string;
  status?: string;
}) => http.get('/customer/disbursement/orderdata', params);

export const payOutReject = (data: FormData) =>
  http.post('/customer/disbursement/payOutReject', data);

// -- Transaction summary (交易汇总) --

export interface TransactionSummaryParams {
  pageNum: number;
  pageSize: number;
  startTime?: string;
  endTime?: string;
}

export interface TransactionSummaryRow {
  id?: number;
  dealTime?: string;
  localTime?: string;
  payinAmount: number | string;
  payinBillCount?: number;
  payinServiceAmount: number | string;
  payinTotalAmount: number | string;
  payoutAmount: number | string;
  payoutBillCount?: number;
  payoutServiceAmount: number | string;
  payoutTotalAmount: number | string;
  rechargeAmount: number | string;
  withdrawalAmount: number | string;
  finalAmount: number | string;
  finalAmountTwo?: number | string;
}

export const getTransactionSummary = (params: TransactionSummaryParams) =>
  http.get('/customer/disbursement/v1/summaryList', params);

export const prepareExportSummary = (params: { startTime?: string; endTime?: string }) =>
  http.get('/customer/disbursement/prepareExportSummary', params);

export const prepareExportPayment = (params: { startTime: string; endTime: string }) =>
  http.get('/customer/disbursement/prepareExport', params);

// -- Common dicts --

export const getPaymentChannel = () => http.get('/customer/paymentChannel/getChannelByCountry');
