import { toast } from 'sonner';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';
import { useCountryStore, useMerchantStore } from 'src/stores';

import { Iconify } from 'src/components/iconify';
import { KeyPairGeneratorDialog } from 'src/components/key-pair-generator-dialog';

import { SignatureSteps } from './signature-steps';
import { ErrorCodeDrawer } from './error-code-drawer';
import { API_ENDPOINTS, getDefaultBody } from './api-endpoint-config';

// ----------------------------------------------------------------------

const SANDBOX_BASE_URL = '/sandbox-api';

export function ApiPlaygroundView() {
  const { t } = useLanguage();
  const selectedMerchant = useMerchantStore((s) => s.selectedMerchant);
  const selectedCountry = useCountryStore((s) => s.selectedCountry);

  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('payout/create');
  const [privateKey, setPrivateKey] = useState('');
  const [bodyJson, setBodyJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyGenOpen, setKeyGenOpen] = useState(false);
  const [errorCodeOpen, setErrorCodeOpen] = useState(false);

  // Signing steps state
  const [signSteps, setSignSteps] = useState<{
    timestamp: string;
    nonce: string;
    sortedParams: string;
    signData: string;
    signature: string;
    originalBody: Record<string, any>;
  } | null>(null);

  // Request/Response state
  const [requestInfo, setRequestInfo] = useState<{
    url: string;
    headers: Record<string, string>;
    body: string;
  } | null>(null);
  const [responseInfo, setResponseInfo] = useState<{
    status: number;
    data: any;
  } | null>(null);

  const countryCode = selectedCountry?.code || selectedMerchant?.country || '';
  const mchId = selectedMerchant?.appid || '';

  const currentEndpoint = useMemo(
    () => API_ENDPOINTS.find((ep) => ep.path === selectedEndpoint),
    [selectedEndpoint]
  );

  // Initialize body when endpoint or country changes
  const handleEndpointChange = useCallback(
    (path: string) => {
      setSelectedEndpoint(path);
      const ep = API_ENDPOINTS.find((e) => e.path === path);
      if (ep) {
        const defaultBody = getDefaultBody(ep.path, countryCode, mchId);
        setBodyJson(JSON.stringify(defaultBody, null, 2));
      }
      setSignSteps(null);
      setRequestInfo(null);
      setResponseInfo(null);
    },
    [countryCode, mchId]
  );

  // Initialize body on first render
  useState(() => {
    const ep = API_ENDPOINTS.find((e) => e.path === selectedEndpoint);
    if (ep) {
      const defaultBody = getDefaultBody(ep.path, countryCode, mchId);
      setBodyJson(JSON.stringify(defaultBody, null, 2));
    }
  });

  // ---- Signing helpers ----
  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const buildSortedParams = (body: Record<string, any>): string => {
    const entries = Object.entries(body)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return entries.map(([k, v]) => `${k}=${v}`).join('&');
  };

  const importPrivateKey = async (privateKeyBase64: string): Promise<CryptoKey> => {
    let rawKey: Uint8Array;
    try {
      rawKey = base64ToUint8Array(privateKeyBase64);
    } catch {
      throw new Error(t('apiPlayground.invalidBase64'));
    }
    if (rawKey.length !== 32) {
      throw new Error(t('apiPlayground.invalidPrivateKeyLength'));
    }
    // Build PKCS8 wrapper for Ed25519 (RFC 8032)
    const pkcs8Header = new Uint8Array([
      0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04,
      0x20,
    ]);
    const pkcs8 = new Uint8Array(pkcs8Header.length + rawKey.length);
    pkcs8.set(pkcs8Header);
    pkcs8.set(rawKey, pkcs8Header.length);

    return window.crypto.subtle.importKey('pkcs8', pkcs8, { name: 'Ed25519' }, false, ['sign']);
  };

  const handleSend = async () => {
    if (!privateKey.trim()) {
      toast.error(t('apiPlayground.pleaseEnterPrivateKey'));
      return;
    }

    let bodyObj: Record<string, any>;
    try {
      bodyObj = JSON.parse(bodyJson);
    } catch {
      toast.error(t('apiPlayground.invalidJson'));
      return;
    }

    setLoading(true);
    setSignSteps(null);
    setRequestInfo(null);
    setResponseInfo(null);

    try {
      // Step 1: Generate timestamp & nonce
      const timestamp = Date.now().toString();
      const nonce = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);

      // Step 2: Sort params
      const sortedParams = buildSortedParams(bodyObj);

      // Step 3: Build sign data
      const signData = `${timestamp}|${nonce}|${sortedParams}`;

      // Step 4: Ed25519 sign
      const cryptoKey = await importPrivateKey(privateKey.trim());
      const encoder = new TextEncoder();
      const signatureBuffer = await window.crypto.subtle.sign(
        { name: 'Ed25519' },
        cryptoKey,
        encoder.encode(signData)
      );
      const signature = uint8ArrayToBase64(new Uint8Array(signatureBuffer));

      // Update signing steps
      setSignSteps({ timestamp, nonce, sortedParams, signData, signature, originalBody: bodyObj });

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json;charset=utf-8',
        'X-API-TIMESTAMP': timestamp,
        'X-API-NONCE': nonce,
        'X-SIGN-VERSION': 'V2',
        'X-API-SIGN': signature,
      };

      const url = `${SANDBOX_BASE_URL}/${currentEndpoint?.path}`;

      setRequestInfo({
        url: `https://sandbox.taropay.com/api/${currentEndpoint?.path}`,
        headers,
        body: JSON.stringify(bodyObj, null, 2),
      });

      // Send request via proxy
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyObj),
      });

      const data = await response.json();
      setResponseInfo({ status: response.status, data });

      if (data.code === 0 || data.code === '0') {
        toast.success(t('apiPlayground.requestSuccess'));
      } else {
        toast.error(`code: ${data.code} — ${data.message || t('apiPlayground.requestBizError')}`);
      }
    } catch (err: any) {
      toast.error(err.message || t('apiPlayground.requestFailed'));
      setResponseInfo({
        status: 0,
        data: { error: err.message || 'Request failed' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4">{t('apiPlayground.title')}</Typography>
        <Link
          href="https://docs.taropay.com/guide/overview"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Iconify icon="solar:document-text-bold" width={18} />
          {t('apiPlayground.viewApiDocs')}
        </Link>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t('apiPlayground.sandboxNotice')}
      </Alert>

      <Grid container spacing={3}>
        {/* ========== Left Panel: Config & Send ========== */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3} sx={{ position: 'sticky', top: 80 }}>
            {/* Endpoint Selector */}
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('apiPlayground.apiEndpoint')}</InputLabel>
                    <Select
                      value={selectedEndpoint}
                      label={t('apiPlayground.apiEndpoint')}
                      onChange={(e) => handleEndpointChange(e.target.value)}
                    >
                      {API_ENDPOINTS.map((ep) => (
                        <MenuItem key={ep.path} value={ep.path}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label="POST" size="small" color="success" variant="outlined" />
                            <Typography variant="body2">/api/{ep.path}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              — {t(ep.labelKey)}
                            </Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {countryCode && (
                    <Typography variant="caption" color="text.secondary">
                      {t('apiPlayground.currentCountry')}:{' '}
                      {t(`common.countrys.${countryCode}`) || countryCode}
                      {mchId && ` | mchId: ${mchId}`}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Private Key Input */}
            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">
                      {t('apiPlayground.privateKeyTitle')}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setKeyGenOpen(true)}
                      startIcon={<Iconify icon="solar:key-bold" width={16} />}
                    >
                      {t('apiPlayground.generateKeyPair')}
                    </Button>
                  </Stack>
                  <Alert
                    severity="warning"
                    variant="outlined"
                    sx={{ fontSize: 'caption.fontSize' }}
                  >
                    {t('apiPlayground.privateKeyWarning')}
                  </Alert>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('apiPlayground.privateKeyLabel')}
                    placeholder={t('apiPlayground.privateKeyPlaceholder')}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    type="password"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Stack>
              </CardContent>
            </Card>

            <KeyPairGeneratorDialog
              open={keyGenOpen}
              onClose={() => setKeyGenOpen(false)}
              onGenerated={(_publicKey, generatedPrivateKey) => {
                setPrivateKey(generatedPrivateKey);
              }}
            />

            {/* Body Parameters */}
            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">{t('apiPlayground.requestBody')}</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const ep = API_ENDPOINTS.find((e) => e.path === selectedEndpoint);
                        if (ep) {
                          const defaultBody = getDefaultBody(ep.path, countryCode, mchId);
                          setBodyJson(JSON.stringify(defaultBody, null, 2));
                        }
                      }}
                      startIcon={<Iconify icon="solar:refresh-bold" width={16} />}
                    >
                      {t('apiPlayground.resetDefault')}
                    </Button>
                  </Stack>

                  <TextField
                    fullWidth
                    multiline
                    minRows={12}
                    maxRows={24}
                    value={bodyJson}
                    onChange={(e) => setBodyJson(e.target.value)}
                    slotProps={{
                      input: {
                        sx: { fontFamily: 'monospace', fontSize: 'body2.fontSize' },
                      },
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Send Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSend}
              disabled={loading || !privateKey.trim()}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="solar:play-bold" />
                )
              }
            >
              {loading ? t('apiPlayground.sending') : t('apiPlayground.sendRequest')}
            </Button>
          </Stack>
        </Grid>

        {/* ========== Right Panel: Results ========== */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            {/* Placeholder when idle */}
            {!loading && !responseInfo && (
              <Card>
                <CardContent
                  sx={{
                    py: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Iconify icon="solar:code-bold-duotone" width={48} sx={{ mb: 2, opacity: 0.4 }} />
                  <Typography variant="body2">{t('apiPlayground.resultPlaceholder')}</Typography>
                </CardContent>
              </Card>
            )}

            {/* Loading skeleton */}
            {loading && (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="subtitle1" color="text.secondary">
                        {t('apiPlayground.sending')}
                      </Typography>
                    </Stack>
                    <Skeleton variant="rounded" height={24} width="40%" />
                    <Skeleton variant="rounded" height={120} />
                    <Skeleton variant="rounded" height={24} width="60%" />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Response Info — pinned to top */}
            {responseInfo && (
              <Card
                sx={{
                  borderLeft: 4,
                  borderColor:
                    responseInfo.data?.code === 0 || responseInfo.data?.code === '0'
                      ? 'success.main'
                      : 'error.main',
                }}
              >
                <CardContent>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify
                          icon="solar:download-bold"
                          color={
                            responseInfo.data?.code === 0 || responseInfo.data?.code === '0'
                              ? 'success.main'
                              : 'error.main'
                          }
                        />
                        <Typography variant="subtitle1">
                          {t('apiPlayground.responseDetails')}
                        </Typography>
                        <Chip
                          label={`HTTP ${responseInfo.status}`}
                          size="small"
                          color={responseInfo.status === 200 ? 'success' : 'error'}
                          variant="outlined"
                        />
                        {responseInfo.data?.code !== undefined && (
                          <Chip
                            label={`code: ${responseInfo.data.code}`}
                            size="small"
                            color={
                              responseInfo.data.code === 0 || responseInfo.data.code === '0'
                                ? 'success'
                                : 'error'
                            }
                          />
                        )}
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Box
                          component="pre"
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: 'background.neutral',
                            fontFamily: 'monospace',
                            fontSize: 'body2.fontSize',
                            overflow: 'auto',
                            m: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                          }}
                        >
                          {JSON.stringify(responseInfo.data, null, 2)}
                        </Box>

                        {responseInfo.data?.code !== undefined &&
                          responseInfo.data.code !== 0 &&
                          responseInfo.data.code !== '0' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => setErrorCodeOpen(true)}
                              startIcon={<Iconify icon="solar:question-circle-bold" width={18} />}
                            >
                              {t('apiPlayground.viewErrorCodes')}
                            </Button>
                          )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Signing Steps — only after response */}
            {responseInfo && signSteps && <SignatureSteps steps={signSteps} />}

            {/* Request Info — only after response */}
            {responseInfo && requestInfo && (
              <Card>
                <CardContent>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:upload-bold" color="primary.main" />
                        <Typography variant="subtitle1">
                          {t('apiPlayground.requestDetails')}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            URL
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: 'background.neutral',
                              fontFamily: 'monospace',
                              fontSize: 'body2.fontSize',
                              wordBreak: 'break-all',
                            }}
                          >
                            POST {requestInfo.url}
                          </Box>
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Headers
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: 'background.neutral',
                              fontFamily: 'monospace',
                              fontSize: 'body2.fontSize',
                              overflow: 'auto',
                              m: 0,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-all',
                            }}
                          >
                            {JSON.stringify(requestInfo.headers, null, 2)}
                          </Box>
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Body
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: 'background.neutral',
                              fontFamily: 'monospace',
                              fontSize: 'body2.fontSize',
                              overflow: 'auto',
                              m: 0,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-all',
                            }}
                          >
                            {requestInfo.body}
                          </Box>
                        </Box>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      <ErrorCodeDrawer
        open={errorCodeOpen}
        onClose={() => setErrorCodeOpen(false)}
        highlightCode={responseInfo?.data?.code}
      />
    </DashboardContent>
  );
}
