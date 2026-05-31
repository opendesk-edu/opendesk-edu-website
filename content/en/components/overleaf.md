---
title: "Overleaf CE"
date: "2026-05-29"
description: "Collaborative real-time LaTeX editor for scientific writing, theses, and academic publishing."
categories: ["scientific-computing", "productivity"]
tags: ["overleaf", "latex", "writing", "academic", "scientific-computing"]
version: "5.2"
---

# Overleaf CE

Overleaf Community Edition is a collaborative real-time LaTeX editor designed for scientific writing. It enables students and researchers to write, edit, and compile LaTeX documents collaboratively in the browser, with version tracking and a rich template gallery.

## Key Features

- **Real-time collaboration**: Multiple authors edit the same document simultaneously with live updates.
- **Rich LaTeX editor**: Syntax highlighting, code completion, reference management, and integrated PDF preview.
- **Template gallery**: Pre-built templates for theses, journal articles, reports, and presentations.
- **Version history**: Track changes and revert to previous versions with full diff support.
- **Git integration**: Sync documents with Git repositories for version control and backup.

## Integration with openDesk Edu

Overleaf CE is part of the Collab Services suite and deploys via its upstream Helm chart (`ghcr.io/sharelatex`). It authenticates through Keycloak using an oauth2-proxy sidecar and is accessible at `latex.*` under the institution's wildcard DNS.

## Learn More

- [Official Documentation](https://github.com/overleaf/overleaf) — Overleaf CE docs and resources
