'use client';

import React from 'react';

export interface AdsterraBannerProps {
  bannerKey?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function AdsterraBanner({
  bannerKey,
  width = 300,
  height = 250,
  className = '',
}: AdsterraBannerProps) {
  if (!bannerKey) {
    return null;
  }

  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; background: transparent; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${bannerKey}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="//www.highperformanceformat.com/${bannerKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`flex justify-center items-center overflow-hidden ${className}`}>
      <iframe
        title={`Adsterra Ad ${bannerKey}`}
        srcDoc={iframeContent}
        width={width}
        height={height}
        scrolling="no"
        frameBorder="0"
        className="rounded-xl overflow-hidden border-0"
        style={{ border: 'none', maxWidth: '100%' }}
      />
    </div>
  );
}
