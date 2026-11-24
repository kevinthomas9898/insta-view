import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'IGAnony — Anonymous Instagram Story Viewer & Best IGAnony Alternative',
  description:
    'Looking for IGAnony? Use InstaView, the fastest and most reliable free IGAnony replacement. Watch public Instagram stories, highlights, and reels 100% anonymously with zero login.',
  keywords: [
    'iganony',
    'ig anony',
    'iganony alternative',
    'iganony instagram viewer',
    'iganony not working',
    'iganony stories',
    'watch stories anonymously',
    'anonyig',
    'storiesig',
  ],
  alternates: {
    canonical: '/iganony',
  },
  openGraph: {
    title: 'IGAnony — Anonymous Instagram Story Viewer & Best Alternative',
    description:
      'Fastest and most reliable free IGAnony replacement. Watch Instagram stories and reels anonymously.',
    url: 'https://ig-storyviewer.vercel.app/iganony',
  },
};

export default function IGAnonyPage() {
  return (
    <InstaViewer
      initialTab="stories"
      heroBadge="The #1 Verified IGAnony Replacement"
      heroTitle="IGAnony — Watch Instagram Stories "
      heroHighlight="Anonymously"
      heroDescription="Looking for IGAnony? InstaView is the modern, lightning-fast replacement. Watch public stories, highlights, and reels in full HD with zero trace and no login required."
      searchPlaceholder="Enter username to view stories anonymously like IGAnony..."
    />
  );
}
