'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, X, Download } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    try {
      const dismissed = localStorage.getItem('instaview_pwa_dismissed');
      if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    } catch {}

    // Check iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      setIsVisible(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('instaview_pwa_dismissed', Date.now().toString());
    } catch {}
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-fade-in">
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-pink-500/30 dark:border-pink-500/20 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              Install InstaView App
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              {isIOS ? 'Tap Share then "Add to Home Screen"' : '1-Tap Stealth Access from your Home Screen'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSInstructions && (
        <div className="mt-2 p-3 rounded-xl bg-slate-900/95 text-white text-xs border border-zinc-700 shadow-xl">
          <p className="font-semibold mb-1">To install on iPhone / iPad:</p>
          <p className="text-zinc-300 text-[11px]">
            1. Tap the <strong>Share</strong> button (square with arrow) at the bottom of Safari.<br />
            2. Scroll down and tap <strong>Add to Home Screen</strong>.
          </p>
          <button
            type="button"
            onClick={() => setShowIOSInstructions(false)}
            className="mt-2 text-[10px] text-pink-400 hover:underline"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
