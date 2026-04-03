import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ----------------------------------------------------------------------

export interface Country {
  id: string;
  country: string;
  code: string;
  currency: string;
  create_time: string;
}

export const SUPPORTED_CURRENCIES = ['CNY', 'EUR', 'GBP', 'HKD', 'USD'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

interface CountryState {
  selectedCountry: Country | null;
  displayCurrency: SupportedCurrency | null;
  rates: Record<string, number>;
  setRates: (rates: Record<string, number>) => void;
  setSelectedCountry: (country: Country | null) => void;
  setDisplayCurrency: (currency: SupportedCurrency) => void;
  clearSelectedCountry: () => void;
}

export const useCountryStore = create<CountryState>()(
  persist(
    (set) => ({
      selectedCountry: null,
      displayCurrency: null,
      rates: {},

      setRates: (rates) => set({ rates }),

      setSelectedCountry: (country) =>
        set({
          selectedCountry: country,
          displayCurrency: country?.currency as SupportedCurrency,
        }),

      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),

      clearSelectedCountry: () => set({ selectedCountry: null }),
    }),
    { name: 'country-storage' }
  )
);
