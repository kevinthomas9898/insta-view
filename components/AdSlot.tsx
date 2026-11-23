'use client';

import React, { useEffect, useRef } from 'react';

export interface AdSlotProps {
  id?: string;
  scriptSrc?: string;
  className?: string;
}

export function AdSlot({
  id = 'container-4ff02455261b1454e019ced3534847d2',
  scriptSrc = 'https://bicea.org/21/4ff02455261b1454e019ced3534847d2',
  className = '',
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only inject native banner script on client side
    if (!scriptSrc) return;
    const scriptId = `adsterra-script-${id}`;
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = scriptSrc;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script);
    }
  }, [id, scriptSrc]);

  return (
    <div className={`w-full flex justify-center my-2 sm:my-3 overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        id={id}
        className="w-full max-w-4xl min-h-[60px] sm:min-h-[90px] flex justify-center items-center"
      />
    </div>
  );
}
