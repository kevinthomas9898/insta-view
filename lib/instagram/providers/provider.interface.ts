import {
  Profile,
  StoryResult,
  HighlightResult,
  PostResult,
  ReelResult,
  MediaItem,
} from '../types';

export interface ProviderResult<T> {
  data: T;
  notice?: string;
  nextMaxId?: string;
  hasNextPage?: boolean;
}

export interface InstagramProvider {
  readonly name: string;
  readonly isDemo: boolean;

  getProfile(username: string): Promise<ProviderResult<Profile>>;

  getStories(username: string): Promise<ProviderResult<StoryResult[]>>;

  getHighlights(username: string): Promise<HighlightResult[]>;

  getHighlightStories?(highlightId: string): Promise<MediaItem[]>;

  getPosts(username: string, maxId?: string): Promise<ProviderResult<PostResult[]>>;

  getReels(username: string, maxId?: string): Promise<ProviderResult<ReelResult[]>>;
}
