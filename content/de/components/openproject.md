---
title: "Projekte"
date: "2026-04-17"
description: "Projektmanagement-Plattform mit agilen Boards, Gantt-Diagrammen und Zeiterfassung."
categories: ["projektmanagement", "produktivitaet"]
tags: ["openproject", "projekte", "agile", "kanban"]
---

# Projekte

Projekte basiert auf OpenProject und bietet eine umfassende Projektmanagement-Plattform für Bildungseinrichtungen. Sie unterstützt agile wie klassische Projektmethoden und eignet sich für Forschungsprojekte, Verwaltungsaufgaben und studentische Teamarbeit. Als Basis-openDesk-CE-Komponente ist sie standardmäßig verfügbar.

## Hauptfunktionen

- **Agile Boards**: Kanban- und Scrum-Boards für iterative Projektarbeit
- **Gantt-Diagramme**: Visuelle Zeitplanung mit Abhängigkeitsverwaltung
- **Zeiterfassung**: Integrierte Zeiterfassung für Aufgabennachverfolgung
- **Aufgabenverwaltung**: Tickets, Meilensteine und Arbeitspakete
- **Wiki und Dokumente**: Integrierte Dokumentation direkt im Projekt

## Integration mit openDesk Edu

Projekte ist Teil der Basis-openDesk-CE-Installation und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt zentral über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
