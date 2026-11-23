/**
 * Returns the canonical base URL for the deployment.
 * Supports custom domain, Vercel environment variables, and defaults to user's active deployment.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  return 'https://instagram-free-anonymous-viewer.vercel.app';
}
