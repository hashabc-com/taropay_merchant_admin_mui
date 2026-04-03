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

import { hasRoutePermission, getFirstAuthorizedRoute } from 'src/utils/permission';

import {
  getKey,
  bindKey,
  loginApi,
  getVerifyCode,
  type UserInfo,
  type LoginForm,
  getAccountPermissions,
} from 'src/api/login';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../../components/form-head';
import { useNavData } from '../../../layouts/nav-config-dashboard';

// ----------------------------------------------------------------------

const SignInSchema = z.object({
  username: z.string().min(1, { message: '请输入用户名' }),
  password: z.string().min(1, { message: '请输入密码' }),
  validatecode: z.string().min(1, { message: '请输入验证码' }),
});

type SignInSchemaType = z.infer<typeof SignInSchema>;

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const showPassword = useBoolean();
  const navData = useNavData();

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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
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
      toast.error('获取验证码失败');
    }
  }, [resetField]);

  useEffect(() => {
    fetchVerifyCode();
  }, [fetchVerifyCode]);

  // ---------- google auth bind ----------
  const handleBindGoogleAuth = async (userName: string) => {
    try {
      const params: Partial<UserInfo> = {
        userName,
        account: '',
        createTime: '',
        disabledStatus: 0,
        email: '',
        gauthKey: '',
        id: 0,
        lastLoginTime: '',
        mobile: '',
        password: '',
        roleIds: '',
        salt: '',
        updateTime: '',
        userType: 0,
      };
      const keyRes = await getKey(params);
      if (keyRes.code === '200') {
        setUserInfo(keyRes.result);
        setGoogleMode('bind');
        setGoogleOpen(true);
        setTimeout(() => googleInputRef.current?.focus(), 200);
      } else {
        toast.error(keyRes.message || '获取密钥失败');
      }
    } catch {
      toast.error('获取密钥失败');
    }
  };

  const handleBindKey = async (code: string) => {
    if (!userInfo) return;
    try {
      const res = await bindKey({
        gauthKey: userInfo.gauthKey,
        userName: userInfo.userName,
        account: '',
        createTime: '',
        disabledStatus: 0,
        email: '',
        id: 0,
        lastLoginTime: '',
        mobile: '',
        password: '',
        userType: 0,
      });
      if (res.code === '200') {
        setGoogleOpen(false);
        await handleFinalLogin(code);
      } else {
        toast.error(res.message || '绑定失败');
      }
    } catch {
      toast.error('绑定失败');
    }
  };

  // ---------- final login ----------
  const handleFinalLogin = async (code: string) => {
    if (!loginParams) return;
    try {
      const res = await loginApi({ ...loginParams, type: 'confirm', gauthkey: code });
      if (res.code === '200' && res.result) {
        toast.success('登录成功');

        // 1. Store token & userInfo to localStorage (HTTP interceptor reads from here)
        localStorage.setItem('_token', res.result.TOKEN);
        localStorage.setItem('_userInfo', JSON.stringify(res.result.userInfo));

        // 2. Fetch permissions while still on the login page
        try {
          const permRes = await getAccountPermissions();
          if (permRes.result) {
            localStorage.setItem('_permissions', JSON.stringify(permRes.result));
          }
        } catch {
          const fallbackPerms = {
            menu: [{ name: '外观设置', url: '/settings/appearance' }],
            user: { roleId: 0, account: res.result.userInfo.name },
          };
          localStorage.setItem('_permissions', JSON.stringify(fallbackPerms));
        }

        // 3. Calculate target route BEFORE triggering any state change
        const permsRaw = localStorage.getItem('_permissions');
        const perms = permsRaw ? JSON.parse(permsRaw) : null;
        const hasPermFn = (url: string) => {
          if (!perms?.menu) return false;
          const normalizedUrl = url === '/' ? '/' : url.replace(/\/$/, '');
          return perms.menu.some((item: { url: string }) => {
            const menuUrl = item.url === '/' ? '/' : item.url.replace(/\/$/, '');
            if (menuUrl === normalizedUrl) return true;
            return (
              normalizedUrl.startsWith(`${menuUrl}/`) ||
              normalizedUrl.startsWith(`${menuUrl.replace(/s$/, '')}s/`)
            );
          });
        };

        const searchParams = new URLSearchParams(window.location.search);
        const returnTo = searchParams.get('returnTo');
        let target: string;

        if (returnTo && hasRoutePermission(returnTo, perms)) {
          target = returnTo;
        } else {
          target = getFirstAuthorizedRoute(navData, hasPermFn) || '/dashboard/overview';
        }

        // 4. Navigate directly — do NOT call authLogin() or setPermissions()
        //    to avoid triggering GuestGuard's redirect to /dashboard/overview.
        //    The new page will hydrate auth state from localStorage.
        setGoogleOpen(false);
        window.location.href = target;
      } else {
        setGoogleOpen(false);
        fetchVerifyCode();
      }
    } catch {
      setGoogleOpen(false);
      fetchVerifyCode();
      toast.error('登录失败');
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
        setLoginParams(params);
        await handleBindGoogleAuth(res.message);
      } else if (res.code === '203') {
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
      setErrorMessage(error?.message || '登录失败');
    }
  });

  // ---------- render ----------
  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="username"
        label="用户名"
        placeholder="请输入用户名"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="password"
        label="密码"
        placeholder="请输入密码"
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
          label="验证码"
          placeholder="请输入验证码"
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
        loadingIndicator="登录中..."
      >
        登录
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        title="TaroPay Admin"
        description="请输入账号密码登录系统"
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
          {googleMode === 'bind' ? '绑定 Google 身份验证器' : '输入 Google 验证码'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {googleMode === 'bind'
              ? '请使用 Google 身份验证器扫描二维码并输入6位验证码'
              : '请输入 Google 身份验证器中的6位验证码'}
          </DialogContentText>

          {googleMode === 'bind' && userInfo?.roleIds && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                <QRCode value={window.atob(userInfo.roleIds)} size={200} fgColor="#8b1538" />
              </Box>
            </Box>
          )}

          <TextField
            inputRef={googleInputRef}
            fullWidth
            label="验证码"
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
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleGoogleConfirm}
            disabled={googleCode.length !== 6 || googleLoading}
            startIcon={googleLoading ? <CircularProgress size={18} /> : undefined}
          >
            {googleLoading ? '验证中...' : '确认'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
