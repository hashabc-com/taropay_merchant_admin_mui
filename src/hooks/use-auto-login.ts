import { useState, useEffect } from 'react';

import { getTokenByAutoLogin } from 'src/api/common';

// ----------------------------------------------------------------------

/**
 * Handle auto-login via one-time token passed in URL.
 *
 * When an admin user jumps from the main admin system to the merchant admin,
 * the URL contains `?token=xxx`. This hook exchanges that one-time token
 * for a real session token, stores auth info, and cleans the URL.
 *
 * Mirrors the `beforeLoad` auto-login behaviour in the old project's `__root.tsx`.
 */
export function useAutoLogin() {
  const [isProcessing, setIsProcessing] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('token');
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oneTimeToken = params.get('token');
    if (!oneTimeToken) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const res = await getTokenByAutoLogin(oneTimeToken);

        if (!cancelled && res.code === '1' && res.result) {
          // Store auth data (HTTP interceptor reads from localStorage)
          // The userInfo includes resourceList (permissions) from the backend
          localStorage.setItem('_token', res.result.TOKEN);
          localStorage.setItem('_userInfo', JSON.stringify(res.result.userInfo));

          // Remove the one-time token from the URL
          params.delete('token');
          const cleanSearch = params.toString();
          const newUrl =
            window.location.pathname +
            (cleanSearch ? `?${cleanSearch}` : '') +
            window.location.hash;
          window.history.replaceState({}, '', newUrl);

          // Full reload to let all providers hydrate from the fresh localStorage
          window.location.reload();
          return;
        }
      } catch {
        // Auto-login failed — continue to normal login flow
      }

      if (!cancelled) setIsProcessing(false);
    })();

    // Safety timeout — don't block the UI forever
    const timer = setTimeout(() => {
      if (!cancelled) setIsProcessing(false);
    }, 5000);

    const cleanup = () => {
      cancelled = true;
      clearTimeout(timer);
    };
    return cleanup;
  }, []);

  return isProcessing;
}
