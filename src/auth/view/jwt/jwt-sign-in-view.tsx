import * as z from 'zod';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useLanguage } from 'src/context/language-provider';
import {
  getKey,
  bindKey,
  loginApi,
  getVerifyCode,
  type LoginForm,
  type GoogleAuthInfo,
} from 'src/api/login';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const { t } = useLanguage();
  const showPassword = useBoolean();

  const SignInSchema = z.object({
    username: z.string().min(1, { message: t('signIn.enterUsername') }),
    password: z.string().min(1, { message: t('signIn.enterPassword') }),
    validatecode: z.string().min(1, { message: t('signIn.enterVerifyCode') }),
  });

  type SignInSchemaType = z.infer<typeof SignInSchema>;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState<{ base64ImgStr: string; key: string }>({
    base64ImgStr: '',
    key: '',
  });

  // Google auth dialog state
  const [googleOpen, setGoogleOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleMode, setGoogleMode] = useState<'bind' | 'verify'>('verify');
  const [googleCode, setGoogleCode] = useState('');
  const [googleAuthInfo, setGoogleAuthInfo] = useState<GoogleAuthInfo | null>(null);
  const [loginParams, setLoginParams] = useState<LoginForm | null>(null);
  const googleInputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { username: '', password: '', validatecode: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    resetField,
  } = methods;

  // ---------- captcha ----------
  const fetchVerifyCode = useCallback(async () => {
    try {
      const res = await getVerifyCode();
      resetField('validatecode');
      if (res.result) setVerifyCode(res.result);
    } catch {
      toast.error(t('signIn.getVerifyCodeFailed'));
    }
  }, [resetField, t]);

  useEffect(() => {
    fetchVerifyCode();
  }, [fetchVerifyCode]);

  // ---------- google auth bind ----------
  const handleBindGoogleAuth = async (customerName: string) => {
    try {
      const keyRes = await getKey({ customerName, type: 0 });
      if (keyRes.code == '1') {
        setGoogleAuthInfo(keyRes.result);
        setGoogleMode('bind');
        setGoogleOpen(true);
        setTimeout(() => googleInputRef.current?.focus(), 200);
      } else {
        toast.error(keyRes.message || t('signIn.getSecretKeyFailed'));
      }
    } catch {
      toast.error(t('signIn.getSecretKeyFailed'));
    }
  };

  const handleBindKey = async (code: string) => {
    if (!googleAuthInfo) return;
    try {
      const res = await bindKey({
        gauthKey: googleAuthInfo.gauthKey,
        customerName: googleAuthInfo.customerName,
        type: 0,
      });
      if (res.code == '1') {
        setGoogleOpen(false);
        await handleFinalLogin(code);
      } else {
        toast.error(res.message || t('signIn.bindingFailed'));
      }
    } catch {
      toast.error(t('signIn.bindingFailed'));
    }
  };

  // ---------- final login ----------
  const handleFinalLogin = async (code: string) => {
    if (!loginParams) return;
    try {
      const res = await loginApi({ ...loginParams, type: 'confirm', gauthkey: code });
      if (res.code === '200' && res.result) {
        toast.success(t('signIn.loginSuccess'));

        // 1. Store token & userInfo to localStorage (HTTP interceptor reads from here)
        //    The userInfo includes resourceList (permissions) from the backend.
        localStorage.setItem('_token', res.result.TOKEN);
        localStorage.setItem('_userInfo', JSON.stringify(res.result.userInfo));

        // 2. Initialize selected merchant from subMerchants (persist for next page load)
        const { subMerchants } = res.result.userInfo;
        if (subMerchants?.length) {
          const firstMerchant = subMerchants[0];
          localStorage.setItem(
            'merchant-storage',
            JSON.stringify({ state: { selectedMerchant: firstMerchant }, version: 0 })
          );
          // Sync first merchant's currency to country-storage
          if (firstMerchant.currency) {
            localStorage.setItem(
              'country-storage',
              JSON.stringify({
                state: {
                  selectedCountry: null,
                  displayCurrency: firstMerchant.currency,
                  rates: {},
                },
                version: 0,
              })
            );
          }
        }

        // 3. Calculate target route
        const searchParams = new URLSearchParams(window.location.search);
        const returnTo = searchParams.get('returnTo');
        const target = returnTo || '/';

        // 4. Navigate directly — do NOT call authLogin() to avoid triggering
        //    GuestGuard's redirect. The new page will hydrate from localStorage.
        setGoogleOpen(false);
        window.location.href = target;
      } else {
        setGoogleOpen(false);
        fetchVerifyCode();
      }
    } catch {
      setGoogleOpen(false);
      fetchVerifyCode();
      toast.error(t('signIn.loginFailed'));
    }
  };

  // ---------- google auth confirm ----------
  const handleGoogleConfirm = async () => {
    if (googleCode.length !== 6) return;
    setGoogleLoading(true);
    try {
      if (googleMode === 'bind') {
        await handleBindKey(googleCode);
      } else {
        await handleFinalLogin(googleCode);
      }
    } finally {
      setGoogleLoading(false);
      setGoogleCode('');
    }
  };

  // ---------- form submit ----------
  const onSubmit = handleSubmit(async (data) => {
    setErrorMessage(null);
    try {
      const params: LoginForm = {
        username: data.username,
        password: data.password,
        validatekey: verifyCode.key,
        validatecode: data.validatecode,
        type: 'login',
      };

      const res = await loginApi(params);

      if (res.code === '202') {
        // 未绑定谷歌验证码，需要绑定
        setLoginParams(params);
        await handleBindGoogleAuth(res.message);
      } else if (res.code === '203') {
        // 已绑定谷歌验证码，需要输入验证码
        setLoginParams(params);
        setGoogleMode('verify');
        setGoogleOpen(true);
        setTimeout(() => googleInputRef.current?.focus(), 200);
      } else {
        fetchVerifyCode();
        if (res.message) setErrorMessage(res.message);
      }
    } catch (error: any) {
      fetchVerifyCode();
      setErrorMessage(error?.message || t('signIn.loginFailed'));
    }
  });

  // ---------- render ----------
  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="username"
        label={t('signIn.username')}
        placeholder={t('signIn.enterUsername')}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="password"
        label={t('signIn.password')}
        placeholder={t('signIn.enterPassword')}
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Field.Text
          name="validatecode"
          label={t('signIn.verifyCode')}
          placeholder={t('signIn.enterVerifyCode')}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: 1 }}
        />
        <Box
          onClick={fetchVerifyCode}
          sx={{
            width: 120,
            height: 56,
            flexShrink: 0,
            cursor: 'pointer',
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
          }}
        >
          {verifyCode.base64ImgStr ? (
            <img
              src={`data:image/png;base64,${verifyCode.base64ImgStr}`}
              alt="captcha"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Iconify icon="solar:refresh-bold" width={24} />
          )}
        </Box>
      </Box>

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator={t('signIn.loggingIn')}
      >
        {t('signIn.signInButton')}
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        title={t('auth.brandTitle')}
        description={t('signIn.description')}
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      {/* ---------- Google Auth Dialog ---------- */}
      <Dialog
        open={googleOpen}
        onClose={() => {
          if (!googleLoading) {
            setGoogleOpen(false);
            setGoogleCode('');
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {googleMode === 'bind' ? t('signIn.bindGoogleAuth') : t('signIn.enterGoogleAuthCode')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {googleMode === 'bind'
              ? t('signIn.bindGoogleAuthDesc')
              : t('signIn.enterGoogleCodeDesc')}
          </DialogContentText>

          {googleMode === 'bind' && googleAuthInfo?.secretKey && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                <QRCode
                  value={window.atob(googleAuthInfo.secretKey)}
                  size={250}
                  fgColor="#8b1538"
                />
              </Box>
            </Box>
          )}

          <TextField
            inputRef={googleInputRef}
            fullWidth
            label={t('signIn.googleAuthCode')}
            value={googleCode}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              setGoogleCode(v);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleGoogleConfirm();
              }
            }}
            slotProps={{
              htmlInput: {
                maxLength: 6,
                style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: 20 },
              },
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setGoogleOpen(false);
              setGoogleCode('');
            }}
            disabled={googleLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleGoogleConfirm}
            disabled={googleCode.length !== 6 || googleLoading}
            startIcon={googleLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {googleLoading ? t('common.submitting') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
