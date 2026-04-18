---
title: "Komponentenvergleich"
date: "2025-04-18"
description: "Alle 25 openDesk Edu-Dienste im Vergleich: Kategorien, Lizenzen und Kernfunktionen."
categories:
  - "Components"
tags:
  - "comparison"
  - "overview"
---

# Komponentenvergleich

openDesk Edu kombiniert die **10 Basisdienste** von openDesk Community Edition mit **15 bildungsspezifischen Beta-Diensten** zu einer umfassenden digitalen Arbeitsumgebung für Schulen, Hochschulen und Forschungseinrichtungen. Alle 25 Dienste sind über **Keycloak SSO** (SAML 2.0 / OIDC) integriert und über das einheitliche Nubus-Portal erreichbar.

Dienste derselben Kategorie können als Alternativen zueinander dienen — so lässt sich beispielsweise zwischen Jitsi und BigBlueButton für Videokonferenzen oder zwischen OX App Suite, SOGo und Grommunio für Groupware wählen. **Beta**-Dienste sind voll funktionsfähig, befinden sich jedoch noch in aktiver Entwicklung und können sich in zukünftigen Versionen ändern.

## Kommunikation & Zusammenarbeit

| Dienst | Art | Status | Lizenz | Kernfunktionen |
|---|---|---|---|---|
| Element (Matrix) | Chat / Nachrichten | Stable | Apache 2.0 | Echtzeitnachrichten, Räume, Dateifreigabe, Nordeck-Bildungs-Widgets, Föderation |
| Jitsi | Videokonferenzen | Stable | Apache 2.0 | Browserbasierte Meetings, Bildschirmfreigabe, Hintergrundunschärfe, SIP-Einwahl |
| BigBlueButton | Virtueller Klassenraum | Beta | LGPL-3.0 | Sitzungsaufzeichnung, interaktives Whiteboard, Breakout-Räume, Umfragen |
| Etherpad | Kollaboratives Bearbeiten | Beta | Apache 2.0 | Echtzeit-Co-Editing, farbcodierte Autoren, Plugin-System, Export in mehrere Formate |

## E-Mail & Kalender

| Dienst | Art | Status | Lizenz | Kernfunktionen |
|---|---|---|---|---|
| OX App Suite | Groupware | Stable | Proprietär (CE) | Vollwertiges Webmail, geteilter Kalender, Kontakte mit LDAP, Aufgabenverwaltung |
| SOGo | Leichtgewichtige Groupware | Beta | LGPL-2.1 | Schnelles Webmail, CalDAV/CardDAV, ActiveSync, geringer Ressourcenverbrauch |
| Grommunio | Microsoft 365-kompatible Groupware | Beta | AGPL-3.0 | ActiveSync 16.1, Outlook/Thunderbird-Kompatibilität, MariaDB-Backend |

## Dateiverwaltung

| Dienst | Art | Status | Lizenz | Kernfunktionen |
|---|---|---|---|---|
| Nextcloud | Cloud-Speicher | Stable | AGPL-3.0 | Dateisynchronisierung und -freigabe, externe Speichermounts, Versionsverwaltung, Collabora-Integration |
| OpenCloud | Leichtgewichtiger Cloud-Speicher | Beta | Apache 2.0 | CS3-basierter Speicher, kursbasierte Freigabe, WebDAV-Zugriff, geringer Ressourcenverbrauch |

## Office & Produktivität

| Dienst | Art | Status | Lizenz | Kernfunktionen |
|---|---|---|---|---|
| Collabora | Online-Office | Stable | MPL-2.0 | DOCX/XLSX/PPTX-Bearbeitung, Echtzeit-Zusammenarbeit, Formatkompatibilität, browserbasiert |
| CryptPad | Datenschutzorientiertes Office | Stable | AGPL-3.0 | Ende-zu-Ende-Verschlüsselung, kollaboratives Bearbeiten, integriertes diagrams.net, Ablage |
| Notes | Notizen | Stable | MIT | Schneller ablenkungsfreier Editor, Markdown-Unterstützung, einfache Organisation |
| Draw.io | Diagramme | Beta | Apache 2.0 | Umfangreiche Formbibliotheken, Export nach PDF/VSDX/SVG, Import aus Lucidchart/Gliffy |
| Excalidraw | Whiteboard | Beta | MIT | Handgezeichneter Stil, Echtzeit-Zusammenarbeit, Formenerkennung, sofortiges Laden |

## Lernen & Bildung

| Dienst | Art | Status | Lizenz | Kernfunktionen |
|---|---|---|---|---|
| ILIAS | Lernmanagement-System | Beta | GPL-3.0 | Kursverwaltung, Prüfungen, SCORM-Konformität, Foren, Wikis |
| Moodle | Lernmanagement-System | Beta | GPL-3.0+ | Kurs-Builder, Aufgaben, Notenbuch, Workshop-Peerbewertung, Plugin-Ökosystem |
| XWiki | Unternehmens-Wiki | Stable | LGPL-2.1 | Strukturierter Inhalt, WYSIWYG-Editor, Skripting, Extension-Marketplace |

## Projekt- & Wissensmanagement

| Dienst | Art | Status | Lizenz | Kernfunktionen |
|---|---|---|---|---|
| OpenProject | Projektmanagement | Stable | GPL-3.0 | Agile Boards, Gantt-Diagramme, Zeiterfassung, integriertes Wiki, Fehlerverfolgung |
| Planka | Kanban-Board | Beta | AGPL-3.0 | Drag-and-Drop-Boards, Echtzeit-Updates, Labels, Checklisten, Fälligkeiten |
| BookStack | Dokumentations-Wiki | Beta | MIT | Regal/Buch/Kapitel-Hierarchie, WYSIWYG + Markdown, Volltextsuche, rollenbasierte Berechtigungen |

## IT & Verwaltung

| Dienst | Art | Status | Lizenz | Kernfunktionen |
|---|---|---|---|---|
| Nubus | Portal & IAM | Stable | Apache 2.0 (Keycloak) | Einheitliches Portal, SAML 2.0/OIDC, Benutzerverwaltung, rollenbasierte Zugriffssteuerung |
| Zammad | Ticketsystem | Beta | AGPL-3.0 | Multi-Kanal-Support, Workflow-Automatisierung, Wissensdatenbank, SLA-Management |
| LimeSurvey | Umfrageplattform | Beta | GPL-2.0+ | Umfangreiche Fragetypen, Bedingungslogik, Kontingentverwaltung, mehrsprachige Umfragen |
| TYPO3 | Content-Management-System | Beta | GPL-2.0+ | Multi-Site-Verwaltung, flexible Inhaltsmodellierung, Frontend-Bearbeitung, Erweiterbarkeit |
| LTB SSP | Self-Service-Passwort | Beta | GPL-2.0+ | Passwort-Reset per E-Mail, Sicherheitsfragen, Kontentsperrung aufheben, LDAP-Backend |
