import http from 'src/lib/http';

// ----------------------------------------------------------------------

// Types

export type SettlementListParams = {
  pageNum?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
};

export type RechargeWithdrawParams = {
  pageNum?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
};

export type ApprovePayload = {
  merchantId: string;
  id: number;
  exchangeRate?: string;
  costRate?: string;
  rechargeAmount: number;
  finalAmount?: string | number;
  withdrawalType: string;
  type?: string;
  status: number;
  country?: string;
  withdrawalPass?: string;
  gauthcode?: string;
  remark?: string;
};

// ----------------------------------------------------------------------

// Settlement records

export const getSettlementList = (params: SettlementListParams) =>
  http.get('/admin/bill/v1/getBillList', params);

// Recharge & Withdraw approval

export const getRechargeWithdrawList = (params: RechargeWithdrawParams) =>
  http.get('/admin/approval/getWithdrawalList', params);

export const approveWithdrawal = (data: ApprovePayload) =>
  http.post('/admin/approval/approveWithdrawal', data);

export const approveRecharge = (data: ApprovePayload) =>
  http.post('/admin/recharge/v1/approveRecharge', data);

// Image download (for recharge vouchers)

export const getImg = (params: { mediaId: string; type: boolean }) =>
  http.get('/admin/common/getImg', params);

export const downloadImg = async (params: { mediaId: string; type: boolean }, filename: string) => {
  const url = await getImg(params);
  if (!url) return;
  const a = document.createElement('a');
  a.href = typeof url === 'string' ? url : '';
  a.download = filename;
  a.click();
};
