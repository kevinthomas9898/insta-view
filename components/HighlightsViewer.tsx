'use client';

import React, { useState, useEffect } from 'react';
import { HighlightResult } from '@/lib/instagram/types';
import { StoriesViewer } from './StoriesViewer';
import { Folder, Loader2 } from 'lucide-react';

interface HighlightsViewerProps {
  highlights: HighlightResult[];
  username?: string;
}

export function HighlightsViewer({ highlights: initialHighlights, username = '' }: HighlightsViewerProps) {
  const [highlights, setHighlights] = useState<HighlightResult[]>(initialHighlights);
  const [activeHighlight, setActiveHighlight] = useState<HighlightResult | null>(null);
  const [loadingHighlightId, setLoadingHighlightId] = useState<string | null>(null);

  // Sync state if initialHighlights prop updates
  useEffect(() => {
    setHighlights(initialHighlights);
  }, [initialHighlights]);

  const handleHighlightClick = async (hl: HighlightResult) => {
    // If the highlight already has stories loaded, open immediately
    if (hl.items && hl.items.length > 0) {
      setActiveHighlight(hl);
      return;
    }

    // Otherwise fetch stories on-demand
    setLoadingHighlightId(hl.id);
    try {
      const res = await fetch(
        `/api/highlights?highlightId=${encodeURIComponent(hl.id)}&username=${encodeURIComponent(username)}`
      );
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const updatedHl: HighlightResult = {
          ...hl,
          items: json.data,
          mediaCount: json.data.length,
        };

        // Update local list with the newly loaded items and count
        setHighlights((prev) =>
          prev.map((item) => (item.id === hl.id ? updatedHl : item))
        );

        setActiveHighlight(updatedHl);
      } else {
        // Highlight has no items or private
        setActiveHighlight({
          ...hl,
          items: [],
          mediaCount: 0,
        });
      }
    } catch {
      // Error fetching highlight stories
    } finally {
      setLoadingHighlightId(null);
    }
  };

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
          const isLoadingThis = loadingHighlightId === hl.id;

          return (
            <div
              key={hl.id}
              onClick={() => handleHighlightClick(hl)}
              className="group cursor-pointer flex flex-col items-center p-4 bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xl active:scale-95 transition-all text-center backdrop-blur-sm shadow-xs relative"
            >
              <div className="relative w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform mb-2.5 overflow-hidden flex items-center justify-center shadow-md shadow-rose-950/20">
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

                {/* Loading Spinner on Click */}
                {isLoadingThis && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center backdrop-blur-xs z-10 animate-fade-in">
                    <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-full">
                {hl.title}
              </h3>
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
