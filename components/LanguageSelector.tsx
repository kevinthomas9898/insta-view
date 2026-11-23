'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Globe, Check, ChevronDown } from 'lucide-react';
import {
  LANGUAGES,
  SUPPORTED_LANGS,
  SupportedLang,
} from '@/lib/i18n/languages';

interface LanguageSelectorProps {
  currentLang?: string;
  className?: string;
}

export function LanguageSelector({
  currentLang = 'en',
  className = '',
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || '/';

  // Determine current active lang from path
  const pathParts = pathname.split('/').filter(Boolean);
  const detectedLang: SupportedLang =
    pathParts.length > 0 && (SUPPORTED_LANGS as readonly string[]).includes(pathParts[0])
      ? (pathParts[0] as SupportedLang)
      : (SUPPORTED_LANGS as readonly string[]).includes(currentLang)
      ? (currentLang as SupportedLang)
      : 'en';

  const currentInfo = LANGUAGES[detectedLang] || LANGUAGES.en;

  // Calculate target URL for any language
  const getTargetUrl = (targetLang: SupportedLang): string => {
    let remainingPath = '';
    if (pathParts.length > 0) {
      if ((SUPPORTED_LANGS as readonly string[]).includes(pathParts[0])) {
        // Strip out the existing language prefix
        const rest = pathParts.slice(1);
        remainingPath = rest.length > 0 ? '/' + rest.join('/') : '';
      } else {
        // Path has no language prefix (e.g. /stories, /blog)
        remainingPath = '/' + pathParts.join('/');
      }
    }

    return `/${targetLang}${remainingPath}`;
  };

  const handleSelectLanguage = (langCode: SupportedLang) => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('preferred_lang', langCode);
        document.cookie = `preferred_lang=${langCode}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Storage might be restricted in some privacy modes
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-slate-200 dark:border-zinc-700/60 transition-colors cursor-pointer"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
        <span className="uppercase tracking-wider">{currentInfo.code}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Backdrop overlay for 100% reliable click-outside dismissal without event race conditions */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-48 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 text-xs backdrop-blur-md animate-fade-in max-h-80 overflow-y-auto"
          role="menu"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800/80 mb-1">
            Select Language
          </div>
          {SUPPORTED_LANGS.map((lang) => {
            const info = LANGUAGES[lang];
            const isSelected = lang === detectedLang;
            const targetUrl = getTargetUrl(lang);

            return (
              <Link
                key={lang}
                href={targetUrl}
                prefetch={true}
                onClick={() => handleSelectLanguage(lang)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-colors cursor-pointer ${
                  isSelected
                    ? 'font-bold text-pink-600 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-500/10'
                    : 'text-slate-700 dark:text-zinc-300'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{info.flag}</span>
                  <span>{info.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-pink-500" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
