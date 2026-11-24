import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Story Saver — Free Anonymous Instagram Story Saver & Downloader',
  description:
    'Save and download Instagram stories anonymously with Story Saver by InstaView. Watch active 24-hour stories and permanent highlights without an account or login.',
  keywords: [
    'story saver',
    'instagram story saver',
    'story saver online',
    'save ig stories',
    'story downloader',
    'story saver for instagram',
    'download instagram stories',
    'ig story saver',
    'fastdl story saver',
  ],
  alternates: {
    canonical: '/story-saver',
  },
  openGraph: {
    title: 'Story Saver — Free Anonymous Instagram Story Saver & Downloader',
    description:
      'Save and download Instagram stories anonymously. Watch active 24-hour stories and highlights without an account.',
    url: 'https://ig-storyviewer.vercel.app/story-saver',
  },
};

export default function StorySaverPage() {
  return (
    <InstaViewer
      initialTab="stories"
      heroBadge="The #1 Free Instagram Story Saver"
      heroTitle="Story Saver — Save Instagram Stories "
      heroHighlight="100% Anonymously"
      heroDescription="Save active 24-hour stories, photo updates, and permanent highlight reels in full original resolution without leaving a trace. No account, login, or software required."
      searchPlaceholder="Enter username to view and save stories anonymously..."
    />
  );
}
