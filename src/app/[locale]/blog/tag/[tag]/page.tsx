import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getPostsByTag, getAllTags, getPostsBySection } from "@/lib/content";
import { SITE_URL, SITE_NAME } from "@/lib/config";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import PostList from "@/components/PostList";

export const revalidate = 3600;

interface TagPageProps {
  params: Promise<{ locale: string; tag: string }>;
}

export async function generateStaticParams() {
  const paths: { locale: string; tag: string }[] = [];
  for (const locale of routing.locales) {
    const tags = await getAllTags(locale);
    for (const tag of tags) {
      paths.push({ locale, tag });
    }
  }
  return paths;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { locale, tag } = await params;
  const posts = await getPostsByTag(tag, locale);

  if (posts.length === 0) return { title: SITE_NAME };

  const label = `${tag} — Blog`;

  return {
    title: `${label} | ${SITE_NAME}`,
    description: `Articles tagged with "${tag}" — ${posts.length} post${posts.length !== 1 ? "s" : ""}`,
    openGraph: {
      type: "website",
      title: label,
      description: `Browse all articles tagged with "${tag}"`,
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog/tag/${tag}`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { locale, tag } = await params;

  const posts = await getPostsByTag(tag, locale);
  if (posts.length === 0) {
    notFound();
  }

  const t = await getTranslations("section");
  const allPosts = await getPostsBySection("blog", locale);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/${locale}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Tag: ${tag}`,
        item: `${SITE_URL}/${locale}/blog/tag/${tag}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Tag: {tag}
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl">
            {posts.length} article{posts.length !== 1 ? "s" : ""} tagged with
            &ldquo;{tag}&rdquo;
          </p>
        </div>

        {allPosts.length === 0 ? (
          <p className="text-foreground-secondary">{t("noPosts")}</p>
        ) : (
          <PostList posts={posts} section="blog" locale={locale} />
        )}
      </main>
    </>
  );
}
