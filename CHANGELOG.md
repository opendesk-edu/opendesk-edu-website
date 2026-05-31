# Changelog

All notable changes to the openDesk Edu website are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Contact form modal with SMTP-backed API route (`/api/contact`)
- Newsletter subscription input with listmonk proxy (`/api/subscribe`)
- Matrix community link in footer (`matrix.to/#opendesk-edu:matrix.org`)
- Deploy failure notification via ntfy.sh
- Architecture guide (`docs/architecture.md`)
- Component reference (`docs/components.md`)

## [Sprint 7] — 2026-05-27

### Added
- StatusBadge component (Stable/Beta/Planned) with color-coded styling
- ComponentGrid for categorized service overview
- `version` field to Post type and frontmatter across 23 component pages
- Version badge display on ArticlePage and PostCard
- SearchDialog pagination (5 per section + "Show all" button)
- CONTRIBUTING.md
- .env.example (with gitignore negation)
- BreadcrumbList structured data on section pages

### Changed
- Enhanced prose table styling in article content
- RSS auto-discovery link in layout `<head>`
- JSON-LD SearchAction for Google Sitelinks Search Box

## [Sprint 6] — 2026-05-26

### Added
- ShareButtons component (Copy Link, X, LinkedIn, Matrix)
- Author byline ("By openDesk Edu") on ArticlePage
- next/image integration for blog teasers (PostCard, RelatedPosts, ArticlePage)
- Bundle size check in CI
- Scheduled uptime cron (30-minute interval)
- Docker image tagging with commit SHA

### Changed
- PostCard and RelatedPosts use next/image instead of `<img>`
- CI workflow tracks bundle output size

## [Sprint 5] — 2026-05-25

### Added
- Reading time calculation and display (PostCard, ArticlePage)
- RSS feed icon in footer with i18n labels
- Article meta tags (article:published_time, article:author, article:section, article:tag)

## [Sprint 4] — 2026-05-24

### Added
- OG image support in generateMetadata (post.image → og:image)
- media:content image tags in RSS feed
- Image field in SearchEntry type + thumbnail display in SearchDialog
- 8 translation files (DE: security-compliance, why-open-source; FR: 3 missing posts; ZH: 3 missing posts)
- Smoke test step in deploy workflow
- Blog pagination (10 per page with prev/next)
- Related posts by shared tags (3 max)
- Breadcrumb JSON-LD structured data on article pages

### Fixed
- Language switch bug on catch-all routes (was using pattern key `[...slug]` instead of actual path)

## [Sprint 3] — 2026-05-23

### Added
- Content-Security-Policy headers in next.config.ts
- Dockerfile optimization (combined layers, HEALTHCHECK)
- Bundle size threshold warnings in CI
- Server response time test in CI
- Prettier config + format check in CI
- renovate.json for automated dependency updates
- `/api/health` endpoint
- Tag/category filter UI in PostList
- useDebounce hook + debounced search
- Subscribe/contact CTA section in footer

### Fixed
- npm lock file compatibility (added @swc/helpers@0.5.23, npm 11 in Dockerfile)

## [Sprint 2] — 2026-05-22

### Added
- Skip-to-content link
- prefers-reduced-motion support (wrapped scroll-behavior)
- aria-live="polite" on search results container
- Meaningful alt text on teaser images (PostCard, PostList, RelatedPosts, ArticlePage)
- DE/FR/ZH translations for linkedin-collab-services.md

### Fixed
- Content parity: LinkedIn post no longer in draft mode

## [Sprint 1] — 2026-05-21

### Added
- Teaser hero image (SVG + PNG) for collab-services blog post
- Language switch fix (pathname handling in catch-all routes)
- Teaser image wiring into ArticlePage and PostCard

### Fixed
- HTTP 404 on non-HTTPS (Traefik analytics-auth middleware broken config)
- Initial language switch → blog pages navigated to `zh/[...slug]` literal pattern
- Production deployment with DOCKER_BUILDKIT=0 workaround

## [Initial Release] — 2026-05-20

### Added
- Initial website launch with Next.js 16, App Router, 4 locales
- Content sections: Components (26 services), Architecture (2 pages), Blog (7 posts), Get Started (1 guide)
- Full-text search with grouped results
- RSS feed generation
- Breadcrumb navigation
- Cookie consent for privacy-friendly analytics
- Dark/light theme toggle
- Docker multi-stage build with Traefik reverse proxy
- CI/CD with Forgejo Actions
- i18n support for EN, DE, FR, ZH
- Content authored in Markdown with gray-matter frontmatter
