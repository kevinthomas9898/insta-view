export const SUPPORTED_LANGS = [
  'en',
  'es',
  'pt',
  'hi',
  'id',
  'tr',
  'ru',
  'de',
  'fr',
  'it',
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export interface LanguageInfo {
  code: SupportedLang;
  name: string;
  flag: string;
}

export const LANGUAGES: Record<SupportedLang, LanguageInfo> = {
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  pt: { code: 'pt', name: 'Português', flag: '🇧🇷' },
  hi: { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  id: { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  tr: { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  ru: { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  it: { code: 'it', name: 'Italiano', flag: '🇮🇹' },
};

export function getLanguage(code: string): LanguageInfo {
  return LANGUAGES[code as SupportedLang] || LANGUAGES.en;
}

export function isSupportedLang(code: string): code is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(code);
}
