import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchDialog from "@/components/SearchDialog";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Search",
      placeholder: "Search components, guides, blog posts...",
      noResults: "No results found",
      loading: "Loading...",
      "groupLabels.components": "Components",
      "groupLabels.blog": "Blog",
      "groupLabels.docs": "Architecture",
    };
    return translations[key] ?? key;
  },
}));

const mockEntries = [
  { title: "Jitsi", slug: "jitsi", section: "components", description: "Video conferencing", categories: ["communication"], tags: ["video"] },
  { title: "Deploy Guide", slug: "deploy", section: "docs", description: "How to deploy", categories: ["guide"], tags: ["deployment"] },
  { title: "Architecture Deep Dive", slug: "arch", section: "blog", description: "Architecture", categories: ["tech"], tags: ["architecture"] },
];

let loadingState = false;
vi.mock("@/hooks/useSearchData", () => ({
  useSearchData: () => ({
    entries: mockEntries,
    loading: loadingState,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

vi.mock("@/lib/blur", () => ({
  BLUR_TEASER: "data:image/svg+xml;base64,mock",
}));

describe("SearchDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadingState = false;
  });

  it("renders when open is true", () => {
    render(<SearchDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog", { name: "Search" })).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    const { container } = render(<SearchDialog open={false} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows search input with placeholder", () => {
    render(<SearchDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search components, guides, blog posts...")).toBeInTheDocument();
  });

  it("renders section headings when results exist", async () => {
    render(<SearchDialog open={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search components, guides, blog posts...");
    await userEvent.type(input, "a");
    await waitFor(() => {
      expect(screen.getByText("Components")).toBeInTheDocument();
    });
  });

  it("filters results by query", async () => {
    render(<SearchDialog open={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search components, guides, blog posts...");
    await userEvent.type(input, "Jitsi");
    await waitFor(() => {
      expect(screen.getByText("Jitsi")).toBeInTheDocument();
    });
  });

  it("shows no results message when nothing matches", async () => {
    render(<SearchDialog open={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search components, guides, blog posts...");
    await userEvent.type(input, "xyznonexistent");
    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(<SearchDialog open={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(<SearchDialog open={true} onClose={onClose} />);
    const backdrop = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("removes keydown event listener on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<SearchDialog open={true} onClose={vi.fn()} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("renders result items", async () => {
    render(<SearchDialog open={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search components, guides, blog posts...");
    await userEvent.type(input, "Jitsi");
    await waitFor(() => {
      expect(screen.getByText("Jitsi")).toBeInTheDocument();
    });
  });
});
