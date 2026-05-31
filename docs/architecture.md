# Architecture Guide

This document describes the architecture, routing, data flow, and key design decisions of the openDesk Edu website.

## Tech Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16.2 (App Router, `output: standalone`) | SSR, static generation, API routes |
| UI | React 19 + Tailwind CSS v4 | Component rendering, styling |
| Language | TypeScript (strict mode) | Type safety throughout |
| i18n | next-intl | Internationalization (4 locales) |
| Content | Markdown + gray-matter + remark | Blog posts, docs, component pages |
| Testing | Vitest (unit) + Playwright (e2e) | Test coverage |
| CI/CD | Forgejo Actions | Lint, test, build, deploy |
| Runtime | Docker (node:20-alpine) | Containerized deployment |
| Reverse proxy | Traefik | TLS, routing, middleware |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # i18n route segment
│   │   ├── [section]/      # Content section (components, architecture, get-started, blog)
│   │   │   ├── [slug]/     # Individual article page
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx    # Section listing page
│   │   ├── about/
│   │   ├── imprint/
│   │   ├── privacy/
│   │   ├── rss/            # RSS feed route
│   │   └── layout.tsx      # Root layout per locale (header, footer, search)
│   ├── api/
│   │   ├── contact/        # Contact form handler (nodemailer)
│   │   ├── health/         # Health check endpoint
│   │   ├── search/         # Full-text search API
│   │   └── subscribe/      # Newsletter subscription proxy (listmonk)
│   ├── feed.xml/           # Static RSS feed
│   └── robots.txt/
├── components/             # Shared React components
├── hooks/                  # Shared React hooks (useDebounce)
├── lib/                    # Utilities, content loading, config
├── i18n/                   # next-intl routing configuration
└── test/                   # Test setup and utilities

content/                    # Markdown content by locale
messages/                   # i18n translation JSON files
public/static/              # Static assets (icons, brand, blog images)
```

## Routing Architecture

The site uses Next.js 16 App Router with the following segment structure:

```
/[locale]/[section]/[slug]
```

- **`[locale]`**: `en`, `de`, `fr`, `zh` — determined by next-intl's routing
- **`[section]`**: `components`, `architecture`, `get-started`, `blog` — defined in `src/lib/config.ts`
- **`[slug]`**: The article slug derived from the markdown filename or `slug:` frontmatter

### Route Hierarchy

```
/[locale]/                        → Home page (hero, latest posts from all sections)
/[locale]/[section]               → Section listing (paginated, filterable)
/[locale]/[section]/[slug]        → Article page (breadcrumbs, content, related posts)
/[locale]/about                   → About page
/[locale]/imprint                 → Legal imprint
/[locale]/privacy                 → Privacy policy
/[locale]/rss                     → RSS feed (XML)
/api/health                       → Health check (JSON)
/api/contact                      → Contact form (POST)
/api/subscribe                    → Newsletter subscribe (POST)
/api/search                       → Full-text search (GET)
/robots.txt                       → Robots exclusion
/sitemap.xml                      → Sitemap
/feed.xml                         → RSS feed (static XML)
```

### Static vs Dynamic Routes

| Route | Generation | Reason |
|-------|-----------|--------|
| `/[locale]/[section]` | Dynamic (ISR) | Content changes on markdown updates |
| `/[locale]/[section]/[slug]` | Dynamic (ISR) | Content changes on markdown updates |
| `/[locale]/about` | Static | Static content |
| `/[locale]/imprint` | Static | Static content |
| `/[locale]/privacy` | Static | Static content |
| `/api/*` | Dynamic | Server-side logic |
| `/feed.xml` | Static | Generated at build time |

Note: The site currently uses `output: standalone` with dynamic rendering for content pages. Static generation is used for the RSS feed. `output: standalone` is required because the app uses `fs` to read markdown files at runtime.

## Content System

### Data Flow

```
content/{locale}/{section}/{slug}.md
            │
            ▼
      gray-matter ──→ frontmatter (PostMeta)
            │
            ▼
        remark ──→ HTML (rehype-slug, rehype-stringify)
            │
            ▼
      buildPost() ──→ Post object
            │
            ▼
      React components (ArticlePage, PostCard, etc.)
```

### Post Type

Defined in `src/lib/content.ts`:

```typescript
interface PostMeta {
  title: string;
  date: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  slug?: string;          // Override filename-based slug
  image?: string;         // Hero image path (e.g., /static/blog/teaser.png)
  draft?: boolean;
  version?: string;       // Software version (for component pages)
}

interface Post extends PostMeta {
  htmlContent: string;    // Pre-rendered HTML from remark
  slug: string;           // Resolved from filename or frontmatter override
  section: string;        // Section this post belongs to
  readingTime: number;    // Calculated from word count / 200
}
```

### Content Loading

- **`getPostBySlug(section, slug, locale)`**: Fast path (direct filename match) → fallback scan
- **`getPostsBySection(section, locale)`**: All non-draft posts in a section, sorted by date desc
- **`getAllPosts(locale)`**: Aggregates all sections

Posts with `draft: true` in frontmatter are excluded from listing and direct access.

### Frontmatter Example

```yaml
---
title: "Article Title"
date: "2026-04-15"
description: "Brief description for meta/preview."
categories: ["category-one", "category-two"]
tags: ["tag-one", "tag-two"]
image: "/static/blog/teaser.png"
draft: false
version: "24.04"
---
```

## Internationalization

### Locale Support

- **4 locales**: `en` (English), `de` (Deutsch), `fr` (Français), `zh` (中文)
- **Messages**: JSON files in `messages/{locale}.json` using next-intl ICU syntax
- **Content**: Markdown files in `content/{locale}/{section}/`
- **Routing**: Handled by next-intl's `routing.ts` — rewrites `/en/...` → `/...` for default locale

### Adding a New Locale

1. Create `content/{new-locale}/` with the same section structure
2. Create `messages/{new-locale}.json` with all required keys
3. Add the locale to next-intl's routing configuration
4. Translate all content files

## Component Architecture

### Component Categories

1. **Layout components**: `Header`, `Footer`, `ThemeProvider`
2. **Content display**: `ArticlePage`, `PostCard`, `PostList`, `RelatedPosts`
3. **Interactive**: `SearchDialog`, `ContactForm`, `CookieConsent`, `ShareButtons`
4. **Navigation**: `LanguageSwitcher`, `ScrollToTop`, `TableOfContents`
5. **Infrastructure**: `ErrorBoundary`, `SearchContext`

### State Management

- **No global state store** — the app uses React context sparingly:
  - `SearchContext`: Manages search dialog open/close state
  - `ThemeProvider`: Manages dark/light theme toggle
- Component state is local via `useState` / `useCallback`

### Search

The search system works as follows:

1. User opens search dialog (`⌘K` or search icon)
2. Frontend fetches `GET /api/search?q=query`
3. API route scans all content files, matches against title/description/tags
4. Returns results grouped by section with images and slugs
5. SearchDialog displays results with debounced input (200ms)

### Search Result Type

```typescript
interface SearchEntry {
  title: string;
  description: string;
  slug: string;
  section: string;
  locale: string;
  image?: string;
}
```

## Styling System

### Tailwind CSS v4

The project uses Tailwind CSS v4 with a custom design token system:

- **CSS variables** in `globals.css` define brand colors, spacing, typography
- **Dark mode** via `class` strategy (Tailwind `dark:` variant)
- **Utility-first** approach — no custom CSS unless absolutely necessary

### Key Design Tokens

Defined in `src/app/globals.css`:

```css
:root {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.13 0.028 261.69);
  --color-primary: oklch(0.51 0.262 276.97);
  --color-border: oklch(0.87 0.01 258.34);
  /* ... expanded in globals.css */
}
```

## SEO & Structured Data

Per-page metadata includes:

- OpenGraph tags (title, description, image, type)
- Twitter card tags
- BreadcrumbList JSON-LD (article and section pages)
- SearchAction JSON-LD (sitelinks search box)
- Article meta tags (published_time, author, section, tags)
- RSS auto-discovery link in `<head>`

## RSS Feed

The RSS feed is generated statically at build time (`/feed.xml`) and dynamically per locale (`/[locale]/rss`). It includes:

- All non-draft posts across all sections
- `media:content` tags for post images
- Full content HTML
- Proper XML escaping and CDATA sections

## Deployment

### CI/CD Pipeline

```
Push to main → Forgejo Actions → 
  1. Lint (ESLint)
  2. Format check (Prettier)
  3. Type check (tsc)
  4. Unit tests (Vitest)
  5. Build (next build)
  6. Bundle size check
  7. Deploy via SSH to production
  8. Smoke test (curl HTTP 200)
```

### Docker

The Docker image uses a 3-stage build:
1. **deps**: Install production dependencies
2. **builder**: Build the Next.js application
3. **runner**: Minimal production image with standalone output

Key Dockerfile features:
- `node:20-alpine` base image
- `USER nextjs` for security
- `HEALTHCHECK` hitting `/api/health` every 30s
- Image tagged with both `latest` and commit SHA
- BuildKit disabled on production (`DOCKER_BUILDKIT=0`) due to `runc adduser` compatibility

### Production Infrastructure

- **Host**: Single server at 178.254.31.104
- **Reverse proxy**: Traefik with Let's Encrypt automatic TLS
- **Networking**: Docker `traefik-web` network
- **CI/CD runner**: Forgejo Actions with SSH deployment
- **Git mirrors**: Codeberg (origin) + GitHub (deploy target)

## Local Development

```bash
git clone <repo>
npm install
cp .env.example .env.local  # Configure environment
npm run dev                  # → http://localhost:3000
```

### Test Suite

```bash
npm test           # Unit tests (Vitest)
npm run build      # Verify production build
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `output: standalone` | Required because `fs` module reads markdown at runtime |
| No CMS | Content lives in git for version control, review workflows, and offline editing |
| Markdown over MDX | Simpler authoring; interactive components not needed for current content |
| Dynamic rendering | Content pages are dynamic (not SSG) — content changes without rebuild |
| next-intl segments | URL paths include locale (`/en/blog/...`) for clarity and SEO |
| Docker over PaaS | Self-hosted control; server already runs other services on same infra |
