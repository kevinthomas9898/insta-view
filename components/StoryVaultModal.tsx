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
  AlertCircle,
} from 'lucide-react';

interface StoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoryVaultModal({ isOpen, onClose }: StoryVaultModalProps) {
  const [items, setItems] = useState<VaultStoryItem[]>([]);
  const [activeStory, setActiveStory] = useState<VaultStoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xs">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Offline Story Vault
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                  {items.length} Saved
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                100% Private client storage — re-watch anytime, even after 24h expiration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Clear entire vault"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close Vault"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">Loading your private vault...</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-600">
                <HardDrive className="w-8 h-8 stroke-1" />
              </div>
              <p className="text-base font-semibold text-slate-800 dark:text-zinc-200">
                Your Story Vault is empty
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                Click the <strong>&quot;📌 Save to Vault&quot;</strong> button on any active story to keep it stored permanently on this device for offline re-watching.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {items.map((item) => {
                const isVideo = item.type === 'video';
                const mediaSrc = item.mediaUrl ? `/api/media?url=${encodeURIComponent(item.mediaUrl)}` : '';
                const thumbSrc = item.thumbnailUrl
                  ? `/api/media?url=${encodeURIComponent(item.thumbnailUrl)}`
                  : mediaSrc;

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveStory(item)}
                    className="group relative bg-zinc-950 rounded-2xl overflow-hidden aspect-[9/16] shadow-md border border-slate-200 dark:border-zinc-800 hover:border-pink-500/50 cursor-pointer transition-all"
                  >
                    {item.thumbnailUrl || !isVideo ? (
                      <img
                        src={thumbSrc}
                        alt={`Story by ${item.username}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={mediaSrc}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    )}

                    {/* Top overlay badge: username */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                      <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-white truncate max-w-[80%] border border-white/10">
                        @{item.username}
                      </span>
                      {isVideo && (
                        <span className="p-1 rounded-full bg-black/60 text-white">
                          <Film className="w-3 h-3 text-pink-400" />
                        </span>
                      )}
                    </div>

                    {/* Bottom overlay: action buttons */}
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white">
                      <span className="text-[10px] text-white/80 flex items-center gap-1 font-medium">
                        <Clock className="w-2.5 h-2.5 text-amber-400" />
                        Saved
                      </span>

                      <div className="flex items-center gap-1">
                        <a
                          href={`${mediaSrc}&download=true&filename=vault_${item.username}_${item.id}.${isVideo ? 'mp4' : 'jpg'}`}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors"
                          title="Download media"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                        <button
                          onClick={(e) => handleRemove(item.id, e)}
                          className="p-1 rounded-lg bg-white/20 hover:bg-rose-600/80 text-white transition-colors cursor-pointer"
                          title="Remove from vault"
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
          <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
            <button
              onClick={() => setActiveStory(null)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors z-70 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative max-w-sm sm:max-w-md w-full aspect-[9/16] max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
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
                  alt={`Vault story by ${activeStory.username}`}
                  className="w-full h-full object-contain"
                />
              )}

              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold border border-white/10">
                <span>@{activeStory.username}</span>
                <span className="text-[10px] text-pink-400">• Vault Playback</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
