import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import isProduction from 'src/utils/isProduction';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

// Orders
const OrderReceiveList = lazy(() => import('src/pages/orders/receive-list'));

// Dashboard
const DashboardOverview = lazy(() => import('src/pages/dashboard/overview'));
const OrderTransactionSummary = lazy(() => import('src/pages/orders/transaction-summary'));
const OrderPaymentList = lazy(() => import('src/pages/orders/payment-list'));

// Fund
const FundFundsDetail = lazy(() => import('src/pages/fund/funds-detail'));
const FundRechargeWithdraw = lazy(() => import('src/pages/fund/recharge-withdraw'));

// Top-level pages
const ExportManagement = lazy(() => import('src/pages/system/export-management'));
const SubAccountManagement = lazy(() => import('src/pages/system/sub-account-management'));

// Secret
const SecretManagement = lazy(() => import('src/pages/secret/management'));

// API Playground
const ApiPlayground = lazy(() => import('src/pages/api-playground'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { index: true, element: <DashboardOverview /> },
      {
        path: 'orders',
        children: [
          { path: 'receive-lists', element: <OrderReceiveList /> },
          { path: 'payment-lists', element: <OrderPaymentList /> },
          { path: 'transaction-summary', element: <OrderTransactionSummary /> },
        ],
      },
      {
        path: 'fund',
        children: [
          { path: 'funds-detail', element: <FundFundsDetail /> },
          { path: 'recharge-withdraw', element: <FundRechargeWithdraw /> },
        ],
      },
      { path: 'export/management', element: <ExportManagement /> },
      { path: 'sub-account-management', element: <SubAccountManagement /> },
      { path: 'secret/management', element: <SecretManagement /> },
      ...(!isProduction ? [{ path: 'api-playground', element: <ApiPlayground /> }] : []),
    ],
  },
];
