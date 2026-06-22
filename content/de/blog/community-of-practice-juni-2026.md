---
title: "Rückblick: openDesk Community of Practice — Juni 2026"
date: "2026-06-22"
description: "Vielen Dank an alle Teilnehmer der gestrigen openDesk Community of Practice. Hier die Zusammenfassung der Session mit allen wichtigen Themen, Links zur Dokumentation und der Umfrage zum nächsten Termin."
categories: ["gemeinschaft"]
tags: ["community-of-practice", "opendesk", "austausch", "gemeinschaft", "campus"]
image: "/static/diagrams/architecture.svg"
---

# Rückblick: openDesk Community of Practice — Juni 2026

Vielen Dank an alle, die gestern an der openDesk Community of Practice teilgenommen haben! Der Austausch war lebhaft und die Rückmeldungen aus den verschiedenen Hochschulen zeigen, wie breit openDesk Edu bereits aufgestellt ist.

Hier eine Zusammenfassung der wichtigsten Themen der Session.

---

## 1. ILIAS-Stabilisierung

Ein wiederkehrender `Connection refused`-Fehler der MariaDB bei neu erstellten Pods (ILIAS-Cronjobs) wurde durch einen 5-fachen Retry-Loop mit 10s Pause behoben — läuft seitdem stabil. Offen ist noch der Upgrade-Pfad und das Testen neuerer ILIAS-Versionen.

## 2. OIDC / SSO

Keycloak im Realm `opendesk` fungiert als zentraler IdP mit `email`- und `preferred_username`-Mapper. Diskutiert wurde, welche Dienste als Nächstes per OIDC angebunden werden sollen (OpenProject? Nextcloud? Etherpad?) und welche Erfahrungen mit SAML vs. OIDC vorliegen.

## 3. Backup-Infrastruktur (k8up)

Der k8up-Operator (v2.13.0) sichert aktuell 6 RWX-PVCs auf S3. 29 RWO-PVCs sind noch ausgeschlossen und brauchen eine eigene Strategie (CSI-Snapshots oder Per-Node-Schedules). Vorgeschlagen wurde ein **3-Tier-Modell**:

| Tier | Beispiele | RPO | RTO | Retention |
|:-----|:----------|:----|:----|:----------|
| **A** (kritisch) | Keycloak, PostgreSQL, Redis, MariaDB, MinIO | 1h | 2h | 30d |
| **B** (wichtig) | Nextcloud, OX, OpenProject, ILIAS, Moodle | 1h | 4h | 14d |
| **C** (experimentell) | JupyterHub, Ollama, Dask | 24h | 1d | 7d |

## 4. Monitoring

Collabora hat Metriken, Alerts und ein Dashboard. Bei Nextcloud fehlen noch Alerts und ein Dashboard. Lücken gibt es bei Backup-Health-Dashboards und Ressourcen-Alerts (CPU > 80 %, Memory > 85 %, Disk > 80 %).

## 5. Bekannte HRZ-Issues

- **DNS CNAME-Ketten**: CoreDNS → SERVFAIL, Workaround via `hostAliases`
- **Nextcloud AIO Probe-Bug**: `initialDelaySeconds` fehlerhaft
- **Planka Ingress**: hartcodiert `nginx`, Annotation muss entfernt werden
- **Grafana Ingress-Class**: auf haproxy umstellen
- **ClamAV ICAP-Restartloop**: Container-Cleanup nötig
- **k8up RWO-PVCs**: Backup-Pod kann nicht mounten → exkludiert

## 6. Upstream & Cluster-Status

**openDesk 1.15.0** (aktuell, 28.05.2026) brachte SeaweedFS als S3 Object Storage, OX App Suite 8.48, Nextcloud 32.0.9 und HAProxy Ingress Support. **v1.16.0** ist in Vorbereitung mit Nextcloud Worker-Tuning und Dovecot/Postfix LoadBalancerIP.

Der HRZ-Cluster läuft auf K3s v1.32.3 (9 Nodes, Debian 12) mit Ceph Storage, kube-prometheus-stack und ArgoCD.

## 7. Bildungssektor

ILIAS läuft im Produktivbetrieb, Moodle ist als Helmchart bereit (Deployment ausstehend). In der Runde wurde diskutiert, welche Dienste noch fehlen — etwa Stud.IP, HIS oder andere Hochschulsysteme — und wie sich die Datenschutz-Anforderungen (DSGVO, Cloud an Hochschulen) entwickeln.

## 8. Architektur

Die aktuelle **openDesk-Edu-Architektur** mit IAM, Applikationen, Integrationen und Mail Flow ist im Architekturdiagramm dargestellt:

➡️ [Architekturdiagramm (SVG)](/static/diagrams/architecture.svg)

Die detaillierte Laufzeit-Architektur inklusive Storage-Topologie und Backup-Matrix findet ihr im [CoP-Repository](https://codeberg.org/opendesk-edu/opendesk-cop).

---

## Links

- **📄 Dokumentation zum Call**: [Codeberg — CoP Session 2025-06-19](https://codeberg.org/opendesk-edu/opendesk-cop/src/branch/main/2025-06-19-community-of-practice-session.md)
- **📋 Umfrage zum nächsten CoP-Termin**: [DFN Terminplaner](https://terminplaner6.dfn.de/de/p/1509a06af2198fc680b2cac353ecca55-1808219)
- **🏗️ Architekturdiagramm**: [/static/diagrams/architecture.svg](/static/diagrams/architecture.svg)
- **💻 openDesk Edu**: [opendesk-edu.org](https://opendesk-edu.org/)
- **🐘 Codeberg**: [codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu/)

Bitte bis Ende nächster Woche an der Umfrage teilnehmen — wir melden uns dann mit dem finalen Termin für den nächsten CoP-Call in etwa drei Monaten.
