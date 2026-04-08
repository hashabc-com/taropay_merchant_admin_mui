// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
  },
  // DASHBOARD (首页)
  dashboard: {
    root: '/',
  },
  // ORDERS (订单管理)
  orders: {
    root: '/orders',
    paymentLists: '/orders/payment-lists',
    receiveLists: '/orders/receive-lists',
    transactionSummary: '/orders/transaction-summary',
  },
  // FUND (资金管理)
  fund: {
    root: '/fund',
    fundsDetail: '/fund/funds-detail',
    rechargeWithdraw: '/fund/recharge-withdraw',
  },
  // SECRET (密钥管理)
  secret: {
    management: '/secret/management',
  },
  // EXPORT MANAGEMENT (导出管理)
  exportManagement: '/export/management',
  // SUB-ACCOUNT MANAGEMENT (子账号管理)
  subAccountManagement: '/sub-account-management',
};
