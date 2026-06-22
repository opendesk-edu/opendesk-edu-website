---
title: "code-server"
date: "2026-05-29"
description: "VS Code im Browser – eine voll ausgestattete browserbasierte IDE für Entwicklung und Bildung."
categories: ["wissenschaftliches-rechnen", "produktivität"]
tags: ["code-server", "vscode", "ide", "entwicklung", "wissenschaftliches-rechnen"]
version: "4.99"
---

# code-server

code-server bringt Microsoft Visual Studio Code in den Browser und bietet eine voll ausgestattete IDE, die vollständig auf dem Server läuft. Studierende und Forschende können von jedem Gerät mit einem Webbrowser aus Code schreiben, debuggen und ausführen – ohne lokale Installation.

## Hauptfunktionen

- **Komplette VS-Code-Erfahrung**: Alle Editor-Funktionen, Erweiterungen, Designs und Tastenkürzel funktionieren im Browser.
- **Erweiterungsmarktplatz**: Tausende von Erweiterungen für Sprachunterstützung, Linter, Debugger und Designs installieren.
- **Integriertes Terminal**: Zugriff auf ein serverseitiges Terminal direkt aus der IDE.
- **Git-Integration**: Vollständige Quellcodeverwaltung mit Commit-, Push-, Pull- und Diff-Operationen.
- **Multi-Sprachunterstützung**: Unterstützt Python, R, Julia, JavaScript, Go, Rust und hunderte weitere Sprachen über Erweiterungen.

## Integration mit openDesk Edu

code-server ist Teil der Collab Services Suite und wird über das zugehörige upstream Helm-Chart (`helm.coder.com`) bereitgestellt. Die Authentifizierung erfolgt über Keycloak mittels eines oauth2-proxy Sidecars und ist unter `code.*` des institutionellen Wildcard-DNS erreichbar.

## Mehr erfahren

- [Offizielle Dokumentation](https://github.com/coder/code-server) — code-server-Dokumentation und Ressourcen
