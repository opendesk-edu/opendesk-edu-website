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

export const revalidate = 3600;

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
      <section className="hero-background" aria-label="Hero">
        <div className="hero-gradient" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-dot-grid" aria-hidden="true" />

        {/* Floating particles */}
        <div className="particle particle-1" aria-hidden="true" />
        <div className="particle particle-2" aria-hidden="true" />
        <div className="particle particle-3" aria-hidden="true" />
        <div className="particle particle-4" aria-hidden="true" />
        <div className="particle particle-5" aria-hidden="true" />
        <div className="particle particle-6" aria-hidden="true" />
        <div className="particle particle-7" aria-hidden="true" />
        <div className="particle particle-8" aria-hidden="true" />

        {/* Pulsing glow blobs */}
        <div className="glow-blob-1" aria-hidden="true" />
        <div className="glow-blob-2" aria-hidden="true" />
        <div className="glow-blob-3" aria-hidden="true" />

        {/* Connection lines */}
        <div className="connection-line connection-1" aria-hidden="true" />
        <div className="connection-line connection-2" aria-hidden="true" />
        <div className="connection-line connection-3" aria-hidden="true" />

        {/* Edge accents */}
        <div className="hero-edge-left" aria-hidden="true" />
        <div className="hero-edge-right" aria-hidden="true" />

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

          <div className="flex flex-wrap justify-center gap-3 mt-10 pt-6 border-t border-white/10">
            <a
              href="https://codeberg.org/opendesk-edu/opendesk-edu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors"
            >
              <CodebergLogo className="w-5 h-5" />
              Codeberg
            </a>
            <a
              href="https://github.com/opendesk-edu/opendesk-edu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors"
            >
              <GitHubLogo className="w-5 h-5" />
              GitHub
            </a>
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

function CodebergLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zm0 19.7c-5.1 0-9.2-4.1-9.2-9.2S6.9 2.8 12 2.8s9.2 4.1 9.2 9.2-4.1 9.2-9.2 9.2zm2.8-14.8c-.1 0-.2.1-.3.1l-2.4.8-2.4-.8c-.1-.1-.2-.1-.3-.1-.3 0-.5.2-.5.5v7.8c0 .3.2.5.5.5.1 0 .2 0 .3-.1l2.4-.8 2.4.8c.1.1.2.1.3.1.3 0 .5-.2.5-.5V7c0-.3-.2-.5-.5-.5z"/>
    </svg>
  );
}

function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .3C5.4.3 0 5.7 0 12.3c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.6 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.7 18.6.3 12 .3z"/>
    </svg>
  );
}
