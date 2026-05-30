"use client";

import { Link } from "@/i18n/navigation";
import type { Post } from "@/lib/content";
import { StatusBadge, CategoryBadge } from "@/components/Badges";

const CATEGORY_GROUP: Record<string, string> = {
  communication: "Communication & Collaboration",
  storage: "File Management",
  productivity: "Office & Productivity",
  education: "Learning & Education",
};

function getPrimaryGroup(post: Post): string {
  for (const cat of post.categories ?? []) {
    if (CATEGORY_GROUP[cat]) return CATEGORY_GROUP[cat];
  }
  return "Other";
}

interface ComponentGridProps {
  posts: Post[];
}

type LinkProps = React.ComponentProps<typeof Link>;
type Href = LinkProps['href'];

export default function ComponentGrid({ posts }: ComponentGridProps) {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const group = getPrimaryGroup(post);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(post);
  }

  function getStatus(post: Post): "Stable" | "Beta" {
    if (post.categories?.includes("beta")) return "Beta";
    return "Stable";
  }

  return (
    <div className="space-y-12">
      {Array.from(groups.entries()).map(([group, groupPosts]) => (
        <div key={group}>
          <h2 className="text-2xl font-bold text-foreground mb-6">{group}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/${post.section}/${post.slug}` as Href}
                className="block rounded-lg border border-border bg-background p-5 hover:shadow-lg hover:border-accent/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{post.title}</h3>
                  <StatusBadge status={getStatus(post)} />
                </div>
                {post.description && (
                  <p className="text-sm text-foreground-secondary line-clamp-2 mb-3">
                    {post.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags?.slice(0, 3).map((tag) => (
                    <CategoryBadge key={tag}>{tag}</CategoryBadge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
