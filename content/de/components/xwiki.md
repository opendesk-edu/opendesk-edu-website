---
title: "Wiki"
date: "2026-03-19"
description: "Enterprise-Wiki-Plattform für Wissensmanagement und kollaborative Inhalte."
categories: ["wiki", "wissen", "kollaboration"]
tags: ["xwiki", "wiki", "wissen"]
---

# Wiki

Wiki basiert auf XWiki und bietet eine Enterprise-Wiki-Plattform für Wissensmanagement und kollaborative Inhalte. Es eignet sich für die Erstellung von Dokumentationen, Lehrmaterialien und gemeinsamen Wissensdatenbanken. Als Basis-openDesk-CE-Komponente ist XWiki standardmäßig verfügbar.

## Hauptfunktionen

- **Wissensmanagement**: Hierarchische Seitenstruktur mit Kategorien und Tags
- **Kollaboratives Bearbeiten**: Gleichzeitiges Bearbeiten von Seiten durch mehrere Nutzer
- **Erweiterbarkeit**: Umfangreiches Plugin-System für zusätzliche Funktionen
- **Skriptunterstützung**: Velocity-Skripte und Makros für dynamische Inhalte
- **Berechtigungskonzept**: Feingranulare Zugriffssteuerung auf Seiten- und Raumebene

## Integration mit openDesk Edu

Wiki ist Teil der Basis-openDesk-CE-Installation und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt zentral über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
