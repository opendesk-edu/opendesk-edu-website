import Image from "next/image";
import EmailLink from "@/components/EmailLink";
import { getAllPosts } from "@/lib/content";
import { SECTION_INFO } from "@/lib/content";
import { SITE_NAME } from "@/lib/config";
import PostCard from "@/components/PostCard";
import {Link} from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{locale: string}>;
}

export default async function Home({ params }: PageProps) {
  const {locale} = await params;
  const t = await getTranslations();
  const allPosts = await getAllPosts(locale);
  const blogPosts = allPosts.filter(p => p.section === 'blog');
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="mb-6 flex justify-center">
          <Image
            src="/static/brand/icon.svg"
            alt={`${SITE_NAME} logo`}
            width={120}
            height={120}
            priority
          />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">{SITE_NAME}</h1>
        <h2 className="text-lg text-foreground-secondary mb-4">
          {t('hero.subtitle')}
        </h2>
        <p className="text-foreground-secondary mb-8 max-w-2xl mx-auto">
          {t('hero.description')}
        </p>
        
        {/* Visual Enhancement - Service Icon Set */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/static/brand/banner.svg"
            alt=""
            width={400}
            height={120}
            priority
            className="opacity-80 max-w-full h-auto"
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
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
      </section>

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
  );
}
