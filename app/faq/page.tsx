import type { Metadata } from 'next';
import Link from 'next/link';
import { EyeOff, ArrowLeft, HelpCircle, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FAQ_ITEMS } from '@/lib/data/faq';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions & Guide — InstaView',
  description:
    'Find answers to all your questions about anonymous Instagram story viewing, media downloads, privacy guarantees, and how InstaView protects your anonymity.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions & Guide — InstaView',
    description:
      'Find answers to all your questions about anonymous Instagram story viewing, media downloads, and privacy.',
    url: 'https://instagram-free-anonymous-viewer.vercel.app/faq',
  },
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-rose-950/20 group-hover:scale-105 transition-transform">
              <EyeOff className="w-4 h-4 text-white" />
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
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-8 flex-1">
        <div className="text-center my-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-pink-600 dark:text-pink-400 font-semibold mb-3 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5" />
            Help & Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Frequently Asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">
              Questions
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our privacy technology, how media proxy streaming operates, and how to download stories and reels safely.
          </p>
        </div>

        <div className="space-y-4 my-8">
          {FAQ_ITEMS.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400 font-semibold">
                  {faq.category || 'General'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
                {faq.question}
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 p-8 rounded-3xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 border border-pink-500/20">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ready to explore Instagram without an account?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto mb-4">
            Type any public handle to view active stories, highlights, and reels 100% anonymously.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg hover:opacity-95 transition-opacity"
          >
            Open InstaView Search
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 py-8 px-4 text-center text-xs text-slate-500 dark:text-zinc-500">
        <p>&copy; 2026 InstaView. Free and Anonymous Instagram Viewer.</p>
      </footer>
    </div>
  );
}
