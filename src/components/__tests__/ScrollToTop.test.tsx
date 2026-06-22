import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ScrollToTop from "@/components/ScrollToTop";

describe("ScrollToTop", () => {
  beforeEach(() => {
    vi.spyOn(window, "pageYOffset", "get").mockReturnValue(0);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a button with aria-label", () => {
    render(<ScrollToTop />);
    expect(screen.getByLabelText("Scroll to top")).toBeInTheDocument();
  });

  it("is hidden by default (pageYOffset = 0)", () => {
    render(<ScrollToTop />);
    const btn = screen.getByLabelText("Scroll to top");
    expect(btn.className).toContain("opacity-0");
    expect(btn.className).toContain("pointer-events-none");
  });

  it("becomes visible when scrolled past 300px", () => {
    render(<ScrollToTop />);
    vi.spyOn(window, "pageYOffset", "get").mockReturnValue(400);
    fireEvent.scroll(window);
    const btn = screen.getByLabelText("Scroll to top");
    expect(btn.className).toContain("opacity-100");
  });

  it("calls window.scrollTo with top=0 and smooth behavior on click", () => {
    render(<ScrollToTop />);
    vi.spyOn(window, "pageYOffset", "get").mockReturnValue(400);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByLabelText("Scroll to top"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("hides again after scrolling back to top", () => {
    render(<ScrollToTop />);
    const mockPageYOffset = vi.spyOn(window, "pageYOffset", "get");
    mockPageYOffset.mockReturnValue(400);
    fireEvent.scroll(window);
    expect(screen.getByLabelText("Scroll to top").className).toContain("opacity-100");
    mockPageYOffset.mockReturnValue(0);
    fireEvent.scroll(window);
    expect(screen.getByLabelText("Scroll to top").className).toContain("opacity-0");
  });

  it("removes scroll listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ScrollToTop />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});
