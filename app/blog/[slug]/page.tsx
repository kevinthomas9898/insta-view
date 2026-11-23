import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EyeOff, ArrowLeft, Clock, Calendar, CheckCircle2, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BLOG_POSTS } from '@/lib/data/blog';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} — InstaView`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://instagram-free-anonymous-viewer.vercel.app/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'InstaView',
      url: 'https://instagram-free-anonymous-viewer.vercel.app',
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://instagram-free-anonymous-viewer.vercel.app/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-rose-950/20 group-hover:scale-105 transition-transform">
              <EyeOff className="w-4 h-4 text-white" strokeWidth={1.75} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Insta<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">View</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Articles</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Article Body */}
      <main className="max-w-3xl w-full mx-auto p-4 sm:p-8 flex-1">
        <article className="space-y-6">
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400 font-semibold text-xs">
                {post.category}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
              {post.title}
            </h1>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-2">
              <span>By {post.author}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {post.publishedAt}
              </span>
            </div>
          </div>

          {/* Quick Viewer Search Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 border border-pink-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Try InstaView Now</p>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400">Watch stories & reels anonymously with zero login</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 hover:opacity-95 transition-opacity"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Handle</span>
            </Link>
          </div>

          {/* Article Sections */}
          <div className="space-y-6 pt-2">
            {post.content.map((sec, idx) => (
              <section key={idx} className="space-y-3">
                {sec.heading && (
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {sec.heading}
                  </h2>
                )}
                {sec.text && (
                  <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {sec.text}
                  </p>
                )}
                {sec.bullets && (
                  <ul className="space-y-2 pt-1 pl-2">
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-zinc-500">
        <p>&copy; 2026 InstaView. Free and Anonymous Instagram Viewer.</p>
      </footer>
    </div>
  );
}
