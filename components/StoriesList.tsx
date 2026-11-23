'use client';

import React, { useState } from 'react';
import { StoryResult } from '@/lib/instagram/types';
import { StoriesViewer } from './StoriesViewer';
import { PlaySquare, Download, Clock } from 'lucide-react';

interface StoriesListProps {
  stories: StoryResult[];
  username: string;
}

export function StoriesList({ stories, username }: StoriesListProps) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  if (stories.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-500">
        <PlaySquare className="w-10 h-10 mx-auto mb-2 text-gray-400 stroke-1" />
        <p className="text-base font-medium">No active stories</p>
        <p className="text-sm mt-1 text-gray-400">This account has no active 24-hour stories published right now.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Active 24-Hour Stories ({stories.length})
        </h2>
        <button
          onClick={() => setSelectedStoryIndex(0)}
          className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded transition-colors"
        >
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
              className="group relative bg-gray-900 rounded overflow-hidden cursor-pointer aspect-[9/16] shadow-sm hover:shadow-md transition-all border border-gray-200"
            >
              {thumbSrc ? (
                <img
                  src={displayThumb}
                  alt={`Story ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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

              {/* Badges */}
              <div className="absolute top-2 left-2 z-10">
                <span className="px-1.5 py-0.5 bg-black/60 text-white rounded text-[10px] font-medium tracking-wide">
                  {story.type.toUpperCase()}
                </span>
              </div>

              {/* Time remaining */}
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1 opacity-90">
                  <Clock className="w-3 h-3" />
                  Story #{idx + 1}
                </span>
                <a
                  href={
                    story.downloadUrl ||
                    `/api/media?url=${encodeURIComponent(story.url)}&download=true&filename=story_${story.id}.${story.type === 'video' ? 'mp4' : 'jpg'}`
                  }
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-white/20 rounded text-white"
                  title="Download"
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
