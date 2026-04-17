---
title: "TYPO3"
date: "2026-04-17"
description: "Enterprise content management system for university websites, department pages, and research portals."
categories: ["education", "beta"]
tags: ["typo3", "cms", "content-management", "websites"]
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

TYPO3 integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Content editors access the CMS from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. Persistent page content, media assets, and configuration data are backed up through k8up.
