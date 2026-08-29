import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

const getTranslationsMock = vi.fn();
const LinkMock = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: (ns: string) => getTranslationsMock(ns),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: (props: Record<string, unknown>) => LinkMock(props),
}));

import ImprintPage, { generateMetadata } from "@/app/[locale]/imprint/page";

function makeT(keys: Record<string, string>) {
  return (key: string) => keys[key] ?? key;
}

describe("Imprint page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getTranslationsMock.mockImplementation(() =>
      makeT({
        title: "Imprint",
        infoAccordingTo: "Information according to § 5 TMG",
        provider: "Provider",
        contactHeading: "Contact",
        emailLabel: "Email:",
        contentResponsibility: "Content Responsibility",
        contentResponsibilityText: "Responsible for content",
        referencesAndLinks: "References & Links",
        referencesAndLinksText: "Links to external sites",
        copyrightHeading: "Copyright",
        copyrightText: "All rights reserved",
        acknowledgements: "Acknowledgements",
        acknowledgementsIntro: "We thank",
        ackHmwk: "Hessian Ministry",
        ackHessianAi: "hessian.AI",
        warrantyHeading: "Warranty",
        warrantyText: "No warranty",
        privacyHeading: "Privacy",
        privacyText: "See our",
        privacyLinkText: "privacy policy",
        privacyTextAfter: "for details.",
        disputeResolution: "Dispute Resolution",
        disputeResolutionText: "EU ODR platform:",
        disputeResolutionAfter: "",
      }),
    );

    LinkMock.mockImplementation(({ children, href }) => (
      <a data-testid="nav-link" data-href={String(href)}>{children}</a>
    ));
  });

  describe("generateMetadata", () => {
    it("returns title with site name", async () => {
      const md = await generateMetadata();
      expect(md.title).toBe("Imprint | openDesk Edu");
    });

    it("calls getTranslations with 'imprint' namespace", async () => {
      await generateMetadata();
      expect(getTranslationsMock).toHaveBeenCalledWith("imprint");
    });
  });

  describe("page render", () => {
    it("renders the page heading", async () => {
      const { container } = render(await ImprintPage());
      expect(container.querySelector("h1")?.textContent).toBe("Imprint");
    });

    it("renders provider information section", async () => {
      const { container } = render(await ImprintPage());
      expect(screen.getByText("Information according to § 5 TMG")).toBeTruthy();
      expect(container.textContent).toContain("Tobias Weiß");
    });

    it("renders address details", async () => {
      const { container } = render(await ImprintPage());
      expect(container.textContent).toContain("Grundstraße 69");
      expect(container.textContent).toContain("78628 Rottweil");
      expect(container.textContent).toContain("Germany");
    });

    it("renders email contact link", async () => {
      const { container } = render(await ImprintPage());
      const emailLink = container.querySelector('a[href="mailto:info@opendesk-edu.org"]');
      expect(emailLink).toBeTruthy();
      expect(emailLink?.textContent).toBe("info@opendesk-edu.org");
    });

    it("renders content responsibility section", async () => {
      render(await ImprintPage());
      expect(screen.getByText("Content Responsibility")).toBeTruthy();
      expect(screen.getByText("Responsible for content")).toBeTruthy();
    });

    it("renders copyright section", async () => {
      render(await ImprintPage());
      expect(screen.getByText("Copyright")).toBeTruthy();
      expect(screen.getByText("All rights reserved")).toBeTruthy();
    });

    it("renders acknowledgements section with two entries", async () => {
      render(await ImprintPage());
      expect(screen.getByText("Acknowledgements")).toBeTruthy();
      expect(screen.getByText("Hessian Ministry")).toBeTruthy();
      expect(screen.getByText("hessian.AI")).toBeTruthy();
    });

    it("renders warranty section", async () => {
      render(await ImprintPage());
      expect(screen.getByText("Warranty")).toBeTruthy();
      expect(screen.getByText("No warranty")).toBeTruthy();
    });

    it("renders privacy link", async () => {
      const { container } = render(await ImprintPage());
      const links = container.querySelectorAll('[data-testid="nav-link"]');
      expect(links.length).toBe(1);
      expect(links[0].getAttribute("data-href")).toBe("/privacy");
      expect(links[0].textContent).toBe("privacy policy");
    });

    it("renders dispute resolution section with EU ODR link", async () => {
      const { container } = render(await ImprintPage());
      expect(screen.getByText("Dispute Resolution")).toBeTruthy();
      const odrLink = container.querySelector('a[href="https://ec.europa.eu/consumers/odr/"]');
      expect(odrLink).toBeTruthy();
    });

    it("renders email label text", async () => {
      render(await ImprintPage());
      expect(screen.getByText("Email:")).toBeTruthy();
    });
  });
});
