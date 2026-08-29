import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

const getTranslationsMock = vi.fn();
const LinkMock = vi.fn();
const EmailLinkMock = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: (ns: string) => getTranslationsMock(ns),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: (props: Record<string, unknown>) => LinkMock(props),
}));

vi.mock("@/components/EmailLink", () => ({
  default: (props: Record<string, unknown>) => EmailLinkMock(props),
}));

import AboutPage, { generateMetadata } from "@/app/[locale]/about/page";

// Helper: build a mock t function for a namespace
function makeT(keys: Record<string, string>) {
  return (key: string) => keys[key] ?? key;
}

// Flat keys so t('serviceLearning.title') resolves correctly

describe("About page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getTranslationsMock.mockImplementation((ns: string) => {
      if (ns === "about") {
        return makeT({
          title: "About openDesk Edu",
          description: "An overview of the platform",
          services: "Our Services",
          "serviceLearning.title": "Learning",
          "serviceLearning.description": "Learning desc",
          "serviceCloud.title": "Cloud",
          "serviceCloud.description": "Cloud desc",
          "serviceSovereignty.title": "Sovereignty",
          "serviceSovereignty.description": "Sovereignty desc",
          "serviceSso.title": "SSO",
          "serviceSso.description": "SSO desc",
          projects: "Projects",
          projectBlog: "Blog posts and articles",
          contact: "Contact Us",
          contactDescription: "Reach out to learn more",
          contactCta: "Get in touch",
        });
      }
      if (ns === "header") {
        return makeT({ blog: "Blog" });
      }
      return makeT({});
    });

    LinkMock.mockImplementation(({ children, href }) => (
      <a data-testid="nav-link" data-href={String(href)}>{children}</a>
    ));
    EmailLinkMock.mockImplementation(({ children }) => (
      <a data-testid="email-link">{children}</a>
    ));
  });

  describe("generateMetadata", () => {
    it("returns title with namespace prefix", async () => {
      const md = await generateMetadata();
      expect(md.title).toBe("About openDesk Edu | openDesk Edu");
    });

    it("calls getTranslations with 'about' namespace", async () => {
      await generateMetadata();
      expect(getTranslationsMock).toHaveBeenCalledWith("about");
    });
  });

  describe("page render", () => {
    it("renders the page heading", async () => {
      const { container } = render(await AboutPage());
      const h1 = container.querySelector("h1");
      expect(h1?.textContent).toBe("About openDesk Edu");
    });

    it("renders the description", async () => {
      render(await AboutPage());
      expect(screen.getByText("An overview of the platform")).toBeTruthy();
    });

    it("renders services section heading", async () => {
      render(await AboutPage());
      expect(screen.getByText("Our Services")).toBeTruthy();
    });

    it("renders all 4 service cards", async () => {
      const { container } = render(await AboutPage());
      // Services are rendered as grid items
      const serviceTitles = ["Learning", "Cloud", "Sovereignty", "SSO"];
      for (const title of serviceTitles) {
        expect(screen.getByText(title)).toBeTruthy();
      }
    });

    it("renders projects section with blog link", async () => {
      const { container } = render(await AboutPage());
      const links = container.querySelectorAll('[data-testid="nav-link"]');
      expect(links.length).toBeGreaterThanOrEqual(1);
      expect(links[0].getAttribute("data-href")).toBe("/blog");
    });

    it("renders contact section heading", async () => {
      render(await AboutPage());
      expect(screen.getByText("Contact Us")).toBeTruthy();
    });

    it("renders EmailLink component in contact section", async () => {
      const { container } = render(await AboutPage());
      expect(container.querySelectorAll('[data-testid="email-link"]').length).toBe(1);
    });

    it("renders contact CTA text", async () => {
      render(await AboutPage());
      expect(screen.getByText("Get in touch")).toBeTruthy();
    });

    it("renders contact description", async () => {
      render(await AboutPage());
      expect(screen.getByText("Reach out to learn more")).toBeTruthy();
    });

    it("renders project description for blog", async () => {
      render(await AboutPage());
      expect(screen.getByText("Blog posts and articles")).toBeTruthy();
    });
  });
});
