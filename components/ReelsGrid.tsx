'use client';

import React, { useState } from 'react';
import { ReelResult } from '@/lib/instagram/types';
import { Play, Music, Download, Eye, X, Film } from 'lucide-react';

interface ReelsGridProps {
  reels: ReelResult[];
  username: string;
}

export function ReelsGrid({ reels, username }: ReelsGridProps) {
  const [selectedReel, setSelectedReel] = useState<ReelResult | null>(null);

  if (reels.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-500">
        <Film className="w-10 h-10 mx-auto mb-2 text-gray-400 stroke-1" />
        <p className="text-base font-medium">No reels found</p>
        <p className="text-sm mt-1 text-gray-400">This account has not published any public reels.</p>
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
              className="group relative bg-black rounded overflow-hidden cursor-pointer aspect-[9/16] shadow-sm hover:shadow-md transition-all border border-gray-200"
            >
              <img
                src={displayThumb}
                alt={reel.caption || 'Reel thumbnail'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  if (e.currentTarget.src !== thumbSrc) {
                    e.currentTarget.src = thumbSrc;
                  }
                }}
              />

              {/* Bottom Overlay with Views & Play Icon */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-xs flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {formatViews(reel.viewCount || reel.playCount) || 'Play'}
                </span>
                {reel.duration && (
                  <span className="opacity-80 text-[11px]">{reel.duration}s</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reel Modal Player */}
      {selectedReel && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm sm:max-w-md h-[88vh] bg-black rounded-lg overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Top Close & Download Bar */}
            <div className="absolute top-0 inset-x-0 z-30 p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white">
              <span className="text-xs font-semibold">@{username} Reel</span>
              <div className="flex items-center gap-2">
                <a
                  href={
                    selectedReel.downloadUrl ||
                    `/api/media?url=${encodeURIComponent(selectedReel.url)}&download=true&filename=reel_${selectedReel.id}.mp4`
                  }
                  download
                  className="p-1.5 hover:bg-white/20 rounded text-white"
                  title="Download Reel"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedReel(null)}
                  className="p-1.5 hover:bg-white/20 rounded text-white"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Native Video Element */}
            <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
              <video
                controls
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

            {/* Bottom Caption & Audio Info */}
            <div className="p-3 bg-black/90 text-white border-t border-white/10 text-xs">
              {selectedReel.caption && (
                <p className="line-clamp-2 text-gray-300 mb-2 leading-relaxed">
                  {selectedReel.caption}
                </p>
              )}
              {selectedReel.audioTitle && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Music className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {selectedReel.audioTitle}
                    {selectedReel.audioArtist ? ` • ${selectedReel.audioArtist}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
