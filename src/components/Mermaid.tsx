"use client";

import { useEffect, useRef } from "react";

/**
 * Renders ```` ```mermaid ```` code blocks produced by the markdown pipeline.
 *
 * `content.ts` emits mermaid fenced code blocks as
 * `<pre><code class="language-mermaid">…</code></pre>`. This client component
 * finds those blocks after hydration, swaps each `<pre>` for a
 * `<div class="mermaid">` containing the diagram source, and runs Mermaid to
 * replace it with an SVG.
 *
 * Design notes:
 * - Diagrams are rendered client-side because Mermaid needs a DOM. The raw
 *   source stays in the initial HTML (good for SEO / no-JS fallback) and is
 *   upgraded in place.
 * - `securityLevel: "loose"` is required because (a) the site CSP sets
 *   `frame-src 'none'`, which blocks Mermaid's default sandboxed-iframe
 *   ("strict") rendering, and (b) the diagram source is trusted, author-
 *   controlled markdown that uses `<br/>` inside node labels (enabled by
 *   "loose"). Source never comes from user input.
 * - The diagram card uses a fixed light surface so the diagram's own light
 *   palette stays readable in both light and dark site themes.
 * - The effect is idempotent across React StrictMode double-invocation: it
 *   both converts new code blocks and renders any not-yet-rendered
 *   `.mermaid` divs, and it guards against rendering into detached nodes.
 */
export default function Mermaid({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // 1. Convert any `<pre><code class="language-mermaid">` into render targets.
    const codeBlocks = Array.from(
      root.querySelectorAll<HTMLPreElement>("pre > code.language-mermaid")
    );
    for (const codeEl of codeBlocks) {
      const pre = codeEl.parentElement;
      if (!pre) continue;
      const source = codeEl.textContent ?? "";
      const div = document.createElement("div");
      div.className = "mermaid";
      div.setAttribute("data-mermaid-src", source);
      div.textContent = source;
      // Hide the raw source until the SVG is ready to avoid a flash of code.
      div.style.visibility = "hidden";
      pre.replaceWith(div);
    }

    // 2. Collect every not-yet-rendered mermaid div (covers StrictMode re-runs
    //    where a previous invocation created the divs but was cancelled).
    const targets = Array.from(
      root.querySelectorAll<HTMLDivElement>("div.mermaid:not([data-mermaid-rendered])")
    );
    if (targets.length === 0) return;

    let active = true;
    (async () => {
      const { default: mermaid } = await import("mermaid");
      // Drop targets that left the document while the dynamic import was loading.
      const live = targets.filter((n) => n.isConnected);
      if (!active || live.length === 0) return;

      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
        fontFamily: "inherit",
        flowchart: { htmlLabels: true },
      });

      try {
        await mermaid.run({ nodes: live });
        for (const node of live) {
          node.style.visibility = "";
          node.setAttribute("data-mermaid-rendered", "true");
        }
      } catch (err) {
        console.error("[mermaid] failed to render diagram:", err);
        // Restore the original code block for anything that did not render so
        // the source remains visible instead of showing a blank panel. The
        // restored block deliberately omits the `language-mermaid` class so the
        // CSS rule that hides raw mermaid fences does not hide the fallback.
        for (const node of live) {
          if (node.querySelector("svg")) {
            node.style.visibility = "";
            node.setAttribute("data-mermaid-rendered", "true");
            continue;
          }
          const source = node.getAttribute("data-mermaid-src") ?? "";
          const pre = document.createElement("pre");
          const code = document.createElement("code");
          code.textContent = source;
          pre.appendChild(code);
          node.replaceWith(pre);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [html]);

  return (
    <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
