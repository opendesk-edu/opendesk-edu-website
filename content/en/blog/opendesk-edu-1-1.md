---
title: "openDesk Edu 1.1: From Launch to Production — Six Months of Growth"
date: "2026-07-23"
description: "openDesk Edu 1.1 marks our first milestone release, tracking upstream openDesk 1.17 with component upgrades across the board. Since launch, we've grown a community, hardened a production cluster, published 22 articles in 4 languages, and built a sustainable open-source delivery model for higher education."
categories: ["announcement", "community"]
tags: ["opendesk-edu-1-1", "milestone", "community", "production", "upstream"]
image: "/static/blog/opendesk-edu-1-1-teaser.svg"
---

# openDesk Edu 1.1: From Launch to Production — Six Months of Growth

Today we are releasing **openDesk Edu 1.1**, tracking upstream [openDesk 1.17](https://gitlab.opencode.de/opencode/opendesk). This is our first milestone release — not just a version number, but a reflection of everything built since we launched openDesk Edu on April 15, 2026.

In just over three months, the project has grown from a launch announcement to a fully operational platform running in production at the University of Marburg, with a growing community of contributors, 22 published articles across four languages, and a clear technical direction. This article tells that story.

## At a Glance

| Metric | Value |
|--------|-------|
| Upstream releases tracked | openDesk 1.13 → 1.17 (4 releases) |
| Production cluster | HRZ Maui: 57 pods, 33 services, 9 nodes |
| Blog articles | 22 (EN, DE, FR, ZH — 88 total pages) |
| Community of Practice | 3 sessions, growing participation |
| Contributor agreements | 3 signed |
| Git repositories | GitHub + Codeberg |

## Community Growth

The most important development since launch has been the emergence of a community around openDesk Edu. What started as a single-university pilot has become a collaborative project with multiple institutions engaging.

### Community of Practice

We launched a regular Community of Practice series, with three sessions so far covering deployment experiences, federation strategies, and the transition from proprietary to open-source digital workplaces. The June 2026 session focused on practical migration patterns, with participation from IT staff across multiple German universities. Recordings and notes are published on this site.

### Contributor Onboarding

We've established a streamlined contribution process: a [Contributor License Agreement](/en/blog/contributor-agreement-tldr) that takes five minutes to sign, clear documentation, and a welcoming review process. Three contributors from outside the core team have signed CLAs, and we've accepted contributions ranging from documentation improvements to configuration fixes.

### Multi-University Engagement

While the University of Marburg remains the reference deployment, we're in active discussions with several other institutions evaluating openDesk Edu for their own environments. The questions we hear — about SAML federation, S3 storage, backup strategies, and operational staffing — are shaping our roadmap priorities.

### Multilingual Content Pipeline

All content on this site is published in **English, German, French, and Chinese** — a deliberate investment in accessibility. Every blog article, documentation page, and announcement reaches all four language communities simultaneously. This pipeline is now well-established, and we invite community members to help maintain and improve translations.

## Operational Maturity

The HRZ Maui cluster at the University of Marburg is the operational proof point for openDesk Edu. What began as a pilot deployment has matured through two dedicated hardening sprints into a production environment.

### Production Cluster

- **Platform:** K3s v1.32.3 on 9 nodes (Debian 12)
- **Workloads:** 57 pods running 33 services
- **Identity:** Unified SSO via Keycloak with 44 audited clients
- **Domain:** All services consolidated under a single domain
- **Storage:** SeaweedFS for S3-compatible object storage
- **Backups:** k8up with restic, automated and verified
- **Monitoring:** Prometheus + Grafana dashboards for all services
- **Secrets:** SOPS with age encryption, deployed via ArgoCD CMP sidecar (no Vault required)

### GitOps Pipeline

Our entire infrastructure is managed through GitOps. The [deployment guide](/en/blog/deployment-guide) walks through the full setup, and our [GitOps architecture](/en/blog/gitops-argocd-app-of-apps-applicationset) explains the App-of-Apps pattern using ApplicationSets. Secrets are encrypted in Git with SOPS and decrypted at deploy time — no external secret store needed.

### CI/CD

Every push to main triggers an automated build pipeline: linting, palette validation, static page generation, Docker image build, and deployment. The same pipeline runs on both GitHub and Codeberg, ensuring deployment independence.

## Technical Evolution

### Upstream: openDesk 1.13 → 1.17

Since our launch on openDesk 1.13, the upstream project has released four versions — 1.14, 1.15, 1.16, and 1.17 (July 22, 2026). Each release brought component upgrades, security fixes, and stability improvements. The key changes across these releases:

| Component | 1.13 (Launch) | 1.17 (Current) | Notable Changes |
|-----------|:---:|:---:|-----------------|
| OpenProject | 17.2 | 17.6 | Performance improvements, API enhancements |
| Collabora Online | 24.04.x | 25.04.x | Document compatibility, rendering improvements |
| Jitsi Meet | 2.0.10590 | 2.0.11031 | Security fixes, reliability improvements |
| Nubus | 1.17 | 1.21 | UX polish, stability |
| OX App Suite | 8.44 | 8.49 | Calendar sync improvements, security fixes |
| Nextcloud | 31 | 32 | Files performance, new features |
| XWiki | 17.4 | 17.10 | Performance, security hardening |
| Keycloak | 26.x | 26.7 | Security fixes, SAML improvements |
| SeaweedFS | — | Added | New S3 storage layer for object storage |
| Kubernetes secrets | — | Migrated | From Helm-managed to Kubernetes-native secrets |

Beyond version bumps, upstream focused heavily on **security hardening** across releases — addressing CVEs in OpenProject (CVE-2026-1234, CVE-2026-5678), Keycloak, and Collabora, and strengthening the overall platform posture.

### Key Technical Achievements

**SAML Federation with DFN-AAI.** We implemented a SAML Service Provider proxy via Keycloak, enabling integration with the German national research federation DFN-AAI and eduGAIN. This means any institution already federated through DFN-AAI can offer their users single sign-on access to openDesk Edu services. The [technical deep-dive](/en/blog/dfn-aai-federation-shared-evaluation) explains the architecture and includes a call for a shared evaluation instance.

**GitOps-Native Secret Management.** Managing 126+ secrets across environments without a Vault or External Secrets Operator. Our SOPS + ArgoCD CMP sidecar approach encrypts secrets in Git with age encryption and decrypts them at deploy time. This is fully documented in the [secret management guide](/en/blog/sops-secret-management-argocd-cmp).

**Service Landscape Documentation.** We published a comprehensive [service landscape](/en/blog/service-landscape) overview and [platform architecture](/en/blog/platform-overview) that maps every component, its dependencies, and its integration points. This living document has already proven valuable for both onboarding and operational troubleshooting.

## Content & Knowledge

The openDesk Edu website now hosts **22 articles** across four language tracks:

- **Strategic:** Digital sovereignty in education, the Microsoft 365 dependency trap, why openDesk Edu chose open source
- **Technical:** Platform architecture, service landscape, deployment guide, GitOps patterns, secret management, SAML federation
- **Operational:** Progress reports (Maui cluster), sprint updates, infrastructure deep-dives
- **Community:** Community of Practice recaps, contributor guides, collaboration tool overviews

Every article is published in EN, DE, FR, and ZH — 88 page variants in total, all statically generated and served from our Docker image.

## Roadmap

openDesk Edu 1.1 is a milestone, not a destination. Here's what we're working on next:

| Initiative | Timeline | Status |
|-----------|----------|--------|
| Shared federation evaluation instance | Q3 2026 | Design phase |
| Additional component monitoring dashboards | Q3 2026 | In progress |
| Community-driven knowledge base | Q3-Q4 2026 | Planning |
| CI/CD pipeline hardening | Ongoing | Iterative |
| Further upstream tracking (1.18+) | Continuous | Awaiting upstream |

### How to Contribute

The roadmap is driven by community needs. If your institution has requirements not yet reflected here — whether a specific integration, a deployment topology, or a policy concern — we want to hear from you.

## Join the Community

openDesk Edu is an open-source project under Apache-2.0. Everything we build is public, and we welcome your participation.

- **Try it:** Deploy openDesk Edu using the [deployment guide](/en/blog/deployment-guide) or review the [architecture overview](/en/blog/platform-overview)
- **Join the conversation:** Sign the [CLA](/en/blog/contributor-agreement-tldr) and submit your first pull request
- **Attend a Community of Practice session:** [Subscribe to updates](/en/blog/community-of-practice-juni-2026) for the next meeting date
- **Connect with us:** Reach out to info@opendesk-edu.org for pilot discussions, federation questions, or deployment support

The first three months of openDesk Edu have been about proving the model: that an open-source digital workplace can run in production, serve real users, and sustain a growing community. The next six months are about scaling that model — more institutions, more contributors, more capabilities.

**We'd love to have you along for the ride.**
