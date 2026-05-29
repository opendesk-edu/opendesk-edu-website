"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { Tag, CategoryBadge } from "@/components/Badges";
import type { Post } from "@/lib/content";

const ITEMS_PER_PAGE = 10;

interface PostListProps {
  posts: Post[];
  section: string;
  locale: string;
}

export default function PostList({ posts, section, locale }: PostListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visiblePosts = posts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (posts.length === 0) return null;

  return (
    <>
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
                    alt=""
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
