'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PostResult, MediaItem } from '@/lib/instagram/types';
import { AdBanner } from '@/components/AdBanner';
import {
  Layers,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Maximize2,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface PostsGridProps {
  posts: PostResult[];
  username: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function PostsGrid({
  posts,
  username,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: PostsGridProps) {
  const [selectedPost, setSelectedPost] = useState<PostResult | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTimeUpdateRef = useRef<number>(0);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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
    setVideoCurrentTime(videoRef.current.currentTime);
  };

  // Preload adjacent carousel images in the background for instant 0ms transitions
  useEffect(() => {
    if (selectedPost?.type === 'carousel' && selectedPost.carouselMedia) {
      const mediaList = selectedPost.carouselMedia;
      const toPreload = [
        mediaList[carouselIndex + 1],
        mediaList[carouselIndex + 2],
        mediaList[carouselIndex - 1],
      ];

      toPreload.forEach((item) => {
        if (item && item.type !== 'video' && item.url) {
          const img = new window.Image();
          img.src = `/api/media?url=${encodeURIComponent(item.url)}`;
        }
      });
    }
  }, [selectedPost, carouselIndex]);

  // Keyboard navigation for carousel modal (Left/Right arrow, Escape)
  useEffect(() => {
    if (!selectedPost) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (selectedPost.type === 'carousel' && selectedPost.carouselMedia) {
          if (carouselIndex < selectedPost.carouselMedia.length - 1) {
            setIsMediaLoading(true);
            setCarouselIndex((i) => i + 1);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        if (carouselIndex > 0) {
          setIsMediaLoading(true);
          setCarouselIndex((i) => i - 1);
        }
      } else if (e.key === 'Escape') {
        setSelectedPost(null);
        setCarouselIndex(0);
        setIsMediaLoading(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPost, carouselIndex]);

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-500 dark:text-zinc-400 backdrop-blur-sm shadow-xs">
        <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
        <p className="text-base font-semibold text-slate-900 dark:text-zinc-200">No posts found</p>
        <p className="text-sm mt-1 text-slate-500 dark:text-zinc-500">This account has no public posts available.</p>
      </div>
    );
  }

  const openPostModal = (post: PostResult) => {
    setSelectedPost(post);
    setCarouselIndex(0);
    setIsMediaLoading(true);
    setIsCaptionExpanded(false);
    setIsVideoPlaying(true);
    setVideoProgress(0);
  };

  const closePostModal = () => {
    setSelectedPost(null);
    setCarouselIndex(0);
    setIsMediaLoading(false);
    setIsCaptionExpanded(false);
  };

  const handleNextSlide = () => {
    if (!selectedPost?.carouselMedia) return;
    if (carouselIndex < selectedPost.carouselMedia.length - 1) {
      setIsMediaLoading(true);
      setCarouselIndex((i) => i + 1);
    }
  };

  const handlePrevSlide = () => {
    if (carouselIndex > 0) {
      setIsMediaLoading(true);
      setCarouselIndex((i) => i - 1);
    }
  };

  const handleGoToSlide = (idx: number) => {
    if (idx !== carouselIndex) {
      setIsMediaLoading(true);
      setCarouselIndex(idx);
    }
  };

  const getActiveCarouselItem = (): MediaItem | null => {
    if (!selectedPost) return null;
    if (selectedPost.type === 'carousel' && selectedPost.carouselMedia && selectedPost.carouselMedia.length > 0) {
      return selectedPost.carouselMedia[carouselIndex] || selectedPost;
    }
    return selectedPost;
  };

  const activeItem = getActiveCarouselItem();

  // Seamless Autoplay for video posts with fallback to muted autoplay if browser blocks audio
  useEffect(() => {
    if (activeItem?.type === 'video' && videoRef.current) {
      setIsMediaLoading(true);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsVideoMuted(true);
            videoRef.current.play().catch(() => {
              setIsVideoPlaying(false);
              setIsMediaLoading(false);
            });
          }
        });
      }
    }
  }, [activeItem?.url, activeItem?.type]);

  return (
    <>
      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post, idx) => {
          const thumbUrl = post.thumbnailUrl || post.url;
          const displayThumb = `/api/media?url=${encodeURIComponent(thumbUrl)}`;
          // Display full-width ad strictly after full 3-column rows (multiples of 6) to avoid empty grid gaps
          const showAdAfter = (idx + 1) % 6 === 0 && idx !== posts.length - 1;

          return (
            <React.Fragment key={post.id || idx}>
              <div
                onClick={() => openPostModal(post)}
                className="group relative bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xl transition-all flex flex-col shadow-xs"
              >
                {/* Media Thumbnail Container with 1:1 Aspect Ratio */}
                <div className="relative aspect-square bg-slate-900 overflow-hidden">
                  <img
                    src={displayThumb}
                    alt={post.caption || 'Instagram Post'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      if (e.currentTarget.src !== thumbUrl) {
                        e.currentTarget.src = thumbUrl;
                      }
                    }}
                  />

                  {/* Badge for Type */}
                  <div className="absolute top-2.5 right-2.5 flex gap-1 z-10">
                    {post.type === 'carousel' && (
                      <span className="p-1.5 bg-black/70 text-white rounded-md text-xs flex items-center gap-1 backdrop-blur-md border border-white/10">
                        <Layers className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {post.type === 'video' && (
                      <span className="p-1.5 bg-black/70 text-white rounded-md text-xs flex items-center gap-1 backdrop-blur-md border border-white/10">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay with Likes & Comments */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white text-sm font-semibold backdrop-blur-[2px]">
                    {post.likeCount !== undefined && (
                      <span className="flex items-center gap-1.5 drop-shadow">
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                        {post.likeCount.toLocaleString()}
                      </span>
                    )}
                    {post.commentCount !== undefined && (
                      <span className="flex items-center gap-1.5 drop-shadow">
                        <MessageCircle className="w-4 h-4 fill-white" />
                        {post.commentCount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Caption Snippet */}
                {post.caption && (
                  <div className="p-3 text-xs text-slate-700 dark:text-zinc-400 line-clamp-2 border-t border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 flex-1">
                    {post.caption}
                  </div>
                )}
              </div>

              {/* In-Feed Native Banner Ad (Every 5 posts) */}
              {showAdAfter && (
                <div className="col-span-full">
                  <AdBanner />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore ? (
        <div className="mt-4 mb-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-sm dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-700 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                <span>Loading more posts...</span>
              </>
            ) : (
              <>
                <span>Load More Posts</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : posts.length > 0 ? (
        <div className="mt-8 mb-6 text-center text-xs text-slate-500 dark:text-zinc-500 font-medium">
          Showing all {posts.length} loaded posts
        </div>
      ) : null}

      {/* Post Detail & Media Viewer Modal */}
      {selectedPost && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5">
          <div className="relative w-full max-w-4xl max-h-[94vh] bg-black md:bg-white md:dark:bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closePostModal}
              className="absolute top-3 right-3 z-40 p-2 bg-black/75 hover:bg-black text-white rounded-full border border-white/20 transition-all duration-150 active:scale-90 shadow-lg cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Player / Image Area */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[50vh] md:min-h-[520px] max-h-[85vh] md:max-h-[92vh] overflow-hidden select-none">
              {/* Instant Loading Spinner Overlay */}
              {isMediaLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-15 transition-opacity duration-150 animate-fade-in pointer-events-none">
                  <div className="p-3 rounded-full bg-zinc-900/90 border border-white/10 shadow-2xl">
                    <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                  </div>
                  <span className="text-[11px] font-medium text-white/90 mt-2.5 tracking-wide">
                    Loading media...
                  </span>
                </div>
              )}

              {activeItem.type === 'video' ? (
                <div
                  className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
                  onClick={toggleVideoPlay}
                >
                  <video
                    ref={videoRef}
                    key={activeItem.url}
                    playsInline
                    autoPlay
                    muted={isVideoMuted}
                    preload="metadata"
                    poster={`/api/media?url=${encodeURIComponent(activeItem.thumbnailUrl || activeItem.url)}`}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setVideoDuration(videoRef.current.duration);
                      }
                    }}
                    onWaiting={() => setIsMediaLoading(true)}
                    onStalled={() => setIsMediaLoading(true)}
                    onPlaying={() => {
                      setIsMediaLoading(false);
                      setIsVideoPlaying(true);
                    }}
                    onPause={() => setIsVideoPlaying(false)}
                    onTimeUpdate={() => {
                      if (videoRef.current && videoRef.current.duration) {
                        const now = Date.now();
                        if (now - lastTimeUpdateRef.current > 200) {
                          lastTimeUpdateRef.current = now;
                          const cur = videoRef.current.currentTime;
                          const dur = videoRef.current.duration;
                          setVideoCurrentTime(cur);
                          setVideoDuration(dur);
                          setVideoProgress((cur / dur) * 100);
                        }
                      }
                    }}
                    className={`w-full max-h-[80vh] md:max-h-[85vh] object-contain transition-opacity duration-200 ${
                      isMediaLoading ? 'opacity-70' : 'opacity-100'
                    }`}
                    src={`/api/media?url=${encodeURIComponent(activeItem.url)}`}
                    onError={(e) => {
                      setIsMediaLoading(false);
                      if (e.currentTarget.src !== activeItem.url) {
                        e.currentTarget.src = activeItem.url;
                      }
                    }}
                  />

                  {/* Top-Right Floating Mute / Unmute Button (beside Close button) */}
                  <button
                    type="button"
                    onClick={toggleVideoMute}
                    className="absolute top-3.5 right-14 z-40 p-2.5 rounded-full bg-black/75 hover:bg-black active:scale-85 text-white border border-white/20 shadow-xl transition-all cursor-pointer"
                    title={isVideoMuted ? 'Unmute sound' : 'Mute sound'}
                    aria-label={isVideoMuted ? 'Unmute sound' : 'Mute sound'}
                  >
                    {isVideoMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </button>

                  {/* Center Play Icon When Paused */}
                  {!isVideoPlaying && !isMediaLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 z-25 pointer-events-none">
                      <div className="p-4 rounded-full bg-black/80 backdrop-blur-sm text-white border border-white/20 shadow-2xl active:scale-85 transition-transform">
                        <Play className="w-8 h-8 fill-current translate-x-0.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <img
                  key={activeItem.url}
                  src={`/api/media?url=${encodeURIComponent(activeItem.url)}`}
                  alt="Post content"
                  referrerPolicy="no-referrer"
                  onLoad={() => setIsMediaLoading(false)}
                  onError={(e) => {
                    setIsMediaLoading(false);
                    if (e.currentTarget.src !== activeItem.url) {
                      e.currentTarget.src = activeItem.url;
                    }
                  }}
                  className={`w-full max-h-[80vh] md:max-h-[85vh] object-contain transition-opacity duration-200 ${
                    isMediaLoading ? 'opacity-30' : 'opacity-100'
                  }`}
                />
              )}

              {/* Carousel Navigation Arrows with Tactile Feedback */}
              {selectedPost.type === 'carousel' &&
                selectedPost.carouselMedia &&
                selectedPost.carouselMedia.length > 1 && (
                  <>
                    {carouselIndex > 0 && (
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 hover:bg-black active:scale-85 active:bg-pink-600 text-white z-20 border border-white/20 transition-all duration-150 shadow-2xl cursor-pointer"
                        title="Previous slide (Left Arrow)"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    {carouselIndex < selectedPost.carouselMedia.length - 1 && (
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 hover:bg-black active:scale-85 active:bg-pink-600 text-white z-20 border border-white/20 transition-all duration-150 shadow-2xl cursor-pointer"
                        title="Next slide (Right Arrow)"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}

                    {/* Carousel Counter */}
                    <div className="absolute top-3 left-3 z-30">
                      <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/10 shadow-lg">
                        {carouselIndex + 1} / {selectedPost.carouselMedia.length}
                      </div>
                    </div>
                  </>
                )}

              {/* Mobile Instagram-Style Transparent Overlay */}
              <div className="md:hidden absolute bottom-0 inset-x-0 p-3.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white z-30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs drop-shadow">@{username}</span>
                    {selectedPost.timestamp && (
                      <span className="text-[10px] text-white/60">
                        • {new Date(selectedPost.timestamp).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/90">
                    {selectedPost.likeCount !== undefined && (
                      <span className="flex items-center gap-1 drop-shadow">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        {selectedPost.likeCount.toLocaleString()}
                      </span>
                    )}
                    {selectedPost.commentCount !== undefined && (
                      <span className="flex items-center gap-1 drop-shadow">
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        {selectedPost.commentCount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Collapsible Caption */}
                {selectedPost.caption && (
                  <div className="text-xs text-white/95 leading-relaxed drop-shadow-sm max-h-[30vh] overflow-y-auto">
                    <p className={isCaptionExpanded ? 'whitespace-pre-line' : 'line-clamp-2'}>
                      {selectedPost.caption}
                    </p>
                    {selectedPost.caption.length > 70 && (
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

                {/* Video Timeline Scrub Bar */}
                {activeItem.type === 'video' && (
                  <div className="flex flex-col gap-1 pt-1">
                    <div
                      className="w-full h-1.5 bg-white/25 hover:h-2.5 rounded-full overflow-hidden transition-all cursor-pointer relative z-35"
                      onClick={handleVideoSeek}
                      title="Seek"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/70 font-medium px-0.5">
                      <span>{formatTime(videoCurrentTime)}</span>
                      <span>{formatTime(videoDuration)}</span>
                    </div>
                  </div>
                )}

                {/* Mobile Quick Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {activeItem.type === 'video' && (
                    <button
                      type="button"
                      onClick={toggleVideoPlay}
                      className="p-2 rounded-xl bg-black/60 hover:bg-black/80 active:scale-90 text-white border border-white/20 transition-all cursor-pointer shadow-md"
                      title={isVideoPlaying ? 'Pause video' : 'Play video'}
                      aria-label={isVideoPlaying ? 'Pause' : 'Play'}
                    >
                      {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current text-white" />}
                    </button>
                  )}
                  {activeItem.type === 'video' && (
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
                      activeItem.downloadUrl ||
                      `/api/media?url=${encodeURIComponent(activeItem.url)}&download=true&filename=instagram_${username}_${activeItem.id}.${activeItem.type === 'video' && activeItem.url && activeItem.url.includes('.mp4') ? 'mp4' : 'jpg'}`
                    }
                    download
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download {activeItem.type === 'video' && activeItem.url && activeItem.url.includes('.mp4') ? 'Video' : 'Image'}
                    {selectedPost.type === 'carousel' && ` (${carouselIndex + 1}/${selectedPost.carouselMedia?.length})`}
                  </a>
                  <a
                    href={activeItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl border border-white/20 transition-colors"
                    title="Direct Source URL"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Desktop Sidebar Details & Actions */}
            <div className="hidden md:flex w-80 p-5 flex-col justify-between border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="overflow-y-auto max-h-[60vh] pr-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">@{username}</span>
                  {selectedPost.timestamp && (
                    <span className="text-xs text-slate-500 dark:text-zinc-500">
                      • {new Date(selectedPost.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {selectedPost.caption && (
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 mb-4">
                    <p className={`leading-relaxed whitespace-pre-line ${isCaptionExpanded ? '' : 'line-clamp-4'}`}>
                      {selectedPost.caption}
                    </p>
                    {selectedPost.caption.length > 120 && (
                      <button
                        type="button"
                        onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                        className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline mt-1 cursor-pointer block"
                      >
                        {isCaptionExpanded ? 'Show less' : '... more'}
                      </button>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-4 text-xs text-slate-600 dark:text-zinc-400 py-3 border-y border-slate-200 dark:border-zinc-800">
                  {selectedPost.likeCount !== undefined && (
                    <span>
                      <strong className="text-slate-900 dark:text-white font-semibold">{selectedPost.likeCount.toLocaleString()}</strong> likes
                    </span>
                  )}
                  {selectedPost.commentCount !== undefined && (
                    <span>
                      <strong className="text-slate-900 dark:text-white font-semibold">{selectedPost.commentCount.toLocaleString()}</strong> comments
                    </span>
                  )}
                </div>
              </div>

              {/* Desktop Video Playback Controls */}
              {activeItem.type === 'video' && (
                <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Video Player</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                      {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                    </span>
                  </div>
                  {/* Seekbar */}
                  <div
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 hover:h-2 rounded-full overflow-hidden transition-all cursor-pointer"
                    onClick={handleVideoSeek}
                    title="Seek"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                  {/* Controls */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={toggleVideoPlay}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-xs font-medium text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
                    >
                      {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {isVideoPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                      type="button"
                      onClick={toggleVideoMute}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-xs font-medium text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
                    >
                      {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                      {isVideoMuted ? 'Unmute' : 'Mute'}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
                <a
                  href={
                    activeItem.downloadUrl ||
                    `/api/media?url=${encodeURIComponent(activeItem.url)}&download=true&filename=instagram_${username}_${activeItem.id}.${activeItem.type === 'video' && activeItem.url && activeItem.url.includes('.mp4') ? 'mp4' : 'jpg'}`
                  }
                  download
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download {activeItem.type === 'video' && activeItem.url && activeItem.url.includes('.mp4') ? 'Video' : 'Image'}
                  {selectedPost.type === 'carousel' && ` (${carouselIndex + 1}/${selectedPost.carouselMedia?.length})`}
                </a>

                <a
                  href={activeItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100 dark:border-zinc-700/80 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-xl text-center transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Direct Source URL
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
