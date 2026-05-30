import Image from "next/image";
import {Link} from '@/i18n/navigation';
import { formatDate } from "@/lib/format";
import { Tag, CategoryBadge, StatusBadge } from "@/components/Badges";
import type { Post } from "@/lib/content";

type LinkProps = React.ComponentProps<typeof Link>;
type Href = LinkProps['href'];

interface PostCardProps {
  post: Post;
  locale?: string;
}

export default function PostCard({ post, locale = 'en' }: PostCardProps) {
  const isBeta = post.categories?.includes('beta') || post.tags?.includes('beta');
  const isComponent = post.section === 'components';

  return (
    <article className="rounded-lg border border-border bg-background hover:shadow-lg transition-shadow">
      {post.image && (
        <Link href={`/${post.section}/${post.slug}` as Href} className="block">
          <Image
            src={post.image}
            alt=""
            width={1200}
            height={630}
            className="w-full rounded-t-lg aspect-[1200/630] object-cover"
          />
        </Link>
      )}
      <div className="p-6">
        <Link href={`/${post.section}/${post.slug}` as Href} className="block">
          <h3 className="text-lg font-semibold text-foreground hover:text-accent transition-colors mb-2">
            {post.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <time dateTime={post.date} className="text-sm text-foreground-secondary">
            {formatDate(post.date, locale)}
          </time>
          <span className="text-foreground-secondary mx-1.5">·</span>
          <span className="text-sm text-foreground-secondary">{post.readingTime} min read</span>
          {post.version && post.section === 'components' && (
            <span className="text-xs px-2 py-0.5 rounded bg-background-secondary text-foreground-secondary border border-border ml-auto">
              v{post.version}
            </span>
          )}
          {isComponent && (
            <StatusBadge status={isBeta ? "Beta" : "Stable"} />
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
      </div>
    </article>
  );
}
