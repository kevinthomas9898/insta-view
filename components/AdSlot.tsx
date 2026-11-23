'use client';

import React, { useEffect, useRef } from 'react';

export interface AdSlotProps {
  id?: string;
  format?: 'banner' | 'rectangle' | 'native' | 'responsive';
  className?: string;
  // If the user has a direct ad script snippet or URL from Monetag / Adsterra
  adScriptUrl?: string;
  adHtml?: string;
}

export function AdSlot({
  id = 'ad-container',
  format = 'responsive',
  className = '',
  adScriptUrl,
  adHtml,
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adScriptUrl && containerRef.current) {
      const script = document.createElement('script');
      script.src = adScriptUrl;
      script.async = true;
      containerRef.current.appendChild(script);

      return () => {
        if (containerRef.current && script.parentNode === containerRef.current) {
          containerRef.current.removeChild(script);
        }
      };
    }
  }, [adScriptUrl]);

  // If custom ad HTML is provided (e.g. iframe or tag snippet)
  if (adHtml) {
    return (
      <div
        id={id}
        className={`w-full flex items-center justify-center my-6 overflow-hidden ${className}`}
        dangerouslySetInnerHTML={{ __html: adHtml }}
      />
    );
  }

  // Placeholder container ready for ad network scripts
  return (
    <div
      ref={containerRef}
      id={id}
      className={`w-full flex items-center justify-center my-6 overflow-hidden ${className}`}
    >
      <div className="w-full max-w-3xl py-3 px-4 rounded-xl border border-dashed border-slate-300/80 dark:border-zinc-800/80 text-center text-slate-400 dark:text-zinc-600 text-xs flex items-center justify-center gap-2">
        <span className="uppercase tracking-wider text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
          Ad
        </span>
        <span>Sponsor Advertisement Slot (Ready for Monetag / Adsterra)</span>
      </div>
    </div>
  );
}
