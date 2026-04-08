import http from 'src/lib/http';

// ----------------------------------------------------------------------

// Types

export type FundChangesParams = {
  pageNum?: number;
  pageSize?: number;
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

// ----------------------------------------------------------------------

// 资金明细
export const getFundChanges = (params: FundChangesParams) =>
  http.get('/customer/funds/v1/changes', params);

// 充值提现记录列表
export const getRechargeWithdrawList = (params: RechargeWithdrawParams) =>
  http.get('/customer/bill/v1/getBillList', params);

// 收U地址
export const getRecordAddress = () => http.get('/customer/dict/v1/getRecordAddress');

// 可用金额信息
export const getTotalAmount = () => http.get('/customer/bill/v1/getAmountInformation');

// 汇率
export const getRate = () => http.get('/customer/home/v1/getExchangeRate');

// 充值申请
export const requestRecharge = (data: unknown) => http.post('/customer/bill/requestRecharge', data);

// 提现申请
export const requestWithdraw = (data: unknown) =>
  http.post('/customer/bill/v2/applyFor/withdraw', data);

// 上传媒体文件
export const uploadMedia = (file: File) => {
  const formData = new FormData();
  formData.append('upload', file);
  return http.post('/customer/uploadMedia', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
