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
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentStory = stories[currentIndex];

  // Auto-progress timer for images
  useEffect(() => {
    if (!currentStory) return;

    if (currentStory.type === 'image') {
      if (!isPlaying) return;
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
  }, [currentIndex, isPlaying, currentStory?.type]);

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
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (currentIndex > 0) {
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

  const mediaSrc = `/api/media?url=${encodeURIComponent(currentStory.url)}`;
  const downloadUrl =
    currentStory.downloadUrl ||
    `/api/media?url=${encodeURIComponent(currentStory.url)}&download=true&filename=story_${currentStory.id}.${currentStory.type === 'video' ? 'mp4' : 'jpg'}`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center select-none"
    >
      {/* Story Stage */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[90vh] bg-black rounded-lg overflow-hidden flex flex-col justify-between shadow-2xl">
        {/* Top Progress Bars */}
        <div className="absolute top-0 inset-x-0 z-20 p-3 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex gap-1 mb-2">
            {stories.map((story, idx) => (
              <div key={story.id || idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
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

          {/* Top Controls Bar */}
          <div className="flex items-center justify-between text-white text-xs">
            <span className="font-medium opacity-90">
              Story {currentIndex + 1} of {stories.length}
              {currentStory.timestamp && (
                <span className="ml-2 opacity-60">
                  {new Date(currentStory.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="p-1.5 hover:bg-white/20 rounded"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {currentStory.type === 'video' && (
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="p-1.5 hover:bg-white/20 rounded"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              <a
                href={downloadUrl}
                download
                className="p-1.5 hover:bg-white/20 rounded flex items-center gap-1 text-white"
                title="Download this story"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 hover:bg-white/20 rounded"
                title="Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Media Render (Image or Video) */}
        <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
          {currentStory.type === 'video' ? (
            <video
              ref={videoRef}
              src={mediaSrc}
              autoPlay
              playsInline
              muted={isMuted}
              preload="metadata"
              className="w-full h-full object-contain"
              onTimeUpdate={(e) => {
                const vid = e.currentTarget;
                if (vid.duration) {
                  setProgress((vid.currentTime / vid.duration) * 100);
                }
              }}
              onEnded={handleNext}
              onError={(e) => {
                // Fallback direct URL if proxy fails
                if (e.currentTarget.src !== currentStory.url) {
                  e.currentTarget.src = currentStory.url;
                }
              }}
            />
          ) : (
            <img
              src={mediaSrc}
              alt="Instagram Story"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
              onError={(e) => {
                if (e.currentTarget.src !== currentStory.url) {
                  e.currentTarget.src = currentStory.url;
                }
              }}
            />
          )}

          {/* Navigation Click Zones */}
          <div
            className="absolute left-0 inset-y-0 w-1/3 cursor-pointer z-10"
            onClick={handlePrev}
            title="Previous Story"
          />
          <div
            className="absolute right-0 inset-y-0 w-1/3 cursor-pointer z-10"
            onClick={handleNext}
            title="Next Story"
          />
        </div>

        {/* Previous/Next Nav Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute -left-12 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white"
            title="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <button
          onClick={handleNext}
          className="absolute -right-12 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white"
          title="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
