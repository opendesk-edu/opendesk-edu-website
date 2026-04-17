---
title: "OpenCloud"
date: "2026-03-29"
description: "Leichtgewichtiger CS3-basierter Cloud-Speicher mit kursbezogener Freigabe als Alternative zu Nextcloud."
categories: ["speicher", "beta"]
tags: ["opencloud", "dateien", "cloud", "alternative", "beta"]
---

# OpenCloud

OpenCloud ist ein leichtgewichtiger Cloud-Speicher auf Basis des Collabora Spatial Framework (CS3) mit kursbezogener Freigabe. Es bietet grundlegende Dateispeicher- und Freigabefunktionen in einer ressourcenschonenden Implementierung. OpenCloud ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu und dient als Alternative zu Nextcloud.

## Hauptfunktionen

- **Dateispeicher**: Zentraler Cloud-Speicher für Kursmaterialien und Dokumente
- **Kursbezogene Freigabe**: Freigabefunktionen, die auf Kursstrukturen zugeschnitten sind
- **Ressourcenschonend**: Leichtgewichtige Implementierung mit geringem Ressourcenbedarf
- **CS3-Framework**: Auf dem offenen Collabora Spatial Framework aufbauend
- **Einfache Integration**: REST-API für Einbindung in LMS und andere Anwendungen

## Integration mit openDesk Edu

OpenCloud ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Als Alternative zu Nextcloud eignet sich OpenCloud für Einsatzszenarien, bei denen ein einfacher, kursorientierter Dateispeicher ausreicht. Persistente Daten werden automatisch von k8up gesichert.
