import { InstagramProvider, ProviderResult } from './provider.interface';
import {
  Profile,
  StoryResult,
  HighlightResult,
  PostResult,
  ReelResult,
} from '../types';

export class DemoProvider implements InstagramProvider {
  public readonly name = 'Demo Testing Provider';
  public readonly isDemo = true;

  public async getProfile(username: string): Promise<ProviderResult<Profile>> {
    return {
      data: {
        username,
        fullName: `${username.charAt(0).toUpperCase() + username.slice(1)} (Demo Profile)`,
        avatarUrl:
          'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400',
        biography:
          'Creative photographer & visual designer. 📸 Capturing everyday moments. Demo testing account for public media verification.',
        followers: 124500,
        following: 342,
        postsCount: 58,
        verified: true,
        externalUrl: 'https://example.com/portfolio',
        isPrivate: false,
        userId: '987654321',
      },
      notice: 'DEMO DATA — NOT LIVE INSTAGRAM DATA',
    };
  }

  public async getStories(username: string): Promise<ProviderResult<StoryResult[]>> {
    const now = Date.now();
    const stories: StoryResult[] = [
      {
        id: 'demo_story_1',
        storyId: 'demo_story_1',
        type: 'image',
        url: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1080',
        thumbnailUrl:
          'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=200',
        width: 1080,
        height: 1920,
        timestamp: new Date(now - 3600000 * 2).toISOString(),
        expiresAt: new Date(now + 3600000 * 22).toISOString(),
      },
      {
        id: 'demo_story_2',
        storyId: 'demo_story_2',
        type: 'video',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        thumbnailUrl:
          'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=200',
        duration: 15,
        width: 720,
        height: 1280,
        timestamp: new Date(now - 3600000 * 4).toISOString(),
        expiresAt: new Date(now + 3600000 * 20).toISOString(),
      },
      {
        id: 'demo_story_3',
        storyId: 'demo_story_3',
        type: 'image',
        url: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=1080',
        thumbnailUrl:
          'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=200',
        width: 1080,
        height: 1920,
        timestamp: new Date(now - 3600000 * 8).toISOString(),
        expiresAt: new Date(now + 3600000 * 16).toISOString(),
      },
    ];

    return {
      data: stories,
      notice: 'DEMO DATA — NOT LIVE INSTAGRAM DATA',
    };
  }

  public async getHighlights(username: string): Promise<HighlightResult[]> {
    return [
      {
        id: 'demo_hl_1',
        title: 'Travels ✈️',
        coverUrl:
          'https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=300',
        mediaCount: 3,
        items: [
          {
            id: 'hl1_item_1',
            type: 'image',
            url: 'https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=1080',
            thumbnailUrl:
              'https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=200',
            caption: 'Mountain peak in Switzerland',
          },
          {
            id: 'hl1_item_2',
            type: 'video',
            url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            thumbnailUrl:
              'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=200',
            duration: 15,
            caption: 'Coastal road roadtrip',
          },
          {
            id: 'hl1_item_3',
            type: 'image',
            url: 'https://images.pexels.com/photos/2440024/pexels-photo-2440024.jpeg?auto=compress&cs=tinysrgb&w=1080',
            thumbnailUrl:
              'https://images.pexels.com/photos/2440024/pexels-photo-2440024.jpeg?auto=compress&cs=tinysrgb&w=200',
            caption: 'Sunset over Venice canals',
          },
        ],
      },
      {
        id: 'demo_hl_2',
        title: 'Work & Studio 💻',
        coverUrl:
          'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=300',
        mediaCount: 2,
        items: [
          {
            id: 'hl2_item_1',
            type: 'image',
            url: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1080',
            thumbnailUrl:
              'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=200',
            caption: 'Team collaboration session',
          },
          {
            id: 'hl2_item_2',
            type: 'video',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnailUrl:
              'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=200',
            duration: 15,
            caption: 'Studio desk setup tour',
          },
        ],
      },
    ];
  }

  public async getPosts(username: string, _maxId?: string): Promise<ProviderResult<PostResult[]>> {
    if (_maxId === 'demo_page_2') {
      const morePosts: PostResult[] = [
        {
          id: 'demo_post_page2_1',
          type: 'image',
          url: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1080',
          thumbnailUrl:
            'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=400',
          caption: 'Coastal horizons and tranquil waters. Morning light session. #nature',
          timestamp: new Date(Date.now() - 86400000 * 12).toISOString(),
          likeCount: 5240,
          commentCount: 96,
        },
        {
          id: 'demo_post_page2_2',
          type: 'image',
          url: 'https://images.pexels.com/photos/1236701/pexels-photo-1236701.jpeg?auto=compress&cs=tinysrgb&w=1080',
          thumbnailUrl:
            'https://images.pexels.com/photos/1236701/pexels-photo-1236701.jpeg?auto=compress&cs=tinysrgb&w=400',
          caption: 'Urban night lights and long exposure trails. #cityscapes',
          timestamp: new Date(Date.now() - 86400000 * 14).toISOString(),
          likeCount: 4120,
          commentCount: 77,
        },
      ];
      return {
        data: morePosts,
        hasNextPage: false,
        notice: 'DEMO DATA — NOT LIVE INSTAGRAM DATA',
      };
    }

    const posts: PostResult[] = [
      {
        id: 'demo_post_carousel',
        type: 'carousel',
        url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1080',
        thumbnailUrl:
          'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400',
        caption: 'Alpine wandering: a series of 3 captures from today. Swipe across to see video & photo details.',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        likeCount: 4890,
        commentCount: 134,
        carouselMedia: [
          {
            id: 'car_1',
            type: 'image',
            url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1080',
            thumbnailUrl:
              'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=200',
            caption: 'First ridge summit at dawn',
          },
          {
            id: 'car_2',
            type: 'video',
            url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            thumbnailUrl:
              'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=200',
            duration: 15,
            caption: 'Wind across the glacier pass',
          },
          {
            id: 'car_3',
            type: 'image',
            url: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=1080',
            thumbnailUrl:
              'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=200',
            caption: 'Descent through pine forest',
          },
        ],
      },
      {
        id: 'demo_post_video',
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl:
          'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=400',
        caption: 'Escape into the quiet. Sound on 🎧. Filmed on 4K 60fps.',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
        duration: 15,
        likeCount: 9230,
        commentCount: 215,
      },
      {
        id: 'demo_post_image',
        type: 'image',
        url: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1080',
        thumbnailUrl:
          'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400',
        caption: 'Golden hour reflections on architecture. Minimal lines and shadow work.',
        timestamp: new Date(Date.now() - 86400000 * 9).toISOString(),
        likeCount: 3120,
        commentCount: 88,
      },
    ];

    return {
      data: posts,
      nextMaxId: 'demo_page_2',
      hasNextPage: true,
      notice: 'DEMO DATA — NOT LIVE INSTAGRAM DATA',
    };
  }

  public async getReels(username: string, _maxId?: string): Promise<ProviderResult<ReelResult[]>> {
    const reels: ReelResult[] = [
      {
        id: 'demo_reel_1',
        type: 'video',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        thumbnailUrl:
          'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
        caption: 'Behind the lens: color grading workflow in 30 seconds. #videography #cinematic',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        duration: 15,
        viewCount: 421000,
        playCount: 512000,
        audioTitle: 'Original Audio - Cinematic Waves',
        audioArtist: 'SoundDesign Co.',
      },
      {
        id: 'demo_reel_2',
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl:
          'https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=400',
        caption: 'Roadtrip highlights through the desert valley. Save this for travel inspiration! 🏜️',
        timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
        duration: 15,
        viewCount: 889000,
        playCount: 1100000,
        audioTitle: 'Desert Wind (Instrumental)',
        audioArtist: 'Acoustic Journeys',
      },
    ];

    return {
      data: reels,
      notice: 'DEMO DATA — NOT LIVE INSTAGRAM DATA',
    };
  }
}
