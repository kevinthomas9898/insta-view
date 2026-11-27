import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'InstaView vs InDown Alternative',
  description:
    'InDown not working? Try InstaView, the fastest and most secure InDown alternative. Download Instagram Reels, Stories, Photos, and Highlights in original 1080p MP4 and JPEG quality.',
  keywords: [
    'indown alternative',
    'indown not working',
    'indown',
    'in down',
    'instaview vs indown',
    'indown instagram downloader',
    'indown video download',
  ],
  alternates: {
    canonical: '/instaview-vs-indown',
  },
  openGraph: {
    title: 'InstaView vs InDown Alternative | InstaView',
    description:
      'InDown not working? Try InstaView, the fastest InDown alternative. Download Reels and Stories in original HD.',
    url: 'https://ig-storyviewer.vercel.app/instaview-vs-indown',
  },
};

export default function InDownComparisonPage() {
  return (
    <InstaViewer
      initialTab="reels"
      heroBadge="The #1 Verified InDown Alternative"
      heroTitle="InstaView vs InDown — "
      heroHighlight="Zero Ads, Original 1080p Quality"
      heroDescription="Stuck with InDown connection timeouts? InstaView extracts original CDN media streams with lightning speed. Save Reels and Stories in original HD MP4 format with full audio."
      searchPlaceholder="Enter username or link to download like InDown..."
    />
  );
}
