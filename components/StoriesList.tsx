'use client';

import React, { useState } from 'react';
import { StoryResult } from '@/lib/instagram/types';
import { StoriesViewer } from './StoriesViewer';
import { PlaySquare, Download, Clock, Sparkles } from 'lucide-react';

interface StoriesListProps {
  stories: StoryResult[];
  username: string;
}

export function StoriesList({ stories, username }: StoriesListProps) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  if (stories.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-500 dark:text-zinc-400 backdrop-blur-sm shadow-xs">
        <PlaySquare className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
        <p className="text-base font-semibold text-slate-900 dark:text-zinc-200">No active stories</p>
        <p className="text-sm mt-1 text-slate-500 dark:text-zinc-500">This account has no active 24-hour stories published right now.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-zinc-300 flex items-center gap-2">
          <span>Active 24-Hour Stories</span>
          <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold border border-pink-500/20">
            {stories.length}
          </span>
        </h2>
        <button
          onClick={() => setSelectedStoryIndex(0)}
          className="px-4 py-2 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Watch All Stories
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stories.map((story, idx) => {
          const isVideo = story.type === 'video';
          const thumbSrc = story.thumbnailUrl || (isVideo ? '' : story.url);
          const displayThumb = thumbSrc ? `/api/media?url=${encodeURIComponent(thumbSrc)}` : '';
          const videoSrc = story.url ? `/api/media?url=${encodeURIComponent(story.url)}` : '';

          return (
            <div
              key={story.id || idx}
              onClick={() => setSelectedStoryIndex(idx)}
              className="group relative bg-zinc-950 rounded-2xl overflow-hidden cursor-pointer aspect-[9/16] shadow-md hover:shadow-2xl transition-all border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
            >
              {thumbSrc ? (
                <img
                  src={displayThumb}
                  alt={`Story ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    if (thumbSrc && e.currentTarget.src !== thumbSrc) {
                      e.currentTarget.src = thumbSrc;
                    }
                  }}
                />
              ) : (
                <video
                  src={videoSrc}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover pointer-events-none"
                />
              )}

              {/* Type Badge */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-white rounded-md text-[10px] font-bold tracking-wider border border-white/10">
                  {story.type.toUpperCase()}
                </span>
              </div>

              {/* Bottom overlay with Story # & Download */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1 opacity-90 font-medium">
                  <Clock className="w-3 h-3 text-pink-400" />
                  Story #{idx + 1}
                </span>
                <a
                  href={
                    story.downloadUrl ||
                    `/api/media?url=${encodeURIComponent(story.url)}&download=true&filename=story_${username}_${story.id}.${story.type === 'video' ? 'mp4' : 'jpg'}`
                  }
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Download Story"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stories Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoriesViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </>
  );
}
