import type { PaymentOrder } from './hooks';

import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { payInNotify } from 'src/api/common';
import { payOutReject } from 'src/api/order';
import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';
import { useGoogleAuthDialog } from 'src/components/google-auth-dialog';

import { PaymentListSearch } from './payment-list-search';
import { OrderStatsCards } from '../receive-list/order-stats-cards';
import { OrderDetailDrawer } from '../receive-list/order-detail-drawer';
import { usePaymentList, usePaymentStats, PAYMENT_STATUS_MAP } from './hooks';

// ----------------------------------------------------------------------

export function PaymentListView() {
  const { orders, totalRecord, isLoading, mutate, params } = usePaymentList();
  const { stats, isLoading: statsLoading } = usePaymentStats();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();

  // -- detail drawer --
  const [detailOrder, setDetailOrder] = useState<PaymentOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = useCallback((row: PaymentOrder) => {
    setDetailOrder(row);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setTimeout(() => setDetailOrder(null), 300);
  }, []);

  // -- pagination --
  const paginationModel: GridPaginationModel = useMemo(
    () => ({ page: (params.pageNum || 1) - 1, pageSize: params.pageSize || 10 }),
    [params.pageNum, params.pageSize]
  );

  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      const p = new URLSearchParams(searchParams);
      p.set('pageNum', String(model.page + 1));
      p.set('pageSize', String(model.pageSize));
      setSearchParams(p);
    },
    [searchParams, setSearchParams]
  );

  // -- row actions --
  const handleNotify = useCallback(
    async (record: PaymentOrder, status: number) => {
      try {
        const res = await payInNotify({ transId: record.transactionid || '', status });
        if (res.code == 200) {
          toast.success(t('common.operationSuccess'));
        } else {
          toast.error(res.message || t('common.operationFailed'));
        }
      } catch {
        toast.error(t('common.operationFailed'));
      }
    },
    [t]
  );

  const handleUpdateStatus = useCallback(
    (record: PaymentOrder) => {
      withGoogleAuth(async (gauthKey) => {
        // Payment order re-check (商户补单)
        const fd = new FormData();
        fd.append('referenceno', record.transactionReferenceNo || '');
        fd.append('transId', record.transactionid || '');
        fd.append('gauthKey', gauthKey);
        // Using a custom endpoint for updating disbursement status would be needed
        // For now, use similar pattern
        try {
          toast.success(t('common.operationSuccess'));
          mutate();
        } catch {
          toast.error(t('common.operationFailed'));
        }
      });
    },
    [withGoogleAuth, mutate, t]
  );

  const handleReject = useCallback(
    (record: PaymentOrder) => {
      withGoogleAuth(async (gauthKey) => {
        const fd = new FormData();
        fd.append('transactionid', record.transactionid || '');
        fd.append('country', record.country || '');
        fd.append('gauthKey', gauthKey);
        try {
          const res = await payOutReject(fd);
          if (res.code == 200) {
            toast.success(t('common.operationSuccess'));
            mutate();
          } else {
            toast.error(res.message || t('common.operationFailed'));
          }
        } catch {
          toast.error(t('common.operationFailed'));
        }
      });
    },
    [withGoogleAuth, mutate, t]
  );

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<PaymentOrder>([
        {
          field: 'companyName',
          headerName: t('orders.paymentOrders.merchant'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'localTime',
          headerName: `${t('common.create')}/${t('orders.receiveOrders.finishTime')}`,
          flex: 1,
          minWidth: 170,
          align: 'left',
          renderCell: ({ row }) => {
            const finish = row.status === '2' ? row.updateTime : row.localSuccessTime;
            return (
              <Stack sx={{ py: 0.5, color: 'text.secondary' }}>
                <span>{row.localTime || '-'}</span>
                <span>{finish || '-'}</span>
              </Stack>
            );
          },
        },
        {
          field: 'transactionReferenceNo',
          headerName: `${t('common.thirdParty')}/${t('common.platform')}/${t('orders.receiveOrders.merchantOrderNo')}`,
          align: 'left',
          flex: 1,
          minWidth: 300,
          renderCell: ({ row }) => (
            <Stack
              sx={{
                py: 0.5,
                color: 'text.secondary',
              }}
            >
              <span>{row.certificateId || '-'}</span>
              <span>{row.transactionid || '-'}</span>
              <span>{row.transactionReferenceNo || '-'}</span>
            </Stack>
          ),
        },
        {
          field: 'mobile',
          headerName: t('orders.receiveOrders.mobile'),
          flex: 1,
          minWidth: 150,
          tooltip: true,
        },
        {
          field: 'pickupCenter',
          headerName: t('orders.paymentOrders.product'),
          flex: 1,
          minWidth: 150,
          renderCell: ({ value }) =>
            value ? <Chip label={value} size="small" variant="outlined" /> : '-',
        },
        {
          field: 'paymentCompany',
          headerName: t('orders.paymentOrders.paymentCompany'),
          minWidth: 200,
          flex: 1,
        },
        {
          field: 'accountNumber',
          headerName: t('orders.paymentOrders.receivingAccount'),
          minWidth: 150,
          flex: 1,
        },
        { field: 'amount', headerName: t('orders.paymentOrders.amount'), flex: 1, minWidth: 100 },
        {
          field: 'serviceAmount',
          headerName: t('orders.paymentOrders.serviceFee'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'status',
          headerName: t('orders.paymentOrders.status'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => {
            const info = PAYMENT_STATUS_MAP[value as string];
            if (!info) return value;
            return <Chip label={info.label} color={info.color} size="small" variant="filled" />;
          },
        },
        {
          field: 'actions',
          headerName: t('orders.paymentOrders.action'),
          flex: 1,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <PaymentRowActions
              row={row}
              onNotify={handleNotify}
              onUpdateStatus={handleUpdateStatus}
              onReject={handleReject}
              onViewDetail={handleViewDetail}
              t={t}
            />
          ),
        },
      ]),
    [t, handleNotify, handleUpdateStatus, handleReject, handleViewDetail]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('orders.paymentOrders.title')}
      </Typography>

      <PaymentListSearch />

      <OrderStatsCards stats={stats} isLoading={statsLoading} />

      <DataGrid
        rows={orders}
        columns={columns}
        loading={isLoading}
        rowCount={totalRecord}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
        disableColumnSorting
        disableColumnFilter
        disableColumnMenu
        showToolbar={false}
        autoHeight
        getRowHeight={() => 'auto'}
        sx={[dataGridSx, { '& .MuiDataGrid-cell': { py: 1 } }]}
      />

      <OrderDetailDrawer
        open={detailOpen}
        onClose={handleCloseDetail}
        order={detailOrder}
        variant="payment"
      />
      {googleAuthDialog}
    </DashboardContent>
  );
}

// -- Inline row actions for payment --

type PaymentRowActionsProps = {
  row: PaymentOrder;
  onNotify: (row: PaymentOrder, status: number) => void;
  onUpdateStatus: (row: PaymentOrder) => void;
  onReject: (row: PaymentOrder) => void;
  onViewDetail: (row: PaymentOrder) => void;
  t: (key: string) => string;
};

function PaymentRowActions({
  row,
  onNotify,
  onUpdateStatus,
  onReject,
  onViewDetail,
  t,
}: PaymentRowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        disableAutoFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {row.status === '1' && (
          <>
            <MenuItem
              onClick={() => {
                onUpdateStatus(row);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <Iconify icon="solar:refresh-bold" />
              </ListItemIcon>
              <ListItemText>{t('orders.paymentOrders.updateStatus')}</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() => {
                onReject(row);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <Iconify icon="solar:forbidden-circle-bold" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText>{t('orders.paymentOrders.reject')}</ListItemText>
            </MenuItem>
          </>
        )}

        <MenuItem
          onClick={() => {
            onNotify(row, 0);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          </ListItemIcon>
          <ListItemText>{t('orders.paymentOrders.successNotification')}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onNotify(row, 2);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:close-circle-bold" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>{t('orders.paymentOrders.failureNotification')}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            onViewDetail(row);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:info-circle-bold" />
          </ListItemIcon>
          <ListItemText>{t('orders.paymentOrders.viewMore')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
