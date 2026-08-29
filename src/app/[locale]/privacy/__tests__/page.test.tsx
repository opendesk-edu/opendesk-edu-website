import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

const getTranslationsMock = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: (ns: string) => getTranslationsMock(ns),
}));

import PrivacyPage, { generateMetadata } from "@/app/[locale]/privacy/page";

function makeT(keys: Record<string, string>) {
  const t = (key: string) => keys[key] ?? key;
  t.rich = (key: string) => keys[key] ?? key;
  return t;
}

describe("Privacy page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getTranslationsMock.mockImplementation(() =>
      makeT({
        title: "Privacy Policy",
        generalInfoHeading: "General Information",
        generalInfoP1: "We take privacy seriously.",
        generalInfoP2: "This policy explains data processing.",
        dataProcessingHeading: "Data Processing",
        analyticsCookiesHeading: "Analytics & Cookies",
        analyticsCookiesP1: "We use privacy-focused analytics.",
        plausibleItem: "Plausible Analytics",
        clarityItem: "Microsoft Clarity",
        analyticsConsentP: "Analytics requires consent.",
        serverLogsHeading: "Server Logs",
        serverLogsP1: "Server logs are retained temporarily.",
        serverLog1: "IP address",
        serverLog2: "Date and time",
        serverLog3: "Request URL",
        serverLog4: "HTTP status",
        serverLog5: "User agent",
        serverLog6: "Referrer",
        serverLogsP2: "Logs are deleted after 7 days.",
        contactSectionHeading: "Contact Data",
        contactSectionP: "You can reach us via email.",
        sslHeading: "SSL Encryption",
        sslP: "This site uses SSL encryption.",
        cookiesHeading: "Cookies",
        cookiesP: "We use minimal cookies.",
        externalLinksHeading: "External Links",
        externalLinksP: "We are not responsible for external content.",
        yourRightsHeading: "Your Rights",
        yourRightsP: "You have rights regarding your data. Contact ",
        contactHeading: "Contact",
        contactP: "For privacy questions, contact us.",
        contactEmail: "info@opendesk-edu.org",
      }),
    );
  });

  describe("generateMetadata", () => {
    it("returns title with site name", async () => {
      const md = await generateMetadata({ params: Promise.resolve({ locale: "en" }) });
      expect(md.title).toBe("Privacy Policy | openDesk Edu");
    });

    it("calls getTranslations with 'privacy' namespace", async () => {
      await generateMetadata({ params: Promise.resolve({ locale: "en" }) });
      expect(getTranslationsMock).toHaveBeenCalledWith("privacy");
    });
  });

  describe("page render", () => {
    it("renders the page heading", async () => {
      const { container } = render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(container.querySelector("h1")?.textContent).toBe("Privacy Policy");
    });

    it("renders general information section", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("General Information")).toBeTruthy();
      expect(screen.getByText("We take privacy seriously.")).toBeTruthy();
      expect(screen.getByText("This policy explains data processing.")).toBeTruthy();
    });

    it("renders data processing heading", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("Data Processing")).toBeTruthy();
    });

    it("renders analytics cookies heading and intro", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("Analytics & Cookies")).toBeTruthy();
      expect(screen.getByText("We use privacy-focused analytics.")).toBeTruthy();
    });

    it("renders Plausible and Clarity list items", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("Plausible Analytics")).toBeTruthy();
      expect(screen.getByText("Microsoft Clarity")).toBeTruthy();
    });

    it("renders analytics consent paragraph", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("Analytics requires consent.")).toBeTruthy();
    });

    it("renders server logs heading and all 6 log items", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("Server Logs")).toBeTruthy();
      expect(screen.getByText("IP address")).toBeTruthy();
      expect(screen.getByText("Date and time")).toBeTruthy();
      expect(screen.getByText("Request URL")).toBeTruthy();
      expect(screen.getByText("HTTP status")).toBeTruthy();
      expect(screen.getByText("User agent")).toBeTruthy();
      expect(screen.getByText("Referrer")).toBeTruthy();
    });

    it("renders server logs retention statement", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("Logs are deleted after 7 days.")).toBeTruthy();
    });

    it("renders contact data section", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("Contact Data")).toBeTruthy();
      expect(screen.getByText("You can reach us via email.")).toBeTruthy();
    });

    it("renders SSL encryption section", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("SSL Encryption")).toBeTruthy();
      expect(screen.getByText("This site uses SSL encryption.")).toBeTruthy();
    });

    it("renders cookies section", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("Cookies")).toBeTruthy();
      expect(screen.getByText("We use minimal cookies.")).toBeTruthy();
    });

    it("renders external links section", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("External Links")).toBeTruthy();
      expect(screen.getByText("We are not responsible for external content.")).toBeTruthy();
    });

    it("renders your rights section", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("Your Rights")).toBeTruthy();
      expect(screen.getByText(/You have rights regarding your data/)).toBeTruthy();
    });

    it("renders contact section with statement", async () => {
      render(await PrivacyPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText("Contact")).toBeTruthy();
      expect(screen.getByText("For privacy questions, contact us.")).toBeTruthy();
    });
  });
});
