---
title: "Bekanntgabe von openDesk Edu"
date: "2026-04-15"
description: "openDesk Edu bringt den openDesk digitalen Arbeitsplatz an Hochschulen — 25 Open-Source-Dienste, einheitliches SSO, Ein-Kommando-Deployment."
categories: ["ankündigung", "gemeinschaft"]
tags: ["ankündigung", "opendesk", "bildung", "open-source"]
---

# Bekanntgabe von openDesk Edu

Wir freuen uns, den Start von openDesk Edu anzukündigen, ein neues Projekt, das den openDesk digitalen Arbeitsplatz für Hochschuleinrichtungen verfügbar macht. openDesk Edu vereint 25 Open-Source-Dienste auf einer einzigen, zusammenhängenden Plattform mit einheitlichem Single Sign-On, SAML-Föderationsunterstützung und Ein-Kommando-Deployment. Alles steht unter der Apache-2.0-Lizenz und ist bereit für Universitäten, Forschungseinrichtungen und Bildungsnetzwerke.

## Was ist openDesk Edu?

openDesk Edu baut auf openDesk Community Edition (CE) auf und fügt 15 bildungsspezifische Dienste zum bestehenden Arbeitsplatz-Stack hinzu. Das Ergebnis ist eine Plattform, die Lernmanagement, Videokonferenzen, Echtzeit-Zusammenarbeit, Dateifreigabe, Produktivität und mehr abdeckt. Statt eine Vielzahl proprietärer Werkzeuge zusammenzustellen, erhalten Einrichtungen eine vollständig Open-Source-basierte digitale Umgebung, die Datensouveränität und Interoperabilitätsstandards respektiert.

## Was ist enthalten?

openDesk Edu liefert 25 Dienste in mehreren Kategorien:

- **Lernmanagement** mit ILIAS und Moodle, zwei der am weitesten verbreiteten LMS-Plattformen im europäischen Hochschulbereich.
- **Videokonferenzen** mit Jitsi Meet und BigBlueButton, von leichten Besprechungen bis hin zu voll ausgestatteten virtuellen Klassenzimmern mit Whiteboards, Breakout-Räumen und Aufzeichnung.
- **Zusammenarbeit** mit Nextcloud für Dateisynchronisierung und -freigabe, Etherpad für Echtzeit-Kollaboration und CryptPad für Ende-zu-Ende-verschlüsselte Dokumentenzusammenarbeit.
- **Produktivität** mit einer Wahl zwischen Groupware-Stacks: Open-Xchange, SOGo oder Grommunio für E-Mail und Kalender, ergänzt durch Collabora Online für dokumentenbasiertes Bearbeiten im Browser.
- **Weitere Werkzeuge** darunter Draw.io für Diagramme, Excalidraw für Skizzen, BookStack für Wissensmanagement, Planka für Projektboards, Zammad für Support-Tickets, LimeSurvey für Umfragen und TYPO3 für institutionelle Websites.

## Kernfunktionen

**Ein-Kommando-Deployment.** Der gesamte Stack wird mit einem einzigen `helmfile apply`-Befehl auf jedem Kubernetes-Cluster bereitgestellt. Kein manuelles Dienst-für-Dienst-Setup, keine fragilen Shell-Skripte. Helmfile orchestriert 25 modulare Helm-Charts mit deklarativer Konfiguration.

**Einheitliches Keycloak-SSO.** Jeder Dienst authentifiziert sich über eine zentrale Keycloak-Instanz. Benutzer melden sich einmal an und greifen auf alle Anwendungen zu, ohne erneut Anmeldedaten eingeben zu müssen. Keycloak unterstützt sowohl SAML 2.0 als auch OpenID Connect.

**DFN-AAI- und eduGAIN-Föderation.** openDesk Edu ist an die DFN-AAI-Infrastruktur und die breitere eduGAIN-Föderation angebunden. Studierende und Beschäftigte authentifizieren sich mit den Zugangsdaten ihrer Heimateinrichtung, mit automatischer Zuordnung von Attributen wie Zugehörigkeit und Berechtigung.

**Datensouveränität.** Alle Dienste laufen auf Infrastruktur, die Sie kontrollieren. Keine Daten verlassen Ihren Cluster, es sei denn, Sie konfigurieren dies entsprechend. Das ist besonders relevant für Einrichtungen, die der DSGVO und nationalen Datenschutzvorschriften unterliegen.

**Modulare Architektur.** Nicht jede Einrichtung benötigt alle 25 Dienste. Das Konfigurationssystem ermöglicht es, nur das zu aktivieren, was Ihre Nutzer benötigen. Betreiben Sie nur ILIAS und Nextcloud, oder setzen Sie den gesamten Stack ein. Die Entscheidung liegt bei Ihnen.

## Bildungsdienste in der Beta-Phase

Die 15 Dienste, die zusätzlich zu openDesk CE hinzukommen, werden als Beta veröffentlicht. Das bedeutet, sie sind funktionsfähig und für grundlegende Anwendungsfälle getestet, haben aber möglicherweise noch nicht denselben Reifegrad und die gleiche Härtung wie die Kern-Dienste von openDesk CE. Wir suchen aktiv nach Rückmeldungen von Early Adoptern.

Zu den Beta-Diensten gehören: ILIAS, Moodle, BigBlueButton, OpenCloud (eine Nextcloud-basierte Dateifreigabe-Variante), Grommunio, Etherpad, BookStack, Planka, Zammad, LimeSurvey, LTB SSP, Draw.io, Excalidraw und TYPO3.

Wenn Ihre Einrichtung daran interessiert ist, diese Dienste zu testen, würden wir uns über Ihre Rückmeldung freuen. Fehlerberichte, Feature-Anfragen und Deployment-Erfahrungen helfen alle, das Projekt zu formen.

## Machen Sie mit

openDesk Edu wird offen entwickelt, und Beiträge sind willkommen. Ob Sie Entwickler, Systemadministrator, Lehrender oder eine Einrichtung sind, die Open-Source-Infrastruktur einführen möchte, es gibt viele Möglichkeiten zur Mitarbeit.

Die primäre Entwicklung findet auf Codeberg statt:

[https://codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu)

Ein GitHub-Spiegel ist ebenfalls verfügbar:

[https://github.com/opendesk-edu/opendesk-edu](https://github.com/opendesk-edu/opendesk-edu)

Issues, Pull Requests, Dokumentationsverbesserungen und Übersetzungen sind alle willkommen.

## Ausblick

Die Roadmap für die kommenden Monate konzentriert sich auf die Stabilisierung der Beta-Dienste basierend auf Feedback von Early Adoptern. Wir arbeiten außerdem an der Erweiterung der Föderationsunterstützung für zusätzliche nationale Identitätsföderationen über DFN-AAI hinaus und an der Vereinfachung des Onboarding-Prozesses für Einrichtungen, die openDesk Edu evaluieren möchten.

Bleiben Sie dran für einen folgenden Beitrag, der die technische Architektur im Detail beleuchtet.
