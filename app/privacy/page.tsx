import type { Metadata } from 'next';
import Link from 'next/link';
import { EyeOff, ArrowLeft, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Privacy Policy — InstaView',
  description:
    'Our commitment to user privacy, zero log retention, anonymous proxy streaming, and GDPR compliance.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" strokeWidth={1.75} />
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-3 border border-emerald-200 dark:border-emerald-500/20">
            <Shield className="w-3.5 h-3.5" />
            Data Protection & Anonymity
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
            Last Updated: 2026
          </p>
        </div>

        <section className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Zero Log Retention Policy</h2>
          <p>
            InstaView is architected from the ground up for strict anonymity. We do not require account registration, passwords, email addresses, or phone numbers. We do not retain server logs correlating your IP address with searches conducted on this site.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Meta CDN Proxy Streaming</h2>
          <p>
            When media is viewed or downloaded, requests are brokered through isolated cloud proxy relays. Your client browser never communicates directly with Instagram or Meta servers during anonymous viewing sessions, ensuring your personal IP address is never logged in Meta&apos;s story view rosters.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Public Content Exclusivity</h2>
          <p>
            We only access and display content that has been published openly on the public web. We do not provide mechanisms to circumvent authentication boundaries or inspect private accounts.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Cookies and Local Storage</h2>
          <p>
            We only use standard browser <code className="font-mono text-xs bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">localStorage</code> to remember your chosen theme preference (Dark or Light mode). No tracking cookies are used to monitor you across other websites.
          </p>
        </section>
      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-zinc-500">
        <p>&copy; 2026 InstaView. All rights reserved.</p>
      </footer>
    </div>
  );
}
