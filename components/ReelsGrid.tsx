'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ReelResult } from '@/lib/instagram/types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  X,
  Film,
  Music,
  Loader2,
  Maximize2,
  ChevronDown,
  Copy,
  Hash,
  Check,
} from 'lucide-react';

interface ReelsGridProps {
  reels: ReelResult[];
  username: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function ReelsGrid({
  reels,
  username,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: ReelsGridProps) {
  const [selectedReel, setSelectedReel] = useState<ReelResult | null>(null);
  const [isReelLoading, setIsReelLoading] = useState(true);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [copyState, setCopyState] = useState<'idle' | 'caption' | 'tags'>('idle');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTimeUpdateRef = useRef<number>(0);

  const copyCaption = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyState('caption');
    setTimeout(() => setCopyState('idle'), 2000);
  };

  const copyHashtags = (text: string) => {
    const matches = text.match(/#[a-zA-Z0-9_\u00c0-\u024e]+/g);
    if (!matches || matches.length === 0) return;
    navigator.clipboard.writeText(matches.join(' '));
    setCopyState('tags');
    setTimeout(() => setCopyState('idle'), 2000);
  };

  // Seamless Autoplay with fallback to muted autoplay if browser policy restricts unmuted audio
  useEffect(() => {
    if (selectedReel && videoRef.current) {
      const hasMp4 = Boolean(selectedReel.url && selectedReel.url.includes('.mp4'));
      if (!hasMp4) {
        setIsReelLoading(false);
        setIsVideoPlaying(false);
        return;
      }

      setIsReelLoading(true);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
            setIsReelLoading(false);
          })
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsVideoMuted(true);
              videoRef.current
                .play()
                .then(() => {
                  setIsVideoPlaying(true);
                  setIsReelLoading(false);
                })
                .catch(() => {
                  setIsVideoPlaying(false);
                  setIsReelLoading(false);
                });
            }
          });
      }
    }
  }, [selectedReel]);

  const toggleVideoPlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const toggleVideoMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !isVideoMuted;
      videoRef.current.muted = nextMuted;
      setIsVideoMuted(nextMuted);
    }
  };

  const handleVideoSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = ratio * videoRef.current.duration;
    setVideoProgress(ratio * 100);
    setCurrentTime(videoRef.current.currentTime);
  };

  const cyclePlaybackSpeed = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (reels.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-500 dark:text-zinc-400 backdrop-blur-sm shadow-xs">
        <Film className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
        <p className="text-base font-semibold text-slate-900 dark:text-zinc-200">No reels found</p>
        <p className="text-sm mt-1 text-slate-500 dark:text-zinc-500">This account has not published any public reels.</p>
      </div>
    );
  }

  const formatViews = (count?: number) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {reels.map((reel, idx) => {
          const thumbSrc = reel.thumbnailUrl || reel.url;
          const displayThumb = `/api/media?url=${encodeURIComponent(thumbSrc)}`;
          const showAdAfter = (idx + 1) % 5 === 0 && idx !== reels.length - 1;

          return (
            <React.Fragment key={reel.id || idx}>
              <div
                onClick={() => {
                  const hasMp4 = Boolean(reel.url && reel.url.includes('.mp4'));
                  setSelectedReel(reel);
                  setIsReelLoading(hasMp4);
                  setIsCaptionExpanded(false);
                  setIsVideoPlaying(hasMp4);
                  setIsVideoMuted(false);
                  setVideoProgress(0);
                  setCurrentTime(0);
                  setDuration(0);
                }}
                className="group relative bg-zinc-950 rounded-2xl overflow-hidden cursor-pointer aspect-[9/16] shadow-md hover:shadow-2xl transition-all border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
              >
                <img
                  src={displayThumb}
                  alt={reel.caption || 'Reel thumbnail'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    if (e.currentTarget.src !== thumbSrc) {
                      e.currentTarget.src = thumbSrc;
                    }
                  }}
                />

                {/* Bottom Overlay with Views & Play Icon */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold drop-shadow">
                    <Play className="w-3.5 h-3.5 fill-current text-white" />
                    {formatViews(reel.viewCount || reel.playCount) || 'Play'}
                  </span>
                  {reel.duration && (
                    <span className="opacity-90 text-[11px] font-medium bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                      {reel.duration}s
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Load More Reels Button */}
      {hasMore && onLoadMore ? (
        <div className="mt-8 mb-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-sm dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-700 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                <span>Loading more reels...</span>
              </>
            ) : (
              <>
                <span>Load More Reels</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : reels.length > 0 ? (
        <div className="mt-8 mb-6 text-center text-xs text-slate-500 dark:text-zinc-500 font-medium">
          Showing all {reels.length} loaded reels
        </div>
      ) : null}

      {/* Reel Modal Player */}
      {selectedReel && (() => {
        const isPlayableVideo = Boolean(selectedReel.url && selectedReel.url.includes('.mp4'));
        return (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none">
            <div className="relative w-full max-w-sm sm:max-w-md h-[88vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl">
              {/* Top Close, Speed, Mute & Download Bar */}
              <div className="absolute top-0 inset-x-0 z-40 p-3.5 bg-gradient-to-b from-black/85 via-black/50 to-transparent flex items-center justify-between text-white">
                <span className="text-xs font-bold tracking-tight drop-shadow">@{username} Reel</span>
                <div className="flex items-center gap-1.5">
                  {/* Speed Toggle (only if video) */}
                  {isPlayableVideo && (
                    <button
                      type="button"
                      onClick={cyclePlaybackSpeed}
                      className="px-2 py-1 bg-black/60 hover:bg-black/90 active:scale-90 text-[11px] font-bold rounded-lg border border-white/20 transition-all cursor-pointer shadow-xs"
                      title="Playback Speed"
                    >
                      {playbackSpeed}x
                    </button>
                  )}

                  {/* Sound Toggle (only if video) */}
                  {isPlayableVideo && (
                    <button
                      type="button"
                      onClick={toggleVideoMute}
                      className="p-2 hover:bg-white/20 active:scale-90 rounded-full text-white transition-all cursor-pointer"
                      title={isVideoMuted ? 'Unmute' : 'Mute'}
                    >
                      {isVideoMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white" />}
                    </button>
                  )}

                  {/* Download */}
                  <a
                    href={
                      selectedReel.downloadUrl ||
                      `/api/media?url=${encodeURIComponent(selectedReel.url)}&download=true&filename=reel_${username}_${selectedReel.id}.${isPlayableVideo ? 'mp4' : 'jpg'}`
                    }
                    download
                    className="p-2 hover:bg-white/20 active:scale-90 rounded-full text-white transition-all cursor-pointer"
                    title={isPlayableVideo ? 'Download Reel' : 'Download Cover'}
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={() => setSelectedReel(null)}
                    className="p-2 hover:bg-white/20 active:scale-90 rounded-full text-white transition-all cursor-pointer"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Video Player or Cover Preview */}
              <div
                className="relative flex-1 flex items-center justify-center bg-black overflow-hidden cursor-pointer"
                onClick={isPlayableVideo ? toggleVideoPlay : undefined}
              >
                {/* Notice if only cover frame is available */}
                {!isPlayableVideo && (
                  <div className="absolute top-14 inset-x-4 bg-zinc-950/85 backdrop-blur-md border border-amber-500/40 rounded-xl p-2.5 text-center z-25 shadow-xl">
                    <p className="text-xs text-amber-200 font-semibold">Video Stream Direct from Instagram</p>
                    <p className="text-[11px] text-zinc-300 mt-0.5">High-res cover frame loaded. Tap "Direct Source URL" to view the video stream on Instagram.</p>
                  </div>
                )}

                {/* Loading Spinner Overlay */}
                {isReelLoading && isPlayableVideo && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-15 transition-opacity duration-150 animate-fade-in pointer-events-none">
                    <div className="p-3 rounded-full bg-zinc-900/90 border border-white/10 shadow-2xl">
                      <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
                    </div>
                    <span className="text-[11px] font-medium text-white/90 mt-2.5 tracking-wide">
                      Loading reel...
                    </span>
                  </div>
                )}

                {isPlayableVideo ? (
                  <video
                    key={selectedReel.id || selectedReel.url}
                    ref={videoRef}
                    autoPlay
                    playsInline
                    loop
                    muted={isVideoMuted}
                    preload="metadata"
                    poster={`/api/media?url=${encodeURIComponent(selectedReel.thumbnailUrl || selectedReel.url)}`}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration);
                      }
                    }}
                    onWaiting={() => setIsReelLoading(true)}
                    onStalled={() => setIsReelLoading(true)}
                    onPlaying={() => {
                      setIsReelLoading(false);
                      setIsVideoPlaying(true);
                    }}
                    onPause={() => setIsVideoPlaying(false)}
                    onTimeUpdate={() => {
                      if (videoRef.current && videoRef.current.duration) {
                        const now = Date.now();
                        if (now - lastTimeUpdateRef.current > 200) {
                          lastTimeUpdateRef.current = now;
                          setCurrentTime(videoRef.current.currentTime);
                          setDuration(videoRef.current.duration);
                          setVideoProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
                        }
                      }
                    }}
                    className={`w-full h-full object-contain transition-opacity duration-200 ${
                      isReelLoading ? 'opacity-80' : 'opacity-100'
                    }`}
                    src={`/api/media?url=${encodeURIComponent(selectedReel.url)}`}
                    onError={(e) => {
                      setIsReelLoading(false);
                      if (e.currentTarget.src !== selectedReel.url) {
                        e.currentTarget.src = selectedReel.url;
                      }
                    }}
                  />
                ) : (
                  <img
                    src={`/api/media?url=${encodeURIComponent(selectedReel.thumbnailUrl || selectedReel.url)}`}
                    alt={selectedReel.caption || 'Reel cover'}
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Center Play Icon When Paused */}
                {isPlayableVideo && !isVideoPlaying && !isReelLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 z-25 pointer-events-none">
                    <div className="p-4 rounded-full bg-black/80 backdrop-blur-sm text-white border border-white/20 shadow-2xl transition-transform">
                      <Play className="w-8 h-8 fill-current translate-x-0.5 text-white" />
                    </div>
                  </div>
                )}

                {/* Instagram-Style Transparent Overlay for Reel */}
                <div
                  className="absolute bottom-0 inset-x-0 p-3.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white z-30 flex flex-col gap-2 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {selectedReel.audioTitle && (
                    <p className="flex items-center gap-1.5 text-white/80 text-xs font-medium drop-shadow">
                      <Music className="w-3.5 h-3.5 text-pink-400" />
                      <span className="truncate">{selectedReel.audioTitle}</span>
                    </p>
                  )}

                  {selectedReel.caption && !selectedReel.caption.startsWith('http') && (
                    <div className="text-xs text-white/95 leading-relaxed drop-shadow-sm max-h-[25vh] overflow-y-auto">
                      <p className={isCaptionExpanded ? 'whitespace-pre-line' : 'line-clamp-2'}>
                        {selectedReel.caption}
                      </p>
                      {selectedReel.caption.length > 70 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCaptionExpanded(!isCaptionExpanded);
                          }}
                          className="text-[11px] font-bold text-pink-400 hover:text-pink-300 mt-0.5 cursor-pointer underline underline-offset-2"
                        >
                          {isCaptionExpanded ? 'Show less' : '... more'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Caption & Hashtag Quick Copiers */}
                  {selectedReel.caption && !selectedReel.caption.startsWith('http') && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => copyCaption(selectedReel.caption || '')}
                        className="text-[10px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copyState === 'caption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copyState === 'caption' ? 'Copied Caption!' : 'Copy Caption'}</span>
                      </button>
                      {selectedReel.caption.includes('#') && (
                        <button
                          type="button"
                          onClick={() => copyHashtags(selectedReel.caption || '')}
                          className="text-[10px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-pink-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copyState === 'tags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Hash className="w-3 h-3" />}
                          <span>{copyState === 'tags' ? 'Copied Tags!' : 'Copy Tags'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Timeline Progress Bar & Time (only if playable video) */}
                  {isPlayableVideo && (
                    <div className="flex flex-col gap-1 pt-1">
                      <div
                        className="w-full h-1.5 bg-white/25 hover:h-2.5 rounded-full overflow-hidden transition-all cursor-pointer relative"
                        onClick={handleVideoSeek}
                        title="Seek"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-white/70 font-medium px-0.5">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  )}

                  {/* Quick Action Control Bar */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {isPlayableVideo && (
                      <button
                        type="button"
                        onClick={toggleVideoPlay}
                        className="p-2 rounded-xl bg-black/60 hover:bg-black/80 active:scale-90 text-white border border-white/20 transition-all cursor-pointer shadow-md"
                        title={isVideoPlaying ? 'Pause reel' : 'Play reel'}
                        aria-label={isVideoPlaying ? 'Pause' : 'Play'}
                      >
                        {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current text-white" />}
                      </button>
                    )}

                    {isPlayableVideo && (
                      <button
                        type="button"
                        onClick={toggleVideoMute}
                        className="p-2 rounded-xl bg-black/60 hover:bg-black/80 active:scale-90 text-white border border-white/20 transition-all cursor-pointer shadow-md"
                        title={isVideoMuted ? 'Unmute audio' : 'Mute audio'}
                        aria-label={isVideoMuted ? 'Unmute' : 'Mute'}
                      >
                        {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
                      </button>
                    )}

                    <a
                      href={
                        selectedReel.downloadUrl ||
                        `/api/media?url=${encodeURIComponent(selectedReel.url)}&download=true&filename=reel_${username}_${selectedReel.id}.${isPlayableVideo ? 'mp4' : 'jpg'}`
                      }
                      download
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isPlayableVideo ? 'Download Reel' : 'Download Cover'}
                    </a>

                    {isPlayableVideo && (
                      <a
                        href={`/api/media?url=${encodeURIComponent(selectedReel.url)}&download=true&audioOnly=true&filename=audio_${username}_${selectedReel.id}.m4a`}
                        download
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 shadow-md cursor-pointer transition-colors"
                        title="Extract and download reel audio track (M4A)"
                      >
                        <Music className="w-3.5 h-3.5 text-pink-400" />
                        <span>Audio (M4A)</span>
                      </a>
                    )}

                    <a
                      href={selectedReel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl border border-white/20 transition-colors cursor-pointer"
                      title="Direct Source URL"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
