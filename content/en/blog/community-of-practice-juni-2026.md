---
title: "Recap: openDesk Community of Practice — June 2026"
date: "2026-06-22"
description: "Thank you to everyone who participated in yesterday's openDesk Community of Practice. Here is a summary of the session covering key topics, documentation links, and the survey for the next meeting."
categories: ["community"]
tags: ["community-of-practice", "opendesk", "exchange", "community", "campus"]
image: "/static/diagrams/architecture.svg"
---

# Recap: openDesk Community of Practice — June 2026

Thank you to everyone who participated in yesterday's openDesk Community of Practice! The discussion was lively, and feedback from various universities shows how widely openDesk Edu is already being adopted.

Here is a summary of the key topics from the session.

---

## 1. ILIAS Stabilization

A recurring `Connection refused` error from MariaDB with newly created pods (ILIAS cronjobs) was resolved by implementing a 5-attempt retry loop with a 10s delay — it has been stable since. The upgrade path and testing of newer ILIAS versions remain open items.

## 2. OIDC / SSO

Keycloak in the `opendesk` realm serves as the central IdP with `email` and `preferred_username` mappers. The discussion covered which services should be connected via OIDC next (OpenProject? Nextcloud? Etherpad?) and existing experiences with SAML vs. OIDC.

## 3. Backup Infrastructure (k8up)

The k8up operator (v2.13.0) currently backs up 6 RWX PVCs to S3. 29 RWO PVCs are still excluded and need a separate strategy (CSI snapshots or per-node schedules). A **3-tier model** was proposed:

| Tier | Examples | RPO | RTO | Retention |
|:-----|:---------|:----|:----|:----------|
| **A** (critical) | Keycloak, PostgreSQL, Redis, MariaDB, MinIO | 1h | 2h | 30d |
| **B** (important) | Nextcloud, OX, OpenProject, ILIAS, Moodle | 1h | 4h | 14d |
| **C** (experimental) | JupyterHub, Ollama, Dask | 24h | 1d | 7d |

## 4. Monitoring

Collabora has metrics, alerts, and a dashboard. Nextcloud still lacks alerts and a dashboard. Gaps exist for backup health dashboards and resource alerts (CPU > 80%, Memory > 85%, Disk > 80%).

## 5. Known HRZ Issues

- **DNS CNAME chains**: CoreDNS → SERVFAIL, workaround via `hostAliases`
- **Nextcloud AIO probe bug**: `initialDelaySeconds` incorrect
- **Planka ingress**: hardcoded `nginx`, annotation must be removed
- **Grafana ingress class**: switch to haproxy
- **ClamAV ICAP restart loop**: container cleanup required
- **k8up RWO PVCs**: backup pod cannot mount → excluded

## 6. Upstream & Cluster Status

**openDesk 1.15.0** (current, 28.05.2026) brought SeaweedFS as S3 object storage, OX App Suite 8.48, Nextcloud 32.0.9, and HAProxy ingress support. **v1.16.0** is in preparation with Nextcloud worker tuning and Dovecot/Postfix LoadBalancerIP.

The HRZ cluster runs on K3s v1.32.3 (9 nodes, Debian 12) with Ceph storage, kube-prometheus-stack, and ArgoCD.

## 7. Education Sector

ILIAS is running in production, Moodle is ready as a Helm chart (deployment pending). The group discussed which services are still missing — such as Stud.IP, HIS, or other higher education systems — and how data protection requirements (GDPR, cloud in higher education) are evolving.

## 8. Architecture

The current **openDesk Edu architecture** with IAM, applications, integrations, and mail flow is shown in the architecture diagram:

➡️ [Architecture diagram (SVG)](/static/diagrams/architecture.svg)

The detailed runtime architecture including storage topology and backup matrix is available in the [CoP repository](https://codeberg.org/opendesk-edu/opendesk-cop).

---

## Links

- **📄 Call documentation**: [Codeberg — CoP Session 2025-06-19](https://codeberg.org/opendesk-edu/opendesk-cop/src/branch/main/2025-06-19-community-of-practice-session.md)
- **📋 Survey for next CoP date**: [DFN Terminplaner](https://terminplaner6.dfn.de/de/p/1509a06af2198fc680b2cac353ecca55-1808219)
- **🏗️ Architecture diagram**: [/static/diagrams/architecture.svg](/static/diagrams/architecture.svg)
- **💻 openDesk Edu**: [opendesk-edu.org](https://opendesk-edu.org/)
- **🐘 Codeberg**: [codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu/)

Please participate in the survey by the end of next week — we will then get back to you with the final date for the next CoP call in about three months.
