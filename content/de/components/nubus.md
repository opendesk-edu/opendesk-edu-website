---
title: "Portal und IAM"
date: "2026-03-05"
description: "Einheitliches Portal und Identitätsmanagement auf Basis von Keycloak mit SAML 2.0 und OIDC."
categories: ["portal", "iam", "sicherheit"]
tags: ["nubus", "keycloak", "portal", "iam", "sso"]
---

# Portal und IAM

Portal und IAM basiert auf Nubus, einer auf Keycloak aufbauenden Lösung für einheitliches Portal und Identitätsmanagement. Es bildet das zentrale Einstiegstor für alle openDesk-Dienste und verwaltet Nutzeridentitäten, Rollen und Berechtigungen. Als zentrale IAM-Komponente ist es Grundlage für Single Sign-On in der gesamten Plattform.

## Hauptfunktionen

- **Single Sign-On**: Einmalige Anmeldung für alle openDesk-Dienste über SAML 2.0 und OIDC
- **Einheitliches Portal**: Zentraler Zugangspunkt mit personalisierter Dashboard-Ansicht
- **Benutzerverwaltung**: Zentrale Verwaltung von Nutzerkonten, Gruppen und Rollen
- **SAML 2.0 IdP**: Keycloak als Identity Provider für SAML-Service-Provider
- **OIDC Provider**: OpenID Connect für moderne webbasierte Anwendungen

## Integration mit openDesk Edu

Portal und IAM ist die zentrale IAM-Komponente von openDesk und wird über Helm-Charts bereitgestellt. Alle anderen Komponenten authentifizieren sich über Keycloak SSO (SAML 2.0 / OIDC). Das einheitliche Portal bietet Nutzern einen zentralen Zugriff auf alle verfügbaren Dienste. Persistente Daten werden automatisch von k8up gesichert.
