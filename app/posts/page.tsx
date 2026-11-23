import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Instagram Posts & Photo Viewer — InstaView',
  description:
    'Browse public Instagram feed posts, multi-slide carousels, and high-resolution photos without an account. Download original quality images and videos freely.',
  alternates: {
    canonical: '/posts',
  },
  openGraph: {
    title: 'Instagram Posts & Photo Viewer — InstaView',
    description:
      'Browse public Instagram feed posts, multi-slide carousels, and high-resolution photos without an account.',
    url: 'https://instagram-free-anonymous-viewer.vercel.app/posts',
  },
};

export default function PostsPage() {
  return (
    <InstaViewer
      initialTab="posts"
      heroBadge="Timeline Posts & Carousel Gallery"
      heroTitle="Explore Instagram Posts "
      heroHighlight="& High-Res Photos"
      heroDescription="View public Instagram timeline posts with full captions, like counts, and carousel slide navigation. Save original quality full-resolution JPGs and videos with zero compression."
      searchPlaceholder="Enter username to browse feed posts..."
    />
  );
}
