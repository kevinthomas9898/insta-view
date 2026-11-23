'use client';

import React, { useState, useEffect } from 'react';
import {
  Profile,
  StoryResult,
  HighlightResult,
  PostResult,
  ReelResult,
  ProviderMetadata,
} from '@/lib/instagram/types';
import { ProfileHeader } from '@/components/ProfileHeader';
import { TabsNav, TabKey } from '@/components/TabsNav';
import { StoriesList } from '@/components/StoriesList';
import { HighlightsViewer } from '@/components/HighlightsViewer';
import { PostsGrid } from '@/components/PostsGrid';
import { ReelsGrid } from '@/components/ReelsGrid';
import { Search, Loader2, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function Home() {
  const [usernameInput, setUsernameInput] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [searchedUsername, setSearchedUsername] = useState('');

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileMetadata, setProfileMetadata] = useState<ProviderMetadata | undefined>(undefined);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('posts');

  const [stories, setStories] = useState<StoryResult[]>([]);
  const [highlights, setHighlights] = useState<HighlightResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [reels, setReels] = useState<ReelResult[]>([]);

  const [tabError, setTabError] = useState<{ code?: string; message: string } | null>(null);

  const [postsNextMaxId, setPostsNextMaxId] = useState<string | null>(null);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);

  // Auto-search a sample demo profile on initial visit so the user immediately sees a working app
  useEffect(() => {
    handleSearch('photography_daily', true);
  }, []);

  const handleSearch = async (targetUsername?: string, forceDemo?: boolean) => {
    const userToFetch = (targetUsername || usernameInput).trim().replace(/^@/, '');
    if (!userToFetch) return;

    const demoFlag = forceDemo !== undefined ? forceDemo : isDemoMode;

    setSearchedUsername(userToFetch);
    setIsLoadingProfile(true);
    setProfileError(null);
    setProfile(null);
    setStories([]);
    setHighlights([]);
    setPosts([]);
    setPostsNextMaxId(null);
    setReels([]);
    setTabError(null);

    try {
      const res = await fetch(
        `/api/profile?username=${encodeURIComponent(userToFetch)}${demoFlag ? '&demo=true' : ''}`
      );
      const json = await res.json();

      if (!res.ok || !json.success) {
        setProfileError(json.error?.message || 'Failed to retrieve profile');
        setIsLoadingProfile(false);
        return;
      }

      setProfile(json.data);
      setProfileMetadata(json.metadata);

      // Once profile loads, fetch active tab data
      fetchTabData(userToFetch, activeTab, demoFlag);
    } catch {
      setProfileError('Network error connecting to API');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchTabData = async (username: string, tab: TabKey, demoFlag: boolean) => {
    setIsLoadingTab(true);
    setTabError(null);

    try {
      const res = await fetch(
        `/api/${tab}?username=${encodeURIComponent(username)}${demoFlag ? '&demo=true' : ''}`
      );
      const json = await res.json();

      if (!res.ok || !json.success) {
        setTabError({
          code: json.error?.code,
          message: json.error?.message || `Failed to retrieve ${tab}`,
        });
        return;
      }

      if (tab === 'stories') setStories(json.data || []);
      if (tab === 'highlights') setHighlights(json.data || []);
      if (tab === 'posts') {
        setPosts(json.data || []);
        setPostsNextMaxId(json.metadata?.nextMaxId || null);
      }
      if (tab === 'reels') setReels(json.data || []);
    } catch {
      setTabError({ message: `Network error retrieving ${tab}` });
    } finally {
      setIsLoadingTab(false);
    }
  };

  const handleLoadMorePosts = async () => {
    if (!searchedUsername || !postsNextMaxId || isLoadingMorePosts) return;
    setIsLoadingMorePosts(true);

    try {
      const res = await fetch(
        `/api/posts?username=${encodeURIComponent(searchedUsername)}&maxId=${encodeURIComponent(postsNextMaxId)}${isDemoMode ? '&demo=true' : ''}`
      );
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setPosts((prev) => [...prev, ...json.data]);
        setPostsNextMaxId(json.metadata?.nextMaxId || null);
      }
    } catch {
      console.error('Failed to load more posts');
    } finally {
      setIsLoadingMorePosts(false);
    }
  };

  const handleTabChange = (newTab: TabKey) => {
    setActiveTab(newTab);
    if (!searchedUsername) return;

    // Check if we already have data loaded for this tab
    const hasData =
      (newTab === 'stories' && stories.length > 0) ||
      (newTab === 'highlights' && highlights.length > 0) ||
      (newTab === 'posts' && posts.length > 0) ||
      (newTab === 'reels' && reels.length > 0);

    if (!hasData) {
      fetchTabData(searchedUsername, newTab, isDemoMode);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              InstaView <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono font-normal">v1.0-backend</span>
            </span>
            <span className="text-xs text-gray-400 hidden md:inline">| Anonymous Public Instagram Media Viewer</span>
          </div>

          {/* Quick Demo Mode Switch */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                const nextState = !isDemoMode;
                setIsDemoMode(nextState);
                if (searchedUsername) {
                  handleSearch(searchedUsername, nextState);
                }
              }}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-medium transition-colors border ${
                isDemoMode
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isDemoMode ? 'Demo Mode Active' : 'Enable Demo Mode'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 flex-1">
        {/* Search Input Box */}
        <div className="bg-white border border-gray-200 rounded p-4 mb-6 shadow-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                @
              </span>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter public username, e.g. instagram or natgeo"
                className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingProfile}
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoadingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Retrieving...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  View Public Profile
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
            <span>Quick test:</span>
            <button
              type="button"
              onClick={() => {
                setUsernameInput('instagram');
                setIsDemoMode(false);
                handleSearch('instagram', false);
              }}
              className="text-blue-600 hover:underline font-mono"
            >
              @instagram (Live SSR)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setUsernameInput('natgeo');
                setIsDemoMode(false);
                handleSearch('natgeo', false);
              }}
              className="text-blue-600 hover:underline font-mono"
            >
              @natgeo (Live SSR)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setUsernameInput('photography_daily');
                setIsDemoMode(true);
                handleSearch('photography_daily', true);
              }}
              className="text-amber-700 hover:underline font-mono font-medium"
            >
              @photography_daily (Full Demo Media & Video)
            </button>
          </div>
        </div>

        {/* Profile Error Banner */}
        {profileError && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded text-red-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Retrieval Error: </strong>
              <span>{profileError}</span>
              <p className="text-xs text-red-700 mt-1">
                Make sure the profile is public and exists. If rate-limited, switch to Demo Mode to test media components.
              </p>
            </div>
          </div>
        )}

        {/* Profile Content */}
        {profile && (
          <div>
            <ProfileHeader profile={profile} metadata={profileMetadata} />

            <TabsNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
              counts={{
                stories: stories.length || undefined,
                highlights: highlights.length || undefined,
                posts: posts.length || undefined,
                reels: reels.length || undefined,
              }}
            />

            {/* Tab Loading Spinner */}
            {isLoadingTab && (
              <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-gray-800" />
                <p className="text-sm font-medium">Retrieving {activeTab} media...</p>
              </div>
            )}

            {/* Tab Specific Error / Unsupported Notice */}
            {!isLoadingTab && tabError && (
              <div className="bg-white border border-gray-200 rounded p-8 text-center">
                <Info className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {tabError.code === 'UNSUPPORTED_FEATURE'
                    ? 'Authenticated Provider Required for Live Stories/Reels'
                    : 'Notice'}
                </h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto mb-4 leading-relaxed">
                  {tabError.message}
                </p>

                {tabError.code === 'UNSUPPORTED_FEATURE' && (
                  <button
                    onClick={() => {
                      setIsDemoMode(true);
                      handleSearch(searchedUsername, true);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load with Demo Media to Test Video Playback & Downloads
                  </button>
                )}
              </div>
            )}

            {/* Tab Content Display */}
            {!isLoadingTab && !tabError && (
              <div>
                {activeTab === 'stories' && (
                  <StoriesList stories={stories} username={searchedUsername} />
                )}
                {activeTab === 'highlights' && (
                  <HighlightsViewer highlights={highlights} />
                )}
                {activeTab === 'posts' && (
                  <PostsGrid
                    posts={posts}
                    username={searchedUsername}
                    hasMore={Boolean(postsNextMaxId)}
                    isLoadingMore={isLoadingMorePosts}
                    onLoadMore={handleLoadMorePosts}
                  />
                )}
                {activeTab === 'reels' && (
                  <ReelsGrid reels={reels} username={searchedUsername} />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 px-4 border-t border-gray-200 bg-white text-center text-xs text-gray-500">
        <p>
          Anonymous Public Instagram Media Viewer • Strictly respects Meta access boundaries.
          Does not access private accounts or bypass authentication.
        </p>
      </footer>
    </div>
  );
}
