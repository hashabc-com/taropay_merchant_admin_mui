import type { TransactionSummaryRow } from 'src/api/order';

import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { prepareExportSummary } from 'src/api/order';
import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useTransactionSummaryList } from './hooks';
import { TransactionSummarySearch } from './transaction-summary-search';
import { TransactionSummaryDetailDrawer } from './transaction-summary-detail-drawer';

// ----------------------------------------------------------------------

export function TransactionSummaryView() {
  const { rows, totalRecord, isLoading, params } = useTransactionSummaryList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // -- detail drawer --
  const [detailRow, setDetailRow] = useState<TransactionSummaryRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = useCallback((row: TransactionSummaryRow) => {
    setDetailRow(row);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setTimeout(() => setDetailRow(null), 300);
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

  // -- export --
  const handleExport = useCallback(
    async (exportParams: { startTime?: string; endTime?: string }) => {
      try {
        const res = await prepareExportSummary(exportParams);
        if (res.code == 1) {
          toast.success(t('common.exportTaskCreated'));
        } else {
          toast.error(res.message || t('common.exportFailed'));
        }
      } catch {
        toast.error(t('common.exportFailed'));
      }
    },
    [t]
  );

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<TransactionSummaryRow>([
        {
          field: 'localTime',
          headerName: t('orders.transactionSummary.date'),
          flex: 1,
          minWidth: 120,
          valueGetter: (_value, row) => row.localTime || row.dealTime || '-',
        },
        {
          field: 'payinAmount',
          headerName: t('orders.transactionSummary.collectionAmount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'payinServiceAmount',
          headerName: t('orders.transactionSummary.collectionFee'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'payinTotalAmount',
          headerName: t('orders.transactionSummary.creditAmount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'payoutAmount',
          headerName: t('orders.transactionSummary.paymentAmount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'payoutServiceAmount',
          headerName: t('orders.transactionSummary.paymentFee'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'payoutTotalAmount',
          headerName: t('orders.transactionSummary.deductionAmount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'finalAmount',
          headerName: t('orders.transactionSummary.balance'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'actions',
          headerName: t('orders.transactionSummary.action'),
          flex: 1,
          minWidth: 80,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <IconButton size="small" onClick={() => handleViewDetail(row)}>
              <Iconify icon="solar:info-circle-bold" />
            </IconButton>
          ),
        },
      ]),
    [t, handleViewDetail]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('orders.transactionSummary.title')}
      </Typography>

      <TransactionSummarySearch onExport={handleExport} />

      <DataGrid
        rows={rows}
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
        sx={dataGridSx}
      />

      <TransactionSummaryDetailDrawer
        open={detailOpen}
        onClose={handleCloseDetail}
        row={detailRow}
      />
    </DashboardContent>
  );
}
