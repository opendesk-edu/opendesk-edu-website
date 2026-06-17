/**
 * Checks integration status by scanning blog content for service/deployment counts.
 * Run: node scripts/check-integration.mjs
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const BLOG_DIR = join(root, "content", "en", "blog");
const FILES = [
  "maui-cluster-sprint-update.md",
  "progress-report-june-2026.md",
  "hrz-maui-cluster-progress.md",
  "collab-services-scientific-tools.md",
];

function findMaxDeployments() {
  let max = 0;
  for (const f of FILES) {
    const fp = join(BLOG_DIR, f);
    if (!existsSync(fp)) continue;
    const content = readFileSync(fp, "utf-8");
    const match = content.match(/(\d+)\s*deployments?/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  return max;
}

const deployedCount = findMaxDeployments();

if (deployedCount === 0) {
  console.error("ERROR: No deployment count found in any blog content file.");
  process.exit(1);
}

console.log(
  `Integration status: ${deployedCount} services deployed`
);

