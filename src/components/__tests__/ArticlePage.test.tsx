import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ArticlePage from "@/components/ArticlePage";
import type { Post } from "@/lib/content";

// Mock @/i18n/navigation Link
vi.mock("@/i18n/navigation", () => ({
  Link: (props: { href?: string; children?: React.ReactNode; [key: string]: unknown }) => (
    <a href={props.href}>{props.children}</a>
  ),
}));

vi.mock("@/lib/config", () => ({
  SITE_URL: "https://opendesk-edu.org",
  SITE_NAME: "openDesk Edu",
}));

vi.mock("@/components/TableOfContents", () => ({
  default: () => <nav data-testid="toc">TOC</nav>,
}));

const mockPost: Post = {
  title: "Getting Started with openDesk",
  date: "2024-03-15",
  description: "A guide to deploying openDesk.",
  categories: ["Tutorial"],
  tags: ["setup", "deployment"],
  htmlContent: '<h2 id="overview">Overview</h2><p>Content here.</p>',
  slug: "getting-started",
  section: "blog",
};

describe("ArticlePage", () => {
  it("renders the post title", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getAllByText("Getting Started with openDesk").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the formatted date", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getByText("March 15, 2024")).toBeInTheDocument();
  });

  it("renders category badges", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getByText("Tutorial")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getByText("setup")).toBeInTheDocument();
    expect(screen.getByText("deployment")).toBeInTheDocument();
  });

  it("renders the back link with correct href", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getByText(/Back to Blog/)).toHaveAttribute("href", "/blog");
  });

  it("renders JSON-LD BlogPosting structured data", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    const data = JSON.parse(script!.textContent!);
    expect(data["@type"]).toBe("BlogPosting");
    expect(data.headline).toBe("Getting Started with openDesk");
    expect(data.url).toBe("https://opendesk-edu.org/en/blog/getting-started");
  });

  it("renders the HTML content", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getByText("Content here.")).toBeInTheDocument();
  });
});
