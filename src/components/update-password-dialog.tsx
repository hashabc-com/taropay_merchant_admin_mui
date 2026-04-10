import { z } from 'zod/v4';
import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useAuthStore } from 'src/stores';
import { updatePassword } from 'src/api/user';
import { useLanguage } from 'src/context/language-provider';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type UpdatePasswordDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function UpdatePasswordDialog({ open, onClose }: UpdatePasswordDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const userInfo = useAuthStore((s) => s.userInfo);

  const passwordSchema = z
    .object({
      pwd: z.string().min(6, t('password.passwordTooShort')),
      rePwd: z.string(),
      gauthKey: z.string().optional(),
    })
    .refine((data) => data.pwd === data.rePwd, {
      message: t('password.passwordMismatch'),
      path: ['rePwd'],
    });

  type PasswordForm = z.infer<typeof passwordSchema>;

  const methods = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { pwd: '', rePwd: '', gauthKey: '' },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    if (!userInfo?.id) {
      toast.error(t('password.userNotFound'));
      return;
    }

    setLoading(true);
    try {
      const res = await updatePassword({
        id: userInfo.id,
        pwd: values.pwd,
        rePwd: values.rePwd,
        gauthKey: values.gauthKey || '',
      });

      if (res.code === '1' || res.code === 1) {
        toast.success(t('password.updateSuccess'));
        methods.reset();
        onClose();
      } else {
        toast.error(res.message || t('password.updateFailed'));
      }
    } catch {
      toast.error(t('password.updateFailed'));
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ component: 'form', onSubmit }}
    >
      <DialogTitle>{t('password.updatePassword')}</DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        <DialogContentText sx={{ mb: 2 }}>{t('password.updatePasswordDesc')}</DialogContentText>

        <Form methods={methods}>
          <Field.Text
            name="pwd"
            label={t('password.newPassword')}
            type="password"
            placeholder={t('password.enterPassword')}
            autoComplete="new-password"
            fullWidth
            sx={{ mb: 2 }}
          />
          <Field.Text
            name="rePwd"
            label={t('password.confirmPassword')}
            type="password"
            placeholder={t('password.confirmPasswordPlaceholder')}
            autoComplete="new-password"
            fullWidth
            sx={{ mb: 2 }}
          />
          <Field.Text
            name="gauthKey"
            label={t('password.googleAuthCode')}
            placeholder={t('password.enterGoogleAuthCode')}
            autoComplete="off"
            fullWidth
          />
        </Form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? t('common.submitting') : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
