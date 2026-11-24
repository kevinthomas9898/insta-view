'use client';

import React, { useEffect, useState } from 'react';
import {
  VaultStoryItem,
  getVaultStories,
  removeStoryFromVault,
  clearVault,
} from '@/lib/storage/story-vault';
import {
  X,
  Trash2,
  Download,
  Play,
  Film,
  Clock,
  HardDrive,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';

interface StoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoryVaultModal({ isOpen, onClose }: StoryVaultModalProps) {
  const [items, setItems] = useState<VaultStoryItem[]>([]);
  const [activeStory, setActiveStory] = useState<VaultStoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const loadItems = async () => {
    setIsLoading(true);
    const data = await getVaultStories();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeStory) {
          setActiveStory(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeStory, onClose]);

  if (!isOpen) return null;

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeStoryFromVault(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (activeStory?.id === id) setActiveStory(null);
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all stories from your private vault?')) {
      await clearVault();
      setItems([]);
      setActiveStory(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Card */}
      <div
        className="relative w-full max-w-4xl max-h-[88vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Responsive Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xs shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  Story Vault
                </h3>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 shrink-0">
                  {items.length} {items.length === 1 ? 'Story' : 'Stories'}
                </span>

                {/* Privacy Info Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowInfo((prev) => !prev)}
                  className={`p-1 rounded-full transition-colors cursor-pointer shrink-0 ${
                    showInfo
                      ? 'text-pink-500 bg-pink-500/15 ring-1 ring-pink-500/30'
                      : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                  }`}
                  aria-label="Toggle Storage Privacy Info"
                  title="100% Private Client Storage Information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear all saved vault stories"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close Story Vault"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* In-Modal Privacy Info Banner (100% responsive, never clipped) */}
        {showInfo && (
          <div className="mx-4 sm:mx-6 mt-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700/80 shadow-sm flex items-start gap-2.5 animate-fade-in text-xs">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] text-slate-900 dark:text-zinc-100">
                100% Private Client Storage
              </p>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Re-watch anytime, even after 24h expiration on Instagram. Stored exclusively inside your browser&apos;s local IndexedDB with zero server transmission.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-750 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss info"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-slate-400">
              Loading your private vault...
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 sm:py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <HardDrive className="w-8 h-8 stroke-[1.5]" />
              </div>
              <p className="text-base font-semibold text-slate-800 dark:text-zinc-200">
                Your Story Vault is empty
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
                Stories saved here are stored privately on this device so you can re-watch them forever, even after 24h expiration on Instagram.
              </p>

              {/* Step-by-Step Visual Guide */}
              <div className="mt-5 p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 max-w-sm mx-auto text-left space-y-2">
                <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>How to put stories in your Vault:</span>
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                  <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <span>Search any account and open the <strong>Stories</strong> tab.</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                  <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <span>Click <strong>&quot;📌 Vault&quot;</strong> on any story card or in the full-screen viewer.</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                  <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <span>Stories remain saved permanently on this device for offline replay.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {items.map((item) => {
                const isVideo = item.type === 'video';
                const mediaSrc = item.mediaUrl ? `/api/media?url=${encodeURIComponent(item.mediaUrl)}` : '';
                const thumbSrc = item.thumbnailUrl
                  ? `/api/media?url=${encodeURIComponent(item.thumbnailUrl)}`
                  : isVideo
                  ? `${mediaSrc}#t=0.001`
                  : mediaSrc;

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveStory(item)}
                    className="group relative bg-zinc-950 rounded-2xl overflow-hidden aspect-[9/16] shadow-md border border-slate-200 dark:border-zinc-800 hover:border-pink-500/50 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    {/* Media Preview Container */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center overflow-hidden">
                      {/* Fallback backdrop inside the card container */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-purple-950/30 via-zinc-950 to-zinc-900 select-none pointer-events-none">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[2px] mb-2 shadow-lg">
                          <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-white font-bold text-xs uppercase">
                            {item.username.slice(0, 2)}
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-300 truncate max-w-full">
                          @{item.username}
                        </span>
                        <span className="text-[9px] text-pink-400/90 font-medium mt-0.5">
                          {isVideo ? 'Saved Video Story' : 'Saved Image Story'}
                        </span>
                      </div>

                      {item.thumbnailUrl || !isVideo ? (
                        <img
                          src={thumbSrc}
                          alt={`Story by @${item.username}`}
                          className="relative z-1 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            if (item.mediaUrl && e.currentTarget.src !== item.mediaUrl) {
                              e.currentTarget.src = item.mediaUrl;
                            }
                          }}
                        />
                      ) : (
                        <video
                          src={`${mediaSrc}#t=0.001`}
                          poster={item.thumbnailUrl ? `/api/media?url=${encodeURIComponent(item.thumbnailUrl)}` : undefined}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          className="relative z-1 w-full h-full object-cover pointer-events-none"
                        />
                      )}

                      {/* Center Play Button for Video Stories */}
                      {isVideo && (
                        <div className="absolute inset-0 z-2 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
                          <div className="w-11 h-11 rounded-full bg-black/75 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white ml-0.5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Top Overlay Badge: Username & Media Tag */}
                    <div className="relative z-10 p-2 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-white truncate max-w-[75%] border border-white/10">
                        @{item.username}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-pink-400 border border-white/10 flex items-center gap-0.5">
                        {isVideo ? <Film className="w-2.5 h-2.5" /> : null}
                        <span>{item.type}</span>
                      </span>
                    </div>

                    {/* Bottom Controls: Saved Tag + Download + Delete */}
                    <div className="relative z-10 p-2 pt-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex items-center justify-between text-white">
                      <span className="text-[10px] text-zinc-300 flex items-center gap-1 font-medium">
                        <Clock className="w-2.5 h-2.5 text-amber-400" />
                        <span>Saved</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <a
                          href={`${mediaSrc}&download=true&filename=vault_${item.username}_${item.id}.${isVideo ? 'mp4' : 'jpg'}`}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-pink-600 text-white transition-colors border border-white/10"
                          title="Download to device"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => handleRemove(item.id, e)}
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors border border-white/10 cursor-pointer"
                          title="Delete from vault"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Full-Screen Preview Lightbox for Vault Item */}
        {activeStory && (
          <div
            className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in"
            onClick={() => setActiveStory(null)}
          >
            <button
              type="button"
              onClick={() => setActiveStory(null)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors z-70 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div
              className="relative max-w-sm sm:max-w-md w-full aspect-[9/16] max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {activeStory.type === 'video' ? (
                <video
                  src={`/api/media?url=${encodeURIComponent(activeStory.mediaUrl)}`}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={`/api/media?url=${encodeURIComponent(activeStory.mediaUrl)}`}
                  alt={`Vault story by @${activeStory.username}`}
                  className="w-full h-full object-contain"
                />
              )}

              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold border border-white/10">
                <span>@{activeStory.username}</span>
                <span className="text-[10px] text-pink-400">• Vault Replay</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
