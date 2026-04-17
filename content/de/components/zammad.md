---
title: "Zammad"
date: "2026-04-06"
description: "Helpdesk- und Ticket-System mit Multi-Kanal-Support und SAML-Authentifizierung."
categories: ["helpdesk", "support", "beta"]
tags: ["zammad", "helpdesk", "tickets", "beta"]
---

# Zammad

Zammad ist ein Helpdesk- und Ticket-System mit Multi-Kanal-Support für E-Mail, Telefon, Chat und Social Media. Es eignet sich für IT-Support, Verwaltung und studentische Hilfsdienste an Bildungseinrichtungen. Zammad ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu.

## Hauptfunktionen

- **Multi-Kanal-Support**: Tickets aus E-Mail, Chat, Telefon und Social Media an einem Ort
- **Ticket-Workflow**: Automatisierte Workflows mit Triggern und Eskalationsregeln
- **Wissensdatenbank**: Integrierte FAQ und Selbsthilfeartikel
- **SLA-Verwaltung**: Service-Level-Agreements mit automatischer Überwachung
- **SAML-Authentifizierung**: Single Sign-On über SAML für Agenten und Nutzer

## Integration mit openDesk Edu

Zammad ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
