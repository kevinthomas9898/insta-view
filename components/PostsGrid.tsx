'use client';

import React, { useState, useEffect } from 'react';
import { PostResult, MediaItem } from '@/lib/instagram/types';
import { AdBanner } from '@/components/AdBanner';
import {
  Layers,
  Play,
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
  };

  const closePostModal = () => {
    setSelectedPost(null);
    setCarouselIndex(0);
    setIsMediaLoading(false);
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

  return (
    <>
      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post, idx) => {
          const thumbUrl = post.thumbnailUrl || post.url;
          const displayThumb = `/api/media?url=${encodeURIComponent(thumbUrl)}`;
          const showAdAfter = (idx + 1) % 5 === 0 && idx !== posts.length - 1;

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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closePostModal}
              className="absolute top-3 right-3 z-30 p-2 bg-black/70 hover:bg-black text-white rounded-full border border-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Player / Image Area */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] md:min-h-[500px] overflow-hidden select-none">
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
                <video
                  key={activeItem.url}
                  controls
                  playsInline
                  autoPlay
                  preload="auto"
                  onLoadedData={() => setIsMediaLoading(false)}
                  onWaiting={() => setIsMediaLoading(true)}
                  onPlaying={() => setIsMediaLoading(false)}
                  className={`w-full max-h-[80vh] object-contain transition-opacity duration-200 ${
                    isMediaLoading ? 'opacity-30' : 'opacity-100'
                  }`}
                  src={`/api/media?url=${encodeURIComponent(activeItem.url)}`}
                  onError={(e) => {
                    setIsMediaLoading(false);
                    if (e.currentTarget.src !== activeItem.url) {
                      e.currentTarget.src = activeItem.url;
                    }
                  }}
                >
                  <source src={`/api/media?url=${encodeURIComponent(activeItem.url)}`} />
                  Your browser does not support the video tag.
                </video>
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
                  className={`w-full max-h-[80vh] object-contain transition-opacity duration-200 ${
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

                    {/* Carousel Counter & Interactive Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20">
                      <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/10 shadow-lg">
                        {carouselIndex + 1} / {selectedPost.carouselMedia.length}
                      </div>

                      {/* Interactive Dots for Multi-Item Carousels */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-xs">
                        {selectedPost.carouselMedia.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => handleGoToSlide(dotIdx)}
                            className={`rounded-full transition-all duration-200 cursor-pointer ${
                              dotIdx === carouselIndex
                                ? 'w-5 h-1.5 bg-pink-500'
                                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Go to slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>

            {/* Sidebar Details & Actions */}
            <div className="w-full md:w-80 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="overflow-y-auto max-h-[40vh] md:max-h-[60vh] pr-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">@{username}</span>
                  {selectedPost.timestamp && (
                    <span className="text-xs text-slate-500 dark:text-zinc-500">
                      • {new Date(selectedPost.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {selectedPost.caption && (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed mb-4">
                    {selectedPost.caption}
                  </p>
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

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
                <a
                  href={
                    activeItem.downloadUrl ||
                    `/api/media?url=${encodeURIComponent(activeItem.url)}&download=true&filename=instagram_${username}_${activeItem.id}.${activeItem.type === 'video' ? 'mp4' : 'jpg'}`
                  }
                  download
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download {activeItem.type === 'video' ? 'Video' : 'Image'}
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
