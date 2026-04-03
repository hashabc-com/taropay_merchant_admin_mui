import { useRef, useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

// ----------------------------------------------------------------------

type GoogleAuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (gauthKey: string) => void | Promise<void>;
  title?: string;
  description?: string;
  isLoading?: boolean;
};

export function GoogleAuthDialog({
  open,
  onOpenChange,
  onConfirm,
  title = '输入 Google 验证码',
  description = '请输入 Google 身份验证器中的6位验证码',
  isLoading = false,
}: GoogleAuthDialogProps) {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCode('');
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (code.length !== 6) return;
    await onConfirm(code);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isLoading) onOpenChange(false);
      }}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>

        <TextField
          inputRef={inputRef}
          fullWidth
          label="验证码"
          value={code}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 6);
            setCode(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleConfirm();
            }
          }}
          disabled={isLoading}
          slotProps={{
            htmlInput: {
              maxLength: 6,
              style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: 20 },
            },
          }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onOpenChange(false)} disabled={isLoading}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={code.length !== 6 || isLoading}
          startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
        >
          {isLoading ? '验证中...' : '确认'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
