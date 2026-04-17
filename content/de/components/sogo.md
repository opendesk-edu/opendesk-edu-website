---
title: "SOGo"
date: "2026-03-21"
description: "Leichtgewichtige Webmail- und Groupware als Alternative zur OX App Suite, einfacher und schneller."
categories: ["groupware", "e-mail", "beta"]
tags: ["sogo", "e-mail", "groupware", "alternative", "beta"]
---

# SOGo

SOGo ist eine leichtgewichtige Webmail- und Groupware-Lösung, die als Alternative zur OX App Suite zur Verfügung steht. Sie bietet E-Mail, Kalender und Kontakte in einer einfacheren, ressourcenschonender Oberfläche. SOGo ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu.

## Hauptfunktionen

- **Webmail**: Schneller und ressourcenschonender E-Mail-Client
- **Kalender**: Gruppenkalender mit Terminfreigaben
- **Kontakte**: Adressbuch mit CardDAV-Synchronisierung
- **Einfache Bedienung**: Übersichtliche Benutzeroberfläche mit kurzer Einarbeitungszeit
- **CalDAV/CardDAV**: Native Protokollunterstützung für externe Clients

## Integration mit openDesk Edu

SOGo ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. SOGo dient als leichtgewichtige Alternative zur OX App Suite und eignet sich besonders für Einsatzszenarien, bei denen eine einfachere Groupware ausreicht. Persistente Daten werden automatisch von k8up gesichert.
