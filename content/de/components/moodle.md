---
title: "LMS"
date: "2026-03-25"
description: "Plugin-reiches Lernmanagementsystem mit Aufgaben, Workshops, Notenbuch und Shibboleth-Authentifizierung."
categories: ["lms", "learning", "beta"]
tags: ["moodle", "lms", "bildung", "shibboleth", "beta"]
---

# LMS

LMS basiert auf Moodle und ist ein weit verbreitetes Lernmanagementsystem mit einer großen Auswahl an Plugins. Es bietet Funktionen für Kursverwaltung, Aufgaben, Workshops, Tests und ein Notenbuch. Moodle ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu und verwendet Shibboleth als SAML Service Provider.

## Hauptfunktionen

- **Kursverwaltung**: Erstellen und Verwalten von Kursen mit flexiblen Inhaltsformaten
- **Aufgaben und Workshops**: Bewertbare Aufgaben, Peer-Review-Workshops und Abgabefunktionen
- **Notenbuch**: Umfassendes Noten- und Bewertungssystem mit Berechnungsformeln
- **Plugin-System**: Tausende verfügbare Plugins für zusätzliche Funktionen und Integrationen
- **Shibboleth-Authentifizierung**: SAML-basierter Single Sign-On über Shibboleth SP

## Integration mit openDesk Edu

Moodle ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Shibboleth als SAML Service Provider, das mit Keycloak als Identity Provider verbunden ist. So erhalten Moodle-Nutzer nahtlosen Single Sign-On über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
