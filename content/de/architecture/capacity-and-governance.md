---
title: "Kapazitätsanalyse und Governance-Modell"
date: "2026-08-27"
description: "Ein Companion-Technologie-Dokument. Detaillierte Kapazitätsplanung für Bereitstellungen jedes Umfangs und das Governance-Modell für den Betrieb einer openDesk Edu Plattform."
categories: ["architecture", "infrastructure", "operations"]
tags: ["architektur", "kapazität", "governance", "skalierung", "operations", "lebenszyklus"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/capacity-and-governance-teaser.svg"
---

# Kapazitätsanalyse und Governance-Modell

Dies ist das Companion-Technologie-Dokument zum [Systemarchitektur-Überblick](/architecture/overview). Es bietet detaillierte Richtlinien zur Kapazitätsplanung für Bereitstellungen jeden Umfangs und beschreibt das Governance-Modell für den Betrieb einer openDesk Edu Plattform.

## Kapazitätsanalyse

### Sizing Philosophie

openDesk Edu ist als Referenzarchitektur konzipiert. Jeder Dienst wird unabhängig dimensioniert, dann werden die Anforderungen summiert (mit Overhead für Cluster-Operationen).

### Bereitstellungskategorien

| Kategorie | Aktive gleichzeitige Benutzer | Gesamtbenutzer | Cluster-Knoten | Typische CPU | Typischer RAM | Typischer Speicher |
|-----------|------------------------------|----------------|----------------|--------------|---------------|------------------|
| **Kategorie 0 (Pilot)** | 0–500 | 2,000 | 1–2 | 4–8 vCPUs | 16–32 GB | 500 GB–2 TB |
| **Kategorie 1 (Schule)** | 500–5,000 | 2,000–10,000 | 3–5 | 16–32 vCPUs | 64–128 GB | 2–10 TB |
| **Kategorie 2 (Universität)** | 5,000–50,000 | 10,000–100,000 | 8–15 | 64–256 vCPUs | 256–1024 GB | 10–100 TB |
| **Kategorie 3 (Große Universität)** | 50,000+ | 100,000+ | 20+ | 512+ vCPUs | 2+ TB | 100+ TB |

### Dienst-spezifische Anforderungen

#### Identität und Authentifizierung

| Dienst | CPU | RAM | Speicher | Hinweise |
|--------|-----|-----|----------|---------|
| Keycloak | 0.5–2 vCPU | 1–4 GB | 5–10 GB | Skaliert mit aktiven Sitzungen |
| Shibboleth SP | 0.25–1 vCPU | 0.5–2 GB | 1–2 GB | Pro SAML-Service |
| Nubus | 0.5–2 vCPU | 1–4 GB | 5–10 GB | Portal und IAM |

#### Dateispeicherung

| Dienst | CPU | RAM | Speicher | Hinweise |
|--------|-----|-----|----------|---------|
| Nextcloud (App) | 2–8 vCPU | 4–16 GB | 1–5 GB | PV für Dateien |
| Nextcloud (DB) | 2–4 vCPU | 4–8 GB | 20–50 GB | Metadaten |
| Nextcloud (Redis) | 0.5–1 vCPU | 1–2 GB | 1 GB | Cache |
| OpenCloud | 1–4 vCPU | 2–8 GB | 5–10 GB | Leichter als Nextcloud |

**Speicherformel:** Gesamt ≈ Benutzer × avgGB × 1.7 (Versionierung + Overhead)

#### E-Mail und Groupware

| Dienst | CPU | RAM | Speicher | Max Postfächer | Hinweise |
|--------|-----|-----|----------|----------------|---------|
| OX App Suite | 4–16 vCPU | 8–32 GB | 50–200 GB | 10k–100k | Enterprise Groupware |
| SOGo | 2–4 vCPU | 4–8 GB | 20–50 GB | 5k–25k | Leichtes Webmail |
| Grommunio | 4–8 vCPU | 8–16 GB | 30–100 GB | 5k–50k | ActiveSync Commerce |
| MariaDB | 4–16 vCPU | 8–32 GB | 50–200 GB | – | Groupware DB |

#### Learning Management

| Dienst | CPU | RAM | Speicher | Max gleichzeitig | Hinweise |
|--------|-----|-----|----------|-------------------|---------|
| Moodle | 2–8 vCPU | 4–16 GB | 20–100 GB | 500–5k | LAMP Stack |
| Moodle (DB) | 4–16 vCPU | 8–32 GB | 50–200 GB | – | PostgreSQL empfohlen |
| ILIAS | 4–16 vCPU | 8–32 GB | 50–200 GB | 1k–10k | Java-basiert |
| ILIAS (DB) | 4–16 vCPU | 8–32 GB | 100–500 GB | – | Java DB Overhead |

#### Videokonferenz

| Dienst | CPU | RAM | Bandbreite | Max gleichzeitig | Hinweise |
|--------|-----|-----|-------------|-------------------|---------|
| Jitsi | 2–8 pro Meeting | 4–16 GB | 1–8 Mbps/Teilnehmer | 50–100 pro Instanz | WebRTC-Transcoding |
| BigBlueButton | 4–16 vCPU | 8–32 GB | 0.5–2 Mbps/Teilnehmer | 100–200 pro Instanz | GPU für Transcoding empfohlen |

#### Zusammenarbeit

| Dienst | CPU | RAM | Speicher | Hinweise |
|--------|-----|-----|----------|---------|
| Collabora | 2–8 vCPU | 4–16 GB | 1–5 GB | WOPI Instanzen |
| Etherpad | 0.5–2 vCPU | 1–4 GB | 1–5 GB | Leicht |
| CryptPad | 1–4 vCPU | 2–8 GB | 5–10 GB | E2E Verschlüsselung |
| XWiki | 2–4 vCPU | 4–8 GB | 10–50 GB | Java CMS |
| BookStack | 1–2 vCPU | 2–4 GB | 5–20 GB | Leichtes Wiki |
| OpenProject | 2–4 vCPU | 4–8 GB | 10–50 GB | Ruby Projektmanagement |

#### Echtzeit-Kommunikation

| Dienst | CPU | RAM | Speicher | Max gleichzeitig | Hinweise |
|--------|-----|-----|----------|-------------------|---------|
| Element/Matrix | 0.5–2 vCPU | 1–4 GB | 5–10 GB | 500–5k | Synapse Server |
| Zammad | 2–4 vCPU | 4–8 GB | 10–50 GB | 500–2k | Helpdesk |

#### Infrastructure

| Dienst | CPU | RAM | Speicher | Hinweise |
|--------|-----|-----|----------|---------|
| PostgreSQL | 2–8 vCPU | 4–16 GB | 20–100 GB | Pro Instanz |
| MariaDB | 2–8 vCPU | 4–16 GB | 20–100 GB | Pro Instanz |
| Redis | 0.5–2 vCPU | 1–4 GB | 1–5 GB | Per Instanz |

### Speicherplanung

**Formel:** GesamtSpeicher = (BenutzerDaten × Wachstum) + DienstOverhead + BackupOverhead + Puffer

- BenutzerDaten = N × avgSpeicher × (1 + jährlicheWachstumsrate × Jahre)
- DienstOverhead ≈ 15% von BenutzerDaten
- BackupOverhead ≈ 250% von BenutzerDaten (2× täglich + 1× wöchentlich)
- Puffer = 20% vom Gesamtwert

**Vereinfacht:** 40–60 GB pro Benutzer inklusive Backups und Overhead für 3 Jahre.

**Speicherklassen:**

| Klasse | Anwendungsfall | Zugriffsmuster | Kosten | Leistung |
|--------|--------------|----------------|--------|-----------|
| Lokale SSD | Datenbanken | Häufig zufällig | Hoch | Sehr hoch |
| Ceph/RBD | PV | Gemischt | Mittel | Hoch |
| CephFS | Gemeinsamer Speicher | Gemeinsam | Mittel | Mittel |
| NFS | Legacy | Häufig Lesen | Niedrig | Mittel |
| S3 | Backups/Archive | Selten sequentiell | Niedrig | Niedrig |

### Netzwerkplanung

#### Externe Bandbreite

| Aktivität | Bandbreite pro Benutzer |
|-----------|--------------------------|
| Basic Browsing | 100–500 kbps |
| Dokumentbearbeitung | 200–1000 kbps |
| Videokonferenz (Jitsi) | 500–8000 kbps |
| Videokonferenz (BigBlueButton) | 0.5–2 Mbps |
| Video-Wiedergabe | 1–5 Mbps |
| Datei Upload/Download | 1–10 Mbps |

**Formel:** GesamtBandbreite = SpitzenBenutzer × avgBandbreite × Spitzenfaktor (1.5–3.0)

**Beispiel Kategorie 2 (5,000 Benutzer):** 5,000 × 0.5 Mbps × 2 = **5 Gbps Egress**

### Kubernetes Overhead

| Komponente | CPU | RAM | Speicher | Hinweise |
|------------|-----|-----|----------|---------|
| etcd | 2–4 | 8–16 GB | 20–50 GB | 3–5 Knoten HA |
| Control Plane | 2–4 | 4–8 GB | 5–10 GB | Pro Knoten |
| Node OS | 0.5 pro Worker | 1–2 GB pro Worker | 20–50 GB | Betribssytem |
| CNI | 0.5 pro Knoten | 1 GB pro Knoten | – | Calico/Flannel |
| Prometheus | 2–4 | 8–16 GB | 50–100 GB | Skaliert mit Größe |
| Loki | 2–8 | 8–32 GB | 100–500 GB | Skaliert mit Logs |
| Traefik | 1–2 | 2-4 GB | 1 GB | Pro Ingress |

**Gesamt Overhead:** 10–20 vCPUs, 20–40 GB RAM (exklusive Node OS)

### Skalierungsstrategien

#### Horizontal

- **Stateless:** Mehr Pod Replikate
- **Stateful:** Read Replicas oder Sharding
- **Storage:** Mehr Ceph OSDs oder NFS Server
- **Ingress:** Mehr Ingress Controller

HPA Beispiel:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nextcloud
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nextcloud
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

#### Vertikal

- vCPU und RAM pro Pod erhöhen
- Größere Knotengrößen verwenden
- Read/Write Arbeitslasten trennen

#### Cluster Autoscaler

- Scale-up: Wenn Pods nicht geplant werden können
- Scale-down: Wenn Knoten unterausgelastet (10 Min Default)
- Min/Max Knoten: Grenzen setzen

---

## Governance Modell

### Betriebsmodell

openDesk Edu ist für selbstgehosteten Betrieb konzipiert. Die Plattform stellt Referenz-Helm-Charts, Values-Dateien und Dokumentation. Die Institution ist verantwortlich für Bereitstellung, Betrieb, Benutzerverwaltung, Monitoring, Support, Upgrades und Wartung.

### Organisatorische Rollen

| Rolle | Verantwortlichkeiten | Typisches Team |
|-------|---------------------|----------------|
| Plattform-Eigentümer | Strategie, Budget, Gesamtverantwortung | IT-Leitung, CIO |
| Plattform-Betreiber | Tagesbetrieb, Monitoring, Incident Response | Infrastruktur, DevOps |
| Dienstadministrator | Dienstkonfiguration und -verwaltung | Anwendungsteam |
| Föderationsadministrator | IdP-Verbindungen, SAML/OIDC | IAM-Team |
| Speicheradministrator | Speicher, Ceph/NFS, Backups | Speicherteam |
| Sicherheitsbeauftragter | Richtlinien, Compliance, Vulnerability Mgmt | Sicherheitsteam |
| Datenbankadministrator | DB Tuning, Backups, Replikation | DBA-Team |

### Entscheidungsprozess

1. Vorschlag (Ticket/Issue/Änderungsanfrage)
2. Auswirkungsbewertung (Benutzer, Dienste, Infrastruktur, Abhängigkeiten)
3. Machbarkeitsstudie (technisch und Ressourcen)
4. Genehmigung (abhängig von Risiko und Auswirkung)
5. Planung (Implementierung, Rollback, Zeitplan)
6. Kommunikation (Stakeholder informieren)
7. Implementierung (Wartungsfenster wenn nötig)
8. Überprüfung (Tests, Verifikation)
9. Dokumentation (Dokumentation aktualisieren)
10. Abschluss (Post-Implementierungsreview)

### Genehmigungsmatrix

| Änderungstyp | Genehmigung | Vorlaufzeit | Wartungsfenster |
|--------------|-------------|-------------|-----------------|
| Notfall (Sicherheit/Ausfall) | Betreiber + Sicherheitsbeauftragter | 0–1 Std | Nach Bedarf |
| Geringfügig (Konfig, kleines Update) | Betreiber | 1–3 Tage | Optional |
| Standard (neuer Dienst, großes Update) | Eigentümer + Betreiber | 1–2 Wochen | Erfordert |
| Groß (Architektur, Kubernetes-Version) | Betreiber + Eigentümer | 2–4 Wochen | Erfordert, verlängert |

### Change Management (ITIL-basiert)

#### Kategorien

| Kategorie | Beschreibung | Risiko | Beispiel |
|-----------|-------------|--------|---------|
| Standard | Vorab genehmigt, geringes Risiko | Niedrig | Konfigurationsänderung |
| Normal | Benötigt Genehmigung | Mittel | Neuer Dienst |
| Notfall | Dringend, hohe Auswirkung | Hoch | Sicherheits-Patch |

#### Workflow — Standard

1. Protokollieren im Change-Management-System
2. Vorab genehmigte Vorlage auswählen
3. zur geplanten Zeit implementieren
4. Als abgeschlossen protokollieren

#### Workflow — Normal

1. RFC (Request for Change) erstellen
2. Change Advisory Board (CAB) Review
3. Genehmigung oder Ablehnung
4. Wenn genehmigt: Implementierungsplan + Zeitplan
5. Implementierung im Wartungsfenster
6. Überprüfung und Dokumentation
7. CAB Review (Post-Implementierung)

#### Workflow — Notfall

1. Vorfall identifizieren
2. Fix planen und testen (Staging wenn möglich)
3. Emergency CAB (ECAB) Review und Genehmigung
4. Fix implementieren
5. Post-Implementierungsreview mit vollem CAB
6. Standard-Änderungsprozess rückwirkend anwenden

### Wartungsfenster

- **Geplant:** Wöchentlich oder 2-wöchentlich, 2–4 Std, außerhalb der Geschäftszeiten (02:00–06:00)
- **Erweitert:** Quartalsweise oder bei Bedarf, 4–12 Std, Wochenende (Sa 02:00–14:00)
- **Notfall:** Bei Bedarf, Dauer variabel, sofort oder so schnell wie möglich

### Upgrade und Lifecycle Management

#### Upgrade Richtlinien

| Komponente | Häufigkeit | Prozess | Downtime | Rollback |
|-----------|------------|---------|----------|----------|
| Kubernetes | Quartalsweise | Blue-Green oder Rolling | Erforderlich | Erforderlich (Snapshot) |
| Helm Charts | Pro Release | Rolling | Optional | Optional |
| Anwendung | Pro Release | Rolling | Optional | Optional |
| Datenbanken | Bei Bedarf | Blue-Green | Erforderlich | Erforderlich (Dump) |
| Ceph Storage | Bei Bedarf | Rolling | None (mit Replikation) | Snapshot-basiert |
| Zertifikate | Quartalsweise | Automatisch (cert-manager) | None | Automatisch |

**Strategie:**
- Kubernetes: N-2 Support Policy
- Anwendungen: Upstream Support Policy folgen
- Datenbanken: Gleiche Major-Version für alle Dienste
- Abhängigkeiten: Regelmäßige Updates für Security Patches

### Security Management

#### Schwachstellenmanagement

- **Scanning:** Container Images (Trivy, Kubescape), Dependencies (npm audit, OWASP), Konfiguration (kube-bench), Netzwerk (Nmap)
- **Remediation:** Critical (24 Std), High (7 Tage), Medium (30 Tage), Low (90 Tage)
- **Freistellung:** Dokumentiert mit Ablaufdatum

#### Zugriffskontrolle

- Access Reviews: Quartalsweise
- Audit Logging: Aktiviert für Kubernetes API, Keycloak, kritische Dienste
- Aufbewahrungsdauer: 1 Jahr (länger für Compliance)
- Integritätsschutz: Nur Lesen, separater Speicher

#### Compliance

- Map Compliance Anforderungen zu Plattform Kontrollen
- Regelmäßige Compliance Bewertungen
- Dokumentation und Evidenz
- Lücken adressieren
- Berichte für Auditoren bereitstellen

### Backup und Disaster Recovery

#### Backup Richtlinien

- **Häufigkeit:** Täglich für DBs, wöchentlich für weniger kritische Daten
- **Aufbewahrung:** 30 Tage täglich, 12 Monate wöchentlich, 7 Jahre monatlich
- **Testing:** Quartalsweise Restore Tests
- **Verschlüsselung:** Alle Backups verschlüsselt mit separatem Key
- **Off-Site:** Alle Backups außer Haus
- **Immutable:** Kritische Backups WORM (Write Once Read Many)

#### Disaster Recovery Ziele

| Tier | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|------|-------------------------------|-------------------------------|
| 0 | Nicht definiert (Pilot) | 24 Std |
| 1 | 4–8 Std (kritisch) / 24 Std (alle) | 1 Std |
| 2 | 1–4 Std (kritisch) / 8–24 Std (alle) | 15 Min |
| 3 | < 1 Std (kritisch) / 4–12 Std (alle) | 5 Min |

#### DR Plan

1. Vorfall erklären, DR Plan aktivieren
2. Auswirkung und Umfang bewerten
3. Dienste in Prioritätenreihenfolge wiederherstellen
4. Wiederhergestellte Dienste überprüfen und testen
5. Benutzer und Stakeholder über Wiederherstellung informieren
6. Post-Incident Review durchführen

### Incident Management

#### Schweregrade

| Severity | Auswirkung | Reaktionszeit | Eskalation |
|----------|------------|---------------|------------|
| SEV-1 | Totaler Ausfall / Datenverlust / Security Breach | Sofortig | 24/7, alle Hände |
| SEV-2 | Heavy Degradation / Mehrere Dienste betroffen | 15 Min | Erweitertes Team |
| SEV-3 | Leichte Degradation / Einzelner Dienst betroffen | 1 Std | Standard Team |
| SEV-4 | Kosmetische Probleme / Nicht kritische Bugs | 4 Std | Individueller Contributor |

#### Incident Response Prozess

1. Erkennung (Monitoring, User Report)
2. Triage (Schweregrad, Auswirkung, Umfang)
3. Erklärung (Severity, Owner zuweisen)
4. Eskalation (Team, Stakeholder)
5. Untersuchung (Root Cause identifizieren)
6. Mitigation (Temporäre Lösung)
7. Resolution (Permanente Lösung)
8. Recovery (Service vollständig operational)
9. Post-Mortem (Dokumentation, Verbesserungen identifizieren)
10. Schließen (Alle Follow-up Aktionen abgeschlossen)

#### Kommunikation

- **Intern:** Team Chat, Incident Management System
- **Extern (Benutzer):** Status Page mit geschätzter Resolution Zeit
- **Stakeholder:** Regelmäßige Updates per E-Mail / Telefon für SEV-1/2
- **Post-Incident:** Post-Mortem Report für SEV-1/2

### Dokumentation und Knowledge Management

- **Architektur:** Systemarchitektur, Abhängigkeiten, Datenflüsse
- **Betrieb:** Deployment, Konfiguration, Troubleshooting, Wartung
- **Sicherheit:** Richtlinien, Verfahren, Standards
- **Compliance:** Anforderungen, Kontrollen, Evidenz
- **Change:** RFC Vorlagen, Genehmigungsprozesse, CAB Protokolle
- **Incident:** Incident Reports, Post-Mortems, Lessons Learned
- **Benutzer:** Anleitungen, FAQs, Tutorials

**Standards:**
- In Git Version Control
- Markdown Format
- Mit jedem Change aktualisieren
- Aktuell halten

### Community und Contribution

openDesk Edu ist ein Community-gesteuertes Projekt. Beiträge sind willkommen:

- Bug Reports / Feature Requests via GitHub Issues
- Dokumentationsverbesserungen
- Code Beiträge via Pull Requests
- Community Support auf Matrix (`#opendesk-ce-public:matrix.opendesk-edu.org`)
- Präsentationen, Blog Posts, Conference Talks

**Contribution Prozess:**
1. Repository forkend, Feature Branch erstellen
2. Änderungen commiten mit klaren Messages
3. Pull Request mit Beschreibung und Kontext öffnen
4. Feedback mit Maintainern diskutieren
5. Feedback adressieren und Updates durchführen
6. Zusammenführen nach Genehmigung und allen Tests passieren

**Maintainer Richtlinien:**
- Timely Response auf Issues und PRs
- Klare, konstruktive Rückmeldung
- Einladend und inklusiv für alle Contributors
- Code of Conduct folgen
- Release Entscheidungen im Konsens mit der Community

---

## Zusammenfassung

Dieses Companion-Dokument gibt Ihnen die Werkzeuge, um eine erfolgreiche openDesk Edu Bereitstellung zu **planen** und zu **betreiben**:

- **Kapazitätsanalyse:** Hilft Ihnen, Ihre Infrastruktur zu dimensionieren
- **Governance Modell:** Beschreibt, wie Sie die Plattform über ihren Lebenszyklus verwalten

**Nächste Schritte:**
1. Bereitstellung planen: Tier-Beschreibungen und Dienstetabellen verwenden
2. Governance gestalten: Prozesse an Ihre Institution anpassen
3. Bereitstellen: [Systemarchitektur-Überblick](/architecture/overview) als Leitfaden verwenden
4. Überwachen: Observability und Alerting einrichten
5. Iterieren: Kapazität und Governance regelmäßig überprüfen und verbessern

---

*Kapazitätsplanung geht um Vorbereitung. Governance geht um Nachhaltigkeit. Zusammen sorgen sie dafür, dass Ihre openDesk Edu Plattform mit Ihrer Institution wachsen und über die Jahre hinweg zuverlässig bleiben kann.*
