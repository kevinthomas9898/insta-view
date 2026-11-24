export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Can the account owner see that I viewed their Instagram story?',
    answer:
      'No. Absolutely not. When you view a story through InstaView, our secure cloud servers request the publicly available media directly from Meta’s content delivery network on your behalf. Your personal identity, IP address, and Instagram profile are never transmitted. The user will never see your name in their "Seen by" viewer list.',
    category: 'Privacy & Anonymity',
  },
  {
    question: 'Do I need to log in or create an Instagram account to use InstaView?',
    answer:
      'No account, registration, or password is required. You can watch stories, highlights, and reels 100% anonymously from any web browser without ever signing into Instagram. This ensures your personal account remains completely safe and unlinked.',
    category: 'Usage & Access',
  },
  {
    question: 'Can I view stories or posts from private Instagram accounts?',
    answer:
      'No. InstaView strictly adheres to ethical data standards and Meta access boundaries. We only retrieve media from publicly accessible Instagram profiles. Private profiles are protected by Meta’s end-to-end authentication controls and cannot be viewed anonymously.',
    category: 'Privacy & Anonymity',
  },
  {
    question: 'How do I download Instagram stories, reels, and photos?',
    answer:
      'Simply search for the username, switch to the Stories, Highlights, Posts, or Reels tab, and click the direct Download button on any media card. The media file will save directly to your smartphone, tablet, or desktop computer in original high-definition MP4 or JPG format without watermarks.',
    category: 'Downloads',
  },
  {
    question: 'Can I watch Instagram Highlights after the 24-hour story expires?',
    answer:
      'Yes! Instagram Highlights are saved story albums curated by creators. As long as the profile is public, you can browse all highlight albums, view individual story slides, and download them anytime.',
    category: 'Features',
  },
  {
    question: 'Will the creator receive a notification if I download their content?',
    answer:
      'No. Instagram does not notify users when someone downloads or saves public photos, reels, or stories. All interactions through InstaView remain strictly confidential and untracked.',
    category: 'Privacy & Anonymity',
  },
  {
    question: 'Does InstaView work on iPhone, Android, and PC?',
    answer:
      'Yes. InstaView is a fully responsive Progressive Web App that works seamlessly across all platforms, including iOS (Safari), Android (Chrome, Samsung Internet), macOS, Windows, and Linux.',
    category: 'Usage & Access',
  },
  {
    question: 'Why does an account display "No active stories"?',
    answer:
      'Instagram stories naturally disappear 24 hours after publication. If a user has not posted a new story within the last 24 hours, the Stories tab will indicate that no active stories are available. You can still view their permanent Highlights, Posts, and Reels.',
    category: 'Features',
  },
  {
    question: 'What is the Offline Story Vault and how does it save 24-hour stories?',
    answer:
      'The Offline Story Vault is a proprietary client-side feature that allows you to bookmark and save public Instagram stories directly to your browser’s local IndexedDB database. Once saved to your Vault, you can re-watch video and photo stories forever—even after the original 24-hour expiration window on Instagram. Because storage is 100% on-device, your saved stories remain strictly confidential and are never transmitted to any third-party server.',
    category: 'Features & Privacy',
  },
  {
    question: 'What is the Secret Watchlist and is my bookmark list sent to your servers?',
    answer:
      'The Secret Watchlist lets you pin your favorite Instagram creators for 1-click access without retyping their usernames. Your watchlist is stored 100% locally in your browser’s private storage (localStorage). It is never sent to our servers, never synced with an account, and completely invisible to Meta and profile owners.',
    category: 'Features & Privacy',
  },
];
