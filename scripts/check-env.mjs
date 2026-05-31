#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ENV_FILE = resolve(".env.example");

const REQUIRED_IF_FEATURE = {
  SMTP_HOST: "contact form",
  SMTP_PORT: "contact form",
  SMTP_USER: "contact form",
  SMTP_PASS: "contact form",
  SMTP_FROM: "contact form",
  LISTMONK_URL: "newsletter subscription",
  LISTMONK_API_KEY: "newsletter subscription",
  LISTMONK_LIST_ID: "newsletter subscription",
  NTFY_TOPIC: "deploy notifications",
  CLARITY_ID: "Microsoft Clarity analytics",
};

const VITE_PREFIX = "NEXT_PUBLIC_";

let exitCode = 0;

console.log("\n🔍 Checking environment variables...\n");

// Load .env file if it exists
let envFileVars = new Set();
if (existsSync(".env")) {
  const content = readFileSync(".env", "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const key = trimmed.split("=")[0]?.trim();
      if (key) envFileVars.add(key);
    }
  }
}

// Check each variable
for (const [key, feature] of Object.entries(REQUIRED_IF_FEATURE)) {
  const isSet = !!process.env[key] || envFileVars.has(key);
  if (!isSet) {
    console.warn(`⚠  ${key} is not set (needed for: ${feature})`);
  } else {
    console.log(`✓ ${key}`);
  }
}

// Check .env.example consistency
if (existsSync(ENV_FILE)) {
  console.log("\n--- .env.example check ---");
  const exampleContent = readFileSync(ENV_FILE, "utf-8");
  const exampleKeys = new Set();
  for (const line of exampleContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const key = trimmed.split("=")[0]?.trim();
      if (key) exampleKeys.add(key);
    }
  }
  // Check for documented vars that aren't in REQUIRED_IF_FEATURE
  for (const key of exampleKeys) {
    if (!(key in REQUIRED_IF_FEATURE)) {
      console.log(`  ${key} documented in .env.example (not checked)`);
    }
  }
}

console.log("\n✅ Environment check complete.\n");
process.exit(exitCode);
