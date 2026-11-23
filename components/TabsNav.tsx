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
    <div className="flex border-b border-gray-200 bg-white rounded-t mb-6 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? 'border-gray-900 text-gray-900 bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'
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
