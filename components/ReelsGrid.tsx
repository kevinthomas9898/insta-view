'use client';

import React, { useState } from 'react';
import { ReelResult } from '@/lib/instagram/types';
import { Play, Download, X, Film, Music } from 'lucide-react';

interface ReelsGridProps {
  reels: ReelResult[];
  username: string;
}

export function ReelsGrid({ reels, username }: ReelsGridProps) {
  const [selectedReel, setSelectedReel] = useState<ReelResult | null>(null);

  if (reels.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-500 dark:text-zinc-400 backdrop-blur-sm shadow-xs">
        <Film className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
        <p className="text-base font-semibold text-slate-900 dark:text-zinc-200">No reels found</p>
        <p className="text-sm mt-1 text-slate-500 dark:text-zinc-500">This account has not published any public reels.</p>
      </div>
    );
  }

  const formatViews = (count?: number) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {reels.map((reel) => {
          const thumbSrc = reel.thumbnailUrl || reel.url;
          const displayThumb = `/api/media?url=${encodeURIComponent(thumbSrc)}`;

          return (
            <div
              key={reel.id}
              onClick={() => setSelectedReel(reel)}
              className="group relative bg-zinc-950 rounded-2xl overflow-hidden cursor-pointer aspect-[9/16] shadow-md hover:shadow-2xl transition-all border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
            >
              <img
                src={displayThumb}
                alt={reel.caption || 'Reel thumbnail'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  if (e.currentTarget.src !== thumbSrc) {
                    e.currentTarget.src = thumbSrc;
                  }
                }}
              />

              {/* Bottom Overlay with Views & Play Icon */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white text-xs flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold drop-shadow">
                  <Play className="w-3.5 h-3.5 fill-current text-white" />
                  {formatViews(reel.viewCount || reel.playCount) || 'Play'}
                </span>
                {reel.duration && (
                  <span className="opacity-90 text-[11px] font-medium bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {reel.duration}s
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reel Modal Player */}
      {selectedReel && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-sm sm:max-w-md h-[88vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Top Close & Download Bar */}
            <div className="absolute top-0 inset-x-0 z-30 p-3.5 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white">
              <span className="text-xs font-bold tracking-tight">@{username} Reel</span>
              <div className="flex items-center gap-2">
                <a
                  href={
                    selectedReel.downloadUrl ||
                    `/api/media?url=${encodeURIComponent(selectedReel.url)}&download=true&filename=reel_${username}_${selectedReel.id}.mp4`
                  }
                  download
                  className="p-2 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                  title="Download Reel"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedReel(null)}
                  className="p-2 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
              <video
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
                src={`/api/media?url=${encodeURIComponent(selectedReel.url)}`}
                onError={(e) => {
                  if (e.currentTarget.src !== selectedReel.url) {
                    e.currentTarget.src = selectedReel.url;
                  }
                }}
              >
                <source src={`/api/media?url=${encodeURIComponent(selectedReel.url)}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Caption & Audio info if present */}
            {(selectedReel.caption || selectedReel.audioTitle) && (
              <div className="p-3 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-300">
                {selectedReel.audioTitle && (
                  <p className="flex items-center gap-1.5 text-zinc-400 mb-1 font-medium">
                    <Music className="w-3.5 h-3.5 text-pink-400" />
                    <span>{selectedReel.audioTitle}</span>
                  </p>
                )}
                {selectedReel.caption && (
                  <p className="line-clamp-2 text-zinc-300">{selectedReel.caption}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
