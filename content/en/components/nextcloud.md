---
title: "Nextcloud"
date: "2026-04-17"
description: "Full-featured cloud storage and collaboration suite with file sync, sharing, and office integration."
categories: ["storage", "productivity", "base"]
tags: ["nextcloud", "files", "cloud-storage", "collaboration"]
---

# Nextcloud

Nextcloud is a full-featured cloud storage and collaboration platform that handles file syncing, sharing, and online document editing. It supports external storage mounts, file versioning, and integrates with Collabora for in-browser office editing. As a base openDesk CE component, it is the default files solution and ships production-ready.

## Key Features

- **File sync and share**: Desktop and mobile clients with selective sync, public links, and password-protected shares.
- **Online editing**: Integrate with Collabora for editing documents, spreadsheets, and presentations directly in the browser.
- **Version control**: Automatic file versioning with the ability to restore previous versions.
- **External storage**: Mount SMB, FTP, S3, and other external storage backends.
- **User and group management**: Fine-grained permission controls for sharing files and folders with individuals or groups.

## Integration with openDesk Edu

Nextcloud integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users access their files directly from the unified Nubus portal. It deploys as a modular Helm chart and serves as the default cloud storage component. Persistent file data is backed up through k8up.
