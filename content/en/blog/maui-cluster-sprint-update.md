---
title: "Sprint 1 Complete: Infrastructure Fixes on the Maui Cluster"
date: "2026-06-17"
description: "Sprint 1 of the Maui cluster remediation plan is complete — the stuck slidev PVC is resolved, SOGo migrated to the correct namespace, storage classes audited, and smoke tests pass for all core services."
image: "/static/blog/maui-cluster-sprint-update-teaser.svg"
categories: ["Status Update"]
tags: ["maui", "kubernetes", "sprint", "infrastructure", "cluster", "k3s"]
---

# Sprint 1 Complete: Infrastructure Fixes on the Maui Cluster

> **slidev PVC unstuck. SOGo migrated. Storage classes audited across 31 deployments. All smoke tests green.**

On June 14, we published the [Maui cluster sprint plan](/en/blog/hrz-maui-cluster-progress) — four sprints to close the gap on six missing services and harden the infrastructure. Today we're reporting that Sprint 1 is complete, and work on Sprint 2 is already under way.

## What Was Fixed

### slidev PVC: Unstuck

The slidev PersistentVolumeClaim had been stuck in `Pending` state since initial deployment. The root cause was a missing StorageClass annotation on the PVC — it referenced `ceph-rbd-ssd` but the `spec.storageClassName` field was empty, causing the CSI provisioner to skip it entirely.

**Fix applied:**
- Deleted the stuck PVC (no data loss — slidev is stateless)
- Recreated with explicit `storageClassName: ceph-rbd-ssd`
- Pod scheduled immediately after PVC bound
- Service responds at `slides.opendesk.hrz.uni-marburg.de`

### SOGo Namespace Migration

SOGo was deployed in the `demo` namespace during initial testing — a leftover from the prototyping phase. We migrated it to `opendesk-edu` to align with cluster naming conventions.

**Migration steps:**
1. Dumped the SOGo PostgreSQL database from the `demo` namespace
2. Re-deployed the SOGo chart with `namespace: opendesk-edu`
3. Restored the database into the new namespace
4. Updated the ingress to point to the new service endpoint
5. Removed the old `demo` namespace deployment

DNS propagation took ~2 minutes; the service has been stable since.

### Storage Class Audit

Every PVC across the 31 deployments in both `opendesk` and `opendesk-edu` namespaces was audited for correct StorageClass assignment:

| StorageClass | Purpose | PVCs | Status |
|---|---|---|---|
| `ceph-rbd-ssd` | Fast RWO (databases, stateful sets) | 18 | ✅ All correct |
| `ceph-cephfs-hdd-ec` | Slow RWX erasure-coded (files) | 9 | ✅ All correct |
| `local-path` | Temporary/scratch (K3s default) | 3 | ✅ All correct |

No misconfigurations were found beyond the slidev PVC — confirming the initial deployment templates were sound.

### Smoke Tests

A full smoke test suite was run against all 31 deployments:

- All 31 deployments show `READY` status
- All ingresses return HTTP 200 or 302 (SSO redirect)
- Keycloak OIDC login flow works for Nextcloud, OpenProject, XWiki, and BookStack
- K8up backup schedule ran successfully: 33 snapshots pushed to S3
- Prometheus targets all healthy, Grafana dashboards show no critical alerts

## Sprint 2: Now Under Way

With infrastructure fixes complete, Sprint 2 targets three missing services:

| Service | Chart Type | Dependencies | Status |
|---|---|---|---|
| Zammad | Local chart | PostgreSQL, Elasticsearch, Redis | 🟡 In progress |
| Overleaf | Upstream chart | Redis, MongoDB | 🟡 In progress |
| KasmVNC | Upstream chart | — | ⏳ Queued |

Zammad deployment is the most complex — it requires three dependent databases and proper ingress routing for its real-time ticket updates. We're adapting the chart from `charts-upgrade-v1.12.0/zammad` with the same postgresql-subchart-removal pattern used for Etherpad.

## What's Next

- **Sprint 3** (target: this week): Portal entries (configmap-only chart) and Snipr (Dockerfile build required)
- **Sprint 4**: Hardening, documentation, and full ingress audit

The maui cluster now runs **41 pods** across **32 deployments** — up from 39 pods and 31 deployments on June 14. We're on track for full production readiness by end of June.

Want to deploy openDesk Edu at your university? See our [getting started guide](/docs/deployment) and [repository](https://codeberg.org/opendesk-edu/opendesk-edu).

### Share this article

Copy Link [LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fopendesk-edu.org%2Fen%2Fblog%2Fmaui-cluster-sprint-update) [Matrix](https://matrix.to/#/https%3A%2F%2Fopendesk-edu.org%2Fen%2Fblog%2Fmaui-cluster-sprint-update)
