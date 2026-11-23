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
} from 'lucide-react';

interface StoriesViewerProps {
  stories: StoryResult[];
  initialIndex?: number;
  onClose: () => void;
}

export function StoriesViewer({ stories, initialIndex = 0, onClose }: StoriesViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentStory = stories[currentIndex];

  // Auto-progress timer for images (only ticks when image has finished loading)
  useEffect(() => {
    if (!currentStory) return;

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
  }, [currentIndex, isPlaying, isMediaLoading, currentStory?.type]);

  // Synchronize play/pause and mute state directly with HTML5 video element
  useEffect(() => {
    if (currentStory?.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentStory?.type, currentIndex]);

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
            <span className="font-semibold tracking-wide">
              Story {currentIndex + 1} of {stories.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {currentStory.type === 'video' && (
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              <a
                href={
                  currentStory.downloadUrl ||
                  `/api/media?url=${encodeURIComponent(currentStory.url)}&download=true&filename=story_${currentStory.id}.${currentStory.type === 'video' ? 'mp4' : 'jpg'}`
                }
                download
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
                title="Download Story"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer hidden sm:inline-flex"
                title="Toggle Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title="Close"
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
              preload="auto"
              poster={`/api/media?url=${encodeURIComponent(currentStory.thumbnailUrl || currentStory.url)}`}
              onLoadedData={() => setIsMediaLoading(false)}
              onWaiting={() => setIsMediaLoading(true)}
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
