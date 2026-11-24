'use client';

import React, { useState } from 'react';
import {
  TOP_CATEGORIES,
  TOP_ACCOUNTS,
  TopCategoryId,
} from '@/lib/data/top-accounts';
import { Sparkles, TrendingUp } from 'lucide-react';

interface TopAccountsDirectoryProps {
  onSelectAccount: (username: string) => void;
}

export function TopAccountsDirectory({ onSelectAccount }: TopAccountsDirectoryProps) {
  const [activeCategory, setActiveCategory] = useState<TopCategoryId>('trending');

  const filteredAccounts = TOP_ACCOUNTS.filter(
    (acc) => acc.category === activeCategory
  );

  return (
    <div className="w-full mt-6 pt-5 border-t border-slate-200/80 dark:border-zinc-800/80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-pink-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            Top 50 Most Viewed Accounts
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
          Click any account to view instantly
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {TOP_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Account Pills */}
      <div className="flex flex-wrap gap-2 mt-2.5">
        {filteredAccounts.map((acc) => (
          <button
            key={acc.username}
            onClick={() => onSelectAccount(acc.username)}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900/80 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-pink-500/40 text-xs font-medium text-slate-800 dark:text-zinc-200 transition-all shadow-2xs hover:scale-102 cursor-pointer"
            title={`View @${acc.username}'s active stories and posts`}
          >
            <span className="font-semibold text-pink-600 dark:text-pink-400">@</span>
            <span>{acc.username}</span>
            {acc.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                {acc.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
