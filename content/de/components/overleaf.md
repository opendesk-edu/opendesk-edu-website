---
title: "Overleaf CE"
date: "2026-05-29"
description: "Kollaborativer Echtzeit-LaTeX-Editor für wissenschaftliches Schreiben, Abschlussarbeiten und akademisches Publizieren."
categories: ["wissenschaftliches-rechnen", "produktivität"]
tags: ["overleaf", "latex", "schreiben", "akademisch", "wissenschaftliches-rechnen"]
version: "5.2"
---

# Overleaf CE

Overleaf Community Edition ist ein kollaborativer Echtzeit-LaTeX-Editor, der für wissenschaftliches Schreiben entwickelt wurde. Er ermöglicht Studierenden und Forschenden, LaTeX-Dokumente gemeinsam im Browser zu verfassen, zu bearbeiten und zu kompilieren – mit Versionsverfolgung und einer umfangreichen Vorlagengalerie.

## Hauptfunktionen

- **Echtzeit-Kollaboration**: Mehrere Autorinnen und Autoren bearbeiten gleichzeitig dasselbe Dokument mit Live-Updates.
- **Umfangreicher LaTeX-Editor**: Syntax-Hervorhebung, Code-Vervollständigung, Literaturverwaltung und integrierte PDF-Vorschau.
- **Vorlagengalerie**: Vorgefertigte Vorlagen für Abschlussarbeiten, Zeitschriftenartikel, Berichte und Präsentationen.
- **Versionsverlauf**: Änderungen nachverfolgen und mit vollständiger Diff-Unterstützung zu früheren Versionen zurückkehren.
- **Git-Integration**: Dokumente mit Git-Repositories zur Versionskontrolle und Sicherung synchronisieren.

## Integration mit openDesk Edu

Overleaf CE ist Teil der Collab Services Suite und wird über das zugehörige upstream Helm-Chart (`ghcr.io/sharelatex`) bereitgestellt. Die Authentifizierung erfolgt über Keycloak mittels eines oauth2-proxy Sidecars und ist unter `latex.*` des institutionellen Wildcard-DNS erreichbar.

## Mehr erfahren

- [Offizielle Dokumentation](https://github.com/overleaf/overleaf) — Overleaf CE-Dokumentation und Ressourcen
