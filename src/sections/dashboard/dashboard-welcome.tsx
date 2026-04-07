import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthStore } from 'src/stores/auth-store';
import { useLanguage } from 'src/context/language-provider';
import MotivationIllustration from 'src/assets/illustrations/motivation-illustration';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function DashboardWelcome() {
  const { t } = useLanguage();
  const { userInfo } = useAuthStore();
  const router = useRouter();

  return (
    <Card
      sx={{
        p: { xs: 3, md: 5 },
        // display: 'flex',
        // alignItems: 'center',
        justifyContent: 'space-between',
        // background: (theme) =>
        //   `linear-gradient(135deg, ${theme.vars.palette.primary.darker} 0%, ${theme.vars.palette.primary.dark} 100%)`,
        // color: 'common.white',
        // borderRadius: 3,
        // position: 'relative',
        overflow: 'hidden',

        backgroundImage:
          'linear-gradient(to right, var(--palette-grey-900) 25%, rgba(var(--palette-primary-darkerChannel) / 88%)),url(/public/assets/background/background-6.webp)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        paddingTop: 'calc(5 * var(--spacing))',
        paddingBottom: 'calc(5 * var(--spacing))',
        paddingRight: 'calc(3 * var(--spacing))',
        gap: 'calc(5 * var(--spacing))',
        borderRadius: 'calc(2 * var(--shape-borderRadius))',
        display: 'flex',
        position: 'relative',
        WebkitBoxAlign: 'center',
        alignItems: 'center',
        color: 'var(--palette-common-white)',
        border: 'solid 1px var(--palette-grey-800)',
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.08)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -40,
          right: 100,
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.06)',
        }}
      />

      <Box sx={{ zIndex: 1 }}>
        <Typography variant="h4" sx={{ mb: 1, color: 'inherit' }}>
          {t('dashboard.subtitle')}{' '}
          <Box component="span" sx={{ opacity: 0.9 }}>
            {userInfo?.name || ''}
          </Box>
          {' 👋'}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'inherit', opacity: 0.72 }}>
          {t('dashboard.welcomeDescription')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Iconify icon="solar:card-transfer-bold" />}
            onClick={() => router.push(paths.fund.rechargeWithdraw)}
            sx={{ fontWeight: 600 }}
          >
            {t('dashboard.goToRechargeWithdraw')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:download-minimalistic-bold" />}
            onClick={() => router.push(paths.orders.receiveLists)}
            sx={{
              fontWeight: 600,
              color: 'common.white',
              borderColor: 'rgba(255,255,255,0.48)',
              '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            {t('dashboard.goToCollection')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
            onClick={() => router.push(paths.orders.paymentLists)}
            sx={{
              fontWeight: 600,
              color: 'common.white',
              borderColor: 'rgba(255,255,255,0.48)',
              '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            {t('dashboard.goToPayment')}
          </Button>
        </Box>
      </Box>

      {/* Illustration */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          flexShrink: 0,
          ml: 3,
          zIndex: 1,
        }}
      >
        <MotivationIllustration
          sx={{
            width: 260,
            height: 'auto',
            '& path, & circle, & ellipse, & rect, & polygon': {
              fill: 'currentColor',
            },
          }}
        />
      </Box>
    </Card>
  );
}
