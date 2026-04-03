import { useRef, useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { hasRoutePermission, getFirstAuthorizedRoute } from 'src/utils/permission';

import { useAuthStore } from 'src/stores/auth-store';
import { getAccountPermissions } from 'src/api/login';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';
import { useNavData } from '../../layouts/nav-config-dashboard';

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { authenticated, loading } = useAuthContext();
  const { permissions, setPermissions, hasPermission } = useAuthStore();
  const navData = useNavData();

  const [isChecking, setIsChecking] = useState(true);
  const permissionsFetched = useRef(false);

  const createRedirectPath = (currentPath: string) => {
    const queryString = new URLSearchParams({ returnTo: pathname }).toString();
    return `${currentPath}?${queryString}`;
  };

  // Fetch permissions in the background without blocking rendering
  useEffect(() => {
    if (loading || !authenticated || permissions || permissionsFetched.current) return;

    permissionsFetched.current = true;
    getAccountPermissions()
      .then((res) => {
        if (res.result) setPermissions(res.result);
      })
      .catch(() => {
        // Permission fetch failed — nav will be empty
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading]);

  const checkAuth = (): void => {
    if (loading) return;

    // --- 1. Not authenticated → redirect to sign-in ---
    if (!authenticated) {
      const redirectPath = createRedirectPath(paths.auth.jwt.signIn);
      router.replace(redirectPath);
      return;
    }

    // --- 2. Route-level permission check (only when permissions exist) ---
    if (permissions && !hasRoutePermission(pathname, permissions)) {
      const fallback = getFirstAuthorizedRoute(navData, hasPermission);
      if (fallback && fallback !== pathname) {
        router.replace(fallback);
        return;
      }
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading, pathname, permissions]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
