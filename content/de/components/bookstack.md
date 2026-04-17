---
title: "BookStack"
date: "2026-04-02"
description: "Strukturiertes Wiki mit Buch-, Kapitel- und Seitenhierarchie, ideal für Kursmaterialien."
categories: ["wiki", "beta"]
tags: ["bookstack", "wiki", "kurse", "beta"]
---

# BookStack

BookStack ist ein strukturiertes Wiki mit einer intuitiven Buch-, Kapitel- und Seitenhierarchie. Diese Organisationsstruktur eignet sich besonders für Kursmaterialien, Skripte und Lerninhalte. BookStack ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu und dient als Alternative zu XWiki für einfache Strukturierung.

## Hauptfunktionen

- **Buch-Kapitel-Seite-Hierarchie**: Intuitive Gliederung mit Büchern, Kapiteln und Einzelseiten
- **WYSIWYG-Editor**: Visueller Editor für einfache Texterstellung ohne HTML-Kenntnisse
- **Suchfunktion**: Volltextsuche über alle Bücher und Seiten
- **Berechtigungsrollen**: Feingranulare Rollen- und Berechtigungsverwaltung
- **Markdown-Unterstützung**: Alternative Eingabe über Markdown-Syntax

## Integration mit openDesk Edu

BookStack ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
