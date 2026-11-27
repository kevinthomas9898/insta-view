import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Instagram DP Downloader (Full HD)',
  description:
    'Download Instagram profile pictures (DP) in full original HD resolution without compression. View profile pictures of public and private accounts anonymously with InstaView.',
  keywords: [
    'instagram dp downloader',
    'download instagram dp',
    'instagram profile picture downloader',
    'view ig dp in full size',
    'insta dp viewer hd',
    'download private ig dp',
    'full size instagram profile pic',
    'instagram avatar download',
    'instadp',
  ],
  alternates: {
    canonical: '/dp-downloader',
  },
  openGraph: {
    title: 'Instagram DP Downloader (Full HD) | InstaView',
    description:
      'View and download full-size Instagram profile pictures (DP) in uncompressed HD resolution. Works for public and private accounts.',
    url: 'https://ig-storyviewer.vercel.app/dp-downloader',
  },
};

export default function DpDownloaderPage() {
  return (
    <InstaViewer
      initialTab="stories"
      heroBadge="1080p Instagram DP & Profile Picture Downloader"
      heroTitle="Download Instagram DP "
      heroHighlight="in Full HD Resolution"
      heroDescription="View and download full-size Instagram profile pictures (DP) anonymously in uncompressed HD quality. Zoom in, inspect uncropped square photos, and save avatars from both public and private profiles."
      searchPlaceholder="Enter username or instagram.com/profile to download DP..."
    />
  );
}
