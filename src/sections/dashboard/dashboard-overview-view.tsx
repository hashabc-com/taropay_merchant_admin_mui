import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { varFade, MotionViewport } from 'src/components/animate';

import { DashboardChart } from './dashboard-chart';
import { DashboardStats } from './dashboard-stats';
import { DashboardWelcome } from './dashboard-welcome';
import { DashboardFlowCards } from './dashboard-flow-cards';
import { useDashboardChart, useDashboardAmount } from './hooks';

// ----------------------------------------------------------------------

export function DashboardOverviewView() {
  const { t } = useLanguage();
  const { amountInfo, isLoading: amountLoading } = useDashboardAmount();
  const { chartResult, isLoading: chartLoading } = useDashboardChart();

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('dashboard.title')}
      </Typography>

      <MotionViewport>
        <Stack spacing={3}>
          {/* Welcome + Flow Cards Row */}
          <m.div variants={varFade('inUp', { distance: 40 })}>
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              }}
            >
              <DashboardWelcome />
              <DashboardFlowCards chartResult={chartResult} isLoading={chartLoading} />
            </Box>
          </m.div>

          {/* Chart */}
          <m.div variants={varFade('inUp', { distance: 40 })}>
            <DashboardChart chartData={chartResult?.data} />
          </m.div>

          {/* Balance Stats Cards */}
          <m.div variants={varFade('inUp', { distance: 40 })}>
            <DashboardStats amountInfo={amountInfo} isLoading={amountLoading} />
          </m.div>
        </Stack>
      </MotionViewport>
    </DashboardContent>
  );
}
