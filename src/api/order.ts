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
  http.get('/admin/collection/v1/list', params);

export const getCollectionOrderStats = (params: {
  startTime?: string;
  endTime?: string;
  pickupCenter?: string;
  status?: string;
}) => http.get('/admin/collection/orderdata', params);

// -- Receive summary --

export interface ReceiveSummaryParams {
  pageNum: number;
  pageSize: number;
  channel?: string;
  startTime?: string;
  endTime?: string;
}

export const getReceiveSummary = (params: ReceiveSummaryParams) =>
  http.get('/admin/collection/v1/summaryList', params);

export const prepareExportReceive = (params: { startTime?: string; endTime?: string }) =>
  http.get('/admin/collection/prepareExportData', params);

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
  http.get('/admin/disbursement/v1/list', params);

export const getDisbursementOrderStats = (params: {
  startTime?: string;
  endTime?: string;
  pickupCenter?: string;
  status?: string;
}) => http.get('/admin/disbursement/orderdata', params);

export const payOutReject = (data: FormData) => http.post('/admin/disbursement/payOutReject', data);

// -- Common dicts --

export const getPaymentChannel = () => http.get('/admin/paymentChannel/getChannelByCountry');
