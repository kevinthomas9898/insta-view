import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opt-Out & Profile Removal',
  description: 'Request removal or opt-out of your public Instagram profile from InstaView.',
  alternates: {
    canonical: '/remove-profile',
  },
  openGraph: {
    title: 'Opt-Out & Profile Removal | InstaView',
  },
};

export default function RemoveProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
