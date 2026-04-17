import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import TableOfContents, { extractHeadings } from "@/components/TableOfContents";

const messages = { tableOfContents: { title: "On this page" } };

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("extractHeadings", () => {
  it("extracts h2 and h3 headings with ids", () => {
    const html = '<h2 id="intro">Introduction</h2><p>text</p><h3 id="details">Details</h3>';
    const items = extractHeadings(html);
    expect(items).toEqual([
      { id: "intro", text: "Introduction", level: 2 },
      { id: "details", text: "Details", level: 3 },
    ]);
  });

  it("returns empty array for html with no headings", () => {
    const items = extractHeadings("<p>Just a paragraph</p>");
    expect(items).toEqual([]);
  });

  it("strips HTML tags from heading text", () => {
    const html = '<h2 id="styled"><code>Code</code> heading</h2>';
    const items = extractHeadings(html);
    expect(items).toEqual([{ id: "styled", text: "Code heading", level: 2 }]);
  });

  it("skips headings without id", () => {
    const html = '<h2>No id</h2><h2 id="has-id">Has id</h2>';
    const items = extractHeadings(html);
    expect(items).toEqual([{ id: "has-id", text: "Has id", level: 2 }]);
  });
});

describe("TableOfContents", () => {
  it("returns null when no headings found", () => {
    const { container } = renderWithProvider(<TableOfContents html="<p>No headings</p>" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nav with On this page label", () => {
    renderWithProvider(
      <TableOfContents html='<h2 id="sec1">Section 1</h2><h3 id="sub1">Sub 1</h3>' />
    );
    expect(screen.getByText("On this page")).toBeInTheDocument();
  });

  it("renders heading text as buttons", () => {
    renderWithProvider(<TableOfContents html='<h2 id="sec1">Section 1</h2>' />);
    expect(screen.getByText("Section 1")).toBeInTheDocument();
  });

  it("calls scrollIntoView when heading button is clicked", () => {
    const mockScrollIntoView = vi.fn();
    vi.spyOn(document, "getElementById").mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement);

    renderWithProvider(<TableOfContents html='<h2 id="sec1">Section 1</h2>' />);
    screen.getByText("Section 1").click();
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });

    vi.restoreAllMocks();
  });
});
