---
title: "CryptPad"
date: "2026-04-17"
description: "Privacy-first collaborative office suite with integrated diagrams.net for diagramming and whiteboard functionality."
categories: ["productivity", "office", "base"]
tags: ["cryptpad", "diagrams", "drawio", "whiteboard", "privacy"]
---

# CryptPad

CryptPad is a privacy-first collaborative office suite that encrypts content end-to-end in the browser before it reaches the server. It includes integrated diagrams.net (Draw.io) for diagramming and serves as an alternative whiteboard option in openDesk Edu. As a base openDesk CE component, it ships stable and production-ready.

## Key Features

- **End-to-end encryption**: All content is encrypted in the browser. The server never sees plaintext data.
- **Collaborative editing**: Real-time co-editing of rich text, spreadsheets, presentations, and Kanban boards.
- **Integrated diagrams.net**: Full diagrams.net editor embedded for flowcharts, architecture diagrams, and UML.
- **Drive and file management**: Built-in drive for organizing pads, with sharing via links.
- **Whiteboard capability**: Can serve as an alternative whiteboard for sketching and brainstorming.

## Integration with openDesk Edu

CryptPad integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users access the suite directly from the unified Nubus portal. It deploys as a modular Helm chart and provides an alternative whiteboard and diagramming option alongside Excalidraw and standalone Draw.io. Persistent data is backed up through k8up.
