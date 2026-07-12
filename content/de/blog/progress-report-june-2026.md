---
title: "Fortschrittsbericht: openDesk Edu am HRZ Maui — Juni 2026"
date: "2026-06-04"
description: "Nach fünf Monaten Betrieb und zwei Härtungs-Sprints läuft openDesk Edu am Hochschulrechenzentrum der Universität Marburg in voller Betriebsstärke. Ein Überblick — inklusive Upstream-Integration in den Haupt-cluster des openDesk HRZ."
categories: ["status-bericht"]
tags: ["bereitstellung", "infrastruktur", "kubernetes", "sprint", "universität-marburg"]
image: "/static/blog/progress-report-june-2026-teaser.png"
---

# Fortschrittsbericht: openDesk Edu am HRZ Maui — Juni 2026

> **57 Pods laufen. 33 Dienste mit einheitlichem SSO. 44 Keycloak-Clients auditiert und migriert.**
> k8up-Backups aktiv, Grafana-Dashboards bereitgestellt, alle Ingresses auf eine Domain konsolidiert.

Seit der Bereitstellung von openDesk Edu auf dem HRZ-Maui-Cluster (K3s v1.32.3, 9 Nodes, Debian 12) haben wir zwei fokussierte Härtungs-Sprints (Sprints 5–6) zur Betriebsstabilität, Domainkonsolidierung und Dienstgesundheit abgeschlossen.

## Cluster auf einen Blick

| Metrik | Wert |
|:-------|:-----|
| Cluster | K3s v1.32.3, 9 Nodes (3 CP, 6 Worker) |
| Domain | `*.opendesk.hrz.uni-marburg.de` |
| Ingress | HAProxy-Controller (192.168.3.201) |
| Storage | Ceph RBD SSD (RWO), CephFS HDD EC (RWX) |
| SSO | Keycloak OIDC + SAML, 44 Clients |
| Backups | k8up / restic → S3, täglich 01:22, 14 Tage Aufbewahrung |
| Monitoring | Prometheus + Grafana (12.4.1) |

## Was wurde behoben?

### SSO-Audit (Sprint 5)
Alle 44 Keycloak-Clients in der `opendesk`-Realm wurden auditiert und von der alten `opendesk-edu.org`-Domain auf `opendesk.hrz.uni-marburg.de` migriert. Jede Client-URI, Redirect-URL und Issuer wurde über die Keycloak-Admin-API verifiziert.

### Domain-Migration
Zwölf Ingresses (3 Portal, 9 Static-Files) wurden von `*.opendesk-edu.org` auf `*.opendesk.hrz.uni-marburg.de` migriert. Die Quelle der hartcodierten Alt-Domain — `portal-saml-multidomain.yaml.gotmpl` — wurde auf Chart-Ebene korrigiert und committet.

### Dienst-Reparaturen

| Dienst | Problem | Lösung |
|:-------|:--------|:-------|
| **Planka** | Ingress-Klasse `nginx` (kein Controller), OIDC-Endpunkte enthielten ungerenderte `.gotmpl`-Syntax | Auf `haproxy` korrigiert, OIDC-URLs per `--set` gesetzt |
| **SSP** | Ingress-Backend zeigte auf nicht existierenden Service | Chart-Template war bereits korrigiert; Upgrade ausgeführt |
| **Planka-Chart** | `values.yaml` enthielt helmfile-`.gotmpl`-Ausdrücke | Durch leere Strings ersetzt; Endpunkte werden beim Deploy gesetzt |

### Infrastruktur
- **k8up**-Operator im `opendesk`-Namespace bereitgestellt. Backup-Plan `backup-edu` läuft täglich um 01:22 mit 14 Tagen Aufbewahrung. 33 Snapshots in S3 bestätigt.
- **Grafana**-Dashboards für Edu-Dienstgesundheit, k8up-Backup-Übersicht und Cluster-Übersicht bereitgestellt.
- **Externes DNS** — Skript für 12 Dienste erstellt, die noch auf `/etc/hosts`-Auflösung angewiesen sind (n8n, code, collab, draw, jupyter, limesurvey, typo3, zammad, r, slides, term, ai).

## Aktuelle Dienstgesundheit

Alle Kerndienste antworten korrekt:

| Dienst | Endpunkt | Status |
|:-------|:---------|:-------|
| Moodle LMS | `moodle.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| ILIAS LMS | `lms.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| JupyterHub | `jupyter.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO-Weiterleitung) |
| BookStack | `bookstack.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO-Weiterleitung) |
| OpenProject | `projects.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO-Weiterleitung) |
| Element (Chat) | `chat.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| Jitsi (Meet) | `meet.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| Nextcloud (Dateien) | `files.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO-Weiterleitung) |
| OX App Suite (Mail) | `webmail.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO-Weiterleitung) |
| XWiki | `wiki.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO-Weiterleitung) |
| Planka | `planka.opendesk.hrz.uni-marburg.de` | ✅ 200 mit OIDC |
| SSP | `ssp.opendesk.hrz.uni-marburg.de` | ✅ 403/200 (OIDC-Auth) |

## Upstream-Integration in den openDesk-Cluster

Am 1. Juni wurden alle 20+ opendesk-edu-Dienste in das Haupt-deployment des openDesk-HRZ-Clusters aufgenommen. Die edu-spezifischen Chart-Werte und Konfigurationen sind nun Teil der openDesk-helmfile-Pipeline — sie werden zusammen mit der Kerninfrastruktur deployed und teilen sich denselben Ingress-Controller, Monitoring-Stack und Backup-Plan.

**Integrierte Dienste:**

| Typ | Dienste |
|:----|:--------|
| Lokale Charts | Etherpad, BookStack, Planka, Zammad, LimeSurvey, Draw.io, Excalidraw, Self-Service-Password, SOGo, RStudio, ttyd, Slidev, Collab Dashboard, Portal Entries |
| Externe Charts | JupyterHub, Open WebUI, Code-Server, Dask, Ollama |
| Ausstehend (Auth) | Overleaf, KasmVNC, TYPO3, Grommunio |

Diese Integration macht den separaten `opendesk-edu`-Namespace überflüssig. Die edu-Dienste werden nun einheitlich über das openDesk-Cluster-Management verwaltet — dieselben Grafana-Dashboards, dieselben k8up-Backup-Richtlinien, dieselben HAProxy-Ingress-Regeln. Das Repository `opendesk-edu` bleibt die Quelle der Wahrheit für edu-spezifische Chart-Werte und Dokumentation, aber das eigentliche Deployment läuft nun in der openDesk-Haupt-Pipeline.

## Ausblick

Nach den Härtungs-Sprints und der begonnenen Upstream-Integration liegt der Fokus nun auf:

1. **Externem DNS** — Übergabe des generierten DNS-Record-Skripts an die HRZ-Netzadministration, um die `/etc/hosts`-Abhängigkeit für 12 Dienste zu beseitigen
2. **Helmfile-Pipeline** — Ziel ist ein `helmfile sync` gegen den Haupt-openDesk-Cluster (nicht mehr den separaten `opendesk-edu`-Namespace); der Upstream-Merge vom 1. Juni hat die Grundlage bereits gelegt
3. **Vollständigen Login-Tests** — End-to-End-Validierung der OIDC/SAML-Flows für alle Dienste
4. **v1.1 Foundation** — DFN-AAI-SAML-Föderationstests, Container-Image-Build-Pipeline, Backchannel-Logout-Verifikation, Integration der ausstehenden Charts

Sie möchten openDesk Edu an Ihrer Hochschule einsetzen? Zum [Getting Started Guide](/docs/deployment) und [Repository](https://codeberg.org/opendesk-edu/opendesk-edu).
