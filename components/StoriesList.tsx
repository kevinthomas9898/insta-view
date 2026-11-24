'use client';

import React, { useState, useEffect } from 'react';
import { StoryResult } from '@/lib/instagram/types';
import { StoriesViewer } from './StoriesViewer';
import {
  PlaySquare,
  Download,
  Clock,
  Sparkles,
  Archive,
  Loader2,
  BookmarkCheck,
  BookmarkPlus,
  AlertTriangle,
} from 'lucide-react';
import { saveStoryToVault, isStoryInVault, VaultStoryItem } from '@/lib/storage/story-vault';

interface StoriesListProps {
  stories: StoryResult[];
  username: string;
}

export function StoriesList({ stories, username }: StoriesListProps) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<string | null>(null);
  const [vaultedStoryIds, setVaultedStoryIds] = useState<Set<string>>(new Set());
  const [now, setNow] = useState<number>(Date.now());

  // Update countdown clock every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Check which stories are already vaulted in local storage
  useEffect(() => {
    async function checkVault() {
      const savedIds = new Set<string>();
      for (const s of stories) {
        const id = `story_${username}_${s.id}`;
        if (await isStoryInVault(id)) {
          savedIds.add(s.id);
        }
      }
      setVaultedStoryIds(savedIds);
    }
    if (stories.length > 0) {
      checkVault();
    }
  }, [stories, username]);

  if (stories.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-500 dark:text-zinc-400 backdrop-blur-sm shadow-xs">
        <PlaySquare className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
        <p className="text-base font-semibold text-slate-900 dark:text-zinc-200">No active stories</p>
        <p className="text-sm mt-1 text-slate-500 dark:text-zinc-500">
          This account has no active 24-hour stories published right now.
        </p>
      </div>
    );
  }

  // Calculate remaining time before 24-hour expiration
  const getRemainingTime = (story: StoryResult): { text: string; urgent: boolean } => {
    let expiresAtMs: number | null = null;

    if (story.expiresAt) {
      const parsed = new Date(story.expiresAt).getTime();
      if (!isNaN(parsed)) expiresAtMs = parsed;
    }

    if (!expiresAtMs && story.takenAt) {
      const timestampMs = story.takenAt < 10000000000 ? story.takenAt * 1000 : story.takenAt;
      expiresAtMs = timestampMs + 24 * 60 * 60 * 1000;
    }

    if (!expiresAtMs && story.timestamp) {
      const parsed = new Date(story.timestamp).getTime();
      if (!isNaN(parsed)) expiresAtMs = parsed + 24 * 60 * 60 * 1000;
    }

    if (!expiresAtMs) return { text: '< 24h left', urgent: false };
    const diffMs = expiresAtMs - now;

    if (diffMs <= 0) return { text: 'Expiring now', urgent: true };

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 2) {
      return { text: `${hours}h ${mins}m left`, urgent: true };
    }
    return { text: `${hours}h ${mins}m left`, urgent: false };
  };

  // 1-Click Batch Download All Stories as ZIP
  const downloadAllStoriesZip = async () => {
    if (isZipping || stories.length === 0) return;
    setIsZipping(true);
    setZipProgress('Starting...');

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (let i = 0; i < stories.length; i++) {
        const story = stories[i];
        setZipProgress(`${i + 1}/${stories.length}...`);
        const isVideo = story.type === 'video';
        const ext = isVideo ? 'mp4' : 'jpg';
        const mediaUrl = `/api/media?url=${encodeURIComponent(story.url)}`;

        const res = await fetch(mediaUrl);
        if (res.ok) {
          const blob = await res.blob();
          zip.file(`story_${username}_${i + 1}_${story.id || Date.now()}.${ext}`, blob);
        }
      }

      setZipProgress('Packaging...');
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `stories_${username}_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);

      setZipProgress('✓ Downloaded!');
      setTimeout(() => setZipProgress(null), 3000);
    } catch (err) {
      console.error('Failed to download stories zip:', err);
      alert('Could not download all stories as ZIP. Please try downloading individually.');
    } finally {
      setIsZipping(false);
    }
  };

  // Toggle Save story to Offline IndexedDB Vault
  const handleToggleVault = async (story: StoryResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const vaultId = `story_${username}_${story.id}`;

    if (vaultedStoryIds.has(story.id)) return;

    const isVideo = story.type === 'video';
    const vaultItem: VaultStoryItem = {
      id: vaultId,
      username,
      mediaUrl: story.url,
      thumbnailUrl: story.thumbnailUrl,
      type: isVideo ? 'video' : 'image',
      takenAt: story.takenAt
        ? story.takenAt < 10000000000
          ? story.takenAt * 1000
          : story.takenAt
        : Date.now(),
      savedAt: Date.now(),
      expiresAt: Date.now() + 24 * 3600 * 1000,
    };

    await saveStoryToVault(vaultItem);
    setVaultedStoryIds((prev) => new Set(prev).add(story.id));
  };

  return (
    <>
      {/* Header with Title and Batch Action Buttons */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-zinc-300 flex items-center gap-2">
          <span>Active 24-Hour Stories</span>
          <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold border border-pink-500/20">
            {stories.length}
          </span>
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Download All Stories as ZIP */}
          <button
            onClick={downloadAllStoriesZip}
            disabled={isZipping}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            title="Download all stories as a single ZIP archive"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{zipProgress || 'Zipping...'}</span>
              </>
            ) : zipProgress ? (
              <span>{zipProgress}</span>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5" />
                <span>Download All (ZIP)</span>
              </>
            )}
          </button>

          {/* Full Screen Story Playback */}
          <button
            onClick={() => setSelectedStoryIndex(0)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Watch All</span>
          </button>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {stories.map((story, idx) => {
          const isVideo = story.type === 'video';
          const thumbSrc = story.thumbnailUrl || (isVideo ? '' : story.url);
          const displayThumb = thumbSrc ? `/api/media?url=${encodeURIComponent(thumbSrc)}` : '';
          const videoSrc = story.url ? `/api/media?url=${encodeURIComponent(story.url)}` : '';
          const countdown = getRemainingTime(story);
          const isVaulted = vaultedStoryIds.has(story.id);

          return (
            <div
              key={story.id || idx}
              onClick={() => setSelectedStoryIndex(idx)}
              className="group relative bg-zinc-950 rounded-2xl overflow-hidden cursor-pointer aspect-[9/16] shadow-md hover:shadow-2xl active:scale-95 transition-all border border-slate-200 dark:border-zinc-800 hover:border-pink-500/50"
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

              {/* Top Left: Type Badge */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-white rounded-md text-[10px] font-bold tracking-wider border border-white/10">
                  {story.type.toUpperCase()}
                </span>
              </div>

              {/* Top Right: Live Story Expiration Countdown Badge */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-md flex items-center gap-1 border ${
                    countdown.urgent
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse'
                      : 'bg-black/70 text-zinc-300 border-white/10'
                  }`}
                  title="Time remaining before story expires on Instagram"
                >
                  {countdown.urgent ? (
                    <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                  ) : (
                    <Clock className="w-2.5 h-2.5 text-amber-400" />
                  )}
                  {countdown.text}
                </span>
              </div>

              {/* Bottom Overlay: Story Index, Vault Toggle, and Download */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white text-[11px] flex items-center justify-between z-10">
                <span className="flex items-center gap-1 opacity-90 font-medium">
                  <Clock className="w-3 h-3 text-pink-400" />
                  #{idx + 1}
                </span>

                <div className="flex items-center gap-1">
                  {/* Save to Offline Vault Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleVault(story, e)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer border ${
                      isVaulted
                        ? 'bg-amber-500/30 text-amber-300 border-amber-500/40'
                        : 'bg-black/60 hover:bg-white/20 text-white border-white/10'
                    }`}
                    title={isVaulted ? 'Saved in Offline Vault' : 'Save to Offline Vault'}
                  >
                    {isVaulted ? (
                      <>
                        <BookmarkCheck className="w-3 h-3 text-amber-400" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3 h-3 text-pink-400" />
                        <span>Vault</span>
                      </>
                    )}
                  </button>

                  {/* Direct Single Download */}
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
            </div>
          );
        })}
      </div>

      {/* Stories Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoriesViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          username={username}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </>
  );
}
