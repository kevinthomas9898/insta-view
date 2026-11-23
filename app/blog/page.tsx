import type { Metadata } from 'next';
import Link from 'next/link';
import { EyeOff, ArrowLeft, BookOpen, Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BLOG_POSTS } from '@/lib/data/blog';

export const metadata: Metadata = {
  title: 'Blog & Instagram Privacy Guides — InstaView',
  description:
    'Guides, tutorials, and security analysis on anonymous Instagram viewing, story privacy, and media downloads.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog & Instagram Privacy Guides — InstaView',
    description:
      'Guides, tutorials, and security analysis on anonymous Instagram viewing and story privacy.',
    url: 'https://instagram-free-anonymous-viewer.vercel.app/blog',
  },
};

export default function BlogHubPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-rose-950/20 group-hover:scale-105 transition-transform">
              <EyeOff className="w-4 h-4 text-white" strokeWidth={1.75} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Insta<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">View</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Viewer</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-8 flex-1">
        <div className="text-center my-6 sm:my-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-pink-600 dark:text-pink-400 font-semibold mb-3 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Base & Editorial Hub
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Guides, Privacy &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">
              Tutorials
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            In-depth guides on Instagram security, public CDN architecture, and how to watch and save public social media completely anonymously.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 hover:border-pink-500/40 hover:shadow-lg transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400 font-semibold">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-zinc-500 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.publishedAt}
                </span>
                <span className="font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read Guide
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Search CTA Box */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 border border-pink-500/20 text-center">
          <Sparkles className="w-8 h-8 mx-auto text-pink-500 mb-2 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ready to browse Instagram anonymously?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto mb-4">
            Type any public handle to watch active 24-hour stories, highlights, and reels in full HD with zero trace.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg hover:opacity-95 transition-opacity"
          >
            Launch Anonymous Viewer
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-zinc-500">
        <p>&copy; 2026 InstaView. Free and Anonymous Instagram Viewer.</p>
      </footer>
    </div>
  );
}
