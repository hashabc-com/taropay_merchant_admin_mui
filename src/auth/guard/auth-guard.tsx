import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { hasRoutePermission, getFirstAuthorizedRoute } from 'src/utils/permission';

import { useAuthStore } from 'src/stores/auth-store';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

/** Routes that bypass permission checks (always accessible when logged in) */
const WHITELIST_ROUTES = ['/settings/appearance', '/api-playground'];

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { authenticated, loading } = useAuthContext();
  const userInfo = useAuthStore((s) => s.userInfo);

  const [isChecking, setIsChecking] = useState(true);

  const checkAuth = (): void => {
    if (loading) return;

    // --- 1. Not authenticated → redirect to sign-in ---
    if (!authenticated) {
      const queryString = new URLSearchParams({ returnTo: pathname }).toString();
      router.replace(`${paths.auth.jwt.signIn}?${queryString}`);
      return;
    }

    // --- 2. No resourceList → clear login and redirect ---
    const resourceList = userInfo?.resourceList;
    if (!resourceList || resourceList.length === 0) {
      localStorage.removeItem('_token');
      localStorage.removeItem('_userInfo');
      router.replace(paths.auth.jwt.signIn);
      return;
    }

    // --- 3. Whitelist routes — always accessible ---
    if (WHITELIST_ROUTES.some((r) => pathname.startsWith(r))) {
      setIsChecking(false);
      return;
    }

    // --- 4. Route-level permission check ---
    if (!hasRoutePermission(pathname, resourceList)) {
      const fallback = getFirstAuthorizedRoute(resourceList);
      if (fallback && fallback !== pathname) {
        router.replace(fallback);
        return;
      }
      // No route available at all — back to sign-in
      router.replace(paths.auth.jwt.signIn);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading, pathname, userInfo]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
