---
title: "openDesk Edu Service Landscape — Das gesamte Ökosystem auf einen Blick"
date: "2026-06-29"
description: "Entdecken Sie die interaktive openDesk Edu Service Landscape: eine visuelle Karte aller integrierten Open-Source-Dienste in den verschiedenen Domänen — von der Kernplattform über Bildung und Forschung bis zu Sicherheit und Compliance."
categories: ["Plattform", "Open Source", "Werkzeuge"]
tags: ["landscape", "dienste", "übersicht", "opendesk", "ökosystem"]
image: "/static/blog/service-landscape-teaser.svg"
---

# openDesk Edu Service Landscape — Das gesamte Ökosystem auf einen Blick

## Was ist die Service Landscape?

Eine Plattform mit vielen integrierten Diensten zu überblicken ist herausfordernd — besonders wenn Sie openDesk Edu für Ihre Einrichtung evaluieren oder verstehen möchten, wie das Ökosystem zusammenhängt.

Die **[openDesk Edu Service Landscape](https://landscape.opendesk-edu.org)** ist eine interaktive, visuelle Karte, die genau diese Frage beantwortet. Sie zeigt jeden Dienst im openDesk-Edu-Ökosystem, geordnet nach Domäne, mit Statusanzeigen, Beschreibungen und direkten Links zur Hauptseite und zur Dokumentation.

Stellen Sie es sich als das "CNCF Landscape" für openDesk Edu vor — aber speziell für Entscheidungsträger, Betreiber und Lehrende in der Hochschulbildung.

## Fünf Domänen, eine Plattform

Die Landscape gruppiert alle Dienste in Domänen, die jeweils einen Pfeiler der digitalen Bildungsinfrastruktur repräsentieren:

### 🔐 Kernplattform
Das Fundament: **Keycloak** für zentrales SSO, **OpenCloud** für Dateisynchronisation und -freigabe, **Dovecot + Postfix** für E-Mail, **SOGo** für Groupware, **Matrix + Element** für verschlüsselte Kommunikation, **Etherpad** für Echtzeit-Zusammenarbeit, **Nubus Portal** für IAM, verwaltete **PostgreSQL + MySQL**-Datenbanken und **MinIO S3**-Objektspeicher.

### 🎓 Bildung & Forschung
Speziell für die Wissenschaft: **Moodle** und **ILIAS** als Lernmanagementsysteme, **JupyterHub** für computergestützte Forschung, **XWiki** für Wissensmanagement und **OpenProject** für das Projektmanagement in der Forschung.

### 🤝 Zusammenarbeit & Produktivität
Werkzeuge für den Arbeitsalltag: **Collabora Online** für die Echtzeit-Dokumentenbearbeitung, **OpenStreetMap** für Geodienste, **Jitsi Meet** für Videokonferenzen, **Planka** für Kanban-Aufgabenmanagement, **n8n + Dify** für Workflow-Automation und KI-Agenten sowie **WordPress** für Inhaltsverwaltung.

### ⚙️ Infrastruktur & Betrieb
Der Maschinenraum: **K3s + ArgoCD** für Kubernetes und GitOps, **Prometheus + Grafana** für Observability, **k8up** für Backups, **Traefik + HAProxy** für Ingress sowie **Ceph CSI** für softwaredefinierten Speicher.

### 🛡️ Sicherheit & Compliance
Schutz und Governance: **ClamAV** für Virenscans, **cert-manager** für automatisierte TLS-Zertifikate, **Kubescape** für Kubernetes-Sicherheitsscans und dokumentierte **Pentest Reports** mit Nachverfolgung von Maßnahmen.

## Interaktive Funktionen

Die Landscape ist kein statisches Diagramm — sie ist eine live, filterbare Oberfläche:

- **Domänen-Gruppierung** — Dienste sind farblich nach ihrer Domäne gekennzeichnet
- **Status-Badges** — auf einen Blick erkennbar: Production, Beta oder Development
- **Service-Karten** — jeder Dienst zeigt Schlüsseltechnologien und eine Kurzbeschreibung
- **Schnellzugriff** — ein Klick zur Hauptseite oder zur OpenSpec-Dokumentation
- **Automatisch aktualisiert** — die Landscape spiegelt den aktuellen Bereitstellungszustand wider

## Warum die Landscape nutzen?

Für **Entscheidungsträger** bietet die Landscape eine Helikopterperspektive: Sie können sofort die Breite der Plattform erfassen, verstehen, welche Domänen abgedeckt sind, und identifizieren, welche Dienste zu den Anforderungen Ihrer Einrichtung passen.

Für **Betreiber und Architekten** dient sie als Referenzkarte des Stacks — nützlich beim Einarbeiten neuer Teammitglieder, bei der Planung von Integrationen oder bei der Kommunikation des Plattformumfangs an Stakeholder.

Für die **Community** schafft sie eine gemeinsame visuelle Sprache: Wenn wir über "die Plattform" sprechen, kann jeder genau sehen, was damit gemeint ist.

## Landscape besuchen

[**→ landscape.opendesk-edu.org**](https://landscape.opendesk-edu.org)

Die Landscape ist Open Source und wird gemeinsam mit der Plattform gepflegt. Pull Requests und Anregungen sind willkommen — der Quellcode ist zusammen mit dem Rest von openDesk Edu auf GitHub verfügbar.

*Letzte Aktualisierung: Juni 2026*
