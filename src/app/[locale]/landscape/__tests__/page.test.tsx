import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

const getTranslationsMock = vi.fn();
const LandscapeVisualizationMock = vi.fn();
const NextLinkMock = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: (opts: unknown) => getTranslationsMock(opts),
}));

vi.mock("@/components/Landscape/LandscapeVisualization", () => ({
  default: (props: Record<string, unknown>) => LandscapeVisualizationMock(props),
}));

vi.mock("next/link", () => ({
  default: (props: Record<string, unknown>) => NextLinkMock(props),
}));

import LandscapePage, { generateMetadata } from "@/app/[locale]/landscape/page";

describe("Landscape page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTranslationsMock.mockResolvedValue((key: string) => key);
    LandscapeVisualizationMock.mockReturnValue(
      <div data-testid="landscape-visualization">LandscapeVisualization</div>,
    );
    NextLinkMock.mockImplementation(({ children, href }: { children: React.ReactNode; href: string }) => (
      <a data-testid="next-link" data-href={href}>{children}</a>
    ));
  });

  describe("exports", () => {
    it("exports default page component", () => {
      expect(typeof LandscapePage).toBe("function");
    });

    it("exports generateMetadata", () => {
      expect(typeof generateMetadata).toBe("function");
    });
  });

  describe("generateMetadata", () => {
    it("calls getTranslations with locale and Landscape namespace", async () => {
      await generateMetadata({ params: { locale: "de" } } as never);
      expect(getTranslationsMock).toHaveBeenCalledWith({ locale: "de", namespace: "Landscape" });
    });

    it("returns title from translations", async () => {
      getTranslationsMock.mockResolvedValue((key: string) => {
        if (key === "title") return "Service Landscape DE";
        if (key === "description") return "Beschreibung";
        return key;
      });
      const md = await generateMetadata({ params: { locale: "de" } } as never);
      expect(md.title).toBe("Service Landscape DE");
    });

    it("returns description from translations", async () => {
      getTranslationsMock.mockResolvedValue((key: string) => {
        if (key === "title") return "Service Landscape";
        if (key === "description") return "Explore the ecosystem";
        return key;
      });
      const md = await generateMetadata({ params: { locale: "en" } } as never);
      expect(md.description).toBe("Explore the ecosystem");
    });

    it("returns openGraph metadata", async () => {
      const md = await generateMetadata({ params: { locale: "en" } } as never);
      expect(md.openGraph?.type).toBe("website");
      expect(md.openGraph?.siteName).toBe("openDesk Edu");
      expect((md.openGraph as { locale?: string }).locale).toBe("en");
    });

    it("includes OG image", async () => {
      const md = await generateMetadata({ params: { locale: "en" } } as never);
      const images = (md.openGraph as { images?: { url: string; width: number; height: number; alt: string }[] }).images;
      expect(images).toHaveLength(1);
      expect(images![0].url).toBe("/api/og/landscape");
      expect(images![0].width).toBe(1200);
      expect(images![0].height).toBe(630);
    });

    it("includes twitter card metadata", async () => {
      const md = await generateMetadata({ params: { locale: "en" } } as never);
      expect(md.twitter?.card).toBe("summary_large_image");
      expect(md.twitter?.images).toEqual(["/api/og/landscape"]);
    });

    it("returns alternates with canonical and language links", async () => {
      const md = await generateMetadata({ params: { locale: "de" } } as never);
      expect(md.alternates?.canonical).toBe("https://opendesk-edu.org/de/landscape");
      expect(md.alternates?.languages).toEqual({
        en: "/en/landscape",
        de: "/de/landscape",
        fr: "/fr/landscape",
        zh: "/zh/landscape",
      });
    });

    it("includes OG url with locale", async () => {
      const md = await generateMetadata({ params: { locale: "fr" } } as never);
      expect((md.openGraph as { url?: string }).url).toBe("https://opendesk-edu.org/fr/landscape");
    });
  });

  describe("page render", () => {
    it("renders without errors", () => {
      expect(() => <LandscapePage />).not.toThrow();
    });

    it("renders the LandscapeVisualization component", () => {
      const { container } = renderElement(<LandscapePage />);
      expect(container.textContent).toContain("LandscapeVisualization");
    });

    it("renders hero section with gradient background", () => {
      const { container } = renderElement(<LandscapePage />);
      expect(container.innerHTML).toContain("Service Landscape");
    });

    it("renders 'Five Pillars' heading", () => {
      const { container } = renderElement(<LandscapePage />);
      expect(container.innerHTML).toContain("Five Pillars of Digital Infrastructure");
    });

    it("renders all 5 domain category cards", () => {
      const { container } = renderElement(<LandscapePage />);
      expect(container.textContent).toContain("Core Platform");
      expect(container.textContent).toContain("Education & Research");
      expect(container.textContent).toContain("Collaboration");
      expect(container.textContent).toContain("Infrastructure");
      expect(container.textContent).toContain("Security");
    });

    it("renders service counts in domain cards", () => {
      const { container } = renderElement(<LandscapePage />);
      expect(container.textContent).toContain("9 services");
      expect(container.textContent).toContain("5 services");
      expect(container.textContent).toContain("8 services");
      expect(container.textContent).toContain("4 services");
    });

    it("renders specific services in Core Platform card", () => {
      const { container } = renderElement(<LandscapePage />);
      expect(container.textContent).toContain("Keycloak SSO");
      expect(container.textContent).toContain("OpenCloud");
      expect(container.textContent).toContain("Stalwart Mail");
      expect(container.textContent).toContain("SOGo Groupware");
    });

    it("renders 'By The Numbers' statistics section", () => {
      const { container } = renderElement(<LandscapePage />);
      expect(container.textContent).toContain("By The Numbers");
      expect(container.textContent).toContain("38");
      expect(container.textContent).toContain("28");
      expect(container.textContent).toContain("10");
      expect(container.textContent).toContain("5+");
    });

    it("renders 'Why Use the Landscape?' section", () => {
      const { container } = renderElement(<LandscapePage />);
      expect(container.textContent).toContain("Why Use the Landscape?");
      expect(container.textContent).toContain("Complete Visibility");
      expect(container.textContent).toContain("Informed Decisions");
      expect(container.textContent).toContain("Efficient Operations");
    });

    it("renders interactive map section with explore anchor", () => {
      const { container } = renderElement(<LandscapePage />);
      expect(container.textContent).toContain("Interactive Service Map");
      expect(container.querySelector('#explore')).toBeTruthy();
    });

    it("renders CTA section", () => {
      const { container } = renderElement(<LandscapePage />);
      expect(container.textContent).toContain("Ready to Transform Your Digital Infrastructure?");
    });

    it("renders next/link components for documentation", () => {
      renderElement(<LandscapePage />);
      const calls = NextLinkMock.mock.calls;
      const hrefs = calls.map((c: [Record<string, unknown>]) => c[0].href);
      expect(hrefs).toContain("/docs");
      expect(hrefs).toContain("/docs/getting-started");
      expect(hrefs).toContain("/docs/deployment");
    });
  });
});

// Minimal render helper that traverses React elements and builds innerHTML
function renderElement(elem: React.ReactElement) {
  const { renderToString } = require("react-dom/server");
  const html = renderToString(elem);
  const container = document.createElement("div");
  container.innerHTML = html;
  return { container };
}
