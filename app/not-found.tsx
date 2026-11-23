import Link from 'next/link';
import { EyeOff, Home, Film, Sparkles, Video, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col justify-between font-sans">
      {/* Minimal Header */}
      <header className="px-6 py-4 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-rose-950/20 group-hover:scale-105 transition-transform">
              <EyeOff className="w-4 h-4 text-white" strokeWidth={1.75} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Insta<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">View</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>404 — Page Not Found</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            Looks like you went completely{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">
              Incognito
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-8">
            The page you are looking for doesn&apos;t exist, has been moved, or the link has a typo. Choose a tool below to continue browsing anonymously.
          </p>

          {/* Quick Tool Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-8">
            <Link
              href="/"
              className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 hover:border-pink-500/50 shadow-xs hover:shadow-md transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  InstaView Home
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Main search tool</p>
              </div>
            </Link>

            <Link
              href="/stories"
              className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 hover:border-pink-500/50 shadow-xs hover:shadow-md transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  Story Viewer
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Watch stories secretly</p>
              </div>
            </Link>

            <Link
              href="/reels"
              className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 hover:border-pink-500/50 shadow-xs hover:shadow-md transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  Reels Downloader
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Download HD MP4 video</p>
              </div>
            </Link>

            <Link
              href="/instagram-to-mp4"
              className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 hover:border-pink-500/50 shadow-xs hover:shadow-md transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  Instagram to MP4
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">1080p video converter</p>
              </div>
            </Link>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-opacity cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="py-6 border-t border-slate-200/80 dark:border-zinc-800/80 text-center text-xs text-slate-500 dark:text-zinc-500">
        <p>&copy; 2026 InstaView. All rights reserved. 100% Anonymous & Secure.</p>
      </footer>
    </div>
  );
}
