---
title: "LTB SSP"
date: "2026-04-17"
description: "LDAP-Passwort-Selbstservice zur Reduzierung von Helpdesk-Tickets durch eigenständige Passwortzurücksetzung."
categories: ["iam", "selbstservice", "beta"]
tags: ["ltb-ssp", "passwort", "ldap", "beta"]
---

# LTB SSP

LTB SSP (LDAP Tool Box Self Service Password) ermöglicht Nutzern die eigenständige Zurücksetzung ihres Passworts über einen Webbrowser. Dadurch werden Helpdesk-Tickets für Passwort-Probleme deutlich reduziert. LTB SSP ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu.

## Hauptfunktionen

- **Passwortzurücksetzung**: Eigenständiges Zurücksetzen des Passworts per E-Mail- oder SMS-Bestätigung
- **Passwortänderung**: Einfaches Ändern des Passworts nach erfolgreicher Authentifizierung
- **Passwortrichtlinien**: Konfigurierbare Richtlinien für Passwortkomplexität und -gültigkeit
- **Sicherheitsfragen**: Optionale Sicherheitsfragen als zusätzliche Verifizierungsmethode
- **LDAP-Integration**: Direkte Anbindung an das LDAP-Verzeichnis der Einrichtung

## Integration mit openDesk Edu

LTB SSP ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Integration erfolgt über das einheitliche Portal, das den Zugriff auf den Passwort-Selbstservice bereitstellt. LTB SSP arbeitet direkt mit dem LDAP-Backend, das auch von Keycloak genutzt wird.
