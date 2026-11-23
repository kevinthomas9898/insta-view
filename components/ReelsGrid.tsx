'use client';

import React, { useState } from 'react';
import { ReelResult } from '@/lib/instagram/types';
import { Play, Download, X, Film, Music, Sparkles, Loader2 } from 'lucide-react';

interface ReelsGridProps {
  reels: ReelResult[];
  username: string;
}

export function ReelsGrid({ reels, username }: ReelsGridProps) {
  const [selectedReel, setSelectedReel] = useState<ReelResult | null>(null);
  const [isReelLoading, setIsReelLoading] = useState(true);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

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
        {reels.map((reel, idx) => {
          const thumbSrc = reel.thumbnailUrl || reel.url;
          const displayThumb = `/api/media?url=${encodeURIComponent(thumbSrc)}`;
          const showAdAfter = (idx + 1) % 5 === 0 && idx !== reels.length - 1;

          return (
            <React.Fragment key={reel.id || idx}>
              <div
                onClick={() => {
                  setSelectedReel(reel);
                  setIsReelLoading(true);
                  setIsCaptionExpanded(false);
                }}
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
            </React.Fragment>
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
              {/* Loading Spinner Overlay */}
              {isReelLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-15 transition-opacity duration-150 animate-fade-in pointer-events-none">
                  <div className="p-3 rounded-full bg-zinc-900/90 border border-white/10 shadow-2xl">
                    <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
                  </div>
                  <span className="text-[11px] font-medium text-white/90 mt-2.5 tracking-wide">
                    Loading reel...
                  </span>
                </div>
              )}

              <video
                controls
                autoPlay
                playsInline
                preload="auto"
                onLoadedData={() => setIsReelLoading(false)}
                onWaiting={() => setIsReelLoading(true)}
                onPlaying={() => setIsReelLoading(false)}
                className={`w-full h-full object-contain transition-opacity duration-200 ${
                  isReelLoading ? 'opacity-30' : 'opacity-100'
                }`}
                src={`/api/media?url=${encodeURIComponent(selectedReel.url)}`}
                onError={(e) => {
                  setIsReelLoading(false);
                  if (e.currentTarget.src !== selectedReel.url) {
                    e.currentTarget.src = selectedReel.url;
                  }
                }}
              >
                <source src={`/api/media?url=${encodeURIComponent(selectedReel.url)}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Instagram-Style Transparent Overlay for Reel */}
              {(selectedReel.caption || selectedReel.audioTitle) && (
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white z-20 flex flex-col gap-1.5 pointer-events-auto">
                  {selectedReel.audioTitle && (
                    <p className="flex items-center gap-1.5 text-white/80 text-xs font-medium drop-shadow">
                      <Music className="w-3.5 h-3.5 text-pink-400" />
                      <span>{selectedReel.audioTitle}</span>
                    </p>
                  )}
                  {selectedReel.caption && (
                    <div className="text-xs text-white/95 leading-relaxed drop-shadow-sm max-h-[30vh] overflow-y-auto">
                      <p className={isCaptionExpanded ? 'whitespace-pre-line' : 'line-clamp-2'}>
                        {selectedReel.caption}
                      </p>
                      {selectedReel.caption.length > 70 && (
                        <button
                          type="button"
                          onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                          className="text-[11px] font-bold text-pink-400 hover:text-pink-300 mt-0.5 cursor-pointer underline underline-offset-2"
                        >
                          {isCaptionExpanded ? 'Show less' : '... more'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
