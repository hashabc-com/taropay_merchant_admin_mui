import { create } from 'zustand';

import { useMerchantStore, type Merchant } from './merchant-store';
import { useCountryStore, type SupportedCurrency } from './country-store';

// ----------------------------------------------------------------------

export interface IResource {
  id: number;
  name: string;
  type: 'menu' | 'button';
  url: string;
  parentId: number;
  parentIds: string;
  permission: string;
  available: boolean;
}

type UserInfo = {
  id: number;
  name: string;
  merchantId?: string;
  countryCode?: string;
  currency?: string;
  resourceList?: IResource[];
  subMerchants?: Merchant[];
};

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
}

// Hydrate from localStorage
const initialToken = localStorage.getItem('_token');
const initialUserInfo = JSON.parse(localStorage.getItem('_userInfo') || 'null');

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  userInfo: initialUserInfo,

  login: (token, userInfo) => {
    localStorage.setItem('_token', token);
    localStorage.setItem('_userInfo', JSON.stringify(userInfo));
    // Initialize selected merchant from subMerchants & sync currency
    if (userInfo.subMerchants?.length) {
      const merchantState = useMerchantStore.getState();
      if (!merchantState.selectedMerchant) {
        const first = userInfo.subMerchants[0];
        merchantState.setSelectedMerchant(first);
        if (first.currency) {
          useCountryStore.getState().setDisplayCurrency(first.currency as SupportedCurrency);
        }
      }
    } else if (userInfo.currency) {
      useCountryStore.getState().setDisplayCurrency(userInfo.currency as SupportedCurrency);
    }

    set({ token, isAuthenticated: true, userInfo });
  },

  logout: () => {
    const redirect = window.location.pathname;
    if (redirect.startsWith('/auth')) return;

    localStorage.removeItem('_token');
    localStorage.removeItem('_userInfo');
    set({ token: null, isAuthenticated: false, userInfo: null });

    // Clear related stores
    useCountryStore.getState().clearSelectedCountry();
    useMerchantStore.getState().clearSelectedMerchant();

    window.location.href = `/auth/jwt/sign-in?returnTo=${encodeURIComponent(redirect)}`;
  },
}));

// Hydrate merchant store on initial app load
if (initialUserInfo?.subMerchants?.length) {
  const merchantState = useMerchantStore.getState();
  if (!merchantState.selectedMerchant) {
    const first = initialUserInfo.subMerchants[0];
    merchantState.setSelectedMerchant(first);
    if (first.currency) {
      useCountryStore.getState().setDisplayCurrency(first.currency as SupportedCurrency);
    }
  }
}
