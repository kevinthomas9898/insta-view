'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  Download,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AFFILIATE_PARTNERS, AffiliatePartner, getRandomPartner } from '@/lib/affiliate/partners';

interface NativeAffiliateCardProps {
  partnerId?: string;
  className?: string;
}

export function NativeAffiliateCard({
  partnerId,
  className = '',
}: NativeAffiliateCardProps) {
  const [partner, setPartner] = useState<AffiliatePartner>(() => {
    return partnerId ? AFFILIATE_PARTNERS[partnerId] || AFFILIATE_PARTNERS.nordvpn : AFFILIATE_PARTNERS.nordvpn;
  });

  useEffect(() => {
    if (!partnerId) {
      setPartner(getRandomPartner());
    }
  }, [partnerId]);

  const targetLink = `/api/go/${partner.id}`;

  const renderIcon = () => {
    switch (partner.id) {
      case 'nordvpn':
        return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case 'surfshark':
        return <Lock className="w-5 h-5 text-emerald-500" />;
      case 'glassagram':
        return <Eye className="w-5 h-5 text-purple-500" />;
      case 'inflact':
        return <Download className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-pink-500" />;
    }
  };

  // Sleek In-Feed Sponsor Card (Replaces blocked banners with native monetization)
  return (
    <div className={`w-full max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-lg transition-all animate-fade-in ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Icon & Description */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 shrink-0 shadow-xs mt-0.5">
            {renderIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {partner.name}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                Partner Deal
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${partner.badgeColor}`}>
                {partner.badge}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 line-clamp-1">
              {partner.headline}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
              {partner.description}
            </p>
          </div>
        </div>

        {/* Right: CTA Button */}
        <div className="w-full sm:w-auto flex items-center justify-end shrink-0">
          <a
            href={targetLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r ${partner.gradient} hover:opacity-95 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
          >
            <span>{partner.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
