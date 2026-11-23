'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES, SUPPORTED_LANGS, SupportedLang } from '@/lib/i18n/translations';

interface LanguageSelectorProps {
  currentLang?: string;
  className?: string;
}

export function LanguageSelector({
  currentLang = 'en',
  className = '',
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || '/';
  const router = useRouter();

  // Determine current active lang from path if not provided
  const pathParts = pathname.split('/').filter(Boolean);
  const detectedLang =
    pathParts.length > 0 && (SUPPORTED_LANGS as readonly string[]).includes(pathParts[0])
      ? (pathParts[0] as SupportedLang)
      : (currentLang as SupportedLang) || 'en';

  const currentInfo = LANGUAGES[detectedLang] || LANGUAGES.en;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (langCode: SupportedLang) => {
    setIsOpen(false);
    if (langCode === detectedLang) return;

    // Calculate new target path
    // Remove old lang prefix if present
    let remainingPath = pathname;
    if (pathParts.length > 0 && (SUPPORTED_LANGS as readonly string[]).includes(pathParts[0])) {
      remainingPath = '/' + pathParts.slice(1).join('/');
    }

    // Clean remaining path
    if (remainingPath === '/') {
      remainingPath = '';
    }

    // For target language:
    // e.g. /es/stories or /en/stories
    const targetUrl = `/${langCode}${remainingPath}`;
    router.push(targetUrl);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-slate-200 dark:border-zinc-700/60 transition-colors cursor-pointer"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
        <span className="uppercase tracking-wider">{currentInfo.code}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 text-xs backdrop-blur-md animate-fade-in max-h-80 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800/80 mb-1">
            Select Language
          </div>
          {SUPPORTED_LANGS.map((lang) => {
            const info = LANGUAGES[lang];
            const isSelected = lang === detectedLang;
            return (
              <button
                key={lang}
                onClick={() => handleSelectLanguage(lang)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-colors cursor-pointer ${
                  isSelected
                    ? 'font-bold text-pink-600 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-500/10'
                    : 'text-slate-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{info.flag}</span>
                  <span>{info.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-pink-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
