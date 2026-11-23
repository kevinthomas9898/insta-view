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
      <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-500">
        <Folder className="w-10 h-10 mx-auto mb-2 text-gray-400 stroke-1" />
        <p className="text-base font-medium">No highlights available</p>
        <p className="text-sm mt-1 text-gray-400">This account has not published any public highlight albums.</p>
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
              className="group cursor-pointer flex flex-col items-center p-3 bg-white border border-gray-200 rounded hover:border-gray-400 transition-all text-center"
            >
              <div className="w-20 h-20 rounded-full p-0.5 border-2 border-gray-300 group-hover:border-gray-900 transition-colors mb-2 overflow-hidden bg-gray-100 flex items-center justify-center">
                {coverSrc ? (
                  <img
                    src={coverSrc}
                    alt={hl.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      if (hl.coverUrl && e.currentTarget.src !== hl.coverUrl) {
                        e.currentTarget.src = hl.coverUrl;
                      }
                    }}
                  />
                ) : (
                  <Folder className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 truncate max-w-full">
                {hl.title}
              </h3>
              <span className="text-xs text-gray-500 mt-0.5">
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
