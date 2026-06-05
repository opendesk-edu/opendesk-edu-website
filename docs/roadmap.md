# opendesk-edu-website — Product Roadmap

> **Status:** Living document — updated June 2026
> **Site:** [opendesk-edu.org](https://opendesk-edu.org) — 4 locales (en, de, fr, zh)
> **Stack:** Next.js 16.2, TypeScript, Tailwind 4, next-intl, Docker, Traefik

---

## Executive Summary

The opendesk-edu website is the public face of the openDesk Edu project — a multilingual static/dynamic site serving documentation, component catalog, blog, and project information. It's deployed and operational. The roadmap focuses on four sequential epics: **Content Parity**, **Content & UX**, **Technical Foundation**, and **Operations & Community**.

### Current State (June 2026)

| Metric | Value |
|:-------|:------|
| Test suites | 17 (135 tests, all passing) |
| Locales | en, de, fr, zh |
| Blog posts (EN) | 9 |
| Component docs (EN) | 36 |
| Architecture docs | 1 |
| CI/CD | Forgejo + GitHub Actions, Docker deploy |
| Uptime | Container-based, Traefik, systemd timer |

---

## Epic 1: Content Parity

**Goal:** All 4 locales reach full content coverage matching EN.

### Why

The site's value is proportional to how many locales have complete content. DE/FR/ZH are missing component translations and blog articles, creating an uneven experience for non-English visitors.

### Sprint 1.1 — Component Translations (DE)

| Task | Current | Target |
|:-----|:--------|:-------|
| DE component MDX files | 26/36 | 36/36 |
| Verify frontmatter, images, links | Partial | Complete |
| DE component sidebar/nav | OK | OK |

Translate the 10 missing component pages: overleaf, kasmvnc, jupyterhub, open-webui, code-server, dask, ollama, rstudio, ttyd, slidev. Each is an MDX file in `content/de/components/` with frontmatter matching the EN original.

### Sprint 1.2 — Component Translations (FR, ZH)

| Task | Current | Target |
|:-----|:--------|:-------|
| FR component MDX files | 26/36 | 36/36 |
| ZH component MDX files | 26/36 | 36/36 |

Same 10 components, translated to French and Chinese.

### Sprint 1.3 — Blog Translation Gap

| Task | Current | Target |
|:-----|:--------|:-------|
| FR blog posts | 8/9 | 9/9 |
| ZH blog posts | 8/9 | 9/9 |

Translate the progress report article (`progress-report-june-2026.md`, currently EN+DE only) to FR and ZH.

### Sprint 1.4 — Translation Workflow

- Create a `scripts/check-locale-parity.mjs` that reports gaps per section per locale
- Add locale parity check to CI (non-blocking warning)
- Document translation workflow in `CONTRIBUTING.md`

**Deliverable:** All 4 locales at 36/36 components, 9/9 blog posts.

---

## Epic 2: Content & UX

**Goal:** Richer content discovery, better search, interactive component catalog.

### Sprint 2.1 — Component Catalog Improvements

- Add search/filter bar to `/components` page (filter by name, category, tags)
- Add category groupings (LMS, Collaboration, Infrastructure, Scientific Computing)
- Show status badges more prominently (Stable/Beta/Planned)
- Add version history indicators for each component

**Files:** `src/components/ComponentGrid.tsx`, `src/app/[locale]/[section]/page.tsx`

### Sprint 2.2 — Enhanced Search

- Build a faceted search UI for the existing `/api/search` endpoint
- Add keyboard navigation to search results (↑↓ to navigate, Enter to open)
- Search across all locales with language-aware ranking
- Add search result snippets with highlighted matches

**Files:** `src/components/SearchDialog.tsx`, `src/app/api/search/route.ts`

### Sprint 2.3 — Navigation & Discovery

- Add tag cloud / tag index page (`/blog/tags`) with post counts
- Add "popular tags" sidebar widget to blog listing
- Add breadcrumb navigation to all section listing pages
- Implement paginated blog listing (show 9 per page, load more)

**Files:** `src/components/TagCloud.tsx`, `src/app/[locale]/[section]/page.tsx`

### Sprint 2.4 — Newsletter & Contact

- Wire newsletter subscription to the running Listmonk instance
- Add "subscribe to comments" per article
- Improve contact form with better validation, rate limiting, confirmation
- Add newsletter signup CTA in article footer

**Files:** `src/components/Footer.tsx`, `src/app/api/subscribe/route.ts`

### Sprint 2.5 — Rich Content

- Add code syntax highlighting to blog posts (rehype-pretty-code or shiki)
- Add image lightbox/gallery for screenshots in articles
- Add "copy code block" button to code fences
- Support Mermaid diagrams in MDX for architecture docs

**Deliverable:** Searchable component catalog, faceted search, better navigation, newsletter live.

---

## Epic 3: Technical Foundation

**Goal:** Top Lighthouse scores, excellent Core Web Vitals, bulletproof a11y.

### Sprint 3.1 — Performance

- `next/image` optimization audit — ensure all images use correct sizes, formats
- Add AVIF support with JPEG fallback in image pipeline
- Implement streaming SSR for hero/content below fold
- Audit and reduce JS bundle size (code splitting, dynamic imports)
- Add resource hints (preload, preconnect) for critical assets

**Target:** Lighthouse Performance ≥ 95 on mobile, ≥ 98 on desktop.

### Sprint 3.2 — Accessibility

- Run full axe-core audit on all page types (home, listing, article, about)
- Fix any violations (focus management, ARIA labels, color contrast)
- Add skip-link verification, keyboard navigation for all interactive components
- Add reduced-motion media query coverage throughout
- Test with screen readers (VoiceOver, NVDA)

**Target:** Lighthouse Accessibility ≥ 98.

### Sprint 3.3 — PWA & Offline

- Add Service Worker with offline fallback page
- Add Web App Manifest (already exists — verify/update)
- Add iOS splash screen and app icons
- Implement basic offline support for blog content (cached on read)
- Add `beforeinstallprompt` handling

### Sprint 3.4 — SEO & Structured Data

- Audit all pages for meta descriptions, OG tags, canonical URLs
- Add BreadcrumbList JSON-LD to all pages (not just articles)
- Add FAQPage and HowTo structured data where applicable
- Add `hreflang` annotation verification for all locales
- Generate RSS feed per locale (currently only EN)

### Sprint 3.5 — Image & Media Pipeline

- Build SVG→PNG automation (already script exists — extend for teasers)
- Auto-generate OG images from article frontmatter
- Add blur placeholder generation pipeline (already have `BLUR_TEASER`)
- Implement responsive image srcsets for all content images

**Deliverable:** Lighthouse scores ≥ 95/98/98 Performance/Accessibility/SEO, PWA ready.

---

## Epic 4: Operations & Community

**Goal:** Robust CI/CD, content workflows, community engagement.

### Sprint 4.1 — CI/CD Hardening

- Add Forgejo Actions deploy secrets validation (fail early if missing)
- Add smoke test after deploy with HTTP status + content check
- Add automatic rollback on smoke test failure
- Set up deployment notifications (ntfy.sh already wired — verify)
- Add container health check improvements

### Sprint 4.2 — Content Validation

- Extend `scripts/validate-content.mjs` to check:
  - All internal links resolve within the site
  - No broken image references
  - Frontmatter fields are valid for each section type
  - Locale parity (matching files across locales)
- Add validation to CI pipeline (blocking on errors, warning on gaps)

### Sprint 4.3 — Monitoring & Observability

- Add Plausible dashboard access documentation
- Set up uptime monitoring (checkly or similar)
- Add Grafana dashboard for site metrics (if running on same infra)
- Implement real-user monitoring (RUM) with `performance.getEntriesByType('navigation')`

### Sprint 4.4 — Community Features

- Add contributor guide (`CONTRIBUTING.md` exists — review and update)
- Add changelog page (`CHANGELOG.md` exists — link it)
- Add events/announcements section for conference talks, releases
- Create deployment showcase page (who's running openDesk Edu)
- Add interactive deployment planner (which services, which storage, SSO options)

### Sprint 4.5 — Documentation Expansion

- Expand architecture docs beyond the single current page
- Add deployment guide for different scenarios (single-server, HA, cloud)
- Add operator runbook (backup restore, cert renewal, upgrade procedure)
- Add FAQ section based on user inquiries

**Deliverable:** Self-healing CI/CD, complete content validation, community pages.

---

## Timeline

| Epic | Sprints | Target | Dependency |
|:-----|:--------|:-------|:-----------|
| **1. Content Parity** | 4 (1.1–1.4) | July 2026 | None |
| **2. Content & UX** | 5 (2.1–2.5) | August 2026 | None (parallel to 3) |
| **3. Technical Foundation** | 5 (3.1–3.5) | August 2026 | None (parallel to 2) |
| **4. Operations & Community** | 5 (4.1–4.5) | September 2026 | Epic 1 complete |

Epics 2 and 3 can run in parallel since they touch different parts of the codebase. Epic 4 depends on Epic 1 because content validation scripts reference the full locale set.

---

## Appendix: Current Content Inventory

### By Locale

| Section | EN | DE | FR | ZH | Target |
|:--------|:---|:---|:---|:---|:-------|
| Blog | 9 | 9 | 8 | 8 | 9 |
| Components | 36 | 26 | 26 | 26 | 36 |
| Docs | 1 | 1 | 1 | 1 | 5+ |

### Missing Components (DE/FR/ZH)

overleaf, kasmvnc, jupyterhub, open-webui, code-server, dask, ollama, rstudio, ttyd, slidev
