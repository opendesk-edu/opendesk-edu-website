---
title: "LimeSurvey"
date: "2026-04-08"
description: "Umfrageplattform für Kursbewertungen und akademische Forschung."
categories: ["umfragen", "forschung", "beta"]
tags: ["limesurvey", "umfragen", "bewertung", "beta"]
---

# LimeSurvey

LimeSurvey ist eine professionelle Umfrageplattform, die sich für Kursbewertungen, Feedback-Erhebungen und akademische Forschung eignet. Sie bietet einen umfangreichen Fragetypen-Katalog, bedingte Logik und Auswertungsfunktionen. LimeSurvey ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu.

## Hauptfunktionen

- **Umfassende Fragetypen**: Über 30 Fragetypen einschließlich Matrix, Skala und offene Fragen
- **Bedingte Logik**: Dynamische Umfrageführung basierend auf vorherigen Antworten
- **Auswertung**: Integrierte Statistiken, Diagramme und Export in SPSS, Excel und R
- **Einladungsmanagement**: Automatisierte Einladungen und Erinnerungen per E-Mail
- **Mehrsprachigkeit**: Umfragen in mehreren Sprachen mit automatischer Übersetzung

## Integration mit openDesk Edu

LimeSurvey ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
