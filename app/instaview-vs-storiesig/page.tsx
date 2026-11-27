import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'InstaView vs StoriesIG Alternative',
  description:
    'Looking for StoriesIG? InstaView is the most reliable, ad-clean StoriesIG alternative. Watch active Instagram stories, highlights, and reels in full HD with 100% privacy and zero trace.',
  keywords: [
    'storiesig alternative',
    'storiesig not working',
    'storiesig',
    'stories ig',
    'storiesig app',
    'instaview vs storiesig',
    'watch stories anonymously like storiesig',
    'storiesig down',
  ],
  alternates: {
    canonical: '/instaview-vs-storiesig',
  },
  openGraph: {
    title: 'InstaView vs StoriesIG Alternative | InstaView',
    description:
      'Looking for StoriesIG? InstaView is the most reliable StoriesIG alternative. Watch stories and reels anonymously.',
    url: 'https://ig-storyviewer.vercel.app/instaview-vs-storiesig',
  },
};

export default function StoriesIGComparisonPage() {
  return (
    <InstaViewer
      initialTab="stories"
      heroBadge="The #1 Verified StoriesIG Alternative"
      heroTitle="InstaView vs StoriesIG — "
      heroHighlight="Modern, Stealth & Free"
      heroDescription="StoriesIG down or failing to load? InstaView connects directly to edge proxies for zero-buffering playback and HD downloads without any account, app, or footprint."
      searchPlaceholder="Enter username to view stories anonymously like StoriesIG..."
    />
  );
}
