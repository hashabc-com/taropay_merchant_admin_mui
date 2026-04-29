import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ERROR_CODES = [
  { code: 0, en: 'Success', zh: '请求成功' },
  { code: -1, en: 'Failure', zh: '请求失败' },
  { code: 10001, en: 'Invalid appId', zh: '无效的appId' },
  { code: 10002, en: 'Invalid signature', zh: '无效的签名' },
  { code: 10003, en: 'Channel is empty', zh: '渠道为空' },
  { code: 10004, en: 'Order format validation error', zh: '订单格式校验错误' },
  {
    code: 10005,
    en: 'Channel disabled, please contact business',
    zh: '该渠道已停用，请联系商务人员',
  },
  {
    code: 10006,
    en: 'Insufficient balance, please contact business',
    zh: '余额不足，请联系商务人员',
  },
  { code: 10007, en: 'Duplicate order number', zh: '订单号重复' },
  { code: 10008, en: 'Invalid account', zh: '无效的账号' },
  { code: 10009, en: 'Only supports amounts from 100 to 40000', zh: '仅支持100-40000的金额' },
  { code: 10010, en: 'Order not found', zh: '订单未找到' },
  { code: 10011, en: 'Order already completed', zh: '订单已完成' },
  {
    code: 10012,
    en: 'Channel not activated, please contact business',
    zh: '该渠道未激活，请联系商务人员',
  },
  { code: 10013, en: 'IP whitelist', zh: 'IP白名单' },
  {
    code: 10014,
    en: 'Request is being processed, please try again later',
    zh: '请求处理中，请稍后再试',
  },
  { code: 10015, en: 'Too many requests, please try again later', zh: '请求过于频繁，请稍后再试' },
  { code: 10016, en: 'Payment configuration error', zh: '支付配置错误' },
  { code: 10017, en: 'Rate not activated', zh: '费率未激活' },
  { code: 10018, en: 'Insufficient balance', zh: '余额不足' },
  { code: 10019, en: 'Order number repeat', zh: '订单号重复' },
  { code: 10020, en: 'bankCode required', zh: '需要bankCode' },
  {
    code: 10023,
    en: 'The request timestamp has expired or is invalid',
    zh: '请求时间戳已过期或无效',
  },
  { code: 10024, en: 'Invalid mchId', zh: '无效的mchId' },
  { code: 10025, en: 'Currency type not supported', zh: '不支持的币种类型' },
  { code: 10026, en: 'Error sign', zh: '签名错误' },
  { code: 10027, en: 'Order number must be 64 digits', zh: '订单号需为64位' },
  {
    code: 10028,
    en: 'The same account cannot make more than 5 payments in one day',
    zh: '同一账号一天最多只能支付5次',
  },
  {
    code: 10029,
    en: 'The same account cannot make more than 10 payments in one day',
    zh: '手动代付同一账号一天最多只能支付10次',
  },
  { code: 10030, en: 'Channel deactivated', zh: '渠道已停用' },
  { code: 10032, en: 'Order number is empty', zh: '订单号为空' },
  { code: 10033, en: 'Order number does not exist', zh: '订单号不存在' },
  {
    code: 10034,
    en: 'The order has been completed and cannot be requested again',
    zh: '订单已完成，无法再次请求',
  },
  { code: 10035, en: 'Parameter error, productCode is empty', zh: '产品代码为空' },
  { code: 10036, en: 'Duplicate request, nonce already used', zh: '重复请求，nonce 已使用' },
] as const;

// ----------------------------------------------------------------------

type ErrorCodeDrawerProps = {
  open: boolean;
  onClose: () => void;
  highlightCode?: number | string;
};

export function ErrorCodeDrawer({ open, onClose, highlightCode }: ErrorCodeDrawerProps) {
  const { t } = useLanguage();

  const highlightNum = highlightCode !== undefined ? Number(highlightCode) : undefined;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 } } } }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="h6">{t('apiPlayground.errorCodeTitle')}</Typography>
        <IconButton onClick={onClose} edge="end">
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <Stack spacing={0}>
          {ERROR_CODES.map((item) => {
            const isHighlighted = highlightNum !== undefined && item.code === highlightNum;
            return (
              <Stack
                key={item.code}
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: 'divider',
                  ...(isHighlighted && {
                    bgcolor: 'error.lighter',
                  }),
                }}
              >
                <Chip
                  label={item.code}
                  size="small"
                  color={item.code === 0 ? 'success' : 'error'}
                  variant={isHighlighted ? 'filled' : 'outlined'}
                  sx={{ minWidth: 64, fontFamily: 'monospace', fontWeight: 'bold' }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2">{item.en}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.zh}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Drawer>
  );
}
