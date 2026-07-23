# openDesk Edu 1.1 Announcement Article

**Date:** 2026-07-23
**Status:** Design Document
**Author:** Tobias Weiß & openDesk Edu Contributors

## Overview

A comprehensive milestone article announcing openDesk Edu 1.1, covering the project's journey from its 1.0 launch (April 2026) to the present. The article is themed as a retrospective covering community growth, operational maturity, technical evolution, and content output. The upstream openDesk 1.17 tracking is covered as one part of the technical evolution section.

## Article Metadata

- **Title:** "openDesk Edu 1.1: From Launch to Production — Six Months of Growth"
- **Locale:** EN (first), then DE/FR/ZH (later)
- **Date:** 2026-07-23
- **Categories:** ["announcement", "community"]
- **Tags:** ["opendesk-edu-1-1", "milestone", "community", "production", "upstream"]
- **Image:** "/static/blog/announcement-teaser.svg" (reuse existing — or new specific image)

## Section Structure

### 1. Opening
- openDesk Edu 1.1 is released
- What 1.1 represents: bundling everything built since launch
- Tracks upstream openDesk 1.17
- At-a-glance metrics

### 2. Community Growth
- Community of Practice launched, regular sessions
- Contributor agreements in place
- Multiple universities engaging (Marburg as reference deployment)
- 4-locale content pipeline (EN, DE, FR, ZH)
- Open-source collaboration model

### 3. Operational Maturity
- HRZ Maui deployment (57 pods, 33 services, production)
- CI/CD pipeline (GitHub Actions + Codeberg)
- Docker deployment workflow
- Monitoring (Prometheus + Grafana), backups (k8up/restic)
- Health checks, automated builds

### 4. Technical Evolution
- Upstream tracking: openDesk 1.13 → 1.17
  - Key component updates
  - Security fixes
  - Stability improvements
- GitOps/secret management (SOPS + ArgoCD CMP)
- SAML federation with DFN-AAI
- Architecture refinements
- Platform/service landscape documentation

### 5. Content & Knowledge
- 22 blog posts in 4 locales
- Technical deep-dives
- Strategic topics (digital sovereignty, M365 trap)
- Progress reporting and transparency

### 6. Roadmap
- Upstream tracking cadence
- Upcoming features and integrations
- Community initiatives

### 7. Call to Action
- Try openDesk Edu
- Join Community of Practice
- Contribute to the project

## Tone & Style

- Professional but celebratory (milestone article)
- Data-driven where possible (metrics, counts)
- Accessible to both CIOs (front half) and operators (back half)
- Consistent with existing blog voice (see announcement.md, progress-report-june-2026.md)

## Locales

- **Phase 1:** EN article (this design)
- **Phase 2:** Translate to DE, FR, ZH (separate implementation)

## Success Criteria

- EN article live at `content/en/blog/opendesk-edu-1-1.md`
- Follows existing frontmatter conventions
- All links valid
- Categories/tags match locale conventions
