'use client';

import React, { useEffect, useRef } from 'react';

export interface AdSlotProps {
  id?: string;
  className?: string;
}

export function AdSlot({
  id = 'container-4ff02455261b1454e019ced3534847d2',
  className = '',
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only inject native banner script on client side
    const scriptId = 'adsterra-native-banner-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://bicea.org/21/4ff02455261b1454e019ced3534847d2';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center my-6 overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        id={id}
        className="w-full max-w-4xl min-h-[90px] flex justify-center items-center"
      />
    </div>
  );
}
