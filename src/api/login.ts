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

export interface GoogleAuthInfo {
  customerName: string;
  type: number;
  gauthKey?: string;
  secretKey?: string;
}

// ----------------------------------------------------------------------

export const loginApi = (data: LoginForm) => http.post('/customer/login/form', data);

export const getVerifyCode = () =>
  http.post('/customer/googleVerify/v2/getPictureVerificationCode', {});

export const getKey = (data: Partial<GoogleAuthInfo>) =>
  http.post('/customer/googleVerify/v1/getKey', data);

export const bindKey = (data: Partial<GoogleAuthInfo>) =>
  http.post('/customer/googleVerify/v1/bindKey', data);
