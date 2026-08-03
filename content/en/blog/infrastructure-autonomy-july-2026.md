---
title: "Infrastructure Autonomy — July 2026 Progress Report"
date: "2026-07-28"
description: "Stalwart v0.16 replaces Postfix, all services connected via Keycloak SSO, ArgoCD GitOps expanded, and custom infrastructure repos created to decouple from external registries."
categories: ["Infrastructure"]
tags: ["stalwart", "oidc", "keycloak", "argocd", "gitops", "monitoring"]
image: "/static/blog/infrastructure-autonomy-july-2026-teaser.svg"
---

# Infrastructure Autonomy — July 2026 Progress Report

The openDesk Edu deployment reached two significant milestones this month: full SSO integration across all services and near-complete infrastructure autonomy from external registries. Here is what happened.

## Stalwart v0.16 Replaces Postfix

After months of planning, Stalwart Mail Server was upgraded from v0.15 to **v0.16.15** and took over as the primary Mail Transfer Agent (MTA). Postfix has been disabled.

**What changed:**
- **9 listeners** — SMTP (25), Submission (587), IMAP (143, 993), POP3 (110, 995), Sieve (4190), and JMAP (8080) — all active
- **Config format** — moved from TOML to JSON with RocksDB backend
- **Paths** — standardized to `/var/lib/stalwart/` (data), `/etc/stalwart/config.json` (config)
- **Probes** — switched from httpGet (no `/api/health` endpoint in v0.16) to TCP socket probes
- **Security** — `allowPrivilegeEscalation=true`, empty `capabilities.drop` (required by the v0.16 binary on K3s v1.32.3)

Services now relay SMTP through Stalwart:
- SOGo — `smtp://stalwart-stalwart:587`
- OpenCloud — `stalwart-stalwart.opendesk.svc.cluster.local:587`
- All other notification-sending services

The MTA routing configuration uses MX-based delivery for external domains and local delivery for `opendesk-edu.org`.

## Unified SSO via Keycloak

Every service now authenticates through the central Keycloak realm (`opendesk`):

| Client ID | Service | Status |
|-----------|---------|--------|
| `opendesk-opencloud` | OpenCloud cloud storage | ✅ |
| `stalwart` | Stalwart mail server | ✅ |
| `sogo` | SOGo groupware | ✅ |
| `opendesk-matrix` | Element/Synapse chat | ✅ |
| `opendesk-xwiki` | XWiki knowledge base | ✅ |
| `univention/oidc` | Portal (Nubus) | ✅ |

The Keycloak bootstrap chart (`opendesk-keycloak-bootstrap`) was fixed to resolve a DNS issue (`ums-keycloak..svc.cluster.local` → `ums-keycloak.opendesk.svc.cluster.local`) and now creates all OIDC clients and custom scopes automatically.

Custom client scopes with protocol mappers provide `opendesk_username` and `opendesk_useruuid` claims in tokens, enabling services to identify users consistently.

## ArgoCD GitOps Expansion

ArgoCD management was extended from 2 to **27 edu applications** by converting CMP-based (helmfile plugin) apps to Helm-based child apps:

- **Helm-based (managed)** — opencloud, stalwart, sogo, etherpad, portal-entries (5)
- **CE-managed (Synced)** — 22 apps
- **CMP-based (cosmetic Unknown)** — 23 edu apps (apps run fine, sync status cosmetic)

**Challenges encountered:**
- Chart bugs fixed — missing `fullname` template in `_helpers.tpl` (ilias, etherpad)
- `bitnami/kubectl:1.32` tag does not exist (404) — replaced with custom image
- Init containers fail in air-gapped networks — `initSchema` disabled
- Helm hooks with OCI registry images block sync — `skipOidcHook` option added

## Custom Infrastructure Repos

To decouple from external registries that are unreachable from the cluster network, four independent repositories were created:

| Repository | GitHub | GitLab | Purpose |
|-----------|--------|--------|---------|
| **opendesk-kubectl** | [tobias-weiss-ai-xr/opendesk-kubectl](https://github.com/tobias-weiss-ai-xr/opendesk-kubectl) | [tbsweiss/opendesk-kubectl](https://gitlab.com/tbsweiss/opendesk-kubectl) | Minimal kubectl (~30MB alpine-based) |
| **opendesk-helm-charts** | [tobias-weiss-ai-xr/opendesk-helm-charts](https://github.com/tobias-weiss-ai-xr/opendesk-helm-charts) | [tbsweiss/opendesk-helm-charts](https://gitlab.com/tbsweiss/opendesk-helm-charts) | Patched charts + OCI mirror tooling |
| **opendesk-sogo-image** | [tobias-weiss-ai-xr/opendesk-sogo-image](https://github.com/tobias-weiss-ai-xr/opendesk-sogo-image) | [tbsweiss/opendesk-sogo-image](https://gitlab.com/tbsweiss/opendesk-sogo-image) | SOGo with OIDC/SSO support |
| **opendesk-collab-dashboard** | [tobias-weiss-ai-xr/opendesk-collab-dashboard](https://github.com/tobias-weiss-ai-xr/opendesk-collab-dashboard) | [tbsweiss/opendesk-collab-dashboard](https://gitlab.com/tbsweiss/opendesk-collab-dashboard) | Dashboard aggregating edu services |

Each repository includes:
- Dockerfile with proper metadata and licensing
- Makefile with `build` and `push` targets
- GitHub Actions and GitLab CI pipelines
- Comprehensive README

The kubectl image was pushed to `registry.gitlab.com/tbsweiss/opendesk-kubectl:1.32.3` and `registry.opendesk-edu.org/opendesk/kubectl`, replacing `bitnami/kubectl` (tag 1.32 not found) and `lachlanevenson/k8s-kubectl`.

## Monitoring and Backup

- **28/29 contract tests pass** (1 skip: Stalwart version detection cosmetic)
- **11 Prometheus alert rules** for service health, quota exhaustion, backup failures
- **k8up operator** — 0 restarts, binary deployed via init container (ConfigMap too large at 39MB)
- **Backup schedules** — `backup-live` (RWX PVCs, daily 00:42), `backup-stalwart` (RWO via label, daily 01:00)
- All 29 RWO PVCs annotated `k8up.io/exclude: true`

## What's Next

- **Smarthost relay** — configure Stalwart outbound delivery through the university MX relay
- **Helm chart OCI mirror** — push cached charts to the GitLab Container Registry
- **GitHub Container Registry** — fix PAT scopes to enable ghcr.io pushes
- **More ArgoCD conversions** — convert remaining CMP-based apps to Helm-based
- **Performance tuning** — resource optimization for 76+ running services

---

*Deployed on K3s v1.32.3 · 9 nodes · Ceph CSI storage · production cluster*
