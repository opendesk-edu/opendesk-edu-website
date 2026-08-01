import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

// Mock @/components/ContactForm
vi.mock("@/components/ContactForm", () => ({
  default: ({ onClose, t }: { onClose: () => void; t: (key: string) => string }) => (
    <div data-testid="contact-form-modal">
      <button onClick={onClose} aria-label="close">Close</button>
      <h2>{t("send-message")}</h2>
      <form>
        <input placeholder="email" />
        <textarea placeholder="message" />
        <button type="submit">{t("send")}</button>
      </form>
    </div>
  ),
}));

// Mock next-intl useTranslations and useLocale
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      imprint: "Imprint",
      privacy: "Privacy",
      contact: "Contact",
      sourceCode: "Source Code",
      rss: "RSS",
      copyright: "© {year} openDesk Edu. Licensed under Apache-2.0.",
      "send-message": "Send Message",
      send: "Send",
    };
    let text = translations[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  },
  useLocale: () => "en",
}));

describe("Footer", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("static content", () => {
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
    expect(screen.getAllByText("Contact").length).toBeGreaterThanOrEqual(1);
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
    const contactLinks = screen
      .getAllByText("Contact")
      .map((el) => el.closest("a"))
      .filter(Boolean);
    expect(contactLinks.length).toBeGreaterThanOrEqual(1);
    contactLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "mailto:info@opendesk-edu.org");
    });
  });
  });

  describe("contact form modal", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("renders contact button in footer links", () => {
      render(<Footer />);
      const contactButtons = screen.getAllByRole("button", { name: /contact/i });
      expect(contactButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("opens contact form modal when contact button is clicked", async () => {
      render(<Footer />);
      const contactButton = screen.getAllByRole("button", { name: /contact/i })[0];

      fireEvent.click(contactButton);

      await waitFor(() => {
        expect(screen.getByText(/send message/i)).toBeInTheDocument();
      });
    });

    it("closes contact form modal when onClose is triggered", async () => {
      render(<Footer />);
      const contactButton = screen.getAllByRole("button", { name: /contact/i })[0];

      fireEvent.click(contactButton);

      await waitFor(() => {
        expect(screen.getByText(/send message/i)).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/send message/i)).not.toBeInTheDocument();
      });
    });
  });
});
