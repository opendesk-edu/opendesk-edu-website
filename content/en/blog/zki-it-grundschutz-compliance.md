---
title: "ZKI IT-Grundschutz Compliance: openDesk Edu's Journey Toward the Higher Education Security Baseline"
date: "2026-08-01"
description: "openDesk Edu is systematically aligning with the ZKI IT-Grundschutz-Profil — the higher education adaptation of the BSI baseline — through enforceable Kyverno policies, hardened GitOps pipelines, and a transparent gap analysis. Here's where we stand and what's next."
categories: ["Security", "Compliance"]
tags: ["zki", "it-grundschutz", "bsi", "compliance", "kyverno", "security", "higher-education", "isms"]
image: "/static/blog/zki-it-grundschutz-compliance-teaser.svg"
---

# ZKI IT-Grundschutz Compliance: openDesk Edu's Journey Toward the Higher Education Security Baseline

> **The baseline:** Every German university IT center operates under the ZKI IT-Grundschutz-Profil — the higher education-specific adaptation of the BSI IT-Grundschutz methodology.
>
> **The reality:** For a platform composed of 25+ open-source services, compliance is not a checkbox you tick once. It's an architectural property that must be enforced continuously — through policies, pipelines, and transparent documentation.
>
> **Our approach:** Instead of a compliance statement, we built a compliance system: 20+ enforceable Kyverno policies, a hardened GitOps pipeline, and a public gap analysis that shows exactly where we stand — including the gaps.

## What Is the ZKI IT-Grundschutz-Profil?

The **ZKI IT-Grundschutz-Profil** is the reference security framework for German higher education institutions. It adapts the **BSI IT-Grundschutz** methodology — the German federal baseline for information security — to the specific realities of universities:

- **Research data** with unique protection requirements
- **Student data** and exam systems under special handling rules
- **Open collaboration** that must remain possible despite security controls
- **Decentralized administration** across departments and institutes

Where BSI IT-Grundschutz provides generic modules (Bausteine) for all organizations, the ZKI profile tailors them to university operations — aligned with DSGVO/GDPR, the HDSG, and ISIS12, the information security standards for German higher education.

For openDesk Edu, this is not a theoretical exercise. German universities cannot adopt a digital workplace platform that fails to align with the security baseline their own IT centers are measured against.

## Where openDesk Edu Already Stands

Before writing a single new policy, we audited what the platform already enforces. The results were encouraging — many ZKI measures are implemented by design:

### Identity and Access Management ✅
- **Keycloak** as central identity provider with OIDC and SAML
- **Federated identity** via Shibboleth and DFN-AAI
- **Multi-factor authentication**, password policies, and account lockout
- **Role-based access control** with fine-grained permissions
- **Session management** with configurable timeouts

### Network Security ✅
- **HAProxy** ingress with TLS termination
- **Traefik** as additional ingress layer
- **Network Policies** restricting service-to-service traffic
- **Pod Security Admission (PSA)** enforced cluster-wide
- Network segmentation across namespaces

### System Hardening ✅
- **Non-root containers** (`runAsNonRoot: true`)
- **Capability dropping** (`drop: ["ALL"]`)
- **Read-only root filesystems** where applicable
- **Seccomp profiles** (`RuntimeDefault`)
- **Resource limits** on every workload

### Data Protection ✅
- **Ceph storage** with encryption at rest
- **k8up backup operator** with restic — encrypted, scheduled, tested
- **Retention policies** and PVC-level backup annotations
- **SOPS-encrypted secrets** in Git

### Observability ✅
- **Prometheus** for metrics
- **Grafana** for dashboards
- **Loki** for centralized log aggregation
- **Alertmanager** for alert routing

## The Gap: From Good Practices to Enforced Compliance

A strong default posture is necessary — but not sufficient. ZKI compliance requires that security properties are *enforced*, *verifiable*, and *continuously validated*. That's where we identified the gaps.

### The 111-Point Checklist

We translated the relevant ZKI/BSI modules into **111 concrete checkpoints** across ten categories, each mapped to a BSI module and a priority level:

| Priority | Category | Status |
|----------|----------|--------|
| **P0** | IAM & Authentication | ⚠️ Partial |
| **P0** | Network Security | ✅ Good |
| **P0** | Data Protection | ⚠️ Partial |
| **P1** | Auditing & Logging | ⚠️ Partial |
| **P1** | Incident Response | ❌ Missing |
| **P1** | Change Management | ⚠️ Partial |
| **P2** | Application Security | ⚠️ Partial |
| **P2** | Physical Security | ✅ Good |
| **P2** | Awareness & Training | ❌ Missing |

Our internal starting point (self-assessment, not a certified audit): **~37% overall compliance**, with BSI module coverage at **~81%** where the platform already operates. These figures are internal estimates, not an official audit finding.

## What We Built: Policy as Code

The centerpiece of the implementation is **20+ Kyverno ClusterPolicies** that turn compliance requirements into enforceable admission controls. Every workload deployed to the cluster is now validated against these policies — before it ever reaches the runtime.

### Pod Security (8 policies)

| Policy | What it enforces | BSI Module |
|--------|------------------|------------|
| `zki-require-non-root` | No root containers | INF.1 |
| `zki-require-readonly-rootfs` | Immutable root filesystems | INF.1 |
| `zki-drop-all-capabilities` | Drop ALL Linux capabilities | INF.1 |
| `zki-require-seccomp` | Seccomp profiles required | INF.1 |
| `zki-prevent-privilege-escalation` | No privilege escalation | INF.1 |
| `zki-restrict-capabilities` | No capability re-addition | INF.1 |
| `zki-require-pod-security-context` | Pod security context mandatory | INF.1 |
| `zki-require-sidecar-logging` | Logging sidecars enforced | INF.1 |

### Network Security (4 policies)

| Policy | What it enforces | BSI Module |
|--------|------------------|------------|
| `zki-require-network-policy` | NetworkPolicy for every namespace | INF.5 |
| `zki-default-deny-all` | Default deny for all traffic | INF.5 |
| `zki-restrict-ingress-to-haproxy` | Ingress only via HAProxy | INF.5 |
| `zki-require-tls-for-ingress` | TLS required on all ingresses | INF.5 |

### Access Control (3 policies)

| Policy | What it enforces | BSI Module |
|--------|------------------|------------|
| `zki-restrict-host-path` | No hostPath volumes | INF.1 |
| `zki-restrict-host-network` | No hostNetwork usage | INF.1 |
| `zki-require-loki-labels` | Mandatory logging labels | INF.1 |

### Data Protection (3 policies)

| Policy | What it enforces | BSI Module |
|--------|------------------|------------|
| `zki-require-storage-encryption` | Encrypted storage only | DS |
| `zki-require-data-classification` | Data classification labels | DS |
| `zki-k8up-backup-annotation` | Backup annotations required | DS |

### Application Security (2 policies)

| Policy | What it enforces | BSI Module |
|--------|------------------|------------|
| `zki-require-security-headers` | Security headers (CSP, HSTS, X-Frame-Options) | INF.14 |
| `zki-require-probe-timeouts` | Proper probe configuration | INF.14 |

All policies run in **audit mode first**, are validated against real workloads in CI, and only then promoted to enforcement. Policy violations are reported via PolicyReports and surfaced in the monitoring stack.

## Governance: The Documents That Make Compliance Real

Policies without governance are decoration. We wrote the governance layer to match:

### IT Security Policy (14 chapters)

The security policy covers purpose and scope, security principles, organizational structure, access control, network security, system security, data protection, application security, incident management, business continuity, compliance, awareness, exceptions, and policy maintenance — aligned with BSI IT-Grundschutz modules and ISO/IEC 27001:2022.

### Incident Response Plan (BSI Standard 200-3)

A four-level incident classification matrix (Level 0–3), a six-phase response process, DSGVO breach notification procedures, and ten communication templates. Aligned with BSI 200-3, NIST SP 800-61, and ISO/IEC 27035.

### GitOps as Change Management

openDesk Edu's change management *is* its GitOps pipeline:

- **ArgoCD** for declarative, auditable deployments
- **PR discipline** — code changes and chart changes never mix
- **Version pinning** — images pinned by digest
- **SOPS** for secrets in Git with age/OpenPGP encryption
- **REUSE** compliance with SPDX headers on every file

Every change is a commit; every commit is an audit trail.

## The Remaining P0 Work: What Must Happen Before Production

We're transparent about what's still open. Five critical (P0) items stand between the current state and full production enforcement:

1. **Legal and authority approvals** — DPO, legal, and university management sign-off on the security policy framework (the only true blocker).
2. **Kyverno webhook authentication** — TLS and client-certificate auth for the admission webhook, so policies cannot be bypassed.
3. **Kyverno policy backup** — automated, restorable backup of all policies (compliance proof requires it).
4. **Policy change management process** — documented request, review, and approval workflow for policy changes.
5. **Emergency policy disable procedure** — controlled, logged, and reversible emergency procedures.

## Roadmap to 90%+

Our roadmap is concrete — four phases over roughly sixteen weeks:

| Phase | Focus | Target |
|-------|-------|--------|
| **Prep** | Complete all P0 actions | Production readiness |
| **Phase 1** | Foundation: ISMS, risk management | 60% compliance |
| **Phase 2** | Operations: logging, incident response, patch management | 75% compliance |
| **Phase 3** | Advanced: mTLS, SIEM, vulnerability management | 85% compliance |
| **Phase 4** | Maturity: IDS/IPS, WAF, awareness program | **90%+ compliance** |

## How Far Could You Get With Microsoft 365?

A question we hear constantly from universities evaluating openDesk Edu: *"Couldn't we reach the same compliance level with Microsoft 365?"* The honest answer deserves its own section — because it is largely *yes*, and the gap is illuminating.

### What M365 covers well

Microsoft 365, combined with the full compliance stack (Entra ID P2, Purview, Defender, Compliance Manager), can in our estimation satisfy **~60–70% of the 111 checklist points directly** (internal estimate, not an official audit):

- **IAM & access** — arguably stronger out of the box than a DIY Keycloak setup: MFA, Conditional Access, Privileged Identity Management, fine-grained RBAC.
- **Data protection** — Purview sensitivity labels, DLP across Exchange/SharePoint/Teams/endpoints, retention and legal hold, customer-managed keys, Customer Lockbox.
- **Device hardening** — Intune compliance policies, BitLocker, patch rings cover the client side.
- **Physical security** — covered by Microsoft's data centers and their BSI C5 Type 2 and ISO 27001 attestations.

### What M365 cannot cover

Another **~15–20%** is only reachable via *provider attestation* rather than self-enforcement — the accepted bridge under the IT-Grundschutz cloud module OPS.3.1. And a **structural ~10–15%** remains that no tenant configuration can close:

| Area | Why M365 alone can't reach it |
|------|-------------------------------|
| Network security (INF.5) | You have no network to segment — tenant-level controls (Conditional Access, external sharing) are not a substitute for your own segmentation and firewalls. |
| System hardening (INF.1) | No pods, no seccomp, no capability drops — the workload-hardening checklist items are simply void. |
| Full auditability | The Unified Audit Log is bounded (90 days default), has logging gaps, and lives in Microsoft's cloud rather than your own Loki/SIEM. |
| Sovereignty | The EU Data Boundary fixes *residency*, not *jurisdiction* — US authorities can still compel access (CLOUD Act). The BSI published a [notice on the use of Microsoft 365 in public administration](https://www.bsi.bund.de/SharedDocs/CyberSicherheitswarnungen/TechnischeWarnungen/2023/Hinweis_Microsoft_365_public_cloud.html) in 2023 highlighting these risks. |
| Self-hosted services | ILIAS, Moodle, JupyterHub, Nextcloud, Matrix have no M365 counterpart — they run on your own infrastructure and need exactly the Kyverno/GitOps/k8up treatment described here. |
| Backup | Native retention is not backup — you need a third-party tool (Veeam, AvePoint, …). |

### The honest framing

A **hybrid path** is what German universities actually run: M365 A3/A5 for collaboration, sovereign open-source services for sensitive workloads, third-party backup, Sentinel as SIEM, and your own governance documentation. That reaches the ~85–90% band in our estimation — but it is no longer a pure M365 story, and the last ~10% is policy, not technology.

So the answer to "how far with M365?" is: *~70% of the controls via the Microsoft compliance stack, ~20% via BSI C5 attestation, ~10% structural residual that requires sovereignty decisions — and that residual is precisely why openDesk exists.* (All percentage figures are internal estimates, not certified audit values.)

## Why This Matters for Universities

For a university evaluating openDesk Edu, the compliance story matters in three concrete ways:

1. **It's verifiable.** The gap analysis, the policies, and the roadmap are public. You don't have to trust a marketing claim — you can inspect the policy code.
2. **It's your baseline, not a vendor's.** ZKI IT-Grundschutz is the framework *your* IT center works under. Alignment means openDesk Edu speaks the same security language as your institution.
3. **It's continuous.** Compliance is enforced in the pipeline, not asserted in a document. When the platform changes, the policies enforce the baseline — automatically.

## Contribute

The ZKI compliance work is open source like everything else at openDesk Edu. If your institution has experience with BSI IT-Grundschutz, ZKI working groups, or ISIS12 — or if you want to help close the remaining P0 gaps — we'd love your review.

**Explore the repository, review the policies, and help us reach 90%+.**

[Visit opendesk-edu.org for architecture documentation and deployment guides](https://opendesk-edu.org)

---

## Notes and Sources

- **Not an official audit:** The percentage figures mentioned in this article (37%, 81%, 60–70%, 85–90%) are internal self-assessments by the openDesk Edu team, not certified audit findings and not an official BSI or ZKI assessment.
- **No ZKI or BSI endorsement:** The use of "ZKI" in policy names (e.g., `zki-require-non-root`) is a reference to the ZKI IT-Grundschutz-Profil, not an official certification or recommendation by ZKI or BSI. openDesk Edu is not certified by ZKI or BSI.
- **Trademark notice:** All product and service names mentioned in this article (Microsoft 365, Entra ID, Purview, Defender, Compliance Manager, Sentinel, Veeam, AvePoint, Keycloak, ArgoCD, Shibboleth, DFN-AAI, Loki, Prometheus, Grafana, BitLocker, Intune, ILIAS, Moodle, JupyterHub, Nextcloud, Matrix) are trademarks or registered trademarks of their respective owners. They are mentioned for informational and technical description purposes only.
- **Sources:** [BSI notice on Microsoft 365 (2023)](https://www.bsi.bund.de/SharedDocs/CyberSicherheitswarnungen/TechnischeWarnungen/2023/Hinweis_Microsoft_365_public_cloud.html) · [BSI IT-Grundschutz](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/IT-Grundschutz_node.html) · [BSI C5 attestation](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Cloud-Computing/C5/c5_node.html) · [CLOUD Act](https://www.congress.gov/bill/115th-congress/house-bill/4943)
- **Comparative disclaimer:** The comparison with Microsoft 365 is provided for informational purposes only and is not intended to disparage Microsoft or its products. The properties attributed to Microsoft 365 are based on its public documentation.
