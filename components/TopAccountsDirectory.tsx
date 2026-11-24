'use client';

import React, { useState } from 'react';
import {
  TOP_CATEGORIES,
  TOP_ACCOUNTS,
  TopCategoryId,
} from '@/lib/data/top-accounts';
import { Sparkles, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface TopAccountsDirectoryProps {
  onSelectAccount: (username: string) => void;
}

export function TopAccountsDirectory({ onSelectAccount }: TopAccountsDirectoryProps) {
  const [activeCategory, setActiveCategory] = useState<TopCategoryId>('trending');
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredAccounts = TOP_ACCOUNTS.filter(
    (acc) => acc.category === activeCategory
  );

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-4 sm:p-6 shadow-xs animate-fade-in">
      {/* Header with Collapsible Toggle */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>Top 50 Most Viewed Accounts</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                1-Click Switch
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
              Instantly view anonymous stories, highlights, and reels for trending creators
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Collapse' : 'Explore'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none border-b border-slate-100 dark:border-zinc-800/80">
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
        </>
      )}
    </div>
  );
}
