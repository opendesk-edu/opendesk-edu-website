---
title: "Dateien"
date: "2026-03-07"
description: "Vollwertige Cloud-Speicher- und Kollaborationssuite mit Dateisynchronisierung, Freigabe und Office-Integration."
categories: ["speicher", "kollaboration", "office"]
tags: ["nextcloud", "dateien", "cloud", "speicher"]
---

# Dateien

Dateien basiert auf Nextcloud und bietet eine vollwertige Cloud-Speicher- und Kollaborationssuite für Bildungseinrichtungen. Nutzer können Dateien synchronisieren, freigaben und direkt im Browser bearbeiten. Als Basis-openDesk-CE-Komponente bildet Nextcloud den zentralen Dateispeicher der Plattform.

## Hauptfunktionen

- **Dateisynchronisierung**: Desktop- und Mobile-Clients für nahtlose Synchronisierung über Geräte hinweg
- **Freigabe und Zusammenarbeit**: Flexible Freigabe von Dateien und Ordnern mit Nutzergruppen und externen Teilnehmern
- **Online-Office-Integration**: Direktes Bearbeiten von Dokumenten über Collabora im Browser
- **Versionsverwaltung**: Automatische Versionierung und Wiederherstellung von Dateien
- **Activity-Feed**: Übersicht über alle Änderungen und Freigaben in der eigenen Cloud

## Integration mit openDesk Edu

Dateien ist Teil der Basis-openDesk-CE-Installation und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt zentral über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
