# openDesk Edu Website

The official website for [openDesk Edu](https://opendesk-edu.org) — an open-source digital workplace for higher education institutions. Built with Next.js and deployed via Docker with Traefik reverse proxy.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16.2.1 (App Router, standalone output)
- **UI:** [React](https://react.dev/) 19.2.4, [Tailwind CSS](https://tailwindcss.com/) v4
- **Language:** TypeScript (strict mode)
- **i18n:** [next-intl](https://next-intl.dev/) — English, Deutsch, Français, 中文
- **Content:** Markdown with MDX support, [gray-matter](https://github.com/jonschlinkert/gray-matter) for frontmatter
- **Testing:** [Vitest](https://vitest.dev/) (unit), [Playwright](https://playwright.dev/) (e2e)
- **Linting:** ESLint 9 with Next.js config
- **Deployment:** Docker multi-stage build, Traefik reverse proxy

## Getting Started

```bash
git clone https://github.com/opendesk-edu/opendesk-edu-website.git
cd opendesk-edu-website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run validate:svg` | Validate SVG files |
| `npm run check:palette` | Check brand color palette compliance |
| `npm run optimize:svg` | Optimize SVG files with SVGO |
| `npm run export:png` | Export SVG files to PNG |

## Project Structure

```
src/app/           # Next.js App Router pages and layouts
src/components/    # Reusable React components
src/lib/           # Utilities and helpers
src/i18n/          # Internationalization configuration
src/test/          # Test utilities
content/           # Markdown articles organized by locale
  en/              # English content
  de/              # German content
  fr/              # French content
  zh/              # Chinese content
public/static/     # Brand assets, icons, diagrams
messages/          # i18n translation JSON files (en, de, fr, zh)
scripts/           # Artwork utility scripts (SVG validation, optimization, palette checks)
```

## Content Authoring

Articles are Markdown files stored in `content/{locale}/{section}/`. Supported locales: `en`, `de`, `fr`, `zh`.

### Adding a new article

1. Create a `.md` file in the appropriate locale and section directory:

```
content/en/blog/my-new-post.md
content/de/get-started/my-guide.md
```

2. Add frontmatter at the top of the file:

```yaml
---
title: "Article Title"
date: "2026-04-15"
description: "A brief description of the article."
categories: ["category-one", "category-two"]
tags: ["tag-one", "tag-two"]
draft: false
---

# Article Title

Your content here...
```

### Frontmatter Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Article title |
| `date` | string (YYYY-MM-DD) | Yes | Publication date |
| `description` | string | Yes | Short description for meta/preview |
| `categories` | string[] | Yes | Category classifications |
| `tags` | string[] | Yes | Tags for filtering |
| `draft` | boolean | No | If `true`, article is not published (default: `false`) |

## Deployment

The site uses a Docker multi-stage build with Traefik as reverse proxy.

### Docker Build

```bash
docker compose build
docker compose up -d
```

### Traefik Configuration

The `docker-compose.yml` includes Traefik labels for automatic HTTPS and routing:
- Domains: `opendesk-edu.org`, `www.opendesk-edu.org`
- TLS via Let's Encrypt
- Security headers middleware

### CI/CD

GitHub Actions handles automated deployment on push to `main`:
1. Lint, test, and build validation
2. SSH deploy to production server
3. Docker rebuild and restart
4. Health check verification (HTTP 200)

## Repository Hosting

- **GitHub** (primary): [opendesk-edu/opendesk-edu-website](https://github.com/opendesk-edu/opendesk-edu-website)
- **Codeberg** (mirror): [opendesk-edu/opendesk-edu-website](https://codeberg.org/opendesk-edu/opendesk-edu-website) — automatically mirrored via GitHub Actions on every push to `main`

## Documentation

- **[Architecture Guide](docs/architecture.md)** — App structure, routing, data flow, deployment
- **[Component Reference](docs/components.md)** — Catalog of all React components, props, and usage patterns
- **[Contributing Guide](CONTRIBUTING.md)** — How to contribute code and content
- **[Changelog](CHANGELOG.md)** — Release history and notable changes

## License

This project is licensed under the **Apache-2.0** License.

Note: Artwork and visual assets derived from the [openDesk](https://opendesk.org) project include copyright by BMUV and ZenDiS. See the [openDesk project](https://opendesk.org) for original artwork licensing details.

## Acknowledgments

- [openDesk](https://opendesk.org) — The open-source digital workplace for public administration, developed by ZenDiS on behalf of BMUV
- [openDesk Edu](https://opendesk-edu.org) — Adapting openDesk for higher education institutions
- [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/) — The open-source web platform
