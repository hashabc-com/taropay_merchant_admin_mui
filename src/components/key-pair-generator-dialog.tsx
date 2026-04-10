import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type KeyPairGeneratorDialogProps = {
  open: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
  onGenerated?: (publicKey: string, privateKey: string) => void;
  navigateToSecretManagement?: boolean;
};

export function KeyPairGeneratorDialog({
  open,
  onClose,
  isFirstTime = false,
  onGenerated,
  navigateToSecretManagement = false,
}: KeyPairGeneratorDialogProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);

  const arrayBufferToBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const downloadPrivateKey = (privateKey: string) => {
    const content = `${t('keyPair.privateKey')}:\n${privateKey}\n\n${t('keyPair.warning')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `private-key-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (isFirstTime) {
      localStorage.setItem('_keyPairDialogShown', 'true');
    }
    onClose();
  };

  const generateKeyPair = async () => {
    try {
      const keys = await window.crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
        'sign',
        'verify',
      ]);

      const publicKeyBuffer = await window.crypto.subtle.exportKey('raw', keys.publicKey);
      const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keys.privateKey);

      // Extract raw 32-byte private key from PKCS8 format
      const privateKeyBytes = new Uint8Array(privateKeyBuffer);
      const rawPrivateKey = privateKeyBytes.slice(-32);
      const rawPublicKey = new Uint8Array(publicKeyBuffer);

      const publicKeyBase64 = arrayBufferToBase64(rawPublicKey);
      const privateKeyBase64 = arrayBufferToBase64(rawPrivateKey);

      setKeyPair({ publicKey: publicKeyBase64, privateKey: privateKeyBase64 });

      downloadPrivateKey(privateKeyBase64);
      toast.success(t('keyPair.generatedSuccessfully'));

      handleClose();

      onGenerated?.(publicKeyBase64, privateKeyBase64);

      if (navigateToSecretManagement) {
        const currentPath = location.pathname;
        if (currentPath !== '/secret/management') {
          localStorage.setItem('_generatedPublicKey', publicKeyBase64);
          setTimeout(() => navigate('/secret/management'), 50);
        } else {
          localStorage.setItem('_generatedPublicKey', publicKeyBase64);
          window.dispatchEvent(new CustomEvent('publicKeyGenerated'));
        }
      }
    } catch (error) {
      console.error('Failed to generate key pair:', error);
      toast.error(t('keyPair.generationFailed'));
    }
  };

  const copyToClipboard = (text: string, type: 'public' | 'private') => {
    navigator.clipboard.writeText(text);
    toast.success(type === 'public' ? t('keyPair.publicKeyCopied') : t('keyPair.privateKeyCopied'));
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        handleClose();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="solar:key-bold-duotone" width={24} />
        {t('keyPair.title')}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, pb: 3 }}>
          <Iconify
            icon="solar:shield-check-bold-duotone"
            width={20}
            sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }}
          />
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t('keyPair.description1')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('keyPair.description2')}
            </Typography>
            <Typography variant="body2" fontWeight="medium" color="warning.main">
              {t('keyPair.warning')}
            </Typography>
          </Stack>
        </Box>

        <Stack spacing={2}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              label={t('keyPair.publicKey')}
              value={keyPair?.publicKey ?? ''}
              multiline
              rows={3}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                  sx: { fontFamily: 'monospace', fontSize: 'body2.fontSize' },
                },
              }}
            />
            <IconButton
              size="small"
              onClick={() => copyToClipboard(keyPair?.publicKey || '', 'public')}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <Iconify icon="solar:copy-bold" width={18} />
            </IconButton>
          </Box>

          <Box sx={{ position: 'relative' }}>
            <TextField
              label={t('keyPair.privateKey')}
              value={keyPair?.privateKey ?? ''}
              multiline
              rows={3}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                  sx: { fontFamily: 'monospace', fontSize: 'body2.fontSize' },
                },
              }}
            />
            <IconButton
              size="small"
              onClick={() => copyToClipboard(keyPair?.privateKey || '', 'private')}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <Iconify icon="solar:copy-bold" width={18} />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={generateKeyPair}
            startIcon={<Iconify icon="solar:key-bold-duotone" />}
          >
            {keyPair?.privateKey ? t('keyPair.regenerateButton') : t('keyPair.generateButton')}
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          {t('keyPair.understood')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
