'use client';

import React from 'react';
import { PlaySquare, Bookmark, Grid, Film } from 'lucide-react';

export type TabKey = 'stories' | 'highlights' | 'posts' | 'reels';

interface TabsNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  counts?: {
    stories?: number;
    highlights?: number;
    posts?: number;
    reels?: number;
  };
}

export function TabsNav({ activeTab, onTabChange, counts }: TabsNavProps) {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      key: 'stories',
      label: 'Stories',
      icon: <PlaySquare className="w-4 h-4" />,
      count: counts?.stories,
    },
    {
      key: 'highlights',
      label: 'Highlights',
      icon: <Bookmark className="w-4 h-4" />,
      count: counts?.highlights,
    },
    {
      key: 'posts',
      label: 'Posts',
      icon: <Grid className="w-4 h-4" />,
      count: counts?.posts,
    },
    {
      key: 'reels',
      label: 'Reels',
      icon: <Film className="w-4 h-4" />,
      count: counts?.reels,
    },
  ];

  return (
    <div className="flex bg-white dark:bg-zinc-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 mb-6 overflow-x-auto gap-1.5 backdrop-blur-sm shadow-xs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white shadow-md shadow-rose-950/20 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
