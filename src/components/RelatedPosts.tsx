import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { getPostsBySection, getAllPosts } from "@/lib/content";
import type { Post } from "@/lib/content";

interface RelatedPostsProps {
  currentPost: Post;
  locale: string;
}

export default async function RelatedPosts({
  currentPost,
  locale,
}: RelatedPostsProps) {
  // Find posts sharing tags with current post
  let related = await getAllPosts(locale);
  related = related.filter((p) => p.slug !== currentPost.slug);

  if (related.length === 0) return null;

  // Score by shared tag count
  const currentTags = currentPost.tags ?? [];
  if (currentTags.length > 0) {
    related.sort((a, b) => {
      const aMatch = (a.tags ?? []).filter((t) => currentTags.includes(t)).length;
      const bMatch = (b.tags ?? []).filter((t) => currentTags.includes(t)).length;
      return bMatch - aMatch;
    });

    // Filter to only those with at least 1 matching tag if any exist
    const withTags = related.filter((p) =>
      (p.tags ?? []).some((t) => currentTags.includes(t))
    );
    if (withTags.length > 0) {
      related = withTags;
    }
  }

  // Fallback: same section posts sorted by date
  if (related.length === 0) {
    related = await getPostsBySection(currentPost.section, locale);
    related = related.filter((p) => p.slug !== currentPost.slug);
  }

  const displayPosts = related.slice(0, 3);
  if (displayPosts.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 pb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6 mt-16">
        Related Posts
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {displayPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/${post.section}/${post.slug}` as React.ComponentProps<typeof Link>["href"]}
            className="rounded-lg border border-border bg-background hover:shadow-lg transition-shadow p-6 block group"
          >
            {post.image && (
              <img
                src={post.image}
                alt=""
                className="w-full rounded-lg aspect-[1200/630] object-cover mb-4"
              />
            )}
            <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
              {post.title}
            </h3>
            <time
              dateTime={post.date}
              className="text-sm text-foreground-secondary block mb-3"
            >
              {formatDate(post.date, locale)}
            </time>
            {post.description && (
              <p className="text-sm text-foreground-secondary line-clamp-2">
                {post.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
