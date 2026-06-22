---
title: "Slidev"
date: "2026-05-29"
description: "Markdown-zu-Präsentationen-Werkzeug zum Erstellen von Folien aus einfachen Markdown-Dateien."
categories: ["wissenschaftliches-rechnen", "produktivität", "beta"]
tags: ["slidev", "presentations", "markdown", "slides", "scientific-computing"]
version: "0.49"
---

# Slidev

Slidev ist ein Präsentationswerkzeug, das Markdown-Dateien in ansprechende Folienpräsentationen verwandelt. Es wurde für Forschende und Lehrende entwickelt, die Präsentationsmaterialien erstellen möchten, ohne ihren Texteditor verlassen zu müssen, und unterstützt Code-Hervorhebung, LaTeX-Mathematik, Diagramme und interaktive Elemente.

## Hauptfunktionen

- **Markdown-basiert**: Folien in einfachem Markdown mit YAML-Frontmatter zur Konfiguration schreiben.
- **Code-Hervorhebung**: Syntax-hervorgehobene Codeblöcke mit Shiki- und Prisma-Unterstützung.
- **LaTeX-Mathematik**: Mathematische Ausdrücke mit KaTeX oder MathJax rendern.
- **Diagramme**: Mermaid- und PlantUML-Diagramme direkt in Folien einbetten.
- **Exportmöglichkeiten**: Als PDF, PNG-Folien exportieren oder als interaktive Webpräsentation hosten.

## Integration mit openDesk Edu

Slidev ist Teil der Collab Services Suite und wird über ein benutzerdefiniertes lokales Helm-Chart (`helmfile/charts/slidev`) bereitgestellt, das einen Init-Container zum Erstellen der Präsentation verwendet und diese anschließend mit nginx ausliefert. Die Authentifizierung erfolgt über Keycloak mithilfe eines oauth2-proxy-Sidecars. Der Dienst ist unter `slides.*` der Wildcard-DNS der Einrichtung erreichbar.

## Weitere Informationen

- [Offizielle Dokumentation](https://github.com/slidevjs/slidev) — Slidev-Dokumentation und Ressourcen
