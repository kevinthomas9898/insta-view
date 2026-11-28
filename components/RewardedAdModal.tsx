'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Play, ArrowRight } from 'lucide-react';
import { AdsterraBanner } from '@/components/AdsterraBanner';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  requiredSeconds?: number;
}

export function RewardedAdModal({
  isOpen,
  onClose,
  onUnlocked,
  requiredSeconds = 15,
}: RewardedAdModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(requiredSeconds);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(requiredSeconds);
      setIsCompleted(false);
      setShowExitWarning(false);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, requiredSeconds]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round(((requiredSeconds - secondsRemaining) / requiredSeconds) * 100));

  const handleAttemptClose = () => {
    if (isCompleted) {
      onClose();
    } else {
      setShowExitWarning(true);
      setTimeout(() => setShowExitWarning(false), 3500);
    }
  };

  const handleUnlockClick = () => {
    if (isCompleted) {
      onUnlocked();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-4 text-white text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sponsor-Supported Free AI</span>
          </div>
          <h3 className="text-lg font-bold">Unlocking Reel Transcript</h3>
          <p className="text-xs text-white/90 mt-0.5">
            Watching this sponsor ad keeps AI speech recognition 100% free for everyone!
          </p>

          {/* Close button (only active after countdown or shows warning) */}
          <button
            onClick={handleAttemptClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer"
            title={isCompleted ? 'Close' : 'Watch full ad to unlock'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Early exit warning toast */}
        {showExitWarning && (
          <div className="mx-4 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-400 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Please allow the 15-second sponsor ad to finish to unlock your free transcript!</span>
          </div>
        )}

        {/* Sponsor Ad Area */}
        <div className="p-4 flex flex-col items-center justify-center min-h-[260px] bg-slate-50 dark:bg-zinc-950/60 border-y border-slate-100 dark:border-zinc-800/80">
          <div className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 mb-2 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Official Sponsor Message</span>
          </div>

          {/* Adsterra Display Placement */}
          <div className="w-full flex justify-center items-center overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2">
            <AdsterraBanner width={300} height={250} bannerKey="4ff02455261b1454e019ced3534847d2" />
          </div>
        </div>

        {/* Timer & Action Footer */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 bg-white dark:bg-zinc-900">
          {/* Progress Bar & Countdown */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Transcript Ready to Unlock!</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                    <span>Extracting audio & transcribing speech...</span>
                  </>
                )}
              </span>
              <span className={`tabular-nums ${isCompleted ? 'text-emerald-500' : 'text-pink-500 font-bold'}`}>
                {isCompleted ? '100%' : `${secondsRemaining}s remaining`}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-pink-500 to-rose-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Main Action Button */}
          <button
            type="button"
            disabled={!isCompleted}
            onClick={handleUnlockClick}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white cursor-pointer active:scale-98 shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isCompleted ? (
              <>
                <span>View Full Transcript</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>Unlocking in {secondsRemaining}s...</span>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 dark:text-zinc-500">
            100% Free Service • No account or credit card required • Zero data stored
          </p>
        </div>
      </div>
    </div>
  );
}
