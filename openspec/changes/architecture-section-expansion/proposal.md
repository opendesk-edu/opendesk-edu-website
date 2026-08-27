## Why

The architecture section currently has only 2 articles (`overview.md`, `component-alternatives.md`). While the blog has many architecture-adjacent posts, those are time-stamped narratives — not timeless reference documentation. An institution evaluating openDesk Edu (CIO, admin, architect) needs canonical references for the four core subsystems: identity, networking, storage, and security. The existing overview covers each in a few paragraphs; dedicated articles are needed to provide the depth required for real-world deployment decisions.

## What Changes

- Add 4 new architecture-section articles under `content/{en,de,fr,zh}/architecture/`:
  1. **Identity & Authentication Architecture** — full auth chain (DFN-AAI → Keycloak → SAML/OIDC → Shibboleth → service), attribute mapping, federation metadata, multi-IdP scenarios
  2. **Networking & Traffic Flow Architecture** — ingress, TLS termination, certificate management (Bundesdruckerei), internal routing, DNS, service exposure
  3. **Storage & Data Management Architecture** — storage classes, persistent volume provisioning, database backends (MariaDB, PostgreSQL, Redis), data lifecycle, capacity planning
  4. **Security Architecture** — network policies, secret management (SOPS), RBAC, audit logging, compliance framework mapping (BSI IT-Grundschutz, GDPR)
- Add SVG teaser images for each article in `public/static/blog/` (or reuse a shared architecture teaser)
- Update the architecture section index page to list the new articles alongside `overview` and `component-alternatives`
- All 4 articles written in EN first, then translated to DE, FR, ZH
- Articles follow the article-writing skill rules: institutional neutrality, no internal data leaks, no fixed service counts, vendor neutrality, Abmahnrisiko compliance

## Capabilities

### New Capabilities

- `architecture-identity`: Identity & authentication architecture reference — auth chain, federation, attribute mapping, multi-IdP
- `architecture-networking`: Networking & traffic flow architecture reference — ingress, TLS, DNS, internal routing
- `architecture-storage`: Storage & data management architecture reference — PVs, databases, backup integration, capacity planning
- `architecture-security`: Security architecture reference — network policies, secrets, RBAC, audit, compliance mapping

### Modified Capabilities

(none — the existing `overview` and `component-alternatives` articles remain unchanged)

## Impact

- **Content**: 16 new markdown files (4 articles × 4 locales) under `content/{en,de,fr,zh}/architecture/`
- **Assets**: 4 new SVG teaser images under `public/static/blog/` (or a shared architecture-series teaser)
- **Build**: `getPostsBySection('architecture', locale)` already handles arbitrary files in the architecture section; no code changes needed
- **Navigation**: The architecture section listing page (`/[locale]/architecture`) automatically renders all articles in the section; no route changes needed
- **SEO**: 4 new architecture pages per locale (16 total) with structured frontmatter
- **No code changes**: The content pipeline, section routing, and page rendering already support additional architecture articles
