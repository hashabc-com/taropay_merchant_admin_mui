import dayjs from 'dayjs';
import { toast } from 'sonner';
import { m } from 'framer-motion';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { varFade, MotionViewport } from 'src/components/animate';
import { type DateTimeRangeValue } from 'src/components/date-time-range-picker';

import { DashboardChart } from './dashboard-chart';
import { DashboardStats } from './dashboard-stats';
import { DashboardWelcome } from './dashboard-welcome';
import { DashboardFlowCards } from './dashboard-flow-cards';
import { useDashboardChart, useDashboardAmount } from './hooks';

// ----------------------------------------------------------------------

const DATE_FORMAT = 'YYYY-MM-DD';

function getDefaultRange(): DateTimeRangeValue {
  return [dayjs().subtract(6, 'day'), dayjs()];
}

export function DashboardOverviewView() {
  const { t } = useLanguage();
  const { amountInfo, isLoading: amountLoading } = useDashboardAmount();

  // -- date range for chart --
  const [dateRange, setDateRange] = useState<DateTimeRangeValue>(getDefaultRange);

  const chartParams = useMemo(
    () => ({
      startTime: dateRange[0]?.format(DATE_FORMAT) || '',
      endTime: dateRange[1]?.format(DATE_FORMAT) || '',
    }),
    [dateRange]
  );

  const { chartResult, isLoading: chartLoading } = useDashboardChart(chartParams);

  // Restrict max range to 1 month, min range to 2 days
  const handleDateChange = (value: DateTimeRangeValue) => {
    const [start, end] = value;
    if (start && end) {
      if (start.isSame(end, 'day')) {
        toast.warning(t('dashboard.dateRangeMinWarning'));
        return;
      }
      if (end.diff(start, 'day') > 30) {
        setDateRange([start, start.add(30, 'day')]);
        return;
      }
    }
    setDateRange(value);
  };

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
            <DashboardChart
              chartData={chartResult?.data}
              isLoading={chartLoading}
              dateRange={dateRange}
              onDateChange={handleDateChange}
            />
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
