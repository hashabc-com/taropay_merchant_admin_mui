import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';
import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useRouter } from 'src/routes/hooks';

import { _mock } from 'src/_mock';
import { CONFIG } from 'src/global-config';
import { useAuthStore } from 'src/stores/auth-store';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { varTap, varHover, AnimateBorder, transitionTap } from 'src/components/animate';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/jwt/action';

// ----------------------------------------------------------------------

export function NavUpgrade({ sx, ...other }: BoxProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { userInfo, permissions } = useAuthStore();
  const { checkUserSession } = useAuthContext();

  const displayName = userInfo?.name || permissions?.user?.account || 'User';

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = useCallback(async () => {
    try {
      handleClose();
      await signOut();
      await checkUserSession?.();
      router.replace('/auth/jwt/sign-in');
    } catch (error) {
      console.error(error);
    }
  }, [checkUserSession, router]);

  const handleOpenApiDocs = () => {
    handleClose();
    window.open('https://docs.taropay.com/guide/overview', '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      sx={[
        { px: 2, py: 3, display: 'flex', justifyContent: 'center' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <IconButton
          component={m.button}
          whileTap={varTap(0.96)}
          whileHover={varHover(1.04)}
          transition={transitionTap()}
          onClick={handleOpen}
          sx={{ p: 0 }}
        >
          <AnimateBorder
            sx={{ p: '3px', borderRadius: '50%', width: 40, height: 40 }}
            slotProps={{
              primaryBorder: { size: 60, width: '1px', sx: { color: 'primary.main' } },
              secondaryBorder: { sx: { color: 'warning.main' } },
            }}
          >
            <Avatar src={_mock.image.avatar(24)} alt={displayName} sx={{ width: 1, height: 1 }}>
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
          </AnimateBorder>
        </IconButton>

        <Typography variant="body2" noWrap sx={{ maxWidth: 1, color: 'text.secondary' }}>
          {displayName}
        </Typography>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: { width: 200, mt: -1 },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>
          {permissions?.user?.account && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {permissions.user.account}
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList sx={{ py: 1 }}>
          <MenuItem onClick={handleOpenApiDocs} sx={{ borderRadius: 1 }}>
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
          <MenuItem onClick={handleLogout} sx={{ borderRadius: 1, color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'inherit', mr: 0 }}>
              <Iconify icon="solar:logout-2-bold-duotone" />
            </ListItemIcon>
            <ListItemText
              primary={t('common.logout')}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </MenuItem>
        </MenuList>
      </Popover>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function UpgradeBlock({ sx, ...other }: BoxProps) {
  return (
    <Box
      sx={[
        (theme) => ({
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(135deg, ${varAlpha(theme.vars.palette.error.lightChannel, 0.92)}, ${varAlpha(theme.vars.palette.secondary.darkChannel, 0.92)})`,
              `url(${CONFIG.assetsDir}/assets/background/background-7.webp)`,
            ],
          }),
          px: 3,
          py: 4,
          borderRadius: 2,
          position: 'relative',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        sx={(theme) => ({
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          borderRadius: 2,
          position: 'absolute',
          border: `solid 3px ${varAlpha(theme.vars.palette.common.whiteChannel, 0.16)}`,
        })}
      />

      <Box
        component={m.img}
        animate={{ y: [12, -12, 12] }}
        transition={{
          duration: 8,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 0,
        }}
        alt="Small Rocket"
        src={`${CONFIG.assetsDir}/assets/illustrations/illustration-rocket-small.webp`}
        sx={{
          right: 0,
          width: 112,
          height: 112,
          position: 'absolute',
        }}
      />

      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Box component="span" sx={{ typography: 'h5', color: 'common.white' }}>
          TaroPay
        </Box>

        <Box
          component="span"
          sx={{
            mb: 2,
            mt: 0.5,
            color: 'common.white',
            typography: 'subtitle2',
          }}
        >
          Global Payment Platform
        </Box>

        <Box
          component="span"
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            typography: 'caption',
            color: 'common.white',
            bgcolor: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.16),
          }}
        >
          v{CONFIG.appVersion}
        </Box>
      </Box>
    </Box>
  );
}
