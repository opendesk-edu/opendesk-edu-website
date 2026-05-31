#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const CONTENT_DIR = resolve("content");
const SECTIONS = ["blog", "components", "architecture", "get-started"];
const LOCALES = ["en", "de", "fr", "zh"];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function ask(rl, question, defaultValue) {
  const hint = defaultValue ? ` [${defaultValue}]` : "";
  const answer = await rl.question(`${question}${hint}: `);
  return answer.trim() || defaultValue || "";
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n📝 openDesk Edu - Create Post\n");

  const title = await ask(rl, "Post title", "");
  if (!title) {
    console.error("❌ Title is required.");
    process.exit(1);
  }

  const slug = await ask(rl, "URL slug", slugify(title));
  const section = await ask(rl, `Section (${SECTIONS.join("/")})`, "blog");
  if (!SECTIONS.includes(section)) {
    console.error(`❌ Invalid section. Choose from: ${SECTIONS.join(", ")}`);
    process.exit(1);
  }

  const description = await ask(rl, "Description (meta description)", "");
  const categoriesRaw = await ask(rl, "Categories (comma-separated)", "general");
  const categories = categoriesRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const tagsRaw = await ask(rl, "Tags (comma-separated)", "");
  const tags = tagsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const version = await ask(rl, "Version (for components only)", "");
  const date = await ask(rl, "Date (YYYY-MM-DD)", today());

  const localeList = await ask(rl, `Locales (comma-separated: ${LOCALES.join(",")})`, "en");
  const locales = localeList.split(",").map((s) => s.trim()).filter(Boolean);

  console.log("\n--- Frontmatter Preview ---");
  const frontmatter = [
    "---",
    `title: "${title}"`,
    `date: "${date}"`,
    description ? `description: "${description}"` : null,
    categories.length > 0 ? `categories: [${categories.map((c) => JSON.stringify(c)).join(", ")}]` : null,
    tags.length > 0 ? `tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]` : null,
    version && section === "components" ? `version: "${version}"` : null,
    "---",
    "",
    `# ${title}`,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  console.log(frontmatter);
  console.log();

  const ok = await ask(rl, "Create this post?", "y");
  if (ok.toLowerCase() !== "y") {
    console.log("❌ Cancelled.");
    process.exit(0);
  }

  for (const locale of locales) {
    const dir = join(CONTENT_DIR, locale, section);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const filePath = join(dir, `${slug}.md`);
    if (existsSync(filePath)) {
      console.warn(`⚠️  ${filePath} already exists — skipping.`);
      continue;
    }
    writeFileSync(filePath, frontmatter, "utf-8");
    console.log(`✅ Created ${filePath}`);
  }

  rl.close();
  console.log("\n🎉 Done.");
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
