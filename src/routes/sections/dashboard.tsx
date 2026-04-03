import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

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
const OrderReceiveSummary = lazy(() => import('src/pages/orders/receive-summary'));
const OrderPaymentList = lazy(() => import('src/pages/orders/payment-list'));

// Fund
const FundSettlementList = lazy(() => import('src/pages/fund/settlement-list'));
const FundRechargeWithdraw = lazy(() => import('src/pages/fund/recharge-withdraw'));

// Top-level pages
const ExportManagement = lazy(() => import('src/pages/system/export-management'));

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
      {
        path: 'dashboard',
        children: [{ path: 'overview', element: <DashboardOverview /> }],
      },
      {
        path: 'orders',
        children: [
          { path: 'receive-list', element: <OrderReceiveList /> },
          { path: 'receive-summary', element: <OrderReceiveSummary /> },
          { path: 'payment-list', element: <OrderPaymentList /> },
        ],
      },
      {
        path: 'fund',
        children: [
          { path: 'settlement-list', element: <FundSettlementList /> },
          { path: 'recharge-withdraw', element: <FundRechargeWithdraw /> },
        ],
      },
      { path: 'export-management', element: <ExportManagement /> },
    ],
  },
];
