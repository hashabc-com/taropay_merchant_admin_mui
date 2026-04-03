import type { OrderStats } from './types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type StatCardData = {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bgcolor: string;
};

function StatCard({ label, value, icon, color, bgcolor }: StatCardData) {
  return (
    <Card
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderLeft: 3,
        borderColor: color,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor,
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={22} sx={{ color }} />
      </Box>

      <Box>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

type Props = {
  stats: OrderStats;
  isLoading?: boolean;
};

export function OrderStatsCards({ stats, isLoading }: Props) {
  const { t } = useLanguage();

  const cards: StatCardData[] = [
    {
      label: t('orders.stats.totalOrders'),
      value: isLoading ? '-' : stats.totalOrders.toLocaleString(),
      icon: 'solar:hashtag-bold',
      color: 'primary.main',
      bgcolor: 'primary.lighter',
    },
    {
      label: t('orders.stats.successOrders'),
      value: isLoading ? '-' : stats.successOrders.toLocaleString(),
      icon: 'solar:check-circle-bold',
      color: 'success.main',
      bgcolor: 'success.lighter',
    },
    {
      label: t('orders.stats.successRate'),
      value: isLoading ? '-' : `${stats.successRate}%`,
      icon: 'solar:graph-up-bold',
      color: 'warning.main',
      bgcolor: 'warning.lighter',
    },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={80} />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 2,
        mb: 3,
      }}
    >
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </Box>
  );
}
