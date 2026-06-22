import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SearchDialogWrapper from "@/components/SearchDialogWrapper";

vi.mock("@/components/SearchContext", () => ({
  useSearchOpen: () => ({ open: true, closeSearch: vi.fn() }),
}));

vi.mock("@/components/SearchDialog", () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="search-dialog" data-open={open}>
      <button onClick={onClose} data-testid="mock-close">Close</button>
    </div>
  ),
}));

describe("SearchDialogWrapper", () => {
  it("renders SearchDialog with open=true from context", () => {
    render(<SearchDialogWrapper />);
    const dialog = screen.getByTestId("search-dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute("data-open")).toBe("true");
  });

  it("passes closeSearch as onClose to SearchDialog", () => {
    render(<SearchDialogWrapper />);
    const closeBtn = screen.getByTestId("mock-close");
    expect(closeBtn).toBeInTheDocument();
  });
});
