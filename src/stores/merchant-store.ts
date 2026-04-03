import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ----------------------------------------------------------------------

export interface Merchant {
  id: number | null;
  customerName: string | null;
  appid: string;
  secretKey: string | null;
  companyName: string;
  account: string | null;
  password: string | null;
  status: string | null;
  email: string | null;
  country: string | null;
  phoneNumber: string | null;
  mobile: string | null;
  createTime: string | null;
  updateTime: string | null;
  currency: string | null;
  [key: string]: any;
}

interface MerchantState {
  selectedMerchant: Merchant | null;
  setSelectedMerchant: (merchant: Merchant | null) => void;
  clearSelectedMerchant: () => void;
}

export const useMerchantStore = create<MerchantState>()(
  persist(
    (set) => ({
      selectedMerchant: null,
      setSelectedMerchant: (merchant) => set({ selectedMerchant: merchant }),
      clearSelectedMerchant: () => set({ selectedMerchant: null }),
    }),
    { name: 'merchant-storage' }
  )
);
