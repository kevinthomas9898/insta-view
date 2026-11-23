import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Instagram Highlights Viewer & Downloader — InstaView',
  description:
    'Browse and download public Instagram story highlights without logging in. View archived story collections, album covers, and full slides in high quality.',
  alternates: {
    canonical: '/highlights',
  },
  openGraph: {
    title: 'Instagram Highlights Viewer & Downloader — InstaView',
    description:
      'Browse and download public Instagram story highlights without logging in. View archived story collections in high quality.',
    url: 'https://instagram-free-anonymous-viewer.vercel.app/highlights',
  },
};

export default function HighlightsPage() {
  return (
    <InstaViewer
      initialTab="highlights"
      heroBadge="Permanent Story Highlights Archive"
      heroTitle="Instagram Highlights "
      heroHighlight="Viewer & Downloader"
      heroDescription="Explore public story highlight albums curated by creators. Watch full story slides beyond the 24-hour limit and download high-resolution videos and photos directly to your device."
      searchPlaceholder="Enter username to view highlight albums..."
    />
  );
}
