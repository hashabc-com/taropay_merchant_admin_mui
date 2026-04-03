import type { ApexOptions } from 'apexcharts';
import type { DayChartData } from 'src/api/dashboard';

import ReactApexChart from 'react-apexcharts';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { useTheme, useColorScheme } from '@mui/material/styles';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { useLanguage } from 'src/context/language-provider';
import { BookingIllustration } from 'src/assets/illustrations';

// ----------------------------------------------------------------------
// ApexCharts renders in SVG/Canvas and cannot resolve CSS variables.
// MUI v7 CSS variables mode means `theme.palette.*` returns `var(--xxx)` strings
// that won't display correctly. We read computed values from the DOM instead.

function resolveCssVar(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function resolveChartColors() {
  const grey500Ch = resolveCssVar('--palette-grey-500Channel');
  return {
    primary: resolveCssVar('--palette-primary-main'),
    warning: resolveCssVar('--palette-warning-main'),
    textPrimary: resolveCssVar('--palette-text-primary'),
    textSecondary: resolveCssVar('--palette-text-secondary'),
    divider: grey500Ch ? `rgba(${grey500Ch}, 0.2)` : 'rgba(145, 158, 171, 0.2)',
  };
}

// ----------------------------------------------------------------------

type Props = {
  chartData?: DayChartData[];
};

type MetricKey = 'amount' | 'count' | 'service';

export function DashboardChart({ chartData }: Props) {
  const theme = useTheme();
  const { t } = useLanguage();
  const { mode, systemMode } = useColorScheme();
  const convertAmount = useConvertAmount();
  const [metric, setMetric] = useState<MetricKey>('amount');

  // Resolved mode: when user picks "system", use the actual OS preference
  const resolvedMode = (mode === 'system' ? systemMode : mode) || 'light';

  // Resolve CSS variable colors for ApexCharts.
  // Must run in useEffect (after DOM paint) so CSS vars reflect the new color scheme.
  const [chartColors, setChartColors] = useState(() => resolveChartColors());

  useEffect(() => {
    // requestAnimationFrame ensures the browser has applied the new data-color-scheme styles
    const raf = requestAnimationFrame(() => {
      setChartColors(resolveChartColors());
    });
    return () => cancelAnimationFrame(raf);
  }, [resolvedMode]);

  const metricConfig: Record<
    MetricKey,
    { collectKey: string; payoutKey: string; collectLabel: string; payoutLabel: string }
  > = useMemo(
    () => ({
      amount: {
        collectKey: 'collectAmount',
        payoutKey: 'payoutAmount',
        collectLabel: t('dashboard.collectionAmount'),
        payoutLabel: t('dashboard.paymentAmount'),
      },
      count: {
        collectKey: 'collectCount',
        payoutKey: 'payoutCount',
        collectLabel: t('dashboard.collectionCount'),
        payoutLabel: t('dashboard.paymentCount'),
      },
      service: {
        collectKey: 'collectServiceAmount',
        payoutKey: 'payoutServiceAmount',
        collectLabel: t('dashboard.collectionFee'),
        payoutLabel: t('dashboard.paymentFee'),
      },
    }),
    [t]
  );

  const config = metricConfig[metric];

  const processedData = useMemo(
    () =>
      (chartData || []).map((item) => ({
        date: item.date,
        collect: Number(
          convertAmount(item[config.collectKey as keyof DayChartData] as string, false, false)
        ),
        payout: Number(
          convertAmount(item[config.payoutKey as keyof DayChartData] as string, false, false)
        ),
      })),
    [chartData, convertAmount, config]
  );

  const categories = processedData.map((d) => d.date?.slice(5) || '');
  const collectSeries = processedData.map((d) => d.collect || 0);
  const payoutSeries = processedData.map((d) => d.payout || 0);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: theme.typography.fontFamily,
    },
    colors: [chartColors.primary, chartColors.warning],
    stroke: { width: 2.5, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: chartColors.textSecondary, fontSize: '12px' } },
    },
    yaxis: {
      labels: {
        style: { colors: chartColors.textSecondary, fontSize: '12px' },
        formatter: (val: number) =>
          metric === 'count'
            ? String(Math.round(val))
            : new Intl.NumberFormat().format(Math.round(val)),
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: chartColors.divider,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: resolvedMode,
      x: { show: true },
      y: {
        formatter: (val: number) =>
          metric === 'count'
            ? String(Math.round(val))
            : new Intl.NumberFormat().format(Math.round(val)),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: chartColors.textPrimary },
      fontSize: '13px',
      itemMargin: { horizontal: 12 },
      onItemClick: { toggleDataSeries: false },
      onItemHover: { highlightDataSeries: true },
    },
    dataLabels: { enabled: false },
  };

  const series = [
    { name: config.collectLabel, data: collectSeries },
    { name: config.payoutLabel, data: payoutSeries },
  ];

  return (
    <Card>
      <CardHeader
        title={t('dashboard.collectionPaymentStats')}
        subheader={t('dashboard.recentDaysComparison')}
        action={
          <Tabs
            value={metric}
            onChange={(_, v) => setMetric(v)}
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                minHeight: 36,
                fontSize: 'body2.fontSize',
              },
              '& .MuiTabs-indicator': { borderRadius: 1 },
              minHeight: 36,
            }}
          >
            <Tab label={t('dashboard.totalAmount')} value="amount" />
            <Tab label={t('dashboard.orderCount')} value="count" />
            <Tab label={t('dashboard.serviceFee')} value="service" />
          </Tabs>
        }
        sx={{ p: 3, pb: 0 }}
      />

      <CardContent sx={{ pt: 2 }}>
        <Box sx={{ height: 320 }}>
          {processedData.length > 0 ? (
            <ReactApexChart
              key={resolvedMode}
              type="area"
              series={series}
              options={chartOptions}
              height="100%"
            />
          ) : (
            <Stack
              sx={{
                height: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookingIllustration sx={{ width: 160, height: 160 }} />
              <Typography variant="body2" sx={{ color: 'text.disabled', mt: 2 }}>
                {t('dashboard.noChartData')}
              </Typography>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
