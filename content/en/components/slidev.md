---
title: "Slidev"
date: "2026-05-29"
description: "Markdown-to-presentations tool for creating slide decks from simple Markdown files."
categories: ["scientific-computing", "productivity", "beta"]
tags: ["slidev", "presentations", "markdown", "slides", "scientific-computing"]
version: "0.49"
---

# Slidev

Slidev is a presentation tool that turns Markdown files into beautiful slide decks. It is designed for researchers and educators who want to create presentation materials without leaving their text editor, supporting code highlighting, LaTeX math, diagrams, and interactive elements.

## Key Features

- **Markdown-based**: Write slides in simple Markdown with YAML frontmatter for configuration.
- **Code highlighting**: Syntax-highlighted code blocks with Shiki and Prisma support.
- **LaTeX math**: Render mathematical expressions with KaTeX or MathJax.
- **Diagrams**: Embed Mermaid and PlantUML diagrams directly in slides.
- **Export options**: Export to PDF, PNG slides, or host as an interactive web presentation.

## Integration with openDesk Edu

Slidev is part of the Collab Services suite and deploys via a custom local Helm chart (`helmfile/charts/slidev`) that uses an init container to build the presentation, then serves it with nginx. It authenticates through Keycloak using an oauth2-proxy sidecar and is accessible at `slides.*` under the institution's wildcard DNS.

## Learn More

- [Official Documentation](https://github.com/slidevjs/slidev) — Slidev docs and resources
