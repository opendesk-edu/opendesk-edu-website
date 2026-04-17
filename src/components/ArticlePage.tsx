import {Link} from '@/i18n/navigation';
import { formatDate } from "@/lib/format";
import { Tag, CategoryBadge } from "@/components/Badges";
import TableOfContents from "@/components/TableOfContents";
import type { Post } from "@/lib/content";
import { SITE_URL, SITE_NAME } from "@/lib/config";

type Href = React.ComponentProps<typeof Link>['href'];

interface ArticlePageProps {
  post: Post;
  backHref: string;
  backLabel: string;
  locale?: string;
}

export default function ArticlePage({ post, backHref, backLabel, locale = 'en' }: ArticlePageProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description ?? "",
    datePublished: post.date,
    dateModified: post.date,
    url: `${SITE_URL}/${locale}/${post.section}/${post.slug}`,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/static/brand/icon.svg`,
      },
    },
    mainEntityOfPage: `${SITE_URL}/${locale}/${post.section}/${post.slug}`,
    keywords: post.tags?.join(", ") ?? "",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-6xl mx-auto px-6 py-12">
        <Link
          href={backHref as Href}
          className="inline-flex items-center gap-1 text-sm text-foreground-secondary hover:text-foreground transition-colors mb-8"
        >
          &larr; Back to {backLabel}
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {post.title}
          </h1>
          <time dateTime={post.date} className="text-sm text-foreground-secondary block mb-4">
            {formatDate(post.date, locale)}
          </time>
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {post.categories.map((category) => (
                <CategoryBadge key={category}>{category}</CategoryBadge>
              ))}
            </div>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </header>

        <div className="flex gap-12">
          <div
            className="prose flex-1 min-w-0"
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          />
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24">
              <TableOfContents html={post.htmlContent} />
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
