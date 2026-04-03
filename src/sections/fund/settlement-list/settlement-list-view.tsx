import type { SettlementRecord } from './hooks';

import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { AUDIT_STATUS_MAP, useSettlementList } from './hooks';
import { SettlementListSearch } from './settlement-list-search';

// ----------------------------------------------------------------------

export function SettlementListView() {
  const { records, totalRecord, isLoading } = useSettlementList();
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
      processColumns<SettlementRecord>([
        {
          field: 'companyName',
          headerName: t('fund.settlement.merchant'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        { field: 'type', headerName: t('fund.settlement.type'), flex: 1, minWidth: 80 },
        {
          field: 'createTime',
          headerName: t('fund.settlement.operationDate'),
          flex: 1,
          minWidth: 160,
        },
        {
          field: 'rechargeAmount',
          headerName: t('fund.settlement.amount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'withdrawalType',
          headerName: t('fund.settlement.withdrawalCurrency'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'exchangeRate',
          headerName: t('fund.settlement.exchangeRate'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'finalAmount',
          headerName: t('fund.settlement.actualAmount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'remark',
          headerName: t('fund.settlement.remark'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'processStatus',
          headerName: t('fund.settlement.auditStatus'),
          flex: 1,
          minWidth: 120,
          renderCell: ({ value }) => {
            const info = AUDIT_STATUS_MAP[value as number];
            if (!info) return value;
            return <Chip label={t(info.label)} color={info.color} size="small" variant="filled" />;
          },
        },
      ]),
    [t]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('fund.settlement.title')}
      </Typography>

      <SettlementListSearch />

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
