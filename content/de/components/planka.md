---
title: "Planka"
date: "2026-04-04"
description: "Kanban-Board-Anwendung mit OIDC-Unterstützung für studentische Projekte."
categories: ["projektmanagement", "beta"]
tags: ["planka", "kanban", "projekte", "beta"]
---

# Planka

Planka ist eine Kanban-Board-Anwendung, die sich besonders für studentische Projekte und agile Teamarbeit eignet. Sie bietet eine übersichtliche Drag-and-Drop-Oberfläche mit OIDC-Unterstützung. Planka ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu und dient als leichtgewichtige Alternative zu OpenProject für einfache Kanban-Szenarien.

## Hauptfunktionen

- **Kanban-Boards**: Übersichtliche Boards mit Spalten, Karten und Drag-and-Drop-Bedienung
- **OIDC-Unterstützung**: Native OpenID Connect-Authentifizierung
- **Listen und Karten**: Aufgabenorganisation in Listen mit Checklisten und Fälligkeitsdaten
- **Labels und Farben**: Visuelle Kategorisierung von Aufgaben
- **Teamverwaltung**: Benutzer- und Teamverwaltung mit Berechtigungen

## Integration mit openDesk Edu

Planka ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Keycloak SSO (OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
