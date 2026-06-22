import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("renders children", () => {
    render(<RootLayout><p data-testid="child">Hello</p></RootLayout>);
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("passes children through without modification", () => {
    const { container } = render(<RootLayout><span data-testid="child">Content</span></RootLayout>);
    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });
});
