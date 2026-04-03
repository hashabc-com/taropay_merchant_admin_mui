// Order schema & types migrated from old system
// ----------------------------------------------------------------------

export type Order = {
  id: number;
  merchantId: string;
  paymentCompany: string | null;
  referenceno: string;
  amount: number | string;
  realAmount?: number | string;
  expiryDate: string | null;
  remark: string | null;
  transId: string;
  status: string;
  localPaymentDate?: string | null;
  paymentDate?: string | null;
  serviceAmount: number | string;
  taxRate: string;
  createTime: string;
  updateTime: string;
  companyName: string;
  taxRateAmount: string;
  pickupCenter?: string | null;
  amountTwo: string;
  serviceAmountTwo: string;
  notificationURL: string | null;
  tripartiteOrder?: string | null;
  country: string | null;
  amountUSD?: number;
  serviceAmountUSD?: number;
  localTime?: string | null;
  message?: string | null;
  mobile?: string | null;
  userName?: string | null;
};

export type OrderListResponse = {
  pageNum: number;
  pageSize: number;
  totalRecord: number;
  listRecord: Order[];
  orderTotal: string | null;
  amountTotal: string | null;
  amountServiceTotal: string | null;
  totalAmountTotal: string | null;
  successRate: string | null;
  successOrder: number | null;
  allOrder: number | null;
  amountTotalUSD: number | null;
  amountServiceTotalUSD: number | null;
  totalAmountTotalUSD: number | null;
};

export type OrderStats = {
  totalOrders: number;
  successOrders: number;
  successRate: string;
};

export const ORDER_STATUS_MAP: Record<
  string,
  { label: string; color: 'success' | 'info' | 'error' | 'default' | 'warning' }
> = {
  '0': { label: '支付成功', color: 'success' },
  '1': { label: '待支付', color: 'info' },
  '2': { label: '支付失败', color: 'error' },
  '3': { label: '已过期', color: 'default' },
  '4': { label: '部分支付', color: 'warning' },
};
