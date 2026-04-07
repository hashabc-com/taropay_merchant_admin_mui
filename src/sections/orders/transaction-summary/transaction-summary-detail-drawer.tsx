import type { TransactionSummaryRow } from 'src/api/order';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  row: TransactionSummaryRow | null;
};

export function TransactionSummaryDetailDrawer({ open, onClose, row }: Props) {
  const { t } = useLanguage();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 540 } } }}
    >
      {row && (
        <>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2.5, py: 2 }}
          >
            <Typography variant="h6">{t('orders.transactionSummary.summaryDetails')}</Typography>
            <IconButton onClick={onClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>

          <Divider />

          {/* Content */}
          <Box sx={{ px: 2.5, py: 3, overflowY: 'auto', flex: 1 }}>
            <Stack spacing={3}>
              {/* 交易日期 */}
              <DetailRow label={t('orders.transactionSummary.date')}>
                {row.localTime || row.dealTime || '-'}
              </DetailRow>

              <Divider />

              {/* 收款信息 */}
              <SectionTitle>{t('orders.transactionSummary.collectionInfo')}</SectionTitle>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <DetailRow label={t('orders.transactionSummary.collectionAmount')}>
                  {row.payinAmount ?? '-'}
                </DetailRow>
                <DetailRow label={t('orders.transactionSummary.collectionCount')}>
                  {row.payinBillCount ?? '-'}
                </DetailRow>
                <DetailRow label={t('orders.transactionSummary.collectionFee')}>
                  {row.payinServiceAmount ?? '-'}
                </DetailRow>
                <DetailRow label={t('orders.transactionSummary.creditAmount')}>
                  {row.payinTotalAmount ?? '-'}
                </DetailRow>
              </Box>

              <Divider />

              {/* 付款信息 */}
              <SectionTitle>{t('orders.transactionSummary.paymentInfo')}</SectionTitle>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <DetailRow label={t('orders.transactionSummary.paymentAmount')}>
                  {row.payoutAmount ?? '-'}
                </DetailRow>
                <DetailRow label={t('orders.transactionSummary.paymentCount')}>
                  {row.payoutBillCount ?? '-'}
                </DetailRow>
                <DetailRow label={t('orders.transactionSummary.paymentFee')}>
                  {row.payoutServiceAmount ?? '-'}
                </DetailRow>
                <DetailRow label={t('orders.transactionSummary.deductionAmount')}>
                  {row.payoutTotalAmount ?? '-'}
                </DetailRow>
              </Box>

              <Divider />

              {/* 其他信息 */}
              <SectionTitle>{t('orders.transactionSummary.otherInfo')}</SectionTitle>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <DetailRow label={t('orders.transactionSummary.rechargeAmount')}>
                  {row.rechargeAmount ?? '-'}
                </DetailRow>
                <DetailRow label={t('orders.transactionSummary.withdrawalAmount')}>
                  {row.withdrawalAmount ?? '-'}
                </DetailRow>
                <DetailRow label={t('orders.transactionSummary.balance')}>
                  {row.finalAmount ?? '-'}
                </DetailRow>
              </Box>
            </Stack>
          </Box>

          {/* Footer */}
          <Divider />
          <Box sx={{ p: 2.5 }}>
            <Button variant="outlined" fullWidth onClick={onClose}>
              {t('common.close')}
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
}

// ----------------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

// ----------------------------------------------------------------------

type DetailRowProps = {
  label: string;
  children: React.ReactNode;
};

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2">{children}</Typography>
    </Stack>
  );
}
