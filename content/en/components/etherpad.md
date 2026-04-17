---
title: "Etherpad"
date: "2026-03-31"
description: "Real-time collaborative document editor for meeting notes, workshops, and live editing sessions."
categories: ["education", "productivity", "beta"]
tags: ["etherpad", "collaborative-editing", "real-time", "documents"]
---

# Etherpad

Etherpad is a real-time collaborative document editor that lets multiple users write and edit text simultaneously in a web browser. Each participant's cursor is visible in a distinct color, making it easy to see who is contributing what. Etherpad is an education-specific Beta component in openDesk Edu.

## Key Features

- **Real-time co-editing**: See other users' cursors and changes as they type, with sub-second latency.
- **Color-coded authors**: Each participant gets a unique color for their cursor and text contributions.
- **Plugin system**: Extend functionality with plugins for formatting, export, and integration features.
- **Chat sidebar**: Built-in side chat for discussion alongside the shared document.
- **Export options**: Export pads to HTML, plain text, PDF, Word, and other formats.

## Integration with openDesk Edu

Etherpad integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users create and join pads from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. Pad content can be backed up through k8up for persistent document recovery.

## Learn More

- [Official Documentation](https://docs.etherpad.org) — Official docs and resources
