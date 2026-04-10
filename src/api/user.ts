import type { ResponseData } from 'src/lib/http';

import http from 'src/lib/http';

// ----------------------------------------------------------------------

interface UpdatePasswordData {
  id: number;
  pwd: string;
  rePwd: string;
  gauthKey: string;
}

// 修改登录密码
export const updatePassword = (data: UpdatePasswordData) =>
  http.post<ResponseData>('/customer/user/v1/updateUserPass', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

// 修改支付密码
export const updatePayPassword = (data: UpdatePasswordData) =>
  http.post<ResponseData>('/customer/user/v1/updatePayPass', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
