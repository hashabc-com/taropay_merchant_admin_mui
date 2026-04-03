import { useMemo, useState, useContext, createContext } from 'react';

import { translations } from 'src/lib/i18n';
import { getCookie, setCookie, removeCookie } from 'src/lib/cookies';

type Language = 'zh' | 'en';

const DEFAULT_LANG: Language = 'zh';
const LANG_COOKIE_NAME = 'lang';
const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  resetLang: () => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, _setLang] = useState<Language>(() => {
    const cookieLang = getCookie(LANG_COOKIE_NAME) as Language;
    if (cookieLang) return cookieLang;
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('zh')) return 'zh';
    return DEFAULT_LANG;
  });

  const setLang = (l: Language) => {
    _setLang(l);
    setCookie(LANG_COOKIE_NAME, l, LANG_COOKIE_MAX_AGE);
  };

  const resetLang = () => {
    _setLang(DEFAULT_LANG);
    removeCookie(LANG_COOKIE_NAME);
  };

  const t = useMemo(
    () => (key: string, fallback?: string) => {
      const table = translations[lang] || {};
      const value = key.split('.').reduce(
        (acc: unknown, cur) => {
          if (acc && typeof acc === 'object' && cur in acc) {
            return (acc as Record<string, unknown>)[cur];
          }
          return undefined;
        },
        table as Record<string, unknown>
      );
      return typeof value === 'string' ? value : (fallback ?? key);
    },
    [lang]
  );

  return <LanguageContext value={{ lang, setLang, resetLang, t }}>{children}</LanguageContext>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
