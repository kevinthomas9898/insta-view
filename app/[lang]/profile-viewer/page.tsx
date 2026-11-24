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
    title: `Instagram ${tNav.profile} Viewer — InstaView`,
    description: `Inspect any public Instagram profile anonymously. View biography, follower metrics, post counts, and download full-size HD profile pictures without an account.`,
    alternates: {
      canonical: `/${lang}/profile-viewer`,
    },
    openGraph: {
      title: `Instagram ${tNav.profile} Viewer — InstaView`,
      url: `https://ig-storyviewer.vercel.app/${lang}/profile-viewer`,
    },
  };
}

export default async function LocalizedProfileViewerPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isSupportedLang(lang)) {
    notFound();
  }
  const t = getTranslations(lang).home;
  const tNav = getTranslations(lang).nav;

  return (
    <InstaViewer
      lang={lang}
      initialTab="stories"
      heroBadge={`Instagram ${tNav.profile}`}
      heroTitle={`${tNav.profile} — `}
      heroHighlight={t.heroHighlight}
      heroDescription={t.heroDescription}
      searchPlaceholder={t.searchPlaceholder}
    />
  );
}
