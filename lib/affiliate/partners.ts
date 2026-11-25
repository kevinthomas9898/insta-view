export interface AffiliatePartner {
  id: string;
  name: string;
  category: 'vpn' | 'instagram-tool' | 'downloader';
  tagline: string;
  headline: string;
  description: string;
  badge: string;
  badgeColor: string;
  ctaText: string;
  accentColor: string;
  gradient: string;
  bullets: string[];
  defaultUrl: string;
  envVar: string;
}

export const AFFILIATE_PARTNERS: Record<string, AffiliatePartner> = {
  nordvpn: {
    id: 'nordvpn',
    name: 'NordVPN',
    category: 'vpn',
    tagline: '100% Anonymous Browsing',
    headline: 'Browse Instagram with Zero Digital Footprint',
    description: 'Hide your IP address, prevent ISP tracking, and view social media with military-grade encryption.',
    badge: 'Save 74% + 3 Months Free',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    ctaText: 'Get NordVPN Stealth Protection',
    accentColor: '#3b82f6',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    bullets: [
      'Strict No-Logs Policy (Independently Audited)',
      '10Gbps Ultra-Fast Servers Across 111 Countries',
      'Threat Protection Blocks Malware & Phishing',
      '30-Day Risk-Free Money-Back Guarantee',
    ],
    defaultUrl: 'https://nordvpn.com/pricing/?coupon=deal74',
    envVar: 'AFFILIATE_NORDVPN_URL',
  },
  surfshark: {
    id: 'surfshark',
    name: 'Surfshark VPN',
    category: 'vpn',
    tagline: 'Unlimited Devices Stealth',
    headline: 'Total Online Privacy for All Your Devices',
    description: 'Bypass geo-restrictions, hide social media activity, and protect your entire family with one account.',
    badge: 'Exclusive 82% Off Deal',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    ctaText: 'Claim 82% Off Surfshark',
    accentColor: '#10b981',
    gradient: 'from-teal-600 via-emerald-600 to-cyan-600',
    bullets: [
      'Unlimited Simultaneous Device Connections',
      'CleanWeb Blocks Trackers & Annoying Ads',
      'Private DNS & Leak Protection on All Servers',
      'Instant 30-Day Money-Back Guarantee',
    ],
    defaultUrl: 'https://surfshark.com/deal/?coupon=special82',
    envVar: 'AFFILIATE_SURFSHARK_URL',
  },
  glassagram: {
    id: 'glassagram',
    name: 'Glassagram',
    category: 'instagram-tool',
    tagline: 'Anonymous Profile & Story Monitor',
    headline: 'View Private Instagram Accounts & Hidden Stories',
    description: 'Track private profile updates, watch expiring stories anonymously, and monitor activity with zero detection.',
    badge: 'Top-Rated IG Viewer',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    ctaText: 'Try Anonymous Viewer',
    accentColor: '#a855f7',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    bullets: [
      'Watch Stories & Reels Without An Account',
      'View Hidden & Private Profile Media',
      'Automated Real-Time Story Alerts',
      '100% Undetectable Stealth Monitoring',
    ],
    defaultUrl: 'https://glassagram.com/?ref=instaview',
    envVar: 'AFFILIATE_GLASSAGRAM_URL',
  },
  inflact: {
    id: 'inflact',
    name: 'Inflact Pro',
    category: 'downloader',
    tagline: 'Instagram 4K Exporter & Downloader',
    headline: 'Download All Stories, Reels & Profiles in 4K',
    description: 'Bulk download high-definition Instagram media, analyze creator statistics, and export entire profiles in 1 click.',
    badge: 'Creator Pro Toolkit',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    ctaText: 'Explore 4K Downloader',
    accentColor: '#f59e0b',
    gradient: 'from-amber-600 via-orange-600 to-rose-600',
    bullets: [
      'Original 4K & Full HD Media Exporter',
      'Download Entire Profiles In 1-Click ZIP',
      'Automated Story Archiver & Scheduler',
      'No Account Password Required',
    ],
    defaultUrl: 'https://inflact.com/downloader/instagram/?ref=instaview',
    envVar: 'AFFILIATE_INFLACT_URL',
  },
};

export const PARTNER_KEYS = Object.keys(AFFILIATE_PARTNERS);

export function getPartner(partnerId: string): AffiliatePartner {
  return AFFILIATE_PARTNERS[partnerId] || AFFILIATE_PARTNERS.nordvpn;
}

export function getRandomPartner(): AffiliatePartner {
  const keys = PARTNER_KEYS;
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return AFFILIATE_PARTNERS[randomKey];
}
