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
  // DASHBOARD
  dashboard: {
    root: '/dashboard',
    overview: '/dashboard/overview',
  },
  // ORDERS
  orders: {
    root: '/orders',
    receiveList: '/orders/receive-list',
    receiveSummary: '/orders/receive-summary',
    paymentList: '/orders/payment-list',
  },
  // FUND
  fund: {
    root: '/fund',
    settlementList: '/fund/settlement-list',
    rechargeWithdraw: '/fund/recharge-withdraw',
  },
  // EXPORT MANAGEMENT
  exportManagement: '/export-management',
};
