---
title: "Infrastruktur-Autonomie — Fortschrittsbericht Juli 2026"
date: "2026-07-28"
description: "Stalwart v0.16 ersetzt Postfix, alle Dienste per Keycloak-SSO verbunden, ArgoCD-GitOps erweitert und eigene Infrastruktur-Repos zur Entkopplung von externen Registries erstellt."
categories: ["Infrastruktur"]
tags: ["stalwart", "oidc", "keycloak", "argocd", "gitops", "monitoring"]
# image: /static/blog/infrastructure-autonomy-july-2026-teaser.svg
---

# Infrastruktur-Autonomie — Fortschrittsbericht Juli 2026

Die openDesk-Edu-Bereitstellung am HRZ Marburg hat diesen Monat zwei bedeutende Meilensteine erreicht: die vollständige SSO-Integration aller Dienste und eine weitgehende Infrastruktur-Autonomie von externen Registries.

## Stalwart v0.16 ersetzt Postfix

Nach monatelanger Planung wurde Stalwart Mail Server von v0.15 auf **v0.16.15** aktualisiert und hat die Rolle des primären Mail Transfer Agents (MTA) übernommen. Postfix wurde deaktiviert.

**Neuerungen:**
- **9 Listener** — SMTP (25), Submission (587), IMAP (143, 993), POP3 (110, 995), Sieve (4190) und JMAP (8080) — alle aktiv
- **Konfigurationsformat** — von TOML zu JSON mit RocksDB-Backend gewechselt
- **Pfade** — auf `/var/lib/stalwart/` (Daten) und `/etc/stalwart/config.json` (Konfiguration) vereinheitlicht
- **Probes** — von httpGet (kein `/api/health`-Endpunkt in v0.16) auf TCP-Socket-Probes umgestellt
- **Sicherheit** — `allowPrivilegeEscalation=true`, leeres `capabilities.drop` (erforderlich für v0.16 auf K3s v1.32.3)

Dienste nutzen nun Stalwart als SMTP-Relay:
- SOGo — `smtp://stalwart-stalwart:587`
- OpenCloud — `stalwart-stalwart.opendesk.svc.cluster.local:587`
- Alle weiteren benachrichtigungsversendenden Dienste

## Einheitliches SSO per Keycloak

Jeder Dienst authentifiziert sich jetzt über den zentralen Keycloak-Realm (`opendesk`):

| Client-ID | Dienst | Status |
|-----------|--------|--------|
| `opendesk-opencloud` | OpenCloud Cloud-Speicher | ✅ |
| `stalwart` | Stalwart Mailserver | ✅ |
| `sogo` | SOGo Groupware | ✅ |
| `opendesk-matrix` | Element/Synapse Chat | ✅ |
| `opendesk-xwiki` | XWiki Wissensdatenbank | ✅ |
| `univention/oidc` | Portal (Nubus) | ✅ |

Der Keycloak-Bootstrap-Chart (`opendesk-keycloak-bootstrap`) wurde repariert (DNS-Problem `ums-keycloak..svc.cluster.local` → `ums-keycloak.opendesk.svc.cluster.local`) und erstellt nun automatisch alle OIDC-Clients und benutzerdefinierten Scopes.

## ArgoCD-GitOps-Erweiterung

Die ArgoCD-Verwaltung wurde von 2 auf **27 Edu-Anwendungen** erweitert, indem CMP-basierte (Helmfile-Plugin) Apps in Helm-basierte Child-Apps umgewandelt wurden:

- **Helm-basiert (verwaltet)** — opencloud, stalwart, sogo, etherpad, portal-entries (5)
- **CE-verwaltet (Synced)** — 22 Apps
- **CMP-basiert (kosmetisch Unknown)** — 23 Edu-Apps (laufen einwandfrei, Sync-Status ist kosmetisch)

**Herausforderungen:**
- Chart-Fehler behoben — fehlende `fullname`-Vorlage in `_helpers.tpl` (ilias, etherpad)
- `bitnami/kubectl:1.32`-Tag existiert nicht (404) — durch eigenes Image ersetzt
- Init-Container funktionieren nicht in abgeschotteten Netzwerken — `initSchema` deaktiviert
- Helm-Hooks mit OCI-Registry-Images blockieren Sync — `skipOidcHook`-Option hinzugefügt

## Eigene Infrastruktur-Repos

Zur Entkopplung von externen Registries, die vom HRZ-Cluster-Netzwerk aus nicht erreichbar sind, wurden vier unabhängige Repositories erstellt:

| Repository | GitHub | GitLab | Zweck |
|-----------|--------|--------|-------|
| **opendesk-kubectl** | [tobias-weiss-ai-xr/opendesk-kubectl](https://github.com/tobias-weiss-ai-xr/opendesk-kubectl) | [tbsweiss/opendesk-kubectl](https://gitlab.com/tbsweiss/opendesk-kubectl) | Minimales kubectl (~30MB, Alpine-basiert) |
| **opendesk-helm-charts** | [tobias-weiss-ai-xr/opendesk-helm-charts](https://github.com/tobias-weiss-ai-xr/opendesk-helm-charts) | [tbsweiss/opendesk-helm-charts](https://gitlab.com/tbsweiss/opendesk-helm-charts) | Gepatche Charts + OCI-Spiegelwerkzeuge |
| **opendesk-sogo-image** | [tobias-weiss-ai-xr/opendesk-sogo-image](https://github.com/tobias-weiss-ai-xr/opendesk-sogo-image) | [tbsweiss/opendesk-sogo-image](https://gitlab.com/tbsweiss/opendesk-sogo-image) | SOGo mit OIDC/SSO-Unterstützung |
| **opendesk-collab-dashboard** | [tobias-weiss-ai-xr/opendesk-collab-dashboard](https://github.com/tobias-weiss-ai-xr/opendesk-collab-dashboard) | [tbsweiss/opendesk-collab-dashboard](https://gitlab.com/tbsweiss/opendesk-collab-dashboard) | Dashboard mit Übersicht aller Edu-Dienste |

Jedes Repository enthält:
- Dockerfile mit Metadaten und Lizenz
- Makefile mit `build`- und `push`-Zielen
- GitHub-Actions- und GitLab-CI-Pipelines
- Ausführliche README

Das kubectl-Image wurde nach `registry.gitlab.com/tbsweiss/opendesk-kubectl:1.32.3` und `registry.hrz.uni-marburg.de/opendesk/kubectl` gepusht und ersetzt `bitnami/kubectl` (Tag 1.32 nicht gefunden) sowie `lachlanevenson/k8s-kubectl`.

## Monitoring und Backups

- **28/29 Vertragstests bestanden** (1 Übersprung: Stalwart-Versionserkennung kosmetisch)
- **11 Prometheus-Alarmregeln** für Dienststatus, Kontingenterschöpfung, Backup-Fehler
- **k8up-Operator** — 0 Neustarts, Binär via Init-Container bereitgestellt
- **Backup-Pläne** — `backup-live` (RWX-PVCs, täglich 00:42), `backup-stalwart` (RWO via Label, täglich 01:00)
- Alle 29 RWO-PVCs mit `k8up.io/exclude: true` annotiert

## Ausblick

- **Smarthost-Relay** — Stalwart-Auslieferung über den Universitäts-MX-Relay konfigurieren
- **Helm-Chart-OCI-Spiegel** — zwischengespeicherte Charts in die GitLab-Container-Registry übertragen
- **GitHub-Container-Registry** — PAT-Berechtigungen für ghcr.io-Pushes korrigieren
- **Weitere ArgoCD-Konvertierungen** — verbleibende CMP-basierte Apps auf Helm-basiert umstellen
- **Leistungsoptimierung** — Ressourcenoptimierung für 76+ laufende Dienste

---

*Betrieben auf K3s v1.32.3 · 9 Knoten · Ceph-CSI-Speicher · HRZ Marburg*
