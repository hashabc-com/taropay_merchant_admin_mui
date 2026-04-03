import { useState, useCallback } from 'react';

import { GoogleAuthDialog } from './google-auth-dialog';

// ----------------------------------------------------------------------

/**
 * Unified Google Auth Dialog hook.
 *
 * Usage:
 * ```tsx
 * const { dialog, withGoogleAuth } = useGoogleAuthDialog();
 *
 * const handleAction = () => {
 *   withGoogleAuth(async (gauthKey) => {
 *     await someApi({ gauthKey, ...params });
 *   });
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleAction}>Action</Button>
 *     {dialog}
 *   </>
 * );
 * ```
 */
export function useGoogleAuthDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callback, setCallback] = useState<((gauthKey: string) => void | Promise<void>) | null>(
    null,
  );

  const withGoogleAuth = useCallback((cb: (gauthKey: string) => void | Promise<void>) => {
    setCallback(() => cb);
    setOpen(true);
  }, []);

  const handleConfirm = useCallback(
    async (gauthKey: string) => {
      if (!callback) return;
      setIsLoading(true);
      try {
        await callback(gauthKey);
      } finally {
        setIsLoading(false);
        setOpen(false);
        setCallback(null);
      }
    },
    [callback],
  );

  const dialog = (
    <GoogleAuthDialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setCallback(null);
      }}
      onConfirm={handleConfirm}
      isLoading={isLoading}
    />
  );

  return { dialog, withGoogleAuth };
}
