import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Anonymous Instagram Story Viewer — Watch Stories Without An Account',
  description:
    'Watch active 24-hour Instagram stories 100% anonymously. The creator will never see your name in the seen list. No account or login required. Download high-res stories in HD.',
  alternates: {
    canonical: '/stories',
  },
  openGraph: {
    title: 'Anonymous Instagram Story Viewer — Watch Stories Without An Account',
    description:
      'Watch active 24-hour Instagram stories 100% anonymously. The creator will never see your name in the seen list.',
    url: 'https://ig-storyviewer.vercel.app/stories',
  },
};

export default function StoriesPage() {
  return (
    <InstaViewer
      initialTab="stories"
      heroBadge="100% Stealth Story Viewer"
      heroTitle="Watch Instagram Stories "
      heroHighlight="Without An Account"
      heroDescription="Enter any public Instagram handle to view active 24-hour stories anonymously. Never appear in their viewer list, leave no traces, and download photos or video stories in original HD."
      searchPlaceholder="Enter username to view stories anonymously..."
    />
  );
}
