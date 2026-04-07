import http from 'src/lib/http';

// ----------------------------------------------------------------------

export interface VerifyCodeResponse {
  base64ImgStr: string;
  key: string;
}

export type LoginType = 'confirm' | 'login';

export interface LoginForm {
  username: string;
  password: string;
  validatecode: string;
  validatekey: string;
  gauthkey?: string;
  type: LoginType;
}

export interface UserInfo {
  account: string;
  createTime: string;
  disabledStatus: number;
  email: string;
  gauthKey: string;
  id: number;
  lastLoginTime: string;
  mobile: string;
  password: string;
  roleIds: string;
  salt: string;
  updateTime: string;
  userName: string;
  userType: number;
}

// ----------------------------------------------------------------------

export const loginApi = (data: LoginForm) => http.post('/customer/login/form', data);

export const getVerifyCode = () =>
  http.post('/customer/googleVerify/v2/getPictureVerificationCode', {});

export const getKey = (data: Partial<UserInfo>) =>
  http.post('/customer/googleVerify/v1/getKey', data);

export const bindKey = (data: Partial<UserInfo>) =>
  http.post('/customer/googleVerify/v1/bindKey', data);
