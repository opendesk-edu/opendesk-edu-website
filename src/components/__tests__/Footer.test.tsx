import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

// Mock @/i18n/navigation Link
vi.mock("@/i18n/navigation", () => ({
  Link: (props: { href?: string; children?: React.ReactNode; [key: string]: unknown }) => (
    <a href={props.href}>{props.children}</a>
  ),
}));

// Mock next/image to prevent Footer from importing it transitively
vi.mock("next/image", () => ({
  default: (props: { alt?: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

// Mock next-intl useTranslations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      imprint: "Imprint",
      privacy: "Privacy",
      contact: "Contact",
      copyright: "© {year} openDesk Edu. Licensed under Apache-2.0.",
    };
    let text = translations[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  },
}));

describe("Footer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the Imprint link", () => {
    render(<Footer />);
    expect(screen.getByText("Imprint")).toBeInTheDocument();
  });

  it("renders the Privacy link", () => {
    render(<Footer />);
    expect(screen.getByText("Privacy")).toBeInTheDocument();
  });

  it("renders the Contact email link", () => {
    render(<Footer />);
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("copyright text contains 'openDesk Edu'", () => {
    render(<Footer />);
    expect(screen.getByText(/openDesk Edu/)).toBeInTheDocument();
  });

  it("copyright includes current year", () => {
    render(<Footer />);
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("Imprint link points to /imprint", () => {
    render(<Footer />);
    const link = screen.getByText("Imprint").closest("a");
    expect(link).toHaveAttribute("href", "/imprint");
  });

  it("Privacy link points to /privacy", () => {
    render(<Footer />);
    const link = screen.getByText("Privacy").closest("a");
    expect(link).toHaveAttribute("href", "/privacy");
  });

  it("Contact link has mailto href", () => {
    render(<Footer />);
    const link = screen.getByText("Contact").closest("a");
    expect(link).toHaveAttribute("href", "mailto:info@opendesk-edu.org");
  });
});
