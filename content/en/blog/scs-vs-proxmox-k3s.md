---
title: "SCS vs. Proxmox + K3s: Choosing a Base for openDesk Edu"
date: "2026-08-06"
description: "openDesk Edu is Kubernetes-native, so the platform decision comes first. A neutral comparison of SCS and Proxmox VE with K3s for universities — governance, certification, portability, and operations."
categories: ["Architecture"]
tags: ["scs", "sovereign-cloud-stack", "proxmox", "k3s", "kubernetes", "architecture", "procurement", "sovereignty"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/scs-vs-proxmox-k3s-teaser.svg"
---

# SCS vs. Proxmox + K3s: Choosing a Base for openDesk Edu

The base platform decision comes before the service decision. openDesk Edu is Kubernetes-native — its services ship as Helm charts, GitOps manifests, and container images — so the practical question for an institution is not which applications to run, but how to obtain a Kubernetes platform that a small team can operate sustainably. This article compares two widely used approaches in German higher education: the Sovereign Cloud Stack (SCS) standard and a self-operated stack of Proxmox VE with K3s. It describes both factually and outlines the factors that typically decide between them.

## Two Approaches to the Same Requirement

### SCS: A Standard, Not a Product

The Sovereign Cloud Stack (SCS) is a standard for sovereign cloud infrastructure, developed by a community under the auspices of the Open Source Business Alliance (OSBA). It defines interoperable layers for infrastructure-as-a-service (OpenStack-based) and container platforms (Kubernetes), along with reference implementations that providers and operators can adopt.

SCS is significant because it operates at the level of **certification**. Operators can achieve SCS-compatible or SCS-sovereign status, which signals that their cloud offers standardized, portable interfaces. For public-sector institutions, this certification is relevant to procurement: it provides a documented basis for comparing providers, and it aligns with compliance frameworks such as the German government's container requirements.

The key property of SCS is **portability through standardization** — a workload that runs on one SCS-certified platform should run on any other, and the interfaces are specified openly rather than by a single vendor.

### Proxmox VE + K3s: A Self-Operated Stack

Proxmox VE is an open-source virtualization platform (KVM and LXC based) maintained by Proxmox Server Solutions GmbH, with a large community in European higher education. K3s is a lightweight, CNCF-certified Kubernetes distribution maintained by SUSE/Rancher, designed for resource-constrained and edge deployments.

Combined, they form a pragmatic, fully self-operated platform: Proxmox VE provides virtualization and storage management, K3s provides the Kubernetes control plane on top. This combination is popular in universities because it is operable by a small team, well documented, and free of subscription obligations in its basic form.

The key property of this approach is **operational simplicity** — two well-understood open-source components, no certification process, and complete control over every layer.

## Comparison

| Dimension | SCS | Proxmox VE + K3s |
|-----------|-----|------------------|
| **What it is** | A standard with reference implementations | A concrete virtualization and container stack |
| **Governance** | Community-driven under OSBA, public funding context | Vendor-maintained (open source), community ecosystem |
| **Certification** | SCS-compatible / SCS-sovereign levels | None |
| **Portability** | Standardized interfaces between certified platforms | Specific to the chosen components |
| **Operations** | Requires understanding of the full SCS reference stack | Two components, well-documented, small-team friendly |
| **Procurement fit** | Directly usable in sovereign cloud procurement | Indirect — evaluated on technical merits |
| **Sovereignty alignment** | Explicit goal of the standard | Achieved through self-operation of open source |
| **Typical operator** | Cloud providers, larger institutions, consortia | Single institutions, small IT teams |

Neither approach is inherently better; they address different institutional contexts.

## Decision Factors

### Team Size and Skills

SCS presumes the capacity to operate a full cloud stack — even with reference implementations, the operational surface is large. Proxmox VE + K3s fits institutions where two or three people run the entire platform. If the team can already operate OpenStack or a certified SCS platform, SCS is the lower marginal cost; if the team's strength is virtualization and Linux administration, the Proxmox + K3s route is more direct.

### Procurement and Compliance Context

For institutions that must demonstrate interoperability or participate in sovereign cloud procurement frameworks, SCS certification is a documented, auditable asset. For institutions procuring hardware and software directly, the self-operated stack can be specified on technical merits alone.

### Portability Needs

If workloads must be movable between providers — for example, as part of a consortium or a cloud strategy with several providers — SCS's standardized interfaces reduce the cost of that movement. If workloads stay on institutional hardware for their lifetime, portability between providers is rarely exercised, and the simpler stack suffices.

### What openDesk Edu Requires from Either Base

Regardless of the choice, openDesk Edu imposes the same base requirements:

- Kubernetes 1.28 or later, with a working ingress controller and persistent storage classes
- Identity federation via SAML or OIDC (openDesk Edu ships Keycloak, which can federate with DFN-AAI / eduGAIN)
- GitOps tooling (ArgoCD) or Helm/Helmfile-based deployment
- Monitoring and logging (the platform includes Prometheus, Grafana, and Loki)
- Container images from a registry the cluster can reach

Both SCS-certified platforms and K3s clusters satisfy these requirements. SCS adds standardized storage and networking interfaces; Proxmox + K3s provides them through the chosen components directly.

## Practical Observations

- **Start with the smallest platform you can sustain.** Kubernetes itself is identical on both bases; the differences are in the surrounding infrastructure.
- **Storage is the decisive operational factor.** Both approaches need reliable persistent storage classes; Proxmox VE's native storage management and SCS's standardized storage interfaces both work, but the operations model differs.
- **Upgrades differ in scope.** K3s upgrades are small and frequent; SCS reference stack upgrades touch more components. Institutions with limited upgrade windows should account for this.
- **Neither approach locks you out of the other.** A Proxmox + K3s deployment can later be migrated to an SCS-certified platform using standard Kubernetes tooling, since the workload manifests are portable by design.

## Summary

| Consideration | Points toward |
|---------------|---------------|
| Small team, self-operated, direct control | Proxmox VE + K3s |
| Procurement certification, provider portability | SCS |
| Existing OpenStack / SCS skills | SCS |
| Existing virtualization / Linux skills | Proxmox VE + K3s |
| Workloads stay on institutional hardware | Proxmox VE + K3s |
| Consortium or multi-provider cloud strategy | SCS |

openDesk Edu runs on Kubernetes; it does not prescribe the base. The choice between SCS and Proxmox + K3s is a choice about governance, portability, and the operational capacity of the institution — not about the applications themselves.

---

## Get Started

1. **Review the requirements**: The [deployment guide](/en/blog/deploying-opendesk-edu) describes what any base platform must provide.
2. **Evaluate both bases**: Use the decision factors above against your institution's team, procurement, and portability context.
3. **Join the discussion**: The openDesk Edu community welcomes reports from institutions running either base. Share your experience in the [community of practice](/en/blog/community-of-practice-juni-2026).

---

*openDesk Edu is the education variant of [openDesk](https://opendesk.eu), extended with a comprehensive suite of services for research and teaching. Source code is available on [GitHub](https://github.com/tobias-weiss-ai-xr/opendesk-nix) and [opencode.de](https://gitlab.opencode.de/umr).*
