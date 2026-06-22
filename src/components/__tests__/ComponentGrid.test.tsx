import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ComponentGrid from "@/components/ComponentGrid";
import type { Post } from "@/lib/content";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/components/Badges", () => ({
  StatusBadge: ({ status, className }: { status: string; className?: string }) => (
    <span data-testid="status-badge" data-status={status} className={className}>{status}</span>
  ),
  CategoryBadge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="category-badge">{children}</span>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    title: "Test Component",
    slug: "test-component",
    section: "components",
    date: "2026-01-01",
    description: "A test component",
    categories: ["collaboration"],
    tags: ["test"],
    ...overrides,
  };
}

describe("ComponentGrid", () => {
  it("renders a heading for each category group", () => {
    const posts = [
      makePost({ title: "Jitsi", categories: ["communication"], slug: "jitsi" }),
      makePost({ title: "Nextcloud", categories: ["storage"], slug: "nextcloud" }),
      makePost({ title: "ILIAS", categories: ["lms"], slug: "ilias" }),
    ];
    render(<ComponentGrid posts={posts} />);
    expect(screen.getByText("Communication & Collaboration")).toBeInTheDocument();
    expect(screen.getByText("File Storage & Sync")).toBeInTheDocument();
    expect(screen.getByText("Learning Management")).toBeInTheDocument();
  });

  it("groups posts under the correct category heading", () => {
    const posts = [
      makePost({ title: "Element", categories: ["communication"] }),
      makePost({ title: "Moodle", categories: ["lms"] }),
    ];
    render(<ComponentGrid posts={posts} />);
    expect(screen.getByText("Communication & Collaboration")).toBeInTheDocument();
    expect(screen.getByText("Learning Management")).toBeInTheDocument();
    expect(screen.getByText("Element")).toBeInTheDocument();
    expect(screen.getByText("Moodle")).toBeInTheDocument();
  });

  it("shows StatusBadge with 'Stable' for posts without beta/planned categories", () => {
    const posts = [makePost({ categories: ["collaboration"] })];
    render(<ComponentGrid posts={posts} />);
    const badges = screen.getAllByTestId("status-badge");
    expect(badges[0]).toHaveAttribute("data-status", "Stable");
  });

  it("shows StatusBadge with 'Beta' for posts with beta category", () => {
    const posts = [makePost({ categories: ["collaboration", "beta"] })];
    render(<ComponentGrid posts={posts} />);
    const badges = screen.getAllByTestId("status-badge");
    expect(badges[0]).toHaveAttribute("data-status", "Beta");
  });

  it("shows StatusBadge with 'Planned' for posts with planned category", () => {
    const posts = [makePost({ categories: ["collaboration", "planned"] })];
    render(<ComponentGrid posts={posts} />);
    const badges = screen.getAllByTestId("status-badge");
    expect(badges[0]).toHaveAttribute("data-status", "Planned");
  });

  it("places unknown categories in 'Other' group", () => {
    const posts = [makePost({ categories: ["unknown-category"] })];
    render(<ComponentGrid posts={posts} />);
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("renders a link for each post", () => {
    const posts = [
      makePost({ slug: "comp-a", title: "Comp A" }),
      makePost({ slug: "comp-b", title: "Comp B" }),
    ];
    render(<ComponentGrid posts={posts} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it("renders CategoryBadge for each post category", () => {
    const posts = [makePost({ categories: ["collaboration", "storage"] })];
    render(<ComponentGrid posts={posts} />);
    const badges = screen.getAllByTestId("category-badge");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state with no posts", () => {
    render(<ComponentGrid posts={[]} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
