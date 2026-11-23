'use client';

import React, { useState } from 'react';
import { HighlightResult } from '@/lib/instagram/types';
import { StoriesViewer } from './StoriesViewer';
import { Folder } from 'lucide-react';

interface HighlightsViewerProps {
  highlights: HighlightResult[];
}

export function HighlightsViewer({ highlights }: HighlightsViewerProps) {
  const [activeHighlight, setActiveHighlight] = useState<HighlightResult | null>(null);

  if (highlights.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-500 dark:text-zinc-400 backdrop-blur-sm shadow-xs">
        <Folder className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
        <p className="text-base font-semibold text-slate-900 dark:text-zinc-200">No highlights available</p>
        <p className="text-sm mt-1 text-slate-500 dark:text-zinc-500">This account has not published any public highlight albums.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {highlights.map((hl) => {
          const coverSrc = hl.coverUrl
            ? `/api/media?url=${encodeURIComponent(hl.coverUrl)}`
            : undefined;

          return (
            <div
              key={hl.id}
              onClick={() => setActiveHighlight(hl)}
              className="group cursor-pointer flex flex-col items-center p-4 bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xl active:scale-95 transition-all text-center backdrop-blur-sm shadow-xs"
            >
              <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform mb-2.5 overflow-hidden flex items-center justify-center shadow-md shadow-rose-950/20">
                {coverSrc ? (
                  <img
                    src={coverSrc}
                    alt={hl.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full border-2 border-white dark:border-zinc-950 bg-slate-100 dark:bg-zinc-800"
                    onError={(e) => {
                      if (hl.coverUrl && e.currentTarget.src !== hl.coverUrl) {
                        e.currentTarget.src = hl.coverUrl;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full border-2 border-white dark:border-zinc-950 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Folder className="w-8 h-8 text-slate-400 dark:text-zinc-400" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-full">
                {hl.title}
              </h3>
              <span className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                {hl.mediaCount || hl.items.length} stories
              </span>
            </div>
          );
        })}
      </div>

      {/* Stories Viewer Modal when a highlight is clicked */}
      {activeHighlight && (
        <StoriesViewer
          stories={activeHighlight.items.map((it) => ({
            ...it,
            storyId: it.id,
          }))}
          onClose={() => setActiveHighlight(null)}
        />
      )}
    </>
  );
}
