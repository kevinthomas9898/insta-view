import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InstaViewer } from '@/components/InstaViewer';
import {
  SUPPORTED_LANGS,
  isSupportedLang,
  getTranslations,
} from '@/lib/i18n/translations';

export const instant = false;

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({
    lang,
  }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLang(lang)) {
    return {};
  }
  const tNav = getTranslations(lang).nav;
  return {
    title: `Instagram ${tNav.highlights} Viewer & Downloader — InstaView`,
    description: `Browse and download public Instagram story highlights without logging in. View archived story collections in high quality.`,
    alternates: {
      canonical: `/${lang}/highlights`,
    },
    openGraph: {
      title: `Instagram ${tNav.highlights} Viewer & Downloader — InstaView`,
      url: `https://ig-storyviewer.vercel.app/${lang}/highlights`,
    },
  };
}

export default async function LocalizedHighlightsPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isSupportedLang(lang)) {
    notFound();
  }
  const t = getTranslations(lang).stories;
  const tNav = getTranslations(lang).nav;

  return (
    <InstaViewer
      lang={lang}
      initialTab="highlights"
      heroBadge={`Instagram ${tNav.highlights}`}
      heroTitle={`${tNav.highlights} — `}
      heroHighlight={t.heroHighlight}
      heroDescription={t.heroDescription}
      searchPlaceholder={t.searchPlaceholder}
    />
  );
}
