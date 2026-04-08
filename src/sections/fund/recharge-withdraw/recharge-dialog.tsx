import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useLanguage } from 'src/context/language-provider';
import { uploadMedia, requestRecharge, getRecordAddress } from 'src/api/fund';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type RechargeForm = {
  userid?: string;
  customerName?: string;
  receiverAddress?: string;
  withdrawalAddress?: string;
  amount?: string;
  mediaId?: string;
  gauthcode?: string;
  remark?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function RechargeDialog({ open, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<RechargeForm>({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('_userInfo') || '{}');

  useEffect(() => {
    if (open) {
      getRecordAddress().then((res: any) => {
        const addr = res.result?.recordAddress ?? res.data?.recordAddress;
        setForm((prev) => ({ ...prev, receiverAddress: addr }));
      });
      setForm((prev) => ({
        ...prev,
        userid: userInfo.merchantId,
        customerName: userInfo.name,
      }));
    } else {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setForm({});
      setImagePreview('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('common.pleaseSelectImage'));
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('common.fileSizeTooLarge'));
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const result = await uploadMedia(file);
      if ((result as any).code == '1') {
        const mediaId = (result as any).result?.id;
        setForm((prev) => ({ ...prev, mediaId }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        toast.success(t('common.uploadSuccess'));
      } else {
        toast.error((result as any).message || t('common.uploadFailed'));
      }
    } catch {
      toast.error(t('common.uploadFailed'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setForm((prev) => ({ ...prev, mediaId: '' }));
    setImagePreview('');
  };

  const handleSubmit = async () => {
    if (!form.withdrawalAddress) {
      toast.error(t('fund.rechargeWithdraw.pleaseEnterWithdrawAddress'));
      return;
    }
    if (!form.amount) {
      toast.error(t('fund.rechargeWithdraw.pleaseEnterRechargeAmount'));
      return;
    }
    if (!form.mediaId) {
      toast.error(t('fund.rechargeWithdraw.pleaseUploadVoucher'));
      return;
    }
    if (!form.gauthcode) {
      toast.error(t('fund.rechargeWithdraw.pleaseEnterGoogleAuthCode'));
      return;
    }

    setLoading(true);
    try {
      const res = await requestRecharge({
        ...form,
        currencyType: 'USDT',
        withdrawalType: 'USDT',
        userid: userInfo.id,
      });
      if ((res as any).code == '1') {
        toast.success(t('fund.rechargeWithdraw.rechargeSubmitted'));
        onClose();
        onSuccess?.();
      } else {
        toast.error((res as any).message || t('common.submitFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('fund.rechargeWithdraw.rechargeApplication')}</DialogTitle>
        <DialogContent dividers sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.merchantId')}
            value={form.userid || ''}
            disabled
          />
          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.merchantName')}
            value={form.customerName || ''}
            disabled
          />
          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.receiveAddress')}
            value={form.receiverAddress || ''}
            disabled
          />
          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.withdrawAddress')}
            required
            value={form.withdrawalAddress || ''}
            onChange={(e) => setForm({ ...form, withdrawalAddress: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.rechargeAmount')}
            required
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            value={form.amount || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setForm({ ...form, amount: value });
              }
            }}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
              },
            }}
          />

          {/* Upload voucher */}
          <Box>
            {!imagePreview ? (
              <Box>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                  id="recharge-voucher-upload"
                />
                <label htmlFor="recharge-voucher-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    size="small"
                    disabled={uploading}
                    startIcon={
                      uploading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <Iconify icon="eva:cloud-upload-fill" />
                      )
                    }
                  >
                    {uploading ? t('common.uploading') : t('fund.rechargeWithdraw.uploadVoucher')}
                  </Button>
                </label>
              </Box>
            ) : (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Voucher"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                  onClick={() => setPreviewOpen(true)}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'error.main',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'error.dark' },
                  }}
                >
                  <Iconify icon="eva:close-fill" width={16} />
                </IconButton>
              </Box>
            )}
          </Box>

          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.googleAuthCode')}
            required
            value={form.gauthcode || ''}
            onChange={(e) => setForm({ ...form, gauthcode: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.remark')}
            value={form.remark || ''}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? t('common.submitting') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image preview dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md">
        <DialogTitle>{t('fund.rechargeWithdraw.voucherPreview')}</DialogTitle>
        <DialogContent>
          {imagePreview && (
            <Box
              component="img"
              src={imagePreview}
              alt="Voucher"
              sx={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
