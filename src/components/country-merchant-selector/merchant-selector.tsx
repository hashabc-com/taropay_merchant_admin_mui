import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { useAuthStore } from 'src/stores/auth-store';
import { useCountryStore } from 'src/stores/country-store';
import { type Merchant, useMerchantStore } from 'src/stores/merchant-store';

import { compactSelectSx } from './styles';

// ----------------------------------------------------------------------

export function MerchantSelector() {
  const subMerchants = useAuthStore((s) => s.userInfo?.subMerchants);
  const { selectedMerchant, setSelectedMerchant } = useMerchantStore();
  const setDisplayCurrency = useCountryStore((s) => s.setDisplayCurrency);

  // Hide if there are fewer than 2 merchants (no need to switch)
  if (!subMerchants || subMerchants.length < 2) return null;

  const handleChange = (appid: string) => {
    const merchant = subMerchants.find((m) => m.appid === appid);
    if (merchant) {
      setSelectedMerchant(merchant as Merchant);
      if (merchant.currency) {
        setDisplayCurrency(merchant.currency as any);
      }
    }
  };

  return (
    <Select
      size="small"
      value={selectedMerchant?.appid ?? ''}
      onChange={(e) => handleChange(e.target.value)}
      MenuProps={{ disableAutoFocus: true }}
      sx={{ ...compactSelectSx, minWidth: 100 }}
    >
      {subMerchants.map((merchant) => (
        <MenuItem key={merchant.appid} value={merchant.appid}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {merchant.customerName || merchant.account || merchant.appid}
            </Typography>
            {/* <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {merchant.country}
            </Typography> */}
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}
