import type { RechargeWithdrawRecord } from './hooks';

import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { RechargeWithdrawSearch } from './recharge-withdraw-search';
import { AUDIT_STATUS_MAP, useRechargeWithdrawList } from './hooks';
import { RechargeWithdrawRowActions } from './recharge-withdraw-row-actions';

// ----------------------------------------------------------------------

export function RechargeWithdrawView() {
  const { records, totalRecord, isLoading, mutate } = useRechargeWithdrawList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
          field: 'companyName',
          headerName: t('fund.rechargeWithdraw.merchant'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'createTime',
          headerName: t('fund.rechargeWithdraw.applicationDate'),
          flex: 1,
          minWidth: 180,
        },
        { field: 'type', headerName: t('fund.rechargeWithdraw.type'), flex: 1, minWidth: 80 },
        {
          field: 'rechargeAmount',
          headerName: t('fund.rechargeWithdraw.amount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'withdrawalType',
          headerName: t('fund.rechargeWithdraw.applicationCurrency'),
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
          field: 'costRate',
          headerName: t('fund.rechargeWithdraw.costExchangeRate'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'profitAmountTwo',
          headerName: t('fund.rechargeWithdraw.profit'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'finalAmount',
          headerName: t('fund.rechargeWithdraw.convertedAmount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'withdrawalAddress',
          headerName: t('fund.rechargeWithdraw.withdrawalAccount'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'mediaId',
          headerName: t('fund.rechargeWithdraw.rechargeVoucher'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ row }) => {
            if (!row.mediaId) return '-';
            return row.mediaId ? (
              <img
                src={row.mediaId}
                alt="voucher"
                style={{
                  width: 48,
                  height: 48,
                  objectFit: 'cover',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
                onClick={() => setPreviewImage(row.mediaId || null)}
              />
            ) : (
              '...'
            );
          },
        },
        {
          field: 'remark',
          headerName: t('fund.rechargeWithdraw.remark'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'processStatus',
          headerName: t('fund.rechargeWithdraw.auditStatus'),
          flex: 1,
          minWidth: 120,
          renderCell: ({ value }) => {
            const info = AUDIT_STATUS_MAP[value as number];
            if (!info) return value;
            return <Chip label={t(info.label)} color={info.color} size="small" variant="filled" />;
          },
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          flex: 1,
          minWidth: 80,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <RechargeWithdrawRowActions row={row} onRefresh={() => mutate()} />
          ),
        },
      ]),
    [t, mutate]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('fund.rechargeWithdraw.title')}
      </Typography>

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

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md">
        <DialogTitle>{t('fund.rechargeWithdraw.voucherPreview')}</DialogTitle>
        <DialogContent>
          {previewImage && (
            <img src={previewImage} alt="voucher" style={{ width: '100%', height: 'auto' }} />
          )}
        </DialogContent>
      </Dialog>
    </DashboardContent>
  );
}
