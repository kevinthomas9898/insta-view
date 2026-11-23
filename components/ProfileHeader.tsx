'use client';

import React from 'react';
import { Profile, ProviderMetadata } from '@/lib/instagram/types';
import { CheckCircle2, Lock, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';

interface ProfileHeaderProps {
  profile: Profile;
  metadata?: ProviderMetadata;
}

export function ProfileHeader({ profile, metadata }: ProfileHeaderProps) {
  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Safe avatar URL through proxy if needed
  const avatarSrc = profile.avatarUrl
    ? `/api/media?url=${encodeURIComponent(profile.avatarUrl)}`
    : undefined;

  return (
    <div className="bg-white border border-gray-200 rounded p-6 mb-6">
      {/* Demo Warning Banner */}
      {metadata?.isDemo && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-700" />
          <div>
            <strong className="font-semibold">DEMO DATA — NOT LIVE INSTAGRAM DATA</strong>
            <p className="text-xs text-amber-800">
              Live retrieval requires an API key or unblocked IP. Displaying fully interactive test media with real playable video streams.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={profile.username}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover border border-gray-300 bg-gray-100"
              onError={(e) => {
                // If proxy or direct CDN fails, fallback to direct or placeholder
                if (profile.avatarUrl && e.currentTarget.src !== profile.avatarUrl) {
                  e.currentTarget.src = profile.avatarUrl;
                }
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 font-bold text-2xl">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          {profile.isPrivate && (
            <div
              title="Private Account"
              className="absolute bottom-0 right-0 bg-gray-800 text-white p-1 rounded-full border-2 border-white"
            >
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">@{profile.username}</h1>
            {profile.verified && (
              <span title="Verified Account">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </span>
            )}
            {metadata && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {metadata.provider} ({metadata.executionTimeMs}ms)
              </span>
            )}
          </div>

          {profile.fullName && (
            <p className="text-sm font-medium text-gray-700 mt-0.5">{profile.fullName}</p>
          )}

          {profile.biography && (
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line leading-relaxed max-w-2xl">
              {profile.biography}
            </p>
          )}

          {profile.externalUrl && (
            <a
              href={profile.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {profile.externalUrl.replace(/^https?:\/\//, '')}
            </a>
          )}

          {/* Stats Bar */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 text-sm">
            <div>
              <span className="font-bold text-gray-900">{formatNumber(profile.postsCount)}</span>{' '}
              <span className="text-gray-500">posts</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">{formatNumber(profile.followers)}</span>{' '}
              <span className="text-gray-500">followers</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">{formatNumber(profile.following)}</span>{' '}
              <span className="text-gray-500">following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
