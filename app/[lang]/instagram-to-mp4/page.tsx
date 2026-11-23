import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InstaViewer } from '@/components/InstaViewer';
import {
  SUPPORTED_LANGS,
  isSupportedLang,
  getTranslations,
} from '@/lib/i18n/translations';

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
  const t = getTranslations(lang).instagramToMp4;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/instagram-to-mp4`,
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: `https://instagram-free-anonymous-viewer.vercel.app/${lang}/instagram-to-mp4`,
    },
  };
}

export default async function LocalizedInstagramToMp4Page({ params }: PageProps) {
  const { lang } = await params;
  if (!isSupportedLang(lang)) {
    notFound();
  }
  const t = getTranslations(lang).instagramToMp4;

  return (
    <InstaViewer
      lang={lang}
      initialTab="reels"
      heroBadge={t.heroBadge}
      heroTitle={t.heroTitle}
      heroHighlight={t.heroHighlight}
      heroDescription={t.heroDescription}
      searchPlaceholder={t.searchPlaceholder}
    />
  );
}
