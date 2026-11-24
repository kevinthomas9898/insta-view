'use client';

import React, { useEffect, useState } from 'react';
import { Profile } from '@/lib/instagram/types';
import {
  Bookmark,
  X,
  Trash2,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Lock,
  Info,
} from 'lucide-react';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: Profile[];
  onSelectProfile: (username: string) => void;
  onRemoveProfile: (profile: Profile) => void;
  onClearWatchlist?: () => void;
}

export function WatchlistModal({
  isOpen,
  onClose,
  watchlist,
  onSelectProfile,
  onRemoveProfile,
  onClearWatchlist,
}: WatchlistModalProps) {
  const [showInfo, setShowInfo] = useState(false);
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Centered Modal Card */}
      <div
        className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Responsive Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-500 text-white shadow-xs shrink-0">
              <Bookmark className="w-4 h-4 fill-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  Watchlist
                </h3>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                  {watchlist.length} {watchlist.length === 1 ? 'Profile' : 'Profiles'}
                </span>

                {/* Privacy Info Popover / Tooltip */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowInfo((prev) => !prev)}
                    onMouseEnter={() => setShowInfo(true)}
                    onMouseLeave={() => setShowInfo(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    aria-label="Privacy Info"
                    title="100% Private Local Bookmarks"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {showInfo && (
                    <div
                      className="absolute left-0 sm:left-auto top-full mt-2 z-40 w-64 sm:w-72 p-3 rounded-2xl bg-zinc-950/95 text-white shadow-2xl border border-zinc-800 backdrop-blur-md animate-fade-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[11px] text-zinc-100">
                            100% Private Local Bookmarks
                          </p>
                          <p className="text-zinc-400 text-[10px] mt-0.5 leading-normal">
                            Saved exclusively on this device. Never tracked, shared, or sent to any server.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {watchlist.length > 0 && onClearWatchlist && (
              <button
                type="button"
                onClick={onClearWatchlist}
                className="px-2.5 py-1 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
                title="Clear all saved bookmarks"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close Watchlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
          {watchlist.length === 0 ? (
            <div className="py-12 sm:py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Bookmark className="w-8 h-8 fill-amber-500/30" />
              </div>
              <p className="text-base font-semibold text-slate-800 dark:text-zinc-200">
                Your Watchlist is empty
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
                Bookmark public profiles for instant 1-click access anytime without typing. Stored 100% privately on this device.
              </p>

              {/* Step-by-step visual guide */}
              <div className="mt-5 p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 max-w-sm mx-auto text-left space-y-2">
                <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>How to add accounts to your Watchlist:</span>
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <span>Search any Instagram profile.</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <span>Click <strong>&quot;Watchlist&quot;</strong> in the profile header.</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <span>Access bookmarked profiles in 1 click anytime from the top bar.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {watchlist.map((item) => (
                <div
                  key={item.username}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60 hover:border-pink-500/40 transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectProfile(item.username);
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-700 flex-shrink-0 border border-slate-300 dark:border-zinc-600 ring-2 ring-pink-500/20">
                      {item.avatarUrl ? (
                        <img
                          src={`/api/media?url=${encodeURIComponent(item.avatarUrl)}`}
                          alt={item.username}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            if (item.avatarUrl && e.currentTarget.src !== item.avatarUrl) {
                              e.currentTarget.src = item.avatarUrl;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm text-slate-600 dark:text-zinc-300">
                          {item.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          @{item.username}
                        </p>
                        {item.isPrivate && (
                          <span title="Private Account">
                            <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      {item.fullName && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                          {item.fullName}
                        </p>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectProfile(item.username);
                      }}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500 text-pink-600 hover:text-white dark:text-pink-400 dark:hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="View Profile Anonymously"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveProfile(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
