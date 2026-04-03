import type { ResponseData } from 'src/lib/http';
import type { Country } from 'src/stores/country-store';
import type { Merchant } from 'src/stores/merchant-store';

import http from 'src/lib/http';

// ----------------------------------------------------------------------

export const getCountryList = () =>
  http.get<ResponseData<Country[]>>('/admin/home/v1/getCountryList');

export const getMerchantList = () =>
  http.get<ResponseData<Merchant[]>>('/admin/user/v1/getAllUserList');

export const getProductDict = () =>
  http.get<{ payinChannel: string[]; payoutChannel: string[] }>(
    '/admin/user/v1/getChannelTypeList'
  );

export const payOutNotify = (data: { transId: string; status: number }) =>
  http.get<ResponseData>('/admin/collection/payInNotify', data);

export const payInNotify = (data: { transId: string; status: number }) =>
  http.get<ResponseData>('/admin/disbursement/payOutNotify', data);

export const updateStatus = (data: FormData) =>
  http.post<ResponseData>('/admin/collection/payInStatusQuery', data);

// 导出管理
export interface IExportRecord {
  id: number;
  fileName: string;
  exportType: 'PAYMENT' | 'LENDING' | 'TRAN';
  status: 0 | 1 | 2; // 0:生成中 1:可下载 2:生成失败
  fileId: string;
  createTime: string;
}

export const getExportList = (params: Record<string, unknown>) =>
  http.get<{ list: IExportRecord[]; total: number }>('/admin/exportRecord/list', { params });

export const downloadExportFile = (fileId: string) =>
  http.get(
    `/admin/collection/downloadExportData?fileId=${fileId}`,
    {},
    {
      autoAddCountry: false,
      responseType: 'blob',
    }
  );
