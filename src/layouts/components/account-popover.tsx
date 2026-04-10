import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useRouter } from 'src/routes/hooks';

import { _mock } from 'src/_mock';
import { useAuthStore } from 'src/stores';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { UpdatePasswordDialog } from 'src/components/update-password-dialog';
import { KeyPairGeneratorDialog } from 'src/components/key-pair-generator-dialog';
import { UpdatePayPasswordDialog } from 'src/components/update-pay-password-dialog';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/jwt/action';

import { AccountButton } from './account-button';

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps;

export function AccountPopover({ sx, ...other }: AccountPopoverProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { open, anchorEl, onClose, onOpen } = usePopover();
  const { checkUserSession } = useAuthContext();

  const userInfo = useAuthStore((s) => s.userInfo);

  const displayName = userInfo?.name ?? 'User';

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [payPasswordOpen, setPayPasswordOpen] = useState(false);
  const [keyPairOpen, setKeyPairOpen] = useState(false);

  const handleOpenApiDocs = () => {
    onClose();
    window.open('https://docs.taropay.com/guide/overview', '_blank', 'noopener,noreferrer');
  };

  const handleOpenPassword = () => {
    onClose();
    setPasswordOpen(true);
  };

  const handleOpenPayPassword = () => {
    onClose();
    setPayPasswordOpen(true);
  };

  const handleOpenKeyPair = () => {
    onClose();
    setKeyPairOpen(true);
  };

  const handleLogout = useCallback(async () => {
    try {
      onClose();
      await signOut();
      await checkUserSession?.();
      router.replace('/auth/jwt/sign-in');
    } catch (error) {
      console.error(error);
    }
  }, [checkUserSession, onClose, router]);

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={_mock.image.avatar(24)}
        displayName={displayName}
        sx={sx}
        {...other}
      />

      <CustomPopover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        slotProps={{ paper: { sx: { p: 0, width: 200 } } }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList sx={{ py: 1 }}>
          <MenuItem onClick={handleOpenPassword} sx={{ borderRadius: 1, gap: '0 !important' }}>
            <ListItemIcon sx={{ mr: 0 }}>
              <Iconify icon="solar:lock-password-bold-duotone" />
            </ListItemIcon>
            <ListItemText
              primary={t('password.updatePassword')}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </MenuItem>
          <MenuItem onClick={handleOpenPayPassword} sx={{ borderRadius: 1, gap: '0 !important' }}>
            <ListItemIcon sx={{ mr: 0 }}>
              <Iconify icon="solar:wallet-bold-duotone" />
            </ListItemIcon>
            <ListItemText
              primary={t('password.updatePayPassword')}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </MenuItem>
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList sx={{ py: 1 }}>
          <MenuItem onClick={handleOpenKeyPair} sx={{ borderRadius: 1, gap: '0 !important' }}>
            <ListItemIcon sx={{ mr: 0 }}>
              <Iconify icon="solar:key-bold-duotone" />
            </ListItemIcon>
            <ListItemText
              primary={t('keyPair.title')}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </MenuItem>
          <MenuItem onClick={handleOpenApiDocs} sx={{ borderRadius: 1, gap: '0 !important' }}>
            <ListItemIcon sx={{ mr: 0 }}>
              <Iconify icon="solar:document-bold-duotone" />
            </ListItemIcon>
            <ListItemText
              primary={t('common.apiDocs')}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </MenuItem>
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList sx={{ py: 1 }}>
          <MenuItem
            onClick={handleLogout}
            sx={{ borderRadius: 1, color: 'error.main', gap: '0 !important' }}
          >
            <ListItemIcon sx={{ color: 'inherit', mr: 0 }}>
              <Iconify icon="solar:logout-2-bold-duotone" />
            </ListItemIcon>
            <ListItemText
              primary={t('common.logout')}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <UpdatePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
      <UpdatePayPasswordDialog open={payPasswordOpen} onClose={() => setPayPasswordOpen(false)} />
      <KeyPairGeneratorDialog
        open={keyPairOpen}
        onClose={() => setKeyPairOpen(false)}
        navigateToSecretManagement
      />
    </>
  );
}
