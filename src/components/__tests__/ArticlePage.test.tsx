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

vi.mock("@/components/ShareButtons", () => ({
  default: () => (
    <div data-testid="share-buttons">
      <h3 className="text-sm font-semibold text-foreground mb-3">Share this article</h3>
      <button aria-label="Copy Link">Copy Link</button>
      <a aria-label="Share on X" href="#">X</a>
      <a aria-label="Share on LinkedIn" href="#">LinkedIn</a>
      <a aria-label="Share on Matrix" href="#">Matrix</a>
    </div>
  ),
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
  readingTime: 5,
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
  
  it("renders the author byline", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getByText(/By openDesk Edu/)).toBeInTheDocument();
  });

  it("renders reading time", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getByText(/5 min read/)).toBeInTheDocument();
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
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(2);
    const breadcrumb = JSON.parse(scripts[0].textContent!);
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(breadcrumb.itemListElement).toHaveLength(3);
    expect(breadcrumb.itemListElement[0].name).toBe("Home");
    expect(breadcrumb.itemListElement[2].name).toBe("Getting Started with openDesk");
    const blogPosting = JSON.parse(scripts[1].textContent!);
    expect(blogPosting["@type"]).toBe("BlogPosting");
    expect(blogPosting.headline).toBe("Getting Started with openDesk");
    expect(blogPosting.url).toBe("https://opendesk-edu.org/en/blog/getting-started");
  });

  it("renders the HTML content", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getByText("Content here.")).toBeInTheDocument();
  });
  
  it("renders the share buttons section", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getByText("Share this article")).toBeInTheDocument();
  });
  
  it("renders share buttons for each platform", () => {
    render(<ArticlePage post={mockPost} backHref="/blog" backLabel="Blog" />);
    expect(screen.getByLabelText("Copy Link")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on X")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on LinkedIn")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on Matrix")).toBeInTheDocument();
  });
});
