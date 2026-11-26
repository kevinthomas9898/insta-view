'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EyeOff, ArrowLeft, ShieldAlert, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function RemoveProfilePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('privacy');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/remove-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          reason,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit opt-out request');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <span>Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto p-4 sm:p-8 flex-1">
        <div className="my-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-semibold mb-3 border border-rose-200 dark:border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            Profile Removal & Opt-Out Request
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Request Profile Opt-Out
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            If you are the rightful owner of an Instagram profile and would like your publicly accessible media excluded from InstaView searches, submit this form and our compliance team will process your request within 24 to 48 hours.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900/80 border border-emerald-500/30 text-center shadow-lg animate-fade-in space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Removal Request Received
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              We have recorded your opt-out request for <strong className="text-slate-900 dark:text-white">@{username}</strong>. A verification notice has been logged and our automated cache blacklist will block further indexing.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-bold transition-all shadow-md"
            >
              Return to Homepage
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-md space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                Instagram Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. username"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                Your Contact Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                Reason for Request
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30 cursor-pointer"
              >
                <option value="privacy">Personal Privacy Request</option>
                <option value="dmca">Copyright / DMCA Takedown</option>
                <option value="impersonation">Impersonation / Fake Account</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide any proof of ownership or additional details..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30 resize-none"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Removal Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-zinc-500">
        <p>&copy; 2026 InstaView. Free and Anonymous Instagram Viewer.</p>
      </footer>
    </div>
  );
}
