import type { Metadata } from 'next';
import Link from 'next/link';
import { EyeOff, ArrowLeft, Lock } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Terms of Service — InstaView',
  description:
    'Terms of service, fair use guidelines, disclaimer, and copyright DMCA procedures for InstaView.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Insta<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">View</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto p-4 sm:p-8 flex-1 space-y-6">
        <div className="my-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-3 border border-amber-200 dark:border-amber-500/20">
            <Lock className="w-3.5 h-3.5" />
            Usage Terms & Legal Disclaimers
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
            Last Updated: 2026
          </p>
        </div>

        <section className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By using InstaView, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, you must discontinue using this utility immediately.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Meta Independence Disclaimer</h2>
          <p>
            InstaView is an independent software tool and is not affiliated with, sponsored by, or endorsed by Instagram, Meta Platforms, Inc. All trademarks, service marks, and brand logos belong to their respective owners.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Intellectual Property and Copyright</h2>
          <p>
            InstaView does not host, store, or claim ownership over any user-generated content displayed or downloaded. All media rights remain with the original creators. Users must respect copyright laws and utilize downloaded media solely for lawful personal archival purposes.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Fair Use & Prohibited Conduct</h2>
          <p>
            Automated scraping, denial-of-service attempts, or bypassing rate limits is strictly forbidden.
          </p>
        </section>
      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-zinc-500">
        <p>&copy; 2026 InstaView. All rights reserved.</p>
      </footer>
    </div>
  );
}
