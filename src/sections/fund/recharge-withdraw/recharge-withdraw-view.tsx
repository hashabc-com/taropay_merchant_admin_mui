import type { RechargeWithdrawRecord } from './hooks';

import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';

import { RechargeDialog } from './recharge-dialog';
import { WithdrawDialog } from './withdraw-dialog';
import { RechargeWithdrawSearch } from './recharge-withdraw-search';
import { AUDIT_STATUS_MAP, useRechargeWithdrawList } from './hooks';

// ----------------------------------------------------------------------

export function RechargeWithdrawView() {
  const { records, totalRecord, isLoading, mutate } = useRechargeWithdrawList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

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
      processColumns<RechargeWithdrawRecord>([
        {
          field: 'localTime',
          headerName: t('fund.rechargeWithdraw.createDate'),
          flex: 1,
          minWidth: 180,
        },
        { field: 'type', headerName: t('fund.rechargeWithdraw.type'), flex: 1, minWidth: 100 },
        {
          field: 'rechargeAmount',
          headerName: t('fund.rechargeWithdraw.amount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'finalAmount',
          headerName: t('fund.rechargeWithdraw.actualAmount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'withdrawalType',
          headerName: t('fund.rechargeWithdraw.withdrawalType'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'exchangeRate',
          headerName: t('fund.rechargeWithdraw.exchangeRate'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'remark',
          headerName: t('fund.rechargeWithdraw.transactionSummary'),
          flex: 1.5,
          minWidth: 150,
          tooltip: true,
        },
        {
          field: 'processStatus',
          headerName: t('fund.rechargeWithdraw.auditStatus'),
          flex: 1,
          minWidth: 120,
          renderCell: ({ value }) => {
            const info = AUDIT_STATUS_MAP[String(value)];
            if (!info) return value;
            return <Chip label={t(info.label)} color={info.color} size="small" variant="filled" />;
          },
        },
      ]),
    [t]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('fund.rechargeWithdraw.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:upload-bold" />}
            onClick={() => setRechargeOpen(true)}
          >
            {t('fund.rechargeWithdraw.rechargeApplication')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:download-bold" />}
            onClick={() => setWithdrawOpen(true)}
          >
            {t('fund.rechargeWithdraw.withdrawalApplication')}
          </Button>
        </Box>
      </Box>

      <RechargeWithdrawSearch />

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

      <RechargeDialog
        open={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
        onSuccess={() => mutate()}
      />
      <WithdrawDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={() => mutate()}
      />
    </DashboardContent>
  );
}
