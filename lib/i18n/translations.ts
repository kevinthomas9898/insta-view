import {
  SUPPORTED_LANGS,
  SupportedLang,
  LanguageInfo,
  LANGUAGES,
  getLanguage,
  isSupportedLang,
} from './languages';

import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import hi from './locales/hi.json';
import id from './locales/id.json';
import tr from './locales/tr.json';
import ru from './locales/ru.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';

export * from './languages';

export interface PageContent {
  metaTitle: string;
  metaDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  searchPlaceholder: string;
}

export interface NavContent {
  stories: string;
  highlights: string;
  reels: string;
  posts: string;
  profile: string;
  blog: string;
  faq: string;
  anonymous: string;
  noLogin: string;
}

export interface LangTranslations {
  nav: NavContent;
  home: PageContent;
  stories: PageContent;
  reels: PageContent;
  storySaver: PageContent;
  instagramToMp4: PageContent;
}

export const TRANSLATIONS: Record<SupportedLang, LangTranslations> = {
  en: en as LangTranslations,
  es: es as LangTranslations,
  pt: pt as LangTranslations,
  hi: hi as LangTranslations,
  id: id as LangTranslations,
  tr: tr as LangTranslations,
  ru: ru as LangTranslations,
  de: de as LangTranslations,
  fr: fr as LangTranslations,
  it: it as LangTranslations,
};

export function getTranslations(code: string): LangTranslations {
  if (isSupportedLang(code)) {
    return TRANSLATIONS[code];
  }
  return TRANSLATIONS.en;
}
