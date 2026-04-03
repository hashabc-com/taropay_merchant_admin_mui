import type { AuthState } from '../../types';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import { useAuthStore } from 'src/stores/auth-store';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

/**
 * AuthProvider bridges the Zustand auth store with the existing
 * AuthContext consumed by guards & hooks.
 */
export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const authStore = useAuthStore();

  const checkUserSession = useCallback(async () => {
    const token = localStorage.getItem('_token');
    if (token) {
      const userInfo = JSON.parse(localStorage.getItem('_userInfo') || 'null');
      setState({ user: userInfo, loading: false });
    } else {
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check when auth store changes
  useEffect(() => {
    if (authStore.isAuthenticated && authStore.userInfo) {
      setState({ user: authStore.userInfo as any, loading: false });
    } else if (!authStore.isAuthenticated) {
      setState({ user: null, loading: false });
    }
  }, [authStore.isAuthenticated, authStore.userInfo, setState]);

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
