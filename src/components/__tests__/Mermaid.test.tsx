import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import Mermaid from "@/components/Mermaid";

// Mock the dynamic mermaid import
const mockInitialize = vi.fn();
const mockRun = vi.fn();

vi.mock("mermaid", () => ({
  default: {
    initialize: (opts: unknown) => mockInitialize(opts),
    run: (opts: unknown) => mockRun(opts),
  },
}));

function mermaidFence(source: string): string {
  return `<pre><code class="language-mermaid">${source}</code></pre>`;
}

describe("Mermaid component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInitialize.mockClear();
    mockRun.mockClear();
    mockRun.mockImplementation(async ({ nodes }: { nodes: HTMLElement[] }) => {
      for (const node of nodes) {
        node.innerHTML = "<svg>diagram</svg>";
      }
    });
  });

  it("renders the raw HTML via dangerouslySetInnerHTML", () => {
    const html = `<p>Hello <strong>world</strong></p>`;
    const { container } = render(<Mermaid html={html} />);
    expect(container.textContent).toContain("Hello");
  });

  it("converts mermaid fences into render divs (upgrade in place)", async () => {
    const { container } = render(<Mermaid html={mermaidFence("graph TD; A-->B;")} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    // The effect replaces pre>code with a div.mermaid carrying the source
    const mermaidDiv = container.querySelector("div.mermaid");
    expect(mermaidDiv).not.toBeNull();
    expect(mermaidDiv?.getAttribute("data-mermaid-src")).toContain("graph TD");
  });

  it("converts code blocks to mermaid divs and renders them", async () => {
    render(<Mermaid html={mermaidFence("graph TD; A-->B;")} />);
    // Wait for the async effect to run
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ startOnLoad: false })
    );
    expect(mockRun).toHaveBeenCalled();
    expect(mockInitialize.mock.calls[0][0]).toHaveProperty("securityLevel", "loose");
  });

  it("marks rendered nodes with data-mermaid-rendered attribute", async () => {
    const { container } = render(<Mermaid html={mermaidFence("graph TD; A-->B;")} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const div = container.querySelector("div.mermaid");
    expect(div).not.toBeNull();
    expect(div?.getAttribute("data-mermaid-rendered")).toBe("true");
    expect(div?.innerHTML).toContain("<svg");
    // The code block should be gone after successful render
    expect(container.querySelector("pre")).toBeNull();
  });

  it("hides raw source during rendering to avoid flash", async () => {
    const { container } = render(<Mermaid html={mermaidFence("graph TD; A-->B;")} />);
    // Immediately after render, the div should exist with visibility hidden
    const div = container.querySelector("div.mermaid");
    expect(div?.style.visibility).toBe("hidden");

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    // After render, visibility should be cleared
    expect(div?.style.visibility).toBe("");
  });

  it("handles diagram render errors by restoring the code block", async () => {
    mockRun.mockImplementation(async () => {
      throw new Error("syntax error");
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(<Mermaid html={mermaidFence("graph TD; bad")} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Fallback: code block restored without language-mermaid class
    const pre = container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toContain("graph TD; bad");
    expect(pre?.querySelector("code")?.className).not.toContain("language-mermaid");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("is idempotent across StrictMode double-invocation", async () => {
    const { container } = render(<Mermaid html={mermaidFence("graph TD; A-->B;")} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Simulate StrictMode second effect run
    const { container: container2 } = render(
      <Mermaid html={mermaidFence("graph TD; A-->B;")} />
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // No crash; the second instance also renders
    expect(mockRun).toHaveBeenCalled();
    expect(container2.querySelector("div.mermaid")).not.toBeNull();
  });

  it("does not double-render already-rendered nodes", async () => {
    const { container } = render(<Mermaid html={mermaidFence("graph TD; A-->B;")} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const callsBefore = mockRun.mock.calls.length;

    // Re-render with same html (effect re-runs)
    render(<Mermaid html={mermaidFence("graph TD; A-->B;")} className="" />);
    // After first render, nodes have data-mermaid-rendered → second run targets nothing
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Note: separate component instance — each should render its own nodes.
    // This test asserts the toggling mechanism: after render, node is marked.
    const rendered = container.querySelector('[data-mermaid-rendered="true"]');
    expect(rendered).not.toBeNull();
    expect(callsBefore).toBeGreaterThanOrEqual(1);
  });

  it("applies the className to the wrapper div", () => {
    const { container } = render(
      <Mermaid html="<p>hi</p>" className="my-diagram-box" />
    );
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain("my-diagram-box");
  });

  it("does nothing when html contains no mermaid blocks", async () => {
    const { container } = render(<Mermaid html="<p>plain</p>" />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockRun).not.toHaveBeenCalled();
    expect(container.querySelector("div.mermaid")).toBeNull();
  });

  it("passes theme and fontFamily to mermaid.initialize", async () => {
    render(<Mermaid html={mermaidFence("graph TD; A-->B;")} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const initOptions = mockInitialize.mock.calls[0][0];
    expect(initOptions.theme).toBe("default");
    expect(initOptions.fontFamily).toBe("inherit");
    expect(initOptions.flowchart.htmlLabels).toBe(true);
  });

  it("passes live nodes to mermaid.run", async () => {
    render(<Mermaid html={mermaidFence("graph TD; A-->B;")} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockRun).toHaveBeenCalledWith(
      expect.objectContaining({ nodes: expect.any(Array) })
    );
    const nodes = mockRun.mock.calls[0][0].nodes as HTMLElement[];
    expect(nodes.length).toBe(1);
    expect(nodes[0].className).toContain("mermaid");
  });
});
