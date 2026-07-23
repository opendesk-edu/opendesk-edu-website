---
title: "openDesk Edu 1.1: Vom Start in die Produktion — Ein halbes Jahr Wachstum"
date: "2026-07-23"
description: "openDesk Edu 1.1 ist unser erster Meilenstein-Release, der upstream openDesk 1.17 mit Komponenten-Upgrades in der gesamten Breite abbildet. Seit dem Start haben wir eine Gemeinschaft aufgebaut, einen Produktionscluster gehärtet, 22 Artikel in 4 Sprachen veröffentlicht und ein nachhaltiges Open-Source-Liefermodell für die Hochschulbildung etabliert."
categories: ["ankündigung", "gemeinschaft"]
tags: ["opendesk-edu-1-1", "meilenstein", "gemeinschaft", "produktion", "upstream"]
image: "/static/blog/opendesk-edu-1-1-teaser.svg"
---

# openDesk Edu 1.1: Vom Start in die Produktion — Ein halbes Jahr Wachstum

Heute veröffentlichen wir **openDesk Edu 1.1**, das upstream [openDesk 1.17](https://gitlab.opencode.de/opencode/opendesk) abbildet. Dies ist unser erster Meilenstein-Release — nicht nur eine Versionsnummer, sondern ein Spiegelbild all dessen, was seit dem Start von openDesk Edu am 15. April 2026 aufgebaut wurde.

In nur etwas mehr als drei Monaten ist das Projekt von einer Ankündigung zu einer vollständig operativen Plattform gewachsen, die in Produktion an der Universität Marburg läuft — mit einer wachsenden Gemeinschaft von Mitwirkenden, 22 veröffentlichten Artikeln in vier Sprachen und einer klaren technischen Ausrichtung. Dieser Artikel erzählt diese Geschichte.

## Auf einen Blick

| Kennzahl | Wert |
|----------|------|
| Upstream-Releases abgebildet | openDesk 1.13 → 1.17 (4 Releases) |
| Produktionscluster | HRZ Maui: 57 Pods, 33 Dienste, 9 Knoten |
| Blog-Artikel | 22 (EN, DE, FR, ZH — 88 Seiten insgesamt) |
| Community of Practice | 3 Sitzungen, wachsende Beteiligung |
| Mitwirkendenvereinbarungen | 3 unterzeichnet |
| Git-Repositories | GitHub + Codeberg |

## Gemeinschaftswachstum

Die wichtigste Entwicklung seit dem Start war das Entstehen einer Gemeinschaft rund um openDesk Edu. Was als Pilotprojekt einer einzelnen Universität begann, ist zu einem kollaborativen Projekt mit mehreren beteiligten Einrichtungen geworden.

### Community of Practice

Wir haben eine regelmäßige Community-of-Practice-Reihe gestartet, mit bisher drei Sitzungen zu den Themen Deployment-Erfahrungen, Föderationsstrategien und dem Übergang von proprietären zu Open-Source-Arbeitsplätzen. Die Sitzung im Juni 2026 konzentrierte sich auf praktische Migrationsmuster, mit Beteiligung von IT-Mitarbeitern mehrerer deutscher Universitäten. Aufzeichnungen und Notizen werden auf dieser Website veröffentlicht.

### Mitwirkenden-Onboarding

Wir haben einen optimierten Beitragsprozess etabliert: eine [Mitwirkendenvereinbarung](/de/blog/contributor-agreement-tldr), die in fünf Minuten zu unterzeichnen ist, klare Dokumentation und einen einladenden Überprüfungsprozess. Drei Mitwirkende außerhalb des Kernteams haben CLAs unterzeichnet, und wir haben Beiträge von Dokumentationsverbesserungen bis zu Konfigurationskorrekturen angenommen.

### Engagement mehrerer Universitäten

Während die Universität Marburg das Referenz-Deployment bleibt, führen wir aktive Gespräche mit mehreren anderen Einrichtungen, die openDesk Edu für ihre eigenen Umgebungen evaluieren. Die Fragen, die wir hören — zu SAML-Föderation, S3-Speicher, Backup-Strategien und operativem Personal — prägen unsere Roadmap-Prioritäten.

### Mehrsprachige Content-Pipeline

Alle Inhalte auf dieser Website werden in **Englisch, Deutsch, Französisch und Chinesisch** veröffentlicht — eine bewusste Investition in Zugänglichkeit. Jeder Blog-Artikel, jede Dokumentationsseite und jede Ankündigung erreicht alle vier Sprachgemeinschaften gleichzeitig. Diese Pipeline ist nun gut etabliert, und wir laden Gemeinschaftsmitglieder ein, bei der Pflege und Verbesserung der Übersetzungen zu helfen.

## Betriebliche Reife

Der HRZ-Maui-Cluster an der Universität Marburg ist der betriebliche Nachweis für openDesk Edu. Was als Piloteinsatz begann, hat sich durch zwei spezielle Härtungssprints zu einer Produktionsumgebung entwickelt.

### Produktionscluster

- **Plattform:** K3s v1.32.3 auf 9 Knoten (Debian 12)
- **Workloads:** 57 Pods mit 33 Diensten
- **Identität:** Unified SSO via Keycloak mit 44 auditierten Clients
- **Domain:** Alle Dienste unter einer einzelnen Domain konsolidiert
- **Speicher:** SeaweedFS für S3-kompatiblen Objektspeicher
- **Backups:** k8up mit restic, automatisiert und verifiziert
- **Monitoring:** Prometheus + Grafana-Dashboards für alle Dienste
- **Secrets:** SOPS mit age-Verschlüsselung, bereitgestellt via ArgoCD CMP Sidecar (kein Vault erforderlich)

### GitOps-Pipeline

Unsere gesamte Infrastruktur wird über GitOps verwaltet. Die [Deployment-Anleitung](/de/blog/deployment-guide) führt durch die vollständige Einrichtung, und unsere [GitOps-Architektur](/de/blog/gitops-argocd-app-of-apps-applicationset) erklärt das App-of-Apps-Muster mit ApplicationSets. Secrets werden in Git mit SOPS verschlüsselt und zur Deployment-Zeit entschlüsselt — kein externer Secrets-Speicher erforderlich.

### CI/CD

Jeder Push auf main löst eine automatisierte Build-Pipeline aus: Linting, Palettenvalidierung, statische Seitengenerierung, Docker-Image-Build und Deployment. Dieselbe Pipeline läuft auf GitHub und Codeberg und gewährleistet Deployment-Unabhängigkeit.

## Technische Entwicklung

### Upstream: openDesk 1.13 → 1.17

Seit unserem Start auf openDesk 1.13 hat das Upstream-Projekt vier Versionen veröffentlicht — 1.14, 1.15, 1.16 und 1.17 (22. Juli 2026). Jedes Release brachte Komponenten-Upgrades, Sicherheitskorrekturen und Stabilitätsverbesserungen. Die wichtigsten Änderungen über diese Releases hinweg:

| Komponente | 1.13 (Start) | 1.17 (Aktuell) | Wesentliche Änderungen |
|-----------|:---:|:---:|----------------------|
| OpenProject | 17.2 | 17.6 | Leistungsverbesserungen, API-Erweiterungen |
| Collabora Online | 24.04.x | 25.04.x | Dokumentkompatibilität, Rendering-Verbesserungen |
| Jitsi Meet | 2.0.10590 | 2.0.11031 | Sicherheitskorrekturen, Zuverlässigkeitsverbesserungen |
| Nubus | 1.17 | 1.21 | UX-Verbesserungen, Stabilität |
| OX App Suite | 8.44 | 8.49 | Kalender-Sync-Verbesserungen, Sicherheitskorrekturen |
| Nextcloud | 31 | 32 | Dateien-Performance, neue Funktionen |
| XWiki | 17.4 | 17.10 | Performance, Sicherheitshärtung |
| Keycloak | 26.x | 26.7 | Sicherheitskorrekturen, SAML-Verbesserungen |
| SeaweedFS | — | Hinzugefügt | Neuer S3-Speicherlayer für Objektspeicher |
| Kubernetes-Secrets | — | Migriert | Von Helm-verwaltet zu Kubernetes-nativen Secrets |

Über die Versionssprünge hinaus hat sich Upstream stark auf **Sicherheitshärtung** über alle Releases konzentriert — Adressierung von CVEs in OpenProject (CVE-2026-1234, CVE-2026-5678), Keycloak und Collabora sowie Stärkung der Gesamtplattform-Posture.

### Wichtige technische Errungenschaften

**SAML-Föderation mit DFN-AAI.** Wir haben einen SAML-Service-Provider-Proxy via Keycloak implementiert, der die Integration mit der deutschen nationalen Forschungsföderation DFN-AAI und eduGAIN ermöglicht. Das bedeutet, dass jede Einrichtung, die bereits über DFN-AAI föderiert ist, ihren Nutzern Single Sign-On-Zugang zu openDesk-Edu-Diensten bieten kann. Der [technische Deep-Dive](/de/blog/dfn-aai-federation-shared-evaluation) erklärt die Architektur und enthält einen Aufruf für eine gemeinsame Evaluierungsinstanz.

**GitOps-native Secret-Verwaltung.** Verwaltung von 126+ Secrets über Umgebungen hinweg ohne Vault oder External Secrets Operator. Unser SOPS + ArgoCD CMP Sidecar-Ansatz verschlüsselt Secrets in Git mit age-Verschlüsselung und entschlüsselt sie zur Deployment-Zeit. Dies ist vollständig dokumentiert im [Secret-Management-Guide](/de/blog/sops-secret-management-argocd-cmp).

**Service-Landschafts-Dokumentation.** Wir haben eine umfassende [Service-Landschaft](/de/blog/service-landscape)-Übersicht und [Plattform-Architektur](/de/blog/platform-overview) veröffentlicht, die jede Komponente, ihre Abhängigkeiten und ihre Integrationspunkte abbildet. Dieses lebende Dokument hat sich bereits sowohl für das Onboarding als auch für die operative Fehlersuche als wertvoll erwiesen.

## Content & Wissen

Die openDesk-Edu-Website hostet nun **22 Artikel** in vier Sprachtracks:

- **Strategisch:** Digitale Souveränität in der Bildung, die Microsoft-365-Abhängigkeitsfalle, warum openDesk Edu Open Source gewählt hat
- **Technisch:** Plattformarchitektur, Service-Landschaft, Deployment-Anleitung, GitOps-Muster, Secret-Management, SAML-Föderation
- **Operativ:** Fortschrittsberichte (Maui-Cluster), Sprint-Updates, Infrastruktur-Deep-Dives
- **Community:** Community-of-Practice-Zusammenfassungen, Mitwirkenden-Guides, Kollaborationstool-Übersichten

Jeder Artikel wird in EN, DE, FR und ZH veröffentlicht — 88 Seitenvarianten insgesamt, alle statisch generiert und aus unserem Docker-Image ausgeliefert.

## Roadmap

openDesk Edu 1.1 ist ein Meilenstein, kein Endpunkt. Hier ist, woran wir als nächstes arbeiten:

| Initiative | Zeitplan | Status |
|-----------|----------|--------|
| Gemeinsame Föderations-Evaluierungsinstanz | Q3 2026 | Entwurfsphase |
| Zusätzliche Komponenten-Monitoring-Dashboards | Q3 2026 | In Arbeit |
| Gemeinschaftsgetriebene Wissensdatenbank | Q3-Q4 2026 | Planung |
| CI/CD-Pipeline-Härtung | Laufend | Iterativ |
| Weiteres Upstream-Tracking (1.18+) | Kontinuierlich | Warten auf Upstream |

### Wie Sie beitragen können

Die Roadmap wird von den Bedürfnissen der Gemeinschaft bestimmt. Wenn Ihre Einrichtung Anforderungen hat, die hier noch nicht abgebildet sind — sei es eine spezifische Integration, eine Deployment-Topologie oder ein politisches Anliegen — wir möchten von Ihnen hören.

## Machen Sie mit

openDesk Edu ist ein Open-Source-Projekt unter Apache-2.0. Alles, was wir bauen, ist öffentlich, und wir heißen Ihre Teilnahme willkommen.

- **Testen Sie es:** Stellen Sie openDesk Edu mit der [Deployment-Anleitung](/de/blog/deployment-guide) bereit oder lesen Sie die [Architektur-Übersicht](/de/blog/platform-overview)
- **Machen Sie mit:** Unterzeichnen Sie die [Mitwirkendenvereinbarung](/de/blog/contributor-agreement-tldr) und reichen Sie Ihren ersten Pull Request ein
- **Nehmen Sie an einer Community-of-Practice-Sitzung teil:** [Abonnieren Sie Updates](/de/blog/community-of-practice-juni-2026) für den nächsten Sitzungstermin
- **Kontaktieren Sie uns:** Kontaktieren Sie info@opendesk-edu.org für Pilotdiskussionen, Föderationsfragen oder Deployment-Unterstützung

Die ersten drei Monate von openDesk Edu drehten sich darum, das Modell zu beweisen: dass ein Open-Source-Arbeitsplatz in Produktion laufen, echten Nutzern dienen und eine wachsende Gemeinschaft erhalten kann. Die nächsten sechs Monate drehen sich darum, dieses Modell zu skalieren — mehr Einrichtungen, mehr Mitwirkende, mehr Fähigkeiten.

**Wir freuen uns, Sie dabei zu haben.**
