---
title: "System Architecture Overview"
date: "2026-04-15"
description: "An overview of the openDesk Edu system architecture, including Kubernetes orchestration, SAML federation with DFN-AAI and eduGAIN, unified Keycloak SSO, and the full service catalog of 25 components."
categories: ["architecture", "infrastructure"]
tags: ["architecture", "kubernetes", "saml", "keycloak", "federation"]
---

# System Architecture Overview

openDesk Edu extends the openDesk Collaboration Environment (CE) with a dedicated layer of education services, creating a unified digital workspace for schools, universities, and research institutions. Built on openDesk CE v1.13.x, the platform packages 25 services into a single deployable Kubernetes cluster with centralized authentication, automated backups, and certificate management from Bundesdruckerei. Everything ships under the Apache-2.0 license and deploys with a single command: `helmfile -e default apply`.

## Core Principles

**Container-Native Design**

Every service runs as a container image orchestrated by Kubernetes 1.28+. Helm 3 charts manage individual service deployments, while helmfile orchestrates the full stack declaratively. Configuration lives in `helmfile/environments/default/global.yaml.gotmpl`, giving operators a single file to tune service settings, resource limits, and feature flags across the entire platform. This approach means you can update a single component without touching the rest of the stack, and roll back just as easily.

**Federated Identity**

Authentication flows through Keycloak as the central identity provider, speaking both SAML 2.0 and OpenID Connect. Institutions plug into national research federations (DFN-AAI in Germany, eduGAIN internationally) so students and staff use their existing university credentials. Shibboleth acts as a SAML service provider for services that need it, like ILIAS, Moodle, and BigBlueButton. Nubus adds a self-service portal layer for identity and access management.

**Data Sovereignty**

All data stays within the institution's infrastructure. No component phones home or depends on external SaaS endpoints. Persistent storage lives on Kubernetes PersistentVolumes, backed up automatically by the k8up operator using restic. TLS certificates come from openDesk Certificates (Bundesdruckerei), keeping the trust chain entirely under institutional control.

**Modular Architecture**

The 25 services are grouped by function and can be enabled or disabled independently through helmfile values. Want only the LMS layer? Deploy ILIAS and Moodle without the groupware or video stack. Need groupware but not surveys? Leave LimeSurvey out. Each component has its own Helm chart, its own database or storage claim, and its own scaling parameters.

## Technology Stack

| Component | Version / Details |
|-----------|-------------------|
| Kubernetes | 1.28+ |
| Helm | 3.x |
| helmfile | declarative orchestration |
| Keycloak | SAML 2.0 + OIDC IdP |
| Shibboleth | SAML SP for LMS/video services |
| Nubus | AGPL-3.0, v1.18.1, portal and IAM |
| k8up | Kubernetes backup operator |
| restic | backup storage backend |
| openDesk Certificates | TLS via Bundesdruckerei |
| Base platform | openDesk CE v1.13.x |

## Service Architecture

The platform is organized into three distinct layers:

**openDesk CE Base Layer**

This is the upstream openDesk Collaboration Environment, providing the core productivity and collaboration tools. It includes real-time chat (Element), file sharing (Nextcloud, OpenCloud), groupware (OX App Suite, SOGo), video conferencing (Jitsi), collaborative editing (Collabora, Etherpad), and knowledge management (XWiki, BookStack). These services are production-ready and track upstream openDesk CE releases.

**Education Services Layer**

On top of the base, openDesk Edu adds 15 education-focused services. This layer includes learning management systems (ILIAS, Moodle), virtual classrooms (BigBlueButton), institutional email (Grommunio), a content management system (TYPO3), survey tools (LimeSurvey), and more. All services in this layer carry a Beta status while the integration patterns are hardened.

**SSO and Auth Layer**

Keycloak sits at the center, brokering authentication for every service in both layers. It connects upstream to DFN-AAI or eduGAIN via SAML metadata exchange, and downstream to services via SAML 2.0 or OIDC depending on what each service supports. Shibboleth fills the gap for applications that require a dedicated SAML service provider, and Nubus provides the human-facing portal for end users to manage accounts, groups, and application access.

## Authentication and SAML Federation

Keycloak serves as the central identity provider for the entire platform. It supports two protocol families simultaneously:

- **SAML 2.0** for integration with national research federations and legacy service providers
- **OpenID Connect (OIDC)** for modern applications that prefer token-based authentication

**Federation Support**

The platform ships with metadata templates for DFN-AAI (the German research and education identity federation) and eduGAIN (the international inter-federation). Connecting to your institution's identity provider means registering your Keycloak instance with the federation, uploading the federation metadata, and configuring attribute mapping. After that, any user with a valid eduGAIN account from a participating institution can log in with their home credentials.

**Shibboleth Service Provider**

Some education services, notably ILIAS, Moodle, and BigBlueButton, require a dedicated SAML SP rather than direct OIDC. Shibboleth handles this by translating Keycloak's SAML assertions into the format these applications expect. Each service gets its own Shibboleth instance (or shared configuration where appropriate) with service-specific attribute filters.

**Nubus Portal**

Nubus (v1.18.1, AGPL-3.0) provides the user-facing layer of the identity stack. It gives end users a single place to view their profile, manage group memberships, launch applications, and handle password resets. For administrators, Nubus offers group management, role assignment, and audit logging across all connected services.

## Backup and Data Management

The k8up operator runs inside the Kubernetes cluster and manages automated backups using restic as the storage backend. Backups follow a configurable schedule:

- **Daily** for databases and application state
- **Weekly** full snapshots of persistent volumes
- **On-demand** manual triggers for pre-migration or disaster recovery

**What Gets Backed Up**

Persistent data from all services is included: LMS course content and user submissions (ILIAS, Moodle), BigBlueButton recording files, Nextcloud and OpenCloud user files, Grommunio mailboxes (backed via MariaDB dumps), Collabora document caches, and configuration state from Keycloak and Nubus. Non-persistent data like container images and ephemeral caches is excluded.

**Storage Targets**

Restic supports a wide range of storage backends, so institutions can direct backups to local NFS/S3-compatible storage, off-site object storage, or any restic-supported target. Encryption is built in: all backup data is encrypted at rest with a configurable key.

## Component Overview

The following table lists all 25 services in the openDesk Edu stack, grouped by function.

| Function | Service | Version | Status |
|----------|---------|---------|--------|
| **Chat** | Element | 1.12.6 | Stable |
| **Notes** | Notes | 4.4.0 | Stable |
| **Diagrams** | Draw.io | 29.6 | Stable |
| **Diagrams** | Excalidraw | latest | Stable |
| **Files** | Nextcloud | 32.0.6 | Stable |
| **Files** | OpenCloud | 4.0.3 | Beta |
| **Groupware** | OX App Suite | 8.46 | Stable |
| **Groupware** | SOGo | 5.11 | Stable |
| **Groupware** | Grommunio | 2025.01 | Beta |
| **Wiki** | XWiki | 17.10.4 | Stable |
| **Wiki** | BookStack | 26.03 | Stable |
| **Portal / IAM** | Nubus | 1.18.1 | Beta |
| **Projects** | OpenProject | 17.2.1 | Stable |
| **Meetings** | Jitsi | 2.0.10590 | Stable |
| **Office** | Collabora | 25.04.8 | Stable |
| **Collab Editing** | Etherpad | 1.9.9 | Stable |
| **Collab Editing** | CryptPad | 2025.9.0 | Stable |
| **LMS** | ILIAS | 7.28 | Beta |
| **LMS** | Moodle | 4.4 | Beta |
| **Lectures** | BigBlueButton | 2.7 | Beta |
| **Kanban** | Planka | 2.1.0 | Stable |
| **Helpdesk** | Zammad | 7.0 | Stable |
| **Surveys** | LimeSurvey | 6.6 | Beta |
| **Password Reset** | LTB SSP | 1.7 | Beta |
| **CMS** | TYPO3 | 13.4 | Beta |

Services marked "Stable" ship as part of the upstream openDesk CE release. Services marked "Beta" are part of the openDesk Edu education layer and are actively being stabilized.

## Alternative Components

Several functional areas offer multiple service options, letting institutions choose the tool that best fits their needs:

- **Email**: OX App Suite, SOGo, or Grommunio
- **Video Conferencing**: Jitsi or BigBlueButton
- **File Storage**: Nextcloud or OpenCloud
- **Whiteboard**: Excalidraw or CryptPad

Each alternative uses the same Keycloak authentication, the same backup pipeline, and the same certificate infrastructure. Switching between alternatives is a matter of enabling one chart and disabling another in your helmfile values. For a detailed comparison of features, licensing, and resource requirements, see the [component comparison page](/components/comparison).
