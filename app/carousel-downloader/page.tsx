import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Instagram Carousel Downloader',
  description:
    'Download entire Instagram carousel albums with multiple photos and videos in original HD quality or as a single ZIP archive. Fast, free, and no login required.',
  keywords: [
    'instagram carousel downloader',
    'download instagram carousel',
    'save multi photo instagram',
    'download instagram slides',
    'instagram album downloader zip',
    'save carousel instagram free',
    'download multiple instagram photos',
  ],
  alternates: {
    canonical: '/carousel-downloader',
  },
  openGraph: {
    title: 'Instagram Carousel Downloader | InstaView',
    description:
      'Download all photos and video slides from any Instagram carousel post in 1-click or as a ZIP archive.',
    url: 'https://ig-storyviewer.vercel.app/carousel-downloader',
  },
};

export default function CarouselDownloaderPage() {
  return (
    <InstaViewer
      initialTab="posts"
      heroBadge="Multi-Photo & Carousel Slide Downloader"
      heroTitle="Download Instagram Carousels "
      heroHighlight="in 1-Click or Bulk ZIP"
      heroDescription="Save all photos, video slides, and multi-media albums from any Instagram carousel post. Download individual slides in high resolution or grab the entire set in a single ZIP file."
      searchPlaceholder="Enter username or paste Instagram carousel link..."
    />
  );
}
