'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { NativeAffiliateCard } from '@/components/NativeAffiliateCard';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  requiredSeconds?: number;
}

export interface SponsorCreative {
  id: string;
  partnerId: string;
  brandName: string;
  badge: string;
  badgeColor: string;
  headline: string;
  tagline: string;
  gradient: string;
  videoSrc: string;
  featureBullets: string[];
  ctaText: string;
}

export const SPONSOR_CREATIVES: SponsorCreative[] = [
  {
    id: 'nordvpn',
    partnerId: 'nordvpn',
    brandName: 'NordVPN Stealth',
    badge: 'Official Security Sponsor • 74% Off',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    headline: 'Military-Grade Anonymous Instagram Browsing',
    tagline: 'Hide your IP address, block ISP tracking & view social media with zero footprint.',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    featureBullets: ['No-Logs Policy', '10Gbps High-Speed Servers', 'Threat Protection'],
    ctaText: 'Claim 74% Off NordVPN',
  },
  {
    id: 'surfshark',
    partnerId: 'surfshark',
    brandName: 'Surfshark CleanWeb',
    badge: 'Exclusive Deal • 82% Off + 2 Mo Free',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    headline: 'CleanWeb Tracker Blocker & Unlimited Devices',
    tagline: 'Block intrusive social trackers, bypass region locks & protect all your devices.',
    gradient: 'from-teal-600 via-emerald-600 to-cyan-600',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    featureBullets: ['Unlimited Devices', 'CleanWeb Ad Blocker', 'Strict No-Logs'],
    ctaText: 'Get 82% Off Surfshark',
  },
  {
    id: 'glassagram',
    partnerId: 'glassagram',
    brandName: 'Glassagram Stealth',
    badge: 'Top Anonymous Viewer 2026',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    headline: 'Anonymous Profile & Hidden Story Viewer',
    tagline: 'Watch Instagram stories, reels and profile updates with 100% undetected stealth.',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    featureBullets: ['Zero Account Required', 'Story Alerts', '100% Undetectable'],
    ctaText: 'Try Anonymous Viewer',
  },
  {
    id: 'inflact',
    partnerId: 'inflact',
    brandName: 'Inflact 4K Downloader',
    badge: 'Verified Creator Suite',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    headline: 'Download Stories, Reels & Media in Original 4K',
    tagline: 'Bulk download high-definition Instagram media and export full profiles in 1 click.',
    gradient: 'from-amber-600 via-orange-600 to-rose-600',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    featureBullets: ['4K Original Quality', '1-Click Profile ZIP', 'Auto Story Archiver'],
    ctaText: 'Explore 4K Downloader',
  },
  {
    id: 'instaview-ai',
    partnerId: 'nordvpn',
    brandName: 'InstaView Neural AI',
    badge: 'Sponsor-Supported Free AI',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    headline: 'Groq Whisper Large v3 Turbo Neural Speech Engine',
    tagline: 'High-speed audio extraction, speaker separation and synchronized closed-captions.',
    gradient: 'from-pink-600 via-rose-600 to-amber-600',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    featureBullets: ['Groq Whisper Large v3', 'Synchronized Subtitles', '100% Free Forever'],
    ctaText: 'Sponsor-Supported Free Tool',
  },
];

export function RewardedAdModal({
  isOpen,
  onClose,
  onUnlocked,
  requiredSeconds = 15,
}: RewardedAdModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(requiredSeconds);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [currentCreative, setCurrentCreative] = useState<SponsorCreative>(SPONSOR_CREATIVES[0]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const canSkip = secondsRemaining <= (requiredSeconds - 5) || isCompleted;
  const skipCountdown = Math.max(0, secondsRemaining - (requiredSeconds - 5));

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(requiredSeconds);
      setIsCompleted(false);
      setShowExitWarning(false);
      setIsVideoPlaying(true);
      setVideoError(false);
      return;
    }

    // Pick a new dynamic sponsor ad creative every time the modal opens
    const randomIndex = Math.floor(Math.random() * SPONSOR_CREATIVES.length);
    setCurrentCreative(SPONSOR_CREATIVES[randomIndex]);
    setVideoError(false);

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
    if (isCompleted || canSkip) {
      onUnlocked();
    } else {
      setShowExitWarning(true);
      setTimeout(() => setShowExitWarning(false), 3500);
    }
  };

  const handleUnlockClick = () => {
    if (isCompleted || canSkip) {
      onUnlocked();
    }
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsVideoPlaying(true);
    }
  };

  const toggleVideoMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isVideoMuted;
    setIsVideoMuted(!isVideoMuted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className={`bg-gradient-to-r ${currentCreative.gradient} p-4 text-white text-center relative shadow-md transition-all duration-300`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentCreative.badge}</span>
          </div>
          <h3 className="text-lg font-bold">{currentCreative.brandName}</h3>
          <p className="text-xs text-white/90 mt-0.5">
            {currentCreative.headline}
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
          <div className="mx-4 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-400 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Please allow the 15-second sponsor video to finish to unlock your free transcript!</span>
          </div>
        )}

        {/* Sponsor Video & Audio Player Area (No Blank Screen) */}
        <div className="p-4 flex flex-col items-center justify-center bg-zinc-950 border-y border-zinc-800">
          <div className="w-full flex items-center justify-between text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sponsor: {currentCreative.brandName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-pink-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              <span>AD PLAYING • 0:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}</span>
            </div>
          </div>

          {/* Interactive HD Video Container */}
          <div
            onClick={toggleVideoPlayback}
            className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-xl group cursor-pointer"
          >
            {!videoError ? (
              <video
                key={currentCreative.id}
                ref={videoRef}
                src={currentCreative.videoSrc}
                autoPlay
                playsInline
                loop
                muted={isVideoMuted}
                onError={() => setVideoError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-purple-950/40 to-pink-950/40 flex flex-col items-center justify-center p-6 text-center">
                <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 mb-2">
                  <Sparkles className="w-7 h-7 text-pink-400 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-white mb-0.5">{currentCreative.brandName}</h4>
                <p className="text-[11px] text-zinc-400 max-w-xs">
                  {currentCreative.tagline}
                </p>
              </div>
            )}

            {/* Gradient Overlay & Badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

            {/* Top Left: Sponsor Brand Tag */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{currentCreative.brandName}</span>
            </div>

            {/* Top Right: Sound Toggle Button */}
            {!videoError && (
              <button
                type="button"
                onClick={toggleVideoMute}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 transition-transform active:scale-90 cursor-pointer"
                title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isVideoMuted ? (
                  <VolumeX className="w-4 h-4 text-zinc-300" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            )}

            {/* Skip Ad Button on Video Overlay */}
            {canSkip ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlocked();
                }}
                className="absolute bottom-3 right-3 z-30 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer border border-white/20 transition-all"
              >
                <span>Skip Ad</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute bottom-3 right-3 z-30 px-3 py-1.5 rounded-xl bg-black/70 text-zinc-300 font-semibold text-xs border border-white/10 backdrop-blur-md">
                <span>Skip in {skipCountdown}s</span>
              </div>
            )}

            {/* Center Play/Pause Indicator (shown on hover or pause) */}
            {!isVideoPlaying && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="p-3.5 rounded-full bg-white/20 backdrop-blur-md text-white shadow-lg">
                  <Play className="w-6 h-6 fill-white" />
                </div>
              </div>
            )}

            {/* Bottom Overlay: Audio Equalizer & Title */}
            <div className="absolute bottom-3 left-3 right-28 flex items-end justify-between text-white pointer-events-none">
              <div className="truncate">
                <p className="text-xs font-bold text-white drop-shadow-md truncate">{currentCreative.brandName}</p>
                <p className="text-[10px] text-zinc-300 drop-shadow-md truncate">{currentCreative.tagline}</p>
              </div>

              {/* Animated Equalizer Waveform */}
              <div className="flex items-end gap-1 h-5 shrink-0 ml-2">
                <span className="w-1 bg-pink-500 rounded-full animate-bounce [animation-delay:0ms] h-3" />
                <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:150ms] h-5" />
                <span className="w-1 bg-amber-500 rounded-full animate-bounce [animation-delay:300ms] h-4" />
                <span className="w-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:450ms] h-2" />
              </div>
            </div>
          </div>

          {/* Native Partner Deal (Companion Banner below video) */}
          <div className="w-full mt-3">
            <NativeAffiliateCard partnerId={currentCreative.partnerId} className="!p-3 !bg-zinc-900/90 !border-zinc-800" />
          </div>
        </div>

        {/* Timer & Action Footer */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 bg-zinc-900">
          {/* Progress Bar & Countdown */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-zinc-400 flex items-center gap-1.5">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Transcript Ready to Unlock!</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                    <span>Extracting audio & transcribing speech...</span>
                  </>
                )}
              </span>
              <span className={`tabular-nums ${isCompleted ? 'text-emerald-400' : 'text-pink-400 font-bold'}`}>
                {isCompleted ? '100%' : `${secondsRemaining}s remaining`}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
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
            disabled={!isCompleted && !canSkip}
            onClick={handleUnlockClick}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white cursor-pointer active:scale-98 shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                : canSkip
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white cursor-pointer active:scale-98 shadow-pink-500/25 ring-2 ring-pink-400/50'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isCompleted ? (
              <>
                <span>View Full Transcript</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : canSkip ? (
              <>
                <span>Skip Ad & View Transcript</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>Unlocking in {secondsRemaining}s...</span>
            )}
          </button>

          <p className="text-[11px] text-center text-zinc-500">
            100% Free Service • No account or credit card required • Zero data stored
          </p>
        </div>
      </div>
    </div>
  );
}
