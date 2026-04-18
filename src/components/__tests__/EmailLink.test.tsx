import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmailLink from "@/components/EmailLink";

describe("EmailLink", () => {
  it("renders children text", () => {
    render(<EmailLink>Contact Us</EmailLink>);
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("renders with mailto href", () => {
    render(<EmailLink>Email</EmailLink>);
    const link = screen.getByText("Email").closest("a");
    expect(link).toHaveAttribute("href", "mailto:info@opendesk-edu.org");
  });

  it("applies custom className", () => {
    render(<EmailLink className="custom-class">Styled</EmailLink>);
    const link = screen.getByText("Styled").closest("a");
    expect(link?.className).toContain("custom-class");
  });
});
