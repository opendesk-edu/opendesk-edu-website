import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import PostList from "@/components/PostList";
import type { Post } from "@/lib/content";

vi.mock("@/i18n/navigation", () => ({
  Link: (props: { href?: string; children?: React.ReactNode; [key: string]: unknown }) => (
    <a href={props.href}>{props.children}</a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: { alt?: string; [key: string]: unknown }) => {
    const { width, height, ...rest } = props;
    return <img {...rest} />;
  },
}));

vi.mock("@/lib/format", () => ({
  formatDate: (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  },
}));

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    title: "Default Post",
    date: "2024-01-15",
    description: "A default description.",
    tags: ["default"],
    htmlContent: "<p>Content</p>",
    slug: "default-post",
    section: "blog",
    readingTime: 3,
    ...overrides,
  };
}

function getFilterGroup() {
  return screen.getByRole("group", { name: "Filter by topic" });
}

describe("PostList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders posts in a grid", () => {
    const posts = [makePost({ title: "Post One" }), makePost({ title: "Post Two" })];
    render(<PostList posts={posts} section="blog" locale="en" />);

    expect(screen.getByText("Post One")).toBeInTheDocument();
    expect(screen.getByText("Post Two")).toBeInTheDocument();
  });

  it("returns null when posts array is empty", () => {
    const { container } = render(<PostList posts={[]} section="blog" locale="en" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders filter pills for tags and categories", () => {
    const posts = [
      makePost({ tags: ["alpha", "beta"], categories: ["guide"] }),
    ];
    render(<PostList posts={posts} section="blog" locale="en" />);

    const group = getFilterGroup();
    expect(within(group).getByText("All")).toBeInTheDocument();
    expect(within(group).getByText("guide")).toBeInTheDocument();
    expect(within(group).getByText("alpha")).toBeInTheDocument();
    expect(within(group).getByText("beta")).toBeInTheDocument();
  });

  it("filters posts by tag when a filter pill is clicked", () => {
    const posts = [
      makePost({ title: "Security Post", tags: ["security"], slug: "security-post" }),
      makePost({ title: "General Post", tags: ["general"], slug: "general-post" }),
    ];
    render(<PostList posts={posts} section="blog" locale="en" />);

    const group = getFilterGroup();
    fireEvent.click(within(group).getByText("security"));

    expect(screen.getByText("Security Post")).toBeInTheDocument();
    expect(screen.queryByText("General Post")).not.toBeInTheDocument();
  });

  it("filters posts by category when a category pill is clicked", () => {
    const posts = [
      makePost({ title: "Tutorial Post", categories: ["Tutorial"], slug: "tutorial-post" }),
      makePost({ title: "News Post", categories: ["News"], slug: "news-post" }),
    ];
    render(<PostList posts={posts} section="blog" locale="en" />);

    const group = getFilterGroup();
    fireEvent.click(within(group).getByText("Tutorial"));

    expect(screen.getByText("Tutorial Post")).toBeInTheDocument();
    expect(screen.queryByText("News Post")).not.toBeInTheDocument();
  });

  it("resets to page 1 when filter changes", () => {
    const posts = Array.from({ length: 24 }, (_, i) =>
      makePost({
        title: `Post ${i + 1}`,
        tags: i < 12 ? ["group-a"] : ["group-b"],
        slug: `post-${i + 1}`,
      })
    );
    render(<PostList posts={posts} section="blog" locale="en" />);

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Next »"));
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();

    const group = getFilterGroup();
    fireEvent.click(within(group).getByText("group-a"));

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Next »")).toBeInTheDocument();
  });

  it("shows pagination controls when there are more than 10 posts", () => {
    const posts = Array.from({ length: 15 }, (_, i) =>
      makePost({ title: `Post ${i + 1}`, slug: `post-${i + 1}` })
    );
    render(<PostList posts={posts} section="blog" locale="en" />);

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Next »")).toBeInTheDocument();
  });

  it("shows only the first 10 posts on page 1", () => {
    const posts = Array.from({ length: 12 }, (_, i) =>
      makePost({ title: `Post ${i + 1}`, slug: `post-${i + 1}` })
    );
    render(<PostList posts={posts} section="blog" locale="en" />);

    expect(screen.getByText("Post 1")).toBeInTheDocument();
    expect(screen.getByText("Post 10")).toBeInTheDocument();
    expect(screen.queryByText("Post 11")).not.toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    const posts = Array.from({ length: 12 }, (_, i) =>
      makePost({ title: `Post ${i + 1}`, slug: `post-${i + 1}` })
    );
    render(<PostList posts={posts} section="blog" locale="en" />);

    const prevButton = screen.getByText("« Previous").closest("button");
    expect(prevButton).toBeDisabled();
  });

  it("disables next button on last page", () => {
    const posts = Array.from({ length: 12 }, (_, i) =>
      makePost({ title: `Post ${i + 1}`, slug: `post-${i + 1}` })
    );
    render(<PostList posts={posts} section="blog" locale="en" />);

    fireEvent.click(screen.getByText("Next »"));

    const nextButton = screen.getByText("Next »").closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("renders post image when available", () => {
    const posts = [makePost({ image: "/static/test.png", slug: "img-post" })];
    render(<PostList posts={posts} section="blog" locale="en" />);

    const img = screen.getByAltText("Default Post");
    expect(img).toBeInTheDocument();
  });

  it("does not render image container when post has no image", () => {
    const posts = [makePost({ image: undefined, slug: "no-img-post" })];
    const { container } = render(<PostList posts={posts} section="blog" locale="en" />);

    const img = container.querySelector("img");
    expect(img).not.toBeInTheDocument();
  });
});
