'use client';

import { useState, useEffect } from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, Check, ShieldCheck, Eye, Sparkles } from 'lucide-react';

interface DpViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  isPrivate?: boolean;
}

export function DpViewerModal({
  isOpen,
  onClose,
  username,
  fullName,
  avatarUrl,
  isVerified,
  isPrivate,
}: DpViewerModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSquareView, setIsSquareView] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleClose = () => {
    setIsZoomed(false);
    onClose();
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !avatarUrl) return null;

  const proxiedSrc = `/api/media?url=${encodeURIComponent(avatarUrl)}`;
  const downloadSrc = `/api/media?url=${encodeURIComponent(avatarUrl)}&download=true&filename=${username}_profile_picture_hd.jpg`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + proxiedSrc);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700/80 bg-zinc-800 shrink-0">
              <img
                src={proxiedSrc}
                alt={username}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm sm:text-base truncate">
                  @{username}
                </span>
                {isVerified && (
                  <span className="inline-block w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30 font-semibold tracking-wide">
                  HD DP
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {fullName || 'Instagram Profile Picture'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-zinc-900/30 border-b border-zinc-800/40 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSquareView(!isSquareView)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
              title="Toggle between square uncropped and circular Instagram view"
            >
              <span>{isSquareView ? 'Show Circle Cut' : 'Show Full Square'}</span>
            </button>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              {isSquareView ? 'Uncropped Original' : 'Instagram App Crop'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            title={isZoomed ? 'Zoom out' : 'Zoom in (1.5x)'}
          >
            {isZoomed ? (
              <>
                <ZoomOut className="w-3.5 h-3.5" />
                <span>Zoom Out</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Zoom In</span>
              </>
            )}
          </button>
        </div>

        {/* Main Image Display */}
        <div className="relative flex-1 min-h-[280px] sm:min-h-[360px] max-h-[55vh] flex items-center justify-center p-6 bg-radial from-zinc-900/60 to-zinc-950 overflow-hidden select-none">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
            </div>
          )}

          <div
            className={`relative transition-all duration-300 ease-out cursor-pointer ${
              isSquareView
                ? 'rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 ring-1 ring-white/10'
                : 'rounded-full overflow-hidden shadow-2xl p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 ring-4 ring-pink-500/20'
            } ${isZoomed ? 'scale-125' : 'scale-100'}`}
            onClick={() => setIsZoomed(!isZoomed)}
            title="Click to toggle zoom"
          >
            <img
              src={proxiedSrc}
              alt={`${username} profile picture`}
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                if (avatarUrl && e.currentTarget.src !== avatarUrl) {
                  e.currentTarget.src = avatarUrl;
                }
              }}
              className={`w-64 h-64 sm:w-80 sm:h-80 object-cover ${
                isSquareView ? 'rounded-2xl' : 'rounded-full'
              }`}
            />
          </div>

          {/* Resolution Badge */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-zinc-400 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 backdrop-blur-md font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              High Definition
            </span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 backdrop-blur-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              100% Anonymous
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-zinc-900/80 border-t border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            {/* Download Button */}
            <a
              href={downloadSrc}
              download={`${username}_profile_picture_hd.jpg`}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download HD DP</span>
            </a>

            {/* Open in New Tab */}
            <a
              href={proxiedSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-colors flex items-center justify-center cursor-pointer"
              title="Open full resolution in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-colors flex items-center justify-center cursor-pointer"
              title="Copy direct DP image link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 text-center">
            {isPrivate
              ? 'Private Profile: Profile pictures remain public on Meta servers and can be saved freely.'
              : 'Directly streamed in original quality from Instagram CDN.'}
          </p>
        </div>
      </div>
    </div>
  );
}
