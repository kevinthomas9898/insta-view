import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Anonymous Instagram Reels Viewer & Downloader — InstaView',
  description:
    'Watch and download Instagram reels in full audio and HD MP4 quality anonymously. No login or app installation required. Save reels directly to phone or PC.',
  alternates: {
    canonical: '/reels',
  },
  openGraph: {
    title: 'Anonymous Instagram Reels Viewer & Downloader — InstaView',
    description:
      'Watch and download Instagram reels in full audio and HD MP4 quality anonymously. No login required.',
    url: 'https://instagram-free-anonymous-viewer.vercel.app/reels',
  },
};

export default function ReelsPage() {
  return (
    <InstaViewer
      initialTab="reels"
      heroBadge="High-Bitrate MP4 Video Downloader"
      heroTitle="Watch & Download "
      heroHighlight="Instagram Reels Anonymously"
      heroDescription="Stream public Instagram reels in crisp HD with full audio track playback. Save original high-bitrate MP4 videos without watermarks to your gallery or downloads folder."
      searchPlaceholder="Enter username or reel link to view and download..."
    />
  );
}
