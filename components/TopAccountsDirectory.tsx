'use client';

import React, { useState, useEffect } from 'react';
import {
  TOP_CATEGORIES,
  TOP_ACCOUNTS,
  TopCategoryId,
} from '@/lib/data/top-accounts';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface TopAccountsDirectoryProps {
  onSelectAccount: (username: string) => void;
}

export function TopAccountsDirectory({ onSelectAccount }: TopAccountsDirectoryProps) {
  const [activeCategory, setActiveCategory] = useState<TopCategoryId>('trending');
  // Collapsed by default on mobile (< 768px) to eliminate clutter; auto-expanded on desktop
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsExpanded(true);
    }
  }, []);

  const filteredAccounts = TOP_ACCOUNTS.filter(
    (acc) => acc.category === activeCategory
  );

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-3 sm:p-5 shadow-xs transition-all animate-fade-in">
      {/* Header Bar with 1-Click Expand / Collapse Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 cursor-pointer group text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <span>Top 50 Most Viewed Accounts</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 shrink-0">
                1-Click Switch
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
              Instantly view anonymous stories, highlights, and reels for trending creators
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-pink-600 dark:text-pink-400 shrink-0 group-hover:underline">
          <span>{isExpanded ? 'Collapse' : 'Explore'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Discovery Directory */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 animate-fade-in">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {TOP_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs scale-102'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 dark:bg-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-700/80'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Account Pills Grid */}
          <div className="flex flex-wrap gap-2">
            {filteredAccounts.map((acc) => (
              <button
                key={acc.username}
                onClick={() => onSelectAccount(acc.username)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 hover:bg-pink-50 dark:hover:bg-zinc-700/80 border border-slate-200 dark:border-zinc-700/80 hover:border-pink-500/40 text-xs font-medium text-slate-800 dark:text-zinc-200 transition-all shadow-2xs hover:scale-102 cursor-pointer"
                title={`View @${acc.username}'s active stories and posts`}
              >
                <span className="font-bold text-pink-600 dark:text-pink-400">@</span>
                <span className="font-semibold">{acc.username}</span>
                {acc.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                    {acc.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
