"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { Tag, CategoryBadge, StatusBadge } from "@/components/Badges";
import { BLUR_TEASER } from "@/lib/blur";
import type { Post } from "@/lib/content";

const ITEMS_PER_PAGE = 10;
/** Number of filter chips shown before the "show all filters" toggle. */
const MAX_VISIBLE_FILTERS = 14;

interface PostListProps {
  posts: Post[];
  section: string;
  locale: string;
}

export default function PostList({ posts, section, locale }: PostListProps) {
  const t = useTranslations("section");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showAllFilters, setShowAllFilters] = useState(false);

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

  // Rank filters by how many posts use them so the most relevant chips surface
  // when the list is collapsed. Categories are shown ahead of tags.
  const filterFreq = useMemo(() => {
    const freq = new Map<string, number>();
    for (const post of posts) {
      post.categories?.forEach((c) => freq.set(c, (freq.get(c) ?? 0) + 1));
      post.tags?.forEach((tag) => freq.set(tag, (freq.get(tag) ?? 0) + 1));
    }
    return freq;
  }, [posts]);

  const categorySet = useMemo(() => new Set(allFilters.categories), [allFilters]);
  const orderedFilters = useMemo(() => {
    const byFreq = (a: string, b: string) => (filterFreq.get(b) ?? 0) - (filterFreq.get(a) ?? 0);
    const cats = [...allFilters.categories].sort(byFreq);
    const tags = [...allFilters.tags].sort(byFreq);
    return [...cats, ...tags];
  }, [allFilters, filterFreq]);

  const hasMoreFilters = orderedFilters.length > MAX_VISIBLE_FILTERS;
  const hiddenFilterCount = Math.max(0, orderedFilters.length - MAX_VISIBLE_FILTERS);
  const visibleFilters = showAllFilters
    ? orderedFilters
    : orderedFilters.slice(0, MAX_VISIBLE_FILTERS);

  const filteredPosts = useMemo(() => {
    if (!activeFilter) return posts;
    return posts.filter(
      (post) =>
        post.tags?.includes(activeFilter) ||
        post.categories?.includes(activeFilter)
    );
  }, [posts, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const startIndex = (currentPageClamped - 1) * ITEMS_PER_PAGE;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFilter = (filter: string | null) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  if (posts.length === 0) return null;

  const hasFilters = allFilters.categories.length > 0 || allFilters.tags.length > 0;

  const chipClass = (isActive: boolean) =>
    `px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
      isActive
        ? "bg-accent text-white"
        : "bg-background-secondary text-foreground-secondary hover:bg-border"
    }`;

  return (
    <>
      {hasFilters && (
        <div className="mb-8">
          <div
            className={`flex flex-wrap gap-2 ${
              showAllFilters ? "max-h-72 overflow-y-auto" : ""
            }`}
            role="group"
            aria-label="Filter by topic"
          >
            <button
              onClick={() => handleFilter(null)}
              className={chipClass(activeFilter === null)}
            >
              {t("filterAll")}
            </button>
            {visibleFilters.map((filter) => {
              const isCat = categorySet.has(filter);
              return (
                <button
                  key={`${isCat ? "cat" : "tag"}-${filter}`}
                  onClick={() => handleFilter(filter)}
                  className={chipClass(activeFilter === filter)}
                >
                  {filter}
                </button>
              );
            })}
          </div>
          {hasMoreFilters && (
            <button
              onClick={() => setShowAllFilters((v) => !v)}
              className="mt-3 text-sm font-medium text-accent hover:underline transition-colors"
            >
              {showAllFilters
                ? t("showLessFilters")
                : t("showAllFilters", { count: hiddenFilterCount })}
            </button>
          )}
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
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={1200}
                    height={630}
                    placeholder="blur"
                    blurDataURL={BLUR_TEASER}
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
            disabled={currentPageClamped === 1}
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("previous")}
          </button>
          <span className="text-sm text-foreground-secondary">
            {t("pageOf", {
              current: currentPageClamped,
              total: totalPages,
            })}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPageClamped === totalPages}
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("next")}
          </button>
        </div>
      )}
    </>
  );
}