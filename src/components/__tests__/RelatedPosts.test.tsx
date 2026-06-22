import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RelatedPosts from "@/components/RelatedPosts";
import type { Post } from "@/lib/content";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/content", () => ({
  getAllPosts: vi.fn(),
  getPostsBySection: vi.fn(),
}));

vi.mock("@/lib/blur", () => ({
  BLUR_TEASER: "data:image/svg+xml;base64,mock",
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock("@/lib/format", () => ({
  formatDate: (date: string) => date,
}));

import { getAllPosts, getPostsBySection } from "@/lib/content";

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    title: "Test Post",
    slug: "test-post",
    section: "blog",
    date: "2026-01-01",
    description: "A test post",
    categories: ["general"],
    tags: ["test"],
    htmlContent: "<p>Test</p>",
    readingTime: 1,
    ...overrides,
  };
}

const mockGetAllPosts = getAllPosts as ReturnType<typeof vi.fn>;
const mockGetPostsBySection = getPostsBySection as ReturnType<typeof vi.fn>;

describe("RelatedPosts", () => {
  it("returns null when no related posts exist", async () => {
    mockGetAllPosts.mockResolvedValue([makePost()]);
    const currentPost = makePost({ slug: "test-post" });
    const result = await RelatedPosts({ currentPost, locale: "en" });
    expect(result).toBeNull();
  });

  it("shows posts with matching tags", async () => {
    const currentPost = makePost({ slug: "current", tags: ["tag1", "tag2"] });
    const related = [
      makePost({ slug: "related-1", title: "Related One", tags: ["tag1"] }),
      makePost({ slug: "related-2", title: "Related Two", tags: ["tag2"] }),
      makePost({ slug: "unrelated", title: "Unrelated", tags: ["other"] }),
    ];
    mockGetAllPosts.mockResolvedValue([currentPost, ...related]);
    const { container } = render(await RelatedPosts({ currentPost, locale: "en" }));
    expect(screen.getByText("Related Posts")).toBeInTheDocument();
    expect(container.textContent).toContain("Related One");
    expect(container.textContent).toContain("Related Two");
  });

  it("sorts matching posts by shared tag count", async () => {
    const currentPost = makePost({ slug: "current", tags: ["a", "b", "c"] });
    const related = [
      makePost({ slug: "most", title: "Most Matches", tags: ["a", "b", "c"] }),
      makePost({ slug: "less", title: "Less Matches", tags: ["a"] }),
    ];
    mockGetAllPosts.mockResolvedValue([currentPost, ...related]);
    const { container } = render(await RelatedPosts({ currentPost, locale: "en" }));
    const text = container.textContent!;
    expect(text.indexOf("Most Matches")).toBeLessThan(text.indexOf("Less Matches"));
  });

  it("falls back to same-section posts when no tag matches", async () => {
    const currentPost = makePost({ slug: "current", section: "blog", tags: [] });
    const fallbackPosts = [
      makePost({ slug: "fb-1", title: "Fallback One", section: "blog" }),
      makePost({ slug: "fb-2", title: "Fallback Two", section: "blog" }),
    ];
    mockGetAllPosts.mockResolvedValue([currentPost, ...fallbackPosts]);
    mockGetPostsBySection.mockResolvedValue(fallbackPosts);
    const { container } = render(await RelatedPosts({ currentPost, locale: "en" }));
    expect(container.textContent).toContain("Fallback One");
  });

  it("limits display to 3 posts", async () => {
    const currentPost = makePost({ slug: "current", tags: ["shared"] });
    const manyRelated = Array.from({ length: 5 }, (_, i) =>
      makePost({ slug: `p-${i}`, title: `Post ${i}`, tags: ["shared"] }),
    );
    mockGetAllPosts.mockResolvedValue([currentPost, ...manyRelated]);
    const { container } = render(await RelatedPosts({ currentPost, locale: "en" }));
    const links = container.querySelectorAll("a");
    expect(links.length).toBeLessThanOrEqual(3);
  });

  it("returns null when no posts exist after filtering out current", async () => {
    mockGetAllPosts.mockResolvedValue([makePost()]);
    const result = await RelatedPosts({ currentPost: makePost(), locale: "en" });
    expect(result).toBeNull();
  });
});
