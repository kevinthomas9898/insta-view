'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StoryResult } from '@/lib/instagram/types';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  Download,
  Maximize,
  Volume2,
  VolumeX,
  Loader2,
  BookmarkPlus,
  BookmarkCheck,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { saveStoryToVault, isStoryInVault, VaultStoryItem } from '@/lib/storage/story-vault';

const STORY_AD_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      background: #09090b;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    html::-webkit-scrollbar, body::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
    #container-4ff02455261b1454e019ced3534847d2 {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div id="container-4ff02455261b1454e019ced3534847d2"></div>
  <script async="async" data-cfasync="false" src="https://bicea.org/21/4ff02455261b1454e019ced3534847d2"></script>
</body>
</html>
`;

interface StoriesViewerProps {
  stories: StoryResult[];
  initialIndex?: number;
  username?: string;
  onClose: () => void;
}

export function StoriesViewer({ stories, initialIndex = 0, username = 'user', onClose }: StoriesViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVaulted, setIsVaulted] = useState(false);
  const [showingAd, setShowingAd] = useState(false);
  const [adElapsed, setAdElapsed] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentStory = stories[currentIndex];

  // Ad Timer: compulsory countdown for 3s, then show Skip Ad, auto-skip at 6s
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showingAd) {
      if (adElapsed < 6) {
        timer = setTimeout(() => {
          setAdElapsed((s) => s + 1);
        }, 1000);
      } else {
        // Automatically skip at 6 seconds total
        handleSkipAd();
      }
    }
    return () => clearTimeout(timer);
  }, [showingAd, adElapsed]);

  const handleSkipAd = () => {
    if (adElapsed < 3) return;
    setShowingAd(false);
    setAdElapsed(0);
    setViewsCount(0);
    setIsMediaLoading(true);
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  };

  // Check if active story is already in the offline vault
  useEffect(() => {
    async function checkVault() {
      if (!currentStory) return;
      const vaultId = `story_${username}_${currentStory.id}`;
      const saved = await isStoryInVault(vaultId);
      setIsVaulted(saved);
    }
    checkVault();
  }, [currentStory, username]);

  const handleSaveToVault = async () => {
    if (!currentStory || isVaulted) return;
    const isVideo = currentStory.type === 'video';
    const vaultItem: VaultStoryItem = {
      id: `story_${username}_${currentStory.id}`,
      username,
      mediaUrl: currentStory.url,
      thumbnailUrl: currentStory.thumbnailUrl,
      type: isVideo ? 'video' : 'image',
      takenAt: currentStory.takenAt || Date.now(),
      savedAt: Date.now(),
      expiresAt: Date.now() + 24 * 3600 * 1000,
    };
    await saveStoryToVault(vaultItem);
    setIsVaulted(true);
  };

  // Auto-progress timer for images (only ticks when image has finished loading and ad is not showing)
  useEffect(() => {
    if (!currentStory || showingAd) return;

    if (currentStory.type === 'image') {
      if (!isPlaying || isMediaLoading) return;
      const duration = 5000; // 5 seconds per image
      const interval = 50;
      const step = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + step;
        });
      }, interval);

      return () => clearInterval(timer);
    } else {
      // Handled by video onTimeUpdate
      setProgress(0);
    }
  }, [currentIndex, isPlaying, isMediaLoading, currentStory?.type, showingAd]);

  // Synchronize play/pause and mute state directly with HTML5 video element
  useEffect(() => {
    if (currentStory?.type === 'video' && videoRef.current) {
      if (isPlaying && !showingAd) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentStory?.type, currentIndex, showingAd]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, currentIndex]);

  // Preload adjacent stories in background for instant playback
  useEffect(() => {
    if (typeof window !== 'undefined' && stories.length > 0) {
      const nextStory = stories[currentIndex + 1];
      const prevStory = stories[currentIndex - 1];
      if (nextStory && nextStory.type === 'image' && nextStory.url) {
        const img = new window.Image();
        img.src = `/api/media?url=${encodeURIComponent(nextStory.url)}`;
      }
      if (prevStory && prevStory.type === 'image' && prevStory.url) {
        const img = new window.Image();
        img.src = `/api/media?url=${encodeURIComponent(prevStory.url)}`;
      }
    }
  }, [currentIndex, stories]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, stories.length]);

  const handleNext = () => {
    setProgress(0);
    if (currentIndex < stories.length - 1) {
      // Show sponsored ad every 3 stories viewed (like Instagram Stories)
      if (viewsCount >= 3 && !showingAd) {
        setShowingAd(true);
        setAdElapsed(0);
        setViewsCount(0);
        return;
      }

      setViewsCount((c) => c + 1);
      setIsMediaLoading(true);
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (currentIndex > 0) {
      setIsMediaLoading(true);
      setCurrentIndex((i) => i - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Native Instagram-Style Sponsored Interstitial Story Ad
  if (showingAd) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none animate-fade-in"
      >
        <div className="absolute inset-0" onClick={onClose} />

        <div
          className="relative w-full max-w-sm sm:max-w-md h-full sm:h-[88vh] bg-zinc-950 sm:rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl z-10 border border-zinc-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar with Sponsored Tag & Compulsory Skip Timer */}
          <div className="absolute top-0 inset-x-0 z-30 p-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex flex-col gap-2">
            {/* Story Progress Bar filling across 6s */}
            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-amber-500 transition-all duration-1000 ease-linear"
                style={{ width: `${Math.min(100, (adElapsed / 6) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-white text-xs mt-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white drop-shadow">Sponsored</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-400 font-bold border border-pink-500/30">
                  Ad
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Skip button with mandatory 3s countdown, then visible & clickable until 6s auto-skip */}
                <button
                  type="button"
                  onClick={handleSkipAd}
                  disabled={adElapsed < 3}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    adElapsed < 3
                      ? 'bg-black/60 text-zinc-400 border border-white/10 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg animate-pulse hover:opacity-90 active:scale-95'
                  }`}
                >
                  {adElapsed < 3 ? (
                    <span>⏳ Skip in {3 - adElapsed}s</span>
                  ) : (
                    <span>Skip Ad ⏭️</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/20 active:scale-90 rounded-full text-white transition-all cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Ad Content Display Frame (Full Height for Complete Ad Visibility) */}
          <div className="relative flex-1 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black flex flex-col items-center justify-center p-3 pt-14 pb-20 overflow-hidden w-full h-full">
            <div className="w-full h-full max-w-sm mx-auto flex items-center justify-center">
              <iframe
                srcDoc={STORY_AD_HTML}
                title="Sponsored Advertisement"
                className="w-full h-full min-h-[350px] max-h-[500px] border-0 rounded-2xl bg-zinc-950 shadow-2xl overflow-hidden"
                scrolling="no"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          </div>

          {/* Bottom Call-To-Action (Instagram-style Swipe Up) */}
          <div className="absolute bottom-4 inset-x-0 z-30 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={handleSkipAd}
              className="w-full py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Learn More ↗</span>
            </button>
            <span className="text-[10px] text-zinc-400">
              {adElapsed < 3
                ? `Skip available in ${3 - adElapsed}s`
                : `Tap Skip Ad or auto-skipping in ${6 - adElapsed}s`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentStory) return null;

  const displayUrl = `/api/media?url=${encodeURIComponent(currentStory.url)}`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none"
    >
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Story Container - 9:16 Aspect Ratio */}
      <div
        className="relative w-full max-w-sm sm:max-w-md h-full sm:h-[88vh] bg-zinc-950 sm:rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl z-10 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Progress Bars & Controls */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex flex-col gap-2">
          {/* Progress Bars for all stories */}
          <div className="flex gap-1 w-full">
            {stories.map((st, idx) => (
              <div
                key={st.id || idx}
                className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between text-white text-xs mt-1">
            <span className="font-semibold tracking-wide drop-shadow">
              Story {currentIndex + 1} of {stories.length}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="p-1.5 hover:bg-white/20 active:scale-90 rounded-full transition-all cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {currentStory.type === 'video' && (
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className="p-1.5 hover:bg-white/20 active:scale-90 rounded-full transition-all cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsControlsVisible((v) => !v)}
                className={`p-1.5 hover:bg-white/20 active:scale-90 rounded-full transition-all cursor-pointer ${
                  !isControlsVisible ? 'text-pink-400 bg-pink-500/20' : 'text-white'
                }`}
                title={isControlsVisible ? 'Clean View (hide controls)' : 'Show controls'}
                aria-label={isControlsVisible ? 'Clean View' : 'Show controls'}
              >
                {isControlsVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 hover:bg-white/20 active:scale-90 rounded-full transition-all cursor-pointer hidden sm:inline-flex"
                title="Toggle Fullscreen"
                aria-label="Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 active:scale-90 rounded-full transition-all cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Media Content Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* Instant Loading Spinner Overlay */}
          {isMediaLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-15 transition-opacity duration-150 animate-fade-in pointer-events-none">
              <div className="p-3 rounded-full bg-zinc-900/90 border border-white/10 shadow-2xl">
                <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
              </div>
              <span className="text-[11px] font-medium text-white/90 mt-2.5 tracking-wide">
                Loading story {currentIndex + 1} of {stories.length}...
              </span>
            </div>
          )}

          {currentStory.type === 'video' ? (
            <video
              ref={videoRef}
              key={currentStory.id || currentIndex}
              src={displayUrl}
              autoPlay={isPlaying}
              muted={isMuted}
              playsInline
              preload="metadata"
              poster={`/api/media?url=${encodeURIComponent(currentStory.thumbnailUrl || currentStory.url)}`}
              onWaiting={() => setIsMediaLoading(true)}
              onStalled={() => setIsMediaLoading(true)}
              onPlaying={() => setIsMediaLoading(false)}
              className={`w-full h-full object-contain transition-opacity duration-200 ${
                isMediaLoading ? 'opacity-70' : 'opacity-100'
              }`}
              onTimeUpdate={() => {
                if (videoRef.current && videoRef.current.duration) {
                  const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                  setProgress(p);
                }
              }}
              onEnded={handleNext}
              onError={(e) => {
                setIsMediaLoading(false);
                if (e.currentTarget.src !== currentStory.url) {
                  e.currentTarget.src = currentStory.url;
                }
              }}
            />
          ) : (
            <img
              key={currentStory.id || currentIndex}
              src={displayUrl}
              alt="Story"
              referrerPolicy="no-referrer"
              onLoad={() => setIsMediaLoading(false)}
              onError={(e) => {
                setIsMediaLoading(false);
                if (e.currentTarget.src !== currentStory.url) {
                  e.currentTarget.src = currentStory.url;
                }
              }}
              className={`w-full h-full object-contain transition-opacity duration-200 ${
                isMediaLoading ? 'opacity-30' : 'opacity-100'
              }`}
            />
          )}

          {/* Left/Middle/Right Tap Area for Touch and Click Navigation */}
          <div
            className="absolute left-0 inset-y-0 w-1/3 cursor-pointer z-20"
            onClick={handlePrev}
          />
          <div
            className="absolute left-1/3 inset-y-0 w-1/3 cursor-pointer z-20 flex items-center justify-center"
            onClick={() => setIsPlaying((p) => !p)}
          >
            {!isPlaying && !isMediaLoading && (
              <div className="p-4 rounded-full bg-black/80 backdrop-blur-sm text-white border border-white/20 shadow-2xl pointer-events-none transition-transform">
                <Play className="w-8 h-8 fill-current translate-x-0.5 text-white" />
              </div>
            )}
          </div>
          <div
            className="absolute right-0 inset-y-0 w-1/3 cursor-pointer z-20"
            onClick={handleNext}
          />
        </div>

        {/* Bottom Floating Action Bar: Save to Vault + Download Story */}
        {isControlsVisible ? (
          <div className="absolute bottom-4 inset-x-0 z-30 flex items-center justify-center gap-2 pointer-events-auto px-4 transition-opacity duration-200">
            <button
              type="button"
              onClick={handleSaveToVault}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-xl transition-all cursor-pointer border ${
                isVaulted
                  ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                  : 'bg-black/75 hover:bg-black/95 text-white border-white/20'
              }`}
              title="Save to offline vault (100% private to this browser)"
            >
              {isVaulted ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Saved in Vault</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-pink-400" />
                  <span>Save to Vault</span>
                </>
              )}
            </button>

            <a
              href={
                currentStory.downloadUrl ||
                `/api/media?url=${encodeURIComponent(currentStory.url)}&download=true&filename=story_${username}_${currentStory.id}.${currentStory.type === 'video' ? 'mp4' : 'jpg'}`
              }
              download
              className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-black/75 hover:bg-black/95 active:scale-95 text-white text-xs font-semibold border border-white/20 backdrop-blur-md shadow-xl transition-all cursor-pointer"
              title="Download Story"
            >
              <Download className="w-3.5 h-3.5 text-pink-400" />
              <span>Download</span>
            </a>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsControlsVisible(true);
            }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 shadow-xl transition-all cursor-pointer active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-pink-400" />
            <span>Show Details</span>
          </button>
        )}

        {/* Desktop Side Chevron Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="hidden sm:flex absolute -left-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 active:scale-90 active:bg-pink-600 text-white border border-zinc-700 transition-all duration-150 z-20 cursor-pointer shadow-xl"
            title="Previous Story"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="hidden sm:flex absolute -right-14 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 active:scale-90 active:bg-pink-600 text-white border border-zinc-700 transition-all duration-150 z-20 cursor-pointer shadow-xl"
            title="Next Story"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
