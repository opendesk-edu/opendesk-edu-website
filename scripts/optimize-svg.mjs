#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { optimize } from "svgo";

const SVG_DIR = "public/static";

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

const svgoConfig = {
  plugins: [
    "removeComments",
    "removeMetadata",
    "removeEmptyAttrs",
    "collapseGroups",
    "sortAttrs",
  ],
};

const svgFiles = findSvgFiles(SVG_DIR);
if (svgFiles.length === 0) {
  console.log("No SVG files found in", SVG_DIR);
  process.exit(0);
}

let totalBefore = 0;
let totalAfter = 0;

for (const filePath of svgFiles) {
  const relPath = relative(process.cwd(), filePath);
  const input = readFileSync(filePath, "utf-8");
  const beforeSize = Buffer.byteLength(input, "utf-8");

  const result = optimize(input, {
    path: filePath,
    ...svgoConfig,
  });

  const afterSize = Buffer.byteLength(result.data, "utf-8");
  totalBefore += beforeSize;
  totalAfter += afterSize;

  const savings = ((1 - afterSize / beforeSize) * 100).toFixed(1);
  const arrow = afterSize < beforeSize ? "↓" : afterSize > beforeSize ? "↑" : "=";

  console.log(
    `${arrow} ${relPath}: ${(beforeSize / 1024).toFixed(1)}KB → ${(afterSize / 1024).toFixed(1)}KB (${savings}%)`
  );

  writeFileSync(filePath, result.data, "utf-8");
}

const totalSavings = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
console.log(
  `\nTotal: ${(totalBefore / 1024).toFixed(1)}KB → ${(totalAfter / 1024).toFixed(1)}KB (${totalSavings}% saved)`
);
