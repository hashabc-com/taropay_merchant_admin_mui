import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useLanguage } from 'src/context/language-provider';
import { getRate, getTotalAmount, requestWithdraw } from 'src/api/fund';

// ----------------------------------------------------------------------

type WithdrawForm = {
  customerName?: string;
  remaining?: string;
  withdrawalAddress?: string;
  amount?: string;
  withdrawalType?: string;
  rate?: string;
  gauthcode?: string;
  remark?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function WithdrawDialog({ open, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const userInfo = JSON.parse(localStorage.getItem('_userInfo') || '{}');
  const [form, setForm] = useState<WithdrawForm>({
    customerName: userInfo.name,
    withdrawalType: 'USDT',
    rate: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getTotalAmount().then((res: any) => {
        const remaining = res.result?.availableAmountTwo ?? res.data?.availableAmountTwo;
        setForm((prev) => ({ ...prev, remaining }));
      });
      getRate().then((res: any) => {
        const rate = res.result?.name ?? res.data?.name;
        setForm((prev) => ({ ...prev, rate }));
      });
    }
  }, [open]);

  const finalAmount = useMemo(() => {
    const amt = Number(form.amount || 0);
    const rate = Number(form.rate || 1);
    if (form.withdrawalType === 'USDT') {
      return (amt / rate).toFixed(2);
    }
    return (amt * 1).toFixed(2);
  }, [form.amount, form.rate, form.withdrawalType]);

  const handleSubmit = async () => {
    if (!form.withdrawalAddress) {
      toast.error(t('fund.rechargeWithdraw.pleaseEnterWithdrawalAddress'));
      return;
    }
    if (!form.amount) {
      toast.error(t('fund.rechargeWithdraw.pleaseEnterWithdrawalAmount'));
      return;
    }
    if (!form.withdrawalType) {
      toast.error(t('fund.rechargeWithdraw.pleaseSelectWithdrawalCurrency'));
      return;
    }
    if (!form.gauthcode) {
      toast.error(t('fund.rechargeWithdraw.pleaseEnterGoogleAuthCode'));
      return;
    }

    setLoading(true);
    try {
      const res = await requestWithdraw({
        ...form,
        finalAmount: Number(form.amount),
        userid: userInfo.id,
      });
      if ((res as any).code == '1') {
        toast.success(t('fund.rechargeWithdraw.withdrawalSubmitted'));
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('fund.rechargeWithdraw.withdrawalApplication')}</DialogTitle>
      <DialogContent dividers sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
          label={t('fund.rechargeWithdraw.balance')}
          value={form.remaining || ''}
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
          label={t('fund.rechargeWithdraw.withdrawalAmount')}
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
              endAdornment: (
                <InputAdornment position="end">{userInfo.currency || ''}</InputAdornment>
              ),
            },
          }}
        />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('fund.rechargeWithdraw.withdrawalCurrency')}
            <Typography component="span" color="error.main">
              {' '}
              *
            </Typography>
          </Typography>
          <RadioGroup
            value={form.withdrawalType}
            onChange={(e) => setForm({ ...form, withdrawalType: e.target.value })}
          >
            <FormControlLabel
              value="USDT"
              control={<Radio />}
              label="USDT"
              sx={{
                border: '2px solid',
                borderColor: form.withdrawalType === 'USDT' ? 'primary.main' : 'divider',
                borderRadius: 1,
                px: 2,
                py: 0.5,
              }}
            />
          </RadioGroup>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {t('fund.rechargeWithdraw.withdrawalExchangeRate')}：{form.rate}{' '}
          {t('fund.rechargeWithdraw.finalWithdrawalAmount')}({form.withdrawalType})：{finalAmount}
        </Typography>

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
  );
}
