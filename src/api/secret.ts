import http from 'src/lib/http';

// ----------------------------------------------------------------------

export interface ISecretInfo {
  id?: number;
  appId?: string;
  platfromPublic?: string;
  platfromPrivate?: string;
  merchantPublic?: string;
  gauthKey?: string;
}

export const getSecret = (params?: { appId?: string }) =>
  http.get('/customer/user/v1/getSecret', params, { autoAddMerchantId: false });

export const updateSecret = (data: ISecretInfo) =>
  http.post('/customer/user/v1/updPublicSecret', data);
