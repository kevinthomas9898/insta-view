import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Instagram to MP4 Converter & Downloader in HD 1080p — InstaView',
  description:
    'Convert and download Instagram Reels, Stories, and Videos to original high-bitrate MP4 with crystal-clear audio. 100% free, fast, anonymous, and no app or login required.',
  keywords: [
    'instagram to mp4',
    'convert instagram to mp4',
    'instagram to mp4 converter',
    'download instagram reels mp4',
    'instagram video to mp4',
    'ig to mp4',
    'save instagram video mp4 1080p',
    'instagram story to mp4',
    'fastdl instagram to mp4',
  ],
  alternates: {
    canonical: '/instagram-to-mp4',
  },
  openGraph: {
    title: 'Instagram to MP4 Converter & Downloader in HD 1080p — InstaView',
    description:
      'Convert and download Instagram Reels, Stories, and Videos to high-bitrate MP4 with audio. 100% free and anonymous.',
    url: 'https://ig-storyviewer.vercel.app/instagram-to-mp4',
  },
};

export default function InstagramToMp4Page() {
  return (
    <InstaViewer
      initialTab="reels"
      heroBadge="Direct 1080p / 4K MP4 Video Converter"
      heroTitle="Convert Instagram to "
      heroHighlight="MP4 in Original HD"
      heroDescription="Extract and download Instagram Reels, Stories, and video posts directly to original high-bitrate MP4 files with crystal-clear audio. 100% free, zero compression, and completely anonymous."
      searchPlaceholder="Enter username or paste Instagram link to convert to MP4..."
    />
  );
}
