---
title: "Progress Report: openDesk Edu at HRZ Maui — June 2026"
date: "2026-06-03"
description: "After five months of deployment and two hardening sprints, openDesk Edu is running at full operational capacity at the University of Marburg. Here's what we achieved and what's next."
categories: ["Status Update"]
tags: ["deployment", "infrastructure", "kubernetes", "sprint", "university-of-marburg"]
---

# Progress Report: openDesk Edu at HRZ Maui — June 2026

> **57 pods running. 33 services with unified SSO. 44 Keycloak clients audited and migrated.**
> k8up backups active, Grafana dashboards deployed, and all ingresses consolidated under a single domain.

Since deploying openDesk Edu on the HRZ Maui cluster (K3s v1.32.3, 9 nodes, Debian 12), we've completed two focused hardening sprints (Sprints 5–6) targeting operational stability, domain consolidation, and service health.

## Cluster at a Glance

| Metric | Value |
|:-------|:------|
| Cluster | K3s v1.32.3, 9 nodes (3 CP, 6 workers) |
| Domain | `*.opendesk.hrz.uni-marburg.de` |
| Ingress | HAProxy controller (192.168.3.201) |
| Storage | Ceph RBD SSD (RWO), CephFS HDD EC (RWX) |
| SSO | Keycloak OIDC + SAML, 44 clients |
| Backups | k8up / restic → S3, daily at 01:22, 14d retention |
| Monitoring | Prometheus + Grafana (12.4.1) |

## What Was Fixed

### SSO Audit (Sprint 5)
All 44 Keycloak clients in the `opendesk` realm were audited and migrated from the legacy `opendesk-edu.org` domain to `opendesk.hrz.uni-marburg.de`. Every client URI, redirect URL, and issuer was verified via the Keycloak admin API.

### Domain Migration
Twelve ingresses (3 portal, 9 static-files) were migrated from `*.opendesk-edu.org` to `*.opendesk.hrz.uni-marburg.de`. The source of the hardcoded old domain — `portal-saml-multidomain.yaml.gotmpl` — was fixed at the chart level and committed.

### Service Repairs

| Service | Issue | Fix |
|:--------|:------|:----|
| **Planka** | Ingress class `nginx` (no controller), OIDC endpoints contained unrendered `.gotmpl` template syntax | Patched to `haproxy`, OIDC URLs set via `--set` |
| **SSP** | Ingress backend pointed to nonexistent service name | Chart template was already fixed; upgrade applied |
| **Planka chart** | `values.yaml` had helmfile `.gotmpl` expressions that break direct `helm` deployments | Replaced with empty strings; endpoints set at deploy time |

### Infrastructure
- **k8up** operator deployed in the `opendesk` namespace. Backup schedule `backup-edu` runs daily at 01:22 with 14-day retention. 33 snapshots confirmed in S3.
- **Grafana** dashboards deployed for edu service health, k8up backup overview, and cluster overview.
- **External DNS** — script generated for 12 services still relying on `/etc/hosts` resolution (n8n, code, collab, draw, jupyter, limesurvey, typo3, zammad, r, slides, term, ai).

## Current Service Health

All core services respond correctly:

| Service | Endpoint | Status |
|:--------|:---------|:-------|
| Moodle LMS | `moodle.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| ILIAS LMS | `lms.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| JupyterHub | `jupyter.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| BookStack | `bookstack.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| OpenProject | `projects.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| Element (Chat) | `chat.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| Jitsi (Meet) | `meet.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| Nextcloud (Files) | `files.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| OX App Suite (Mail) | `webmail.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| XWiki | `wiki.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| Planka | `planka.opendesk.hrz.uni-marburg.de` | ✅ 200 with OIDC |
| SSP | `ssp.opendesk.hrz.uni-marburg.de` | ✅ 403/200 (OIDC auth) |

## Roadmap Outlook

With the hardening sprints complete, the focus now shifts to:

1. **External DNS resolution** — hand the generated DNS record script to HRZ network admins to remove `/etc/hosts` dependency
2. **Helmfile pipeline** — work toward a clean `helmfile sync` that correctly targets the `opendesk-edu` namespace
3. **Full login testing** — end-to-end OIDC/SAML flow validation for all services
4. **v1.1 Foundation items** — DFN-AAI SAML federation testing, container image build pipeline, backchannel logout verification

Want to deploy openDesk Edu at your university? See our [getting started guide](/docs/deployment) and [repository](https://codeberg.org/opendesk-edu/opendesk-edu).
