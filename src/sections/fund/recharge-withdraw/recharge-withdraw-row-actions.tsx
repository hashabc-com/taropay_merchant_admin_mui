import type { RechargeWithdrawRecord } from './hooks';

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';
import { downloadImg, approveRecharge, approveWithdrawal } from 'src/api/fund';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: RechargeWithdrawRecord;
  onRefresh: () => void;
};

export function RechargeWithdrawRowActions({ row, onRefresh }: Props) {
  const { t } = useLanguage();
  const convertAmount = useConvertAmount();
  const { selectedCountry } = useCountryStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState('');

  const approveSchema = useMemo(
    () =>
      z.object({
        withdrawalPass: z.string().min(1, t('fund.rechargeWithdraw.pleaseEnterWithdrawPassword')),
        gauthcode: z.string().min(1, t('fund.rechargeWithdraw.pleaseEnterGoogleAuthCode')),
        exchangeRate: z
          .string()
          .min(1, t('fund.rechargeWithdraw.pleaseEnterExchangeRate'))
          .regex(/^\d*\.?\d+$/, t('fund.rechargeWithdraw.exchangeRateMustBeValidNumber')),
        costRate: z
          .string()
          .min(1, t('fund.rechargeWithdraw.pleaseEnterExchangeRate'))
          .regex(/^\d*\.?\d+$/, t('fund.rechargeWithdraw.exchangeRateMustBeValidNumber')),
        remark: z.string().optional(),
      }),
    [t]
  );

  const rejectSchema = useMemo(
    () =>
      z.object({
        remark: z.string().min(1, t('fund.rechargeWithdraw.pleaseEnterRejectReason')),
      }),
    [t]
  );

  const approveForm = useForm<z.infer<typeof approveSchema>>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      withdrawalPass: '',
      gauthcode: '',
      exchangeRate: String(row.exchangeRate || ''),
      costRate: String(row.costRate || ''),
      remark: '',
    },
  });

  const rejectForm = useForm<z.infer<typeof rejectSchema>>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { remark: '' },
  });

  // Watch exchange rate changes to calculate actual amount
  useEffect(() => {
    const subscription = approveForm.watch((value, { name }) => {
      if (name === 'exchangeRate') {
        const rate = parseFloat(value.exchangeRate || '0');
        const amount = +String(row.rechargeAmount).replace(/,/g, '');
        if (!isNaN(rate) && !isNaN(amount)) {
          setCalculatedAmount(row.type === '充值' ? String(amount * rate) : String(amount / rate));
        } else {
          setCalculatedAmount('');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [approveForm, row]);

  const handleDownload = useCallback(async () => {
    if (!row.mediaId) return;
    try {
      const urlObj = new URL(row.mediaId);
      const mediaId = urlObj.searchParams.get('mediaId');
      if (mediaId) {
        await downloadImg(
          { mediaId, type: true },
          `${row.companyName}-${row.type}-${row.createTime}`
        );
        toast.success(t('common.operationSuccess'));
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(t('common.operationFailed'));
    }
  }, [row, t]);

  const handleApprove = useCallback(
    async (values: z.infer<typeof approveSchema>) => {
      setLoading(true);
      try {
        const payload = {
          merchantId: row.merchantId,
          id: row.id,
          exchangeRate: values.exchangeRate,
          costRate: values.costRate,
          rechargeAmount: +String(row.rechargeAmount).replace(/,/g, ''),
          finalAmount: row.rechargeAmountTemp,
          withdrawalType: row.withdrawalType || '',
          type: row.type,
          status: 1,
          country: row.country,
          withdrawalPass: values.withdrawalPass,
          gauthcode: values.gauthcode,
          remark: values.remark,
        };

        const res =
          row.type === '充值' ? await approveRecharge(payload) : await approveWithdrawal(payload);

        if (res.code == 200) {
          toast.success(t('fund.rechargeWithdraw.approveSuccess'));
          setApproveOpen(false);
          approveForm.reset();
          setCalculatedAmount('');
          onRefresh();
        } else {
          toast.error(res.message || t('fund.rechargeWithdraw.approveFailed'));
        }
      } finally {
        setLoading(false);
      }
    },
    [row, approveForm, onRefresh, t]
  );

  const handleReject = useCallback(
    async (values: z.infer<typeof rejectSchema>) => {
      setLoading(true);
      try {
        const payload = {
          merchantId: row.merchantId,
          id: row.id,
          type: row.type,
          status: 0,
          remark: values.remark,
          withdrawalType: row.withdrawalType || '',
          rechargeAmount: +String(row.rechargeAmount).replace(/,/g, ''),
        };

        const res =
          row.type === '充值' ? await approveRecharge(payload) : await approveWithdrawal(payload);

        if (res.code == 200) {
          toast.success(t('fund.rechargeWithdraw.rejected'));
          setRejectOpen(false);
          rejectForm.reset();
          onRefresh();
        } else {
          toast.error(res.message || t('common.operationFailed'));
        }
      } finally {
        setLoading(false);
      }
    },
    [row, rejectForm, onRefresh, t]
  );

  const isReviewing = row.processStatus === 2;
  if (!isReviewing) return null;

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        disableAutoFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            setApproveOpen(true);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          </ListItemIcon>
          <ListItemText>{t('common.confirm')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setRejectOpen(true);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:close-circle-bold" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>{t('common.reject')}</ListItemText>
        </MenuItem>
        {row.mediaId && (
          <MenuItem
            onClick={() => {
              handleDownload();
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:download-minimalistic-bold" sx={{ color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText>{t('fund.rechargeWithdraw.downloadVoucher')}</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Approve Dialog */}
      <Dialog
        open={approveOpen}
        onClose={() => {
          setApproveOpen(false);
          approveForm.reset();
          setCalculatedAmount('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {row.type === '充值'
            ? t('fund.rechargeWithdraw.recharge')
            : t('fund.rechargeWithdraw.withdrawal')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('fund.rechargeWithdraw.approveDescription')}
          </DialogContentText>

          <TextField
            fullWidth
            size="small"
            label={
              row.type === '充值'
                ? t('fund.rechargeWithdraw.topUpAmount')
                : t('fund.rechargeWithdraw.withdrawalAmount')
            }
            value={row.rechargeAmount}
            disabled
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {row.type === '充值' ? row.currencyType || '' : selectedCountry?.currency || ''}
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.exchangeRate')}
            required
            inputMode="decimal"
            {...approveForm.register('exchangeRate')}
            error={!!approveForm.formState.errors.exchangeRate}
            helperText={approveForm.formState.errors.exchangeRate?.message}
            onKeyDown={(e) => {
              const allowedKeys = [
                'Backspace',
                'Delete',
                'Tab',
                'ArrowLeft',
                'ArrowRight',
                'Home',
                'End',
              ];
              if (allowedKeys.includes(e.key)) return;
              if (e.key === '.' && (e.currentTarget as HTMLInputElement).value.includes('.')) {
                e.preventDefault();
              } else if (!/[0-9.]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.costExchangeRate')}
            required
            inputMode="decimal"
            {...approveForm.register('costRate')}
            error={!!approveForm.formState.errors.costRate}
            helperText={approveForm.formState.errors.costRate?.message}
            onKeyDown={(e) => {
              const allowedKeys = [
                'Backspace',
                'Delete',
                'Tab',
                'ArrowLeft',
                'ArrowRight',
                'Home',
                'End',
              ];
              if (allowedKeys.includes(e.key)) return;
              if (e.key === '.' && (e.currentTarget as HTMLInputElement).value.includes('.')) {
                e.preventDefault();
              } else if (!/[0-9.]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.actualAmount')}
            value={convertAmount(calculatedAmount, false)}
            disabled
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {row.type === '充值' ? selectedCountry?.currency || '' : 'USDT'}
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            size="small"
            label={t('fund.accountSettlement.withdrawPassword')}
            type="password"
            autoComplete="new-password"
            required
            {...approveForm.register('withdrawalPass')}
            error={!!approveForm.formState.errors.withdrawalPass}
            helperText={approveForm.formState.errors.withdrawalPass?.message}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.googleAuthCode')}
            autoComplete="one-time-code"
            required
            {...approveForm.register('gauthcode')}
            error={!!approveForm.formState.errors.gauthcode}
            helperText={approveForm.formState.errors.gauthcode?.message}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.remark')}
            multiline
            rows={2}
            {...approveForm.register('remark')}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setApproveOpen(false);
              approveForm.reset();
              setCalculatedAmount('');
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={approveForm.handleSubmit(handleApprove)}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? t('common.submitting') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          rejectForm.reset();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('common.reject')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('fund.rechargeWithdraw.pleaseEnterRejectReason')}
          </DialogContentText>
          <TextField
            fullWidth
            size="small"
            label={t('fund.rechargeWithdraw.rejectReason')}
            multiline
            rows={3}
            required
            {...rejectForm.register('remark')}
            error={!!rejectForm.formState.errors.remark}
            helperText={rejectForm.formState.errors.remark?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setRejectOpen(false);
              rejectForm.reset();
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={rejectForm.handleSubmit(handleReject)}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? t('common.submitting') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
