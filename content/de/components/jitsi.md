---
title: "Meetings"
date: "2026-04-17"
description: "Videokonferenzen für schnelle Besprechungen, leichtgewichtig und browserbasiert."
categories: ["kommunikation", "videokonferenz"]
tags: ["jitsi", "meetings", "videokonferenz"]
---

# Meetings

Meetings basiert auf Jitsi und bietet browserbasierte Videokonferenzen für schnelle Besprechungen und Online-Sitzungen. Die Komponente ist leichtgewichtig und erfordert keine Client-Installation. Als Standard-Videokonferenz-Option der Basis-openDesk-CE-Installation steht sie allen Nutzern sofort zur Verfügung.

## Hauptfunktionen

- **Browserbasierte Videokonferenzen**: Teilnahme ohne Client-Installation, direkt im Browser
- **Bildschirmfreigabe**: Präsentation von Inhalten und Anwendungen
- **Chat**: Integrierter Textchat während der Besprechung
- **Teilnehmerverwaltung**: Kontrolle über Teilnehmerrechte und Raumeinstellungen
- **Aufzeichnung**: Optionale Aufzeichnung von Besprechungen

## Integration mit openDesk Edu

Meetings ist Teil der Basis-openDesk-CE-Installation und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt zentral über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
