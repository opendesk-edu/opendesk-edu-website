---
title: "ZKI-IT-Grundschutz-Compliance: openDesk Edu auf dem Weg zur Hochschul-Sicherheitsbaseline"
date: "2026-08-01"
description: "openDesk Edu richtet sich systematisch am ZKI-IT-Grundschutz-Profil aus — der hochschulspezifischen Adaption der BSI-Baseline — mit durchsetzbaren Kyverno-Policies, gehärteter GitOps-Pipeline und transparenter Gap-Analyse. Hier steht der Stand."
categories: ["Sicherheit", "Compliance"]
tags: ["zki", "it-grundschutz", "bsi", "compliance", "kyverno", "sicherheit", "hochschule", "isms"]
image: "/static/blog/zki-it-grundschutz-compliance-teaser.svg"
---

# ZKI-IT-Grundschutz-Compliance: openDesk Edu auf dem Weg zur Hochschul-Sicherheitsbaseline

> **Die Baseline:** Jedes deutsche Hochschulrechenzentrum arbeitet nach dem ZKI-IT-Grundschutz-Profil — der hochschulspezifischen Adaption der BSI-IT-Grundschutz-Methodik.
>
> **Die Realität:** Für eine Plattform aus über eine umfassende Suite von Open-Source-Dienstenn ist Compliance kein Kästchen, das man einmal abhakt. Sie ist eine architektonische Eigenschaft, die kontinuierlich durchgesetzt werden muss — durch Policies, Pipelines und transparente Dokumentation.
>
> **Unser Ansatz:** Statt eines Compliance-Bekenntnisses haben wir ein Compliance-System gebaut: über 20 durchsetzbare Kyverno-Policies, eine gehärtete GitOps-Pipeline und eine öffentliche Gap-Analyse, die genau zeigt, wo wir stehen — einschließlich der Lücken.

## Was ist das ZKI-IT-Grundschutz-Profil?

Das **ZKI-IT-Grundschutz-Profil** ist das Referenz-Sicherheitsframework für deutsche Hochschulen. Es adaptiert die **BSI-IT-Grundschutz**-Methodik — die bundesdeutsche Basisabsicherung für Informationssicherheit — auf die spezifischen Realitäten von Hochschulen:

- **Forschungsdaten** mit besonderen Schutzanforderungen
- **Studierendendaten** und Prüfungssysteme mit besonderen Handhabungsregeln
- **Offene Zusammenarbeit**, die trotz Sicherheitskontrollen möglich bleiben muss
- **Dezentrale Administration** über Fakultäten und Institute

Wo der BSI-IT-Grundschutz generische Bausteine für alle Organisationen bereitstellt, passt das ZKI-Profil sie an den Hochschulbetrieb an — ausgerichtet auf DSGVO, HDSG und ISIS12, den Informationssicherheitsstandards für die Hochschulen.

Für openDesk Edu ist das keine theoretische Übung. Deutsche Hochschulen können keine Digital-Workplace-Plattform einführen, die nicht der Sicherheitsbaseline entspricht, an der die eigenen Rechenzentren gemessen werden.

## Wo openDesk Edu bereits steht

Bevor wir eine einzige neue Policy geschrieben haben, haben wir geprüft, was die Plattform bereits durchsetzt. Das Ergebnis war ermutigend — viele ZKI-Maßnahmen sind von Design her implementiert:

### Identitäts- und Zugriffsmanagement ✅
- **Keycloak** als zentraler Identity Provider mit OIDC und SAML
- **Föderierte Identitäten** über Shibboleth und DFN-AAI
- **Multi-Faktor-Authentifizierung**, Passwort-Policies und Account-Lockout
- **Rollbasierte Zugriffskontrolle** mit granularen Berechtigungen
- **Session-Management** mit konfigurierbaren Timeouts

### Netzwerksicherheit ✅
- **HAProxy** als Ingress mit TLS-Terminierung
- **Traefik** als zusätzliche Ingress-Ebene
- **Network Policies** zur Beschränkung des Service-zu-Service-Verkehrs
- **Pod Security Admission (PSA)** clusterweit durchgesetzt
- Netzwerksegmentierung über Namespaces

### System-Härtung ✅
- **Non-Root-Container** (`runAsNonRoot: true`)
- **Capability-Dropping** (`drop: ["ALL"]`)
- **Read-only Root-Dateisysteme** wo anwendbar
- **Seccomp-Profile** (`RuntimeDefault`)
- **Resource-Limits** für jede Workload

### Datenschutz ✅
- **Ceph-Speicher** mit Verschlüsselung im Ruhezustand
- **k8up-Backup-Operator** mit restic — verschlüsselt, geplant, getestet
- **Aufbewahrungsrichtlinien** und PVC-Backup-Annotationen
- **SOPS-verschlüsselte Secrets** im Git

### Observability ✅
- **Prometheus** für Metriken
- **Grafana** für Dashboards
- **Loki** für zentrale Log-Aggregation
- **Alertmanager** für Alert-Routing

## Die Lücke: Von guten Praktiken zu erzwungener Compliance

Eine starke Standard-Posture ist notwendig — aber nicht ausreichend. ZKI-Compliance verlangt, dass Sicherheitseigenschaften *durchgesetzt*, *überprüfbar* und *kontinuierlich validiert* werden. Genau hier haben wir die Lücken identifiziert.

### Die 111-Punkte-Checkliste

Wir haben die relevanten ZKI/BSI-Bausteine in **111 konkrete Checkpunkte** in zehn Kategorien übersetzt, jeweils zugeordnet zu einem BSI-Baustein und einer Prioritätsstufe:

| Priorität | Kategorie | Status |
|-----------|-----------|--------|
| **P0** | IAM & Authentifizierung | ⚠️ Teilweise |
| **P0** | Netzwerksicherheit | ✅ Gut |
| **P0** | Datenschutz | ⚠️ Teilweise |
| **P1** | Audit & Logging | ⚠️ Teilweise |
| **P1** | Incident Response | ❌ Fehlend |
| **P1** | Change Management | ⚠️ Teilweise |
| **P2** | Anwendungssicherheit | ⚠️ Teilweise |
| **P2** | Physische Sicherheit | ✅ Gut |
| **P2** | Awareness & Training | ❌ Fehlend |

Unser interner Startpunkt (Selbsteinschätzung, keine zertifizierte Auditierung): **~37 % Gesamt-Compliance**, bei einer BSI-Baustein-Abdeckung von **~81 %** dort, wo die Plattform bereits operiert. Diese Zahlen sind interne Einschätzungen, kein offizieller Audit-Befund.

## Was wir gebaut haben: Policy als Code

Das Herzstück der Umsetzung sind **20+ Kyverno-ClusterPolicies**, die Compliance-Anforderungen in durchsetzbare Admission-Kontrollen verwandeln. Jede Workload, die im Cluster deployt wird, wird gegen diese Policies validiert — bevor sie die Laufzeit erreicht.

### Pod-Sicherheit (8 Policies)

| Policy | Was sie durchsetzt | BSI-Baustein |
|--------|--------------------|--------------|
| `zki-require-non-root` | Keine Root-Container | INF.1 |
| `zki-require-readonly-rootfs` | Unveränderliche Root-Dateisysteme | INF.1 |
| `zki-drop-all-capabilities` | Drop ALL Linux-Capabilities | INF.1 |
| `zki-require-seccomp` | Seccomp-Profile erforderlich | INF.1 |
| `zki-prevent-privilege-escalation` | Keine Privilegieneskalation | INF.1 |
| `zki-restrict-capabilities` | Keine Capability-Wiederaufnahme | INF.1 |
| `zki-require-pod-security-context` | Pod-Security-Context obligatorisch | INF.1 |
| `zki-require-sidecar-logging` | Logging-Sidecars durchgesetzt | INF.1 |

### Netzwerksicherheit (4 Policies)

| Policy | Was sie durchsetzt | BSI-Baustein |
|--------|--------------------|--------------|
| `zki-require-network-policy` | NetworkPolicy für jeden Namespace | INF.5 |
| `zki-default-deny-all` | Default-Deny für allen Verkehr | INF.5 |
| `zki-restrict-ingress-to-haproxy` | Ingress nur über HAProxy | INF.5 |
| `zki-require-tls-for-ingress` | TLS auf allen Ingresses | INF.5 |

### Zugriffskontrolle (3 Policies)

| Policy | Was sie durchsetzt | BSI-Baustein |
|--------|--------------------|--------------|
| `zki-restrict-host-path` | Keine hostPath-Volumes | INF.1 |
| `zki-restrict-host-network` | Kein hostNetwork | INF.1 |
| `zki-require-loki-labels` | Pflicht-Logging-Labels | INF.1 |

### Datenschutz (3 Policies)

| Policy | Was sie durchsetzt | BSI-Baustein |
|--------|--------------------|--------------|
| `zki-require-storage-encryption` | Nur verschlüsselter Speicher | DS |
| `zki-require-data-classification` | Datenklassifizierungs-Labels | DS |
| `zki-k8up-backup-annotation` | Backup-Annotationen erforderlich | DS |

### Anwendungssicherheit (2 Policies)

| Policy | Was sie durchsetzt | BSI-Baustein |
|--------|--------------------|--------------|
| `zki-require-security-headers` | Security-Header (CSP, HSTS, X-Frame-Options) | INF.14 |
| `zki-require-probe-timeouts` | Korrekte Probe-Konfiguration | INF.14 |

Alle Policies laufen zunächst im **Audit-Modus**, werden in CI gegen reale Workloads validiert und erst dann auf Durchsetzung geschaltet. Policy-Verstöße werden über PolicyReports gemeldet und im Monitoring-Stack angezeigt.

## Governance: Die Dokumente, die Compliance real machen

Policies ohne Governance sind Dekoration. Wir haben die Governance-Ebene passend dazu geschrieben:

### IT-Sicherheitsleitlinie (14 Kapitel)

Die Sicherheitsleitlinie deckt Zweck und Geltungsbereich, Sicherheitsprinzipien, Organisation, Zugriffskontrolle, Netzwerksicherheit, Systemsicherheit, Datenschutz, Anwendungssicherheit, Incident-Management, Business Continuity, Compliance, Awareness, Ausnahmen und Pflege ab — ausgerichtet auf BSI-IT-Grundschutz-Bausteine und ISO/IEC 27001:2022.

### Incident-Response-Plan (BSI-Standard 200-3)

Eine vierschichtige Incident-Klassifikationsmatrix (Stufe 0–3), ein sechsphasiger Reaktionsprozess, DSGVO-Meldepflichten und zehn Kommunikationsvorlagen. Ausgerichtet auf BSI 200-3, NIST SP 800-61 und ISO/IEC 27035.

### GitOps als Change Management

Das Change-Management von openDesk Edu *ist* seine GitOps-Pipeline:

- **ArgoCD** für deklarative, auditierbare Deployments
- **PR-Disziplin** — Code-Änderungen und Chart-Änderungen werden nie vermischt
- **Version-Pinning** — Images per Digest gepinnt
- **SOPS** für Secrets im Git mit age/OpenPGP-Verschlüsselung
- **REUSE-Compliance** mit SPDX-Headern auf jeder Datei

Jede Änderung ist ein Commit; jeder Commit ist ein Audit-Trail.

## Die verbleibenden P0-Arbeiten: Was vor Produktion passieren muss

Wir sind transparent, was noch offen ist. Fünf kritische (P0-)Punkte stehen zwischen dem aktuellen Stand und der vollständigen Produktions-Durchsetzung:

1. **Rechtliche und behördliche Genehmigungen** — DPO, Justiziariat und Hochschulleitung müssen die Sicherheitsleitlinie freigeben (der einzige echte Blocker).
2. **Kyverno-Webhook-Authentifizierung** — TLS und Client-Zertifikate für den Admission-Webhook, damit Policies nicht umgangen werden können.
3. **Kyverno-Policy-Backup** — automatisierte, wiederherstellbare Sicherung aller Policies (Compliance-Nachweis erfordert sie).
4. **Policy-Change-Management-Prozess** — dokumentierter Request-, Review- und Freigabe-Workflow für Policy-Änderungen.
5. **Notfall-Abschaltverfahren für Policies** — kontrollierte, protokollierte und reversible Notfallverfahren.

## Roadmap zu 90 %+

Unsere Roadmap ist konkret — vier Phasen über etwa sechzehn Wochen:

| Phase | Fokus | Ziel |
|-------|-------|------|
| **Vorbereitung** | Alle P0-Aktionen abschließen | Produktionsreife |
| **Phase 1** | Fundament: ISMS, Risikomanagement | 60 % Compliance |
| **Phase 2** | Betrieb: Logging, Incident Response, Patch-Management | 75 % Compliance |
| **Phase 3** | Fortgeschritten: mTLS, SIEM, Schwachstellen-Management | 85 % Compliance |
| **Phase 4** | Reife: IDS/IPS, WAF, Awareness-Programm | **90 %+ Compliance** |

## Und Microsoft 365? Wie weit käme man damit?

Eine Frage, die wir bei Evaluierungen von Universitäten ständig hören: *„Könnten wir mit Microsoft 365 nicht dasselbe Compliance-Niveau erreichen?“* Die ehrliche Antwort verdient einen eigenen Abschnitt — denn sie ist weitgehend *ja*, und die Lücke ist aufschlussreich.

### Was M365 gut abdeckt

Microsoft 365 kann zusammen mit dem vollständigen Compliance-Stack (Entra ID P2, Purview, Defender, Compliance Manager) nach unserer Einschätzung **~60–70 % der 111 Checkpunkte direkt erfüllen** (interne Schätzung, kein offizieller Audit):

- **IAM & Zugriff** — aus der Box heraus argumentativ stärker als ein DIY-Keycloak-Setup: MFA, Conditional Access, Privileged Identity Management, granulare RBAC.
- **Datenschutz** — Purview-Vertraulichkeitslabels, DLP über Exchange/SharePoint/Teams/Endpoints, Aufbewahrung und Legal Hold, kundenseitig verwaltete Schlüssel, Customer Lockbox.
- **Geräte-Härtung** — Intune-Compliance-Richtlinien, BitLocker, Patch-Ringe decken die Client-Seite ab.
- **Physische Sicherheit** — abgedeckt durch die Microsoft-Rechenzentren und deren BSI-C5-Typ-2- und ISO-27001-Bescheinigungen.

### Was M365 nicht abdecken kann

Weitere **~15–20 %** sind nur über *Provider-Bescheinigungen* statt eigener Durchsetzung erreichbar — die anerkannte Brücke unter dem IT-Grundschutz-Cloud-Baustein OPS.3.1. Und ein **strukturelles Rest von ~10–15 %** bleibt, den keine Tenant-Konfiguration schließen kann:

| Bereich | Warum M365 allein es nicht erreicht |
|---------|-------------------------------------|
| Netzwerksicherheit (INF.5) | Es gibt kein eigenes Netz zu segmentieren — Tenant-Kontrollen (Conditional Access, externe Freigaben) ersetzen keine eigene Segmentierung und Firewalls. |
| System-Härtung (INF.1) | Keine Pods, kein Seccomp, keine Capability-Drops — die Workload-Härtungs-Punkte sind schlicht gegenstandslos. |
| Vollständige Auditierbarkeit | Das Unified Audit Log ist begrenzt (Standard 90 Tage), hat Lücken und lebt in der Microsoft-Cloud statt im eigenen Loki/SIEM. |
| Souveränität | Die EU Data Boundary regelt den *Speicherort*, nicht die *Zuständigkeit* — US-Behörden können weiterhin Zugriff erzwingen (CLOUD Act). Das BSI hat 2023 einen [Hinweis zur Verwendung von Microsoft 365 in der öffentlichen Verwaltung](https://www.bsi.bund.de/SharedDocs/CyberSicherheitswarnungen/TechnischeWarnungen/2023/Hinweis_Microsoft_365_public_cloud.html) veröffentlicht, in dem es auf die Risiken hinweist. |
| Selbst gehostete Dienste | ILIAS, Moodle, JupyterHub, Nextcloud, Matrix haben keine M365-Entsprechung — sie laufen auf eigener Infrastruktur und brauchen genau die hier beschriebene Kyverno-/GitOps-/k8up-Behandlung. |
| Backup | Native Aufbewahrung ist kein Backup — Sie brauchen ein Drittanbieter-Tool (Veeam, AvePoint, …). |

### Die ehrliche Einordnung

Einen **Hybridweg** fahren deutsche Hochschulen tatsächlich: M365 A3/A5 für die Zusammenarbeit, souveräne Open-Source-Dienste für sensible Workloads, Drittanbieter-Backup, Sentinel als SIEM und die eigene Governance-Dokumentation. Damit erreicht man nach unserer Einschätzung den ~85–90-%-Bereich — aber es ist keine reine M365-Geschichte mehr, und die letzten ~10 % sind Politik, nicht Technik.

Die Antwort auf „Wie weit mit M365?“ lautet also: *~70 % der Kontrollen über den Microsoft-Compliance-Stack, ~20 % über BSI-C5-Bescheinigungen, ~10 % struktureller Rest, der Souveränitätsentscheidungen verlangt — und genau dieser Rest ist der Grund, warum openDesk existiert.* (Alle Prozentangaben sind interne Schätzungen, keine zertifizierten Audit-Werte.)

## Warum das für Hochschulen wichtig ist

Für eine Hochschule, die openDesk Edu evaluiert, zählt die Compliance-Geschichte in drei konkreten Punkten:

1. **Sie ist überprüfbar.** Die Gap-Analyse, die Policies und die Roadmap sind öffentlich. Sie müssen keiner Marketing-Behauptung vertrauen — Sie können den Policy-Code inspizieren.
2. **Es ist Ihre Baseline, nicht die eines Anbieters.** ZKI-IT-Grundschutz ist das Framework, unter dem *Ihr* Rechenzentrum arbeitet. Die Ausrichtung bedeutet, dass openDesk Edu dieselbe Sicherheitssprache spricht wie Ihre Einrichtung.
3. **Sie ist kontinuierlich.** Compliance wird in der Pipeline durchgesetzt, nicht in einem Dokument behauptet. Wenn sich die Plattform ändert, setzen die Policies die Baseline automatisch durch.

## Mitwirken

Die ZKI-Compliance-Arbeit ist Open Source wie alles bei openDesk Edu. Wenn Ihre Einrichtung Erfahrung mit BSI-IT-Grundschutz, ZKI-Arbeitskreisen oder ISIS12 hat — oder wenn Sie helfen wollen, die verbleibenden P0-Lücken zu schließen — freuen wir uns über Ihren Review.

**Entdecken Sie das Repository, prüfen Sie die Policies und helfen Sie uns, 90 %+ zu erreichen.**

[Besuchen Sie opendesk-edu.org für Architekturdokumentation und Deployment-Anleitungen](https://opendesk-edu.org)

---

## Hinweise und Quellen

- **Kein offizieller Audit:** Die in diesem Artikel genannten Prozentwerte (37 %, 81 %, 60–70 %, 85–90 %) sind interne Selbsteinschätzungen des openDesk-Edu-Teams, keine zertifizierten Audit-Befunde und keine offizielle BSI- oder ZKI-Bewertung.
- **Keine ZKI- oder BSI-Endorsement:** Die Verwendung von „ZKI" in Policy-Namen (z. B. `zki-require-non-root`) ist eine Referenz auf das ZKI-IT-Grundschutz-Profil, keine offizielle Zertifizierung oder Empfehlung durch das ZKI oder das BSI. openDesk Edu ist nicht von ZKI oder BSI zertifiziert.
- **Markenrechtlicher Hinweis:** Alle in diesem Artikel genannten Produkt- und Dienstleistungsbezeichnungen (Microsoft 365, Entra ID, Purview, Defender, Compliance Manager, Sentinel, Veeam, AvePoint, Keycloak, ArgoCD, Shibboleth, DFN-AAI, Loki, Prometheus, Grafana, BitLocker, Intune, ILIAS, Moodle, JupyterHub, Nextcloud, Matrix) sind Marken oder eingetragene Marken ihrer jeweiligen Inhaber. Die Nennung dient ausschließlich der Information und Beschreibung technischer Eigenschaften.
- **Quellen:** [BSI-Hinweis zu Microsoft 365 (2023)](https://www.bsi.bund.de/SharedDocs/CyberSicherheitswarnungen/TechnischeWarnungen/2023/Hinweis_Microsoft_365_public_cloud.html) · [BSI IT-Grundschutz](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/IT-Grundschutz_node.html) · [BSI C5-Attestierung](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Cloud-Computing/C5/c5_node.html) · [CLOUD Act](https://www.congress.gov/bill/115th-congress/house-bill/4943)
- **Vergleichender Hinweis:** Die Gegenüberstellung mit Microsoft 365 dient ausschließlich der Information und soll weder Microsoft noch seine Produkte herabsetzen noch irreführend darstellen. Die genannten Eigenschaften von Microsoft 365 sind der öffentlichen Dokumentation entnommen.
