import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Instagram Reels Audio Downloader',
  description:
    'Extract and download high-quality audio tracks, original music, and voiceovers from any Instagram Reel or Video in clean M4A/MP3 format with zero quality loss.',
  keywords: [
    'instagram reels audio downloader',
    'download reel audio',
    'extract audio from instagram reel',
    'instagram to mp3 audio',
    'save instagram reel music',
    'reels sound downloader',
    'instagram audio track download m4a',
  ],
  alternates: {
    canonical: '/reels-audio-downloader',
  },
  openGraph: {
    title: 'Instagram Reels Audio Downloader | InstaView',
    description:
      'Extract and download high-quality audio tracks, original music, and voiceovers from any Instagram Reel in clean M4A format.',
    url: 'https://ig-storyviewer.vercel.app/reels-audio-downloader',
  },
};

export default function ReelsAudioDownloaderPage() {
  return (
    <InstaViewer
      initialTab="reels"
      heroBadge="Direct Instagram Reel Audio Extractor"
      heroTitle="Extract Reel Audio "
      heroHighlight="in Studio Quality M4A"
      heroDescription="Extract background music, trending sounds, and creator voiceovers directly from Instagram Reels in high-bitrate M4A audio. 100% free with no conversion wait time."
      searchPlaceholder="Enter username or paste Reel link to extract audio..."
    />
  );
}
