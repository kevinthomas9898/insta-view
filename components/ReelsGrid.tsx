'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ReelResult } from '@/lib/instagram/types';
import { AdBanner } from '@/components/AdBanner';
import { RewardedAdModal } from '@/components/RewardedAdModal';
import { ReelTranscriptModal } from '@/components/ReelTranscriptModal';
import { TranscriptResult } from '@/lib/transcribe/whisper';
import { parseTranscriptParagraphs, FormattedParagraph } from '@/lib/transcribe/formatter';
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
  Eye,
  EyeOff,
  FileText,
  Sparkles,
  Clock,
  Globe,
  AlignLeft,
  ListOrdered,
  Columns,
} from 'lucide-react';

interface ReelsGridProps {
  reels: ReelResult[];
  username: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  autoOpenFirst?: boolean;
  autoStartTranscribe?: boolean;
}

export function ReelsGrid({
  reels,
  username,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  autoOpenFirst = false,
  autoStartTranscribe = false,
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
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isTranscriptPaneOpen, setIsTranscriptPaneOpen] = useState(false);
  const [transcriptTab, setTranscriptTab] = useState<'paragraphs' | 'timestamps'>('paragraphs');
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [activeTranscript, setActiveTranscript] = useState<(TranscriptResult & { srt?: string }) | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [showOnVideoCaptions, setShowOnVideoCaptions] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const lastTimeUpdateRef = useRef<number>(0);

  // Parse transcript into interactive paragraphs with timecode anchors & child segments
  const formattedParagraphs: FormattedParagraph[] = React.useMemo(() => {
    if (!activeTranscript) return [];
    return parseTranscriptParagraphs(activeTranscript.segments, activeTranscript.text);
  }, [activeTranscript]);

  // Synchronized active segment and paragraph calculation
  const activeSegmentIndex = React.useMemo(() => {
    if (!activeTranscript?.segments || activeTranscript.segments.length === 0) return -1;
    const segs = activeTranscript.segments;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      const nextS = segs[i + 1];
      const sEnd = nextS ? nextS.start : (s.end > s.start ? s.end : s.start + 4);
      if (currentTime >= s.start && currentTime < sEnd) {
        return i;
      }
    }
    if (segs.length > 0 && currentTime < segs[0].start) return 0;
    return -1;
  }, [activeTranscript, currentTime]);

  const activeSegment =
    activeSegmentIndex >= 0 && activeTranscript?.segments
      ? activeTranscript.segments[activeSegmentIndex]
      : null;

  const activeParagraphIndex = React.useMemo(() => {
    if (!formattedParagraphs || formattedParagraphs.length === 0) return -1;
    for (let i = 0; i < formattedParagraphs.length; i++) {
      const p = formattedParagraphs[i];
      const nextP = formattedParagraphs[i + 1];
      const pEnd = nextP ? nextP.start : (p.end > p.start ? p.end : p.start + 10);
      if (currentTime >= p.start && currentTime < pEnd) {
        return i;
      }
    }
    if (formattedParagraphs.length > 0 && currentTime < formattedParagraphs[0].start) return 0;
    return -1;
  }, [formattedParagraphs, currentTime]);

  // Auto-scroll transcript seamlessly as the video plays
  useEffect(() => {
    if (!isAutoScrollEnabled || !isTranscriptPaneOpen || !transcriptScrollRef.current) return;

    const container = transcriptScrollRef.current;
    // Find active highlighted segment first, or active paragraph container
    const activeTarget = (container.querySelector('[data-active-highlight="true"]') ||
      container.querySelector('[data-active-para="true"]')) as HTMLElement | null;

    if (activeTarget) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = activeTarget.getBoundingClientRect();
      const currentScrollTop = container.scrollTop;

      // Calculate target scroll position to center the active text in the viewport
      const relativeOffset = targetRect.top - containerRect.top;
      const targetScroll = currentScrollTop + relativeOffset - (containerRect.height / 2) + (targetRect.height / 2);

      if (Math.abs(container.scrollTop - targetScroll) > 20) {
        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      }
    }
  }, [activeParagraphIndex, activeSegmentIndex, isAutoScrollEnabled, isTranscriptPaneOpen, transcriptTab]);

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, seconds);
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const handleCopyTranscript = () => {
    if (!activeTranscript?.text) return;
    navigator.clipboard.writeText(activeTranscript.text);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!activeTranscript?.text) return;
    const blob = new Blob([activeTranscript.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${username}_${selectedReel?.id || 'reel'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSrt = () => {
    if (!activeTranscript?.srt) return;
    const blob = new Blob([activeTranscript.srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles_${username}_${selectedReel?.id || 'reel'}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartTranscription = async (reel: ReelResult) => {
    setSelectedReel(reel);
    setIsTranscriptPaneOpen(true);
    setIsAdModalOpen(true);
    setIsTranscribing(true);

    // Explicitly pause reel video so it never plays behind the ad
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl: reel.url,
          shortcode: reel.id,
          caption: reel.caption,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setActiveTranscript(json.data);
        }
      }
    } catch (err) {
      console.error('[Transcription Error]:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAdCompleted = () => {
    setIsAdModalOpen(false);
    setIsTranscriptPaneOpen(true);
    // Start reel video only once the ad is skipped or completed
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
      }).catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsVideoMuted(true);
          videoRef.current.play().catch(() => {});
          setIsVideoPlaying(true);
        }
      });
    }
  };

  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (reels.length === 0 || hasAutoStartedRef.current) return;

    if (autoStartTranscribe) {
      hasAutoStartedRef.current = true;
      handleStartTranscription(reels[0]);
    } else if (autoOpenFirst && reels.length === 1 && !selectedReel) {
      hasAutoStartedRef.current = true;
      setSelectedReel(reels[0]);
    }
  }, [autoStartTranscribe, autoOpenFirst, reels, selectedReel]);

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
    // DO NOT play video while the ad modal is open
    if (isAdModalOpen) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsVideoPlaying(false);
      return;
    }

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
  }, [selectedReel, isAdModalOpen]);

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

              {/* In-Feed Native Banner Ad in Reels Grid */}
              {showAdAfter && (
                <div className="col-span-full my-2">
                  <AdBanner />
                </div>
              )}
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

      {/* Reel Studio Player (Side-by-side Video & Synchronized Transcript) */}
      {selectedReel && (() => {
        const isPlayableVideo = Boolean(selectedReel.url && selectedReel.url.includes('.mp4'));
        return (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 select-none animate-fade-in">
            <div
              className={`relative w-full ${
                isTranscriptPaneOpen
                  ? 'max-w-5xl lg:max-w-6xl h-[92vh] max-h-[880px]'
                  : 'max-w-sm sm:max-w-md h-[88vh]'
              } bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden flex flex-col md:flex-row justify-between shadow-2xl transition-all duration-300`}
            >
              {/* Left Column: Vertical Video Player */}
              <div
                className={`relative flex flex-col justify-between bg-black overflow-hidden ${
                  isTranscriptPaneOpen
                    ? 'w-full md:w-[350px] lg:w-[380px] shrink-0 h-[38vh] md:h-full border-b md:border-b-0 md:border-r border-zinc-800/80'
                    : 'w-full h-full'
                }`}
              >
                {/* Top Close, Speed, Mute & Clean View Bar */}
                <div className="absolute top-0 inset-x-0 z-40 p-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between text-white">
                  <span className="text-xs font-semibold text-white/90 drop-shadow truncate max-w-[140px]">
                    @{username}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Transcript Toggle (only shown when pane is closed) */}
                    {isPlayableVideo && !isTranscriptPaneOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!activeTranscript && !isTranscribing) {
                            handleStartTranscription(selectedReel);
                          } else {
                            setIsTranscriptPaneOpen(true);
                          }
                        }}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs bg-black/60 hover:bg-black/90 text-white/90 border border-white/20"
                        title="Open Transcript Studio"
                      >
                        <FileText className="w-3.5 h-3.5 text-pink-400" />
                        <span>Transcript</span>
                      </button>
                    )}

                    {/* Speed Toggle (only if video) */}
                    {isPlayableVideo && (
                      <button
                        type="button"
                        onClick={cyclePlaybackSpeed}
                        className="px-2 py-0.5 bg-black/60 hover:bg-black/90 active:scale-90 text-[11px] font-semibold rounded-lg border border-white/20 transition-all cursor-pointer shadow-xs"
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
                        className="p-1.5 hover:bg-white/20 active:scale-90 rounded-full text-white transition-all cursor-pointer"
                        title={isVideoMuted ? 'Unmute' : 'Mute'}
                      >
                        {isVideoMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white" />}
                      </button>
                    )}

                    {/* Clean View Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsOverlayVisible((v) => !v)}
                      className={`p-1.5 hover:bg-white/20 active:scale-90 rounded-full transition-all cursor-pointer ${
                        !isOverlayVisible ? 'text-pink-400 bg-pink-500/20' : 'text-white'
                      }`}
                      title={isOverlayVisible ? 'Clean View (hide caption & buttons)' : 'Show details & controls'}
                      aria-label={isOverlayVisible ? 'Clean View' : 'Show Details'}
                    >
                      {isOverlayVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    {/* Close (rendered on video header only when transcript pane is closed) */}
                    {!isTranscriptPaneOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReel(null);
                          setIsTranscriptPaneOpen(false);
                          setIsOverlayVisible(true);
                        }}
                        className="p-1.5 hover:bg-white/20 active:scale-90 rounded-full text-white transition-all cursor-pointer"
                        title="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
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
                      autoPlay={!isAdModalOpen}
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
                          if (now - lastTimeUpdateRef.current > 100) {
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

                  {/* Live On-Video Synced Subtitle Banner */}
                  {showOnVideoCaptions && activeSegment && isPlayableVideo && (
                    <div className="absolute bottom-16 sm:bottom-20 inset-x-3 z-35 flex justify-center pointer-events-none transition-all duration-150">
                      <div className="bg-black/85 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-white/20 text-center max-w-[92%] shadow-2xl animate-fade-in">
                        <p className="text-white font-bold text-xs sm:text-sm drop-shadow-md leading-snug tracking-wide">
                          {activeSegment.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Instagram-Style Transparent Overlay for Reel */}
                  {isOverlayVisible ? (
                    <>
                      {/* Bottom-Left Information Overlay */}
                      <div
                        className="absolute bottom-3 left-3 right-16 z-30 flex flex-col gap-1.5 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Creator & Audio Title */}
                        <div className="flex items-center gap-2 flex-wrap text-white">
                          <span className="text-xs font-bold drop-shadow">@{username}</span>
                          {selectedReel.audioTitle && (
                            <div className="flex items-center gap-1 text-[11px] text-white/85 font-medium drop-shadow bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10 max-w-[200px]">
                              <Music className="w-3 h-3 text-pink-400 shrink-0" />
                              <span className="truncate">{selectedReel.audioTitle}</span>
                            </div>
                          )}
                        </div>

                        {/* Collapsible Caption */}
                        {selectedReel.caption && !selectedReel.caption.startsWith('http') && (
                          <div className="text-xs text-white/95 leading-relaxed drop-shadow-sm max-h-[16vh] overflow-y-auto pr-1">
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

                        {/* Elapsed Time & Duration */}
                        {isPlayableVideo && (
                          <div className="text-[10px] text-white/70 font-mono tracking-wider drop-shadow-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>
                        )}
                      </div>

                      {/* Instagram-Style Vertical Action Column on Right Edge (hidden when transcript studio is open) */}
                      {!isTranscriptPaneOpen && (
                        <div
                          className="absolute right-3 bottom-6 z-35 flex flex-col items-center gap-3 pointer-events-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                        {/* Download Video Action */}
                        <a
                          href={
                            selectedReel.downloadUrl ||
                            `/api/media?url=${encodeURIComponent(selectedReel.url)}&download=true&filename=reel_${username}_${selectedReel.id}.${isPlayableVideo ? 'mp4' : 'jpg'}`
                          }
                          download
                          className="group flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
                          title={isPlayableVideo ? 'Download Reel Video' : 'Download Cover'}
                        >
                          <div className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 active:bg-pink-600 backdrop-blur-md text-white border border-white/20 shadow-xl group-hover:border-pink-500/50 transition-colors">
                            <Download className="w-4 h-4 text-white group-hover:text-pink-300 transition-colors" />
                          </div>
                          <span className="text-[10px] font-semibold text-white drop-shadow-md">Video</span>
                        </a>

                        {/* Download Audio Action */}
                        {isPlayableVideo && (
                          <a
                            href={`/api/media?url=${encodeURIComponent(selectedReel.url)}&download=true&audioOnly=true&filename=audio_${username}_${selectedReel.id}.m4a`}
                            download
                            className="group flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
                            title="Extract and download reel audio track (M4A)"
                          >
                            <div className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 active:bg-pink-600 backdrop-blur-md text-white border border-white/20 shadow-xl group-hover:border-pink-500/50 transition-colors">
                              <Music className="w-4 h-4 text-white group-hover:text-pink-300 transition-colors" />
                            </div>
                            <span className="text-[10px] font-semibold text-white drop-shadow-md">Audio</span>
                          </a>
                        )}

                        {/* Transcribe Reel Action */}
                        {isPlayableVideo && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!activeTranscript && !isTranscribing) {
                                handleStartTranscription(selectedReel);
                              } else {
                                setIsTranscriptPaneOpen(true);
                              }
                            }}
                            className={`group flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer ${
                              isTranscriptPaneOpen ? 'scale-105' : ''
                            }`}
                            title="Transcribe & view synchronized text side-by-side"
                          >
                            <div className={`p-2.5 rounded-full ${
                              isTranscriptPaneOpen
                                ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 ring-2 ring-pink-400'
                                : 'bg-gradient-to-tr from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500'
                            } text-white border border-pink-400/30 shadow-xl shadow-pink-500/20 transition-all`}>
                              {isTranscribing ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              ) : (
                                <FileText className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-white drop-shadow-md flex items-center gap-0.5">
                              <span>Text</span>
                              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                            </span>
                          </button>
                        )}

                        {/* Copy Caption Action */}
                        {selectedReel.caption && !selectedReel.caption.startsWith('http') && (
                          <button
                            type="button"
                            onClick={() => copyCaption(selectedReel.caption || '')}
                            className="group flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
                            title="Copy Caption"
                          >
                            <div className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 active:bg-pink-600 backdrop-blur-md text-white border border-white/20 shadow-xl group-hover:border-pink-500/50 transition-colors">
                              {copyState === 'caption' ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-white group-hover:text-pink-300 transition-colors" />
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-white drop-shadow-md">
                              {copyState === 'caption' ? 'Copied' : 'Caption'}
                            </span>
                          </button>
                        )}

                        {/* Direct Source Link */}
                        <a
                          href={selectedReel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
                          title="Direct Source URL"
                        >
                          <div className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 active:bg-pink-600 backdrop-blur-md text-white border border-white/20 shadow-xl group-hover:border-pink-500/50 transition-colors">
                            <Maximize2 className="w-4 h-4 text-white group-hover:text-pink-300 transition-colors" />
                          </div>
                          <span className="text-[10px] font-semibold text-white drop-shadow-md">Direct</span>
                        </a>
                      </div>
                    )}
                  </>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOverlayVisible(true);
                      }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-35 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 shadow-xl transition-all cursor-pointer active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-pink-400" />
                      <span>Show Details</span>
                    </button>
                  )}

                  {/* Instagram-Style Bottom-Edge Timeline Scrub Bar (Always at bottom-0, never in the middle) */}
                  {isPlayableVideo && (
                    <div
                      className="absolute bottom-0 inset-x-0 z-40 h-1 sm:h-1.5 bg-white/20 hover:h-2.5 transition-all cursor-pointer group"
                      onClick={handleVideoSeek}
                      title="Seek"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 relative transition-all"
                        style={{ width: `${videoProgress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Studio Synchronized Transcript Workspace */}
              {isTranscriptPaneOpen && (
                <div className="flex-1 h-[54vh] md:h-full bg-white dark:bg-zinc-900 flex flex-col overflow-hidden min-w-0 animate-fade-in">
                  {/* Clean Unified Studio Header */}
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                          Transcript
                        </h3>
                        {activeTranscript && (
                          <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                            {formatTime(activeTranscript.duration || duration)} • {activeTranscript.text ? activeTranscript.text.split(/\s+/).filter(Boolean).length : 0} words
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Header Right Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Auto-scroll Sync Toggle */}
                      {activeTranscript && (
                        <button
                          type="button"
                          onClick={() => setIsAutoScrollEnabled((v) => !v)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isAutoScrollEnabled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                          }`}
                          title={isAutoScrollEnabled ? 'Auto-scroll is following playback' : 'Auto-scroll is paused'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isAutoScrollEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          <span>Sync</span>
                        </button>
                      )}

                      {/* Close Reel Modal */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReel(null);
                          setIsTranscriptPaneOpen(false);
                          setIsOverlayVisible(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                        title="Close Studio"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Transcript Content Body */}
                  <div
                    ref={transcriptScrollRef}
                    className="flex-1 overflow-y-auto p-4 sm:p-5 text-sm leading-relaxed scroll-smooth"
                  >
                    {isTranscribing ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                        <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 mb-3 animate-pulse">
                          <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                          Transcribing Spoken Audio...
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs">
                          Extracting speech with Groq Whisper Large v3 Turbo in real-time.
                        </p>
                      </div>
                    ) : activeTranscript ? (
                      <div className="space-y-2.5 select-text">
                        {formattedParagraphs.map((para, idx) => {
                          const isParaActive = activeParagraphIndex === idx;
                          return (
                            <div
                              key={para.id}
                              ref={isParaActive ? activeItemRef : null}
                              data-active-para={isParaActive ? 'true' : undefined}
                              onClick={() => seekTo(para.start)}
                              className={`group relative pl-3.5 pr-2.5 py-2 rounded-xl transition-all cursor-pointer border-l-2 ${
                                isParaActive
                                  ? 'border-pink-500 bg-pink-500/8 dark:bg-pink-500/12'
                                  : 'border-transparent hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-0.5">
                                <span
                                  className={`text-[11px] font-mono font-semibold transition-colors ${
                                    isParaActive
                                      ? 'text-pink-500 dark:text-pink-400 font-bold'
                                      : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300'
                                  }`}
                                >
                                  {formatTime(para.start)}
                                </span>
                              </div>
                              <p className="leading-relaxed text-sm">
                                {para.segments && para.segments.length > 0 ? (
                                  para.segments.map((seg, sIdx) => {
                                    const isSegActive =
                                      activeSegment?.id === seg.id ||
                                      (currentTime >= seg.start &&
                                        currentTime < (seg.end > seg.start ? seg.end : seg.start + 2.5));
                                    return (
                                      <span
                                        key={sIdx}
                                        data-active-highlight={isSegActive ? 'true' : undefined}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          seekTo(seg.start);
                                        }}
                                        className={`cursor-pointer transition-colors rounded px-0.5 ${
                                          isSegActive
                                            ? 'bg-pink-500/25 text-pink-600 dark:text-pink-300 font-bold'
                                            : isParaActive
                                            ? 'text-slate-900 dark:text-zinc-100'
                                            : 'text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-200'
                                        }`}
                                      >
                                        {seg.text}{' '}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span
                                    className={
                                      isParaActive
                                        ? 'text-slate-900 dark:text-white font-medium'
                                        : 'text-slate-600 dark:text-zinc-400'
                                    }
                                  >
                                    {para.text}
                                  </span>
                                )}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <FileText className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-xs">No transcript loaded yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Clean Studio Footer Actions */}
                  {activeTranscript && (
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
                      {/* Left: Copy & Formats */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyTranscript}
                          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          {copiedTranscript ? (
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedTranscript ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDownloadTxt}
                          className="py-1.5 px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors cursor-pointer"
                          title="Download TXT transcript"
                        >
                          .TXT
                        </button>

                        {activeTranscript.srt && (
                          <button
                            type="button"
                            onClick={handleDownloadSrt}
                            className="py-1.5 px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors cursor-pointer"
                            title="Download SRT subtitles"
                          >
                            .SRT
                          </button>
                        )}
                      </div>

                      {/* Right: Quick Media Downloads */}
                      <div className="flex items-center gap-2">
                        <a
                          href={
                            selectedReel.downloadUrl ||
                            `/api/media?url=${encodeURIComponent(selectedReel.url)}&download=true&filename=reel_${username}_${selectedReel.id}.${isPlayableVideo ? 'mp4' : 'jpg'}`
                          }
                          download
                          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors cursor-pointer"
                          title="Download Reel Video MP4"
                        >
                          <Download className="w-3.5 h-3.5 text-pink-500" />
                          <span>Video</span>
                        </a>

                        {isPlayableVideo && (
                          <a
                            href={`/api/media?url=${encodeURIComponent(selectedReel.url)}&download=true&audioOnly=true&filename=audio_${username}_${selectedReel.id}.m4a`}
                            download
                            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors cursor-pointer"
                            title="Download Audio M4A"
                          >
                            <Music className="w-3.5 h-3.5 text-pink-500" />
                            <span>Audio</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Rewarded Ad Locker Modal (15-second sponsor watch requirement) */}
      <RewardedAdModal
        isOpen={isAdModalOpen}
        onClose={() => {
          setIsAdModalOpen(false);
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
            setIsVideoPlaying(true);
          }
        }}
        onUnlocked={handleAdCompleted}
        requiredSeconds={15}
      />
    </>
  );
}
