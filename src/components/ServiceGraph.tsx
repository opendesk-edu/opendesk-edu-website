"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import cytoscape from "cytoscape";
import type { Post } from "@/lib/content";
import { useRouter } from "@/i18n/navigation";

const CATEGORY_GROUP: Record<string, string> = {
  "scientific-computing": "Scientific Computing & Research",
  research: "Scientific Computing & Research",
  ai: "Scientific Computing & Research",
  communication: "Communication & Collaboration",
  collaboration: "Communication & Collaboration",
  storage: "File Storage & Sync",
  productivity: "Office & Productivity",
  office: "Office & Productivity",
  "document-editing": "Office & Productivity",
  "note-taking": "Office & Productivity",
  diagramming: "Office & Productivity",
  lms: "Learning Management",
  "e-learning": "Learning Management",
  education: "Learning & Education",
  teaching: "Learning & Education",
  "project-management": "Project & Knowledge Management",
  documentation: "Project & Knowledge Management",
  portal: "Portal & Infrastructure",
  infrastructure: "Portal & Infrastructure",
  cms: "Portal & Infrastructure",
  security: "Portal & Infrastructure",
};

const CLUSTER_COLORS: Record<string, string> = {
  "Scientific Computing & Research": "#3b82f6",
  "Communication & Collaboration": "#22c55e",
  "File Storage & Sync": "#f97316",
  "Office & Productivity": "#eab308",
  "Learning & Education": "#8b5cf6",
  "Learning Management": "#ec4899",
  "Project & Knowledge Management": "#06b6d4",
  "Portal & Infrastructure": "#6b7280",
  Other: "#9ca3af",
};

const CLUSTER_ORDER = [
  "Scientific Computing & Research",
  "Communication & Collaboration",
  "File Storage & Sync",
  "Office & Productivity",
  "Learning & Education",
  "Learning Management",
  "Project & Knowledge Management",
  "Portal & Infrastructure",
  "Other",
];

function getPrimaryGroup(post: Post): string {
  for (const cat of post.categories ?? []) {
    if (CATEGORY_GROUP[cat]) return CATEGORY_GROUP[cat];
  }
  return "Other";
}

type Status = "Stable" | "Beta" | "Planned";

function getStatus(post: Post): Status {
  if (post.categories?.includes("planned")) return "Planned";
  if (post.categories?.includes("beta")) return "Beta";
  return "Stable";
}

function isBase(post: Post): boolean {
  return post.categories?.includes("base") ?? false;
}

interface ServiceGraphProps {
  posts: Post[];
  section: string;
  locale: string;
}

export default function ServiceGraph({ posts, section, locale }: ServiceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const router = useRouter();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const filteredPosts = useMemo(() => posts.filter((p) => p.slug !== "compare"), [posts]);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes: cytoscape.ElementDefinition[] = [];
    const edges: cytoscape.ElementDefinition[] = [];
    const postMap = new Map<string, Post>();

    for (const post of filteredPosts) {
      postMap.set(post.slug, post);
      const group = getPrimaryGroup(post);
      const status = getStatus(post);
      const base = isBase(post);

      const nodeSize = status === "Stable" ? 54 : status === "Beta" ? 42 : 34;
      const color = CLUSTER_COLORS[group] ?? "#9ca3af";

      nodes.push({
        data: {
          id: post.slug,
          label: post.title,
          group,
          status,
          base,
          color,
          size: nodeSize,
          description: post.description ?? "",
          version: post.version ?? "",
          href: `/${locale}/${section}/${post.slug}`,
        },
        classes: `${status.toLowerCase()} ${base ? "base" : ""}`,
        position: { x: 0, y: 0 },
      });
    }

    const edgeSet = new Set<string>();

    for (let i = 0; i < filteredPosts.length; i++) {
      for (let j = i + 1; j < filteredPosts.length; j++) {
        const a = filteredPosts[i];
        const b = filteredPosts[j];
        const aCats = new Set(a.categories ?? []);
        const bCats = new Set(b.categories ?? []);
        const sharedCats = [...aCats].filter((c) => bCats.has(c) && CATEGORY_GROUP[c]);
        const aTags = new Set(a.tags ?? []);
        const bTags = new Set(b.tags ?? []);
        const sharedTags = [...aTags].filter((t) => bTags.has(t));

        let weight = 0;

        if (sharedCats.length > 0) {
          weight += sharedCats.length * 3;
        }

        if (sharedTags.length > 0) {
          weight += sharedTags.length;
        }

        if (isBase(a) && isBase(b)) {
          weight += 2;
        }

        if (weight > 0) {
          const edgeId = `${a.slug}-${b.slug}`;
          if (!edgeSet.has(edgeId)) {
            edgeSet.add(edgeId);
            const shared = [...new Set([...sharedCats, ...sharedTags])];
            edges.push({
              data: {
                id: edgeId,
                source: a.slug,
                target: b.slug,
                weight: Math.min(weight / 4, 1),
                label: shared.slice(0, 3).join(", "),
              },
            });
          }
        }
      }
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "11px",
            "text-wrap": "wrap",
            "text-max-width": "80px",
            color: "#e2e8f0",
            "background-color": "data(color)",
            width: "data(size)",
            height: "data(size)",
            "border-width": 2,
            "border-color": "#1e293b",
            "transition-property":
              "width, height, border-width, background-color",
            "transition-duration": 200,
          },
        },
        {
          selector: "node.base",
          style: {
            "border-width": 4,
            "border-color": "#fbbf24",
          },
        },
        {
          selector: "node.planned",
          style: {
            opacity: 0.5,
            "border-style": "dashed",
          },
        },
        {
          selector: "node.beta",
          style: {
            "border-style": "dotted",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "#475569",
            "target-arrow-color": "#475569",
            "target-arrow-shape": "none",
            "curve-style": "bezier",
            opacity: 0.4,
          },
        },
        {
          selector: "edge[weight > 0.6]",
          style: {
            width: 3,
            "line-color": "#94a3b8",
            opacity: 0.7,
          },
        },
      ],
      layout: {
        name: "cose",
        animate: true,
        animationDuration: 800,
        nodeRepulsion: () => 12000,
        idealEdgeLength: () => 120,
        nodeOverlap: 10,
        gravity: 0.25,
        numIter: 1000,
      },
      minZoom: 0.4,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      const href = node.data("href");
      if (href) router.push(href);
    });

    cy.on("mouseover", "node", (evt) => {
      const node = evt.target;
      setSelectedNode(node.id());
    });

    cy.on("mouseout", "node", () => {
      setSelectedNode(null);
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [filteredPosts, locale, section, router]);

  const selectedPost = selectedNode
    ? filteredPosts.find((p) => p.slug === selectedNode)
    : null;

  return (
    <div className="relative">
      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        {CLUSTER_ORDER.filter(
          (g) => g !== "Other" || filteredPosts.some((p) => getPrimaryGroup(p) === "Other")
        ).map((group) => (
          <span key={group} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: CLUSTER_COLORS[group] }}
            />
            {group}
          </span>
        ))}
        <span className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border">
          <span className="w-3 h-3 rounded-full border-2 border-amber-400 inline-block" />
          Base service
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-dashed border-slate-400 inline-block" />
          Planned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-dotted border-slate-400 inline-block" />
          Beta
        </span>
      </div>

      {/* Graph canvas */}
      <div
        ref={containerRef}
        className="w-full border border-border rounded-xl bg-background-secondary"
        style={{ height: "650px" }}
      />

      {/* Tooltip */}
      {selectedPost && (
        <div className="absolute top-20 right-4 w-64 rounded-xl border border-border bg-background p-4 shadow-lg text-sm z-10">
          <div className="font-semibold text-foreground mb-1">
            {selectedPost.title}
          </div>
          {selectedPost.version && (
            <div className="text-xs text-foreground-secondary font-mono mb-1">
              v{selectedPost.version}
            </div>
          )}
          <div className="text-foreground-secondary text-xs line-clamp-3 leading-relaxed">
            {selectedPost.description}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                getStatus(selectedPost) === "Stable"
                  ? "bg-green-900/40 text-green-300"
                  : getStatus(selectedPost) === "Beta"
                    ? "bg-yellow-900/40 text-yellow-300"
                    : "bg-slate-700 text-slate-300"
              }`}
            >
              {getStatus(selectedPost)}
            </span>
            {isBase(selectedPost) && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300">
                Base
              </span>
            )}
            {selectedPost.categories
              ?.filter((c) => CATEGORY_GROUP[c])
              .slice(0, 2)
              .map((c) => (
                <span
                  key={c}
                  className="text-xs px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300"
                >
                  {c}
                </span>
              ))}
          </div>
          <div className="mt-2 text-xs text-accent">
            Click to open →
          </div>
        </div>
      )}
    </div>
  );
}
