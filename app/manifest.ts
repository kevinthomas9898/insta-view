import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'InstaView - Anonymous Instagram Story Viewer & Downloader',
    short_name: 'InstaView',
    description:
      'Watch public Instagram stories, highlights, reels, and posts 100% anonymously without an account or login. Download HD media securely.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
  };
}
