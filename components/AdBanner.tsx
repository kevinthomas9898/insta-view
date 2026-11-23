'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Bookmark, ShieldCheck, Share2, Check } from 'lucide-react';

interface AdBannerProps {
  containerId?: string;
  scriptSrc?: string;
  className?: string;
  showFallbackOnBlock?: boolean;
}

export function AdBanner({
  containerId = 'container-4ff02455261b1454e019ced3534847d2',
  scriptSrc = 'https://bicea.org/21/4ff02455261b1454e019ced3534847d2',
  className = '',
  showFallbackOnBlock = true,
}: AdBannerProps) {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Check if network blocked the script (adblock test)
    let isMounted = true;
    const testTimer = setTimeout(() => {
      if (!isMounted) return;
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentDocument) {
          const adContainer = iframe.contentDocument.getElementById(containerId);
          // If after 3.5s the container has no children or height, ad is blocked or empty
          if (!adContainer || adContainer.children.length === 0) {
            setIsBlocked(true);
          } else {
            setIsAdLoaded(true);
          }
        } else {
          setIsBlocked(true);
        }
      } catch {
        // Cross-origin or sandbox restriction indicates ad script ran or was blocked
        setIsAdLoaded(true);
      }
    }, 3500);

    return () => {
      isMounted = false;
      clearTimeout(testTimer);
    };
  }, [containerId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const iframeContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #${containerId} {
          width: 100%;
          min-height: 190px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      </style>
    </head>
    <body>
      <div id="${containerId}"></div>
      <script async="async" data-cfasync="false" src="${scriptSrc}"></script>
    </body>
    </html>
  `;

  return (
    <div className={`w-full flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}>
      {/* Header only shown when ad is actively loading or confirmed loaded */}
      {!isBlocked && (
        <div className="w-full flex items-center justify-center gap-3 mb-2">
          <span className="h-px bg-slate-200 dark:bg-zinc-800 flex-1 max-w-[120px]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Advertisement
          </span>
          <span className="h-px bg-slate-200 dark:bg-zinc-800 flex-1 max-w-[120px]" />
        </div>
      )}

      {/* Ad Iframe Sandbox Container */}
      <div className={`w-full max-w-4xl flex justify-center items-center ${isBlocked ? 'hidden' : 'block'}`}>
        <iframe
          ref={iframeRef}
          srcDoc={iframeContent}
          title="Advertisement"
          className="w-full min-h-[190px] h-[200px] sm:h-[210px] md:h-[220px] border-0 overflow-hidden"
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
          onLoad={() => {
            // Check immediately after load and auto-fit height
            setTimeout(() => {
              try {
                const iframe = iframeRef.current;
                if (iframe?.contentDocument) {
                  const ad = iframe.contentDocument.getElementById(containerId);
                  if (ad && ad.children.length > 0) {
                    setIsAdLoaded(true);
                    setIsBlocked(false);
                    const scrollH = iframe.contentDocument.body.scrollHeight;
                    if (scrollH > 120) {
                      iframe.style.height = `${scrollH + 10}px`;
                    }
                  }
                }
              } catch {
                setIsAdLoaded(true);
              }
            }, 1500);
          }}
        />
      </div>

      {/* Fallback Sleek Stealth Tip Card when Ad is Blocked or Empty (No Ugly Blank Hole!) */}
      {isBlocked && showFallbackOnBlock && (
        <div className="w-full max-w-2xl mx-auto p-4 rounded-xl bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/80 backdrop-blur-sm shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-500 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>InstaView Stealth Tip</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 100% Private
                </span>
              </div>
              <p className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                Bookmark this page (Ctrl+D) to watch Instagram Stories, Reels & Highlights anonymously anytime.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition-colors font-medium text-[11px] flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share InstaView</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
