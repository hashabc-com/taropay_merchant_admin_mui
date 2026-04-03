import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

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
};

export function CurrencySelector() {
  const { displayCurrency, selectedCountry, setDisplayCurrency } = useCountryStore();
  const defaultCurrency = selectedCountry?.currency;

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
        const countryCode = currencyToCountryCode[currency] || selectedCountry?.code || '';
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
