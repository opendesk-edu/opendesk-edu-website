---
title: "BookStack"
date: "2026-04-17"
description: "Structured wiki with book, chapter, and page hierarchy for course materials, SOPs, and documentation."
categories: ["education", "productivity", "beta"]
tags: ["bookstack", "wiki", "documentation", "knowledge-management"]
---

# BookStack

BookStack is a structured wiki platform that organizes content into shelves, books, chapters, and pages. This hierarchy makes it intuitive for managing course materials, standard operating procedures, and institutional documentation. BookStack is an education-specific Beta component in openDesk Edu.

## Key Features

- **Hierarchical structure**: Organize content with shelves, books, chapters, and pages for clear information architecture.
- **WYSIWYG and markdown**: Switch between a rich text editor and a markdown editor based on preference.
- **Search and cross-linking**: Full-text search across all content with easy cross-linking between pages.
- **Role-based permissions**: Control access at the book, chapter, or page level with granular roles.
- **Drawing tool**: Built-in drawing tool for simple annotations and diagrams within pages.

## Integration with openDesk Edu

BookStack integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users access content directly from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. BookStack is an alternative to XWiki for institutions that prefer a simpler, more structured wiki. Persistent content data is backed up through k8up.
