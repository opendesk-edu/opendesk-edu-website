"use client";

import { Link } from "@/i18n/navigation";
import type { Post } from "@/lib/content";
import { StatusBadge, CategoryBadge } from "@/components/Badges";

const CATEGORY_GROUP: Record<string, string> = {
  "scientific-computing": "Scientific Computing & Research",
  research: "Scientific Computing & Research",
  ai: "Scientific Computing & Research",
  communication: "Communication & Collaboration",
  collaboration: "Communication & Collaboration",
  storage: "File Storage & Sync",
  productivity: "Office & Productivity",
  office: "Office & Productivity",
  "document-editing": "Office & Productivity",
  "note-taking": "Office & Productivity",
  diagramming: "Office & Productivity",
  lms: "Learning Management",
  "e-learning": "Learning Management",
  education: "Learning & Education",
  teaching: "Learning & Education",
  "project-management": "Project & Knowledge Management",
  documentation: "Project & Knowledge Management",
  portal: "Portal & Infrastructure",
  infrastructure: "Portal & Infrastructure",
  cms: "Portal & Infrastructure",
  security: "Portal & Infrastructure",
};

function getPrimaryGroup(post: Post): string {
  for (const cat of post.categories ?? []) {
    if (CATEGORY_GROUP[cat]) return CATEGORY_GROUP[cat];
  }
  return "Other";
}

type Status = "Stable" | "Beta" | "Planned";

function getStatus(post: Post): Status {
  if (post.categories?.includes("planned")) return "Planned";
  if (post.categories?.includes("beta")) return "Beta";
  return "Stable";
}

interface ComponentGridProps {
  posts: Post[];
}

type LinkProps = React.ComponentProps<typeof Link>;
type Href = LinkProps['href'];

const GROUP_ORDER = [
  "Scientific Computing & Research",
  "Communication & Collaboration",
  "File Storage & Sync",
  "Office & Productivity",
  "Learning & Education",
  "Learning Management",
  "Project & Knowledge Management",
  "Portal & Infrastructure",
  "Other",
];

export default function ComponentGrid({ posts }: ComponentGridProps) {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    // Skip the compare.md page — it's not a real component
    if (post.slug === "compare") continue;
    const group = getPrimaryGroup(post);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(post);
  }

  const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
    const ai = GROUP_ORDER.indexOf(a[0]);
    const bi = GROUP_ORDER.indexOf(b[0]);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return (
    <div className="space-y-16">
      {sortedGroups.map(([group, groupPosts]) => (
        <div key={group}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">{group}</h2>
            <p className="text-sm text-foreground-secondary mt-1">
              {groupPosts.length} {groupPosts.length === 1 ? "service" : "services"}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {groupPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/${post.section}/${post.slug}` as Href}
                className="group block rounded-xl border border-border bg-background p-6 hover:shadow-lg hover:border-accent/30 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <span className="shrink-0">
                    <StatusBadge status={getStatus(post)} />
                  </span>
                </div>
                {post.description && (
                  <p className="text-sm text-foreground-secondary line-clamp-2 mb-4 leading-relaxed">
                    {post.description}
                  </p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags?.slice(0, 3).map((tag) => (
                      <CategoryBadge key={tag}>{tag}</CategoryBadge>
                    ))}
                  </div>
                  {post.version && (
                    <span className="text-xs text-foreground-secondary shrink-0 font-mono">
                      v{post.version}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
