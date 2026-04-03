import { create } from 'zustand';

// ----------------------------------------------------------------------

type UserInfo = {
  id: number;
  name: string;
};

type MenuItem = {
  name: string;
  url: string;
};

type Permissions = {
  menu: MenuItem[];
  user: {
    roleId: number;
    account: string;
  };
};

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  permissions: Permissions | null;
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  setPermissions: (permissions: Permissions) => void;
  hasPermission: (url: string) => boolean;
}

// Hydrate from localStorage
const initialToken = localStorage.getItem('_token');
const initialUserInfo = JSON.parse(localStorage.getItem('_userInfo') || 'null');
const initialPermissions = JSON.parse(localStorage.getItem('_permissions') || 'null');

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  userInfo: initialUserInfo,
  permissions: initialPermissions,

  login: (token, userInfo) => {
    localStorage.setItem('_token', token);
    localStorage.setItem('_userInfo', JSON.stringify(userInfo));
    set({ token, isAuthenticated: true, userInfo });
  },

  logout: () => {
    const redirect = window.location.pathname;
    if (redirect.startsWith('/auth')) return;

    localStorage.removeItem('_token');
    localStorage.removeItem('_userInfo');
    localStorage.removeItem('_permissions');
    set({ token: null, isAuthenticated: false, userInfo: null, permissions: null });

    window.location.href = `/auth/jwt/sign-in?returnTo=${encodeURIComponent(redirect)}`;
  },

  setPermissions: (permissions) => {
    localStorage.setItem('_permissions', JSON.stringify(permissions));
    set({ permissions });
  },

  hasPermission: (url) => {
    const { permissions } = get();
    if (!permissions?.menu) return false;

    const normalizedUrl = url === '/' ? '/' : url.replace(/\/$/, '');

    return permissions.menu.some((item) => {
      const menuUrl = item.url === '/' ? '/' : item.url.replace(/\/$/, '');

      // Exact match
      if (menuUrl === normalizedUrl) return true;

      // Prefix match — e.g. menu "/order" grants access to "/orders/receive-list"
      if (
        normalizedUrl.startsWith(`${menuUrl}/`) ||
        normalizedUrl.startsWith(`${menuUrl.replace(/s$/, '')}s/`)
      ) {
        return true;
      }

      return false;
    });
  },
}));
