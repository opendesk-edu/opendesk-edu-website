---
title: "ILIAS"
date: "2026-04-15"
description: "ILIAS ist ein leistungsstarkes Open-Source-Lernmanagementsystem, das weit verbreitet in der Hochschulbildung und in Unternehmensschulungen eingesetzt wird."
categories: ["bildung", "beta"]
tags: ["ilias", "bildung", "lms"]
---

# ILIAS

ILIAS ist ein leistungsstarkes Open-Source-LMS, das eine umfassende Plattform für Lehre und Lernen bietet. Es bietet Werkzeuge für Kursverwaltung, Bewertung, Zusammenarbeit und Kommunikation. ILIAS ist ein bildungsspezifisches Beta-Komponent in openDesk Edu.

## Hauptfunktionen

- **Kursverwaltung**: Erstellen und Organisieren von Kursen mit flexiblen Inhaltsstrukturen
- **Bewertung**: Integrierte Test- und Umfragetools mit umfangreichen Fragetypen
- **Zusammenarbeit**: Foren, Wikis, Gruppenräume und Dateifreigabe
- **Kommunikation**: Integrierte Messaging- und Benachrichtigungssysteme
- **SCORM-Konformität**: Volle Unterstützung für SCORM 1.2 und 2004-Inhaltspakete

## Integration mit openDesk Edu

ILIAS integriert sich als SAML 2.0 Service Provider über Shibboleth in openDesk Edu und authentifiziert Benutzer über Keycloak. Nutzer greifen über das einheitliche Nubus-Portal auf Kurse zu. Es wird als modulares Helm-Chart als bildungsspezifische Beta-Komponente bereitgestellt. Persistente Kursdaten, Einreichungen und Bewertungsergebnisse werden durch k8up gesichert.
