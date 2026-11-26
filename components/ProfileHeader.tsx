'use client';

import React, { useState } from 'react';
import { Profile, ProviderMetadata } from '@/lib/instagram/types';
import { CheckCircle2, Lock, ExternalLink, ShieldCheck, Bookmark, Eye, ZoomIn, Download } from 'lucide-react';
import { DpViewerModal } from '@/components/DpViewerModal';

interface ProfileHeaderProps {
  profile: Profile;
  metadata?: ProviderMetadata;
  isWatchlisted?: boolean;
  onToggleWatchlist?: () => void;
}

export function ProfileHeader({ profile, isWatchlisted, onToggleWatchlist }: ProfileHeaderProps) {
  const [isDpModalOpen, setIsDpModalOpen] = useState(false);

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Safe avatar URL through proxy
  const avatarSrc = profile.avatarUrl
    ? `/api/media?url=${encodeURIComponent(profile.avatarUrl)}`
    : undefined;

  return (
    <>
      <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 mb-6 shadow-xl dark:shadow-2xl backdrop-blur-sm transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar with IG gradient border & Click to open DP */}
          <div className="relative flex-shrink-0 group">
            <button
              type="button"
              onClick={() => profile.avatarUrl && setIsDpModalOpen(true)}
              className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 shadow-md shadow-rose-950/20 block cursor-pointer transition-transform duration-200 group-hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500"
              title="Click to view & download full HD Profile Picture (DP)"
            >
              <div className="relative rounded-full overflow-hidden w-24 h-24 sm:w-28 sm:h-28">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={profile.username}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover border-2 border-white dark:border-zinc-950 bg-slate-100 dark:bg-zinc-800"
                    onError={(e) => {
                      if (profile.avatarUrl && e.currentTarget.src !== profile.avatarUrl) {
                        e.currentTarget.src = profile.avatarUrl;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-slate-700 dark:text-zinc-300 font-bold text-3xl">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Hover overlay hint */}
                {profile.avatarUrl && (
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                    <ZoomIn className="w-5 h-5 mb-0.5 drop-shadow" />
                    <span className="text-[10px] font-bold tracking-tight uppercase">View DP</span>
                  </div>
                )}
              </div>
            </button>
            {profile.isPrivate && (
              <div
                title="Private Account"
                className="absolute bottom-1 right-1 bg-amber-500 text-zinc-950 p-1.5 rounded-full border-2 border-white dark:border-zinc-900 shadow-md pointer-events-none"
              >
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight break-all">
                @{profile.username}
              </h1>
              {profile.verified && (
                <span title="Verified Account">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-600/10" />
                </span>
              )}
              {profile.isPrivate ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Private Account
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:border-zinc-700/60 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Public Profile
                </span>
              )}

              {/* View & Download HD DP Button */}
              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setIsDpModalOpen(true)}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20 hover:bg-pink-100 dark:hover:bg-pink-500/20 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  title="View & Download Full HD Profile Picture"
                >
                  <Eye className="w-3 h-3 text-pink-600 dark:text-pink-400" />
                  <span>View HD DP</span>
                </button>
              )}

              {onToggleWatchlist && (
                <button
                  type="button"
                  onClick={onToggleWatchlist}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                    isWatchlisted
                      ? 'bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                  title={isWatchlisted ? 'Remove from Secret Watchlist' : 'Add to Secret Watchlist (100% Private)'}
                >
                  <Bookmark className={`w-3 h-3 ${isWatchlisted ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isWatchlisted ? 'Watchlisted' : 'Watchlist'}</span>
                </button>
              )}
            </div>

          {profile.fullName && (
            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 mt-1">{profile.fullName}</p>
          )}

          {profile.biography && (
            <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2.5 whitespace-pre-line leading-relaxed max-w-2xl font-normal">
              {profile.biography}
            </p>
          )}

          {profile.externalUrl && (
            <a
              href={profile.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-pink-600 dark:text-pink-400 hover:underline mt-2 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {profile.externalUrl.replace(/^https?:\/\//, '')}
            </a>
          )}

          {/* Stats Bar */}
          <div className="flex gap-4 sm:gap-8 mt-5 pt-4 border-t border-slate-200 dark:border-zinc-800/80 text-sm">
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white text-base">{formatNumber(profile.postsCount)}</span>
              <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Posts</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white text-base">{formatNumber(profile.followers)}</span>
              <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white text-base">{formatNumber(profile.following)}</span>
              <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* HD DP Lightbox Modal */}
    {profile.avatarUrl && (
      <DpViewerModal
        isOpen={isDpModalOpen}
        onClose={() => setIsDpModalOpen(false)}
        username={profile.username}
        fullName={profile.fullName}
        avatarUrl={profile.avatarUrl}
        isVerified={profile.verified}
        isPrivate={profile.isPrivate}
      />
    )}
  </>
  );
}
