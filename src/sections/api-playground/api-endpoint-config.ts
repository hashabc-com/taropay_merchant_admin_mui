// ----------------------------------------------------------------------
// API endpoint definitions and country-specific default body parameters
// ----------------------------------------------------------------------

export interface ApiEndpoint {
  path: string;
  labelKey: string;
  method: 'POST';
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  { path: 'payout/create', labelKey: 'apiPlayground.endpoints.payoutCreate', method: 'POST' },
  { path: 'payout/getOrderInfo', labelKey: 'apiPlayground.endpoints.payoutQuery', method: 'POST' },
  { path: 'payin/create', labelKey: 'apiPlayground.endpoints.payinCreate', method: 'POST' },
  { path: 'payin/getOrderInfo', labelKey: 'apiPlayground.endpoints.payinQuery', method: 'POST' },
  { path: 'account/balance', labelKey: 'apiPlayground.endpoints.balance', method: 'POST' },
];

// Country → currency mapping
const COUNTRY_CURRENCY: Record<string, string> = {
  ID: 'IDR',
  PH: 'PHP',
  BR: 'BRL',
  VN: 'VND',
  BD: 'BDT',
  MX: 'MXN',
  NG: 'NGN',
  PK: 'PKR',
};

// Country-specific payout create body defaults
function getPayoutCreateBody(countryCode: string, mchId: string): Record<string, string> {
  const currency = COUNTRY_CURRENCY[countryCode] || 'IDR';
  const base = {
    mchId,
    mchOrderNo: `TEST${Date.now()}`,
    accountName: 'Test User',
    accountNo: '',
    mobile: '',
    accountEmail: 'test@example.com',
    amount: '',
    currency,
    notifyUrl: 'https://your-server.com/callback',
    productCode: '',
    bankCode: '',
  };

  switch (countryCode) {
    case 'ID':
      return {
        ...base,
        productCode: 'BANK',
        bankCode: 'BANK_BCA',
        accountNo: '1234567890',
        mobile: '628123456789',
        amount: '100',
      };
    case 'PH':
      return {
        ...base,
        productCode: 'BANK',
        bankCode: 'MOMO',
        accountNo: '09123456789',
        mobile: '09123456789',
        amount: '100',
      };
    case 'BR':
      return {
        ...base,
        productCode: 'PIX',
        bankCode: 'PIX_CPF',
        accountNo: '12345678901',
        mobile: '5511987654321',
        amount: '100',
      };
    case 'VN':
      return {
        ...base,
        productCode: 'BANK',
        bankCode: 'VCB',
        accountNo: '1234567890',
        mobile: '84912345678',
        amount: '100',
      };
    case 'BD':
      return {
        ...base,
        productCode: 'BANK',
        bankCode: 'BRAC',
        accountNo: '1234567890',
        mobile: '8801712345678',
        amount: '100',
      };
    case 'MX':
      return {
        ...base,
        productCode: 'SPEI',
        bankCode: 'SPEI',
        accountNo: '012345678901234567',
        mobile: '5215512345678',
        amount: '100',
      };
    case 'NG':
      return {
        ...base,
        productCode: 'BANK',
        bankCode: 'ACCESS',
        accountNo: '1234567890',
        mobile: '2348012345678',
        amount: '100',
      };
    case 'PK':
      return {
        ...base,
        productCode: 'BANK',
        bankCode: 'HBL',
        accountNo: '1234567890',
        mobile: '923001234567',
        amount: '100',
      };
    default:
      return {
        ...base,
        productCode: 'BANK',
        bankCode: 'BANK_BCA',
        accountNo: '1234567890',
        mobile: '628123456789',
        amount: '100',
      };
  }
}

// Country-specific payin create body defaults
function getPayinCreateBody(countryCode: string, mchId: string): Record<string, string> {
  const currency = COUNTRY_CURRENCY[countryCode] || 'IDR';
  const base = {
    mchId,
    mchOrderNo: `TEST${Date.now()}`,
    amount: '',
    currency,
    notifyUrl: 'https://your-server.com/callback',
    productCode: '',
    bankCode: '',
  };

  switch (countryCode) {
    case 'ID':
      return { ...base, productCode: 'VA', bankCode: 'VA_BCA', amount: '100' };
    case 'PH':
      return { ...base, productCode: 'BANK', bankCode: 'MOMO', amount: '100' };
    case 'BR':
      return { ...base, productCode: 'PIX', bankCode: 'PIX', amount: '100' };
    case 'VN':
      return { ...base, productCode: 'BANK', bankCode: 'VCB', amount: '100' };
    case 'BD':
      return { ...base, productCode: 'BANK', bankCode: 'BRAC', amount: '100' };
    case 'MX':
      return { ...base, productCode: 'SPEI', bankCode: 'SPEI', amount: '100' };
    case 'NG':
      return { ...base, productCode: 'BANK', bankCode: 'ACCESS', amount: '100' };
    case 'PK':
      return { ...base, productCode: 'BANK', bankCode: 'HBL', amount: '100' };
    default:
      return { ...base, productCode: 'VA', bankCode: 'VA_BCA', amount: '100' };
  }
}

export function getDefaultBody(
  endpointPath: string,
  countryCode: string,
  mchId: string
): Record<string, string> {
  switch (endpointPath) {
    case 'payout/create':
      return getPayoutCreateBody(countryCode, mchId);
    case 'payout/getOrderInfo':
      return { mchId, mchOrderNo: '', transId: '' };
    case 'payin/create':
      return getPayinCreateBody(countryCode, mchId);
    case 'payin/getOrderInfo':
      return { mchId, mchOrderNo: '', transId: '' };
    case 'account/balance':
      return { mchId };
    default:
      return { mchId };
  }
}
