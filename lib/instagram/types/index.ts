export type MediaType = 'image' | 'video' | 'carousel';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  caption?: string;
  timestamp?: string;
  carouselMedia?: MediaItem[];
  audioTitle?: string;
  audioArtist?: string;
  downloadUrl?: string;
  shortcode?: string;
}

export interface Profile {
  username: string;
  fullName?: string;
  avatarUrl?: string;
  biography?: string;
  followers?: number;
  following?: number;
  postsCount?: number;
  verified?: boolean;
  externalUrl?: string;
  isPrivate?: boolean;
  userId?: string;
}

export interface StoryResult extends MediaItem {
  storyId: string;
  expiresAt?: string;
}

export interface HighlightResult {
  id: string;
  title: string;
  coverUrl: string;
  mediaCount: number;
  items: MediaItem[];
}

export interface PostResult extends MediaItem {
  likeCount?: number;
  commentCount?: number;
}

export interface ReelResult extends MediaItem {
  viewCount?: number;
  playCount?: number;
}

export interface ProviderMetadata {
  provider: string;
  executionTimeMs: number;
  isDemo: boolean;
  timestamp: string;
  notice?: string;
  nextMaxId?: string;
  hasNextPage?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: ProviderMetadata;
}
