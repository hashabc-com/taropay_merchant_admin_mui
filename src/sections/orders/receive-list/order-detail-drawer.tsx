import type { Order } from './types';
import type { PaymentOrder } from '../payment-list/hooks';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { ORDER_STATUS_MAP } from './types';
import { PAYMENT_STATUS_MAP } from '../payment-list/hooks';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order | PaymentOrder | null;
  /** @default 'receive' */
  variant?: 'receive' | 'payment';
};

export function OrderDetailDrawer({ open, onClose, order, variant = 'receive' }: Props) {
  const { t } = useLanguage();

  const statusMap = variant === 'payment' ? PAYMENT_STATUS_MAP : ORDER_STATUS_MAP;
  const statusInfo = order
    ? (statusMap[order.status as string] ?? {
        label: order.status,
        color: 'default' as const,
      })
    : { label: '', color: 'default' as const };

  // Resolve field names based on variant
  const merchantOrderNo =
    variant === 'payment'
      ? (order as PaymentOrder)?.transactionReferenceNo
      : (order as Order)?.referenceno;

  const platformOrderNo =
    variant === 'payment' ? (order as PaymentOrder)?.transactionid : (order as Order)?.transId;

  const thirdPartyOrderNo =
    variant === 'payment'
      ? (order as PaymentOrder)?.certificateId
      : (order as Order)?.tripartiteOrder;

  const finishTime =
    variant === 'payment'
      ? ((order as PaymentOrder)?.localSuccessTime ?? (order as PaymentOrder)?.updateTime)
      : order?.status === '支付失败'
        ? (order as Order)?.updateTime
        : (order as Order)?.localPaymentDate;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
    >
      {order && (
        <>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2.5, py: 2 }}
          >
            <Typography variant="h6">{t('orders.receiveOrders.orderDetails')}</Typography>
            <IconButton onClick={onClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>

          <Divider />

          {/* Content */}
          <Box sx={{ px: 2.5, py: 3, overflowY: 'auto', flex: 1 }}>
            <Stack spacing={3}>
              <DetailRow label={t('orders.receiveOrders.status')}>
                <Chip
                  label={statusInfo.label}
                  color={statusInfo.color}
                  size="small"
                  variant="filled"
                />
              </DetailRow>
              {variant === 'receive' && order.status === '支付失败' && (order as Order).message && (
                <DetailRow label={t('orders.receiveOrders.failReason')}>
                  <Typography variant="body2" color="error.main">
                    {(order as Order).message}
                  </Typography>
                </DetailRow>
              )}

              {variant === 'payment' &&
                order.status === '付款失败' &&
                (order as PaymentOrder).address && (
                  <DetailRow label={t('orders.receiveOrders.failReason')}>
                    <Typography variant="body2" color="error.main">
                      {(order as PaymentOrder).address}
                    </Typography>
                  </DetailRow>
                )}
              <Divider />

              <SectionTitle>{t('orders.receiveOrders.merchant')}</SectionTitle>

              <DetailRow label={t('orders.receiveOrders.merchant')}>
                {order.companyName || '-'}
              </DetailRow>
              <DetailRow label={t('orders.receiveOrders.mobile')}>{order.mobile || '-'}</DetailRow>
              <DetailRow label={t('signIn.username')}>{order.userName || '-'}</DetailRow>

              <Divider />

              <SectionTitle>{t('orders.receiveOrders.merchantOrderNo')}</SectionTitle>

              <DetailRow label={t('orders.receiveOrders.merchantOrderNo')}>
                {merchantOrderNo || '-'}
              </DetailRow>
              <DetailRow label={t('orders.receiveOrders.platformOrderNo')}>
                {platformOrderNo || '-'}
              </DetailRow>
              <DetailRow label={t('orders.receiveOrders.thirdPartyOrderNo')}>
                {thirdPartyOrderNo || '-'}
              </DetailRow>

              <Divider />

              <SectionTitle>{t('orders.receiveOrders.product')}</SectionTitle>

              <DetailRow label={t('orders.receiveOrders.product')}>
                {order.pickupCenter ? (
                  <Chip label={order.pickupCenter} size="small" variant="outlined" />
                ) : (
                  '-'
                )}
              </DetailRow>
              {/* <DetailRow label={t('common.channel')}>{order.paymentCompany || '-'}</DetailRow> */}

              {variant === 'payment' && (order as PaymentOrder)?.accountNumber && (
                <DetailRow label={t('orders.paymentOrders.receivingAccount')}>
                  {(order as PaymentOrder).accountNumber}
                </DetailRow>
              )}

              <Divider />

              <SectionTitle>{t('orders.receiveOrders.orderAmount')}</SectionTitle>

              <DetailRow label={t('orders.receiveOrders.orderAmount')} bold>
                {order.amount ?? '-'}
              </DetailRow>
              {variant === 'receive' && (
                <DetailRow label={t('orders.receiveOrders.realAmount')} bold>
                  {(order as Order).realAmount ?? '-'}
                </DetailRow>
              )}
              <DetailRow label={t('orders.receiveOrders.serviceFee')} bold>
                {order.serviceAmount ?? '-'}
              </DetailRow>

              <Divider />

              <SectionTitle>{t('orders.receiveOrders.createTime')}</SectionTitle>

              <DetailRow label={t('orders.receiveOrders.createTime')}>
                {order.localTime || (order as Order).createTime || '-'}
              </DetailRow>
              <DetailRow label={t('orders.receiveOrders.finishTime')}>
                {finishTime || '-'}
              </DetailRow>
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
  mono?: boolean;
  bold?: boolean;
};

function DetailRow({ label, children, mono, bold }: DetailRowProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0, minWidth: 90 }}>
        {label}
      </Typography>
      <Typography
        component="div"
        variant="body2"
        sx={{
          textAlign: 'right',
          wordBreak: 'break-all',
          ...(mono && { fontFamily: 'monospace', fontSize: 13 }),
          ...(bold && { fontWeight: 600 }),
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}
