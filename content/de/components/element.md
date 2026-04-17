---
title: "Chat"
date: "2026-04-17"
description: "Matrix-basierter Chat mit Nordeck-Widgets für Bildung, Echtzeit-Nachrichten, Räume und Dateifreigabe."
categories: ["kommunikation", "messaging"]
tags: ["element", "chat", "matrix", "bildung"]
---

# Chat

Chat basiert auf Element und nutzt spezielle Nordeck-Widgets, die auf Bildungskontexte zugeschnitten sind. Die Komponente bietet Echtzeit-Nachrichten, thematische Räume und Dateifreigabe auf Basis des offenen Matrix-Protokolls. Als Bestandteil der Basis-openDesk-CE-Installation ist Chat sofort nach der Bereitstellung verfügbar.

## Hauptfunktionen

- **Echtzeit-Nachrichten**: Sofortige Nachrichtenübermittlung in privaten und gruppenbasierten Räumen
- **Nordeck-Bildungs-Widgets**: Spezielle Widgets für Unterrichtsszenarien und Lerngruppen
- **Dateifreigabe**: Einfaches Teilen von Dokumenten und Medien direkt im Chat
- **Matrix-Protokoll**: Offenes, dezentrales Protokoll mit Federation-Unterstützung
- **Räume und Kanäle**: Thematisch organisierte Räume für Kurse, Projekte und Arbeitsgruppen

## Integration mit openDesk Edu

Chat ist ein Bestandteil der Basis-openDesk-CE-Installation und wird über modulare Helm-Charts bereitgestellt. Die Authentifizierung erfolgt zentral über Keycloak SSO (SAML 2.0 / OIDC), sodass sich Nutzer über das einheitliche Portal anmelden können. Persistente Daten werden automatisch von k8up gesichert.
