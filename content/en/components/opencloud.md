---
title: "OpenCloud"
date: "2026-03-29"
description: "Lightweight CS3-based cloud storage with per-course sharing capabilities as an alternative to Nextcloud."
categories: ["storage", "education", "beta"]
tags: ["opencloud", "files", "cloud-storage", "alternative"]
---

# OpenCloud

OpenCloud is a lightweight cloud storage solution built on the Collaborative Services 3 (CS3) standard. It provides file storage and sharing with per-course sharing capabilities designed for educational workflows. OpenCloud is an education-specific Beta component in openDesk Edu and serves as an alternative to Nextcloud.

## Key Features

- **CS3-based storage**: Built on the open CS3 standard for interoperability with other compliant services.
- **Per-course sharing**: Share files and folders with specific courses, classes, or student groups.
- **Lightweight design**: Lower resource requirements than Nextcloud for environments with limited capacity.
- **File versioning**: Track changes to files and restore previous versions when needed.
- **WebDAV access**: Access files from desktop clients and mobile apps via standard WebDAV protocol.

## Integration with openDesk Edu

OpenCloud integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users access their files from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. OpenCloud is an alternative to Nextcloud for institutions that prefer a lighter storage solution with per-course sharing. Persistent file data is backed up through k8up.

## Learn More

- [Official Documentation](https://opencloud.eu/support/documentation/) — Official docs and resources

