import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tag, CategoryBadge, StatusBadge } from "@/components/Badges";

describe("Tag", () => {
  it("renders children text", () => {
    render(<Tag>javascript</Tag>);
    expect(screen.getByText("javascript")).toBeInTheDocument();
  });

  it("has rounded-full class for pill shape", () => {
    render(<Tag>test-tag</Tag>);
    const el = screen.getByText("test-tag");
    expect(el.className).toContain("rounded-full");
  });

  it("has border styling", () => {
    render(<Tag>styled</Tag>);
    const el = screen.getByText("styled");
    expect(el.className).toContain("border");
  });
});

describe("CategoryBadge", () => {
  it("renders children text", () => {
    render(<CategoryBadge>Tutorial</CategoryBadge>);
    expect(screen.getByText("Tutorial")).toBeInTheDocument();
  });

  it("has accent-related styling", () => {
    render(<CategoryBadge>Design</CategoryBadge>);
    const el = screen.getByText("Design");
    expect(el.className).toContain("accent");
  });

  it("has rounded-full class for pill shape", () => {
    render(<CategoryBadge>Cat</CategoryBadge>);
    const el = screen.getByText("Cat");
    expect(el.className).toContain("rounded-full");
  });
});

describe("StatusBadge", () => {
  it("renders status text", () => {
    render(<StatusBadge status="stable" />);
    expect(screen.getByText("stable")).toBeInTheDocument();
  });

  it("applies stable status colors", () => {
    render(<StatusBadge status="stable" />);
    const el = screen.getByText("stable");
    expect(el.className).toContain("bg-emerald-500/10");
    expect(el.className).toContain("text-emerald-600");
    expect(el.className).toContain("border-emerald-500/25");
  });

  it("applies beta status colors", () => {
    render(<StatusBadge status="beta" />);
    const el = screen.getByText("beta");
    expect(el.className).toContain("bg-amber-500/10");
    expect(el.className).toContain("text-amber-600");
    expect(el.className).toContain("border-amber-500/25");
  });

  it("applies planned status colors", () => {
    render(<StatusBadge status="planned" />);
    const el = screen.getByText("planned");
    expect(el.className).toContain("bg-blue-500/10");
    expect(el.className).toContain("text-blue-600");
    expect(el.className).toContain("border-blue-500/25");
  });

  it("defaults to stable colors for unknown status", () => {
    render(<StatusBadge status="unknown" />);
    const el = screen.getByText("unknown");
    expect(el.className).toContain("bg-emerald-500/10");
  });

  it("handles case-insensitive status matching", () => {
    render(<StatusBadge status="BETA" />);
    const el = screen.getByText("BETA");
    expect(el.className).toContain("bg-amber-500/10");
  });

  it("applies custom className", () => {
    render(<StatusBadge status="stable" className="custom-class" />);
    const el = screen.getByText("stable");
    expect(el.className).toContain("custom-class");
  });
});
