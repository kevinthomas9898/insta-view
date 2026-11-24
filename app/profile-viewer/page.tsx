import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Anonymous Instagram Profile Viewer — InstaView',
  description:
    'Inspect any public Instagram profile anonymously. View biography, follower metrics, post counts, and download full-size HD profile pictures without an account.',
  alternates: {
    canonical: '/profile-viewer',
  },
  openGraph: {
    title: 'Anonymous Instagram Profile Viewer — InstaView',
    description:
      'Inspect any public Instagram profile anonymously. View biography, follower metrics, and full-size HD profile pictures.',
    url: 'https://ig-storyviewer.vercel.app/profile-viewer',
  },
};

export default function ProfileViewerPage() {
  return (
    <InstaViewer
      initialTab="stories"
      heroBadge="Stealth Profile & DP Inspector"
      heroTitle="Anonymous Instagram "
      heroHighlight="Profile Viewer"
      heroDescription="Check full biographies, follower metrics, account verification status, and zoom in on full-resolution profile pictures without leaving any trace or logging into Meta."
      searchPlaceholder="Enter username or instagram.com/profile link..."
    />
  );
}
