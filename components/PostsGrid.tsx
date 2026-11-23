'use client';

import React, { useState } from 'react';
import { PostResult, MediaItem } from '@/lib/instagram/types';
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

  if (posts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-500">
        <p className="text-base font-medium">No posts found</p>
        <p className="text-sm mt-1 text-gray-400">This account has no public posts or posts could not be retrieved.</p>
      </div>
    );
  }

  const openPostModal = (post: PostResult) => {
    setSelectedPost(post);
    setCarouselIndex(0);
  };

  const closePostModal = () => {
    setSelectedPost(null);
    setCarouselIndex(0);
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
        {posts.map((post) => {
          const thumbUrl = post.thumbnailUrl || post.url;
          const displayThumb = `/api/media?url=${encodeURIComponent(thumbUrl)}`;

          return (
            <div
              key={post.id}
              onClick={() => openPostModal(post)}
              className="group relative bg-white border border-gray-200 rounded overflow-hidden cursor-pointer hover:border-gray-400 transition-all"
            >
              {/* Media Thumbnail Container with 1:1 Aspect Ratio */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={displayThumb}
                  alt={post.caption || 'Instagram Post'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    if (e.currentTarget.src !== thumbUrl) {
                      e.currentTarget.src = thumbUrl;
                    }
                  }}
                />

                {/* Badge for Type */}
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  {post.type === 'carousel' && (
                    <span className="p-1.5 bg-black/60 text-white rounded text-xs flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {post.type === 'video' && (
                    <span className="p-1.5 bg-black/60 text-white rounded text-xs flex items-center gap-1">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </span>
                  )}
                </div>

                {/* Hover Overlay with Likes & Comments */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white text-sm font-semibold">
                  {post.likeCount !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-current" />
                      {post.likeCount.toLocaleString()}
                    </span>
                  )}
                  {post.commentCount !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 fill-current" />
                      {post.commentCount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Caption Snippet */}
              {post.caption && (
                <div className="p-3 text-xs text-gray-700 line-clamp-2 border-t border-gray-100">
                  {post.caption}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore ? (
        <div className="mt-8 mb-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded shadow-sm inline-flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
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
        <div className="mt-8 mb-6 text-center text-xs text-gray-500 font-medium">
          Showing all {posts.length} loaded posts
        </div>
      ) : null}

      {/* Post Detail & Media Viewer Modal */}
      {selectedPost && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-lg overflow-hidden flex flex-col md:flex-row shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closePostModal}
              className="absolute top-3 right-3 z-30 p-2 bg-black/70 hover:bg-black text-white rounded-full"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Player / Image Area */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px]">
              {activeItem.type === 'video' ? (
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-[80vh] object-contain"
                  src={`/api/media?url=${encodeURIComponent(activeItem.url)}`}
                  onError={(e) => {
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
                  src={`/api/media?url=${encodeURIComponent(activeItem.url)}`}
                  alt="Post content"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[80vh] object-contain"
                  onError={(e) => {
                    if (e.currentTarget.src !== activeItem.url) {
                      e.currentTarget.src = activeItem.url;
                    }
                  }}
                />
              )}

              {/* Carousel Navigation Arrows */}
              {selectedPost.type === 'carousel' &&
                selectedPost.carouselMedia &&
                selectedPost.carouselMedia.length > 1 && (
                  <>
                    {carouselIndex > 0 && (
                      <button
                        onClick={() => setCarouselIndex((i) => i - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white z-20"
                        title="Previous item"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    {carouselIndex < selectedPost.carouselMedia.length - 1 && (
                      <button
                        onClick={() => setCarouselIndex((i) => i + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white z-20"
                        title="Next item"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                    {/* Carousel Counter */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-medium z-20">
                      {carouselIndex + 1} / {selectedPost.carouselMedia.length}
                    </div>
                  </>
                )}
            </div>

            {/* Sidebar Details & Actions */}
            <div className="w-full md:w-80 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 bg-white">
              <div className="overflow-y-auto max-h-[40vh] md:max-h-[60vh]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-gray-900 text-sm">@{username}</span>
                  {selectedPost.timestamp && (
                    <span className="text-xs text-gray-400">
                      • {new Date(selectedPost.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {selectedPost.caption && (
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-4">
                    {selectedPost.caption}
                  </p>
                )}

                {/* Stats */}
                <div className="flex gap-4 text-xs text-gray-500 py-3 border-y border-gray-100">
                  {selectedPost.likeCount !== undefined && (
                    <span>
                      <strong className="text-gray-900">{selectedPost.likeCount.toLocaleString()}</strong> likes
                    </span>
                  )}
                  {selectedPost.commentCount !== undefined && (
                    <span>
                      <strong className="text-gray-900">{selectedPost.commentCount.toLocaleString()}</strong> comments
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <a
                  href={
                    activeItem.downloadUrl ||
                    `/api/media?url=${encodeURIComponent(activeItem.url)}&download=true&filename=instagram_${username}_${activeItem.id}.${activeItem.type === 'video' ? 'mp4' : 'jpg'}`
                  }
                  download
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download {activeItem.type === 'video' ? 'Video' : 'Image'}
                  {selectedPost.type === 'carousel' && ` (${carouselIndex + 1}/${selectedPost.carouselMedia?.length})`}
                </a>

                <a
                  href={activeItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded text-center"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Open Direct CDN URL
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
