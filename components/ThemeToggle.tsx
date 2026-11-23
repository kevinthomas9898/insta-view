'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const nextTheme = isDark ? 'light' : 'dark';

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      try {
        localStorage.setItem('theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      try {
        localStorage.setItem('theme', 'light');
      } catch {}
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      id="theme-toggle-btn"
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer border text-xs font-semibold
        bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm
        dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
    >
      {/* Sun icon visible in dark mode, Moon icon visible in light mode */}
      <Sun className="w-3.5 h-3.5 text-amber-400 hidden dark:inline-block" />
      <Moon className="w-3.5 h-3.5 text-indigo-600 inline-block dark:hidden" />
      <span className="hidden dark:inline">Light</span>
      <span className="inline dark:hidden">Dark</span>
    </button>
  );
}
