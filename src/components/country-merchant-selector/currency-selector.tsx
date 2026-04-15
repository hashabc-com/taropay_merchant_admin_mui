import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { useAuthStore } from 'src/stores/auth-store';
import { useLanguage } from 'src/context/language-provider';
import { useMerchantStore } from 'src/stores/merchant-store';
import { useCountryStore, SUPPORTED_CURRENCIES } from 'src/stores/country-store';

import { compactSelectSx } from './styles';

// ----------------------------------------------------------------------

const currencyToCountryCode: Record<string, string> = {
  IDR: 'ID',
  VND: 'VN',
  PHP: 'PH',
  BRL: 'BR',
  MXN: 'MX',
  BDT: 'BD',
  CNY: 'CN',
  USD: 'US',
  EUR: 'EU',
  GBP: 'GB',
  HKD: 'HK',
  PKR: 'PK',
};

export function CurrencySelector() {
  const { t } = useLanguage();
  const { displayCurrency, setDisplayCurrency, setRates } = useCountryStore();
  const userInfo = useAuthStore((s) => s.userInfo);
  const selectedMerchant = useMerchantStore((s) => s.selectedMerchant);

  // Prefer selected merchant's currency, fall back to userInfo.currency
  const defaultCurrency = (selectedMerchant?.currency ?? userInfo?.currency) as string;

  const fetchRates = useCallback(
    async (currency: string) => {
      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${currency}`);
        const data = await response.json();
        if (data.result === 'success' && data.rates) {
          setRates(data.rates);
        }
      } catch {
        toast.error(t('common.fetchRateFailed'));
      }
    },
    [setRates, t]
  );

  // Sync displayCurrency on mount & when userInfo changes
  useEffect(() => {
    if (defaultCurrency && !displayCurrency) {
      setDisplayCurrency(defaultCurrency as any);
    }
  }, [defaultCurrency, displayCurrency, setDisplayCurrency]);

  // Fetch exchange rates for the default currency
  useEffect(() => {
    if (defaultCurrency) {
      fetchRates(defaultCurrency);
    }
  }, [defaultCurrency, fetchRates]);

  const allCurrencies = [
    ...(defaultCurrency && !SUPPORTED_CURRENCIES.includes(defaultCurrency as any)
      ? [defaultCurrency]
      : []),
    ...SUPPORTED_CURRENCIES,
  ];

  return (
    <Select
      size="small"
      value={displayCurrency ?? ''}
      onChange={(e) => setDisplayCurrency(e.target.value as any)}
      MenuProps={{ disableAutoFocus: true }}
      sx={{ ...compactSelectSx, minWidth: 80 }}
    >
      {allCurrencies.map((currency) => {
        const countryCode = currencyToCountryCode[currency] || '';
        return (
          <MenuItem key={currency} value={currency}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="img"
                src={`/assets/images/flag/${countryCode}.svg`}
                alt={currency}
                sx={{ width: 18, height: 18 }}
                onError={(e: any) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {currency}
            </Box>
          </MenuItem>
        );
      })}
    </Select>
  );
}
