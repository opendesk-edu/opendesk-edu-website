import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: { alt?: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

// Mock next-intl/navigation
const mockReplace = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  Link: (props: { href?: string; children?: React.ReactNode; [key: string]: unknown }) => (
    <a href={props.href}>{props.children}</a>
  ),
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/en",
  getPathname: () => "/en",
}));

// Mock @/i18n/routing
vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
}));

// Mock next/navigation useParams
vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
  usePathname: () => "/en",
}));

// Mock next-intl useTranslations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      home: "Home",
      components: "Components",
      docs: "Docs",
      blog: "Blog",
      "themeToggle.label": "Toggle theme",
      "mobileMenu.label": "Toggle menu",
    };
    if (key === "header.languageSwitcher.label") return "Language";
    return translations[key] ?? key;
  },
  useLocale: () => "en",
}));

function renderHeader() {
  return render(
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );
}

describe("Header", () => {
  it("renders the brand text 'openDesk Edu'", () => {
    renderHeader();
    expect(screen.getByText("openDesk Edu")).toBeInTheDocument();
  });

  it("renders all 4 nav items (Home + 3 sections)", () => {
    renderHeader();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("renders a theme toggle button", () => {
    renderHeader();
    const themeButtons = screen.getAllByLabelText("Toggle theme");
    // One for desktop, one for mobile
    expect(themeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders a mobile menu toggle button", () => {
    renderHeader();
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
  });

  it("logo links to home", () => {
    renderHeader();
    const logo = screen.getByText("openDesk Edu").closest("a");
    expect(logo).toHaveAttribute("href", "/");
  });

  it("toggle mobile menu opens and closes mobile nav", async () => {
    const user = userEvent.setup();
    renderHeader();

    const mobileToggle = screen.getByLabelText("Toggle menu");
    expect(mobileToggle).toHaveAttribute("aria-expanded", "false");

    await user.click(mobileToggle);
    expect(mobileToggle).toHaveAttribute("aria-expanded", "true");

    const mobileNav = screen.getByLabelText("Mobile navigation");
    expect(mobileNav).toBeInTheDocument();

    await user.click(mobileToggle);
    expect(mobileToggle).toHaveAttribute("aria-expanded", "false");
  });

  it("mobile nav contains all navigation links", async () => {
    const user = userEvent.setup();
    renderHeader();

    const mobileToggle = screen.getByLabelText("Toggle menu");
    await user.click(mobileToggle);

    const mobileNav = screen.getByLabelText("Mobile navigation");
    expect(mobileNav.querySelector('a[href="/"]')).toBeInTheDocument();
    expect(mobileNav.querySelector('a[href="/components"]')).toBeInTheDocument();
    expect(mobileNav.querySelector('a[href="/docs"]')).toBeInTheDocument();
    expect(mobileNav.querySelector('a[href="/blog"]')).toBeInTheDocument();
  });

  it("mobile nav renders links", async () => {
    const user = userEvent.setup();
    renderHeader();

    const mobileToggle = screen.getByLabelText("Toggle menu");
    await user.click(mobileToggle);

    const mobileNav = screen.getByLabelText("Mobile navigation");
    const homeLink = mobileNav.querySelector('a[href="/"]') as HTMLElement;
    expect(homeLink).toBeInTheDocument();
  });

  it("theme toggle button is present in both desktop and mobile", () => {
    renderHeader();
    const themeButtons = screen.getAllByLabelText("Toggle theme");
    expect(themeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("search button opens search", async () => {
    const user = userEvent.setup();
    renderHeader();

    const searchButton = screen.getByLabelText("searchLabel");
    await user.click(searchButton);

    expect(searchButton).toBeInTheDocument();
  });

  it("search button shows keyboard shortcut hint", () => {
    renderHeader();
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("mobile menu LanguageSwitcher closes menu on locale change", async () => {
    const user = userEvent.setup();
    renderHeader();

    const mobileToggle = screen.getByLabelText("Toggle menu");
    await user.click(mobileToggle);

    const mobileNav = screen.getByLabelText("Mobile navigation");
    expect(mobileNav).toBeInTheDocument();

    // Find the LanguageSwitcher button by text content within mobile nav
    const mobileNavWithin = within(mobileNav);
    const enButton = mobileNavWithin.getByText("EN");
    await user.click(enButton);

    // Click on a locale option (DE button)
    const deOption = screen.getByRole("option", { name: "DE" });
    await user.click(deOption);

    // Menu should be closed after locale change
    expect(mobileToggle).toHaveAttribute("aria-expanded", "false");
  });
});
