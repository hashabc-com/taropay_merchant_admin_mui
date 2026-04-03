import { toast } from 'sonner';
import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { prepareExportReceive } from 'src/api/order';
import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { ReceiveSummarySearch } from './receive-summary-search';
import { useReceiveSummaryList, type ReceiveSummaryRow } from './hooks';

// ----------------------------------------------------------------------

export function ReceiveSummaryView() {
  const { rows, totalRecord, totals, isLoading, params } = useReceiveSummaryList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

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
        const res = await prepareExportReceive(exportParams);
        if (res.code == 200) {
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
      processColumns<ReceiveSummaryRow>([
        {
          field: 'companyName',
          headerName: t('orders.receiveSummary.merchant'),
          sortable: false,
          minWidth: 120,
          flex: 1,
        },
        {
          field: 'paymentCompany',
          headerName: t('orders.receiveSummary.paymentChannel'),
          sortable: false,
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) =>
            value ? <Chip label={value} size="small" variant="outlined" /> : '-',
        },
        {
          field: 'dealTime',
          headerName: t('orders.receiveSummary.transactionTime'),
          sortable: false,
          minWidth: 100,
          flex: 1,
        },
        {
          field: 'billCount',
          headerName: t('orders.receiveSummary.orderCount'),
          sortable: false,
          minWidth: 80,
          flex: 1,
        },
        {
          field: 'amount',
          headerName: t('orders.receiveSummary.amount'),
          sortable: false,
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'serviceAmount',
          headerName: t('orders.receiveSummary.serviceFee'),
          sortable: false,
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'totalAmount',
          headerName: t('orders.receiveSummary.totalAmount'),
          sortable: false,
          flex: 1,
          minWidth: 100,
        },
      ]),
    [t]
  );

  // -- summary row appended to data --
  const dataWithSummary = useMemo(() => {
    if (!totals.orderTotal && !totals.amountTotal) return rows;
    return [
      ...rows,
      {
        id: -1,
        companyName: t('common.total'),
        paymentCompany: '',
        dealTime: '',
        billCount: totals.orderTotal ?? '',
        amount: totals.amountTotal ?? '',
        serviceAmount: totals.amountServiceTotal ?? '',
        totalAmount: totals.totalAmountTotal ?? '',
      } as ReceiveSummaryRow,
    ];
  }, [rows, totals, t]);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('orders.receiveSummary.title')}
      </Typography>

      <ReceiveSummarySearch onExport={handleExport} />

      <DataGrid
        rows={dataWithSummary}
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
    </DashboardContent>
  );
}
