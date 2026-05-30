---
title: "TYPO3"
date: "2026-03-04"
description: "Enterprise-grade content management system for creating and managing institutional websites and portals."
categories: ["cms", "portal", "content"]
tags: ["typo3", "cms", "content-management", "website"]
version: "13"
---

# TYPO3

TYPO3 is an enterprise-grade content management system designed for building and managing large-scale websites. It powers university homepages, department sites, research portals, and institutional landing pages. TYPO3 is an education-specific Beta component in openDesk Edu.

## Key Features

- **Multi-site management**: Run multiple websites from a single TYPO3 instance with shared or separate content.
- **Flexible content modeling**: Define custom content types and page structures through the TYPO3 backend.
- **Frontend editing**: Content editors can modify pages directly on the frontend without switching to the backend.
- **Multilingual support**: Built-in translation workflow with support for any number of languages.
- **Extensibility**: Large extension repository for adding features like forms, news, calendars, and SEO tools.

## Integration with openDesk Edu

TYPO3 integrates with openDesk Edu through Keycloak-based SSO using SAML 2..0 and OIDC. Content editors access the CMS from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. Persistent page content, media assets, and configuration data are backed up through k8up.

## Learn More

- [Official Documentation](https://docs.typo3.org) — Official docs and resources

