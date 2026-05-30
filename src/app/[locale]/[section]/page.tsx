import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import {
  getPostsBySection,
  getSectionBySlug,
  isValidSection,
  SECTION_INFO,
} from "@/lib/content";
import { SITE_URL, SITE_NAME } from "@/lib/config";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import PostList from "@/components/PostList";
import ComponentGrid from "@/components/ComponentGrid";

interface SectionPageProps {
  params: Promise<{ locale: string; section: string }>;
}

export async function generateStaticParams() {
  const paths: { locale: string; section: string }[] = [];
  for (const section of SECTION_INFO) {
    for (const locale of routing.locales) {
      paths.push({ locale, section: section.slug });
    }
  }
  return paths;
}

export async function generateMetadata({
  params,
}: SectionPageProps): Promise<Metadata> {
  const { section } = await params;
  const sectionInfo = getSectionBySlug(section);
  if (!sectionInfo) return { title: SITE_NAME };

  return {
    title: `${sectionInfo.title} | ${SITE_NAME}`,
    description: sectionInfo.description,
    openGraph: {
      type: "website",
      title: sectionInfo.title,
      description: sectionInfo.description,
      siteName: SITE_NAME,
    },
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { locale, section } = await params;

  if (!isValidSection(section)) {
    notFound();
  }

  const sectionInfo = getSectionBySlug(section);
  if (!sectionInfo) {
    notFound();
  }

  const posts = await getPostsBySection(section, locale);
  const t = await getTranslations("section");
  
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: sectionInfo.title, item: `${SITE_URL}/${locale}/${section}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {sectionInfo.title}
        </h1>
        {sectionInfo.description && (
          <p className="text-lg text-foreground-secondary max-w-2xl">
            {sectionInfo.description}
          </p>
        )}
      </div>

        {posts.length === 0 ? (
        <p className="text-foreground-secondary">
          {t("noPosts")}
        </p>
      ) : section === "components" ? (
        <ComponentGrid posts={posts} />
      ) : (
        <PostList posts={posts} section={section} locale={locale} />
      )}
    </main>
    </>
  );
}
