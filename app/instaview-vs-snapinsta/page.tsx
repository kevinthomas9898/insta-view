import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'InstaView vs Snapinsta — The Best Free Snapinsta Alternative',
  description:
    'Snapinsta not working or down? Switch to InstaView, the fastest, ad-clean, and 100% anonymous Snapinsta alternative for viewing and downloading Instagram Stories, Reels, and Posts in HD.',
  keywords: [
    'snapinsta alternative',
    'snapinsta not working',
    'snapinsta down',
    'instaview vs snapinsta',
    'snapinsta',
    'snap insta',
    'snapinsta app',
    'download instagram reels snapinsta',
    'instagram downloader like snapinsta',
  ],
  alternates: {
    canonical: '/instaview-vs-snapinsta',
  },
  openGraph: {
    title: 'InstaView vs Snapinsta — The Best Free Snapinsta Alternative',
    description:
      'Snapinsta not working or down? Switch to InstaView, the fastest and 100% anonymous Snapinsta alternative.',
    url: 'https://ig-storyviewer.vercel.app/instaview-vs-snapinsta',
  },
};

export default function SnapinstaComparisonPage() {
  return (
    <InstaViewer
      initialTab="stories"
      heroBadge="The #1 Verified Snapinsta Alternative"
      heroTitle="InstaView vs Snapinsta — "
      heroHighlight="Faster, Safer, 100% Anonymous"
      heroDescription="Is Snapinsta slow or throwing server errors? InstaView delivers instant, military-grade stealth viewing and 1080p video downloads with zero invasive redirects or login requirements."
      searchPlaceholder="Enter username to view and download stories, reels & posts..."
    />
  );
}
