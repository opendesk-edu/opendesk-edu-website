---
title: "Etherpad"
date: "2026-03-31"
description: "Echtzeit-kollaborativer Dokumenteneditor für Meetingprotokolle und Workshops."
categories: ["kollaboration", "beta"]
tags: ["etherpad", "kollaboration", "editor", "beta"]
---

# Etherpad

Etherpad ist ein Echtzeit-kollaborativer Dokumenteneditor, mit dem mehrere Nutzer gleichzeitig am selben Text arbeiten können. Er eignet sich besonders für Meetingprotokolle, Workshops und gemeinsame Texterstellung. Etherpad ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu.

## Hauptfunktionen

- **Echtzeit-Kollaboration**: Mehrere Nutzer können gleichzeitig im selben Dokument schreiben
- **Farbcodierte Beiträge**: Jeder Bearbeitende wird durch eine eigene Farbe gekennzeichnet
- **Versionsgeschichte**: Vollständige Historie aller Änderungen mit Zeitleiste
- **Export**: Export in verschiedene Formate wie PDF, HTML und OpenDocument
- **Plugin-System**: Erweiterbarkeit durch eine breite Auswahl an Plugins

## Integration mit openDesk Edu

Etherpad ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
