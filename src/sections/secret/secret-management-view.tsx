import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useMerchantStore } from 'src/stores';
import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';
import { getSecret, updateSecret, type ISecretInfo } from 'src/api/secret';

import { Iconify } from 'src/components/iconify';
import { KeyPairGeneratorDialog } from 'src/components/key-pair-generator-dialog';

// ----------------------------------------------------------------------

export function SecretManagementView() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [appId, setAppId] = useState('');
  const [platformPublic, setPlatformPublic] = useState('');
  const [merchantPublic, setMerchantPublic] = useState('');
  const [gauthKey, setGauthKey] = useState('');
  const [keyPairOpen, setKeyPairOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [secretInfo, setSecretInfo] = useState<ISecretInfo>({});
  const selectedMerchant = useMerchantStore((s) => s.selectedMerchant);
  const handleKeyPairGenerated = (publicKey: string) => {
    setMerchantPublic(publicKey);
    setKeyPairOpen(false);
    setReminderOpen(true);
  };

  const fetchSecret = async () => {
    try {
      // const userInfo = JSON.parse(localStorage.getItem('_userInfo') || '{}');
      setLoading(true);
      const res = await getSecret({ appId: selectedMerchant?.appid });
      const data = res.result || res.data || {};
      setSecretInfo(data);
      setAppId(selectedMerchant?.appid ?? '');
      setPlatformPublic(data.platfromPublic || '');
      setMerchantPublic(data.merchantPublic || '');
    } catch {
      toast.error(t('secret.fetchSecretFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecret();

    const checkGeneratedPublicKey = () => {
      const generatedPublicKey = localStorage.getItem('_generatedPublicKey');
      if (generatedPublicKey) {
        setMerchantPublic(generatedPublicKey);
        setReminderOpen(true);
        localStorage.removeItem('_generatedPublicKey');
      }
    };

    checkGeneratedPublicKey();

    window.addEventListener('publicKeyGenerated', checkGeneratedPublicKey);
    return () => window.removeEventListener('publicKeyGenerated', checkGeneratedPublicKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    if (!merchantPublic) {
      toast.warning(t('secret.pleaseEnterMerchantPublicKey'));
      return;
    }
    if (!/^\d{6}$/.test(gauthKey)) {
      toast.warning(t('secret.googleAuthCodeMustBe6Digits'));
      return;
    }
    try {
      setSubmitLoading(true);
      const res = await updateSecret({
        appId,
        platfromPublic: platformPublic,
        merchantPublic,
        gauthKey,
        id: secretInfo.id,
      });
      if (res.code != 1) {
        toast.error(res.message || t('secret.updateFailed'));
      } else {
        toast.success(t('secret.updateSuccess'));
        setGauthKey('');
      }
    } catch {
      toast.error(t('secret.updateFailed'));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <DashboardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant="h4">{t('secret.title')}</Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:key-bold-duotone" />}
            onClick={() => setKeyPairOpen(true)}
          >
            {merchantPublic ? t('keyPair.updateButton') : t('keyPair.generateButton')}
          </Button>
        </Box>

        <Card>
          <CardContent sx={{ maxWidth: 900 }}>
            <Stack spacing={3}>
              <TextField label={t('secret.appId')} value={appId} disabled fullWidth />
              <TextField
                label={t('secret.platformPublicKey')}
                value={platformPublic}
                disabled
                multiline
                rows={4}
                fullWidth
                placeholder={t('secret.platformPublicKeyPlaceholder')}
              />
              <TextField
                label={t('secret.merchantPublicKey')}
                value={merchantPublic}
                onChange={(e) => setMerchantPublic(e.target.value)}
                multiline
                rows={4}
                fullWidth
                placeholder={t('secret.merchantPublicKeyPlaceholder')}
              />
              <TextField
                label={t('secret.googleAuthCode')}
                value={gauthKey}
                onChange={(e) => setGauthKey(e.target.value)}
                fullWidth
                placeholder={t('secret.googleAuthCodePlaceholder')}
                slotProps={{ htmlInput: { maxLength: 6 } }}
              />
              <Box>
                <Button
                  variant="contained"
                  onClick={onSubmit}
                  disabled={submitLoading || loading}
                  startIcon={
                    submitLoading || loading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : undefined
                  }
                >
                  {submitLoading ? t('common.submitting') : t('secret.submitUpdate')}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </DashboardContent>

      <KeyPairGeneratorDialog
        open={keyPairOpen}
        onClose={() => setKeyPairOpen(false)}
        onGenerated={handleKeyPairGenerated}
      />

      <Dialog open={reminderOpen} onClose={() => setReminderOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('common.confirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('secret.pleaseSubmitAfterGeneration')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setReminderOpen(false)}>
            {t('keyPair.understood')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
