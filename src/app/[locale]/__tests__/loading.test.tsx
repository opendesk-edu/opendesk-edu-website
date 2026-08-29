import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "@/app/[locale]/loading";

describe("[locale]/loading.tsx", () => {
  it("renders without errors", () => {
    expect(() => render(<Loading />)).not.toThrow();
  });

  it("renders a full-screen container", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector(".min-h-screen")).toBeTruthy();
  });

  it("renders skeleton elements with animate-pulse", () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders 6 skeleton cards in the grid", () => {
    const { container } = render(<Loading />);
    const cards = container.querySelectorAll(".grid > div");
    expect(cards).toHaveLength(6);
  });
});
