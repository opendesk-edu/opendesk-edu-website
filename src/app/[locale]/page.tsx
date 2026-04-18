import Image from "next/image";
import EmailLink from "@/components/EmailLink";
import { getAllPosts } from "@/lib/content";
import { SECTION_INFO } from "@/lib/content";
import { SITE_NAME } from "@/lib/config";
import PostCard from "@/components/PostCard";
import {Link} from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type {Metadata} from 'next';
import '../hero.css';

const HOME_TITLES: Record<string, string> = {
  en: `${SITE_NAME} — Open-Source Digital Workplace for Higher Education`,
  de: `${SITE_NAME} — Open-Source-Digitalarbeitsplatz für Hochschulen`,
  fr: `${SITE_NAME} — Espace de travail numérique open source`,
  zh: `${SITE_NAME} — 面向高等教育的开源数字化工作平台`,
};

interface PageProps {
  params: Promise<{locale: string}>;
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  return {
    title: HOME_TITLES[locale] ?? HOME_TITLES.en,
  };
}

export default async function Home({ params }: PageProps) {
  const {locale} = await params;
  const t = await getTranslations();
  const allPosts = await getAllPosts(locale);
  const blogPosts = allPosts.filter(p => p.section === 'blog');
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <>
      {/* Full-screen Animated Hero */}
      <section className="hero-background">
        <div className="hero-gradient" />
        <div className="hero-grid" />
        <div className="hero-dot-grid" />

        {/* Floating particles */}
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
        <div className="particle particle-6" />
        <div className="particle particle-7" />
        <div className="particle particle-8" />

        {/* Pulsing glow blobs */}
        <div className="glow-blob-1" />
        <div className="glow-blob-2" />
        <div className="glow-blob-3" />

        {/* Connection lines */}
        <div className="connection-line connection-1" />
        <div className="connection-line connection-2" />
        <div className="connection-line connection-3" />

        {/* Edge accents */}
        <div className="hero-edge-left" />
        <div className="hero-edge-right" />

        {/* Hero content */}
        <div className="hero-content">
          <div className="mb-6 flex justify-center">
            <Image
              src="/static/brand/icon.svg"
              alt={`${SITE_NAME} logo`}
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="hero-title">{SITE_NAME}</h1>
          <p className="hero-subtitle">
            {t('hero.subtitle')}
          </p>
          <p className="hero-description">
            {t('hero.description')}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {SECTION_INFO.map((section) => (
              <Link
                key={section.slug}
                href={`/${section.slug}` as React.ComponentProps<typeof Link>['href']}
                className="rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-button transition-colors"
              >
                {section.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Page content below hero */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Latest Posts */}
        {blogPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('sections.latestArticles')}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <PostCard key={`${post.section}/${post.slug}`} post={post} locale={locale} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href={"/blog" as React.ComponentProps<typeof Link>['href']}
                className="text-accent hover:text-accent-button transition-colors font-semibold"
              >
                {t('sections.viewAll')}
              </Link>
            </div>
          </section>
        )}

        {/* Contact */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('home.getInTouch')}</h2>
          <p className="text-foreground-secondary mb-4">
            {t('home.getInTouchDescription')}
          </p>
          <EmailLink className="text-accent hover:text-accent-button transition-colors font-semibold">
            info@opendesk-edu.org
          </EmailLink>
        </section>
      </div>
    </>
  );
}
