---
title: "Nubus"
date: "2026-04-17"
description: "Unified portal and identity management built on Keycloak with SAML 2.0 and OIDC authentication."
categories: ["infrastructure", "base"]
tags: ["nubus", "keycloak", "portal", "iam", "sso"]
---

# Nubus

Nubus is the unified portal and identity access management layer in openDesk Edu, built on Keycloak. It provides a single entry point for all applications and handles authentication via SAML 2.0 and OIDC protocols. Every other component in openDesk Edu authenticates through Nubus. As a base openDesk CE component, it is the central IAM hub and ships production-ready.

## Key Features

- **Unified portal**: Single web interface that aggregates links to all openDesk Edu applications.
- **SAML 2.0 and OIDC**: Dual-protocol support for identity federation with external identity providers.
- **User provisioning**: Automatic user and group provisioning from LDAP/Active Directory sources.
- **Single sign-on**: One login grants access to all connected applications without re-authentication.
- **Role-based access control**: Assign roles and permissions per application from a central administration console.

## Integration with openDesk Edu

Nubus is the central IAM component of openDesk Edu. All other components authenticate through Keycloak using SAML 2.0 or OIDC. It deploys as a modular Helm chart and serves as the gateway to the unified portal. As the identity backbone, it does not require backup through k8up itself, but its configuration and realm data are preserved through standard Kubernetes secret and config management.
