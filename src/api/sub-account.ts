import http, { type ResponseData } from 'src/lib/http';

// ----------------------------------------------------------------------

// Types

export type SubUserStatus = 0 | 1;

export interface SubUser {
  id: string;
  account: string;
  status: SubUserStatus;
  roleId: string | string[];
  createTime?: string;
}

export type SubUserListParams = {
  pageNum?: number;
  pageSize?: number;
};

export interface SubUserAddRequest {
  account: string;
  password: string;
  status: SubUserStatus;
  roleId: string;
  googleCode: string;
}

export interface SubUserUpdateRequest {
  id: string | number;
  name?: string;
  mobile?: string;
  status?: SubUserStatus;
  roleId?: string;
  googleCode?: string;
}

export interface SubUserUpdatePassRequest {
  id: number | string;
  pwd: string;
  googleCode: string;
}

export interface RawMenuItem {
  id: number;
  name: string;
  type: string;
  url: string;
  parentId: number;
  parentIds: string;
  permission: string;
  available: boolean;
}

// ----------------------------------------------------------------------

// 子账号列表
export const getSubUserList = (params: SubUserListParams) =>
  http.get('/customer/sub/user/getUserList', params);

// 新增子账号
export const addSubUser = (data: SubUserAddRequest) =>
  http.post<ResponseData<SubUser>>('/customer/sub/user/addUser', data);

// 修改子账号
export const updateSubUser = (data: SubUserUpdateRequest) =>
  http.post<ResponseData<SubUser>>('/customer/sub/user/updateUser', data);

// 修改子账号密码
export const updateSubUserPass = (data: SubUserUpdatePassRequest) =>
  http.post<ResponseData>('/customer/sub/user/updateUserPass', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

// 获取菜单列表
export const getMenuList = () => http.post('/customer/sub/user/getResourceAll');
