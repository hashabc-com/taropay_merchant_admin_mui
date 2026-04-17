import { useState, useRef } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useAuthStore } from 'src/stores/auth-store';
import { useCountryStore } from 'src/stores/country-store';
import { type Merchant, useMerchantStore } from 'src/stores/merchant-store';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function MerchantSelector() {
  const subMerchants = useAuthStore((s) => s.userInfo?.subMerchants);
  const { selectedMerchant, setSelectedMerchant } = useMerchantStore();
  const setDisplayCurrency = useCountryStore((s) => s.setDisplayCurrency);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Hide if there are fewer than 2 merchants (no need to switch)
  if (!subMerchants || subMerchants.length < 2) return null;

  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    if (merchant.currency) {
      setDisplayCurrency(merchant.currency as any);
    }
    handleClose();
  };

  const displayName =
    selectedMerchant?.customerName || selectedMerchant?.account || selectedMerchant?.appid || '';

  return (
    <>
      <ButtonBase
        ref={buttonRef}
        onClick={handleOpen}
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.75,
          borderRadius: 1.5,
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
          color: 'primary.main',
          transition: (theme) => theme.transitions.create(['background-color', 'box-shadow']),
          '&:hover': {
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
          },
          ...(open && {
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
          }),
        }}
      >
        <Iconify icon="solar:shop-bold-duotone" width={20} />
        <Typography variant="subtitle2" noWrap sx={{ maxWidth: 140, lineHeight: 1.2 }}>
          {displayName}
        </Typography>
        <Iconify
          icon="eva:chevron-down-fill"
          width={16}
          sx={{
            ml: -0.25,
            flexShrink: 0,
            transition: (theme) => theme.transitions.create('transform'),
            ...(open && { transform: 'rotate(180deg)' }),
          }}
        />
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: { minWidth: 200, mt: 0.5 },
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {subMerchants.map((merchant) => {
          const isSelected = merchant.appid === selectedMerchant?.appid;
          return (
            <MenuItem
              key={merchant.appid}
              selected={isSelected}
              onClick={() => handleSelect(merchant as Merchant)}
              sx={{ gap: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 'auto' }}>
                <Iconify
                  icon={isSelected ? 'solar:check-circle-bold' : 'solar:shop-linear'}
                  width={20}
                  sx={{ color: isSelected ? 'primary.main' : 'text.secondary' }}
                />
              </ListItemIcon>
              <ListItemText
                primary={merchant.customerName || merchant.account || merchant.appid}
                primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 700 : 500 }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
