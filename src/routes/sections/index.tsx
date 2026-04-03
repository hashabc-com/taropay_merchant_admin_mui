import type { RouteObject } from 'react-router';

import { lazy } from 'react';
import { Navigate } from 'react-router';

import { CONFIG } from 'src/global-config';

import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));
const Page500 = lazy(() => import('src/pages/error/500'));
const PageMaintenance = lazy(() => import('src/pages/error/maintenance'));
const PageComingSoon = lazy(() => import('src/pages/error/coming-soon'));

export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={CONFIG.auth.redirectPath} replace />,
  },

  // Auth
  ...authRoutes,

  // Dashboard
  ...dashboardRoutes,

  // Error / Status pages
  { path: '500', element: <Page500 /> },
  { path: 'maintenance', element: <PageMaintenance /> },
  { path: 'coming-soon', element: <PageComingSoon /> },

  // No match
  { path: '*', element: <Page404 /> },
];
