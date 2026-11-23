'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LANGUAGES, SUPPORTED_LANGS } from '@/lib/i18n/translations';
import { AdSlot } from '@/components/AdSlot';
import {
  Search,
  Loader2,
  AlertCircle,
  EyeOff,
  Download,
  Smartphone,
  Lock,
  ChevronDown,
  Sparkles,
  PlaySquare,
  Bookmark,
  Grid,
  Film,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

import { FAQ_ITEMS, type FaqItem } from '@/lib/data/faq';

const POPULAR_SUGGESTIONS = [
  'cristiano',
  'leomessi',
  'selenagomez',
  'natgeo',
  'nasa',
  'shraddhakapoor',
];

export interface InstaViewerProps {
  initialTab?: TabKey;
  lang?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroHighlight?: string;
  heroDescription?: string;
  searchPlaceholder?: string;
}

export function InstaViewer({
  initialTab = 'stories',
  lang = 'en',
  heroBadge = 'Next-Gen Stealth Instagram Media Viewer & Downloader',
  heroTitle = 'Watch Instagram Stories ',
  heroHighlight = 'Anonymously',
  heroDescription = 'View public Instagram stories, highlights, reels, and posts without an account or login. Save high-definition photos and MP4 videos with 100% privacy and zero digital footprint.',
  searchPlaceholder = 'Enter username or instagram.com/profile...',
}: InstaViewerProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [searchedUsername, setSearchedUsername] = useState('');

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileMetadata, setProfileMetadata] = useState<ProviderMetadata | undefined>(undefined);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const [stories, setStories] = useState<StoryResult[]>([]);
  const [highlights, setHighlights] = useState<HighlightResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [reels, setReels] = useState<ReelResult[]>([]);

  const [tabError, setTabError] = useState<{ code?: string; message: string } | null>(null);

  const [postsNextMaxId, setPostsNextMaxId] = useState<string | null>(null);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const cleanUsername = (input: string) => {
    let cleaned = input.trim();
    cleaned = cleaned.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
    cleaned = cleaned.replace(/\/.*$/, '');
    cleaned = cleaned.replace(/^@/, '');
    return cleaned;
  };

  const handleSearch = async (targetUsername?: string) => {
    const raw = targetUsername || usernameInput;
    const userToFetch = cleanUsername(raw);
    if (!userToFetch) return;

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
      const res = await fetch(`/api/profile?username=${encodeURIComponent(userToFetch)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setProfileError(json.error?.message || 'Target profile or content not found');
        setIsLoadingProfile(false);
        return;
      }

      setProfile(json.data);
      setProfileMetadata(json.metadata);

      // Once profile loads, automatically fetch active tab data
      fetchTabData(userToFetch, activeTab);
    } catch {
      setProfileError('Network error connecting to Instagram service. Please try again.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchTabData = async (username: string, tab: TabKey) => {
    setIsLoadingTab(true);
    setTabError(null);

    try {
      const res = await fetch(`/api/${tab}?username=${encodeURIComponent(username)}`);
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
        `/api/posts?username=${encodeURIComponent(searchedUsername)}&maxId=${encodeURIComponent(postsNextMaxId)}`
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

    const hasData =
      (newTab === 'stories' && stories.length > 0) ||
      (newTab === 'highlights' && highlights.length > 0) ||
      (newTab === 'posts' && posts.length > 0) ||
      (newTab === 'reels' && reels.length > 0);

    if (!hasData) {
      fetchTabData(searchedUsername, newTab);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header with Navigation and Dark / Light Switch */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 group cursor-pointer"
              onClick={() => {
                if (profile) {
                  setProfile(null);
                  setSearchedUsername('');
                  setUsernameInput('');
                }
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-rose-950/20 group-hover:scale-105 transition-transform">
                <EyeOff className="w-4 h-4 text-white" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Insta<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">View</span>
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-zinc-400">
              <Link href="/stories" className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors">
                Stories
              </Link>
              <Link href="/highlights" className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors">
                Highlights
              </Link>
              <Link href="/reels" className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors">
                Reels
              </Link>
              <Link href="/posts" className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors">
                Posts
              </Link>
              <Link href="/profile-viewer" className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors">
                Profile
              </Link>
              <Link href="/blog" className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors">
                Blog
              </Link>
              <Link href="/faq" className="px-3 py-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors">
                FAQ
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              100% Anonymous
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 hidden md:inline-flex">
              No Login Required
            </span>

            {/* Language Selector Dropdown */}
            <LanguageSelector currentLang={lang} />

            {/* Dark / Light Mode Switch Option */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Desktop Left Skyscraper Ad (Screens >= 1536px, Auto-Hidden on Mobile/Tablets to preserve 100% mobile UX) */}
      <aside aria-label="Advertisement" className="hidden 2xl:block fixed left-4 top-24 z-20 w-[160px] h-[600px] pointer-events-auto">
        <div className="w-full h-full rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-1.5 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
            Ad
          </span>
          <div id="container-desktop-left-ad" className="w-[160px] h-[600px] flex items-center justify-center" />
        </div>
      </aside>

      {/* Desktop Right Skyscraper Ad (Screens >= 1536px, Auto-Hidden on Mobile/Tablets to preserve 100% mobile UX) */}
      <aside aria-label="Advertisement" className="hidden 2xl:block fixed right-4 top-24 z-20 w-[160px] h-[600px] pointer-events-auto">
        <div className="w-full h-full rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-1.5 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
            Ad
          </span>
          <div id="container-desktop-right-ad" className="w-[160px] h-[600px] flex items-center justify-center" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-2 sm:pt-4 pb-12 flex-1 flex flex-col">
        {/* Hero & Search Section */}
        <section className={`transition-all duration-300 ${profile ? 'mb-4' : 'my-2 sm:my-4 text-center'}`}>
          {!profile && (
            <div className="max-w-3xl mx-auto mb-3 sm:mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 font-medium mb-2.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>{heroBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2 sm:mb-2.5">
                {heroTitle}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">
                  {heroHighlight}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
                {heroDescription}
              </p>
            </div>
          )}

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="relative flex flex-col sm:flex-row gap-2 p-1.5 sm:p-2 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 focus-within:border-pink-500/80 focus-within:ring-2 focus-within:ring-pink-500/20 rounded-2xl shadow-lg dark:shadow-2xl backdrop-blur-md transition-all"
            >
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-4 text-slate-400 dark:text-zinc-500 font-bold text-base">@</span>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder={searchPlaceholder}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoadingProfile}
                className="px-6 py-2.5 sm:py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-950/20 dark:shadow-rose-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoadingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>View Anonymously</span>
                  </>
                )}
              </button>
            </form>

            {/* Popular / Trending Suggestions */}
            <div className="mt-2.5 flex items-center justify-center gap-1.5 sm:gap-2 text-xs text-slate-500 dark:text-zinc-500 flex-wrap">
              <span className="font-medium text-slate-600 dark:text-zinc-400 text-[11px] sm:text-xs">Popular:</span>
              {POPULAR_SUGGESTIONS.map((user) => (
                <button
                  key={user}
                  type="button"
                  onClick={() => {
                    setUsernameInput(user);
                    handleSearch(user);
                  }}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800/80 transition-colors cursor-pointer text-[11px] sm:text-xs font-medium shadow-2xs"
                >
                  @{user}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Strategic Monetization Ad Slot (Homepage under search; moves into feed when profile loaded) */}
        {!profile && (
          <AdSlot id="container-4ff02455261b1454e019ced3534847d2" />
        )}

        {/* Profile Error Banner */}
        {profileError && (
          <div className="max-w-2xl mx-auto w-full p-4 mb-8 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 rounded-2xl text-rose-900 dark:text-rose-200 text-sm flex items-start gap-3 backdrop-blur-sm animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-rose-950 dark:text-rose-100">Unable to retrieve profile: </strong>
              <span>{profileError}</span>
              <p className="text-xs text-rose-700 dark:text-rose-300/80 mt-1.5 leading-relaxed">
                Please verify that the username is spelled correctly and the account is public. Private Instagram accounts cannot be accessed.
              </p>
            </div>
          </div>
        )}

        {/* Active Profile Results */}
        {profile && (
          <div className="w-full animate-fade-in">
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
              <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-16 text-center text-slate-500 dark:text-zinc-400 flex flex-col items-center justify-center gap-3 backdrop-blur-sm shadow-xs">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-200">
                  Retrieving {activeTab} media anonymously...
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-500">Connecting to secure proxy mirror</p>
              </div>
            )}

            {/* Tab Specific Notice / Error */}
            {!isLoadingTab && tabError && (
              <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center backdrop-blur-sm shadow-xs">
                <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base mb-1">
                  Content Notice
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {tabError.message}
                </p>
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

        {/* Informational SEO & AEO Content Sections (Visible on Home & for Crawlers) */}
        {!profile && (
          <div className="mt-12 space-y-16">
            {/* Features Grid */}
            <section id="features">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Why InstaView Ranks #1 for Anonymous Viewing
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-xl mx-auto">
                  Engineered with military-grade proxy routing and direct CDN media streaming for maximum privacy and speed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-500/20 flex items-center justify-center mb-4">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">100% Anonymous</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Watch stories in stealth mode. The creator will never see your username in their viewer list. No traces or digital footprints left behind.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Zero Login Required</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Never risk your account. No Instagram credentials, passwords, or app installations needed. Browse all public accounts freely.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4">
                    <Download className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Original HD Downloads</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Save photos, reels, and stories in full original resolution (1080p and 4K MP4) directly to your device without quality compression.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">All Devices & OS</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Optimized for lightning-fast playback on iOS (iPhone/iPad), Android, macOS, Windows, and Linux. No app downloads required.
                  </p>
                </div>
              </div>
            </section>

            {/* How It Works (HowTo 3 Steps) */}
            <section id="how-it-works" className="bg-slate-100/80 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-sm">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  How to View Instagram Stories Anonymously
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2">
                  Three simple steps to watch and download any public Instagram media in complete privacy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold flex items-center justify-center mb-4 text-sm shadow-md shadow-rose-950/20">
                    1
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Enter Username</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Type any public Instagram username into the search bar (e.g. <span className="text-slate-800 dark:text-zinc-200 font-mono">cristiano</span>) or paste the complete profile link.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold flex items-center justify-center mb-4 text-sm shadow-md shadow-amber-950/20">
                    2
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Select Stories or Reels</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Browse active 24-hour Stories, permanent Highlights, timeline Posts, and Reels with interactive fullscreen previews.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-emerald-600 text-white font-bold flex items-center justify-center mb-4 text-sm shadow-md shadow-emerald-950/20">
                    3
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">View & Download in HD</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Watch videos smoothly without buffering. Click the Download icon to save original resolution files directly to your gallery or files.
                  </p>
                </div>
              </div>
            </section>

            {/* Media Types Breakdown */}
            <section>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Comprehensive Instagram Content Support
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-xl mx-auto">
                  InstaView supports every major public media format on Instagram with native video streaming and direct downloads.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/stories" className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-pink-500/40 transition-colors block">
                  <div className="flex items-center gap-2 mb-2">
                    <PlaySquare className="w-5 h-5 text-pink-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Instagram Stories</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Watch disappearing 24-hour photos and video stories without showing up in the seen list.
                  </p>
                </Link>

                <Link href="/highlights" className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-amber-500/40 transition-colors block">
                  <div className="flex items-center gap-2 mb-2">
                    <Bookmark className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Profile Highlights</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Access permanent archived story collections with their original album covers and titles.
                  </p>
                </Link>

                <Link href="/posts" className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-rose-500/40 transition-colors block">
                  <div className="flex items-center gap-2 mb-2">
                    <Grid className="w-5 h-5 text-rose-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Posts & Carousels</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Browse full timeline posts with captions, like counts, comment counts, and multi-slide carousel albums.
                  </p>
                </Link>

                <Link href="/reels" className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-fuchsia-500/40 transition-colors block">
                  <div className="flex items-center gap-2 mb-2">
                    <Film className="w-5 h-5 text-fuchsia-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Instagram Reels</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Watch trending short videos in full screen with audio and download high-bitrate MP4s instantly.
                  </p>
                </Link>
              </div>
            </section>

            {/* Comprehensive FAQ & Recently Asked Questions Accordion */}
            <section id="faq" className="max-w-4xl mx-auto w-full">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-pink-600 dark:text-pink-400 font-semibold mb-2 shadow-2xs">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Frequently Asked Questions
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Everything You Need to Know About Anonymous Viewing
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2">
                  Answers to the most common questions regarding privacy, downloads, and how InstaView works.
                </p>
              </div>

              <div className="space-y-3">
                {FAQ_ITEMS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 rounded-2xl overflow-hidden transition-colors hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                      >
                        <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 font-mono font-normal hidden sm:inline">
                            Q{idx + 1}
                          </span>
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 dark:text-zinc-400 flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-pink-500' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800/60 animate-fade-in">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Comprehensive SEO Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-12 px-4 sm:px-8 text-xs text-slate-500 dark:text-zinc-400 transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand & Summary */}
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 flex items-center justify-center">
                  <EyeOff className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                </div>
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  Insta<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">View</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                The fastest, 100% anonymous public Instagram viewer. Browse and download stories, highlights, posts, and reels in original HD quality without logging in.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Logins · Zero Footprints</span>
              </div>
            </div>

            {/* Col 2: Free Tools */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-200 mb-3 tracking-tight">Free Instagram Tools</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/stories" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Instagram Story Viewer
                  </Link>
                </li>
                <li>
                  <Link href="/highlights" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Instagram Highlights Viewer
                  </Link>
                </li>
                <li>
                  <Link href="/reels" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Instagram Reels Downloader
                  </Link>
                </li>
                <li>
                  <Link href="/posts" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Instagram Posts Viewer
                  </Link>
                </li>
                <li>
                  <Link href="/profile-viewer" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Anonymous Profile Viewer
                  </Link>
                </li>
                <li>
                  <Link href="/story-saver" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Story Saver Online
                  </Link>
                </li>
                <li>
                  <Link href="/instagram-to-mp4" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Instagram to MP4 Converter
                  </Link>
                </li>
                <li>
                  <Link href="/iganony" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    IGAnony Alternative
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Resources & Guides */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-200 mb-3 tracking-tight">Comparisons & Guides</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Editorial Blog & Guides
                  </Link>
                </li>
                <li>
                  <Link href="/instaview-vs-snapinsta" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    InstaView vs Snapinsta
                  </Link>
                </li>
                <li>
                  <Link href="/instaview-vs-storiesig" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    InstaView vs StoriesIG
                  </Link>
                </li>
                <li>
                  <Link href="/instaview-vs-indown" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    InstaView vs InDown
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    How Anonymous Viewing Works
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Stealth Architecture & Speed
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal & Privacy */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-200 mb-3 tracking-tight">Legal & Trust</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/remove-profile" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium text-rose-600 dark:text-rose-400">
                    Opt-Out (Remove Profile)
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <span className="text-slate-400 dark:text-zinc-500">
                    GDPR & CCPA Compliant
                  </span>
                </li>
                <li>
                  <span className="text-slate-400 dark:text-zinc-500">
                    Public Content Only
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Regional Languages Footer Bar */}
          <div className="py-6 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Languages:</span>
            {SUPPORTED_LANGS.map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800/50"
              >
                <span>{LANGUAGES[l].flag}</span>
                <span>{LANGUAGES[l].name}</span>
              </Link>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 dark:text-zinc-500 text-[11px]">
              &copy; 2026 InstaView. All rights reserved.
            </p>
            <p className="max-w-2xl text-center md:text-right text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed">
              <strong>Disclaimer:</strong> InstaView is an independent web utility and is not affiliated with, authorized, or endorsed by Instagram, Meta Platforms, Inc. All Instagram logos, trademarks, and registered trademarks displayed on this site are property of Meta Platforms, Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
