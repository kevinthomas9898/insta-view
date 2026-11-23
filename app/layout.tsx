import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Anonymous Instagram Story Viewer & Downloader — InstaView",
    template: "%s | InstaView",
  },
  description:
    "Watch Instagram stories, highlights, reels, and posts anonymously without an account or login. Download HD media securely with 100% privacy and zero trace.",
  keywords: [
    "instagram story viewer",
    "anonymous instagram viewer",
    "watch ig stories anonymously",
    "view instagram without account",
    "instagram highlight viewer",
    "download instagram reels",
    "insta story download",
    "instagram anon viewer",
    "anonyig",
    "storiesig",
    "instanavigation",
    "view instagram stories",
    "instagram profile viewer",
    "instagram viewer online free",
  ],
  authors: [{ name: "InstaView Team" }],
  creator: "InstaView",
  publisher: "InstaView",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://insta-view.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Anonymous Instagram Story Viewer & Downloader — InstaView",
    description:
      "Watch Instagram stories, highlights, and reels 100% anonymously. No account or login required. Download high-resolution media in original HD quality.",
    url: "https://insta-view.vercel.app",
    siteName: "InstaView",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anonymous Instagram Story Viewer & Downloader — InstaView",
    description:
      "Watch Instagram stories, highlights, and reels 100% anonymously. No login needed. Download HD media freely.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "googlee32dff6fdd44e534",
    other: {
      "google-site-verification": [
        "googlee32dff6fdd44e534.html",
        "googlee32dff6fdd44e534",
        "e32dff6fdd44e534",
      ],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdWebApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "InstaView - Anonymous Instagram Viewer",
    "url": "https://insta-view.vercel.app",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description":
      "Free and anonymous Instagram viewer and downloader for stories, highlights, posts, and reels without account login.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "18420",
      "bestRating": "5",
      "worstRating": "1",
    },
    "featureList": [
      "100% Anonymous Instagram story viewing",
      "No Instagram account or login required",
      "Download Instagram Stories, Highlights, Posts, and Reels in HD",
      "Stealth browsing with zero footprint on creator profile",
      "Compatible with iPhone, Android, Mac, and Windows",
    ],
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can someone see if I view their Instagram story using InstaView?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. When you use InstaView, our secure intermediary servers fetch the public media on your behalf. Your personal account, IP address, and identity are never exposed to Meta or the account owner. You will never appear in their 'Seen by' viewers list.",
        },
      },
      {
        "@type": "Question",
        "name": "Do I need an Instagram account or login to use this tool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No registration or login is required. You do not need an Instagram account, password, or third-party extension. Simply type the target username into the search bar to view public stories, highlights, and reels instantly.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I view stories and posts from private Instagram accounts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. InstaView strictly respects Meta privacy policies and security protocols. Only publicly available Instagram profiles can be accessed. Private profiles are protected by Meta's authentication boundaries.",
        },
      },
      {
        "@type": "Question",
        "name": "How do I download Instagram stories and reels in original quality?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Search for the desired public username, navigate to the Stories, Highlights, Posts, or Reels tab, and click the direct Download button on any media item. The file will save directly to your phone or computer in original high-resolution MP4 (video) or JPG (image) format without watermarks.",
        },
      },
      {
        "@type": "Question",
        "name": "Does InstaView work on iPhone, Android, and PC?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, InstaView is a universal web application optimized for all devices and modern web browsers including Safari on iOS, Chrome on Android, Windows, macOS, and Linux.",
        },
      },
      {
        "@type": "Question",
        "name": "Is viewing Instagram stories anonymously safe and legal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, viewing publicly shared content on the internet without logging in is completely safe and legal. InstaView does not record user browsing history, store passwords, or violate Instagram's public content access boundaries.",
        },
      },
    ],
  };

  const jsonLdHowTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to View and Download Instagram Stories Anonymously",
    "description": "Follow these simple steps to view and download Instagram stories, reels, and highlights without an account.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Step 1: Enter Username",
        "text": "Type any public Instagram username into the search bar and click 'View Anonymously'.",
        "url": "https://insta-view.vercel.app#search",
      },
      {
        "@type": "HowToStep",
        "name": "Step 2: Browse Stories & Media",
        "text": "Switch between active 24-Hour Stories, Highlights, Posts, and Reels to watch media in stealth mode.",
        "url": "https://insta-view.vercel.app#browse",
      },
      {
        "@type": "HowToStep",
        "name": "Step 3: Download in Full HD",
        "text": "Click the Download icon on any story, image, or reel to save the high-resolution file directly to your device.",
        "url": "https://insta-view.vercel.app#download",
      },
    ],
  };

  return (
    <html lang="en" className="dark h-full bg-[#09090b] text-zinc-100 antialiased selection:bg-pink-500 selection:text-white">
      <head>
        <meta name="google-site-verification" content="googlee32dff6fdd44e534" />
        <meta name="google-site-verification" content="e32dff6fdd44e534" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
