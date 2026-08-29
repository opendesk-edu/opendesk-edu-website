import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

const getTranslationsMock = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: (ns: string) => getTranslationsMock(ns),
}));

import AIStatementPage, { generateMetadata } from "@/app/[locale]/ai-statement/page";

function makeT(keys: Record<string, string>) {
  return (key: string) => keys[key] ?? key;
}

describe("AI Statement page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getTranslationsMock.mockImplementation(() =>
      makeT({
        title: "AI Statement",
        updated: "Updated: {date}",
        updatedDate: "January 2025",
        overviewHeading: "Overview",
        overviewP1: "This page describes our use of AI.",
        contentHeading: "Content Creation",
        contentP1: "Content is created with AI assistance.",
        contentItem1: "Research summaries",
        contentItem2: "Translation assistance",
        contentItem3: "Code examples",
        contentP2: "All content is reviewed by humans.",
        transparencyHeading: "Transparency",
        transparencyP1: "We are transparent about AI use.",
        transparencyItem1: "AI-generated content is labeled",
        transparencyItem2: "AI tools are listed",
        transparencyItem3: "Limitations are disclosed",
        responsibilityHeading: "Responsibility",
        responsibilityP1: "We take responsibility for all content.",
        responsibilityEmailLabel: "Contact:",
        contactHeading: "Contact",
        contactP1: "Questions? Reach out to us.",
      }),
    );
  });

  describe("generateMetadata", () => {
    it("returns title with site name", async () => {
      const md = await generateMetadata();
      expect(md.title).toBe("AI Statement | openDesk Edu");
    });

    it("calls getTranslations with 'aiStatement' namespace", async () => {
      await generateMetadata();
      expect(getTranslationsMock).toHaveBeenCalledWith("aiStatement");
    });
  });

  describe("page render", () => {
    it("renders the page heading", async () => {
      const { container } = render(await AIStatementPage());
      expect(container.querySelector("h1")?.textContent).toBe("AI Statement");
    });

    it("renders updated text with date key", async () => {
      render(await AIStatementPage());
      expect(screen.getByText(/Updated:/)).toBeTruthy();
    });

    it("renders overview heading and text", async () => {
      render(await AIStatementPage());
      expect(screen.getByText("Overview")).toBeTruthy();
      expect(screen.getByText("This page describes our use of AI.")).toBeTruthy();
    });

    it("renders content creation heading and paragraph", async () => {
      render(await AIStatementPage());
      expect(screen.getByText("Content Creation")).toBeTruthy();
      expect(screen.getByText("Content is created with AI assistance.")).toBeTruthy();
    });

    it("renders 3 content list items", async () => {
      render(await AIStatementPage());
      expect(screen.getByText("Research summaries")).toBeTruthy();
      expect(screen.getByText("Translation assistance")).toBeTruthy();
      expect(screen.getByText("Code examples")).toBeTruthy();
    });

    it("renders content review statement", async () => {
      render(await AIStatementPage());
      expect(screen.getByText("All content is reviewed by humans.")).toBeTruthy();
    });

    it("renders transparency heading and paragraph", async () => {
      render(await AIStatementPage());
      expect(screen.getByText("Transparency")).toBeTruthy();
      expect(screen.getByText("We are transparent about AI use.")).toBeTruthy();
    });

    it("renders 3 transparency list items", async () => {
      render(await AIStatementPage());
      expect(screen.getByText("AI-generated content is labeled")).toBeTruthy();
      expect(screen.getByText("AI tools are listed")).toBeTruthy();
      expect(screen.getByText("Limitations are disclosed")).toBeTruthy();
    });

    it("renders responsibility heading and text", async () => {
      render(await AIStatementPage());
      expect(screen.getByText("Responsibility")).toBeTruthy();
      expect(screen.getByText("We take responsibility for all content.")).toBeTruthy();
    });

    it("renders email contact link", async () => {
      const { container } = render(await AIStatementPage());
      const emailLink = container.querySelector('a[href="mailto:info@opendesk-edu.org"]');
      expect(emailLink).toBeTruthy();
      expect(emailLink?.textContent).toBe("info@opendesk-edu.org");
    });

    it("renders contact heading and text", async () => {
      render(await AIStatementPage());
      expect(screen.getByText("Contact")).toBeTruthy();
      expect(screen.getByText("Questions? Reach out to us.")).toBeTruthy();
    });
  });
});
