import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Anonymous Instagram Story Viewer & Downloader — InstaView',
  description:
    'Watch Instagram stories, highlights, reels, and posts anonymously without an account or login. Download HD media securely with 100% privacy and zero trace.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return <InstaViewer initialTab="stories" />;
}
