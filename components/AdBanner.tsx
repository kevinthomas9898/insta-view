'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Bookmark, ShieldCheck, Share2, Check } from 'lucide-react';
import { NativeAffiliateCard } from '@/components/NativeAffiliateCard';

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
        /* Mobile Viewport Optimization: Show strictly 1 ad unit on mobile (< 640px) to prevent 4 stacked ads in a row */
        @media (max-width: 640px) {
          #${containerId} > * > *:nth-child(n+2),
          #${containerId} > div > div:nth-child(n+2),
          #${containerId} [class*="__bn-container"]:nth-child(n+2),
          #${containerId} [class*="__bn"]:nth-child(n+2) {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div id="${containerId}"></div>
      <script async="async" data-cfasync="false" src="${scriptSrc}"></script>
      <script>
        // Enforce exactly 1 single ad item on mobile screens (< 640px)
        function limitMobileAdUnits() {
          if (window.innerWidth <= 640) {
            var c = document.getElementById('${containerId}');
            if (c) {
              var parent = c.querySelector('[class*="__stand"]') || c.firstElementChild || c;
              if (parent && parent.children.length > 1) {
                for (var i = 1; i < parent.children.length; i++) {
                  parent.children[i].style.setProperty('display', 'none', 'important');
                }
              }
            }
          }
        }
        var attempts = 0;
        var checkTimer = setInterval(function() {
          limitMobileAdUnits();
          attempts++;
          if (attempts > 25) clearInterval(checkTimer);
        }, 150);
      </script>
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
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
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

      {/* 100% AdBlock-Proof Native Affiliate Sponsor Card when network ads are blocked or empty */}
      {isBlocked && showFallbackOnBlock && (
        <NativeAffiliateCard className="animate-fade-in" />
      )}
    </div>
  );
}
