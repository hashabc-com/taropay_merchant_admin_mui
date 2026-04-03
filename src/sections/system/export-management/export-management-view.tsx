import { toast } from 'sonner';
import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';
import { downloadExportFile, type IExportRecord } from 'src/api/common';

import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useExportList } from './hooks';

// ----------------------------------------------------------------------

export function ExportManagementView() {
  const { records, totalRecord, isLoading, params } = useExportList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // -- pagination --
  const paginationModel: GridPaginationModel = useMemo(
    () => ({
      page: (Number(params.pageNum) || 1) - 1,
      pageSize: Number(params.pageSize) || 10,
    }),
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

  // -- download --
  const handleDownload = useCallback(
    async (record: IExportRecord) => {
      if (record.status !== 1) {
        toast.warning(t('export.downloadWarning'));
        return;
      }

      try {
        const response = await downloadExportFile(record.fileId);
        const blob = response.result || response;
        const url = window.URL.createObjectURL(new Blob([blob as BlobPart]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', record.fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success(t('export.downloadSuccess'));
      } catch (error) {
        console.error('Download failed:', error);
        toast.error(t('export.downloadError'));
      }
    },
    [t]
  );

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<IExportRecord>([
        {
          field: 'id',
          headerName: 'ID',
          flex: 1,
          minWidth: 80,
        },
        {
          field: 'fileName',
          headerName: t('export.fileName'),
          flex: 2,
          minWidth: 200,
          tooltip: true,
        },
        {
          field: 'exportType',
          headerName: t('export.exportType'),
          flex: 1,
          minWidth: 120,
          renderCell: ({ value }) => {
            const typeMap: Record<string, string> = {
              PAYMENT: t('export.type.payment'),
              LENDING: t('export.type.lending'),
              TRAN: t('export.type.summary'),
            };
            return typeMap[value] || value;
          },
        },
        {
          field: 'status',
          headerName: t('common.status'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => {
            const statusMap: Record<
              number,
              { label: string; color: 'default' | 'success' | 'error' }
            > = {
              0: { label: t('export.status.generating'), color: 'default' },
              1: { label: t('export.status.downloadable'), color: 'success' },
              2: { label: t('export.status.failed'), color: 'error' },
            };
            const cfg = statusMap[value as number] || {
              label: t('common.unknown'),
              color: 'default' as const,
            };
            return <Chip label={cfg.label} color={cfg.color} size="small" />;
          },
        },
        {
          field: 'createTime',
          headerName: t('export.createTime'),
          flex: 1,
          minWidth: 160,
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          width: 120,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <Button
              size="small"
              color="primary"
              disabled={row.status !== 1}
              onClick={() => handleDownload(row)}
              startIcon={<Iconify icon="mdi:download" />}
            >
              {t('common.download')}
            </Button>
          ),
        },
      ]),
    [t, handleDownload]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('export.title')}
      </Typography>

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
        sx={dataGridSx}
      />
    </DashboardContent>
  );
}
