import type { SubUser, SubUserStatus } from 'src/api/sub-account';

import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { updateSubUser } from 'src/api/sub-account';
import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';
import { useGoogleAuthDialog } from 'src/components/google-auth-dialog';

import { useMenuList, useSubAccountList } from './hooks';
import { SubAccountDialogs } from './sub-account-dialogs';

// ----------------------------------------------------------------------

type DialogType = 'add' | 'edit' | 'updatePass';

// ----------------------------------------------------------------------

export function SubAccountManagementView() {
  const { records, totalRecord, isLoading, mutate, params } = useSubAccountList();
  const { treeData } = useMenuList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();

  const [dialogOpen, setDialogOpen] = useState<DialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<SubUser | null>(null);

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

  const handleDialogClose = useCallback(() => {
    setDialogOpen(null);
    setCurrentRow(null);
  }, []);

  const handleSuccess = useCallback(() => {
    mutate();
  }, [mutate]);

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<SubUser>([
        {
          field: 'account',
          headerName: t('subAccount.account'),
          flex: 1,
          minWidth: 150,
          tooltip: true,
        },
        {
          field: 'status',
          headerName: t('subAccount.status'),
          flex: 1,
          minWidth: 120,
          renderCell: ({ value }) => {
            if (value === 0) {
              return <Chip label={t('subAccount.enabled')} color="success" size="small" />;
            }
            return <Chip label={t('subAccount.disabled')} color="default" size="small" />;
          },
        },
        {
          field: 'createTime',
          headerName: t('common.createTime'),
          flex: 1,
          minWidth: 160,
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          flex: 1,
          minWidth: 120,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <RowActions
              row={row}
              onEdit={() => {
                setCurrentRow(row);
                setDialogOpen('edit');
              }}
              onUpdatePass={() => {
                setCurrentRow(row);
                setDialogOpen('updatePass');
              }}
              onToggleStatus={(target) => {
                withGoogleAuth(async (googleCode) => {
                  const next = (target.status === 1 ? 0 : 1) as SubUserStatus;
                  const res = await updateSubUser({ id: target.id, status: next, googleCode });
                  if (res.code == 1) {
                    toast.success(t('common.statusUpdateSuccess'));
                    mutate();
                  } else {
                    toast.error(res.message || t('common.statusUpdateFailed'));
                  }
                });
              }}
              t={t}
            />
          ),
        },
      ]),
    [t, mutate, withGoogleAuth]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('subAccount.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:plus" />}
          onClick={() => setDialogOpen('add')}
        >
          {t('subAccount.add')}
        </Button>
      </Box>

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

      <SubAccountDialogs
        open={dialogOpen}
        onClose={handleDialogClose}
        currentRow={currentRow}
        treeData={treeData}
        onSuccess={handleSuccess}
      />
      {googleAuthDialog}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type RowActionsProps = {
  row: SubUser;
  onEdit: () => void;
  onUpdatePass: () => void;
  onToggleStatus: (row: SubUser) => void;
  t: (key: string) => string;
};

function RowActions({ row, onEdit, onUpdatePass, onToggleStatus, t }: RowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            onEdit();
            handleClose();
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" />
          </ListItemIcon>
          <ListItemText>{t('common.edit')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onUpdatePass();
            handleClose();
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:lock-password-bold" />
          </ListItemIcon>
          <ListItemText>{t('subAccount.updatePasswordTitle')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onToggleStatus(row);
            handleClose();
          }}
        >
          <ListItemIcon>
            <Iconify icon={row.status === 0 ? 'solar:forbidden-circle-bold' : 'solar:power-bold'} />
          </ListItemIcon>
          <ListItemText>{row.status === 0 ? t('common.disable') : t('common.enable')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
