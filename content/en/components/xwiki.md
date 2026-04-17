---
title: "XWiki"
date: "2026-04-17"
description: "Enterprise wiki platform for knowledge management, documentation, and collaborative content creation."
categories: ["productivity", "base"]
tags: ["xwiki", "wiki", "knowledge-management", "documentation"]
---

# XWiki

XWiki is an enterprise wiki platform designed for knowledge management, documentation, and collaborative content creation. It supports structured content, scripting, and a rich extension ecosystem. As a base openDesk CE component, it ships stable and production-ready.

## Key Features

- **Structured content**: Create pages, spaces, and nested document hierarchies for organized knowledge bases.
- **Rich text editing**: WYSIWYG editor with tables, images, macros, and syntax highlighting.
- **Extension ecosystem**: Install applications and extensions from the XWiki marketplace for added functionality.
- **Programming support**: Script pages with Velocity, Groovy, or Python for custom workflows and automation.
- **Rights management**: Fine-grained access control at the space, page, and object level.

## Integration with openDesk Edu

XWiki integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users access the wiki directly from the unified Nubus portal. It deploys as a modular Helm chart and serves as the default wiki solution alongside the Beta alternative BookStack. Persistent data is backed up through k8up.
