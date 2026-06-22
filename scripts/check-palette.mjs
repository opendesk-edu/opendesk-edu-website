#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const SVG_DIR = "public/static";

// Allowed palette colors (case-insensitive)
// Core brand colors
const ALLOWED_COLORS = new Set([
  // Primary brand
  "#341291", "#571efa",
  // Brand purple shades (found in actual artwork SVGs)
  "#927afa", "#ddd6fe", "#7c3aed", "#6d28d9", "#a78bfa", "#ede9fe", "#f5f3ff", "#e9e5f5",
  // Neutrals
  "#6b7280", "#e5e7eb", "#f3f4f6", "#9ca3af", "#4b5563", "#d1d5db", "#374151",
  "#ffffff", "#fafbfc", "#f9fafb", "#000000", "#111827", "#1f2937",
  // Dark backgrounds (brand artwork)
  "#0a0014", "#0d0020",
  // Diagram accent colors (architecture, saml-flow, component-alternatives)
  "#2563eb", "#93c5fd", "#dbeafe", "#1e40af", "#eff6ff",
  "#059669", "#d1fae5", "#ecfdf5",
  "#c2410c", "#ea580c", "#9a3412", "#fff7ed", "#fed7aa",
  // Blog teaser / data viz colors
  "#1a0a30", "#120824", "#0f001a", "#1a0030", "#0d0016",
  "#1a1a2e", "#16213e",
  "#22c55e", "#16a34a", "#47a138", "#358029", "#86efac", "#d1fae5",
  "#3b82f6", "#2563eb", "#1e40af", "#75aadb", "#4e8cc3", "#007acc", "#005a9e", "#93c5fd", "#dbeafe",
  "#f59e0b", "#d97706", "#eab308",
  "#ef4444", "#dc2626",
  "#f37726", "#e55b1a", "#c2410c", "#ea580c", "#9a3412",
  "#a855f7",
  "#333333", "#666666", "#e2e8f0", "#a58eb5",
  "transparent",
]);

// Allowed non-color values
const ALLOWED_VALUES = new Set(["currentcolor", "none", "inherit", "white"]);

function findSvgFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSvgFiles(fullPath));
    } else if (entry.name.endsWith(".svg")) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractColors(content) {
  const colors = new Set();

  // Match fill="..." stroke="..." color="..." stop-color="..." flood-color="..." light-color="..."
  const attrPattern =
    /(?:fill|stroke|color|stop-color|flood-color|light-color)\s*=\s*"([^"]+)"/gi;
  let match;
  while ((match = attrPattern.exec(content)) !== null) {
    for (const val of match[1].split(/\s+/)) {
      colors.add(val);
    }
  }

  // Match style="..." properties
  const stylePattern = /style\s*=\s*"([^"]+)"/gi;
  while ((match = stylePattern.exec(content)) !== null) {
    const styleContent = match[1];
    const propPattern =
      /(?:fill|stroke|color|stop-color|flood-color|background-color)\s*:\s*([^;"}]+)/gi;
    let propMatch;
    while ((propMatch = propPattern.exec(styleContent)) !== null) {
      for (const val of propMatch[1].trim().split(/\s+/)) {
        colors.add(val);
      }
    }
  }

  return colors;
}

function isAllowed(color) {
  const lower = color.toLowerCase();

  // Skip url() references (gradients, patterns, etc.)
  if (/^url\(/i.test(lower)) return true;

  // Skip allowed named values
  if (ALLOWED_VALUES.has(lower)) return true;

  // Check against palette
  if (ALLOWED_COLORS.has(lower)) return true;

  // Check 3-digit hex shorthand
  if (/^#[0-9a-f]{3}$/i.test(lower)) {
    // Expand to 6-digit and check
    const expanded = `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
    return ALLOWED_COLORS.has(expanded);
  }

  // Check 6-digit hex
  if (/^#[0-9a-f]{6}$/i.test(lower)) {
    return ALLOWED_COLORS.has(lower);
  }

  // Check rgb/rgba values — skip for now (rare in SVGs)
  if (/^rgb/i.test(lower)) return true;

  return false;
}

const svgFiles = findSvgFiles(SVG_DIR);
if (svgFiles.length === 0) {
  console.log("No SVG files found in", SVG_DIR);
  process.exit(0);
}

let hasViolations = false;

for (const filePath of svgFiles) {
  const relPath = relative(process.cwd(), filePath);
  const content = readFileSync(filePath, "utf-8");
  const colors = extractColors(content);

  const violations = [];
  for (const color of colors) {
    if (!isAllowed(color)) {
      violations.push(color);
    }
  }

  if (violations.length === 0) {
    console.log(`✓ ${relPath}`);
  } else {
    console.log(`✗ ${relPath} — disallowed color(s): ${violations.join(", ")}`);
    hasViolations = true;
  }
}

console.log(`\n${svgFiles.length} SVG file(s) checked.`);
process.exit(hasViolations ? 1 : 0);
