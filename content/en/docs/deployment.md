---
title: "Deployment Guide"
date: "2026-04-15"
description: "Step-by-step guide for deploying openDesk Edu on your university's Kubernetes infrastructure."
categories: ["deployment", "guide"]
tags: ["deployment", "kubernetes", "helm", "helmfile", "keycloak"]
---

# Deployment Guide

openDesk Edu is a modular digital workspace designed for educational institutions. It packages collaboration tools, learning management systems, and office applications into a single platform that runs on Kubernetes. All services are distributed as Helm charts and orchestrated through helmfile, so the entire stack deploys with a single command.

This guide covers the full deployment process from a fresh cluster to a running platform with authentication, backups, and TLS certificates.

## Prerequisites

Before you begin, make sure you have the following in place:

- **Kubernetes 1.28 or later**. openDesk Edu uses features like CRDs and Pod security admission that require a modern cluster. Managed offerings like Hetzner Cloud Kubernetes, OVH Managed Kubernetes, or on-premises clusters with kubeadm all work.
- **Helm 3** installed and configured with cluster access.
- **helmfile** installed. This is the orchestration layer that reads your configuration and applies all Helm releases in the correct order.
- **A domain name with DNS control**. You need a base domain (for example, `desk.uni-example.de`) and the ability to create subdomain records for each service.
- **SAML IdP access**. openDesk Edu authenticates users through Keycloak, which connects to your university's identity provider. In Germany, this typically means a DFN-AAI or eduGAIN federation member.
- **Minimum 16 GB RAM and 4 CPU cores**. This is the baseline for the core openDesk services. The education services (ILIAS, Moodle, BigBlueButton, OpenCloud) add significant resource requirements. For a production deployment with all services enabled, plan for 32 GB RAM and 8 CPU cores or more.

## Quick Start

The fastest path to a running openDesk Edu instance takes four steps.

### 1. Clone the repository

```bash
git clone https://git.opencode.de/opendesk/edu-deployment.git
cd edu-deployment
```

This repository contains the helmfile configuration, environment definitions, and custom value overrides for all openDesk Edu services.

### 2. Edit the global configuration

Open `helmfile/environments/default/global.yaml.gotmpl` in your editor. At minimum, you need to set your domain and choose which services to enable:

```yaml
domain: desk.uni-example.de

services:
  keycloak:
    enabled: true
  nextcloud:
    enabled: true
  ox:
    enabled: false
  sogo:
    enabled: false
  grommunio:
    enabled: true
  jitsi:
    enabled: false
  bbb:
    enabled: true
  ilias:
    enabled: true
  moodle:
    enabled: false
  opencloud:
    enabled: true
  excalidraw:
    enabled: true
  cryptpad:
    enabled: false
```

Each service can be toggled independently. The configuration file uses Go template syntax (`.gotmpl`), which lets you reference shared values like the domain across all service definitions.

### 3. Deploy

```bash
helmfile -e default apply
```

helmfile reads the environment configuration, resolves all dependencies between services, and applies each Helm chart in order. Keycloak deploys first because other services depend on it for authentication. Plan for 10 to 20 minutes on a fresh cluster depending on which services you enabled and your network speed.

### 4. Access your services

Once the deployment completes, each service is available at its subdomain:

| Service | URL |
|---------|-----|
| Keycloak Admin | `https://keycloak.desk.uni-example.de` |
| Nextcloud | `https://nextcloud.desk.uni-example.de` |
| Grommunio | `https://grommunio.desk.uni-example.de` |
| BigBlueButton | `https://bbb.desk.uni-example.de` |
| ILIAS | `https://ilias.desk.uni-example.de` |
| OpenCloud | `https://opencloud.desk.uni-example.de` |

The Keycloak admin credentials are generated during the first deployment and stored in a Kubernetes secret. Retrieve them with:

```bash
kubectl get secret -n opendesk keycloak-admin -o jsonpath='{.data.password}' | base64 -d
```

## Configuration

The file `helmfile/environments/default/global.yaml.gotmpl` is the central configuration for your entire openDesk Edu installation. Every service reads values from this file, and you can override any Helm chart default here.

### Domain and ingress

The `domain` field sets the base URL for all services. Each chart constructs its own ingress rule by appending its service name (for example, `nextcloud`) to the base domain. If you use a reverse proxy or an external load balancer, you can also set `ingress.className` to point to your Ingress controller.

### Keycloak settings

Keycloak acts as the central identity broker. In the global configuration you can set the admin username, the realm name, and the default theme. Authentication flows and client registrations for each service are handled automatically by the Helm charts.

### Alternative components

openDesk Edu offers multiple implementations for several service categories. You choose which one to enable, and the configuration file ensures only one per category is active:

- **Email**: Open-Xchange (OX), SOGo, or Grommunio
- **Video conferencing**: Jitsi Meet or BigBlueButton
- **File storage**: Nextcloud or OpenCloud
- **Whiteboard**: Excalidraw or CryptPad

Set `enabled: true` on the component you want and `enabled: false` on the others in the same category. Never enable two alternatives simultaneously, as they would conflict on ingress routes and Keycloak client IDs.

## Authentication Setup

Keycloak serves as the central identity provider for all openDesk Edu services. It supports both SAML 2.0 and OpenID Connect (OIDC), which lets it integrate with your existing university infrastructure and provide single sign-on across every application.

### Connecting to your university IdP

Most German universities participate in the DFN-AAI federation, which is part of the global eduGAIN network. Keycloak connects to these federations through a SAML 2.0 identity provider (IdP) binding.

To configure the connection:

1. Log in to the Keycloak admin console at `https://keycloak.desk.uni-example.de`.
2. Navigate to your realm and create a new Identity Provider of type SAML 2.0.
3. Enter your university's IdP metadata URL (provided by your DFN-AAI federation operator).
4. Configure the SAML entity ID to match the value registered with your federation.
5. Enable the identity provider and test the login flow.

### Protocol support

Each downstream service uses the protocol that suits it best:

- **SAML 2.0**: Used by ILIAS and Moodle through Shibboleth Service Provider (SP) configuration. These LMS platforms expect SAML assertions from a trusted IdP, and Keycloak delivers them.
- **OIDC**: Used by Nextcloud, OpenCloud, Grommunio, BigBlueButton, and Excalidraw. OIDC is the more modern protocol and is easier to configure for web applications.

### Shibboleth SP for LMS services

ILIAS and Moodle use Shibboleth as their Service Provider to consume SAML assertions from Keycloak. The openDesk Edu Helm charts include Shibboleth SP sidecar containers for these services. The SP configuration is generated automatically based on the Keycloak realm settings, so you do not need to manually edit Shibboleth XML files.

## Component Selection

openDesk Edu is modular. You enable only the services your institution needs, which keeps resource usage manageable and simplifies maintenance. All services are controlled from `global.yaml.gotmpl`.

### Core services

- **Keycloak**: Required. This is the authentication backbone and cannot be disabled.
- **Element Web (Matrix)**: The messaging and collaboration hub. Enabled by default.

### Email alternatives

Pick one:

- **Open-Xchange (OX)**: Feature-rich groupware with calendar, contacts, and email. Best suited for institutions that need tight integration with other OX components.
- **SOGo**: Lightweight groupware with good ActiveSync support. Works well for smaller deployments.
- **Grommunio**: Full Microsoft Exchange replacement with native Outlook compatibility. Stores mail data in MariaDB.

### Video conferencing

Pick one:

- **Jitsi Meet**: Lightweight, peer-to-peer video. Lower resource requirements. Good for meetings up to roughly 25 participants.
- **BigBlueButton (BBB)**: Purpose-built for online teaching. Supports recording, breakout rooms, whiteboards, and presentation upload. Requires more resources but is the standard for virtual classrooms.

### File storage

Pick one:

- **Nextcloud**: Mature, widely used. Extensive app ecosystem for document editing, calendar, and task management.
- **OpenCloud**: Nextcloud fork with additional enterprise features and tighter integration with the openDesk stack.

### Whiteboard

Pick one:

- **Excalidraw**: Simple, intuitive collaborative whiteboard. Great for quick sketches and brainstorming.
- **CryptPad**: End-to-end encrypted collaborative suite including a whiteboard. Stronger privacy guarantees.

### Education services

- **ILIAS**: Learning management system widely used in German higher education. Supports SCORM, LTI, and integrated authoring tools.
- **Moodle**: The world's most popular LMS. Extensive plugin ecosystem and large community.

## Backup Configuration

openDesk Edu uses the k8up operator with restic under the hood. k8up runs as a Kubernetes controller and creates scheduled backups according to `Schedule` CRDs defined in the Helm charts.

### What gets backed up

The backup configuration covers the following data:

- **LMS content**: ILIAS data directories and Moodle file storage, including uploaded course materials, user submissions, and SCORM packages.
- **BigBlueButton recordings**: Meeting recordings stored on persistent volumes. These can be large, so monitor storage usage.
- **Nextcloud / OpenCloud files**: User files, shared folders, and app data stored on persistent volumes.
- **Grommunio data**: MariaDB database dumps containing mail, calendar, and contact data for all Grommunio users.

### Restic repository

Backups are stored in a restic repository. You configure the repository location (S3-compatible storage is recommended for off-site durability) and the encryption password in the global configuration. The first backup takes time depending on data volume. Subsequent runs use restic's deduplication and only transfer changed data.

### Restore

To restore from a backup, use the k8up `Restore` CRD. Point it at a specific snapshot and the operator handles the rest, mounting the restored data into the appropriate pods.

## Certificate Management

openDesk Edu uses openDesk Certificates by Bundesdruckerei for TLS. This service provides automated certificate provisioning and renewal for all service subdomains.

The certificate operator runs as a Kubernetes controller. It requests certificates for each Ingress resource and handles renewal before expiry. You do not need to manually manage certificates or set up external ACME clients.

If your institution requires certificates from a different CA, you can configure the certificate operator to use your preferred provider. The Ingress resources reference the certificates through Kubernetes TLS secrets, so the downstream services do not need any certificate-related configuration.

## Next Steps

- Read the **Architecture Overview** to understand how the services interact and how data flows between them.
- Visit individual **component pages** for service-specific configuration options, resource tuning, and integration guides.
- Check the **Troubleshooting** section if you run into issues during deployment.
