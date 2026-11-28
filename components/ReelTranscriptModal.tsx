'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileText,
  Clock,
  Globe,
  Sparkles,
  AlignLeft,
  ListOrdered,
  Volume2,
} from 'lucide-react';
import { TranscriptResult } from '@/lib/transcribe/whisper';
import { formatTranscriptToParagraphs } from '@/lib/transcribe/formatter';

interface ReelTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: (TranscriptResult & { srt?: string }) | null;
  reelUsername?: string;
  reelShortcode?: string;
}

export function ReelTranscriptModal({
  isOpen,
  onClose,
  transcript,
  reelUsername = 'instagram_creator',
  reelShortcode = 'reel',
}: ReelTranscriptModalProps) {
  const [activeTab, setActiveTab] = useState<'paragraph' | 'timestamps'>('paragraph');
  const [copied, setCopied] = useState(false);

  // Intelligently format spoken dialogue into natural, readable paragraphs
  const formattedText = React.useMemo(() => {
    if (!transcript?.text) return '';
    if (transcript.text.includes('\n\n')) {
      return transcript.text;
    }
    return formatTranscriptToParagraphs(transcript.segments, transcript.text);
  }, [transcript]);

  const paragraphs = React.useMemo(() => {
    return formattedText ? formattedText.split(/\n\n+/).filter(Boolean) : [];
  }, [formattedText]);

  if (!isOpen || !transcript) return null;

  const handleCopy = () => {
    if (!formattedText) return;
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${reelUsername}_${reelShortcode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSrt = () => {
    if (!transcript.srt) return;
    const blob = new Blob([transcript.srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles_${reelUsername}_${reelShortcode}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = formattedText ? formattedText.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base sm:text-lg flex items-center gap-2">
                <span>Reel Audio Transcript</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Spoken dialogue & lyrics extracted from @{reelUsername}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Pills & Mode Switcher */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              <span>{transcript.duration ? `${Math.round(transcript.duration)}s` : 'Full Reel'}</span>
            </span>
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span className="uppercase">{transcript.language || 'en'}</span>
            </span>
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
              <span>{wordCount} words</span>
            </span>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('paragraph')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'paragraph'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
            <button
              onClick={() => setActiveTab('timestamps')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'timestamps'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Timestamps</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto max-h-[50vh] text-slate-800 dark:text-zinc-200 text-sm leading-relaxed">
          {activeTab === 'paragraph' ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 font-normal select-text space-y-3.5">
              {paragraphs.length > 0 ? (
                paragraphs.map((para, idx) => (
                  <p key={idx} className="leading-relaxed text-slate-800 dark:text-zinc-200">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-slate-400 dark:text-zinc-500">No transcript text available.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {transcript.segments && transcript.segments.length > 0 ? (
                transcript.segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/60 flex items-start gap-3 hover:border-pink-500/30 transition-colors"
                  >
                    <span className="text-[11px] font-mono font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10 px-2 py-0.5 rounded-md shrink-0">
                      {Math.floor(seg.start / 60)}:{(Math.floor(seg.start % 60)).toString().padStart(2, '0')} -{' '}
                      {Math.floor(seg.end / 60)}:{(Math.floor(seg.end % 60)).toString().padStart(2, '0')}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 select-text">
                      {seg.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-6">
                  No timestamp segments available. Use the text tab.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-xs shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Transcript'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/60 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors cursor-pointer"
              title="Download as Plain Text file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.TXT</span>
            </button>

            {transcript.srt && (
              <button
                type="button"
                onClick={handleDownloadSrt}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/60 text-slate-700 dark:text-zinc-200 font-medium text-xs transition-colors cursor-pointer"
                title="Download Subtitles in SRT format"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.SRT Subtitles</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
