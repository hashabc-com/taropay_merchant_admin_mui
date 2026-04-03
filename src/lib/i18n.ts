import en from '../locales/en.json';
import zh from '../locales/zh.json';

export const translations = {
  zh,
  en,
} as const;

export type TranslationKeys = (typeof translations)['zh'];
export type Language = keyof typeof translations;
