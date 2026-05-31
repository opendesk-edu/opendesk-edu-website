"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { Tag, CategoryBadge, StatusBadge } from "@/components/Badges";
import type { Post } from "@/lib/content";

const ITEMS_PER_PAGE = 10;

interface PostListProps {
  posts: Post[];
  section: string;
  locale: string;
}

export default function PostList({ posts, section, locale }: PostListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const allFilters = useMemo(() => {
    const tagSet = new Set<string>();
    const catSet = new Set<string>();
    for (const post of posts) {
      post.tags?.forEach((t) => tagSet.add(t));
      post.categories?.forEach((c) => catSet.add(c));
    }
    return {
      tags: [...tagSet].sort(),
      categories: [...catSet].sort(),
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!activeFilter) return posts;
    return posts.filter(
      (post) =>
        post.tags?.includes(activeFilter) ||
        post.categories?.includes(activeFilter)
    );
  }, [posts, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFilter = (filter: string | null) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  if (posts.length === 0) return null;

  const hasFilters = allFilters.categories.length > 0 || allFilters.tags.length > 0;

  return (
    <>
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by topic">
          <button
            onClick={() => handleFilter(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeFilter === null
                ? "bg-accent text-white"
                : "bg-background-secondary text-foreground-secondary hover:bg-border"
            }`}
          >
            All
          </button>
          {allFilters.categories.map((cat) => (
            <button
              key={`cat-${cat}`}
              onClick={() => handleFilter(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeFilter === cat
                  ? "bg-accent text-white"
                  : "bg-background-secondary text-foreground-secondary hover:bg-border"
              }`}
            >
              {cat}
            </button>
          ))}
          {allFilters.tags.map((tag) => (
            <button
              key={`tag-${tag}`}
              onClick={() => handleFilter(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeFilter === tag
                  ? "bg-accent text-white"
                  : "bg-background-secondary text-foreground-secondary hover:bg-border"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {visiblePosts.map((post) => {
          const isBeta =
            post.categories?.includes("beta") || post.tags?.includes("beta");
          const isComponent = post.section === "components";

          return (
            <div
              key={post.slug}
              className="rounded-lg border border-border bg-background hover:shadow-lg transition-shadow"
            >
              {post.image && (
                <Link
                  href={`/${section}/${post.slug}` as React.ComponentProps<typeof Link>["href"]}
                  className="block"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full rounded-t-lg aspect-[1200/630] object-cover"
                  />
                </Link>
              )}
              <div className="p-6">
                <Link
                  href={`/${section}/${post.slug}` as React.ComponentProps<typeof Link>["href"]}
                  className="group"
                >
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-2 mb-3">
                    <time
                      dateTime={post.date}
                      className="text-sm text-foreground-secondary"
                    >
                      {formatDate(post.date, locale)}
                    </time>
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
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            « Previous
          </button>
          <span className="text-sm text-foreground-secondary">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next »
          </button>
        </div>
      )}
    </>
  );
}
