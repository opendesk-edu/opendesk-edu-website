#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = resolve("content");
const SECTIONS = ["blog", "components", "architecture", "get-started"];
const LOCALES = ["en", "de", "fr", "zh"];
const REQUIRED_FIELDS = ["title", "date"];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

let totalErrors = 0;
let totalWarnings = 0;
const fileCounts = {};

function error(path, msg) {
  console.error(`✗ ${path}: ${msg}`);
  totalErrors++;
}

function warn(path, msg) {
  console.warn(`⚠ ${path}: ${msg}`);
  totalWarnings++;
}

function collectFiles() {
  const files = [];
  for (const locale of LOCALES) {
    for (const section of SECTIONS) {
      const dir = join(CONTENT_DIR, locale, section);
      if (!existsSync(dir)) continue;
      const entry = readdirSync(dir, { withFileTypes: true });
      for (const e of entry) {
        if (e.isFile() && e.name.endsWith(".md")) {
          files.push({ path: join(dir, e.name), locale, section, name: e.name });
        }
      }
    }
  }
  return files;
}

function validatePost(filePath, locale, section) {
  const relPath = join(locale, section, filePath.split("/").pop());
  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    error(relPath, "cannot read file");
    return;
  }

  // Parse frontmatter
  let parsed;
  try {
    parsed = matter(content);
  } catch (e) {
    error(relPath, `invalid frontmatter: ${e.message}`);
    return;
  }

  const data = parsed.data;

  // Required fields
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      error(relPath, `missing required field "${field}"`);
    }
  }

  // Date format
  if (data.date && !DATE_REGEX.test(data.date)) {
    warn(relPath, `date "${data.date}" is not YYYY-MM-DD format`);
  }

  // Title should not be empty
  if (data.title && typeof data.title === "string" && !data.title.trim()) {
    error(relPath, "title is empty");
  }

  // Draft detection
  if (data.draft === true) {
    warn(relPath, "is marked as draft");
  }

  // Categories should be an array
  if (data.categories !== undefined && !Array.isArray(data.categories)) {
    error(relPath, "categories should be an array");
  }

  // Tags should be an array
  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    error(relPath, "tags should be an array");
  }

  // Version — only expected for components
  if (data.version && section !== "components") {
    warn(relPath, `has version field but is not in components section`);
  }

  // Body should not be empty
  if (!parsed.content || !parsed.content.trim()) {
    warn(relPath, "body is empty");
  }

  // Track for cross-locale check
  const key = `${section}/${filePath.split("/").pop()}`;
  if (!fileCounts[key]) fileCounts[key] = [];
  fileCounts[key].push(locale);
}

async function main() {
  console.log(`\n🔍 Validating content files...\n`);

  const files = collectFiles();
  if (files.length === 0) {
    console.warn("No content files found.");
    process.exit(0);
  }

  for (const file of files) {
    validatePost(file.path, file.locale, file.section);
  }

  // Cross-locale consistency check
  console.log("\n--- Cross-Locale Coverage ---");
  for (const [key, locales] of Object.entries(fileCounts).sort()) {
    const missing = LOCALES.filter((l) => !locales.includes(l));
    if (missing.length > 0) {
      warn(key, `missing locales: ${missing.join(", ")}`);
    } else {
      console.log(`✓ ${key} — all ${locales.length} locales`);
    }
  }

  // Summary
  const totalFiles = files.length;
  console.log(`\n--- Summary ---`);
  console.log(`Files checked: ${totalFiles}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.error(`\n❌ ${totalErrors} error(s) found.`);
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.warn(`\n⚠  ${totalWarnings} warning(s) found.`);
  }

  console.log("\n✅ All content valid.");
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
