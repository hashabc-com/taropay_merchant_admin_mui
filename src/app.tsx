import 'src/global.css';

import { SWRConfig } from 'swr';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { swrConfig } from 'src/lib/swr-config';
import { themeConfig, ThemeProvider } from 'src/theme';
import { LanguageProvider } from 'src/context/language-provider';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <AuthProvider>
      <LanguageProvider>
        <SWRConfig value={swrConfig}>
          <SettingsProvider defaultSettings={defaultSettings}>
            <ThemeProvider
              modeStorageKey={themeConfig.modeStorageKey}
              defaultMode={themeConfig.defaultMode}
            >
              <MotionLazy>
                <ProgressBar />
                <SettingsDrawer defaultSettings={defaultSettings} />
                <Toaster richColors position="top-right" />
                {children}
              </MotionLazy>
            </ThemeProvider>
          </SettingsProvider>
        </SWRConfig>
      </LanguageProvider>
    </AuthProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
