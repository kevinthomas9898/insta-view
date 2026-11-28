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
  const jsonLdHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Transcribe Instagram Reels to Text for Free',
    description: 'Convert spoken dialogue and lyrics from any Instagram Reel into text and subtitles.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Step 1: Copy Instagram Reel Link',
        text: 'Copy the URL of any public Instagram Reel from your app or browser.',
      },
      {
        '@type': 'HowToStep',
        name: 'Step 2: Paste URL into Transcriber',
        text: 'Paste the Reel link into the InstaView Reel Transcriber search box and click View Anonymously.',
      },
      {
        '@type': 'HowToStep',
        name: 'Step 3: Extract & Copy Transcript',
        text: 'Click the Text action button to generate time-coded text, copy the script, or download .SRT subtitles.',
      },
    ],
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I transcribe an Instagram Reel to text for free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Paste the Instagram Reel link into InstaView. Our AI speech recognition automatically extracts the spoken dialogue into readable text and timestamps.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I download subtitles (.SRT) from an Instagram Reel?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Once transcribed, click Download .SRT to export time-coded subtitles for video editors like Premiere Pro and CapCut.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the Instagram Reel Transcriber free with no login?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, 100% free with no Instagram account, software installation, or credit card required.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <InstaViewer
        initialTab="reels"
        autoTranscribe={true}
        heroBadge="Free AI Speech-to-Text Reel Transcriber"
        heroTitle="Transcribe Instagram Reels "
        heroHighlight="to Text & Subtitles"
        heroDescription="Paste any public Instagram Reel link to automatically transcribe spoken words, generate time-coded subtitles (.SRT), and copy text transcripts instantly. 100% free with no login required."
        searchPlaceholder="Paste Reel link (e.g. instagram.com/reel/...) to transcribe..."
      />
    </>
  );
}
