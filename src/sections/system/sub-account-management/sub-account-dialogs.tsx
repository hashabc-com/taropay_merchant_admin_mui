import type { PermissionNode } from './hooks';
import type { SubUser, SubUserStatus } from 'src/api/sub-account';

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useLanguage } from 'src/context/language-provider';
import { addSubUser, updateSubUser, updateSubUserPass } from 'src/api/sub-account';

import { Form, Field } from 'src/components/hook-form';
import { useGoogleAuthDialog } from 'src/components/google-auth-dialog';

import { PermissionTree } from './permission-tree';

// ----------------------------------------------------------------------

type DialogType = 'add' | 'edit' | 'updatePass';

type Props = {
  open: DialogType | null;
  onClose: () => void;
  currentRow: SubUser | null;
  treeData: PermissionNode[];
  onSuccess: () => void;
};

// ----------------------------------------------------------------------

export function SubAccountDialogs({ open, onClose, currentRow, treeData, onSuccess }: Props) {
  const { t } = useLanguage();

  return (
    <>
      <AddEditDialog
        open={open === 'add' || open === 'edit'}
        mode={open === 'edit' ? 'edit' : 'add'}
        currentRow={currentRow}
        treeData={treeData}
        onClose={onClose}
        onSuccess={onSuccess}
        t={t}
      />
      <UpdatePassDialog
        open={open === 'updatePass'}
        currentRow={currentRow}
        onClose={onClose}
        onSuccess={onSuccess}
        t={t}
      />
    </>
  );
}

// ----------------------------------------------------------------------

type AddEditProps = {
  open: boolean;
  mode: 'add' | 'edit';
  currentRow: SubUser | null;
  treeData: PermissionNode[];
  onClose: () => void;
  onSuccess: () => void;
  t: (key: string) => string;
};

function AddEditDialog({ open, mode, currentRow, treeData, onClose, onSuccess, t }: AddEditProps) {
  const [loading, setLoading] = useState(false);
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();

  const schema = useMemo(
    () =>
      z.object({
        id: z.string().or(z.number()).optional(),
        account: z.string().min(1, t('subAccount.accountRequired')),
        password: z.string().optional(),
        status: z.number().int().min(0).max(1),
        roleId: z.array(z.string()).min(1, t('subAccount.roleIdRequired')),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: '',
      account: '',
      password: '',
      status: 0,
      roleId: [],
    },
  });

  const { reset, handleSubmit, setValue, watch } = methods;
  const roleIdValue = watch('roleId');

  useEffect(() => {
    if (open && mode === 'edit' && currentRow) {
      const roleArr =
        typeof currentRow.roleId === 'string'
          ? currentRow.roleId.split(',').filter(Boolean)
          : currentRow.roleId || [];
      reset({
        id: currentRow.id,
        status: currentRow.status,
        roleId: roleArr,
        account: currentRow.account || '',
        password: '******',
      });
    }
    if (open && mode === 'add') {
      reset({ id: '', account: '', password: '', status: 0, roleId: [] });
    }
  }, [open, mode, currentRow, reset]);

  const onSubmit = handleSubmit(async (values: any) => {
    withGoogleAuth(async (googleCode) => {
      setLoading(true);
      try {
        if (mode === 'add') {
          const res = await addSubUser({
            account: values.account,
            password: values.password,
            status: values.status as SubUserStatus,
            roleId: values.roleId.join(','),
            googleCode,
          });
          if (res.code == 1) {
            toast.success(t('subAccount.addSuccess'));
            onClose();
            onSuccess();
          } else {
            toast.error(res.message || t('common.submitFailed'));
          }
        } else {
          const res = await updateSubUser({
            id: values.id,
            status: values.status as SubUserStatus,
            roleId: values.roleId.join(','),
            googleCode,
          });
          if (res.code == 1) {
            toast.success(t('subAccount.editSuccess'));
            onClose();
            onSuccess();
          } else {
            toast.error(res.message || t('common.submitFailed'));
          }
        }
      } finally {
        setLoading(false);
      }
    });
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {mode === 'add' ? t('subAccount.addTitle') : t('subAccount.editTitle')}
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 3 }}>
          <Form methods={methods} onSubmit={onSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Field.Text
                name="account"
                label={t('subAccount.account')}
                disabled={mode === 'edit'}
              />

              <Field.Text
                name="password"
                label={t('subAccount.password')}
                type="password"
                disabled={mode === 'edit'}
              />

              <Field.Select name="status" label={t('subAccount.status')}>
                <MenuItem value={0}>{t('subAccount.enabled')}</MenuItem>
                <MenuItem value={1}>{t('subAccount.disabled')}</MenuItem>
              </Field.Select>

              <Box>
                <Box sx={{ mb: 1, typography: 'subtitle2' }}>{t('subAccount.roleId')}</Box>
                <PermissionTree
                  tree={treeData}
                  value={roleIdValue || []}
                  onChange={(next) => setValue('roleId', next, { shouldValidate: true })}
                />
              </Box>
            </Box>
          </Form>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? t('common.submitting') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      {googleAuthDialog}
    </>
  );
}

// ----------------------------------------------------------------------

type UpdatePassProps = {
  open: boolean;
  currentRow: SubUser | null;
  onClose: () => void;
  onSuccess: () => void;
  t: (key: string) => string;
};

function UpdatePassDialog({ open, currentRow, onClose, onSuccess, t }: UpdatePassProps) {
  const [loading, setLoading] = useState(false);
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();

  const schema = useMemo(
    () =>
      z
        .object({
          id: z.string().or(z.number()),
          password: z.string().min(6, t('subAccount.passwordMinLength')),
          confirmPassword: z.string().min(6, t('subAccount.passwordMinLength')),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('subAccount.passwordMismatch'),
          path: ['confirmPassword'],
        }),
    [t]
  );

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { id: '' as string | number, password: '', confirmPassword: '' },
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (open && currentRow) {
      reset({ id: currentRow.id, password: '', confirmPassword: '' });
    }
  }, [open, currentRow, reset]);

  const onSubmit = handleSubmit(async (values) => {
    withGoogleAuth(async (googleCode) => {
      setLoading(true);
      try {
        const res = await updateSubUserPass({
          id: values.id,
          pwd: values.password,
          googleCode,
        });
        if (res.code == 1) {
          toast.success(t('subAccount.passwordUpdateSuccess'));
          onClose();
          onSuccess();
        } else {
          toast.error(res.message || t('common.submitFailed'));
        }
      } finally {
        setLoading(false);
      }
    });
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>{t('subAccount.updatePasswordTitle')}</DialogTitle>

        <DialogContent dividers sx={{ pt: 3 }}>
          <Form methods={methods} onSubmit={onSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Field.Text name="password" label={t('subAccount.password')} type="password" />

              <Field.Text
                name="confirmPassword"
                label={t('subAccount.confirmPassword')}
                type="password"
              />
            </Box>
          </Form>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? t('common.submitting') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      {googleAuthDialog}
    </>
  );
}
