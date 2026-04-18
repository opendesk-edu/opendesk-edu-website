import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { formatDate } from "@/lib/format";
import {
  getPostsBySection,
  getSectionBySlug,
  isValidSection,
  SECTION_INFO,
} from "@/lib/content";
import { SITE_NAME } from "@/lib/config";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Tag, CategoryBadge } from "@/components/Badges";

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

  return (
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
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
{posts.map((post) => {
              const isBeta = post.categories?.includes('beta') || post.tags?.includes('beta');
              const isComponent = post.section === 'components';
              
              return (
                <Link
                  key={post.slug}
                  href={`/${section}/${post.slug}` as React.ComponentProps<typeof Link>['href']}
                  className="rounded-lg border border-border bg-background p-6 hover:shadow-lg transition-shadow group"
                >
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-2 mb-3">
                    <time dateTime={post.date} className="text-sm text-foreground-secondary">
                      {formatDate(post.date, locale)}
                    </time>
                    {isComponent && isBeta && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Beta
                      </span>
                    )}
                  </div>
                  {post.description && (
                    <p className="text-sm text-foreground-secondary mb-4 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {post.categories?.map((category) => (
                      <CategoryBadge key={category}>{category}</CategoryBadge>
                    ))}
                    {post.tags?.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </Link>
              );
            })}
        </div>
      )}
    </main>
  );
}
