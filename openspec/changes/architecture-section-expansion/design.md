## Context

The architecture section currently has 2 articles (`overview.md`, `component-alternatives.md`). The blog has architecture-adjacent posts but they are time-stamped narratives, not timeless references. This change adds 4 new architecture-section articles that serve as canonical references for the four core subsystems: identity, networking, storage, and security.

The content pipeline (`getPostsBySection` in `src/lib/content.ts`) already supports arbitrary files in `content/{locale}/architecture/`. No code changes are needed — the articles are picked up automatically by the section routing.

See `proposal.md` for the motivation and the four capabilities being introduced.

## Goals / Non-Goals

**Goals:**
- Provide canonical, timeless reference documentation for the 4 core architectural subsystems
- Ensure each article is 2,500–5,000 words (substantial but focused)
- Maintain consistency with the existing 2 architecture articles in tone, structure, and depth
- Translate all 4 articles to DE, FR, ZH
- Follow all article-writing skill rules (institutional neutrality, no internal data, no fixed service counts, vendor neutrality, Abmahnrisiko compliance)

**Non-Goals:**
- Duplicating blog content — articles should reference blog posts for time-specific details but provide the canonical architectural reference
- Covering monitoring/observability, upgrade lifecycle, multi-tenancy, or CI/CD (Tier 2/3 topics for future expansion)
- Changing any code, routing, or build configuration
- Adding interactive diagrams or dynamic content (static SVG teasers only)

## Decisions

### D1: Article order and slugs

**Decision**: Write articles in this order with these slugs:
1. `identity-authentication` — Identity & Authentication Architecture
2. `networking-traffic-flow` — Networking & Traffic Flow Architecture
3. `storage-data-management` — Storage & Data Management Architecture
4. `security` — Security Architecture

**Rationale**: Identity is the most complex and most-asked-about subsystem. Starting with it sets the pattern for the others. The slug `identity-authentication` is more discoverable than `identity` alone.

**Alternatives considered**: Alphabetical order (less logical flow), security-first (too much detail before the reader understands the system).

### D2: Article structure

**Decision**: Each article follows this structure:
1. Frontmatter (title, date, description, categories, tags, author, image)
2. H1 title + opening paragraph (hook + scope)
3. 5–8 H2 sections with H3 subsections as needed
4. Architecture diagrams as inline ASCII/tables (not external images, to keep them maintainable and translatable)
5. Cross-references to existing architecture articles and relevant blog posts
6. Call to action (further reading, community)
7. Tagline

**Rationale**: Consistency with existing architecture articles (`overview.md`, `component-alternatives.md`) which use this pattern. ASCII diagrams and tables are locale-neutral and don't require SVG localisation.

**Alternatives considered**: Mermaid diagrams (require Mermaid rendering, already available but adds complexity for translated content), embedded SVGs (per-locale SVG is high effort for 4 articles × 4 locales).

### D3: SVG teaser images

**Decision**: Create one SVG teaser per article (4 total) following the existing φ-ratio artwork style. Store in `public/static/blog/`. Each SVG uses the architecture-series visual language (consistent colour palette, iconography).

**Rationale**: The frontmatter `image` field is required by the article-writing skill. A consistent visual style across the architecture series aids recognition.

**Alternatives considered**: A single shared architecture-series SVG (less distinctive per article), no images (violates frontmatter requirement).

### D4: Cross-referencing strategy

**Decision**: Each article cross-references:
- The existing `overview` article (for the big picture)
- The existing `component-alternatives` article (where relevant)
- Relevant blog posts (for time-specific deep dives)
- The other architecture articles in the series (bidirectional)

**Rationale**: Architecture articles should form a navigable web, not isolated documents. Cross-references help readers find related information without duplicating content.

### D5: Translation approach

**Decision**: Write the English article first, review it, then translate to DE, FR, ZH. Technical terms (Kubernetes, Keycloak, SAML, OIDC, DFN-AAI) remain in English across all locales. Frontmatter title and description are translated.

**Rationale**: The article-writing skill specifies EN as the source of truth. Translating after review avoids rework.

### D6: Compliance with editorial rules

**Decision**: Each article must pass the pre-publication checklist from the article-writing skill before being committed:
- No institutional names (HRZ, Marburg, Philipps-Universität, node names)
- No internal data (IPs, hostnames, topology, secrets)
- No fixed service counts (use "a comprehensive suite" not "N services")
- No vendor endorsements (neutral, factual language)
- Trademarks marked correctly (™/® where applicable)
- All quantitative claims sourced or marked as estimates

**Rationale**: These rules are non-negotiable per the article-writing skill.

## Risks / Trade-offs

- **Risk**: Articles become stale as the platform evolves → **Mitigation**: Use architectural patterns (not specific versions or counts) where possible. Version numbers in the technology stack table are acceptable because they date the article intentionally.
- **Risk**: Cross-references create maintenance burden → **Mitigation**: Use relative links (`/architecture/identity-authentication`) not absolute URLs, so they work across locales automatically via the i18n routing.
- **Risk**: Translation quality varies across 4 locales → **Mitigation**: EN is source of truth; DE/FR/ZH translations follow the same structure. Technical accuracy is more important than literary style.
- **Risk**: Articles overlap with existing blog posts → **Mitigation**: Architecture articles are timeless references; blog posts are time-stamped narratives. Architecture articles link to blog posts for "read about our specific experience" without duplicating content.

## Open Questions

- None. All decisions are resolved. The 4 articles, their structure, and their compliance requirements are fully specified.
