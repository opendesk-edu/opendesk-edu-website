---
title: "Grommunio"
date: "2026-03-23"
description: "Microsoft 365-kompatible Groupware mit ActiveSync 16.1 für native mobile Synchronisierung."
categories: ["groupware", "e-mail", "beta"]
tags: ["grommunio", "e-mail", "groupware", "activesync", "beta"]
---

# Grommunio

Grommunio ist eine Microsoft 365-kompatible Groupware-Lösung mit ActiveSync 16.1-Unterstützung für native mobile Synchronisierung. Sie bietet E-Mail, Kalender, Kontakte und Aufgaben in einer Oberfläche, die Outlook-Nutzern vertraut vorkommt. Grommunio ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu.

## Hauptfunktionen

- **ActiveSync 16.1**: Native Synchronisation mit iOS, Android und Outlook-Desktop
- **E-Mail**: Vollwertiger Mailserver mit Spam- und Virenschutz
- **Kalender und Kontakte**: Gruppenkalender mit Freigaben und zentrales Adressbuch
- **Outlook-Kompatibilität**: Nahtlose Integration mit Microsoft Outlook
- **MariaDB-Backend**: Hohe Leistung und Zuverlässigkeit durch MariaDB

## Integration mit openDesk Edu

Grommunio ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Als Alternative zur OX App Suite richtet sich Grommunio an Einrichtungen, die eine hohe Kompatibilität mit Microsoft-Clients benötigen. Persistente Daten werden automatisch von k8up gesichert.
