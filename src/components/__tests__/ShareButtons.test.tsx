import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ShareButtons from "@/components/ShareButtons";

describe("ShareButtons", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn() },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document, "title", {
      value: "Test Page",
      writable: true,
      configurable: true,
    });
  });

  it("renders all share buttons", () => {
    render(<ShareButtons url="https://opendesk-edu.org/test" />);
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Matrix")).toBeInTheDocument();
  });

  it("renders LinkedIn share link with encoded URL", () => {
    render(<ShareButtons url="https://opendesk-edu.org/test" />);
    const linkedinLink = screen.getByLabelText("Share on LinkedIn");
    expect(linkedinLink).toHaveAttribute("href");
    expect(linkedinLink.getAttribute("href")).toContain("linkedin.com/sharing");
    expect(linkedinLink.getAttribute("href")).toContain(encodeURIComponent("https://opendesk-edu.org/test"));
  });

  it("renders Matrix share link", () => {
    render(<ShareButtons url="https://opendesk-edu.org/test" />);
    const matrixLink = screen.getByLabelText("Share on Matrix");
    expect(matrixLink).toHaveAttribute("href");
    expect(matrixLink.getAttribute("href")).toContain("matrix.to");
  });

  it("opens links in new tab with noopener", () => {
    render(<ShareButtons url="https://opendesk-edu.org/test" />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("has correct aria-labels for sharing buttons", () => {
    render(<ShareButtons url="https://opendesk-edu.org/test" />);
    expect(screen.getByLabelText("Share on LinkedIn")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on Matrix")).toBeInTheDocument();
  });

  it("has share section heading", () => {
    render(<ShareButtons url="https://opendesk-edu.org/test" />);
    expect(screen.getByText("Share this article")).toBeInTheDocument();
  });
});
