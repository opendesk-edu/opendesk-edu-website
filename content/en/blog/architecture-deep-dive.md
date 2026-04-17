---
title: "Architecture Deep Dive: How openDesk Edu Works"
date: "2026-04-17"
description: "A technical deep dive into the openDesk Edu architecture — Kubernetes orchestration, SAML federation, Keycloak SSO, and modular service design."
categories: ["technical", "architecture"]
tags: ["architecture", "kubernetes", "saml", "keycloak", "deep-dive"]
---

# Architecture Deep Dive: How openDesk Edu Works

This post takes a closer look at the technical architecture behind openDesk Edu. If you are evaluating the platform for your institution or considering contributing, this should give you a clear picture of how the pieces fit together.

## The Foundation: openDesk CE

openDesk Edu is a superset of openDesk Community Edition v1.13.x. It inherits the core workplace services that openDesk CE provides: Nextcloud for file sharing, Jitsi Meet for video calls, a choice of Open-Xchange, SOGo, or Grommunio for groupware, Collabora Online for document editing, and Keycloak for identity management. These services are battle-tested in production deployments across public administrations and enterprises.

On top of this foundation, openDesk Edu adds 15 education-specific services: ILIAS, Moodle, BigBlueButton, OpenCloud, Etherpad, CryptPad, BookStack, Planka, Zammad, LimeSurvey, LTB SSP, Draw.io, Excalidraw, and TYPO3. All 25 services share the same authentication, networking, and storage infrastructure.

## Kubernetes-Native Deployment

Everything in openDesk Edu runs on Kubernetes. Each service is packaged as a Helm chart, and the full stack is orchestrated through helmfile. A single `helmfile apply` command renders the charts with your configuration and deploys them to your cluster.

The configuration system uses `global.yaml.gotmpl`, a Go template file that centralizes all deployment parameters. You set your domain, mail settings, storage classes, and feature flags in one place, and the values propagate to every chart. This means you can configure the entire platform without editing individual chart values files.

Helmfile also handles dependency ordering. Services that depend on Keycloak or the ingress controller are deployed after their dependencies are ready. If you enable only a subset of services, helmfile skips the ones you turned off and only deploys what you need.

## Unified Authentication

Keycloak sits at the center of the authentication layer. Every service in openDesk Edu delegates authentication to Keycloak, whether through OpenID Connect, SAML 2.0, or service-specific protocols. Users sign in once at the Nubus portal and can navigate to any application without being prompted for credentials again.

Nubus acts as both the user portal and the identity and access management (IAM) layer. It provides a launchpad for all enabled services, displays user profile information, and handles session management. When a user logs in through Nubus, Keycloak issues a session token that is recognized by every downstream service.

User provisioning happens automatically. When a new user authenticates for the first time through the SAML federation or a local identity provider, Keycloak creates the user account and provisions it across all enabled services. There is no need for separate account creation in ILIAS, Moodle, Nextcloud, or any other application.

## SAML Federation for Education

One of the key differentiators of openDesk Edu is its support for SAML federation through DFN-AAI and eduGAIN. In a federated setup, the institution's identity provider (IdP) handles authentication, and openDesk Edu acts as a service provider (SP) in the federation.

Keycloak connects to the federation as a SAML SP and translates incoming assertions into internal user attributes. Attributes like `eduPersonPrincipalName`, `eduPersonAffiliation`, and `eduPersonEntitlement` are mapped to Keycloak roles and group memberships, which then propagate to the individual services.

For ILIAS, Moodle, and BigBlueButton, which each implement their own SAML SP interfaces, openDesk Edu deploys Shibboleth as a SAML proxy. Shibboleth receives the assertion from Keycloak, applies attribute filtering rules, and passes the result to the application. This two-hop approach keeps the federation metadata clean and allows per-service attribute policies.

## Backup & Resilience

Data protection in openDesk Edu is handled by k8up, a Kubernetes operator built on top of restic. k8up watches for `Backup` custom resources and automatically creates snapshots of all persistent volumes on a configurable schedule.

The backup process covers databases, file storage, and configuration. Each service's Helm chart includes backup annotations that tell k8up which volumes to include and which ones to exclude. Backups are stored in an S3-compatible bucket or any other restic-supported backend.

For disaster recovery, the restic backup format supports incremental snapshots with deduplication. Restoring a service means pointing k8up at a specific snapshot and letting it recreate the volumes. The process is documented and can be automated as part of an incident response playbook.

## Certificate Management

openDesk Edu integrates openDesk Certificates by Bundesdruckerei for automated TLS certificate provisioning. The certificate operator runs inside the cluster and requests certificates from the Bundesdruckerei CA, handling renewal and distribution without manual intervention.

If your institution uses a different certificate authority or operates its own internal CA, the system also works with cert-manager and standard ACME providers like Let's Encrypt. The Helm charts accept custom certificate configuration through the global template.

## Choosing Your Stack

openDesk Edu deliberately offers alternatives within several service categories. The idea is that institutions should pick what fits their existing workflows and expertise, not what a vendor decides for them.

For email and groupware, you can choose between Open-Xchange, SOGo, and Grommunio. Each has different strengths in terms of feature set, resource requirements, and admin familiarity. For video conferencing, Jitsi Meet works well for small-to-medium meetings, while BigBlueButton is designed for structured virtual classroom sessions with up to hundreds of participants. For file sharing, Nextcloud is the default, and OpenCloud provides a variant tuned for educational use cases.

The whiteboard and document collaboration category includes Excalidraw for lightweight sketching, CryptPad for encrypted collaboration, and Etherpad for structured collaborative writing. All three can be enabled simultaneously if needed.

## Looking Ahead

The architecture continues to evolve. Near-term priorities include stabilizing the beta services based on production feedback, adding more federation options beyond DFN-AAI, and building monitoring dashboards that give administrators visibility into service health across the entire stack. The modular design means new services can be added as additional Helm charts without changing the core orchestration layer.

If you want to see the code, charts, and configuration yourself, everything is available on Codeberg:

[https://codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu)
