import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));
const Page500 = lazy(() => import('src/pages/error/500'));
const PageMaintenance = lazy(() => import('src/pages/error/maintenance'));
const PageComingSoon = lazy(() => import('src/pages/error/coming-soon'));

export const routesSection: RouteObject[] = [
  // Auth
  ...authRoutes,

  // Dashboard (includes '/' homepage)
  ...dashboardRoutes,

  // Error / Status pages
  { path: '500', element: <Page500 /> },
  { path: 'maintenance', element: <PageMaintenance /> },
  { path: 'coming-soon', element: <PageComingSoon /> },

  // No match
  { path: '*', element: <Page404 /> },
];
