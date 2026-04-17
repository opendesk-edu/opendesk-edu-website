---
title: "Systemarchitektur-Übersicht"
date: "2026-04-15"
description: "Eine Übersicht der openDesk Edu-Systemarchitektur, einschließlich Kubernetes-Orchestrierung, SAML-Föderation mit DFN-AAI und eduGAIN, zentralem Keycloak-SSO und dem vollständigen Servicekatalog mit 25 Komponenten."
categories: ["architektur", "infrastruktur"]
tags: ["architektur", "kubernetes", "saml", "keycloak", "föderation"]
---

# Systemarchitektur-Übersicht

openDesk Edu erweitert die openDesk Collaboration Environment (CE) um eine dedizierte Schicht von Bildungsdiensten und schafft so einen einheitlichen digitalen Arbeitsplatz für Schulen, Hochschulen und Forschungseinrichtungen. Aufbauend auf openDesk CE v1.13.x bündelt die Plattform 25 Dienste in einem einzigen, per Kubernetes verwalteten Cluster mit zentraler Authentifizierung, automatisierten Backups und Zertifikatsverwaltung über die Bundesdruckerei. Alles wird unter der Apache-2.0-Lizenz ausgeliefert und mit einem einzigen Befehl deployed: `helmfile -e default apply`.

## Grundprinzipien

**Container-Natives Design**

Jeder Dienst läuft als Container-Image, das von Kubernetes 1.28+ orchestriert wird. Helm-3-Charts verwalten die individuellen Service-Deployments, während helmfile den gesamten Stack deklarativ orchestriert. Die Konfiguration liegt in `helmfile/environments/default/global.yaml.gotmpl` und bietet Operatoren eine einzige Datei, um Serviceeinstellungen, Ressourcenlimits und Feature-Flags plattformweit anzupassen. Das bedeutet, dass einzelne Komponenten aktualisiert werden können, ohne den restlichen Stack zu berühren.

**Föderierte Identität**

Die Authentifizierung läuft über Keycloak als zentralen Identity-Provider, der sowohl SAML 2.0 als auch OpenID Connect spricht. Institutionen können sich an nationale Forschungsföderationen (DFN-AAI in Deutschland, eduGAIN international) anbinden, sodass Studierende und Beschäftigte ihre bestehenden Hochschulzugangsdaten verwenden. Shibboleth fungiert als SAML-Service-Provider für Dienste wie ILIAS, Moodle und BigBlueButton. Nubus ergänzt das Ganze um ein Self-Service-Portal für Identitäts- und Zugriffsverwaltung.

**Datensouveränität**

Alle Daten verbleiben innerhalb der Infrastruktur der jeweiligen Einrichtung. Keine Komponente sendet Daten an externe SaaS-Endpunkte. Persistente Speicherung erfolgt über Kubernetes-PersistentVolumes, die automatisch vom k8up-Operator mit restic gesichert werden. TLS-Zertifikate stammen von openDesk Certificates (Bundesdruckerei), sodass die gesamte Vertrauenskette unter institutioneller Kontrolle bleibt.

**Modulare Architektur**

Die 25 Dienste sind nach Funktion gruppiert und können über helmfile-Werte unabhängig voneinander aktiviert oder deaktiviert werden. Nur die LMS-Schicht benötigt? ILIAS und Moodle ohne Groupware oder Video-Stack deployen. LimeSurvey nicht nötig? Einfach weglassen. Jede Komponente hat ihr eigenes Helm-Chart, ihren eigenen Datenbank- oder Storage-Claim und eigene Skalierungsparameter.

## Technologiestack

| Komponente | Version / Details |
|------------|-------------------|
| Kubernetes | 1.28+ |
| Helm | 3.x |
| helmfile | deklarative Orchestrierung |
| Keycloak | SAML 2.0 + OIDC IdP |
| Shibboleth | SAML SP für LMS/Video-Dienste |
| Nubus | AGPL-3.0, v1.18.1, Portal und IAM |
| k8up | Kubernetes-Backup-Operator |
| restic | Backup-Speicher-Backend |
| openDesk Certificates | TLS über Bundesdruckerei |
| Basisplattform | openDesk CE v1.13.x |

## Service-Architektur

Die Plattform ist in drei Schichten organisiert:

**openDesk CE-Basisschicht**

Dies ist die Upstream-openDesk Collaboration Environment mit den zentralen Produktivitäts- und Kollaborationstools. Sie umfasst Echtzeit-Chat (Element), Dateifreigabe (Nextcloud, OpenCloud), Groupware (OX App Suite, SOGo), Videokonferenzen (Jitsi), kollaboratives Bearbeiten (Collabora, Etherpad) und Wissensmanagement (XWiki, BookStack). Diese Dienste sind produktionsreif und folgen den Upstream-Release-Zyklen von openDesk CE.

**Bildungsdienst-Schicht**

Auf der Basisschicht fügt openDesk Edu 15 bildungsspezifische Dienste hinzu. Diese Schicht umfasst Learning-Management-Systeme (ILIAS, Moodle), virtuelle Klassenzimmer (BigBlueButton), institutionelle E-Mail (Grommunio), ein Content-Management-System (TYPO3), Umfragetools (LimeSurvey) und weitere. Alle Dienste dieser Schicht tragen den Status Beta, während die Integrationsmuster stabilisiert werden.

**SSO- und Auth-Schicht**

Keycloak steht im Zentrum und vermittelt die Authentifizierung für jeden Dienst in beiden Schichten. Es verbindet sich über SAML-Metadata-Exchange mit DFN-AAI oder eduGAIN und spricht mit den nachgelagerten Diensten je nach Unterstützung über SAML 2.0 oder OIDC. Shibboleth schließt die Lücke für Anwendungen, die einen dedizierten SAML-Service-Provider benötigen. Nubus bietet das nutzerorientierte Portal zur Kontoverwaltung, Gruppenverwaltung und Applikationsstart.

## Authentifizierung und SAML-Föderation

Keycloak dient als zentraler Identity-Provider für die gesamte Plattform und unterstützt zwei Protokollfamilien gleichzeitig:

- **SAML 2.0** für die Integration mit nationalen Forschungsföderationen und älteren Service-Providern
- **OpenID Connect (OIDC)** für moderne Anwendungen mit tokenbasierter Authentifizierung

**Föderationsunterstützung**

Die Plattform liefert Metadatenvorlagen für DFN-AAI (die deutsche Forschungs- und Bildungsidentitätsföderation) und eduGAIN (die internationale Interföderation). Die Anbindung an den Identity-Provider der eigenen Einrichtung erfordert die Registrierung der Keycloak-Instanz bei der Föderation, das Hochladen der Föderationsmetadaten und die Konfiguration des Attribut-Mappings. Danach können alle Nutzer mit einem gültigen eduGAIN-Account einer teilnehmenden Einrichtung sich mit ihren Home-Zugangsdaten anmelden.

**Shibboleth-Service-Provider**

Einige Bildungsdienste, insbesondere ILIAS, Moodle und BigBlueButton, benötigen einen dedizierten SAML-SP statt direktem OIDC. Shibboleth übernimmt diese Aufgabe, indem es die SAML-Assertions von Keycloak in das Format übersetzt, das diese Anwendungen erwarten.

**Nubus-Portal**

Nubus (v1.18.1, AGPL-3.0) bildet die nutzerseitige Schicht des Identity-Stacks. Es bietet Endnutzern einen zentralen Ort für Profilansicht, Gruppenmitgliedschaften, Applikationsstart und Passwort-Reset. Administratoren erhalten Funktionalitäten für Gruppenverwaltung, Rollenzuweisung und Audit-Logging über alle verbundenen Dienste.

## Backup und Datenmanagement

Der k8up-Operator läuft innerhalb des Kubernetes-Clusters und verwaltet automatisierte Backups mit restic als Speicher-Backend. Backups folgen einem konfigurierbaren Zeitplan:

- **Täglich** für Datenbanken und den Anwendungszustand
- **Wöchentlich** vollständige Snapshots der PersistentVolumes
- **Bedarfsgesteuert** manuelle Auslösung für Vorabmigrationen oder Disaster Recovery

**Was gesichert wird**

Alle persistenten Daten aller Dienste sind eingeschlossen: LMS-Kursinhalte und Einreichungen (ILIAS, Moodle), BigBlueButton-Aufzeichnungen, Nextcloud- und OpenCloud-Nutzerdateien, Grommunio-Postfächer (via MariaDB-Dumps), Collabora-Dokumentencaches und Konfigurationsdaten von Keycloak und Nubus. Nicht persistente Daten wie Container-Images und ephemere Caches werden ausgeschlossen.

**Speicherziele**

Restic unterstützt eine breite Palette von Speicher-Backends, sodass Einrichtungen Backups auf lokales NFS, S3-kompatiblen Object Storage oder jedes andere von restic unterstützte Ziel lenken können. Die Verschlüsselung ist integriert: Alle Backup-Daten werden im Ruhezustand mit einem konfigurierbaren Schlüssel verschlüsselt.

## Komponentenübersicht

Die folgende Tabelle listet alle 25 Dienste des openDesk Edu-Stacks, gruppiert nach Funktion.

| Funktion | Dienst | Version | Status |
|----------|--------|---------|--------|
| **Chat** | Element | 1.12.6 | Stabil |
| **Notizen** | Notes | 4.4.0 | Stabil |
| **Diagramme** | Draw.io | 29.6 | Stabil |
| **Diagramme** | Excalidraw | latest | Stabil |
| **Dateien** | Nextcloud | 32.0.6 | Stabil |
| **Dateien** | OpenCloud | 4.0.3 | Beta |
| **Groupware** | OX App Suite | 8.46 | Stabil |
| **Groupware** | SOGo | 5.11 | Stabil |
| **Groupware** | Grommunio | 2025.01 | Beta |
| **Wiki** | XWiki | 17.10.4 | Stabil |
| **Wiki** | BookStack | 26.03 | Stabil |
| **Portal / IAM** | Nubus | 1.18.1 | Beta |
| **Projekte** | OpenProject | 17.2.1 | Stabil |
| **Meetings** | Jitsi | 2.0.10590 | Stabil |
| **Office** | Collabora | 25.04.8 | Stabil |
| **Kollab. Bearbeitung** | Etherpad | 1.9.9 | Stabil |
| **Kollab. Bearbeitung** | CryptPad | 2025.9.0 | Stabil |
| **LMS** | ILIAS | 7.28 | Beta |
| **LMS** | Moodle | 4.4 | Beta |
| **Vorlesungen** | BigBlueButton | 2.7 | Beta |
| **Kanban** | Planka | 2.1.0 | Stabil |
| **Helpdesk** | Zammad | 7.0 | Stabil |
| **Umfragen** | LimeSurvey | 6.6 | Beta |
| **Passwort-Reset** | LTB SSP | 1.7 | Beta |
| **CMS** | TYPO3 | 13.4 | Beta |

Dienste mit Status "Stabil" werden als Teil des Upstream-openDesk-CE-Release ausgeliefert. Dienste mit Status "Beta" gehören zur openDesk Edu-Bildungsschicht und werden aktiv stabilisiert.

## Alternative Komponenten

Mehrere Funktionsbereiche bieten mehrere Service-Optionen, sodass Einrichtungen das Tool wählen können, das am besten zu ihren Anforderungen passt:

- **E-Mail**: OX App Suite, SOGo oder Grommunio
- **Videokonferenzen**: Jitsi oder BigBlueButton
- **Dateispeicher**: Nextcloud oder OpenCloud
- **Whiteboard**: Excalidraw oder CryptPad

Jede Alternative nutzt dieselbe Keycloak-Authentifizierung, dieselbe Backup-Pipeline und dieselbe Zertifikatsinfrastruktur. Der Wechsel zwischen Alternativen erfolgt durch Aktivieren bzw. Deaktivieren des entsprechenden Charts in den helmfile-Werten. Einen detaillierten Feature-, Lizenz- und Ressourcenvergleich finden Sie auf der [Komponentenvergleichsseite](/components/comparison).
