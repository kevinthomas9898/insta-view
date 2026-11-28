import type { Metadata } from 'next';
import { InstaViewer } from '@/components/InstaViewer';

export const metadata: Metadata = {
  title: 'Instagram Reel Transcriber',
  description:
    'Transcribe Instagram Reels to text with AI. Paste any public Reel link to extract spoken dialogue, generate timestamped subtitles, and copy transcripts for free.',
  keywords: [
    'instagram reel transcriber',
    'transcribe instagram reel',
    'instagram reel to text',
    'reel audio to text converter',
    'instagram video transcript generator',
    'extract text from instagram reel',
    'reel subtitles srt download',
    'instagram speech to text',
  ],
  alternates: {
    canonical: '/reel-transcriber',
  },
  openGraph: {
    title: 'Instagram Reel Transcriber | InstaView',
    description:
      'Transcribe Instagram Reels to text with AI. Extract spoken dialogue and copy transcripts for free.',
    url: 'https://ig-storyviewer.vercel.app/reel-transcriber',
  },
};

export default function ReelTranscriberPage() {
  return (
    <InstaViewer
      initialTab="reels"
      heroBadge="Free AI Speech-to-Text Reel Transcriber"
      heroTitle="Transcribe Instagram Reels "
      heroHighlight="to Text & Subtitles"
      heroDescription="Paste any public Instagram Reel link to automatically transcribe spoken words, generate time-coded subtitles (.SRT), and copy text transcripts instantly. 100% free with no login required."
      searchPlaceholder="Paste Reel link (e.g. instagram.com/reel/...) to transcribe..."
    />
  );
}
