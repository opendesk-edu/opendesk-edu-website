## 1. Article 1: Identity & Authentication Architecture

- [x] 1.1 Write EN article `content/en/architecture/identity-authentication.md` covering: full auth chain (DFN-AAI → Keycloak → SAML/OIDC → Shibboleth → service), federation integration, attribute mapping, dual-protocol stack, multi-IdP scenarios, Nubus portal, security boundaries and failure modes
- [x] 1.2 Create SVG teaser `public/static/blog/identity-authentication-teaser.svg` following φ-ratio artwork rules
- [x] 1.3 Verify EN article passes pre-publication checklist (no institutional names, no internal data, no fixed service counts, vendor neutrality, Abmahnrisiko)
- [x] 1.4 Translate to DE: `content/de/architecture/identity-authentication.md`
- [x] 1.5 Translate to FR: `content/fr/architecture/identity-authentication.md`
- [x] 1.6 Translate to ZH: `content/zh/architecture/identity-authentication.md`
- [x] 1.7 Verify all 4 locale files have identical frontmatter structure, same slug, translated title/description

## 2. Article 2: Networking & Traffic Flow Architecture

- [ ] 2.1 Write EN article `content/en/architecture/networking-traffic-flow.md` covering: traffic flow path (DNS → ingress → TLS → routing → pod), TLS certificate management, ingress and routing, DNS architecture, network segmentation and policies
- [ ] 2.2 Create SVG teaser `public/static/blog/networking-traffic-flow-teaser.svg`
- [ ] 2.3 Verify EN article passes pre-publication checklist
- [ ] 2.4 Translate to DE: `content/de/architecture/networking-traffic-flow.md`
- [ ] 2.5 Translate to FR: `content/fr/architecture/networking-traffic-flow.md`
- [ ] 2.6 Translate to ZH: `content/zh/architecture/networking-traffic-flow.md`
- [ ] 2.7 Verify all 4 locale files have identical frontmatter structure

## 3. Article 3: Storage & Data Management Architecture

- [ ] 3.1 Write EN article `content/en/architecture/storage-data-management.md` covering: persistent storage (PVs, storage classes, access modes), database backends (MariaDB, PostgreSQL, Redis), backup integration, data lifecycle and migration, capacity planning guidance
- [ ] 3.2 Create SVG teaser `public/static/blog/storage-data-management-teaser.svg`
- [ ] 3.3 Verify EN article passes pre-publication checklist
- [ ] 3.4 Translate to DE: `content/de/architecture/storage-data-management.md`
- [ ] 3.5 Translate to FR: `content/fr/architecture/storage-data-management.md`
- [ ] 3.6 Translate to ZH: `content/zh/architecture/storage-data-management.md`
- [ ] 3.7 Verify all 4 locale files have identical frontmatter structure

## 4. Article 4: Security Architecture

- [ ] 4.1 Write EN article `content/en/architecture/security.md` covering: security architecture overview, secret management (SOPS + age + ArgoCD CMP), network security and isolation, RBAC and access control, audit logging, compliance framework mapping (BSI IT-Grundschutz, GDPR, ISO 27001)
- [ ] 4.2 Create SVG teaser `public/static/blog/security-architecture-teaser.svg`
- [ ] 4.3 Verify EN article passes pre-publication checklist
- [ ] 4.4 Translate to DE: `content/de/architecture/security.md`
- [ ] 4.5 Translate to FR: `content/fr/architecture/security.md`
- [ ] 4.6 Translate to ZH: `content/zh/architecture/security.md`
- [ ] 4.7 Verify all 4 locale files have identical frontmatter structure

## 5. Cross-Article Verification

- [ ] 5.1 Verify all cross-references between architecture articles use correct relative paths and resolve in all locales
- [ ] 5.2 Verify architecture section listing page (`/[locale]/architecture`) shows all 6 articles (2 existing + 4 new) in all locales
- [ ] 5.3 Run the editorial-rule scan (grep for institutional names, internal data, fixed service counts) across all 16 new files
- [ ] 5.4 Run the build to verify all 4 new articles × 4 locales generate correctly (657 + 16 = 673 pages expected)
- [ ] 5.5 Commit and push all changes
