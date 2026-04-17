---
title: "Collabora"
date: "2026-04-17"
description: "LibreOffice-based online office suite for collaborative editing of documents, spreadsheets, and presentations."
categories: ["productivity", "office", "base"]
tags: ["collabora", "office", "libreoffice", "document-editing"]
---

# Collabora

Collabora Online is a browser-based office suite built on LibreOffice technology. It enables collaborative, real-time editing of documents, spreadsheets, and presentations directly in the browser. It integrates with Nextcloud and other storage backends as the editing engine. As a base openDesk CE component, it ships stable and production-ready.

## Key Features

- **Document editing**: Full editing of DOCX, XLSX, and PPTX files with fidelity to Microsoft Office formats.
- **Real-time collaboration**: Multiple users can edit the same document simultaneously with live cursors.
- **Format compatibility**: Supports ODF, DOCX, XLSX, PPTX, PDF import/export, and many other formats.
- **Comment and track changes**: Built-in commenting, change tracking, and revision history.
- **Browser-native**: No desktop software required. Runs entirely in the browser on any device.

## Integration with openDesk Edu

Collabora integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. It connects to Nextcloud as the document editing backend, so users open and edit files from the Nextcloud interface accessed through the unified Nubus portal. It deploys as a modular Helm chart alongside Nextcloud.
