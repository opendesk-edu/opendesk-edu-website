# Plan: Build openDesk Edu Website (opendesk-edu.org)

## TL;DR

> **Quick Summary**: Build a greenfield Next.js 16 website for opendesk-edu.org with 4 content sections, multi-language support (EN/DE/FR/ZH), full SEO, and Docker deployment. Modeled on next-graphwiz-ai architecture but with openDesk Edu branding and content.
>
> **Deliverables**:
> - Fully functional Next.js website with Components, Architecture, Get Started, Blog sections
> - Multi-language support (next-intl) for EN/DE/FR/ZH
> - Complete SEO (sitemap, robots, RSS, JSON-LD, OG tags)
> - Docker deployment with Traefik reverse proxy
> - CI/CD pipeline (GitHub Actions → SSH deploy)
> - Test coverage (Vitest unit + Playwright e2e) via TDD workflow
> - Artwork integration (SVGs, PNG exports, palette adherence)
> - Artwork CI pipeline (SVG validation, optimization, PNG generation)
>
> **Estimated Effort**: XL (3-phase implementation: Foundation → i18n → Polish)
> **Parallel Execution**: YES - 7 waves with max 7 concurrent tasks
> **Critical Path**: Project scaffolding → Content system → Layout → Homepage → Article pages → i18n layer → Content creation

---

## Context

### Original Request
Build a greenfield Next.js website for opendesk-edu.org, modeled on next-graphwiz-ai architecture but with different content/domain/branding. Server currently at opendesk-sme.graphwiz.ai, will be renamed to opendesk-edu.org.

### Interview Summary

**Key Discussions**:
- **Content sections**: 4 — Components, Architecture, Get Started, Blog
- **Multi-language**: 4 languages — EN, DE, FR, ZH via next-intl
- **Email**: info@opendesk-edu.org
- **Analytics**: Plausible + Microsoft Clarity with cookie consent
- **Repo hosting**: Both Codeberg + GitHub (mirrored)
- **Content source**: Adapt from existing opendesk-edu docs, focus on EDU features (not vanilla openDesk)
- **Artwork CI**: Full pipeline (validate SVGs, optimize with svgo, palette check, generate icon set, export PNGs)
- **Test strategy**: TDD with Vitest + Playwright

**Research Findings**:
- **Reference project** (next-graphwiz-ai): Complete implementation with 12 components, markdown content system, SEO, testing, CI/CD. Stack: Next.js 16.2.1, React 19.2.4, TypeScript strict, Tailwind v4, MDX with gray-matter + remark/rehype
- **Artwork repo**: 17 service icons, 5 brand assets, 3 diagrams. Purple palette (#341291, #571EFA), flat/geometric style. NO existing CI
- **openDesk Edu project**: 59+ documentation files covering architecture, getting started, external services. Deployed via Kubernetes + Helm

### Metis Review

**Identified Gaps** (addressed):
- **i18n routing**: Adopted phased approach — build English-only first (Phase 1), then add i18n layer (Phase 2). Subdirectory routing strategy default.
- **Content strategy**: Defined minimum v1 scope — 1-2 placeholder articles per section, structure for expansion
- **Imprint/Privacy**: Placeholder text with clear TODO markers for legal review
- **Domain/deployment**: Using opendesk-edu.org as primary, same SSH deploy pattern as reference
- **Social links**: Email-only for v1, extensible for social accounts later
- **Artwork CI**: Integrated into website build process, not separate artwork repo CI
- **Codeberg/GitHub**: GitHub as primary, Codeberg as mirror (git remote)
- **RSS feed**: Combined feed for v1, extensible to per-language later
- **llms.txt**: Omitted for v1 to reduce scope

**Key Directives Applied**:
- **MUST**: Use Next.js 16.2.1, React 19.2.4, TypeScript strict, Tailwind v4 exactly matching reference
- **MUST**: Use `output: "standalone"` (not export) for Docker/Node.js server
- **MUST**: Use `@next/mdx` with `pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"]`
- **MUST**: Use same gray-matter + remark/rehype content pipeline
- **MUST**: Use same CSS theming (data-theme + custom properties)
- **MUST**: Use same markdown frontmatter schema (title, date, description, categories, tags, slug, draft)
- **MUST**: Use `images: { unoptimized: true }` in next.config.ts (standalone requirement)
- **MUST**: Use Node 20-alpine for Docker
- **MUST**: Include security headers (X-Frame-Options: DENY, etc.)
- **MUST**: Use purple palette (#341291, #571EFA), NOT reference blue (#0288d1)
- **MUST NOT**: Copy any graphwiz-specific content/branding
- **MUST NOT**: Implement FR and ZH translations in Phase 2 — ship EN+DE only
- **TDD workflow**: Write test → watch fail → implement → watch pass → refactor → commit

**Recommended Approach**:
- **Phase 1 (Foundation)**: English-only site, working/deployable/testable, exactly mirroring reference architecture with openDesk Edu branding
- **Phase 2 (i18n Layer)**: Add next-intl with subdirectory routing, English + German
- **Phase 3 (Content & Polish)**: Remaining content, FR+ZH translations, artwork CI, Codeberg mirror

---

## Work Objectives

### Core Objective
Build a production-ready documentation/marketing website for openDesk Edu that showcases the 15 education services, provides architecture documentation, and offers a getting-started guide for university IT admins.

### Concrete Deliverables
- **Next.js 16 website** with 4 content sections (Components, Architecture, Get Started, Blog)
- **Multi-language support** for EN/DE/FR/ZH via next-intl with subdirectory routing
- **12 React components** (Header, Footer, ArticlePage, SectionPage, PostCard, TableOfContents, Badges, CookieConsent, ThemeProvider, ErrorBoundary, EmailLink, Icons)
- **Markdown content system** with gray-matter frontmatter + remark/rehype pipeline
- **SEO infrastructure**: sitemap.ts, robots.ts, RSS feed, JSON-LD (Organization + BlogPosting), OG/Twitter tags
- **Dark/light theme** switching via data-theme attribute + CSS custom properties
- **Docker deployment**: Multi-stage build with node:20-alpine, standalone output, Traefik reverse proxy labels
- **CI/CD pipeline**: GitHub Actions (lint → test → build → SSH deploy)
- **Test coverage**: Vitest (unit) + Playwright (e2e), TDD workflow
- **Analytics**: Plausible + Clarity with cookie consent (lazy-loaded)
- **Artwork integration**: 17 service icons, 5 brand assets, 3 diagrams, PNG exports
- **Artwork CI**: SVG validation, svgo optimization, palette check, icon set generation

### Definition of Done
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run test` passes with all Vitest unit tests
- [ ] `npx playwright test` passes with all e2e tests
- [ ] `npm run build` succeeds with standalone output
- [ ] `docker build -t opendesk-edu:test .` succeeds
- [ ] `docker compose up -d` deploys successfully
- [ ] Homepage loads at http://localhost:3000 with correct branding
- [ ] All 4 sections (Components, Architecture, Get Started, Blog) load correctly
- [ ] Article pages render with TOC sidebar and JSON-LD structured data
- [ ] Theme toggle switches between dark/light modes
- [ ] Cookie consent banner appears on first visit, accepts/declines correctly
- [ ] Analytics scripts load only after consent
- [ ] English and German content load at `/en/...` and `/de/...`
- [ ] Sitemap includes hreflang alternates for EN and DE
- [ ] RSS feed generates correctly at `/feed.xml`
- [ ] All QA scenarios pass with evidence captured in `.sisyphus/evidence/`

### Must Have
- Next.js 16.2.1, React 19.2.4, TypeScript strict, Tailwind v4
- Multi-language support (EN/DE/FR/ZH) with next-intl
- 4 content sections with markdown files
- Complete SEO (sitemap, robots, RSS, JSON-LD, OG tags)
- Dark/light theme switching
- Docker deployment with Traefik labels
- CI/CD with GitHub Actions (lint, test, build, SSH deploy)
- Test coverage (Vitest + Playwright) via TDD
- Analytics (Plausible + Clarity) with cookie consent
- Artwork integration (SVGs + PNG exports)
- Artwork CI pipeline (validation, optimization, palette check)

### Must NOT Have (Guardrails)
- No content from reference project (no AI, DevOps, XR articles)
- No graphwiz branding/colors (use purple palette #341291, #571EFA)
- No static export mode (`output: "export"`) — use `standalone` for Docker
- No hardcoded UI strings (all via next-intl messages)
- No FR or ZH translations in Phase 2 — ship EN+DE only
- No EmailLink obfuscation pattern from reference (simpler approach okay)
- No analytics scripts loaded without consent
- No imprint/privacy page content (use placeholder text)
- No artwork repo modification (copy assets only)
- No direct code copying from reference — replicate patterns, not code

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: NO — fresh project, need full setup
- **Automated tests**: YES (TDD) — Vitest for unit tests, Playwright for e2e
- **Framework**: Vitest + Playwright (matching reference project)
- **TDD workflow**: Each task follows RED (write failing test) → GREEN (minimal implementation) → REFACTOR (clean code)

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **TUI/CLI**: Use interactive_bash (tmux) — Run command, send keystrokes, validate output
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Library/Module**: Use Bash (bun/node REPL) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.
> Target: 5-8 tasks per wave. Fewer than 3 per wave (except final) = under-splitting.

```
PHASE 1: Foundation (English-only site)

Wave 1 (Project Scaffolding - 7 parallel tasks):
├── Task 1: Project initialization (npm create, package.json) [quick]
├── Task 2: TypeScript & ESLint config [quick]
├── Task 3: Next.js 16 config (next.config.ts) [quick]
├── Task 4: Tailwind v4 setup (globals.css) [quick]
├── Task 5: Vitest + Playwright config [quick]
├── Task 6: Path alias (@/* → ./src/*) [quick]
└── Task 7: Docker + docker-compose setup [quick]

Wave 2 (Foundation Components - 6 parallel tasks):
├── Task 8: Site config (config.ts) - site URL, name, description [quick]
├── Task 9: Content system (content.ts) - markdown loading, parsing [unspecified-high]
├── Task 10: ThemeProvider (context, localStorage, data-theme) [quick]
├── Task 11: ErrorBoundary (class component, fallback UI) [quick]
├── Task 12: Icon components (service icons from artwork) [quick]
└── Task 13: Artwork assets copy to public/static/ [quick]

Wave 3 (Core Components - 6 parallel tasks, depends: 8, 9, 10, 11):
├── Task 14: Root layout (SEO, theme, structured data) [quick]
├── Task 15: Header (sticky, mobile hamburger, theme toggle) [visual-engineering]
├── Task 16: Footer (imprint, privacy, email links) [visual-engineering]
├── Task 17: PostCard (article preview card) [visual-engineering]
├── Task 18: SectionPage (reusable section listing) [visual-engineering]
└── Task 19: Badges (Tag + CategoryBadge) [visual-engineering]

Wave 4 (Article System - 4 sequential tasks, depends: 9, 15, 16, 18):
├── Task 20: ArticlePage (full article + TOC sidebar + JSON-LD) [deep]
├── Task 21: TableOfContents (IntersectionObserver active tracking) [quick]
├── Task 22: Dynamic route [section]/[slug]/page.tsx [deep]
└── Task 23: Static routes (about, imprint, privacy, 404) [unspecified-high]

Wave 5 (Homepage & Analytics - 4 tasks, depends: 14, 15, 16, 17, 18):
├── Task 24: Homepage (hero, sections, latest posts) [visual-engineering]
├── Task 25: CookieConsent (Plausible + Clarity lazy-load) [quick]
├── Task 26: EmailLink (obfuscated mailto) [quick]
└── Task 27: Analytics integration (Plausible + Clarity scripts) [quick]

Wave 6 (SEO & Deployment - 5 tasks, depends: 20, 22, 23, 24):
├── Task 28: Sitemap (sitemap.ts) [quick]
├── Task 29: Robots.txt (robots.ts) [quick]
├── Task 30: RSS feed (feed.xml/route.ts) [quick]
├── Task 31: GitHub Actions CI (lint, test, build, deploy) [unspecified-high]
└── Task 32: Docker deploy verification (test SSH build) [quick]

PHASE 2: i18n Layer (English + German)

Wave 7 (i18n Foundation - 5 tasks, depends: ALL Phase 1 complete):
├── Task 33: next-intl installation + config [quick]
├── Task 34: Middleware (locale detection, subdirectory routing) [unspecified-high]
├── Task 35: Root layout split (html lang attribute, locale provider) [quick]
├── Task 36: Message files (en.json, de.json) - UI strings [quick]
└── Task 37: Content structure split (content/en/, content/de/) [quick]

Wave 8 (Component i18n - 6 tasks, depends: 33, 34, 35, 36):
├── Task 38: Header i18n (nav labels, mobile menu) [visual-engineering]
├── Task 39: Footer i18n (links, copyright text) [visual-engineering]
├── Task 40: CookieConsent i18n (accept/decline text) [quick]
├── Task 41: 404 page i18n (not found text) [quick]
├── Task 42: Imprint/Privacy i18n (placeholder legal text) [quick]
└── Task 43: Homepage i18n (hero, sections headings) [visual-engineering]

Wave 9 (Content i18n - 4 tasks, depends: 36, 37, 38, 39, 43):
├── Task 44: Translate Components section (1-2 articles EN→DE) [writing]
├── Task 45: Translate Architecture section (1-2 articles EN→DE) [writing]
├── Task 46: Translate Get Started section (1-2 articles EN→DE) [writing]
└── Task 47: Translate Blog section (1-2 articles EN→DE) [writing]

Wave 10 (SEO i18n - 3 tasks, depends: 28, 29, 37):
├── Task 48: Sitemap with hreflang (EN + DE alternates) [unspecified-high]
├── Task 49: JSON-LD locale metadata (inLanguage, alternateLanguage) [quick]
└── Task 50: OG tags with locale property (og:locale:alternate) [quick]

PHASE 3: Content & Polish (FR+ZH, Artwork CI, Codeberg mirror)

Wave 11 (Remaining Languages - 8 tasks, depends: ALL Phase 2 complete):
├── Task 51: Add FR message file (messages/fr.json) [writing]
├── Task 52: Add ZH message file (messages/zh.json) [writing]
├── Task 53: Translate Components to FR (1 article) [writing]
├── Task 54: Translate Components to ZH (1 article) [writing]
├── Task 55: Translate Architecture to FR (1 article) [writing]
├── Task 56: Translate Architecture to ZH (1 article) [writing]
├── Task 57: Translate Get Started to FR (1 article) [writing]
└── Task 58: Translate Get Started to ZH (1 article) [writing]

Wave 12 (Artwork CI - 5 tasks, depends: 12, 13):
├── Task 59: SVG validation script (check well-formedness) [unspecified-high]
├── Task 60: svgo optimization script (minify SVGs) [unspecified-high]
├── Task 61: Palette check script (verify #341291, #571EFA only) [quick]
├── Task 62: PNG export script (16x16, 32x32, 1200x630 from SVGs) [quick]
├── Task 63: Artwork CI GitHub Action (run all scripts) [unspecified-high]

Wave 13 (Codeberg Mirror & Final - 4 tasks, depends: 31):
├── Task 64: Codeberg remote setup (git remote add codeberg) [quick]
├── Task 65: Mirror action (push to Codeberg on push to GitHub) [unspecified-high]
├── Task 66: Forgejo Actions sync (CI for Codeberg side) [unspecified-high]
└── Task 67: README update (setup instructions, contributing) [writing]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: 1→8→9→14→20→22→24→28→31→33→34→35→36→38→39→43→48→51→52→63→64→67→F1-F4→user okay
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 (Waves 1, 2, 3)
```

### Dependency Matrix (abbreviated - show ALL tasks in your generated plan)

```
Wave 1 (1-7): - - 8-13
Wave 2 (8-13): - - 14-19
Wave 3 (14-19): 8,9,10,11 - 20-23
Wave 4 (20-23): 9,15,16,18 - 24-27
Wave 5 (24-27): 14,15,16,17,18 - 28-32
Wave 6 (28-32): 20,22,23,24 - Phase 2
Wave 7 (33-37): Phase 1 - 38-43
Wave 8 (38-43): 33,34,35,36 - 44-47
Wave 9 (44-47): 36,37,38,39,43 - 48-50
Wave 10 (48-50): 28,29,37 - Phase 3
Wave 11 (51-58): Phase 2 - 59-63
Wave 12 (59-63): 12,13 - 64-67
Wave 13 (64-67): 31 - Final
```

> This is abbreviated for reference. YOUR generated plan must include the FULL matrix for ALL tasks.

### Agent Dispatch Summary

- **Phase 1 (Waves 1-6)**:
  - Wave 1: 7×`quick` → scaffolding + configs
  - Wave 2: 1×`quick`, 1×`unspecified-high`, 4×`quick` → foundation
  - Wave 3: 3×`quick`, 3×`visual-engineering` → core components
  - Wave 4: 2×`deep`, 1×`quick`, 1×`unspecified-high` → article system
  - Wave 5: 1×`visual-engineering`, 3×`quick` → homepage + analytics
  - Wave 6: 3×`quick`, 1×`unspecified-high`, 1×`quick` → SEO + deployment

- **Phase 2 (Waves 7-10)**:
  - Wave 7: 4×`quick`, 1×`unspecified-high` → i18n foundation
  - Wave 8: 4×`quick`, 2×`visual-engineering` → component i18n
  - Wave 9: 4×`writing` → content i18n (EN→DE)
  - Wave 10: 1×`unspecified-high`, 2×`quick` → SEO i18n

- **Phase 3 (Waves 11-13)**:
  - Wave 11: 8×`writing` → FR+ZH translations
  - Wave 12: 2×`unspecified-high`, 3×`quick` → artwork CI
  - Wave 13: 2×`unspecified-high`, 2×`quick` → Codeberg mirror

- **Final**: 4 parallel reviews (oracle, unspecified-high×2, deep)

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

- [x] 1. Project initialization (npm create, package.json)

  **What to do**:
  - Initialize Next.js project with `npm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack`
  - Install exact versions: `npm install next@16.2.1 react@19.2.4 react-dom@19.2.4 typescript@5 @types/react@19 @types/node@20`
  - Install dependencies: `npm install gray-matter remark remark-gfm remark-rehype rehype-slug rehype-stringify @next/mdx clsx tailwind-merge`
  - Install dev dependencies: `npm install -D vitest @vitejs/plugin-react @vitest/ui jsdom @playwright/test eslint-config-next`
  - Update package.json scripts: "dev": "next dev --turbopack", "build": "next build", "start": "next start", "lint": "next lint", "test": "vitest", "test:e2e": "playwright test"
  - Create .gitignore with: node_modules, .next, out, build, .env.local, .env.*.local, vitest.config.ts.snap, playwright-report, test-results, .sisyphus/evidence

  **Must NOT do**:
  - Install any Next.js CLI templates or starter kits beyond bare minimum
  - Create any pages or components yet
  - Set up any API routes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward npm initialization with exact package versions, no business logic
  - **Skills**: []
    - No special skills needed - standard npm commands
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed yet, scaffolding before git setup

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-7)
  - **Blocks**: Tasks 2-7 (depend on project initialization)
  - **Blocked By**: None (can start immediately)

  **References**:
  - Reference package.json: `C:\Users\Tobias\git\next-graphwiz-ai\package.json:1-50` - Exact dependency versions to replicate
  - npm create next-app docs: `https://nextjs.org/docs/app/api-reference/create-next-app` - CLI flags for TypeScript, Tailwind, ESLint, App Router, src-dir

  **Acceptance Criteria**:
  - [ ] package.json exists with Next.js 16.2.1, React 19.2.4, TypeScript 5
  - [ ] npm install completes without errors
  - [ ] Scripts include: dev, build, start, lint, test, test:e2e
  - [ ] .gitignore exists with appropriate exclusions
  - [ ] `npm run lint` passes (ESLint configured)
  - [ ] `npm run test` passes (Vitest configured with empty test)

  **QA Scenarios**:

  ```
  Scenario: Verify package.json has correct Next.js version
    Tool: Bash (node -p)
    Preconditions: package.json exists
    Steps:
      1. Run `node -p "require('./package.json').dependencies.next"`
    Expected Result: Output is "16.2.1"
    Failure Indicators: Output is undefined, null, or different version
    Evidence: .sisyphus/evidence/task-1-nextjs-version.txt

  Scenario: Verify npm install succeeds
    Tool: Bash (npm)
    Preconditions: package.json exists
    Steps:
      1. Run `npm install`
      2. Check exit code
    Expected Result: Exit code is 0, no error messages in output
    Failure Indicators: Exit code non-zero, npm ERR! messages
    Evidence: .sisyphus/evidence/task-1-npm-install.txt

  Scenario: Verify all scripts exist
    Tool: Bash (node -p)
    Preconditions: package.json exists
    Steps:
      1. Run `node -p "Object.keys(require('./package.json').scripts)"`
    Expected Result: Output includes: dev, build, start, lint, test, test:e2e
    Failure Indicators: Any script name missing from array
    Evidence: .sisyphus/evidence/task-1-scripts.txt
  ```

  **Commit**: YES
  - Message: `chore: initialize Next.js 16 project with TypeScript and dependencies`
  - Files: package.json, package-lock.json, .gitignore
  - Pre-commit: `npm run lint`

- [x] 2. TypeScript & ESLint config

  **What to do**:
  - Create tsconfig.json with: `"compilerOptions": { "strict": true, "target": "ES2022", "lib": ["ES2022", "DOM", "DOM.Iterable"], "jsx": "preserve", "module": "ESNext", "moduleResolution": "bundler", "resolveJsonModule": true, "allowJs": true, "checkJs": true, "noEmit": true, "esModuleInterop": true, "skipLibCheck": true, "forceConsistentCasingInFileNames": true, "incremental": true, "paths": { "@/*": ["./src/*"] } }`
  - Create .eslintrc.json with: `"extends": "next/core-web-vitals"`
  - Create src/test/setup.ts for Vitest with: `import { expect, afterEach } from 'vitest'; import { cleanup } from '@testing-library/react'; afterEach(() => cleanup());`
  - Create vitest.config.ts with: `import { defineConfig } from 'vitest/config'; import react from '@vitejs/plugin-react'; export default defineConfig({ plugins: [react()], test: { globals: true, environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] } });`

  **Must NOT do**:
  - Loosen TypeScript strict mode
  - Disable any ESLint rules

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config file creation with standard TypeScript/ESLint/Vitest patterns
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed for config creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-7)
  - **Blocks**: Tasks 8-19 (depend on TypeScript config)
  - **Blocked By**: None

  **References**:
  - Reference tsconfig.json: `C:\Users\Tobias\git\next-graphwiz-ai\tsconfig.json:1-30` - Strict mode settings, paths alias
  - Reference vitest.config.ts: `C:\Users\Tobias\git\next-graphwiz-ai\vitest.config.ts:1-15` - Vitest + jsdom setup
  - Reference src/test/setup.ts: `C:\Users\Tobias\git\next-graphwiz-ai\src\test\setup.ts:1-5` - Testing library cleanup

  **Acceptance Criteria**:
  - [ ] tsconfig.json exists with strict: true
  - [ ] @/* path alias points to ./src/*
  - [ ] .eslintrc.json extends next/core-web-vitals
  - [ ] vitest.config.ts uses jsdom environment
  - [ ] src/test/setup.ts has cleanup hook
  - [ ] `npm run lint` passes
  - [ ] `npm run test` passes with empty test

  **QA Scenarios**:

  ```
  Scenario: Verify TypeScript strict mode
    Tool: Bash (node -p)
    Preconditions: tsconfig.json exists
    Steps:
      1. Run `node -p "require('./tsconfig.json').compilerOptions.strict"`
    Expected Result: Output is true
    Failure Indicators: Output is false or undefined
    Evidence: .sisyphus/evidence/task-2-strict-mode.txt

  Scenario: Verify path alias @/*
    Tool: Bash (node -p)
    Preconditions: tsconfig.json exists
    Steps:
      1. Run `node -p "require('./tsconfig.json').compilerOptions.paths['@/*']"`
    Expected Result: Output is ["./src/*"]
    Failure Indicators: Output is undefined or different path
    Evidence: .sisyphus/evidence/task-2-path-alias.txt

  Scenario: Verify ESLint config
    Tool: Bash (node -p)
    Preconditions: .eslintrc.json exists
    Steps:
      1. Run `node -p "require('./.eslintrc.json').extends"`
    Expected Result: Output is "next/core-web-vitals"
    Failure Indicators: Output is undefined or different value
    Evidence: .sisyphus/evidence/task-2-eslint-extends.txt
  ```

  **Commit**: YES
  - Message: `chore: configure TypeScript strict mode, ESLint, and Vitest`
  - Files: tsconfig.json, .eslintrc.json, vitest.config.ts, src/test/setup.ts
  - Pre-commit: `npm run lint && npm run test`

- [x] 3. Next.js 16 config (next.config.ts)

  **What to do**:
  - Create next.config.ts with: `import type { NextConfig } from 'next'; const config: NextConfig = { output: 'standalone', poweredByHeader: false, images: { unoptimized: true }, experimental: { typedPages: true } }; export default config;`
  - Add @next/mdx plugin: Create next.config.mjs (or integrate into next.config.ts) with MDX processing using `createMDX()` from `@next/mdx`
  - Configure pageExtensions: `[".js", ".jsx", ".ts", ".tsx", ".md", ".mdx"]` to support markdown content

  **Must NOT do**:
  - Use `output: "export"` (static export) — must use standalone for Docker
  - Optimize images (unoptimized: true required for standalone)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Next.js config with specific output mode
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - `librarian`: Not needed, config patterns documented in reference

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-2, 4-7)
  - **Blocks**: Tasks 20-27 (depend on Next.js config)
  - **Blocked By**: None

  **References**:
  - Reference next.config.ts: `C:\Users\Tobias\git\next-graphwiz-ai\next.config.ts:1-20` - Standalone output, MDX plugin setup
  - Next.js docs: `https://nextjs.org/docs/app/api-reference/next-config-js` - output: 'standalone' documentation
  - @next/mdx docs: `https://nextjs.org/docs/app/building-your-application/configuring/mdx` - MDX plugin configuration

  **Acceptance Criteria**:
  - [ ] next.config.ts exists with output: 'standalone'
  - [ ] poweredByHeader: false
  - [ ] images: { unoptimized: true }
  - [ ] @next/mdx plugin configured
  - [ ] pageExtensions includes .md and .mdx
  - [ ] `npm run build` succeeds with standalone output

  **QA Scenarios**:

  ```
  Scenario: Verify standalone output mode
    Tool: Bash (node -p)
    Preconditions: next.config.ts exists
    Steps:
      1. Run `node -p "require('./next.config.ts').output"`
    Expected Result: Output is "standalone"
    Failure Indicators: Output is undefined or not "standalone"
    Evidence: .sisyphus/evidence/task-3-standalone.txt

  Scenario: Verify build succeeds
    Tool: Bash (npm)
    Preconditions: next.config.ts exists, src/app/page.tsx exists (minimal)
    Steps:
      1. Run `npm run build`
      2. Check exit code and output
    Expected Result: Exit code is 0, output contains "Creating an optimized production build" and "Route (app)"
    Failure Indicators: Exit code non-zero, error messages
    Evidence: .sisyphus/evidence/task-3-build.txt

  Scenario: Verify .next/standalone directory created
    Tool: Bash (ls)
    Preconditions: npm run build succeeded
    Steps:
      1. Run `ls -la .next/standalone`
    Expected Result: Directory exists and contains package.json and node_modules
    Failure Indicators: Directory does not exist or is empty
    Evidence: .sisyphus/evidence/task-3-standalone-dir.txt
  ```

  **Commit**: YES
  - Message: `chore: configure Next.js 16 with standalone output and MDX support`
  - Files: next.config.ts
  - Pre-commit: `npm run build`

- [x] 4. Tailwind v4 setup (globals.css)

  **What to do**:
  - Create src/app/globals.css with: `@import "tailwindcss"; @theme inline { --color-primary: #341291; --color-secondary: #571EFA; --color-text: #6B7280; --color-background: #ffffff; --color-background-alt: #f3f4f6; }`
  - Add dark theme variables: `@media (prefers-color-scheme: dark) { @theme inline { --color-background: #111827; --color-background-alt: #1f2937; --color-text: #e5e7eb; } }`
  - Create .postcssrc.mjs with: `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`
  - Add prose styles for markdown rendering (copy ~280 lines from reference)

  **Must NOT do**:
  - Use reference's blue accent color (#0288d1) — use purple palette
  - Use Tailwind v3 (use v4 via @import "tailwindcss")

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Tailwind v4 setup with custom theme colors
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - `visual-engineering`: Not needed, just CSS variables

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-7)
  - **Blocks**: Tasks 14-19 (depend on globals.css)
  - **Blocked By**: None

  **References**:
  - Reference globals.css: `C:\Users\Tobias\git\next-graphwiz-ai\src\app\globals.css:1-280` - Tailwind v4 import, CSS custom properties, prose styles
  - Tailwind v4 docs: `https://tailwindcss.com/docs/installation/using-postcss` - @import "tailwindcss" syntax
  - OpenDesk Edu palette: Draft file — #341291 (primary), #571EFA (secondary)

  **Acceptance Criteria**:
  - [ ] src/app/globals.css imports "tailwindcss"
  - [ ] CSS variables define --color-primary: #341291, --color-secondary: #571EFA
  - [ ] Dark theme overrides exist in media query
  - [ ] .postcssrc.mjs configures tailwindcss and autoprefixer
  - [ ] Prose styles for markdown present (~280 lines)

  **QA Scenarios**:

  ```
  Scenario: Verify purple primary color
    Tool: Bash (grep)
    Preconditions: src/app/globals.css exists
    Steps:
      1. Run `grep -n "color-primary" src/app/globals.css | head -1`
    Expected Result: Line contains "#341291"
    Failure Indicators: Different color or not found
    Evidence: .sisyphus/evidence/task-4-primary-color.txt

  Scenario: Verify Tailwind v4 import
    Tool: Bash (grep)
    Preconditions: src/app/globals.css exists
    Steps:
      1. Run `grep -n '@import "tailwindcss"' src/app/globals.css`
    Expected Result: Line exists with exact import
    Failure Indicators: Import not found or different syntax
    Evidence: .sisyphus/evidence/task-4-tailwind-import.txt

  Scenario: Verify prose styles length
    Tool: Bash (wc)
    Preconditions: src/app/globals.css exists
    Steps:
      1. Run `wc -l src/app/globals.css`
    Expected Result: Line count is >= 280 (prose styles included)
    Failure Indicators: Line count < 200 (prose styles missing)
    Evidence: .sisyphus/evidence/task-4-prose-length.txt
  ```

  **Commit**: YES
  - Message: `style: configure Tailwind v4 with purple palette and dark theme`
  - Files: src/app/globals.css, .postcssrc.mjs
  - Pre-commit: `npm run lint`

- [x] 5. Vitest + Playwright config

  **What to do**:
  - Create playwright.config.ts with: `import { defineConfig, devices } from '@playwright/test'; export default defineConfig({ testDir: './e2e', fullyParallel: true, forbidOnly: !!process.env.CI, retries: process.env.CI ? 2 : 0, workers: process.env.CI ? 1 : undefined, reporter: 'html', use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' }, projects: [ { name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'firefox', use: { ...devices['Desktop Firefox'] } }, { name: 'webkit', use: { ...devices['Desktop Safari'] } } ] });`
  - Create e2e/.gitkeep (placeholder for e2e tests)
  - Add test script to package.json: `"test:e2e": "playwright test"`
  - Create src/lib/__tests__/ (placeholder for unit tests)

  **Must NOT do**:
  - Create any actual tests yet (tests created in TDD workflow with each component)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Playwright config for e2e testing
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for config, only for test execution

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4, 6-7)
  - **Blocks**: All QA scenarios in subsequent tasks
  - **Blocked By**: None

  **References**:
  - Reference playwright.config.ts: `C:\Users\Tobias\git\next-graphwiz-ai\playwright.config.ts:1-25` - Browser configs, retries, reporters
  - Playwright docs: `https://playwright.dev/docs/test-configuration` - Configuration options

  **Acceptance Criteria**:
  - [ ] playwright.config.ts exists with Chromium, Firefox, WebKit projects
  - [ ] baseURL is 'http://localhost:3000'
  - [ ] reporter is 'html'
  - [ ] e2e/.gitkeep exists
  - [ ] package.json has "test:e2e": "playwright test"

  **QA Scenarios**:

  ```
  Scenario: Verify Playwright config exists
    Tool: Bash (ls)
    Preconditions: playwright.config.ts should exist
    Steps:
      1. Run `ls -la playwright.config.ts`
    Expected Result: File exists
    Failure Indicators: File does not exist
    Evidence: .sisyphus/evidence/task-5-playwright-config.txt

  Scenario: Verify test:e2e script
    Tool: Bash (node -p)
    Preconditions: package.json exists
    Steps:
      1. Run `node -p "require('./package.json').scripts['test:e2e']"`
    Expected Result: Output is "playwright test"
    Failure Indicators: Output is undefined or different command
    Evidence: .sisyphus/evidence/task-5-test-e2e-script.txt
  ```

  **Commit**: YES
  - Message: `chore: configure Playwright for e2e testing`
  - Files: playwright.config.ts, e2e/.gitkeep
  - Pre-commit: `npm run lint`

- [x] 6. Path alias (@/* → ./src/*)

  **What to do**:
  - Already configured in Task 2 (tsconfig.json), verify paths alias is correct
  - Create src/index.ts as barrel export: `export * from './app'; export * from './components'; export * from './lib';`
  - Create src/lib/index.ts as barrel export: `export * from './config'; export * from './content';`
  - Create src/components/index.ts as barrel export: `export * from './Header'; export * from './Footer'; export * from './ArticlePage';` (add other components as created)

  **Must NOT do**:
  - Use path alias without creating barrel exports (for cleaner imports)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple barrel export creation
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-5, 7)
  - **Blocks**: All import usage in subsequent tasks
  - **Blocked By**: None

  **References**:
  - Reference tsconfig.json: Already checked in Task 2
  - Reference barrel exports: `C:\Users\Tobias\git\next-graphwiz-ai\src\lib\index.ts` - Pattern for barrel exports

  **Acceptance Criteria**:
  - [ ] src/index.ts exists with lib and components exports
  - [ ] src/lib/index.ts exists with config and content exports
  - [ ] src/components/index.ts exists with component exports

  **QA Scenarios**:

  ```
  Scenario: Verify barrel exports exist
    Tool: Bash (ls)
    Preconditions: All barrel files should exist
    Steps:
      1. Run `ls -la src/index.ts src/lib/index.ts src/components/index.ts`
    Expected Result: All three files exist
    Failure Indicators: Any file missing
    Evidence: .sisyphus/evidence/task-6-barrel-exports.txt
  ```

  **Commit**: YES
  - Message: `chore: add barrel exports for clean imports`
  - Files: src/index.ts, src/lib/index.ts, src/components/index.ts
  - Pre-commit: `npm run lint`

- [x] 7. Docker + docker-compose setup

  **What to do**:
  - Create Dockerfile with multi-stage build: `FROM node:20-alpine AS deps → RUN npm ci → FROM node:20-alpine AS builder → COPY --from=deps /app/node_modules ./node_modules → COPY . . → RUN npm run build → FROM node:20-alpine AS runner → WORKDIR /app → ENV NODE_ENV production → COPY --from=builder /app/public ./public → COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./ → COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static → USER nextjs → EXPOSE 3000 → ENV PORT 3000 → CMD ["node", "server.js"]`
  - Create docker-compose.yml with: `services: { web: { build: ., ports: ["3000:3000"], labels: ["traefik.enable=true", "traefik.http.routers.opendesk-edu.rule=Host(`opendesk-edu.org`)", "traefik.http.routers.opendesk-edu.tls=true", "traefik.http.routers.opendesk-edu.tls.certresolver=letsencrypt"], networks: ["traefik-web"] }, networks: { traefik-web: { external: true } } }`
  - Create .dockerignore with: `node_modules, .next, .git, .env.local, vitest.config.ts.snap, playwright-report, test-results, .sisyphus`

  **Must NOT do**:
  - Use different Node version (must be node:20-alpine)
  - Expose ports other than 3000
  - Run as root user (use non-root nextjs user)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Docker multi-stage build for Next.js standalone
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-6)
  - **Blocks**: Tasks 31-32 (depend on Docker setup)
  - **Blocked By**: None

  **References**:
  - Reference Dockerfile: `C:\Users\Tobias\git\next-graphwiz-ai\Dockerfile:1-30` - Multi-stage build pattern, non-root user
  - Reference docker-compose.yml: `C:\Users\Tobias\git\next-graphwiz-ai\docker-compose.yml:1-20` - Traefik labels format
  - Next.js docs: `https://nextjs.org/docs/app/building-your-application/deploying#using-docker` - Standalone mode Docker setup

  **Acceptance Criteria**:
  - [ ] Dockerfile uses node:20-alpine
  - [ ] Dockerfile has 3 stages: deps, builder, runner
  - [ ] Dockerfile runs as non-root user (nextjs)
  - [ ] docker-compose.yml has Traefik labels for opendesk-edu.org
  - [ ] docker-compose.yml uses traefik-web external network
  - [ ] .dockerignore excludes node_modules and .next

  **QA Scenarios**:

  ```
  Scenario: Verify Dockerfile uses node:20-alpine
    Tool: Bash (grep)
    Preconditions: Dockerfile exists
    Steps:
      1. Run `grep "FROM node" Dockerfile | head -1`
    Expected Result: Output contains "node:20-alpine"
    Failure Indicators: Different Node version
    Evidence: .sisyphus/evidence/task-7-node-version.txt

  Scenario: Verify non-root user
    Tool: Bash (grep)
    Preconditions: Dockerfile exists
    Steps:
      1. Run `grep "USER nextjs" Dockerfile`
    Expected Result: Line exists with USER nextjs
    Failure Indicators: USER command missing or different user
    Evidence: .sisyphus/evidence/task-7-nonroot-user.txt

  Scenario: Verify docker-compose Traefik labels
    Tool: Bash (grep)
    Preconditions: docker-compose.yml exists
    Steps:
      1. Run `grep "traefik.enable=true" docker-compose.yml`
    Expected Result: Label exists
    Failure Indicators: Label not found
    Evidence: .sisyphus/evidence/task-7-traefik-labels.txt
  ```

  **Commit**: YES
  - Message: `chore: add Docker multi-stage build and docker-compose configuration`
  - Files: Dockerfile, docker-compose.yml, .dockerignore
  - Pre-commit: `npm run lint`

- [x] 8. Site config (config.ts) - site URL, name, description

  **What to do**:
  - Create src/lib/config.ts with: `export const SITE_URL = 'https://opendesk-edu.org'; export const SITE_NAME = 'openDesk Edu'; export const SITE_DESCRIPTION = 'Educational digital infrastructure for universities - openDesk CE with 15 integrated services for seamless digital transformation.'; export const CONTACT_EMAIL = 'info@opendesk-edu.org'; export const PLAUSIBLE_DOMAIN = 'opendesk-edu.org'; export const CLARITY_ID = '';` (to be filled later)
  - Define sections array: `export const SECTIONS = ['components', 'architecture', 'get-started', 'blog'] as const;`
  - Define section labels: `export const SECTION_LABELS = { components: 'Components', architecture: 'Architecture', 'get-started': 'Get Started', blog: 'Blog' };`

  **Must NOT do**:
  - Use graphwiz branding, colors, or copy
  - Hardcode production secrets or API keys

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple config file with site-specific constants
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 9-13)
  - **Blocks**: Tasks 14-19 (depend on config)
  - **Blocked By**: Task 1 (package.json)

  **References**:
  - Reference config.ts: `C:\Users\Tobias\git\next-graphwiz-ai\src\lib\config.ts:1-20` - Site constants pattern
  - Draft: Interview decisions — domain, email, sections confirmed

  **Acceptance Criteria**:
  - [ ] src/lib/config.ts exists with SITE_URL, SITE_NAME, SITE_DESCRIPTION
  - [ ] SECTIONS array contains all 4 sections
  - [ ] SECTION_LABELS maps sections to display names
  - [ ] `npm run lint` passes

  **QA Scenarios**:

  ```
  Scenario: Verify SITE_URL
    Tool: Bash (node -p)
    Preconditions: src/lib/config.ts exists
    Steps:
      1. Run `node -p "require('./src/lib/config.ts').SITE_URL"`
    Expected Result: Output is "https://opendesk-edu.org"
    Failure Indicators: Different URL or undefined
    Evidence: .sisyphus/evidence/task-8-site-url.txt

  Scenario: Verify SECTIONS array
    Tool: Bash (node -p)
    Preconditions: src/lib/config.ts exists
    Steps:
      1. Run `node -p "require('./src/lib/config.ts').SECTIONS"`
    Expected Result: Array contains: components, architecture, get-started, blog
    Failure Indicators: Missing section or different order
    Evidence: .sisyphus/evidence/task-8-sections.txt
  ```

  **Commit**: YES
  - Message: `chore: add site configuration constants`
  - Files: src/lib/config.ts
  - Pre-commit: `npm run lint`

- [x] 9. Content system (content.ts) - markdown loading, parsing

  **What to do**:
  - Create src/lib/content.ts with markdown processing using gray-matter + remark/rehype
  - Define frontmatter schema: `export interface Frontmatter { title: string; date: string; description?: string; categories?: string[]; tags?: string[]; slug?: string; draft?: boolean; }`
  - Implement `getAllPosts(section: string)` function to load all markdown files from `content/${section}/` directory
  - Implement `getPost(slug: string, section: string)` function to load single markdown file by slug
  - Implement `getSections()` function to return available sections with metadata
  - Use remark plugins: remarkGfm, remarkRehype, rehypeSlug, rehypeStringify
  - Add Vitest unit tests in src/lib/__tests__/content.test.ts

  **Must NOT do**:
  - Use different frontmatter schema than reference
  - Skip validation of required fields (title, date)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core markdown processing logic with multiple functions and error handling
  - **Skills**: []
    - No special skills needed - standard file reading and parsing
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8, 10-13)
  - **Blocks**: Tasks 20-24 (depend on content system)
  - **Blocked By**: Task 1 (dependencies installed)

  **References**:
  - Reference content.ts: `C:\Users\Tobias\git\next-graphwiz-ai\src\lib\content.ts:1-150` - Markdown loading, parsing, caching
  - Reference content.test.ts: `C:\Users\Tobias\git\next-graphwiz-ai\src\lib\__tests__\content.test.ts:1-80` - Test patterns
  - gray-matter docs: `https://github.com/jonschlinkert/gray-matter` - Frontmatter parsing
  - remark/rehype docs: `https://github.com/remarkjs/remark` - Unified plugin ecosystem

  **Acceptance Criteria**:
  - [ ] Frontmatter interface matches schema (title, date required)
  - [ ] getAllPosts returns array of { slug, frontmatter, content }
  - [ ] getPost returns single post by slug and section
  - [ ] Unit tests cover loading, parsing, error cases
  - [ ] `npm run test` passes (all content tests)
  - [ ] `npm run lint` passes

  **QA Scenarios**:

  ```
  Scenario: Verify getAllPosts function exists
    Tool: Bash (node -p)
    Preconditions: src/lib/content.ts exists
    Steps:
      1. Run `node -p "typeof require('./src/lib/content.ts').getAllPosts"`
    Expected Result: Output is "function"
    Failure Indicators: Output is undefined or not a function
    Evidence: .sisyphus/evidence/task-9-getallposts.txt

  Scenario: Verify unit tests pass
    Tool: Bash (npm)
    Preconditions: src/lib/__tests__/content.test.ts exists
    Steps:
      1. Run `npm run test`
      2. Check exit code
    Expected Result: Exit code is 0, tests pass
    Failure Indicators: Exit code non-zero, test failures
    Evidence: .sisyphus/evidence/task-9-unit-tests.txt

  Scenario: Test markdown parsing with sample file
    Tool: Bash (node)
    Preconditions: content/components/test.md exists with frontmatter
    Steps:
      1. Create test.md with "+++\ntitle = \"Test\"\ndate = \"2026-01-01\"\n+++\nContent here"
      2. Run `node -e "const { getPost } = require('./src/lib/content.ts'); console.log(getPost('test', 'components').frontmatter.title)"`
    Expected Result: Output is "Test"
    Failure Indicators: Error or undefined output
    Evidence: .sisyphus/evidence/task-9-markdown-parsing.txt
  ```

  **Commit**: YES
  - Message: `feat: implement markdown content system with frontmatter parsing`
  - Files: src/lib/content.ts, src/lib/__tests__/content.test.ts
  - Pre-commit: `npm run lint && npm run test`

- [x] 10. ThemeProvider (context, localStorage, data-theme)

  **What to do**:
  - Create src/components/ThemeProvider.tsx with React context for dark/light theme
  - Implement theme state with default 'system' (prefers-color-scheme) fallback to 'light'
  - Use localStorage to persist theme preference: `localStorage.getItem('theme') || 'system'`
  - Update document.documentElement.setAttribute('data-theme', theme) on mount and theme change
  - Export useTheme hook: `const useTheme = () => useContext(ThemeContext)`
  - Write Vitest unit tests for localStorage logic and theme switching

  **Must NOT do**:
  - Use reference's blue color scheme — use purple palette from globals.css
  - Use any external theming library (plain React context)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard React context pattern with localStorage persistence
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-9, 11-13)
  - **Blocks**: Tasks 14-16 (depend on ThemeProvider)
  - **Blocked By**: Task 2 (TypeScript config)

  **References**:
  - Reference ThemeProvider.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\ThemeProvider.tsx:1-50` - Context + localStorage pattern
  - React Context docs: `https://react.dev/learn/scaling-up-with-reducer-and-context` - Context API usage

  **Acceptance Criteria**:
  - [ ] ThemeProvider component exists with React context
  - [ ] useTheme hook exported
  - [ ] localStorage persists theme preference
  - [ ] data-theme attribute updated on document element
  - [ ] Unit tests cover theme switching logic
  - [ ] `npm run test` passes

  **QA Scenarios**:

  ```
  Scenario: Verify ThemeProvider component
    Tool: Bash (ls)
    Preconditions: src/components/ThemeProvider.tsx should exist
    Steps:
      1. Run `ls -la src/components/ThemeProvider.tsx`
    Expected Result: File exists
    Failure Indicators: File does not exist
    Evidence: .sisyphus/evidence/task-10-provider.txt

  Scenario: Verify useTheme hook exports
    Tool: Bash (grep)
    Preconditions: src/components/ThemeProvider.tsx exists
    Steps:
      1. Run `grep "export const useTheme" src/components/ThemeProvider.tsx`
    Expected Result: Line exists
    Failure Indicators: Export not found
    Evidence: .sisyphus/evidence/task-10-hook.txt

  Scenario: Verify unit tests
    Tool: Bash (npm)
    Preconditions: src/components/__tests__/ThemeProvider.test.ts exists
    Steps:
      1. Run `npm run test`
      2. Check exit code
    Expected Result: Exit code is 0, tests pass
    Failure Indicators: Exit code non-zero
    Evidence: .sisyphus/evidence/task-10-tests.txt
  ```

  **Commit**: YES
  - Message: `feat: add ThemeProvider context with localStorage persistence`
  - Files: src/components/ThemeProvider.tsx, src/components/__tests__/ThemeProvider.test.ts
  - Pre-commit: `npm run lint && npm run test`

- [x] 11. ErrorBoundary (class component, fallback UI)

  **What to do**:
  - Create src/components/ErrorBoundary.tsx as class component (React class component required for error boundaries)
  - Implement componentDidCatch to log errors: `componentDidCatch(error: Error, errorInfo: ErrorInfo)`
  - Render fallback UI with: "Something went wrong", "Please refresh the page", friendly error message
  - Use ErrorBoundary in root layout to catch all component errors
  - Write Vitest unit test for error catching logic

  **Must NOT do**:
  - Use functional component (error boundaries require class component)
  - Show raw error stack trace to users (use friendly UI)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard React error boundary class component
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-10, 12-13)
  - **Blocks**: Task 14 (used in root layout)
  - **Blocked By**: Task 2 (TypeScript config)

  **References**:
  - Reference ErrorBoundary.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\ErrorBoundary.tsx:1-30` - Class component pattern
  - React docs: `https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary` - Error boundary usage

  **Acceptance Criteria**:
  - [ ] ErrorBoundary is a class component with componentDidCatch
  - [ ] Fallback UI renders friendly error message
  - [ ] ErrorBoundary wraps app in root layout
  - [ ] Unit test verifies error catching

  **QA Scenarios**:

  ```
  Scenario: Verify ErrorBoundary is class component
    Tool: Bash (grep)
    Preconditions: src/components/ErrorBoundary.tsx exists
    Steps:
      1. Run `grep "class ErrorBoundary extends React.Component" src/components/ErrorBoundary.tsx`
    Expected Result: Line exists
    Failure Indicators: Class component not found
    Evidence: .sisyphus/evidence/task-11-class-component.txt

  Scenario: Verify componentDidCatch exists
    Tool: Bash (grep)
    Preconditions: src/components/ErrorBoundary.tsx exists
    Steps:
      1. Run `grep "componentDidCatch" src/components/ErrorBoundary.tsx`
    Expected Result: Line exists
    Failure Indicators: Method not found
    Evidence: .sisyphus/evidence/task-11-catch-method.txt
  ```

  **Commit**: YES
  - Message: `feat: add ErrorBoundary class component with fallback UI`
  - Files: src/components/ErrorBoundary.tsx, src/components/__tests__/ErrorBoundary.test.ts
  - Pre-commit: `npm run lint && npm run test`

- [x] 12. Icon components (service icons from artwork)

  **What to do**:
  - Create src/components/Icons.tsx with icon components for all 17 services: BigBlueButton, BookStack, Drawio, Etherpad, Excalidraw, F13, Grommunio, ILIAS, LimeSurvey, Moodle, OpenCloud, Planka, SOGo, SSP, TYPO3, Zammad
  - Import SVG content from artwork repo or create inline SVG components
  - Export each icon as React component with props: `className?: string; size?: number;`
  - Create combined EduServicesIconSet component for displaying all icons on Components page
  - Write Vitest unit tests for icon rendering

  **Must NOT do**:
  - Copy icons from reference project (use openDesk Edu artwork)
  - Use different icons than specified in artwork repo

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Create React components from SVGs (mechanical task)
  - **Skills**: []
    - No special skills needed - SVG to React component conversion
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-11, 13)
  - **Blocks**: Task 17, 18 (used in PostCard, SectionPage)
  - **Blocked By**: Task 13 (artwork assets copied)

  **References**:
  - Artwork repo: `C:\Users\Tobias\git\opendesk-edu-artwork\` - 17 service icons SVGs
  - Reference Icons.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\Icons.tsx:1-200` - SVG component pattern

  **Acceptance Criteria**:
  - [ ] All 17 service icon components exist
  - [ ] Icons exported from Icons.tsx
  - [ ] EduServicesIconSet component displays all icons
  - [ ] Icons support className and size props
  - [ ] Unit tests verify icon rendering

  **QA Scenarios**:

  ```
  Scenario: Verify all icon components export
    Tool: Bash (node -p)
    Preconditions: src/components/Icons.tsx exists
    Steps:
      1. Run `node -p "Object.keys(require('./src/components/Icons.tsx')).filter(k => ['BigBlueButton', 'BookStack', 'Drawio', 'Etherpad', 'Excalidraw', 'F13', 'Grommunio', 'ILIAS', 'LimeSurvey', 'Moodle', 'OpenCloud', 'Planka', 'SOGo', 'SSP', 'TYPO3', 'Zammad'].includes(k))"`
    Expected Result: All 17 icons in output
    Failure Indicators: Missing icons
    Evidence: .sisyphus/evidence/task-12-icons-export.txt

  Scenario: Verify icon renders with className
    Tool: Bash (node)
    Preconditions: src/components/Icons.tsx exists
    Steps:
      1. Run `node -e "console.log(require('./src/components/Icons.tsx').BigBlueButton.toString().includes('className'))"`
    Expected Result: Output is true
    Failure Indicators: className prop not supported
    Evidence: .sisyphus/evidence/task-12-classname-prop.txt
  ```

  **Commit**: YES
  - Message: `feat: add service icon components from openDesk Edu artwork`
  - Files: src/components/Icons.tsx, src/components/__tests__/Icons.test.ts
  - Pre-commit: `npm run lint && npm run test`

- [x] 13. Artwork assets copy to public/static/

  **What to do**:
  - Create public/static/ directory structure: icons/, diagrams/, brand/
  - Copy brand assets from artwork repo: icon, favicon, banner, sticker, merch-tshirt, profile.gif
  - Copy service icons (17 SVGs) to public/static/icons/
  - Copy diagrams (architecture, component-alternatives, saml-federation-flow) to public/static/diagrams/
  - Copy edu-services-icon-set.svg to public/static/ (combined icon set)
  - Create public/manifest.json with: `name: "openDesk Edu", short_name: "openDesk Edu", start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#341291", icons: [{ src: "/static/brand/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/static/brand/icon-512.png", sizes: "512x512", type: "image/png" }]`

  **Must NOT do**:
  - Modify any files in artwork repo
  - Use non-purple colors in manifest (use #341291)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Copy assets from artwork repo, mechanical task
  - **Skills**: []
    - No special skills needed - file copy operations
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-12)
  - **Blocks**: Task 12 (icon components depend on assets)
  - **Blocked By**: Task 1 (project init)

  **References**:
  - Artwork repo: `C:\Users\Tobias\git\opendesk-edu-artwork\` - All assets location
  - Reference manifest.json: `C:\Users\Tobias\git\next-graphwiz-ai\public\manifest.json:1-20` - PWA manifest pattern

  **Acceptance Criteria**:
  - [ ] public/static/brand/ has 5 brand assets (icon, favicon, banner, sticker, merch-tshirt, profile.gif)
  - [ ] public/static/icons/ has 17 service icons
  - [ ] public/static/diagrams/ has 3 diagrams
  - [ ] public/manifest.json exists with correct colors (#341291)
  - [ ] `npm run build` succeeds (assets included)

  **QA Scenarios**:

  ```
  Scenario: Verify brand assets copied
    Tool: Bash (ls)
    Preconditions: public/static/brand/ should exist
    Steps:
      1. Run `ls -la public/static/brand/`
    Expected Result: Directory contains: icon.svg, favicon.svg, banner.svg, sticker.svg, merch-tshirt.svg, profile.gif
    Failure Indicators: Missing assets
    Evidence: .sisyphus/evidence/task-13-brand-assets.txt

  Scenario: Verify service icons copied
    Tool: Bash (ls)
    Preconditions: public/static/icons/ should exist
    Steps:
      1. Run `ls -1 public/static/icons/ | wc -l`
    Expected Result: Output is 17 (17 service icons)
    Failure Indicators: Different count
    Evidence: .sisyphus/evidence/task-13-service-icons.txt

  Scenario: Verify manifest.json theme color
    Tool: Bash (grep)
    Preconditions: public/manifest.json exists
    Steps:
      1. Run `grep -n "theme_color" public/manifest.json`
    Expected Result: Line contains "#341291"
    Failure Indicators: Different color
    Evidence: .sisyphus/evidence/task-13-theme-color.txt
  ```

  **Commit**: YES
  - Message: `chore: copy artwork assets to public/static/ and create manifest`
  - Files: public/static/**/*, public/manifest.json
  - Pre-commit: `npm run lint`

- [x] 14. Root layout (SEO, theme, structured data)

  **What to do**:
  - Create src/app/layout.tsx as root layout for App Router
  - Add metadata: `export const metadata = { title: 'openDesk Edu', description: 'Educational digital infrastructure for universities', metadataBase: new URL(SITE_URL), alternates: { canonical: '/' }, openGraph: { type: 'website', siteName: 'openDesk Edu', title: 'openDesk Edu', description: '...', images: [{ url: '/static/brand/banner.svg', width: 1200, height: 630 }] }, twitter: { card: 'summary_large_image', title: '...', description: '...', images: ['/static/brand/banner.svg'] } }`
  - Wrap app with ErrorBoundary and ThemeProvider
  - Add JSON-LD structured data for Organization: `@type: "Organization", name: "openDesk Edu", url: SITE_URL, logo: "/static/brand/icon.svg", sameAs: ["https://codeberg.org/opendesk-edu", "https://github.com/opendesk-edu"]`
  - Link globals.css: `import './globals.css'`
  - Add security headers (via next.config.ts middleware or headers config): X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy, strict-transport-security

  **Must NOT do**:
  - Use graphwiz branding or copy metadata
  - Skip security headers (required for production)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Root layout with SEO metadata, standard Next.js pattern
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 15-19)
  - **Blocks**: Tasks 20-27 (all pages depend on layout)
  - **Blocked By**: Tasks 8, 10, 11 (config, ThemeProvider, ErrorBoundary)

  **References**:
  - Reference layout.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\app\layout.tsx:1-80` - Metadata, JSON-LD, providers
  - Next.js metadata docs: `https://nextjs.org/docs/app/building-your-application/optimizing/metadata` - Metadata API
  - JSON-LD docs: `https://developers.google.com/search/docs/appearance/structured-data` - Structured data

  **Acceptance Criteria**:
  - [ ] Root layout exports metadata object
  - [ ] ThemeProvider and ErrorBoundary wrap app
  - [ ] JSON-LD Organization structured data included
  - [ ] Security headers configured
  - [ ] `npm run build` succeeds
  - [ ] HTML output contains metadata and JSON-LD

  **QA Scenarios**:

  ```
  Scenario: Verify root layout exists
    Tool: Bash (ls)
    Preconditions: src/app/layout.tsx should exist
    Steps:
      1. Run `ls -la src/app/layout.tsx`
    Expected Result: File exists
    Failure Indicators: File does not exist
    Evidence: .sisyphus/evidence/task-14-layout.txt

  Scenario: Verify metadata exports
    Tool: Bash (grep)
    Preconditions: src/app/layout.tsx exists
    Steps:
      1. Run `grep "export const metadata" src/app/layout.tsx`
    Expected Result: Line exists
    Failure Indicators: Metadata export not found
    Evidence: .sisyphus/evidence/task-14-metadata.txt

  Scenario: Verify JSON-LD in build output
    Tool: Bash (npm + grep)
    Preconditions: npm run build succeeded
    Steps:
      1. Run `npm run build > /dev/null 2>&1`
      2. Run `grep -l "Organization" .next/server/app/*.html | head -1`
    Expected Result: HTML file contains Organization JSON-LD
    Failure Indicators: JSON-LD not found
    Evidence: .sisyphus/evidence/task-14-jsonld.txt
  ```

  **Commit**: YES
  - Message: `feat: add root layout with SEO, theme provider, and JSON-LD`
  - Files: src/app/layout.tsx
  - Pre-commit: `npm run lint`

- [x] 15. Header (sticky, mobile hamburger, theme toggle)

  **What to do**:
  - Create src/components/Header.tsx with sticky navigation bar
  - Add desktop navigation with links to: Components, Architecture, Get Started, Blog, About
  - Add mobile hamburger menu that toggles on small screens
  - Add theme toggle button that calls `toggleTheme()` from ThemeProvider
  - Use openDesk Edu logo (opendesk-edu-icon.svg) as brand icon
  - Style with Tailwind: sticky top, z-index, transition effects, dark mode support
  - Write Playwright e2e tests in e2e/header.spec.ts: navigation links work, mobile menu toggles, theme button switches

  **Must NOT do**:
  - Use reference's blue color — use purple palette
  - Hardcode links without using config.ts

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with responsive design, interactions, styling
  - **Skills**: []
    - No special skills needed - standard React component
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 16-19)
  - **Blocks**: Task 24 (homepage uses Header)
  - **Blocked By**: Tasks 8, 10 (config, ThemeProvider)

  **References**:
  - Reference Header.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\Header.tsx:1-150` - Sticky nav, hamburger, theme toggle
  - Tailwind docs: `https://tailwindcss.com/docs/hover-focus-and-other-states` - Interactive states

  **Acceptance Criteria**:
  - [ ] Header is sticky (top-0, fixed)
  - [ ] Navigation links point to correct sections
  - [ ] Mobile menu toggles on small screens (hidden on desktop)
  - [ ] Theme toggle button calls toggleTheme()
  - [ ] Brand icon (openDesk-edu-icon.svg) displayed
  - [ ] E2e tests pass: navigation, mobile menu, theme toggle

  **QA Scenarios**:

  ```
  Scenario: Verify Header renders with navigation
    Tool: Playwright (e2e/header.spec.ts)
    Preconditions: App running at localhost:3000
    Steps:
      1. Navigate to http://localhost:3000
      2. Check for header element with role="navigation"
      3. Get all navigation links
      4. Assert links contain: Components, Architecture, Get Started, Blog
    Expected Result: Header exists, all 4 navigation links present
    Failure Indicators: Missing links, header not found
    Evidence: .sisyphus/evidence/task-15-header-nav.png

  Scenario: Verify mobile menu toggles
    Tool: Playwright (e2e/header.spec.ts)
    Preconditions: App running at localhost:3000
    Steps:
      1. Set viewport to mobile (375x667)
      2. Navigate to http://localhost:3000
      3. Click hamburger button (aria-label="Toggle menu")
      4. Check mobile menu visibility
      5. Click hamburger again to close
    Expected Result: Menu toggles open/close on click
    Failure Indicators: Menu does not toggle
    Evidence: .sisyphus/evidence/task-15-mobile-menu.png

  Scenario: Verify theme toggle works
    Tool: Playwright (e2e/header.spec.ts)
    Preconditions: App running at localhost:3000
    Steps:
      1. Navigate to http://localhost:3000
      2. Get data-theme attribute from html element
      3. Click theme toggle button (aria-label="Toggle theme")
      4. Get data-theme attribute again
      5. Assert data-theme changed
    Expected Result: Theme switches on button click
    Failure Indicators: Theme does not change
    Evidence: .sisyphus/evidence/task-15-theme-toggle.png
  ```

  **Commit**: YES
  - Message: `feat: add Header component with sticky nav and theme toggle`
  - Files: src/components/Header.tsx, e2e/header.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 16. Footer (imprint, privacy, email links)

  **What to do**:
  - Create src/components/Footer.tsx with footer links
  - Add links to: Imprint (/imprint), Privacy (/privacy), Email (mailto:info@opendesk-edu.org)
  - Add copyright text with current year
  - Link to Codeberg repository: https://codeberg.org/opendesk-edu/opendesk-edu-website
  - Style with Tailwind: centered, appropriate spacing, dark mode support
  - Write Playwright e2e tests: all links work, correct URLs

  **Must NOT do**:
  - Use reference's social links (use email only for v1)
  - Hardcode copyright year (use dynamic current year)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with styling and navigation
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14-15, 17-19)
  - **Blocks**: Task 24 (homepage uses Footer)
  - **Blocked By**: Tasks 8, 10 (config, ThemeProvider)

  **References**:
  - Reference Footer.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\Footer.tsx:1-80` - Footer links pattern

  **Acceptance Criteria**:
  - [ ] Footer contains imprint, privacy, email links
  - [ ] Email link uses mailto:info@opendesk-edu.org
  - [ ] Copyright year is current (dynamic)
  - [ ] Footer uses purple accent color
  - [ ] E2e tests verify all links

  **QA Scenarios**:

  ```
  Scenario: Verify Footer links work
    Tool: Playwright (e2e/footer.spec.ts)
    Preconditions: App running at localhost:3000
    Steps:
      1. Navigate to http://localhost:3000
      2. Find footer element
      3. Get all links in footer
      4. Click "Imprint" link, check URL is /imprint
      5. Click "Privacy" link, check URL is /privacy
      6. Click email link, check href starts with mailto:
    Expected Result: All links work with correct URLs
    Failure Indicators: Links broken or wrong URLs
    Evidence: .sisyphus/evidence/task-16-footer-links.png

  Scenario: Verify current year in copyright
    Tool: Playwright (e2e/footer.spec.ts)
    Preconditions: App running at localhost:3000
    Steps:
      1. Navigate to http://localhost:3000
      2. Find footer copyright text
      3. Extract year from text
      4. Get current year from Date object
      5. Assert years match
    Expected Result: Copyright year is current year
    Failure Indicators: Year is outdated or wrong
    Evidence: .sisyphus/evidence/task-16-copyright.png
  ```

  **Commit**: YES
  - Message: `feat: add Footer component with imprint, privacy, email links`
  - Files: src/components/Footer.tsx, e2e/footer.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 17. PostCard (article preview card)

  **What to do**:
  - Create src/components/PostCard.tsx for article preview cards
  - Props: title, description, date, tags, slug, section
  - Display article preview with: title (h3), description (truncated), date (formatted), tags (badges), read more link
  - Link to article: `/[section]/[slug]`
  - Use category badge from Badges component
  - Style with Tailwind: card layout, hover effects, dark mode support
  - Write Vitest unit tests + Playwright e2e test

  **Must NOT do**:
  - Show full article content (preview only)
  - Use different date format than reference

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with preview card styling, typography
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14-16, 18-19)
  - **Blocks**: Task 18, 24 (SectionPage, Homepage use PostCard)
  - **Blocked By**: Tasks 9, 19 (content system, Badges)

  **References**:
  - Reference PostCard.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\PostCard.tsx:1-80` - Card layout, preview truncation
  - Tailwind docs: `https://tailwindcss.com/docs/typography` - Text styling

  **Acceptance Criteria**:
  - [ ] PostCard displays title, description, date, tags
  - [ ] Read more link points to /[section]/[slug]
  - [ ] Description truncated (max 150 chars or 2 lines)
  - [ ] Category badge from Badges component used
  - [ ] Unit tests + E2e tests pass

  **QA Scenarios**:

  ```
  Scenario: Verify PostCard renders
    Tool: Playwright (e2e/postcard.spec.ts)
    Preconditions: PostCard component imported in test page
    Steps:
      1. Render PostCard with props: { title: "Test", description: "Test description", date: "2026-01-01", tags: ["test"], slug: "test", section: "components" }
      2. Check for title element with text "Test"
      3. Check for description element with text starting with "Test description"
      4. Check for date element
      5. Check for tag badge with text "test"
    Expected Result: All elements render correctly
    Failure Indicators: Missing elements
    Evidence: .sisyphus/evidence/task-17-postcard-render.png

  Scenario: Verify PostCard link works
    Tool: Playwright (e2e/postcard.spec.ts)
    Preconditions: PostCard rendered
    Steps:
      1. Click "Read more" link
      2. Check current URL
    Expected Result: URL is /components/test
    Failure Indicators: Wrong URL or navigation fails
    Evidence: .sisyphus/evidence/task-17-postcard-link.png
  ```

  **Commit**: YES
  - Message: `feat: add PostCard component for article previews`
  - Files: src/components/PostCard.tsx, src/components/__tests__/PostCard.test.ts, e2e/postcard.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 18. SectionPage (reusable section listing)

  **What to do**:
  - Create src/components/SectionPage.tsx for section listing pages
  - Props: section (string), posts (array of { slug, frontmatter, content })
  - Display section heading using SECTION_LABELS from config.ts
  - Display all posts in grid layout using PostCard components
  - Show "No posts yet" message if posts array is empty
  - Style with Tailwind: responsive grid (1 col mobile, 2 col tablet, 3 col desktop), gap between cards
  - Write Vitest unit tests + Playwright e2e test

  **Must NOT do**:
  - Hardcode section name (use config.SECTION_LABELS)
  - Show error message for empty posts (use friendly "No posts yet")

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with grid layout, responsive design
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14-17, 19)
  - **Blocks**: Task 22 (dynamic route uses SectionPage)
  - **Blocked By**: Tasks 8, 9, 17 (config, content system, PostCard)

  **References**:
  - Reference SectionPage.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\SectionPage.tsx:1-100` - Grid layout, posts mapping
  - Tailwind docs: `https://tailwindcss.com/docs/grid` - Grid system

  **Acceptance Criteria**:
  - [ ] SectionPage displays section heading from config
  - [ ] Posts rendered in responsive grid
  - [ ] Empty posts shows "No posts yet" message
  - [ ] Each post rendered as PostCard
  - [ ] Unit tests + E2e tests pass

  **QA Scenarios**:

  ```
  Scenario: Verify SectionPage grid layout
    Tool: Playwright (e2e/sectionpage.spec.ts)
    Preconditions: SectionPage with 3 posts rendered
    Steps:
      1. Navigate to page with SectionPage
      2. Get grid container
      3. Count PostCard elements
      4. Assert count is 3
    Expected Result: 3 PostCard elements in grid
    Failure Indicators: Missing cards
    Evidence: .sisyphus/evidence/task-18-grid-layout.png

  Scenario: Verify SectionPage empty state
    Tool: Playwright (e2e/sectionpage.spec.ts)
    Preconditions: SectionPage with empty posts array
    Steps:
      1. Navigate to page with SectionPage (posts: [])
      2. Check for "No posts yet" text
    Expected Result: Empty state message displayed
    Failure Indicators: Message not found or different
    Evidence: .sisyphus/evidence/task-18-empty-state.png
  ```

  **Commit**: YES
  - Message: `feat: add SectionPage component for section listings`
  - Files: src/components/SectionPage.tsx, src/components/__tests__/SectionPage.test.ts, e2e/sectionpage.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 19. Badges (Tag + CategoryBadge)

  **What to do**:
  - Create src/components/Badges.tsx with Tag and CategoryBadge components
  - Tag component: props (label: string, className?: string), styled as small pill badge
  - CategoryBadge component: props (category: string, className?: string), styled with different colors per category
  - Define category colors: components (purple), architecture (blue), get-started (green), blog (orange) — using purple palette shades
  - Export both components from Badges.tsx
  - Write Vitest unit tests for both components

  **Must NOT do**:
  - Use reference's blue category colors — adapt to purple palette
  - Create separate files (keep in Badges.tsx)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple badge components with color variations
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14-18)
  - **Blocks**: Task 17 (PostCard uses Tag/CategoryBadge)
  - **Blocked By**: None

  **References**:
  - Reference Badges.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\Badges.tsx:1-50` - Badge pattern, colors
  - Purple palette: #341291, #571EFA, #6B7280, #F3F4F6

  **Acceptance Criteria**:
  - [ ] Tag component renders label in pill badge
  - [ ] CategoryBadge renders with category-specific color
  - [ ] Category colors match purple palette
  - [ ] Both components exported from Badges.tsx
  - [ ] Unit tests pass

  **QA Scenarios**:

  ```
  Scenario: Verify Tag badge renders
    Tool: Bash (node)
    Preconditions: src/components/Badges.tsx exists
    Steps:
      1. Run `node -e "const { Tag } = require('./src/components/Badges.tsx'); console.log(Tag.displayName)"`
    Expected Result: Output is "Tag"
    Failure Indicators: Component not found
    Evidence: .sisyphus/evidence/task-19-tag-badge.txt

  Scenario: Verify CategoryBadge colors
    Tool: Vitest (src/components/__tests__/Badges.test.ts)
    Preconditions: Component tests exist
    Steps:
      1. Run `npm run test`
      2. Check test results for CategoryBadge color tests
    Expected Result: All category color tests pass
    Failure Indicators: Color tests fail
    Evidence: .sisyphus/evidence/task-19-color-tests.txt
  ```

  **Commit**: YES
  - Message: `feat: add Tag and CategoryBadge components`
  - Files: src/components/Badges.tsx, src/components/__tests__/Badges.test.ts
  - Pre-commit: `npm run lint`

- [x] 20. ArticlePage (full article + TOC sidebar + JSON-LD)

  **What to do**:
  - Create src/components/ArticlePage.tsx for full article view
  - Props: post { slug, frontmatter { title, date, description, categories, tags }, content }
  - Layout: Left sidebar with TableOfContents, main content area with article
  - Add back link to section: `← Back to [section]`
  - Render article content (HTML from markdown)
  - Add JSON-LD BlogPosting structured data: @type: "BlogPosting", headline, datePublished, description, author, url
  - Style with Tailwind: responsive layout (sidebar on desktop, stacked on mobile), typography for article content
  - Write Vitest unit tests + Playwright e2e test

  **Must NOT do**:
  - Skip TableOfContents (required for navigation)
  - Missing JSON-LD (required for SEO)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex component with layout, structured data, sidebar coordination
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (but TOC depends on this)
  - **Parallel Group**: Wave 4 (first task, others depend)
  - **Blocks**: Task 21 (TableOfContents used in ArticlePage), Task 22 (dynamic route uses ArticlePage)
  - **Blocked By**: Tasks 9, 15, 16, 18 (content, Header, Footer, SectionPage)

  **References**:
  - Reference ArticlePage.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\ArticlePage.tsx:1-200` - Article layout, TOC sidebar, JSON-LD
  - JSON-LD docs: `https://developers.google.com/search/docs/appearance/structured-data/article` - BlogPosting schema

  **Acceptance Criteria**:
  - [ ] ArticlePage displays article with sidebar (desktop) or stacked (mobile)
  - [ ] TableOfContents sidebar included
  - [ ] Back link points to section
  - [ ] JSON-LD BlogPosting included with headline, datePublished, url
  - [ ] Article content rendered correctly
  - [ ] Unit tests + E2e tests pass

  **QA Scenarios**:

  ```
  Scenario: Verify ArticlePage layout
    Tool: Playwright (e2e/articlepage.spec.ts)
    Preconditions: ArticlePage rendered with test post
    Steps:
      1. Navigate to article page
      2. Check for article content element
      3. Check for TableOfContents sidebar (desktop)
      4. Check for back link
    Expected Result: All elements present, sidebar visible on desktop
    Failure Indicators: Missing elements
    Evidence: .sisyphus/evidence/task-20-layout.png

  Scenario: Verify JSON-LD in article
    Tool: Playwright (e2e/articlepage.spec.ts)
    Preconditions: ArticlePage rendered
    Steps:
      1. Navigate to article page
      2. Get page HTML
      3. Check for BlogPosting JSON-LD script tag
      4. Check headline, datePublished, url fields
    Expected Result: JSON-LD present with required fields
    Failure Indicators: JSON-LD missing or incomplete
    Evidence: .sisyphus/evidence/task-20-jsonld.png
  ```

  **Commit**: YES
  - Message: `feat: add ArticlePage component with TOC and JSON-LD`
  - Files: src/components/ArticlePage.tsx, src/components/__tests__/ArticlePage.test.ts, e2e/articlepage.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 21. TableOfContents (IntersectionObserver active tracking)

  **What to do**:
  - Create src/components/TableOfContents.tsx for article TOC
  - Extract headings (h2, h3) from article content
  - Generate TOC links with anchors: #heading-id
  - Use IntersectionObserver to highlight active heading in viewport
  - Smooth scroll to heading on click
  - Style with Tailwind: sticky sidebar, active heading highlight, hover effects
  - Write Vitest unit tests + Playwright e2e test

  **Must NOT do**:
  - Skip active heading tracking (required for UX)
  - Use non-standard scroll behavior (smooth scroll preferred)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard TOC with IntersectionObserver pattern
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 20)
  - **Blocks**: Task 20 (ArticlePage uses TOC)
  - **Blocked By**: Task 20 (ArticlePage created first, TOC integrated)

  **References**:
  - Reference TableOfContents.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\TableOfContents.tsx:1-100` - IntersectionObserver pattern
  - IntersectionObserver docs: `https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API` - Observer API

  **Acceptance Criteria**:
  - [ ] TOC extracts h2 and h3 headings
  - [ ] TOC links scroll to heading anchors
  - [ ] Active heading highlighted while scrolling (IntersectionObserver)
  - [ ] TOC sticky on desktop
  - [ ] Unit tests + E2e tests pass

  **QA Scenarios**:

  ```
  Scenario: Verify TOC headings extracted
    Tool: Vitest (src/components/__tests__/TableOfContents.test.ts)
    Preconditions: Tests exist
    Steps:
      1. Run `npm run test`
      2. Check TOC extraction tests
    Expected Result: Headings extracted correctly
    Failure Indicators: Extraction tests fail
    Evidence: .sisyphus/evidence/task-21-toc-extraction.txt

  Scenario: Verify active heading highlight
    Tool: Playwright (e2e/tableofcontents.spec.ts)
    Preconditions: Article with TOC rendered
    Steps:
      1. Navigate to article page
      2. Scroll to second heading
      3. Check active TOC link styling
    Expected Result: Second TOC link has active class/styling
    Failure Indicators: Active highlight not working
    Evidence: .sisyphus/evidence/task-21-active-heading.png
  ```

  **Commit**: YES
  - Message: `feat: add TableOfContents with IntersectionObserver`
  - Files: src/components/TableOfContents.tsx, src/components/__tests__/TableOfContents.test.ts, e2e/tableofcontents.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 22. Dynamic route [section]/[slug]/page.tsx

  **What to do**:
  - Create src/app/[section]/[slug]/page.tsx dynamic route for articles
  - Use getPost(slug, section) from content.ts to load article
  - If post not found, render 404 page
  - Render ArticlePage with post data
  - Add metadata for individual article pages: title, description, openGraph
  - Implement generateStaticParams for SSG: return all posts with their slugs and sections
  - Write Playwright e2e tests: article loads, 404 for invalid slug

  **Must NOT do**:
  - Skip generateStaticParams (required for SSG)
  - Show raw error for invalid slug (use 404)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Dynamic route with data loading, error handling, SSG generation
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20-21)
  - **Blocks**: Tasks 23, 24, 28-30 (static routes, homepage, SEO)
  - **Blocked By**: Tasks 9, 20 (content system, ArticlePage)

  **References**:
  - Reference [section]/[slug]/page.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\app\[section]\[slug]\page.tsx:1-80` - Dynamic route, generateStaticParams
  - Next.js docs: `https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes` - Dynamic routing

  **Acceptance Criteria**:
  - [ ] Dynamic route loads articles by slug and section
  - [ ] Invalid slugs render 404 page
  - [ ] generateStaticParams returns all posts
  - [ ] Article metadata (title, description, OG) set correctly
  - [ ] E2e tests pass: valid article loads, invalid shows 404

  **QA Scenarios**:

  ```
  Scenario: Verify article loads
    Tool: Playwright (e2e/article.spec.ts)
    Preconditions: Content with test article exists
    Steps:
      1. Navigate to /components/test-article
      2. Check for article title "Test Article"
      3. Check for article content
    Expected Result: Article renders correctly
    Failure Indicators: Article not found or error
    Evidence: .sisyphus/evidence/task-22-article-load.png

  Scenario: Verify 404 for invalid slug
    Tool: Playwright (e2e/article.spec.ts)
    Preconditions: App running
    Steps:
      1. Navigate to /components/invalid-slug
      2. Check for 404 page content ("Not Found")
    Expected Result: 404 page renders
    Failure Indicators: Error or different page
    Evidence: .sisyphus/evidence/task-22-404-page.png

  Scenario: Verify generateStaticParams
    Tool: Bash (npm)
    Preconditions: npm run build
    Steps:
      1. Run `npm run build`
      2. Check build output for generated static pages
    Expected Result: All article pages generated
    Failure Indicators: Missing pages
    Evidence: .sisyphus/evidence/task-22-static-params.txt
  ```

  **Commit**: YES
  - Message: `feat: add dynamic route for articles with SSG`
  - Files: src/app/[section]/[slug]/page.tsx, e2e/article.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 23. Static routes (about, imprint, privacy, 404)

  **What to do**:
  - Create src/app/about/page.tsx with about content
  - Create src/app/imprint/page.tsx with imprint placeholder content (legal TODO)
  - Create src/app/privacy/page.tsx with privacy placeholder content (legal TODO)
  - Create src/app/not-found.tsx for 404 page with "Not Found" message and home link
  - Add metadata for each static page
  - Write Playwright e2e tests for each route

  **Must NOT do**:
  - Create actual legal content for imprint/privacy (use placeholder with TODO)
  - Skip not-found.tsx (required for 404 handling)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple static pages with placeholder content
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20-22)
  - **Blocks**: Tasks 15-16 (Header/Footer link to these pages)
  - **Blocked By**: Tasks 15, 16 (Header, Footer)

  **References**:
  - Reference about, imprint, privacy pages: `C:\Users\Tobias\git\next-graphwiz-ai\src\app\about\` - Static page patterns
  - Reference not-found.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\app\not-found.tsx:1-30` - 404 page pattern

  **Acceptance Criteria**:
  - [ ] about/page.tsx, imprint/page.tsx, privacy/page.tsx exist
  - [ ] not-found.tsx exists with 404 content
  - [ ] Imprint/Privacy have TODO markers for legal review
  - [ ] All pages have metadata
  - [ ] E2e tests pass: all routes load correctly

  **QA Scenarios**:

  ```
  Scenario: Verify about page loads
    Tool: Playwright (e2e/static-routes.spec.ts)
    Preconditions: App running
    Steps:
      1. Navigate to /about
      2. Check for about page content
      3. Check for title
    Expected Result: About page renders
    Failure Indicators: 404 or error
    Evidence: .sisyphus/evidence/task-23-about.png

  Scenario: Verify imprint/privacy TODOs
    Tool: Playwright (e2e/static-routes.spec.ts)
    Preconditions: App running
    Steps:
      1. Navigate to /imprint
      2. Check for "TODO" text in content
      3. Navigate to /privacy
      4. Check for "TODO" text
    Expected Result: Both pages have TODO markers
    Failure Indicators: TODO markers missing
    Evidence: .sisyphus/evidence/task-23-legal-todos.png

  Scenario: Verify 404 page
    Tool: Playwright (e2e/static-routes.spec.ts)
    Preconditions: App running
    Steps:
      1. Navigate to /non-existent-page
      2. Check for "Not Found" text
      3. Check for home link
    Expected Result: 404 page renders with home link
    Failure Indicators: 404 page missing
    Evidence: .sisyphus/evidence/task-23-notfound.png
  ```

  **Commit**: YES
  - Message: `feat: add static routes (about, imprint, privacy, 404)`
  - Files: src/app/about/page.tsx, src/app/imprint/page.tsx, src/app/privacy/page.tsx, src/app/not-found.tsx, e2e/static-routes.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 24. Homepage (hero, sections, latest posts)

  **What to do**:
  - Create src/app/page.tsx homepage
  - Hero section: title "openDesk Edu", subtitle "Educational Digital Infrastructure for Universities", CTA button "Get Started"
  - Sections overview: 4 cards linking to Components, Architecture, Get Started, Blog
  - Latest posts: Display 3 most recent blog posts using PostCard components
  - Use getAllPosts('blog') from content.ts to get latest posts
  - Style with Tailwind: hero with purple accent, grid layouts, responsive design
  - Write Playwright e2e tests: hero loads, sections link correctly, latest posts display

  **Must NOT do**:
  - Use reference's AI/devops/XR content (use openDesk Edu specific sections)
  - Show more than 3 latest posts (limit to 3)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Homepage with hero, multiple sections, styling
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 25-27)
  - **Blocks**: Tasks 28-30 (SEO depends on homepage)
  - **Blocked By**: Tasks 8, 14-18 (config, layout, Header, Footer, PostCard, SectionPage)

  **References**:
  - Reference page.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\app\page.tsx:1-200` - Hero, sections grid, latest posts
  - Tailwind docs: `https://tailwindcss.com/docs/heroicons` - Hero styling

  **Acceptance Criteria**:
  - [ ] Hero displays title, subtitle, CTA button
  - [ ] 4 section cards link to correct routes
  - [ ] Latest posts section shows 3 most recent blog posts
  - [ ] CTA button links to /get-started
  - [ ] E2e tests pass

  **QA Scenarios**:

  ```
  Scenario: Verify hero section
    Tool: Playwright (e2e/homepage.spec.ts)
    Preconditions: App running
    Steps:
      1. Navigate to http://localhost:3000
      2. Check for hero title "openDesk Edu"
      3. Check for subtitle containing "Educational Digital Infrastructure"
      4. Check for CTA button "Get Started"
    Expected Result: Hero elements present
    Failure Indicators: Missing elements
    Evidence: .sisyphus/evidence/task-24-hero.png

  Scenario: Verify sections cards
    Tool: Playwright (e2e/homepage.spec.ts)
    Preconditions: App running
    Steps:
      1. Navigate to http://localhost:3000
      2. Get all section cards
      3. Click Components card, check URL is /components
      4. Navigate back, click Architecture card, check URL is /architecture
    Expected Result: Cards link to correct sections
    Failure Indicators: Wrong URLs
    Evidence: .sisyphus/evidence/task-24-sections.png

  Scenario: Verify latest posts
    Tool: Playwright (e2e/homepage.spec.ts)
    Preconditions: App running with 3 blog posts
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to latest posts section
      3. Count PostCard elements in latest posts section
      4. Assert count is 3
    Expected Result: 3 latest posts displayed
    Failure Indicators: Wrong number
    Evidence: .sisyphus/evidence/task-24-latest-posts.png
  ```

  **Commit**: YES
  - Message: `feat: add homepage with hero, sections, latest posts`
  - Files: src/app/page.tsx, e2e/homepage.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 25. CookieConsent (Plausible + Clarity lazy-load)

  **What to do**:
  - Create src/components/CookieConsent.tsx for cookie consent banner
  - Show banner on first visit if no consent in localStorage
  - Buttons: "Accept" (set localStorage.consent = true, load analytics), "Decline" (set localStorage.consent = false)
  - Lazy-load Plausible and Clarity scripts only after acceptance
  - Plausible: Load script from https://plausible.io/js/script.js with PLAUSIBLE_DOMAIN
  - Clarity: Load script from https://www.clarity.ms/tag/CLARITY_ID
  - Banner dismissible (close button)
  - Style with Tailwind: bottom banner, z-index, dark mode support
  - Write Playwright e2e tests: banner shows, accept/decline work, scripts load after accept

  **Must NOT do**:
  - Load analytics scripts without consent (lazy-load required)
  - Show banner if consent already given in localStorage

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Cookie consent banner with lazy-loading pattern
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 24, 26-27)
  - **Blocks**: Task 27 (analytics integration depends on CookieConsent)
  - **Blocked By**: Task 8 (config for PLAUSIBLE_DOMAIN, CLARITY_ID)

  **References**:
  - Reference CookieConsent.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\CookieConsent.tsx:1-80` - Lazy-loading, localStorage
  - Plausible docs: `https://plausible.io/docs/plausible-script` - Script loading
  - Clarity docs: `https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-overview` - Script loading

  **Acceptance Criteria**:
  - [ ] CookieConsent shows on first visit
  - [ ] Accept button sets localStorage and loads analytics
  - [ ] Decline button sets localStorage, does not load analytics
  - [ ] Analytics scripts lazy-loaded (dynamically created script tags)
  - [ ] E2e tests pass

  **QA Scenarios**:

  ```
  Scenario: Verify consent banner shows
    Tool: Playwright (e2e/cookieconsent.spec.ts)
    Preconditions: Fresh session (no localStorage)
    Steps:
      1. Navigate to http://localhost:3000
      2. Check for cookie consent banner
      3. Check for "Accept" and "Decline" buttons
    Expected Result: Banner shows on first visit
    Failure Indicators: Banner not found
    Evidence: .sisyphus/evidence/task-25-banner.png

  Scenario: Verify accept loads analytics
    Tool: Playwright (e2e/cookieconsent.spec.ts)
    Preconditions: Fresh session
    Steps:
      1. Navigate to http://localhost:3000
      2. Click "Accept" button
      3. Check localStorage.consent is true
      4. Check for Plausible script tag in DOM
      5. Check for Clarity script tag in DOM
    Expected Result: Consent saved, analytics scripts loaded
    Failure Indicators: Scripts not loaded
    Evidence: .sisyphus/evidence/task-25-accept-analytics.png

  Scenario: Verify decline skips analytics
    Tool: Playwright (e2e/cookieconsent.spec.ts)
    Preconditions: Fresh session
    Steps:
      1. Navigate to http://localhost:3000
      2. Click "Decline" button
      3. Check localStorage.consent is false
      4. Check for analytics script tags (should not exist)
    Expected Result: Consent saved, analytics NOT loaded
    Failure Indicators: Scripts loaded despite decline
    Evidence: .sisyphus/evidence/task-25-decline-analytics.png
  ```

  **Commit**: YES
  - Message: `feat: add CookieConsent banner with analytics lazy-load`
  - Files: src/components/CookieConsent.tsx, e2e/cookieconsent.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 26. EmailLink (obfuscated mailto)

  **What to do**:
  - Create src/components/EmailLink.tsx for obfuscated email links
  - Split email into parts: ['info', '@', 'opendesk-edu', '.org']
  - Reconstruct href: `mailto:${parts.join('')}` on click
  - Display as "info@opendesk-edu.org"
  - Reason: Basic obfuscation to reduce spam (not security, just annoyance)
  - Or: Use simpler approach without obfuscation (user preference TBD - implement simple version first)
  - Write Vitest unit tests

  **Must NOT do**:
  - Expose full email in plain HTML href attribute (obfuscate or use JS)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple email link component
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 24-25, 27)
  - **Blocks**: Task 16 (Footer uses EmailLink)
  - **Blocked By**: Task 8 (config for CONTACT_EMAIL)

  **References**:
  - Reference EmailLink.tsx: `C:\Users\Tobias\git\next-graphwiz-ai\src\components\EmailLink.tsx:1-30` - Obfuscation pattern
  - Decision: Skip obfuscation, use simpler approach (optional for user review)

  **Acceptance Criteria**:
  - [ ] EmailLink displays email "info@opendesk-edu.org"
  - [ ] Click opens mail client with correct address
  - [ ] Unit tests pass

  **QA Scenarios**:

  ```
  Scenario: Verify EmailLink renders
    Tool: Playwright (e2e/emaillink.spec.ts)
    Preconditions: EmailLink rendered in Footer
    Steps:
      1. Navigate to http://localhost:3000
      2. Find email link in footer
      3. Check link text contains "info@opendesk-edu.org"
    Expected Result: Email link displayed
    Failure Indicators: Link not found
    Evidence: .sisyphus/evidence/task-26-emaillink-render.png

  Scenario: Verify email link works
    Tool: Playwright (e2e/emaillink.spec.ts)
    Preconditions: EmailLink rendered
    Steps:
      1. Click email link
      2. Check href attribute (should be mailto:...)
    Expected Result: href is mailto:info@opendesk-edu.org
    Failure Indicators: Wrong href
    Evidence: .sisyphus/evidence/task-26-emaillink-href.png
  ```

  **Commit**: YES
  - Message: `feat: add EmailLink component for contact email`
  - Files: src/components/EmailLink.tsx, src/components/__tests__/EmailLink.test.ts, e2e/emaillink.spec.ts
  - Pre-commit: `npm run lint && npm run test && npx playwright test`

- [x] 27. Analytics integration (Plausible + Clarity scripts)

  **What to do**:
  - Create src/lib/analytics.ts with functions to load analytics scripts
  - loadPlausible(): Create script tag with src="https://plausible.io/js/script.js", data-domain=PLAUSIBLE_DOMAIN, append to head
  - loadClarity(): Create script tag with src="https://www.clarity.ms/tag/{CLARITY_ID}", append to head
  - loadAnalytics(): Call both functions if consent true
  - Export functions for use in CookieConsent
  - Write Vitest unit tests

  **Must NOT do**:
  - Load scripts without consent check
  - Hardcode domain or ID (use config.ts values)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Analytics script loading functions
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 24-26)
  - **Blocks**: Task 25 (CookieConsent uses analytics functions)
  - **Blocked By**: Task 8 (config for PLAUSIBLE_DOMAIN, CLARITY_ID)

  **References**:
  - Plausible docs: `https://plausible.io/docs/plausible-script` - Script format
  - Clarity docs: `https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-overview` - Script format

  **Acceptance Criteria**:
  - [ ] loadPlausible creates script tag with correct domain
  - [ ] loadClarity creates script tag with correct ID
  - [ ] loadAnalytics calls both functions
  - [ ] Scripts append to document head
  - [ ] Unit tests pass

  **QA Scenarios**:

  ```
  Scenario: Verify Plausible script creation
    Tool: Vitest (src/lib/__tests__/analytics.test.ts)
    Preconditions: Tests exist
    Steps:
      1. Run `npm run test`
      2. Check Plausible script test
    Expected Result: Script created with correct src and data-domain
    Failure Indicators: Test fails
    Evidence: .sisyphus/evidence/task-27-plausible-script.txt

  Scenario: Verify Clarity script creation
    Tool: Vitest (src/lib/__tests__/analytics.test.ts)
    Preconditions: Tests exist
    Steps:
      1. Run `npm run test`
      2. Check Clarity script test
    Expected Result: Script created with correct src containing CLARITY_ID
    Failure Indicators: Test fails
    Evidence: .sisyphus/evidence/task-27-clarity-script.txt
  ```

  **Commit**: YES
  - Message: `feat: add analytics integration (Plausible + Clarity)`
  - Files: src/lib/analytics.ts, src/lib/__tests__/analytics.test.ts
  - Pre-commit: `npm run lint && npm run test`

- [x] 28. Sitemap (sitemap.ts)

  **What to do**:
  - Create src/app/sitemap.ts for SEO sitemap generation
  - Get all posts from all sections using getAllPosts
  - Generate sitemap entries: { url, lastModified, changeFrequency, priority }
  - Add static pages: /, /about, /imprint, /privacy
  - Add all article pages: /[section]/[slug]
  - Set priority: homepage 1.0, section pages 0.8, articles 0.6, static pages 0.5
  - Export default sitemap function returning Sitemap type
  - Write Bash test to verify sitemap XML generation

  **Must NOT do**:
  - Skip static pages in sitemap
  - Set same priority for all pages

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Next.js sitemap generation
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 29-32)
  - **Blocks**: None (SEO task, independent)
  - **Blocked By**: Tasks 9, 20, 22, 23 (content, ArticlePage, dynamic route, static routes)

  **References**:
  - Reference sitemap.ts: `C:\Users\Tobias\git\next-graphwiz-ai\src\app\sitemap.ts:1-80` - Sitemap generation pattern
  - Next.js docs: `https://nextjs.org/docs/app/api-reference/functions/generate-sitemap` - Sitemap API

  **Acceptance Criteria**:
  - [ ] Sitemap includes homepage, static pages, all articles
  - [ ] URLs are correct (absolute with SITE_URL)
  - [ ] lastModified set from frontmatter dates
  - [ ] Priorities set correctly
  - [ ] Sitemap XML validates

  **QA Scenarios**:

  ```
  Scenario: Verify sitemap contains homepage
    Tool: Bash (curl + grep)
    Preconditions: App built
    Steps:
      1. Run `npm run build`
      2. Run `curl -s http://localhost:3000/sitemap.xml | grep "<loc>https://opendesk-edu.org/</loc>"`
    Expected Result: Homepage URL in sitemap
    Failure Indicators: URL not found
    Evidence: .sisyphus/evidence/task-28-sitemap-homepage.txt

  Scenario: Verify sitemap contains articles
    Tool: Bash (curl + grep)
    Preconditions: App built with test article
    Steps:
      1. Run `curl -s http://localhost:3000/sitemap.xml | grep "<loc>https://opendesk-edu.org/components/test</loc>"`
    Expected Result: Article URL in sitemap
    Failure Indicators: URL not found
    Evidence: .sisyphus/evidence/task-28-sitemap-articles.txt
  ```

  **Commit**: YES
  - Message: `seo: add sitemap generation for all pages`
  - Files: src/app/sitemap.ts
  - Pre-commit: `npm run lint`

- [x] 29. Robots.txt (robots.ts)

  **What to do**:
  - Create src/app/robots.ts for robots.txt generation
  - Allow all user agents: `User-agent: *`
  - Disallow admin/private paths (if any exist, currently none)
  - Add sitemap URL: `Sitemap: https://opendesk-edu.org/sitemap.xml`
  - Export default robots function returning Robots type
  - Write Bash test to verify robots.txt generation

  **Must NOT do**:
  - Disallow public content paths
  - Skip sitemap URL reference

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Next.js robots.txt generation
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 28, 30-32)
  - **Blocks**: None (SEO task, independent)
  - **Blocked By**: Task 28 (depends on sitemap)

  **References**:
  - Reference robots.ts: `C:\Users\Tobias\git\next-graphwiz-ai\src\app\robots.ts:1-20` - Robots pattern
  - Next.js docs: `https://nextjs.org/docs/app/api-reference/functions/generate-robots` - Robots API

  **Acceptance Criteria**:
  - [ ] Robots.txt allows all user agents
  - [ ] Sitemap URL included
  - [ ] No private paths exposed

  **QA Scenarios**:

  ```
  Scenario: Verify robots.txt allows all agents
    Tool: Bash (curl + grep)
    Preconditions: App built
    Steps:
      1. Run `curl -s http://localhost:3000/robots.txt | grep "User-agent: \*"`
    Expected Result: User-agent line exists
    Failure Indicators: Line not found
    Evidence: .sisyphus/evidence/task-29-robots-useragent.txt

  Scenario: Verify robots.txt sitemap
    Tool: Bash (curl + grep)
    Preconditions: App built
    Steps:
      1. Run `curl -s http://localhost:3000/robots.txt | grep "Sitemap: https://opendesk-edu.org/sitemap.xml"`
    Expected Result: Sitemap line exists
    Failure Indicators: Sitemap not found
    Evidence: .sisyphus/evidence/task-29-robots-sitemap.txt
  ```

  **Commit**: YES
  - Message: `seo: add robots.txt generation`
  - Files: src/app/robots.ts
  - Pre-commit: `npm run lint`

- [x] 30. RSS feed (feed.xml/route.ts)

  **What to do**:
  - Create src/app/feed.xml/route.ts for RSS feed generation
  - Get all blog posts using getAllPosts('blog')
  - Generate RSS XML with: channel (title, description, link, language), items (title, description, pubDate, link, guid)
  - Set language to 'en-us' (single feed for v1)
  - Format dates as RFC 822 (e.g., "Wed, 02 Oct 2002 13:00:00 GMT")
  - Escape XML special characters in content
  - Return Response with content-type: 'application/rss+xml'
  - Write Bash test to verify RSS XML generation

  **Must NOT do**:
  - Skip XML escaping (security issue)
  - Use wrong date format (RFC 822 required)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: RSS feed generation with XML formatting
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 28-29, 31-32)
  - **Blocks**: None (SEO task, independent)
  - **Blocked By**: Tasks 9, 22 (content system, dynamic route)

  **References**:
  - Reference feed.xml/route.ts: `C:\Users\Tobias\git\next-graphwiz-ai\src\app\feed.xml\route.ts:1-80` - RSS generation pattern
  - Reference lib/xml.ts: `C:\Users\Tobias\git\next-graphwiz-ai\src\lib\xml.ts:1-20` - XML escaping
  - RSS 2.0 spec: `https://www.rssboard.org/rss-specification` - RSS format

  **Acceptance Criteria**:
  - [ ] RSS feed includes all blog posts
  - [ ] XML properly escaped
  - [ ] Date format is RFC 822
  - [ ] Content-type is application/rss+xml
  - [ ] RSS validates against spec

  **QA Scenarios**:

  ```
  Scenario: Verify RSS feed loads
    Tool: Bash (curl)
    Preconditions: App built with blog posts
    Steps:
      1. Run `curl -s http://localhost:3000/feed.xml --head -D -`
      2. Check content-type header
    Expected Result: Content-type is application/rss+xml
    Failure Indicators: Wrong content-type
    Evidence: .sisyphus/evidence/task-30-rss-contenttype.txt

  Scenario: Verify RSS feed items
    Tool: Bash (curl + grep)
    Preconditions: App built with test blog post
    Steps:
      1. Run `curl -s http://localhost:3000/feed.xml | grep "<title>Test Blog Post</title>"`
    Expected Result: Blog post title in RSS
    Failure Indicators: Post not found
    Evidence: .sisyphus/evidence/task-30-rss-items.txt
  ```

  **Commit**: YES
  - Message: `seo: add RSS feed for blog posts`
  - Files: src/app/feed.xml/route.ts, src/lib/xml.ts
  - Pre-commit: `npm run lint`

- [x] 31. GitHub Actions CI (lint, test, build, deploy)

  **What to do**:
  - Create .github/workflows/ci.yml for CI pipeline
  - Trigger on: push to main, pull_request
  - Steps: Checkout code, Setup Node 20, Install dependencies, Lint (npm run lint), Test (npm run test), Test e2e (npm run test:e2e), Build (npm run build), Upload build artifacts
  - Create .github/workflows/deploy.yml for deployment
  - Trigger on: push to main
  - Deploy step: SSH to server (tobias-weiss.org), run: `cd /home/weiss/git/next-opendesk-edu-org && git pull && docker compose build --no-cache && docker compose up -d`
  - Use appleboy/ssh-action for SSH
  - Add deploy verification: `curl -f http://localhost:3000 || exit 1`
  - Add secrets: SSH_KEY, SSH_HOST, SSH_USER (to be configured in GitHub repo)

  **Must NOT do**:
  - Skip tests in CI (all tests required)
  - Deploy on pull request (only on push to main)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CI/CD pipeline with multiple workflows, SSH deployment
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - `codeberg`: Using GitHub Actions, mirroring to Codeberg

  **References**:
  - Reference .github/workflows/ci.yml: `C:\Users\Tobias\git\next-graphwiz-ai\.github\workflows\ci.yml:1-80` - CI pipeline
  - Reference .github/workflows/deploy.yml: `C:\Users\Tobias\git\next-graphwiz-ai\.github\workflows\deploy.yml:1-50` - SSH deploy
  - GitHub Actions docs: `https://docs.github.com/en/actions` - Actions syntax
  - appleboy/ssh-action: `https://github.com/appleboy/ssh-action` - SSH action

  **Acceptance Criteria**:
  - [ ] CI workflow runs on push/PR to main
  - [ ] CI runs lint, test, test:e2e, build
  - [ ] Deploy workflow runs on push to main only
  - [ ] Deploy SSHs to tobias-weiss.org and runs docker compose
  - [ ] Deploy verification checks site is running

  **QA Scenarios**:

  ```
  Scenario: Verify CI workflow syntax
    Tool: Bash (yamllint)
    Preconditions: .github/workflows/ci.yml exists
    Steps:
      1. Run `yamllint .github/workflows/ci.yml`
    Expected Result: YAML syntax valid
    Failure Indicators: Syntax errors
    Evidence: .sisyphus/evidence/task-31-ci-syntax.txt

  Scenario: Verify deploy workflow syntax
    Tool: Bash (yamllint)
    Preconditions: .github/workflows/deploy.yml exists
    Steps:
      1. Run `yamllint .github/workflows/deploy.yml`
    Expected Result: YAML syntax valid
    Failure Indicators: Syntax errors
    Evidence: .sisyphus/evidence/task-31-deploy-syntax.txt

  Scenario: Verify deploy steps
    Tool: Bash (grep)
    Preconditions: .github/workflows/deploy.yml exists
    Steps:
      1. Run `grep "docker compose up -d" .github/workflows/deploy.yml`
      2. Run `grep "appleboy/ssh-action" .github/workflows/deploy.yml`
    Expected Result: Both commands present
    Failure Indicators: Missing steps
    Evidence: .sisyphus/evidence/task-31-deploy-steps.txt
  ```

  **Commit**: YES
  - Message: `ci: add GitHub Actions for CI and SSH deployment`
  - Files: .github/workflows/ci.yml, .github/workflows/deploy.yml
  - Pre-commit: `npm run lint`

- [x] 32. Docker deploy verification (test SSH build)

  **What to do**:
  - Create test script to verify Docker build locally
  - Run `docker build -t opendesk-edu:test .`
  - Run `docker run -p 3001:3000 opendesk-edu:test`
  - Verify container starts: `curl -f http://localhost:3001 || exit 1`
  - Verify homepage loads: `curl -f http://localhost:3001 | grep "openDesk Edu"`
  - Stop container: `docker stop $(docker ps -q)`
  - Document deployment steps in README.md

  **Must NOT do**:
  - Skip Docker build verification
  - Run container as root (use non-user from Dockerfile)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Docker build verification, mechanical steps
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 28-31)
  - **Blocks**: None (verification task, end of Phase 1)
  - **Blocked By**: Tasks 7, 24 (Dockerfile, homepage)

  **References**:
  - Docker build docs: `https://docs.docker.com/engine/reference/commandline/build` - Build command
  - Docker run docs: `https://docs.docker.com/engine/reference/commandline/run` - Run command

  **Acceptance Criteria**:
  - [ ] Docker build succeeds
  - [ ] Container runs and binds to port 3001
  - [ ] Homepage loads from container
  - [ ] README.md documents deployment steps

  **QA Scenarios**:

  ```
  Scenario: Verify Docker build
    Tool: Bash (docker)
    Preconditions: Dockerfile exists
    Steps:
      1. Run `docker build -t opendesk-edu:test .`
      2. Check exit code
    Expected Result: Exit code is 0
    Failure Indicators: Build fails
    Evidence: .sisyphus/evidence/task-32-docker-build.txt

  Scenario: Verify container runs
    Tool: Bash (docker + curl)
    Preconditions: Docker image built
    Steps:
      1. Run `docker run -d -p 3001:3000 --name opendesk-edu-test opendesk-edu:test`
      2. Sleep 5 seconds (container startup)
      3. Run `curl -f http://localhost:3001 | grep "openDesk Edu"`
      4. Run `docker stop opendesk-edu-test && docker rm opendesk-edu-test`
    Expected Result: Homepage loads, container stops cleanly
    Failure Indicators: Homepage not found or container fails
    Evidence: .sisyphus/evidence/task-32-container-run.txt
  ```

  **Commit**: YES
  - Message: `chore: verify Docker build and document deployment`
  - Files: README.md (deployment docs)
  - Pre-commit: `npm run lint`

---

### PHASE 2: i18n Layer (English + German)

- [x] 33. next-intl installation + config

  **What to do**: Install `next-intl` package. Create src/i18n/routing.ts with locale configuration: locales = ['en', 'de', 'fr', 'zh'], defaultLocale = 'en'. Create src/i18n/request.ts with getRequestConfig for message loading. Configure next.config.ts to use createNextIntlPlugin.
  **Must NOT do**: Install before Phase 1 is complete; skip fr/zh locale configuration.
  **References**: next-intl docs `https://next-intl.dev/docs/getting-started/app-router`; next-intl routing.ts pattern.
  **Recommended Agent Profile**: `quick` — standard library setup
  **Parallelization**: Wave 7, Blocks: Tasks 34-37, Blocked By: Phase 1 complete
  **QA Scenarios**:
  ```
  Scenario: Verify next-intl installed
    Tool: Bash (node -p)
    Steps: Run `node -p "require('./package.json').dependencies['next-intl']"`
    Expected: Version string present (not undefined)
    Evidence: .sisyphus/evidence/task-33-next-intl.txt
  ```
  **Commit**: YES — `feat(i18n): install and configure next-intl`

- [x] 34. Middleware (locale detection, subdirectory routing)

  **What to do**: Create src/middleware.ts with next-intl middleware. Configure locale detection from URL path prefix (/en/, /de/, /fr/, /zh/). Redirect root (/) to /en/. Add Accept-Language header detection for automatic locale suggestion. Ensure static assets and API routes bypass middleware.
  **Must NOT do**: Allow missing locale prefix (all routes must have locale); skip fr/zh even if not fully translated.
  **References**: next-intl middleware docs `https://next-intl.dev/docs/routing/middleware`; Reference project — no middleware (single language, but pattern for Next.js middleware).
  **Recommended Agent Profile**: `unspecified-high` — middleware logic with edge cases
  **Parallelization**: Wave 7, Blocks: Tasks 35-43, Blocked By: Task 33
  **QA Scenarios**:
  ```
  Scenario: Verify root redirects to /en/
    Tool: Playwright (e2e/middleware.spec.ts)
    Steps: Navigate to http://localhost:3000/, check URL becomes /en/
    Expected: URL is /en/
    Evidence: .sisyphus/evidence/task-34-root-redirect.png
  Scenario: Verify locale detection from path
    Tool: Playwright (e2e/middleware.spec.ts)
    Steps: Navigate to /de/components, check page loads in German
    Expected: Page renders with German content (or EN fallback)
    Evidence: .sisyphus/evidence/task-34-de-path.png
  ```
  **Commit**: YES — `feat(i18n): add middleware for locale routing`

- [x] 35. Root layout split (html lang attribute, locale provider)

  **What to do**: Modify src/app/layout.tsx to accept locale param. Split into src/app/[locale]/layout.tsx with NextIntlClientProvider wrapping. Set `<html lang={locale}>` dynamically. Pass messages from locale-specific message files.
  **Must NOT do**: Hardcode lang attribute; keep old layout.tsx if new [locale]/layout.tsx created.
  **References**: next-intl layout docs `https://next-intl.dev/docs/getting-started/app-router`; Reference layout.tsx for existing providers.
  **Recommended Agent Profile**: `quick` — layout restructuring
  **Parallelization**: Wave 7, Blocks: Tasks 38-43, Blocked By: Tasks 33, 34
  **QA Scenarios**:
  ```
  Scenario: Verify html lang attribute
    Tool: Playwright (e2e/layout-i18n.spec.ts)
    Steps: Navigate to /en/, check html lang="en"; navigate to /de/, check html lang="de"
    Expected: lang attribute matches locale
    Evidence: .sisyphus/evidence/task-35-lang-attr.png
  ```
  **Commit**: YES — `feat(i18n): split root layout with locale provider`

- [x] 36. Message files (en.json, de.json) — UI strings

  **What to do**: Create messages/en.json with all UI strings: header nav labels (Components, Architecture, Get Started, Blog), footer links (Imprint, Privacy), cookie consent (Accept/Decline text), 404 page (Not Found, Go Home), about page content, hero section (title, subtitle, CTA). Create messages/de.json with German translations. Create messages/fr.json and messages/zh.json with English placeholders (marked with TODO for translation).
  **Must NOT do**: Hardcode any UI string in components; skip any UI string.
  **References**: next-intl messages docs `https://next-intl.dev/docs/translation-messages`; Draft — confirmed sections and email.
  **Recommended Agent Profile**: `quick` — JSON translation files
  **Parallelization**: Wave 7, Blocks: Tasks 38-43, 44-47, Blocked By: Task 33
  **QA Scenarios**:
  ```
  Scenario: Verify message files exist
    Tool: Bash (ls)
    Steps: Run `ls messages/en.json messages/de.json messages/fr.json messages/zh.json`
    Expected: All 4 files exist
    Evidence: .sisyphus/evidence/task-36-messages.txt
  Scenario: Verify all UI keys present
    Tool: Bash (node -p)
    Steps: Run `node -p "Object.keys(require('./messages/en.json')).sort().join(', ')"` 
    Expected: Contains: header, footer, cookieConsent, notFound, about, hero, sections
    Evidence: .sisyphus/evidence/task-36-keys.txt
  ```
  **Commit**: YES — `feat(i18n): add message files for EN, DE, FR, ZH`

- [x] 37. Content structure split (content/en/, content/de/)

  **What to do**: Move existing content/ files into content/en/ subdirectory. Create content/de/ directory with German article stubs (TODO markers for actual translation). Create content/fr/ and content/zh/ with EN placeholder copies. Update content.ts getAllPosts/getPost to accept locale parameter and load from content/{locale}/{section}/.
  **Must NOT do**: Delete original content files without moving; skip locale parameter in content functions.
  **References**: Content system from Task 9; next-intl content pattern.
  **Recommended Agent Profile**: `quick` — directory restructuring
  **Parallelization**: Wave 7, Blocks: Tasks 44-47, Blocked By: Tasks 9, 36
  **QA Scenarios**:
  ```
  Scenario: Verify content directories
    Tool: Bash (ls)
    Steps: Run `ls -d content/en content/de content/fr content/zh`
    Expected: All 4 locale directories exist
    Evidence: .sisyphus/evidence/task-37-content-dirs.txt
  Scenario: Verify content loading with locale
    Tool: Bash (node)
    Steps: Run `node -e "const {getAllPosts} = require('./src/lib/content.ts'); console.log(typeof getAllPosts('blog', 'en'))"`
    Expected: Function returns array
    Evidence: .sisyphus/evidence/task-37-locale-load.txt
  ```
  **Commit**: YES — `feat(i18n): split content by locale (en/de/fr/zh)`

- [ ] 38. Header i18n (nav labels, mobile menu)

  **What to do**: Replace hardcoded nav labels with `useTranslations('header')` calls. Use t('components'), t('architecture'), t('getStarted'), t('blog') for nav links. Update mobile menu labels similarly. Ensure nav links include locale prefix: `/${locale}/components`.
  **Must NOT do**: Keep any hardcoded label strings.
  **References**: next-intl useTranslations `https://next-intl.dev/docs/translation-messages/use-translations`; Reference Header.tsx.
  **Recommended Agent Profile**: `visual-engineering` — component modification
  **Parallelization**: Wave 8, Blocks: Task 43, Blocked By: Tasks 36, 37
  **QA Scenarios**:
  ```
  Scenario: Verify German nav labels
    Tool: Playwright (e2e/header-i18n.spec.ts)
    Steps: Navigate to /de/, check nav links contain German text (Komponenten, Architektur, Erste Schritte, Blog)
    Expected: German labels displayed
    Evidence: .sisyphus/evidence/task-38-de-nav.png
  ```
  **Commit**: YES — `feat(i18n): translate Header nav labels`

- [ ] 39. Footer i18n (links, copyright text)

  **What to do**: Replace hardcoded footer links with useTranslations('footer'). Translate: imprint, privacy, copyright text. Ensure links include locale prefix.
  **Must NOT do**: Keep hardcoded footer text.
  **References**: Reference Footer.tsx; messages/de.json footer section.
  **Recommended Agent Profile**: `visual-engineering` — component modification
  **Parallelization**: Wave 8, Blocks: Task 43, Blocked By: Tasks 36, 37
  **QA Scenarios**:
  ```
  Scenario: Verify German footer
    Tool: Playwright (e2e/footer-i18n.spec.ts)
    Steps: Navigate to /de/, check footer links contain German text (Impressum, Datenschutz)
    Expected: German labels displayed
    Evidence: .sisyphus/evidence/task-39-de-footer.png
  ```
  **Commit**: YES — `feat(i18n): translate Footer links`

- [ ] 40. CookieConsent i18n (accept/decline text)

  **What to do**: Replace hardcoded cookie consent text with useTranslations('cookieConsent'). Translate banner message, accept/decline buttons.
  **Must NOT do**: Keep hardcoded consent text.
  **References**: Reference CookieConsent.tsx; messages/de.json.
  **Recommended Agent Profile**: `quick` — component modification
  **Parallelization**: Wave 8, Blocks: None, Blocked By: Tasks 36, 37
  **QA Scenarios**:
  ```
  Scenario: Verify German cookie consent
    Tool: Playwright (e2e/cookieconsent-i18n.spec.ts)
    Steps: Navigate to /de/, check consent banner has German text (Akzeptieren, Ablehnen)
    Expected: German consent text
    Evidence: .sisyphus/evidence/task-40-de-consent.png
  ```
  **Commit**: YES — `feat(i18n): translate CookieConsent text`

- [ ] 41. 404 page i18n (not found text)

  **What to do**: Replace hardcoded 404 text with useTranslations('notFound'). Translate: "Not Found" → "Seite nicht gefunden" (DE), "Go Home" → "Zur Startseite" (DE).
  **Must NOT do**: Keep hardcoded 404 text.
  **References**: Reference not-found.tsx; messages/de.json.
  **Recommended Agent Profile**: `quick` — page modification
  **Parallelization**: Wave 8, Blocks: None, Blocked By: Tasks 36, 37
  **QA Scenarios**:
  ```
  Scenario: Verify German 404 page
    Tool: Playwright (e2e/notfound-i18n.spec.ts)
    Steps: Navigate to /de/non-existent, check for "Seite nicht gefunden"
    Expected: German 404 text
    Evidence: .sisyphus/evidence/task-41-de-404.png
  ```
  **Commit**: YES — `feat(i18n): translate 404 page`

- [ ] 42. Imprint/Privacy i18n (placeholder legal text)

  **What to do**: Create content/en/imprint.md and content/en/privacy.md with English placeholder text (TODO: legal review). Create content/de/imprint.md and content/de/privacy.md with German placeholders. Update imprint/privacy pages to load locale-specific content.
  **Must NOT do**: Create actual legal content (placeholders only).
  **References**: Draft — legal placeholder requirement; content system.
  **Recommended Agent Profile**: `quick` — content file creation
  **Parallelization**: Wave 8, Blocks: None, Blocked By: Tasks 36, 37
  **QA Scenarios**:
  ```
  Scenario: Verify locale-specific legal pages
    Tool: Playwright (e2e/legal-i18n.spec.ts)
    Steps: Navigate to /en/imprint, check English text; navigate to /de/imprint, check German text
    Expected: Different content per locale
    Evidence: .sisyphus/evidence/task-42-legal-i18n.png
  ```
  **Commit**: YES — `feat(i18n): add locale-specific imprint and privacy pages`

- [ ] 43. Homepage i18n (hero, sections headings)

  **What to do**: Replace hardcoded homepage text with useTranslations('hero') and useTranslations('sections'). Translate hero title, subtitle, CTA. Translate section card headings and descriptions.
  **Must NOT do**: Keep hardcoded homepage text.
  **References**: Reference page.tsx; messages/de.json.
  **Recommended Agent Profile**: `visual-engineering` — page modification with layout impact
  **Parallelization**: Wave 8, Blocks: Tasks 44-47, Blocked By: Tasks 36, 37, 38, 39
  **QA Scenarios**:
  ```
  Scenario: Verify German homepage
    Tool: Playwright (e2e/homepage-i18n.spec.ts)
    Steps: Navigate to /de/, check hero title "openDesk Edu" (brand stays EN), check section headings in German
    Expected: German UI text, brand name stays English
    Evidence: .sisyphus/evidence/task-43-de-homepage.png
  ```
  **Commit**: YES — `feat(i18n): translate homepage hero and sections`

- [ ] 44. Translate Components section (EN→DE)

  **What to do**: Create content/de/components/ directory. Translate 1-2 Components articles from English to German. Focus on: ILIAS, BigBlueButton, or OpenCloud articles (most representative). Use professional technical German.
  **Must NOT do**: Machine-translate without review; translate more than 2 articles for v1.
  **References**: Content in content/en/components/; openDesk Edu docs for German terminology.
  **Recommended Agent Profile**: `writing` — German translation
  **Parallelization**: Wave 9, Blocks: Task 48, Blocked By: Tasks 36, 37, 38, 39, 43
  **QA Scenarios**:
  ```
  Scenario: Verify German Components article
    Tool: Playwright (e2e/components-i18n.spec.ts)
    Steps: Navigate to /de/components/, check at least 1 article listed with German title/description
    Expected: German article loads
    Evidence: .sisyphus/evidence/task-44-de-components.png
  ```
  **Commit**: YES — `feat(i18n): add German Components translations`

- [ ] 45. Translate Architecture section (EN→DE)

  **What to do**: Create content/de/architecture/ directory. Translate 1-2 Architecture articles from English to German. Focus on: main architecture overview and SAML federation articles.
  **Must NOT do**: Machine-translate without review; skip technical accuracy.
  **References**: Content in content/en/architecture/; openDesk Edu architecture docs.
  **Recommended Agent Profile**: `writing` — German translation
  **Parallelization**: Wave 9, Blocks: Task 48, Blocked By: Tasks 36, 37, 38, 39, 43
  **QA Scenarios**:
  ```
  Scenario: Verify German Architecture article
    Tool: Playwright (e2e/architecture-i18n.spec.ts)
    Steps: Navigate to /de/architecture/, check at least 1 article with German content
    Expected: German article loads
    Evidence: .sisyphus/evidence/task-45-de-architecture.png
  ```
  **Commit**: YES — `feat(i18n): add German Architecture translations`

- [ ] 46. Translate Get Started section (EN→DE)

  **What to do**: Create content/de/get-started/ directory. Translate 1-2 Get Started articles from English to German. Focus on: deployment guide and quick start guide.
  **Must NOT do**: Machine-translate without review; skip deployment accuracy.
  **References**: Content in content/en/get-started/; openDesk Edu getting-started docs.
  **Recommended Agent Profile**: `writing` — German translation
  **Parallelization**: Wave 9, Blocks: Task 48, Blocked By: Tasks 36, 37, 38, 39, 43
  **QA Scenarios**:
  ```
  Scenario: Verify German Get Started article
    Tool: Playwright (e2e/getstarted-i18n.spec.ts)
    Steps: Navigate to /de/get-started/, check at least 1 article with German content
    Expected: German article loads
    Evidence: .sisyphus/evidence/task-46-de-getstarted.png
  ```
  **Commit**: YES — `feat(i18n): add German Get Started translations`

- [ ] 47. Translate Blog section (EN→DE)

  **What to do**: Create content/de/blog/ directory. Translate 1-2 Blog posts from English to German. Focus on: project announcement or feature highlight posts.
  **Must NOT do**: Machine-translate without review; translate more than 2 posts for v1.
  **References**: Content in content/en/blog/.
  **Recommended Agent Profile**: `writing` — German translation
  **Parallelization**: Wave 9, Blocks: Task 48, Blocked By: Tasks 36, 37, 38, 39, 43
  **QA Scenarios**:
  ```
  Scenario: Verify German Blog post
    Tool: Playwright (e2e/blog-i18n.spec.ts)
    Steps: Navigate to /de/blog/, check at least 1 post with German content
    Expected: German blog post loads
    Evidence: .sisyphus/evidence/task-47-de-blog.png
  ```
  **Commit**: YES — `feat(i18n): add German Blog translations`

- [ ] 48. Sitemap with hreflang (EN + DE alternates)

  **What to do**: Update src/app/sitemap.ts to include hreflang alternates for all pages. Each URL should have alternates: `['en', 'de']`. Generate entries for each locale: /en/components, /de/components, etc.
  **Must NOT do**: Skip hreflang (required for SEO); include fr/zh if not translated.
  **References**: Next.js sitemap docs `https://nextjs.org/docs/app/api-reference/functions/generate-sitemap#alternates-fields`; hreflang spec.
  **Recommended Agent Profile**: `unspecified-high` — SEO with internationalization
  **Parallelization**: Wave 10, Blocks: None, Blocked By: Tasks 28, 29, 37
  **QA Scenarios**:
  ```
  Scenario: Verify hreflang in sitemap
    Tool: Bash (curl + grep)
    Steps: Run `curl -s http://localhost:3000/sitemap.xml | grep "hreflang"`
    Expected: hreflang entries for en and de
    Evidence: .sisyphus/evidence/task-48-hreflang.txt
  ```
  **Commit**: YES — `seo(i18n): add hreflang alternates to sitemap`

- [ ] 49. JSON-LD locale metadata (inLanguage, alternateLanguage)

  **What to do**: Update JSON-LD in layout.tsx and ArticlePage.tsx to include locale metadata. Add inLanguage field. Add alternateLanguage for translated versions of same article.
  **Must NOT do**: Skip inLanguage (required for multi-language SEO).
  **References**: JSON-LD BlogPosting spec `https://developers.google.com/search/docs/appearance/structured-data/article`; Task 20.
  **Recommended Agent Profile**: `quick` — JSON-LD update
  **Parallelization**: Wave 10, Blocks: None, Blocked By: Tasks 37
  **QA Scenarios**:
  ```
  Scenario: Verify JSON-LD inLanguage
    Tool: Playwright (e2e/jsonld-i18n.spec.ts)
    Steps: Navigate to /de/components/test, check JSON-LD for inLanguage: "de"
    Expected: inLanguage field present
    Evidence: .sisyphus/evidence/task-49-inlanguage.png
  ```
  **Commit**: YES — `seo(i18n): add locale metadata to JSON-LD`

- [ ] 50. OG tags with locale property (og:locale:alternate)

  **What to do**: Update metadata in layout.tsx and [section]/[slug]/page.tsx to include og:locale and og:locale:alternate properties. Set og:locale to current locale. Set og:locale:alternate to other available locales.
  **Must NOT do**: Skip og:locale (required for multi-language social sharing).
  **References**: Open Graph protocol `https://ogp.me/#optional`; Next.js metadata API.
  **Recommended Agent Profile**: `quick` — metadata update
  **Parallelization**: Wave 10, Blocks: None, Blocked By: Tasks 37
  **QA Scenarios**:
  ```
  Scenario: Verify og:locale in HTML
    Tool: Bash (curl + grep)
    Steps: Run `curl -s http://localhost:3000/de | grep "og:locale"`
    Expected: og:locale="de_DE" present
    Evidence: .sisyphus/evidence/task-50-og-locale.txt
  ```
  **Commit**: YES — `seo(i18n): add og:locale to metadata`

---

### PHASE 3: Content & Polish (FR+ZH, Artwork CI, Codeberg mirror)

- [ ] 51. Add FR message file (messages/fr.json)

  **What to do**: Complete messages/fr.json with French translations of all UI strings (header, footer, cookieConsent, notFound, about, hero, sections). Use professional French.
  **Must NOT do**: Leave any key as English placeholder without TODO.
  **References**: messages/en.json for all keys; next-intl messages docs.
  **Recommended Agent Profile**: `writing` — French translation
  **Parallelization**: Wave 11, Blocks: Tasks 53, 55, 57, Blocked By: Phase 2 complete
  **QA Scenarios**:
  ```
  Scenario: Verify FR message file completeness
    Tool: Bash (node -p)
    Steps: Run `node -p "Object.keys(require('./messages/en.json')).length === Object.keys(require('./messages/fr.json')).length"`
    Expected: true (same key count)
    Evidence: .sisyphus/evidence/task-51-fr-messages.txt
  ```
  **Commit**: YES — `feat(i18n): add French message file`

- [ ] 52. Add ZH message file (messages/zh.json)

  **What to do**: Complete messages/zh.json with Chinese (Simplified) translations of all UI strings. Use professional Simplified Chinese.
  **Must NOT do**: Use Traditional Chinese; leave any key untranslated.
  **References**: messages/en.json for all keys.
  **Recommended Agent Profile**: `writing` — Chinese translation
  **Parallelization**: Wave 11, Blocks: Tasks 54, 56, 58, Blocked By: Phase 2 complete
  **QA Scenarios**:
  ```
  Scenario: Verify ZH message file completeness
    Tool: Bash (node -p)
    Steps: Run `node -p "Object.keys(require('./messages/en.json')).length === Object.keys(require('./messages/zh.json')).length"`
    Expected: true
    Evidence: .sisyphus/evidence/task-52-zh-messages.txt
  ```
  **Commit**: YES — `feat(i18n): add Chinese message file`

- [ ] 53. Translate Components to FR (1 article)

  **What to do**: Create content/fr/components/ with 1 French article translation. Use professional technical French.
  **Must NOT do**: Translate more than 1 article for v1 FR.
  **References**: content/en/components/.
  **Recommended Agent Profile**: `writing` — French translation
  **Parallelization**: Wave 11, Blocks: None, Blocked By: Tasks 51, 52
  **QA Scenarios**:
  ```
  Scenario: Verify FR Components article
    Tool: Playwright (e2e/components-fr.spec.ts)
    Steps: Navigate to /fr/components/, check 1 article with French content
    Expected: French article loads
    Evidence: .sisyphus/evidence/task-53-fr-components.png
  ```
  **Commit**: YES — `feat(i18n): add French Components translation`

- [ ] 54. Translate Components to ZH (1 article)

  **What to do**: Create content/zh/components/ with 1 Chinese article translation. Use professional technical Simplified Chinese.
  **Must NOT do**: Translate more than 1 article for v1 ZH.
  **References**: content/en/components/.
  **Recommended Agent Profile**: `writing` — Chinese translation
  **Parallelization**: Wave 11, Blocks: None, Blocked By: Tasks 51, 52
  **QA Scenarios**:
  ```
  Scenario: Verify ZH Components article
    Tool: Playwright (e2e/components-zh.spec.ts)
    Steps: Navigate to /zh/components/, check 1 article with Chinese content
    Expected: Chinese article loads
    Evidence: .sisyphus/evidence/task-54-zh-components.png
  ```
  **Commit**: YES — `feat(i18n): add Chinese Components translation`

- [ ] 55. Translate Architecture to FR (1 article)

  **What to do**: Create content/fr/architecture/ with 1 French article translation.
  **Must NOT do**: Translate more than 1 article.
  **References**: content/en/architecture/.
  **Recommended Agent Profile**: `writing` — French translation
  **Parallelization**: Wave 11, Blocks: None, Blocked By: Tasks 51, 52
  **QA Scenarios**:
  ```
  Scenario: Verify FR Architecture article
    Tool: Playwright (e2e/architecture-fr.spec.ts)
    Steps: Navigate to /fr/architecture/, check 1 article with French content
    Expected: French article loads
    Evidence: .sisyphus/evidence/task-55-fr-architecture.png
  ```
  **Commit**: YES — `feat(i18n): add French Architecture translation`

- [ ] 56. Translate Architecture to ZH (1 article)

  **What to do**: Create content/zh/architecture/ with 1 Chinese article translation.
  **Must NOT do**: Translate more than 1 article.
  **References**: content/en/architecture/.
  **Recommended Agent Profile**: `writing` — Chinese translation
  **Parallelization**: Wave 11, Blocks: None, Blocked By: Tasks 51, 52
  **QA Scenarios**:
  ```
  Scenario: Verify ZH Architecture article
    Tool: Playwright (e2e/architecture-zh.spec.ts)
    Steps: Navigate to /zh/architecture/, check 1 article with Chinese content
    Expected: Chinese article loads
    Evidence: .sisyphus/evidence/task-56-zh-architecture.png
  ```
  **Commit**: YES — `feat(i18n): add Chinese Architecture translation`

- [ ] 57. Translate Get Started to FR (1 article)

  **What to do**: Create content/fr/get-started/ with 1 French article translation.
  **Must NOT do**: Translate more than 1 article.
  **References**: content/en/get-started/.
  **Recommended Agent Profile**: `writing` — French translation
  **Parallelization**: Wave 11, Blocks: None, Blocked By: Tasks 51, 52
  **QA Scenarios**:
  ```
  Scenario: Verify FR Get Started article
    Tool: Playwright (e2e/getstarted-fr.spec.ts)
    Steps: Navigate to /fr/get-started/, check 1 article with French content
    Expected: French article loads
    Evidence: .sisyphus/evidence/task-57-fr-getstarted.png
  ```
  **Commit**: YES — `feat(i18n): add French Get Started translation`

- [ ] 58. Translate Get Started to ZH (1 article)

  **What to do**: Create content/zh/get-started/ with 1 Chinese article translation.
  **Must NOT do**: Translate more than 1 article.
  **References**: content/en/get-started/.
  **Recommended Agent Profile**: `writing` — Chinese translation
  **Parallelization**: Wave 11, Blocks: None, Blocked By: Tasks 51, 52
  **QA Scenarios**:
  ```
  Scenario: Verify ZH Get Started article
    Tool: Playwright (e2e/getstarted-zh.spec.ts)
    Steps: Navigate to /zh/get-started/, check 1 article with Chinese content
    Expected: Chinese article loads
    Evidence: .sisyphus/evidence/task-58-zh-getstarted.png
  ```
  **Commit**: YES — `feat(i18n): add Chinese Get Started translation`

- [ ] 59. SVG validation script (check well-formedness)

  **What to do**: Create scripts/validate-svg.mjs that validates all SVG files in public/static/. Check: well-formed XML (DOMParser), has <svg> root element, has viewBox or width/height attributes, file size < 500KB. Exit with code 1 on any validation failure. Add npm script: "validate:svg": "node scripts/validate-svg.mjs".
  **Must NOT do**: Modify SVG files; accept invalid SVGs.
  **References**: SVG spec for validation rules; Artwork repo SVG files.
  **Recommended Agent Profile**: `unspecified-high` — validation script with edge cases
  **Parallelization**: Wave 12, Blocks: Task 63, Blocked By: Task 13
  **QA Scenarios**:
  ```
  Scenario: Verify SVG validation script runs
    Tool: Bash (npm)
    Steps: Run `npm run validate:svg`
    Expected: Exit code 0, all SVGs pass
    Evidence: .sisyphus/evidence/task-59-validate.txt
  Scenario: Verify validation catches invalid SVG
    Tool: Bash
    Steps: Create invalid.svg (empty file), run validation, check exit code
    Expected: Exit code 1, error message about invalid SVG
    Evidence: .sisyphus/evidence/task-59-invalid.txt
  ```
  **Commit**: YES — `feat(artwork): add SVG validation script`

- [ ] 60. svgo optimization script (minify SVGs)

  **What to do**: Create scripts/optimize-svg.mjs that optimizes all SVG files using svgo. Install svgo as dev dependency. Config: remove comments, remove metadata, remove empty attrs, collapse groups, sort attributes. Write optimized files back to same location. Add npm script: "optimize:svg": "node scripts/optimize-svg.mjs".
  **Must NOT do**: Remove viewBox or important attributes; change visual appearance.
  **References**: svgo docs `https://github.com/svg/svgo`; svgo config options.
  **Recommended Agent Profile**: `unspecified-high` — svgo configuration with safety
  **Parallelization**: Wave 12, Blocks: Task 63, Blocked By: Task 13
  **QA Scenarios**:
  ```
  Scenario: Verify SVG optimization reduces size
    Tool: Bash
    Steps: Run `npm run optimize:svg`, compare file sizes before/after
    Expected: Optimized files are smaller (or same if already minimal)
    Evidence: .sisyphus/evidence/task-60-optimize.txt
  ```
  **Commit**: YES — `feat(artwork): add SVG optimization with svgo`

- [ ] 61. Palette check script (verify colors)

  **What to do**: Create scripts/check-palette.mjs that checks all SVG files use only allowed colors: #341291, #571EFA, #6B7280, #E5E7EB, #F3F4F6, #ffffff, #000000, #111827, #1f2937, transparent. Also allow gradient references. Exit with code 1 on any disallowed color. Add npm script: "check:palette": "node scripts/check-palette.mjs".
  **Must NOT do**: Flag valid color variations (shades, gradients); modify SVGs.
  **References**: Artwork palette from draft; SVG fill/stroke attributes.
  **Recommended Agent Profile**: `quick` — color validation
  **Parallelization**: Wave 12, Blocks: Task 63, Blocked By: Task 13
  **QA Scenarios**:
  ```
  Scenario: Verify palette check passes
    Tool: Bash (npm)
    Steps: Run `npm run check:palette`
    Expected: Exit code 0, all colors in allowed palette
    Evidence: .sisyphus/evidence/task-61-palette.txt
  ```
  **Commit**: YES — `feat(artwork): add palette color check script`

- [ ] 62. PNG export script (favicon, OG image from SVGs)

  **What to do**: Create scripts/export-png.mjs that generates PNG files from SVGs. Use sharp or resvg-js for conversion. Generate: favicon-16x16.png, favicon-32x32.png, icon-192.png, icon-512.png, og-image.png (1200x630). Add npm script: "export:png": "node scripts/export-png.mjs".
  **Must NOT do**: Use low quality resampling; skip any required size.
  **References**: Sharp docs `https://sharp.pixelplumbing.com/`; PWA icon requirements.
  **Recommended Agent Profile**: `quick` — PNG generation from SVGs
  **Parallelization**: Wave 12, Blocks: Task 63, Blocked By: Task 13
  **QA Scenarios**:
  ```
  Scenario: Verify PNG exports generated
    Tool: Bash (ls)
    Steps: Run `npm run export:png`, check public/static/brand/ for PNG files
    Expected: favicon-16x16.png, favicon-32x32.png, icon-192.png, icon-512.png, og-image.png
    Evidence: .sisyphus/evidence/task-62-png-exports.txt
  ```
  **Commit**: YES — `feat(artwork): add PNG export script from SVGs`

- [ ] 63. Artwork CI GitHub Action

  **What to do**: Create .github/workflows/artwork-ci.yml that runs on push to main when SVG files change. Steps: Checkout, Setup Node 20, Install dependencies, Run validate:svg, Run check:palette, Run optimize:svg, Run export:png, Commit changes (if any SVGs were optimized).
  **Must NOT do**: Run on every push (only when SVGs change); fail CI on optimization changes.
  **References**: GitHub Actions docs; Tasks 59-62 scripts.
  **Recommended Agent Profile**: `unspecified-high` — CI workflow with conditional triggers
  **Parallelization**: Wave 12, Blocks: None, Blocked By: Tasks 59-62
  **QA Scenarios**:
  ```
  Scenario: Verify artwork CI workflow syntax
    Tool: Bash (grep)
    Steps: Run `grep "validate:svg\|check:palette\|optimize:svg\|export:png" .github/workflows/artwork-ci.yml`
    Expected: All 4 scripts present
    Evidence: .sisyphus/evidence/task-63-artwork-ci.txt
  ```
  **Commit**: YES — `ci(artwork): add artwork validation and optimization CI`

- [ ] 64. Codeberg remote setup (git remote add codeberg)

  **What to do**: Add Codeberg as git remote: `git remote add codeberg git@codeberg.org:opendesk-edu/opendesk-edu-website.git`. Verify connection: `git remote -v`. Add README section about repository hosting (GitHub primary, Codeberg mirror).
  **Must NOT do**: Remove GitHub remote; push without verifying connection.
  **References**: Git remote docs; Codeberg SSH setup.
  **Recommended Agent Profile**: `quick` — git remote configuration
  **Parallelization**: Wave 13, Blocks: Tasks 65-66, Blocked By: Task 31
  **QA Scenarios**:
  ```
  Scenario: Verify Codeberg remote
    Tool: Bash (git)
    Steps: Run `git remote -v`
    Expected: codeberg remote pointing to git@codeberg.org:opendesk-edu/...
    Evidence: .sisyphus/evidence/task-64-codeberg-remote.txt
  ```
  **Commit**: YES — `chore: add Codeberg as git remote`

- [ ] 65. Mirror action (push to Codeberg on push to GitHub)

  **What to do**: Create .github/workflows/mirror.yml that pushes to Codeberg on push to main. Use GitHub Actions with SSH key (secrets.CODEBERG_SSH_KEY) to push. Steps: Checkout, Configure SSH, Push to Codeberg remote.
  **Must NOT do**: Push on pull request (main only); skip SSH key configuration.
  **References**: GitHub Actions mirror pattern; Codeberg SSH docs.
  **Recommended Agent Profile**: `unspecified-high` — SSH mirror workflow
  **Parallelization**: Wave 13, Blocks: None, Blocked By: Tasks 31, 64
  **QA Scenarios**:
  ```
  Scenario: Verify mirror workflow syntax
    Tool: Bash (grep)
    Steps: Run `grep "codeberg" .github/workflows/mirror.yml`
    Expected: Codeberg remote reference present
    Evidence: .sisyphus/evidence/task-65-mirror.txt
  ```
  **Commit**: YES — `ci: add GitHub to Codeberg mirror action`

- [ ] 66. Forgejo Actions sync (CI for Codeberg side)

  **What to do**: Create .forgejo/workflows/ci.yml for Codeberg CI. Mirror the GitHub CI workflow: lint, test, build. This ensures CI runs on both platforms.
  **Must NOT do**: Duplicate deploy workflow (deploy only from GitHub); skip lint/test steps.
  **References**: Forgejo Actions docs `https://forgejo.org/docs/latest/user/actions/`; GitHub CI workflow from Task 31.
  **Recommended Agent Profile**: `unspecified-high` — Forgejo Actions workflow
  **Parallelization**: Wave 13, Blocks: None, Blocked By: Tasks 31, 64
  **QA Scenarios**:
  ```
  Scenario: Verify Forgejo CI workflow syntax
    Tool: Bash (yamllint)
    Steps: Run `yamllint .forgejo/workflows/ci.yml`
    Expected: Valid YAML
    Evidence: .sisyphus/evidence/task-66-forgejo-ci.txt
  ```
  **Commit**: YES — `ci: add Forgejo Actions CI for Codeberg`

- [ ] 67. README update (setup instructions, contributing)

  **What to do**: Update README.md with: project description, tech stack (Next.js 16, React 19, TypeScript, Tailwind v4, next-intl), setup instructions (npm install, npm run dev), deployment (Docker, SSH deploy), content authoring (markdown in content/), contributing guidelines, license (Apache-2.0).
  **Must NOT do**: Include internal deployment credentials; skip license mention.
  **References**: Reference README; Draft — project description.
  **Recommended Agent Profile**: `writing` — README documentation
  **Parallelization**: Wave 13, Blocks: None, Blocked By: Task 31
  **QA Scenarios**:
  ```
  Scenario: Verify README sections
    Tool: Bash (grep)
    Steps: Run `grep -n "## " README.md`
    Expected: Sections: Setup, Development, Deployment, Content, Contributing, License
    Evidence: .sisyphus/evidence/task-67-readme.txt
  ```
  **Commit**: YES — `docs: update README with setup and contributing guide`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [ ] F1. **Plan Compliance Audit** — `oracle`

  **What to do**: Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.

  **Must NOT do**: Skip any Must Have check; ignore Must NOT Have violations.

  **Recommended Agent Profile**:
  - **Category**: `oracle`
    - Reason: High-level plan review with binary verdict
  - **Skills**: []
    - No special skills needed — plan review
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Final Wave (with F2, F3, F4)
  - **Blocks**: User approval (must get explicit "okay" before marking complete)
  - **Blocked By**: ALL implementation tasks (1-67) complete

  **References**: The plan file itself (.sisyphus/plans/opendesk-edu-website.md)

  **Acceptance Criteria**:
  - [ ] All Must Haves verified present (read file, curl endpoint, run command)
  - [ ] No Must NOT Have patterns found
  - [ ] Evidence files exist for all tasks
  - [ ] Deliverables match plan scope

  **QA Scenarios**:

  ```
  Scenario: Verify Must Have: Next.js 16
    Tool: Bash (grep)
    Steps: Run `grep -n "\"next\": \"16" package.json"`
    Expected: Line found with version 16.2.1
    Failure Indicators: Version missing or wrong
    Evidence: .sisyphus/evidence/F1-nextjs-version.txt

  Scenario: Verify Must Have: 4 content sections
    Tool: Bash (ls)
    Steps: Run `ls -d content/en/content/de/`
    Expected: directories: components, architecture, get-started, blog
    Failure Indicators: Missing section
    Evidence: .sisyphus/evidence/F1-content-sections.txt

  Scenario: Verify Must NOT Have: graphwiz branding
    Tool: Bash (grep)
    Steps: Run `grep -r "graphwiz" src/ public/ || true`
    Expected: No matches (empty grep output)
    Failure Indicators: graphwiz found (violation)
    Evidence: .sisyphus/evidence/F1-graphwiz-check.txt

  Scenario: Verify evidence files exist
    Tool: Bash (ls)
    Steps: Run `ls .sisyphus/evidence/ | wc -l`
    Expected: 50+ evidence files (one per task scenario)
    Failure Indicators: Missing evidence files
    Evidence: .sisyphus/evidence/F1-evidence-count.txt

  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`
  ```

  **Commit**: NO (verification only, no code changes)

- [ ] F2. **Code Quality Review** — `unspecified-high`

  **What to do**: Run `tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).

  **Must NOT do**: Skip any quality check; ignore linter warnings.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Comprehensive code quality review across all files
  - **Skills**: []
    - No special skills needed — standard tools
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Final Wave (with F1, F3, F4)
  - **Blocks**: User approval
  - **Blocked By**: ALL implementation tasks (1-67) complete

  **References**: ESLint config, TypeScript config, TSLint rules

  **Acceptance Criteria**:
  - [ ] TypeScript compilation succeeds (no errors)
  - [ ] ESLint passes (no errors)
  - [ ] All tests pass (Vitest + Playwright)
  - [ ] Zero `as any` or `@ts-ignore`
  - [ ] No console.log in prod (only in dev tools)
  - [ ] No empty catches
  - [ ] No commented-out code
  - [ ] No unused imports
  - [ ] No AI slop (excessive comments, generic names, over-abstraction)

  **QA Scenarios**:

  ```
  Scenario: Verify TypeScript compilation
    Tool: Bash (npx tsc)
    Steps: Run `npx tsc --noEmit`
    Expected: Exit code 0, no type errors
    Failure Indicators: Type errors found
    Evidence: .sisyphus/evidence/F2-tsc-errors.txt

  Scenario: Verify ESLint passes
    Tool: Bash (npm)
    Steps: Run `npm run lint`
    Expected: Exit code 0, no lint errors
    Failure Indicators: Lint errors found
    Evidence: .sisyphus/evidence/F2-lint-errors.txt

  Scenario: Verify all tests pass
    Tool: Bash (npm)
    Steps: Run `npm run test && npm run test:e2e`
    Expected: All tests pass
    Failure Indicators: Test failures
    Evidence: .sisyphus/evidence/F2-test-failures.txt

  Scenario: Check for as any
    Tool: Bash (grep)
    Steps: Run `grep -rn "as any" src/ --include="*.ts" --include="*.tsx" || true`
    Expected: No matches
    Failure Indicators: as any found
    Evidence: .sisyphus/evidence/F2-as-any.txt

  Scenario: Check for console.log
    Tool: Bash (grep)
    Steps: Run `grep -rn "console.log" src/ --include="*.ts" --include="*.tsx" || true`
    Expected: No matches (or only in test files)
    Failure Indicators: console.log in prod code
    Evidence: .sisyphus/evidence/F2-console-log.txt

  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`
  ```

  **Commit**: NO (verification only)

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)

  **What to do**: Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.

  **Must NOT do**: Skip any QA scenario; assume features work without testing.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Hands-on QA execution, cross-task integration testing
  - **Skills**: [`playwright`] (for UI testing)
    - `playwright`: Browser automation for UI tests
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Final Wave (with F1, F2, F4)
  - **Blocks**: User approval
  - **Blocked By**: ALL implementation tasks (1-67) complete

  **References**: All task QA scenarios in the plan

  **Acceptance Criteria**:
  - [ ] ALL task QA scenarios executed
  - [ ] Evidence captured for every scenario (screenshots, terminal output, API responses)
  - [ ] Cross-task integration tested (features work together)
  - [ ] Edge cases tested (empty state, invalid input, rapid actions)
  - [ ] No unhandled errors in console during testing

  **QA Scenarios**:

  ```
  Scenario: Execute all homepage QA scenarios
    Tool: Playwright (re-run all homepage tests)
    Steps: Run task-24 scenarios (hero, sections, latest posts)
    Expected: All scenarios pass
    Failure Indicators: Any scenario fails
    Evidence: .sisyphus/evidence/final-qa/homepage.png

  Scenario: Execute all navigation QA scenarios
    Tool: Playwright (re-run all nav tests)
    Steps: Run task-15 scenarios (header, mobile menu, theme toggle)
    Expected: All scenarios pass
    Failure Indicators: Navigation broken
    Evidence: .sisyphus/evidence/final-qa/navigation.png

  Scenario: Execute all i18n QA scenarios
    Tool: Playwright (test EN, DE, FR, ZH)
    Steps: Run all i18n tasks scenarios (34-43 locale routing, 44-50 translations)
    Expected: All locales work
    Failure Indicators: Locale switching fails, missing translations
    Evidence: .sisyphus/evidence/final-qa/i18n.png

  Scenario: Execute all article QA scenarios
    Tool: Playwright (re-run all article tests)
    Steps: Run task-22 scenarios (article load, 404, TOC)
    Expected: Articles load correctly, TOC works, 404 handles
    Failure Indicators: Article pages broken
    Evidence: .sisyphus/evidence/final-qa/articles.png

  Scenario: Test cross-task integration
    Tool: Playwright (user flow test)
    Steps: Navigate home → click Components → click article → go back → click Blog → click post → change theme → change language to DE
    Expected: Full user flow works without errors
    Failure Indicators: Flow breaks at any point
    Evidence: .sisyphus/evidence/final-qa/integration.png

  Scenario: Test edge cases
    Tool: Playwright (edge case tests)
    Steps: Navigate to non-existent page → empty blog section → rapid theme toggles → invalid article slug
    Expected: All edge cases handled gracefully (404, empty state, no errors)
    Failure Indicators: Edge case causes errors
    Evidence: .sisyphus/evidence/final-qa/edge-cases.png

  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`
  ```

  **Commit**: NO (verification only)

- [ ] F4. **Scope Fidelity Check** — `deep`

  **What to do**: For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.

  **Must NOT do**: Skip any task diff review; ignore scope creep; miss cross-task contamination.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Thorough scope verification across all 67 tasks
  - **Skills**: []
    - No special skills needed — git diff review
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Final Wave (with F1-F3)
  - **Blocks**: User approval
  - **Blocked By**: ALL implementation tasks (1-67) complete

  **References**: The plan file; git history; git diff

  **Acceptance Criteria**:
  - [ ] Every task's "What to do" items are in implementation
  - [ ] No implementation beyond spec (no scope creep)
  - [ ] All "Must NOT do" items not violated
  - [ ] Zero cross-task contamination (Task N stayed in its files)
  - [ ] Zero unaccounted changes (every change tracked to a task)

  **QA Scenarios**:

  ```
  Scenario: Verify Task 1 implementation
    Tool: Bash (git)
    Steps: Run `git log --oneline -1` to find commit, run `git show --stat <commit>`
    Expected: Package.json, package-lock.json, .gitignore created/modified
    Failure Indicators: Unexpected files or missing files
    Evidence: .sisyphus/evidence/F4-task1-scope.txt

  Scenario: Verify Task 9 content system implementation
    Tool: Bash (git)
    Steps: Run `git log --grep="content system" --oneline -1`, run `git show --stat <commit>`
    Expected: src/lib/content.ts, src/lib/__tests__/content.test.ts modified
    Failure Indicators: Missing or extra files
    Evidence: .sisyphus/evidence/F4-task9-scope.txt

  Scenario: Verify no scope creep
    Tool: Bash (git)
    Steps: Run `git diff HEAD~67..HEAD --stat | awk '{sum += $2} END {print sum}'` (total lines changed)
    Expected: Lines match planned scope (not wildly over)
    Failure Indicators: Excessive changes indicating scope creep
    Evidence: .sisyphus/evidence/F4-scope-creep.txt

  Scenario: Check for cross-task contamination
    Tool: Bash (git)
    Steps: Run `git log --oneline | grep "Task [0-9]*Task [1-9]"` (check for commits that span multiple unrelated tasks)
    Expected: Each commit focuses on one task
    Failure Indicators: Commits span unrelated tasks (contamination)
    Evidence: .sisyphus/evidence/F4-contamination.txt

  Scenario: Verify no unaccounted changes
    Tool: Bash (git)
    Steps: Run `git status` (ensure working tree clean)
    Expected: No uncommitted changes (all accounted for)
    Failure Indicators: Uncommitted files found
    Evidence: .sisyphus/evidence/F4-unaccounted.txt

  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

### Commit Patterns

- **feat**: New feature (e.g., `feat(i18n): add middleware for locale routing`)
- **fix**: Bug fix (e.g., `fix(content): resolve markdown parsing error with special chars`)
- **chore**: Build configuration, dependencies, scripts (e.g., `chore(deps): upgrade Next.js to 16.2.1`)
- **test**: Test-only changes (e.g., `test(content): add unit tests for markdown parser`)
- **docs**: Documentation changes (e.g., `docs: update README with setup instructions`)
- **refactor**: Code refactoring without behavior change (e.g., `refactor(content): extract markdown parser to separate module`)

### Atomic Commits

Each commit in this plan is **independently deployable**:
- Commits pass `npm run lint && npm run test && npm run build` individually
- Each commit represents one coherent logical change (not a blob of unrelated changes)
- No commit is partially broken — the app builds and runs after every commit

### Commit Groups

Some tasks are grouped into single commits when they are tightly coupled:
- **Task 15 (Header)** → Single commit: Header.tsx + Header.test.tsx + e2e test
- **Task 16 (Footer)** → Single commit: Footer.tsx + Footer.test.tsx + e2e test
- **Task 22 (ArticlePage)** → Single commit: ArticlePage.tsx + ArticlePage.test.tsx + e2e test

### Commit Sequence

The plan specifies "Commit: YES" or "Commit: NO" for each task:
- **YES**: Create a commit after this task completes
- **NO**: No standalone commit (part of larger commit group, or verification-only task)

### Example Commit Messages

```bash
# Task 1: Project scaffolding
feat: initialize Next.js 16 project with TypeScript, Tailwind v4, Vitest, Playwright

- Initialize Next.js with npx create-next-app@latest
- Configure TypeScript strict mode
- Setup Tailwind v4 with CSS custom properties for theming
- Add Vitest for unit testing (jsdom)
- Add Playwright for e2e testing
- Configure ESLint with TypeScript rules
- Create .gitignore for Node.js
- Add README with project description

Files: package.json, package-lock.json, tsconfig.json, next.config.ts, tailwind.config.ts, vitest.config.ts, playwright.config.ts, .gitignore, README.md

Tests pass: 0/0 (no tests yet)
Build succeeds: YES

# Task 15: Header component
feat: add Header component with sticky nav, mobile hamburger, theme toggle

- Create Header.tsx with site logo and navigation links
- Implement mobile hamburger menu with toggle state
- Add ThemeProvider integration for dark/light mode switcher
- Add responsive layout (hidden on mobile, visible on desktop)
- Create Header.test.tsx with Vitest snapshots
- Create e2e/header.spec.ts for Playwright testing

Files: src/components/Header.tsx, src/components/__tests__/Header.test.tsx, e2e/header.spec.ts

Tests pass: 3/3 unit tests, 4/4 e2e tests
Build succeeds: YES

# Task 34: i18n middleware
feat(i18n): add middleware for locale routing

- Create src/middleware.ts with next-intl middleware
- Configure locale detection from URL path (/en/, /de/, /fr/, /zh/)\n- Redirect root (/) to /en/\n- Add Accept-Language header detection for automatic locale suggestion\n- Ensure static assets and API routes bypass middleware\n\nFiles: src/middleware.ts\n\nTests pass: 2/2 e2e tests (middleware.spec.ts)\nBuild succeeds: YES
```

---

## Success Criteria

### Verification Commands

```bash
# TypeScript compilation (no type errors)
npx tsc --noEmit
# Expected: Exit code 0, no output (clean compilation)

# Linting (ESLint passes)
npm run lint
# Expected: Exit code 0, no errors/warnings

# Unit tests (Vitest)
npm run test
# Expected: All tests pass, coverage report generated

# E2E tests (Playwright)
npx playwright test
# Expected: All tests pass, screenshots captured in .sisyphus/evidence/

# Production build
npm run build
# Expected: Exit code 0, .next/ directory created, static routes generated

# Start production server
npm start
# Expected: Server starts on port 3000, homepage loads

# Docker build
docker build -t opendesk-edu:test .
# Expected: Build succeeds without errors, image created

# Docker run (smoke test)
docker run --rm -p 3001:3000 opendesk-edu:test
# Expected: Server starts, accessible at http://localhost:3001

# SVG validation (artwork CI)
npm run validate:svg
# Expected: All SVGs valid, exit code 0

# Palette check (artwork CI)
npm run check:palette
# Expected: All colors in allowed palette, exit code 0

# SVG optimization (artwork CI)
npm run optimize:svg
# Expected: SVGs optimized, exit code 0

# PNG exports (artwork CI)
npm run export:png
# Expected: PNGs generated (favicon-16x16.png, favicon-32x32.png, icon-192.png, icon-512.png, og-image.png)
```

### Final Checklist

- [ ] All "Must Have" deliverables present (Next.js 16, 4 content sections, purple palette, artwork assets, SEO features, analytics, Docker, CI/CD)
- [ ] All "Must NOT Have" guardrails respected (no graphwiz branding, no blue accent color, no export mode, no next-intl before i18n layer)
- [ ] All automated tests pass (Vitest + Playwright)
- [ ] TypeScript compilation succeeds (no type errors)
- [ ] ESLint passes (no linting errors)
- [ ] Production build succeeds
- [ ] Docker image builds successfully
- [ ] All evidence files captured in `.sisyphus/evidence/` (one per QA scenario)
- [ ] All 4 languages supported (EN, DE, FR, ZH) with message files and content
- [ ] Homepage works in all languages (nav, hero, sections, footer)
- [ ] Article pages work (load, 404, TOC, back link)
- [ ] Theme toggle works (dark/light mode, localStorage persistence)
- [ ] Cookie consent works (accept/decline, Plausible + Clarity lazy-load)
- [ ] SEO features work (sitemap, robots.txt, RSS feed, JSON-LD, hreflang, OG tags)
- [ ] Artwork CI pipeline works (SVG validation, optimization, palette check, PNG export)
- [ ] GitHub Actions CI runs successfully (lint, test, build)
- [ ] Deploy workflow works (SSH to server, docker compose up)
- [ ] Codeberg mirror works (push from GitHub to Codeberg)
- [ ] No scope creep (implementation matches plan exactly)
- [ ] No cross-task contamination (tasks stayed in their files)
- [ ] All QA scenarios from plan executed and verified

### Definition of Done

This work is **COMPLETE** when:
1. All 67 implementation tasks are finished and committed
2. All 4 final verification tasks (F1-F4) are complete and pass
3. User has reviewed verification results and explicitly approved ("okay")
4. Working tree is clean (no uncommitted changes)
5. All tests pass (unit + e2e)
6. Production build succeeds
7. Docker image builds and runs


