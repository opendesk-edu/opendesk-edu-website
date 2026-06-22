import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchProvider, useSearchOpen } from "../SearchContext";

function TestComponent() {
  const { open, openSearch, closeSearch, toggleSearch } = useSearchOpen();
  return (
    <div>
      <span data-testid="search-state">{open ? "open" : "closed"}</span>
      <button onClick={openSearch} data-testid="open-btn">Open</button>
      <button onClick={closeSearch} data-testid="close-btn">Close</button>
      <button onClick={toggleSearch} data-testid="toggle-btn">Toggle</button>
    </div>
  );
}

describe("SearchContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides default state (closed)", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    expect(screen.getByTestId("search-state")).toHaveTextContent("closed");
  });

  it("opens search when openSearch is called", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    fireEvent.click(screen.getByTestId("open-btn"));
    expect(screen.getByTestId("search-state")).toHaveTextContent("open");
  });

  it("closes search when closeSearch is called", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    fireEvent.click(screen.getByTestId("open-btn"));
    expect(screen.getByTestId("search-state")).toHaveTextContent("open");

    fireEvent.click(screen.getByTestId("close-btn"));
    expect(screen.getByTestId("search-state")).toHaveTextContent("closed");
  });

  it("toggles search when toggleSearch is called", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    fireEvent.click(screen.getByTestId("toggle-btn"));
    expect(screen.getByTestId("search-state")).toHaveTextContent("open");

    fireEvent.click(screen.getByTestId("toggle-btn"));
    expect(screen.getByTestId("search-state")).toHaveTextContent("closed");

    fireEvent.click(screen.getByTestId("toggle-btn"));
    expect(screen.getByTestId("search-state")).toHaveTextContent("open");
  });

  it("responds to Cmd+K keyboard shortcut", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("search-state")).toHaveTextContent("open");
  });

  it("responds to Ctrl+K keyboard shortcut", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByTestId("search-state")).toHaveTextContent("open");
  });

  it("toggles search correctly on repeated Cmd+K", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    fireEvent.keyDown(document, { key: "k", metaKey: true, preventDefault: () => {} });
    expect(screen.getByTestId("search-state")).toHaveTextContent("open");

    fireEvent.keyDown(document, { key: "k", metaKey: true, preventDefault: () => {} });
    expect(screen.getByTestId("search-state")).toHaveTextContent("closed");
  });

  it("toggles search with Cmd+K / Ctrl+K", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("search-state")).toHaveTextContent("open");

    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("search-state")).toHaveTextContent("closed");
  });

  it("cleans up keyboard event listener on unmount", () => {
    const removeEventListener = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("keydown", expect.any(Function));
    removeEventListener.mockRestore();
  });
});
