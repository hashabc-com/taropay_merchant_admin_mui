import type { FundsDetailRecord } from './hooks';

import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useFundsDetailList } from './hooks';
import { FundsDetailSearch } from './funds-detail-search';

// ----------------------------------------------------------------------

export function FundsDetailView() {
  const { records, totalRecord, isLoading } = useFundsDetailList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const paginationModel: GridPaginationModel = useMemo(() => {
    const pageNum = Number(searchParams.get('pageNum')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    return { page: pageNum - 1, pageSize };
  }, [searchParams]);

  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      const p = new URLSearchParams(searchParams);
      p.set('pageNum', String(model.page + 1));
      p.set('pageSize', String(model.pageSize));
      setSearchParams(p);
    },
    [searchParams, setSearchParams]
  );

  const columns = useMemo(
    () =>
      processColumns<FundsDetailRecord>([
        {
          field: 'typeName',
          headerName: t('fund.fundsDetail.fundType'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'orderNo',
          headerName: t('fund.fundsDetail.orderNo'),
          flex: 1,
          minWidth: 200,
          tooltip: true,
        },
        {
          field: 'befAmountChanges',
          headerName: t('fund.fundsDetail.originalAmount'),
          flex: 1,
          minWidth: 130,
        },
        {
          field: 'amount',
          headerName: t('fund.fundsDetail.changeAmount'),
          flex: 1,
          minWidth: 130,
        },
        {
          field: 'aftAmountChanges',
          headerName: t('fund.fundsDetail.afterChangeAmount'),
          flex: 1,
          minWidth: 130,
        },
        {
          field: 'localTime',
          headerName: t('fund.fundsDetail.changeDateTime'),
          flex: 1,
          minWidth: 180,
        },
      ]),
    [t]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('fund.fundsDetail.title')}
      </Typography>

      <FundsDetailSearch />

      <DataGrid
        rows={records}
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
    </DashboardContent>
  );
}
