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
  const tNav = getTranslations(lang).nav;
  return {
    title: `Instagram ${tNav.posts} & Photos Viewer — InstaView`,
    description: `Browse public Instagram feed posts, multi-slide carousels, and high-resolution photos without an account. Download original quality images freely.`,
    alternates: {
      canonical: `/${lang}/posts`,
    },
    openGraph: {
      title: `Instagram ${tNav.posts} & Photos Viewer — InstaView`,
      url: `https://instagram-free-anonymous-viewer.vercel.app/${lang}/posts`,
    },
  };
}

export default async function LocalizedPostsPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isSupportedLang(lang)) {
    notFound();
  }
  const t = getTranslations(lang).home;
  const tNav = getTranslations(lang).nav;

  return (
    <InstaViewer
      lang={lang}
      initialTab="posts"
      heroBadge={`Instagram ${tNav.posts}`}
      heroTitle={`${tNav.posts} — `}
      heroHighlight={t.heroHighlight}
      heroDescription={t.heroDescription}
      searchPlaceholder={t.searchPlaceholder}
    />
  );
}
