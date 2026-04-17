---
title: "Vorlesungen"
date: "2026-04-17"
description: "Virtuelle Klassenzimmer-Plattform mit Aufnahme, Whiteboard, Breakout-Räumen und Umfragen."
categories: ["lms", "videokonferenz", "beta"]
tags: ["bigbluebutton", "vorlesungen", "videokonferenz", "beta"]
---

# Vorlesungen

Vorlesungen basiert auf BigBlueButton und bietet eine virtuelle Klassenzimmer-Plattform, die speziell für lehrreiche Veranstaltungen entwickelt wurde. Sie bietet Aufzeichnungsfunktionen, ein interaktives Whiteboard, Breakout-Räume und Umfragen. BigBlueButton ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu und dient als Alternative zu Jitsi für komplexe Lehrszenarien.

## Hauptfunktionen

- **Virtuelles Klassenzimmer**: Umfassende Plattform für Online-Vorlesungen und Seminare
- **Aufzeichnung**: Automatische Aufnahme von Vorlesungen mit anschließender Wiedergabe
- **Interaktives Whiteboard**: Gemeinsames Whiteboard mit Annotations- und Zeichenfunktionen
- **Breakout-Räume**: Aufteilung in Kleingruppen für Gruppenarbeit und Diskussionen
- **Umfragen und Fragen**: Interaktive Umfragen und Fragefunktionen während der Veranstaltung

## Integration mit openDesk Edu

Vorlesungen ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Shibboleth als SAML Service Provider, das mit Keycloak als Identity Provider verbunden ist. Als Alternative zu Jitsi richtet sich BigBlueButton an Szenarien, die erweiterte Funktionen wie Aufzeichnung und Breakout-Räume benötigen. Persistente Daten werden automatisch von k8up gesichert.
