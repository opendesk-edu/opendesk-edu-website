---
title: "Sprint 1 abgeschlossen: Infrastruktur-Korrekturen im Maui-Cluster"
date: "2026-06-17"
description: "Sprint 1 des Maui-Cluster-Sanierungsplans ist abgeschlossen — der festsitzende slidev-PVC wurde gelöst, SOGo in den richtigen Namespace migriert, Storage-Klassen überprüft und Smoke-Tests für alle Kerndienste bestanden."
image: "/static/blog/maui-cluster-sprint-update-teaser.png"
categories: ["status-bericht"]
tags: ["maui", "kubernetes", "sprint", "infrastruktur", "cluster", "k3s"]
---

# Sprint 1 abgeschlossen: Infrastruktur-Korrekturen im Maui-Cluster

> **slidev-PVC gelöst. SOGo migriert. Storage-Klassen bei 31 Bereitstellungen überprüft. Alle Smoke-Tests grün.**

Am 14. Juni haben wir den [Maui-Cluster-Sprint-Plan](/en/blog/hrz-maui-cluster-progress) veröffentlicht — vier Sprints, um die Lücke bei sechs fehlenden Diensten zu schließen und die Infrastruktur zu härten. Heute können wir berichten, dass Sprint 1 abgeschlossen ist und die Arbeiten an Sprint 2 bereits laufen.

## Was Behoben Wurde

### slidev-PVC: Gelöst

Der slidev-PersistentVolumeClaim befand sich seit der ersten Bereitstellung im Status `Pending`. Die Ursache war eine fehlende StorageClass-Annotation am PVC — er referenzierte `ceph-rbd-ssd`, aber das Feld `spec.storageClassName` war leer, sodass der CSI-Provisioner ihn vollständig übersprang.

**Durchgeführte Korrektur:**
- Den festsitzenden PVC gelöscht (kein Datenverlust — slidev ist zustandslos)
- Mit explizitem `storageClassName: ceph-rbd-ssd` neu erstellt
- Pod sofort gestartet, nachdem der PVC gebunden war
- Dienst antwortet unter `slides.opendesk.hrz.uni-marburg.de`

### SOGo-Namespace-Migration

SOGo wurde während der ersten Tests im `demo`-Namespace bereitgestellt — ein Überbleibsel aus der Prototyping-Phase. Wir haben es in `opendesk-edu` migriert, um es an die Cluster-Namenskonventionen anzupassen.

**Migrationsschritte:**
1. Die SOGo-PostgreSQL-Datenbank aus dem `demo`-Namespace exportiert
2. Das SOGo-Chart mit `namespace: opendesk-edu` neu bereitgestellt
3. Die Datenbank in den neuen Namespace zurückgespielt
4. Den Ingress aktualisiert, um auf den neuen Dienst-Endpunkt zu verweisen
5. Die alte Bereitstellung im `demo`-Namespace entfernt

Die DNS-Propagierung dauerte etwa 2 Minuten; der Dienst ist seitdem stabil.

### Storage-Class-Überprüfung

Jeder PVC der 31 Bereitstellungen in den Namespaces `opendesk` und `opendesk-edu` wurde auf korrekte StorageClass-Zuweisung überprüft:

| StorageClass | Zweck | PVCs | Status |
|---|---|---|---|
| `ceph-rbd-ssd` | Schnelles RWO (Datenbanken, StatefulSets) | 18 | ✅ Alle korrekt |
| `ceph-cephfs-hdd-ec` | Langsames RWX mit Erasure-Coding (Dateien) | 9 | ✅ Alle korrekt |
| `local-path` | Temporärer/Scratch-Speicher (K3s-Standard) | 3 | ✅ Alle korrekt |

Es wurden über den slidev-PVC hinaus keine Fehlkonfigurationen gefunden — dies bestätigt, dass die ursprünglichen Bereitstellungsvorlagen korrekt waren.

### Smoke-Tests

Eine vollständige Smoke-Test-Suite wurde gegen alle 31 Bereitstellungen ausgeführt:

- Alle 31 Bereitstellungen zeigen den Status `READY`
- Alle Ingresses geben HTTP 200 oder 302 (SSO-Weiterleitung) zurück
- Der Keycloak-OIDC-Login funktioniert für Nextcloud, OpenProject, XWiki und BookStack
- Der K8up-Backup-Zeitplan wurde erfolgreich ausgeführt: 33 Snapshots an S3 übermittelt
- Prometheus-Ziele sind alle gesund, Grafana-Dashboards zeigen keine kritischen Alarme

## Sprint 2: Jetzt in Arbeit

Da die Infrastruktur-Korrekturen abgeschlossen sind, zielt Sprint 2 auf drei fehlende Dienste ab:

| Dienst | Chart-Typ | Abhängigkeiten | Status |
|---|---|---|---|
| Zammad | Lokales Chart | PostgreSQL, Elasticsearch, Redis | 🟡 In Arbeit |
| Overleaf | Upstream-Chart | Redis, MongoDB | 🟡 In Arbeit |
| KasmVNC | Upstream-Chart | — | ⏳ In der Warteschlange |

Die Zammad-Bereitstellung ist die komplexeste — sie erfordert drei abhängige Datenbanken und korrektes Ingress-Routing für ihre Echtzeit-Ticket-Updates. Wir passen das Chart von `charts-upgrade-v1.12.0/zammad` mit dem gleichen PostgreSQL-Subchart-Entfernungsmuster an, das bereits für Etherpad verwendet wurde.

## Wie es Weitergeht

- **Sprint 3** (Ziel: diese Woche): Portal-Einträge (Configmap-Only-Chart) und Snipr (Dockerfile-Build erforderlich)
- **Sprint 4**: Härtung, Dokumentation und vollständiges Ingress-Audit

Der Maui-Cluster betreibt jetzt **41 Pods** über **32 Bereitstellungen** — gegenüber 39 Pods und 31 Bereitstellungen am 14. Juni. Wir liegen im Plan für die vollständige Produktionsbereitschaft bis Ende Juni.

Möchten Sie openDesk Edu an Ihrer Universität bereitstellen? Besuchen Sie unseren [Erste-Schritte-Leitfaden](/docs/deployment) und das [Repository](https://codeberg.org/opendesk-edu/opendesk-edu).

### Diesen Artikel teilen

Link kopieren [LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fopendesk-edu.org%2Fen%2Fblog%2Fmaui-cluster-sprint-update) [Matrix](https://matrix.to/#/https%3A%2F%2Fopendesk-edu.org%2Fen%2Fblog%2Fmaui-cluster-sprint-update)
