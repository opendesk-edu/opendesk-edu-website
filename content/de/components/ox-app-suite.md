---
title: "OX App Suite"
date: "2026-03-09"
description: "Vollständige Enterprise-Groupware mit E-Mail, Kalender, Kontakten und Dokumentenverwaltung."
categories: ["groupware", "e-mail", "kalender"]
tags: ["ox-app-suite", "groupware", "e-mail", "kalender"]
---

# OX App Suite

Die OX App Suite ist die Standard-Groupware-Option in openDesk und bietet eine vollständige Enterprise-Groupware mit E-Mail, Kalender, Kontakten und Dokumentenverwaltung. Als Basis-openDesk-CE-Komponente ist sie für Bildungseinrichtungen gedacht, die eine umfassende Groupware-Lösung benötigen.

## Hauptfunktionen

- **E-Mail**: Vollwertiger Webmail-Client mit IMAP/SMTP-Unterstützung
- **Kalender**: Gruppenkalender mit Terminserie, Freigaben und Ressourcenverwaltung
- **Kontakte**: Zentrales Adressbuch mit LDAP-Synchronisierung
- **Dokumentenverwaltung**: Integrierte Textverarbeitung und Tabellenkalkulation
- **Infostore**: Dateispeicher mit Freigabefunktion für Dokumente

## Integration mit openDesk Edu

OX App Suite ist Teil der Basis-openDesk-CE-Installation und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt zentral über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
