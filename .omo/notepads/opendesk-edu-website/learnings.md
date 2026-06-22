# Learnings

## [2026-04-14] Session Start
- Project directory is empty (only .sisyphus/ exists)
- Reference project at C:\Users\Tobias\git\next-graphwiz-ai
- Artwork repo at C:\Users\Tobias\git\opendesk-edu-artwork
## Project Initialization Learnings

- ESLint 9 requires eslint.config.mjs (flat config), not .eslintrc
- Vitest exits code 1 when no test files found; need \passWithNoTests: true\ in config
- Husky \prepare\ script warns about missing .git (expected before git init)
- Added \emark-rehype\, \clsx\, \	ailwind-merge\ beyond reference project deps
- Used \
ext dev --turbopack\ for dev script (task requirement)
- Created tsconfig.json, vitest.config.ts, src/test/setup.ts as essential infrastructure files
- 626 packages installed, 1 high severity vulnerability (expected for fresh install)

## [2026-04-14] Tasks 3-7: Scaffolding Files

- Created 8 scaffolding files: next.config.ts, globals.css, playwright.config.ts, e2e/.gitkeep, barrel exports, Dockerfile, docker-compose.yml
- next.config.ts: standalone output, MDX via @next/mdx, turbopack root config, security headers
- globals.css: Purple palette (#571EFA accent, #341291 accent-button) replacing blue (#0288d1, #01579b)
- Light theme border: #E5E7EB, secondary text: #6B7280 (matching design system spec)
- Dark theme kept reference values (#30363d border, #8b949e secondary text)
- Playwright config uses chromium only, dev server on port 3000
- Dockerfile uses multi-stage build (deps → builder → runner) with node:20-alpine
- docker-compose.yml uses Traefik labels with opendesk-edu.org domains
- npm run lint and npx tsc --noEmit both pass cleanly

## UI Components Task (Tasks 14-19)
- jsdom does not allow setting window.location.href directly - it navigates instead. Must mock window.location before testing components that set it (EmailLink pattern).
- For next/link and next/image mocks in tests, use typed props (Record<string,unknown> causes type errors with href/children). Use explicit prop types instead.
- SectionPage is an async server component - test by awaiting the result then rendering the returned JSX element.
- Footer needs next/image mock even though it doesn't use Image directly (transitive via EmailLink import chain through Next.js).

## [2026-04-15] Tasks 28-32: SEO Files + CI/CD
- escapeXml test pitfall: escaped strings contain literal ampersand inside entities, so not.toContain("&") fails
- Next.js MetadataRoute.Robots rules type is a union - use Array.isArray() cast for length checks
- feed.xml/route.ts uses force-static dynamic export for static RSS generation
- CI workflow: lint/test/build parallel, deploy only on push to main (not PR)
- Deploy uses appleboy/ssh-action with secrets, then curl health check against opendesk-edu.org
- 117 tests passing (15 new: 9 xml + 6 seo)
2026-04-15 08:32 Tasks 33-37: next-intl i18n setup

- next-intl v3+ uses defineRouting, createMiddleware, createNavigation, getRequestConfig
- Next.js 16 params are Promise<{locale: string}> - must await
- next-intl Link has STRICT typing for pathnames defined in routing config
- For dynamic section hrefs (not in pathnames config), use 'as any' with eslint-disable
- Root layout in [locale]/layout.tsx wraps with NextIntlClientProvider + getMessages()
- Root layout.tsx must return children only (no html/body) when using [locale] subdirectory
- content.ts locale param defaults to 'en' for backward compat
- Test mocks: mock '@/i18n/navigation' Link instead of 'next/link' for locale-aware components
- next-intl plugin must wrap MDX plugin: withMDX(withNextIntl(config))
