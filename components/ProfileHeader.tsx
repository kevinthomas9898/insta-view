'use client';

import React from 'react';
import { Profile, ProviderMetadata } from '@/lib/instagram/types';
import { CheckCircle2, Lock, ExternalLink, ShieldCheck } from 'lucide-react';

interface ProfileHeaderProps {
  profile: Profile;
  metadata?: ProviderMetadata;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
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
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-7 mb-6 shadow-2xl backdrop-blur-sm transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar with IG gradient border */}
        <div className="relative flex-shrink-0 group">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 shadow-lg shadow-rose-950/30">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={profile.username}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-zinc-950 bg-zinc-800"
                onError={(e) => {
                  if (profile.avatarUrl && e.currentTarget.src !== profile.avatarUrl) {
                    e.currentTarget.src = profile.avatarUrl;
                  }
                }}
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-zinc-300 font-bold text-3xl">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {profile.isPrivate && (
            <div
              title="Private Account"
              className="absolute bottom-1 right-1 bg-amber-500 text-zinc-950 p-1.5 rounded-full border-2 border-zinc-900 shadow-md"
            >
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              @{profile.username}
            </h1>
            {profile.verified && (
              <span title="Verified Account">
                <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500/10" />
              </span>
            )}
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Public Profile
            </span>
          </div>

          {profile.fullName && (
            <p className="text-sm font-medium text-zinc-300 mt-1">{profile.fullName}</p>
          )}

          {profile.biography && (
            <p className="text-sm text-zinc-400 mt-2.5 whitespace-pre-line leading-relaxed max-w-2xl font-normal">
              {profile.biography}
            </p>
          )}

          {profile.externalUrl && (
            <a
              href={profile.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 transition-colors mt-2 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {profile.externalUrl.replace(/^https?:\/\//, '')}
            </a>
          )}

          {/* Stats Bar */}
          <div className="flex gap-4 sm:gap-8 mt-5 pt-4 border-t border-zinc-800/80 text-sm">
            <div className="flex flex-col">
              <span className="font-bold text-white text-base">{formatNumber(profile.postsCount)}</span>
              <span className="text-xs text-zinc-500 font-medium">Posts</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-base">{formatNumber(profile.followers)}</span>
              <span className="text-xs text-zinc-500 font-medium">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-base">{formatNumber(profile.following)}</span>
              <span className="text-xs text-zinc-500 font-medium">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
