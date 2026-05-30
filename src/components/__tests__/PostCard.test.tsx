import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/content";

// Mock @/i18n/navigation Link
vi.mock("@/i18n/navigation", () => ({
  Link: (props: { href?: string; children?: React.ReactNode; [key: string]: unknown }) => (
    <a href={props.href}>{props.children}</a>
  ),
}));

const mockPost: Post = {
  title: "Getting Started with openDesk",
  date: "2024-03-15",
  description: "Learn how to deploy openDesk for your university.",
  categories: ["Tutorial"],
  tags: ["setup", "deployment"],
  htmlContent: "<p>Content here</p>",
  slug: "getting-started",
  section: "blog",
  readingTime: 5,
};

describe("PostCard", () => {
  it("renders the post title", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("Getting Started with openDesk")).toBeInTheDocument();
  });

  it("renders the formatted date", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("March 15, 2024")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("Learn how to deploy openDesk for your university.")).toBeInTheDocument();
  });

  it("renders category badges", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("Tutorial")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("setup")).toBeInTheDocument();
    expect(screen.getByText("deployment")).toBeInTheDocument();
  });

  it("links to the correct post URL", () => {
    render(<PostCard post={mockPost} />);
    const link = screen.getByText("Getting Started with openDesk").closest("a");
    expect(link).toHaveAttribute("href", "/blog/getting-started");
  });

  it("has datetime attribute on time element", () => {
    render(<PostCard post={mockPost} />);
    const time = screen.getByText("March 15, 2024").closest("time");
    expect(time).toHaveAttribute("datetime", "2024-03-15");
  });

  it("renders without description when absent", () => {
    const postNoDesc: Post = { ...mockPost, description: undefined };
    render(<PostCard post={postNoDesc} />);
    expect(screen.queryByText("Learn how to deploy")).not.toBeInTheDocument();
  });
});
