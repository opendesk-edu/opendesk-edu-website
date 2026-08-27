---
title: "Sicherheitsarchitektur"
date: "2026-08-27"
description: "Die Sicherheitsarchitektur von openDesk Edu — Secret Management mit SOPS und age-Verschlüsselung, Netzwerkrichtlinien, RBAC, Audit-Logging und Compliance-Framework-Mapping zu BSI IT-Grundschutz, DSGVO und ISO 27001."
categories: ["architecture", "infrastructure", "security"]
tags: ["architektur", "sicherheit", "sops", "rbac", "netzwerkrichtlinien", "audit-logging", "compliance", "bsi", "dsgvo", "iso-27001", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/security-architecture-teaser.svg"
---

# Sicherheitsarchitektur

Sicherheit ist kein einzelnes Feature — sie ist eine mehrschichtige Architektur, die Secrets, Netzwerkisolation, Zugriffskontrolle, Audit-Trails und Compliance-Frameworks umfasst. Dieser Artikel konsolidiert das Sicherheitsmodell der Plattform in einer einzigen Referenz: wie Secrets verwaltet werden, wie Zugriff kontrolliert wird, wie Verkehr isoliert wird und wie die Architektur zu anerkannten Compliance-Frameworks abgebildet wird.

Für die Identitätsschicht, die Nutzer authentifiziert, siehe [Identitäts- und Authentifizierungsarchitektur](/architecture/identity-authentication). Für den Verkehrseinstieg und -routing siehe [Netzwerk- und Datenflussarchitektur](/architecture/networking-traffic-flow). Für Datenspeicherung und Backups siehe [Speicher- und Datenverwaltungsarchitektur](/architecture/storage-data-management).

## Secret Management

### Das Problem mit Secrets in GitOps

Ein GitOps-Workflow speichert die gesamte Konfiguration in Git — einschließlich Helm-Charts, Values-Dateien und Deployment-Manifesten. Aber einige Konfigurationen enthalten Secrets: Datenbankpasswörter, API-Schlüssel, TLS-Private-Keys und Authentifizierungs-Tokens. Diese im Klartext in Git zu speichern, ist ein Sicherheitsrisiko: Jeder mit Repository-Zugang kann sie lesen, und die Git-Historie bewahrt sie für immer auf.

### SOPS mit age-Verschlüsselung

Die Plattform verwendet SOPS (Secrets OPerationS) mit age-Verschlüsselung, um Secrets in Git zu verwalten. SOPS verschlüsselt die Werte der Secret-Schlüssel, lässt aber die Schlüsselnamen und die Struktur im Klartext. Das bedeutet:

- **Die Secret-Dateistruktur ist sichtbar** — Betreiber können sehen, welche Secrets existieren, ohne zu entschlüsseln
- **Die Secret-Werte sind verschlüsselt** — nur die Werte sind ohne den age-Private-Key unlesbar
- **Die Git-Historie ist sicher** — verschlüsselte Werte in alten Commits bleiben verschlüsselt

Der age-Verschlüsselungs-Key wird außerhalb von Git gespeichert (typischerweise auf dem Deployment-Server oder in einem Hardware Security Module). Der GitOps-Controller (ArgoCD) verwendet ein CMP (Config Management Plugin) Sidecar, um Secrets zur Deployment-Zeit zu entschlüsseln. Die Entschlüsselung erfolgt im Cluster, und die entschlüsselten Secrets werden niemals auf Festplatte oder in Git geschrieben.

### ArgoCD CMP Sidecar-Muster

Der Entschlüsselungsfluss funktioniert wie folgt:

1. **Verschlüsselte Secrets in Git**: SOPS-verschlüsselte Secret-Dateien werden zusammen mit anderer Konfiguration im Git-Repository gespeichert
2. **ArgoCD erkennt Änderungen**: ArgoCD überwacht das Git-Repository und erkennt, wenn sich Secret-Dateien ändern
3. **CMP-Sidecar entschlüsselt**: Das Config Management Plugin Sidecar läuft im ArgoCD-Repository-Server-Pod. Es empfängt das verschlüsselte Secret, verwendet den age-Private-Key zum Entschlüsseln und erzeugt ein Kubernetes-Secret-Manifest
4. **Kubernetes-Secret erstellt**: Das entschlüsselte Secret-Manifest wird auf den Cluster angewendet. Das Secret existiert nur im etcd des Clusters, niemals in Git
5. **Pods mounten das Secret**: Anwendungs-Pods referenzieren das Secret in ihren Deployment-Manifesten und mounten es als Umgebungsvariablen oder Dateien

Dieses Muster stellt sicher, dass:
- Keine Klartext-Secrets in Git existieren (nur verschlüsselte Werte)
- Keine Klartext-Secrets außerhalb des Clusters auf Festplatte existieren (der age-Key ist separat)
- Die Entschlüsselung zur Deployment-Zeit erfolgt, nicht zur Build-Zeit
- Der age-Key kann rotiert werden, ohne alle Secrets neu zu verschlüsseln (age unterstützt Empfängerrotation)

### Secret-Rotation

Secrets sollten regelmäßig rotiert werden. Der Ansatz der Plattform:

- **Datenbankpasswörter**: Rotiert durch Generieren eines neuen Passworts, Aktualisieren des SOPS-verschlüsselten Secrets und letting ArgoCD die Änderung deployen. Die Datenbank akzeptiert kurzzeitig sowohl das alte als auch das neue Passwort während des Übergangs.
- **API-Schlüssel**: Rotiert durch den Dienst, der sie ausgestellt hat. Der alte Schlüssel wird widerrufen, nachdem der neue Schlüssel deployt wurde.
- **TLS-Private-Keys**: Rotiert zusammen mit der Zertifikatserneuerung (siehe [Netzwerk- und Datenflussarchitektur](/architecture/networking-traffic-flow) für Zertifikatsverwaltung).
- **Age-Verschlüsselungs-Key**: Rotiert durch Generieren eines neuen Keys, Neu-Verschlüsseln aller Secrets mit dem neuen Key und Aktualisieren des ArgoCD CMP-Sidecars. Dies ist eine Wartungsfenster-Operation.

## Netzwerksicherheit und Isolation

### Netzwerkrichtlinien

Die Plattform verwendet Kubernetes-Netzwerkrichtlinien zur Erzwingung von Netzwerksegmentierung. Das Default-Deny-Modell bedeutet, dass der gesamte Pod-zu-Pod-Verkehr abgelehnt wird, es sei denn, er ist explizit erlaubt. Eine detaillierte Beschreibung der Netzwerkrichtlinien und des Datenflusspfads finden Sie unter [Netzwerk- und Datenflussarchitektur](/architecture/networking-traffic-flow).

Aus Sicherheitssicht bieten Netzwerkrichtlinien:

- **Blast-Radius-Eindämmung**: Wenn ein Pod kompromittiert wird, kann der Angreifer andere Pods nicht erreichen, es sei denn, eine Netzwerkrichtlinie erlaubt es
- **Least Privilege**: Jeder Dienst kann nur die spezifischen Dienste und Ports erreichen, die er benötigt
- **Audit-Trail**: Netzwerkrichtlinien sind deklarativ (in Git gespeichert), sodass der Netzwerksicherheitsstatus versioniert und überprüfbar ist

### Namespace-Isolation

Dienste laufen in separaten Kubernetes-Namespaces, was logische Isolation bietet:

- Jeder Hauptdienst (oder Gruppe verwandter Dienste) hat seinen eigenen Namespace
- Namespace-übergreifender Verkehr erfordert eine explizite Netzwerkrichtlinie
- Resource Quotas können pro Namespace angewendet werden, um zu verhindern, dass ein kompromittierter Dienst alle Cluster-Ressourcen verbraucht

### Verschlüsselung im Transit

Der gesamte externe Verkehr ist mit TLS verschlüsselt (siehe [Netzwerk- und Datenflussarchitektur](/architecture/networking-traffic-flow) für TLS-Details). Der interne Pod-zu-Pod-Verkehr ist standardmäßig nicht verschlüsselt, kann aber auf mTLS (mutual TLS) für Dienste aktualisiert werden, die es benötigen.

### Verschlüsselung im Ruhezustand

Daten im Ruhezustand werden verschlüsselt durch:

- **PersistentVolumes**: Storage-Klassen-abhängig. Ceph unterstützt verschlüsselte Volumes. Lokaler und NFS-Speicher basieren auf der zugrunde liegenden Speicherverschlüsselung (z. B. LUKS auf dem Knoten).
- **Datenbankspeicher**: Datenbankdateien auf PersistentVolumes erben die PV-Verschlüsselung. Verschlüsselung auf Anwendungsebene (z. B. Spaltenverschlüsselung in PostgreSQL) ist dienstspezifisch.
- **Backups**: Alle restic-Backups sind mit einem konfigurierbaren Key verschlüsselt. Der Backup-Key ist separat vom age-Verschlüsselungs-Key, der für GitOps-Secrets verwendet wird.

## Rollenbasierte Zugriffskontrolle (RBAC)

Die Plattform hat zwei RBAC-Schichten: Kubernetes-RBAC für Cluster-Operationen und Keycloak-RBAC für anwendungsebene Zugriffskontrolle.

### Kubernetes-RBAC

Kubernetes-RBAC steuert, wer welche Aktionen an Cluster-Ressourcen durchführen kann. Die Plattform definiert Rollen auf drei Ebenen:

- **Cluster-Admin**: Voller Zugriff auf alle Cluster-Ressourcen. Verwendet von Plattform-Betreibern für Cluster-Level-Management.
- **Namespace-Admin**: Voller Zugriff auf Ressourcen innerhalb eines bestimmten Namespace. Verwendet von Dienst-Betreibern, die einen einzelnen Dienst oder eine Gruppe von Diensten verwalten.
- **Read-Only**: Lesezugriff auf Ressourcen ohne Modifikation. Verwendet für Monitoring, Auditing und Debugging.

Jede Rolle ist über RoleBindings (Namespace-bezogen) oder ClusterRoleBindings (Cluster-bezogen) an Nutzer oder Gruppen gebunden. Service-Accounts (verwendet von Pods und Automatisierung) erhalten ihre eigenen Rollen mit minimalen Berechtigungen.

### Keycloak-RBAC

Keycloak verwaltet anwendungsebene Zugriffskontrolle durch Realm-Rollen und Client-Rollen:

- **Realm-Rollen**: Auf Keycloak-Realm-Ebene definierte Rollen (z. B. `admin`, `user`, `student`, `staff`)
- **Client-Rollen**: Dienstspezifische Rollen (z. B. `nextcloud-admin`, `moodle-teacher`)
- **Gruppenmitgliedschaften**: Nutzer können Mitglieder von Gruppen sein, die Rollen über mehrere Dienste hinweg gewähren

Wenn ein Nutzer sich authentifiziert (siehe [Identitäts- und Authentifizierungsarchitektur](/architecture/identity-authentication)), enthält Keycloak seine Rollen im OIDC-Token. Dienste lesen diese Rollen und erzwingen Zugriffskontrolle:

- **Nextcloud**: Prüft Keycloak-Rollen für Admin- vs. Nutzer-Zugriff
- **Moodle**: Ordnet Keycloak-Rollen zu Kurs-Rollen zu (Lehrer, Student, Manager)
- **OpenProject**: Ordnet Keycloak-Rollen zu Projekt-Berechtigungen zu

### Prinzip der minimalen Rechte

Sowohl Kubernetes-RBAC als auch Keycloak-RBAC folgen dem Prinzip der minimalen Rechte:

- **Kubernetes**: Service-Accounts haben nur die Berechtigungen, die zum Funktionieren benötigt werden. Ein Dienst, der ConfigMaps liest, erhält keine Berechtigungen zum Löschen von Pods.
- **Keycloak**: Nutzer haben nur die Rollen, die für ihre Funktion benötigt werden. Ein Student hat keine Admin-Rollen. Ein Lehrer hat keine Cluster-Admin-Rollen.
- **Netzwerkrichtlinien**: Ein Dienst kann nur die spezifischen Dienste und Ports erreichen, die er benötigt (siehe [Netzwerk- und Datenflussarchitektur](/architecture/networking-traffic-flow))

## Audit-Logging

Audit-Logging bietet einen Nachverfolgungswerfolg, wer was und wann getan hat. Die Plattform hat mehrere Audit-Log-Quellen:

### Kubernetes-Audit-Logging

Kubernetes kann alle API-Anfragen an den Cluster audit-protokollieren. Das Audit-Log erfasst:

- **Wer**: Der authentifizierte Nutzer (oder Service-Account), der die Anfrage stellt
- **Was**: Die Ressource, auf die zugegriffen wird (z. B. `pods`, `secrets`, `configmaps`)
- **Wann**: Zeitstempel der Anfrage
- **Wie**: Das HTTP-Verb (GET, POST, PUT, DELETE)
- **Ergebnis**: Ob die Anfrage erlaubt oder abgelehnt wurde

Audit-Logging wird auf Kubernetes-API-Server-Ebene konfiguriert. Die Logs können an ein zentrales Logging-System (z. B. Loki, Elasticsearch) zur langfristigen Speicherung und Analyse gesendet werden.

### Keycloak-Ereignisprotokollierung

Keycloak protokolliert Authentifizierungsereignisse:

- Erfolgreiche und fehlgeschlagene Anmeldungen
- Token-Ausstellung und -Erneuerung
- Sitzungserstellung und -Beendigung
- Rollen- und Gruppenmitgliedschaftsänderungen
- Föderationsereignisse (IdP-Verbindungen, Attributzuordnung)

Diese Logs unterstützen die Incident-Untersuchung (wer hat sich wann, von wo angemeldet) und Compliance-Nachweise (Zugriffsmuster für Auditoren).

### Anwendungsebene Audit-Logs

Jeder Dienst führt sein eigenes Audit-Log:

- **Nextcloud**: Dateizugriff, Freigaben, Löschungen
- **Moodle**: Kurszugriff, Notenänderungen, Inhaltsänderungen
- **OpenProject**: Projektänderungen, Aufgabenvergaben
- **Zammad**: Ticketzugriff und -änderungen

Anwendungs-Audit-Logs sind dienstspezifisch und werden in der Datenbank oder in Log-Dateien des Dienstes gespeichert. Sie sind im Backup-Zeitplan der Plattform enthalten (siehe [Speicher- und Datenverwaltungsarchitektur](/architecture/storage-data-management)).

### Zentrale Log-Aggregation

Für Produktionsbereitstellungen können Logs von allen Diensten in ein zentrales Logging-System aggregiert werden:

- **Loki**: Log-Aggregation mit Grafana-Dashboards
- **Prometheus**: Metriken (keine Logs, aber verwandt mit Observability)
- **Alertmanager**: Alarme auf Log-Muster (z. B. wiederholte fehlgeschlagene Anmeldungen, ungewöhnliche API-Zugriffe)

Zentrale Log-Aggregation ist optional, aber für größere Bereitstellungen empfohlen. Sie ermöglicht dienstübergreifende Korrelation (z. B. „Nutzer X hat sich bei Keycloak angemeldet, dann auf Nextcloud zugegriffen, dann eine Datei gelöscht") und langfristige Log-Aufbewahrung.

## Compliance-Framework-Mapping

Die Sicherheitskontrollen der Plattform lassen sich auf anerkannte Compliance-Frameworks abbilden. Dieses Mapping ist sachlich — es beschreibt, welche Architektur-Features welche Compliance-Anforderungen erfüllen. Es ist keine Zertifizierung oder Empfehlung.

### BSI IT-Grundschutz (ZKI Hochschul-Profil)

BSI IT-Grundschutz ist der deutsche Bundes-Sicherheitsstandard. Das ZKI (Zentrum für Konsortiale IT-Dienste) Hochschul-Profil passt IT-Grundschutz für Universitäten an. Die Sicherheitskontrollen der Plattform lassen sich auf mehrere IT-Grundschutz-Module abbilden:

| IT-Grundschutz-Modul | Plattform-Kontrolle |
|----------------------|-----------------|
| ORP.4 (Authentifizierung) | DFN-AAI-Föderation, Keycloak-SSO, MFA-Unterstützung |
| CON.1 (Krypto-Konzept) | TLS für Transit, SOPS/age für Secrets, restic-Verschlüsselung für Backups |
| CON.6 (Kryptographische Schlüssel) | Age-Key-Management, TLS-Zertifikats-Lebenszyklus, Key-Rotation |
| OPS.1 (Betrieb) | GitOps mit ArgoCD, deklarative Konfiguration, versionierte Änderungen |
| OPS.4 (Administration) | Kubernetes-RBAC, Namespace-Isolation, Service-Accounts mit minimalen Rechten |
| APP.3 (Web-Anwendungen) | Sicherheits-Header (HSTS, CSP, X-Frame-Options), Ratenbegrenzung, Eingabevalidierung |
| SYS.1 (Server) | Kubernetes-Hardening, Netzwerkrichtlinien, Default-Deny-Modell |
| INF.2 (IT-Systeme) | PersistentVolume-Verschlüsselung, Backup-Verschlüsselung |
| DER.4 (Business Continuity) | k8up-Backup-Zeitplan, restic-Off-Site-Backup, Wiederherstellungsverfahren |

### DSGVO / GDPR

Die Datenschutz-Grundverordnung (DSGVO / GDPR in Englisch) regelt die Verarbeitung personenbezogener Daten. Die Plattform unterstützt DSGVO-Compliance durch:

- **Datenminimierung**: Die Plattform fordert nur die Attribute an, die sie von der Föderation benötigt (siehe [Identitäts- und Authentifizierungsarchitektur](/architecture/identity-authentication) für die Attributzuordnung). Sie speichert keine sensiblen Attribute (z. B. Personalausweisnummern) aus der Föderation.
- **Keine Passwortspeicherung für föderierte Nutzer**: Die Plattform sieht oder speichert niemals das institutionelle Passwort des Nutzers. Die Authentifizierung erfolgt am IdP; die Plattform empfängt nur Assertions.
- **Recht auf Löschung**: Wenn ein Nutzerkonto entfernt wird, löscht die Plattform die Nutzerdaten über alle Dienste hinweg (siehe [Speicher- und Datenverwaltungsarchitektur](/architecture/storage-data-management) für den Löschprozess).
- **Datenportabilität**: Nutzerdaten können aus jedem Dienst exportiert werden (Nextcloud-Dateiexport, Moodle-Kursexport usw.).
- **Audit-Trail**: Keycloak-Ereignisprotokollierung und Anwendungs-Audit-Logs bieten Nachweise darüber, wer wann auf welche Daten zugegriffen hat.
- **Verschlüsselung**: Daten sind im Transit (TLS) und im Ruhezustand (PV-Verschlüsselung, Backup-Verschlüsselung) verschlüsselt.

Die Plattform ist ein Datenverarbeiter; die Einrichtung ist der Datenverantwortliche. Die Einrichtung ist verantwortlich für die Rechtsgrundlage der Verarbeitung, Datenschutz-Folgenabschätzungen und Rechte der betroffenen Personen. Die Plattform stellt die technischen Kontrollen zur Unterstützung dieser Pflichten bereit.

### ISO 27001

ISO/IEC 27001 ist der internationale Standard für Informationssicherheits-Managementsysteme (ISMS). Die Kontrollen der Plattform lassen sich auf mehrere ISO-27001-Anhang-A-Kontrollen abbilden:

| ISO 27001 Kontrolle | Plattform-Kontrolle |
|------------------|-----------------|
| A.5.15 (Zugriffskontrolle) | Keycloak-RBAC, Kubernetes-RBAC, Netzwerkrichtlinien |
| A.5.17 (Authentifizierungsinformation) | SOPS/age-Secret-Management, keine Klartext-Secrets in Git |
| A.5.18 (Zugriffsrechte) | Service-Accounts mit minimalen Rechten, Namespace-Isolation |
| A.5.21 (Informationsübertragung) | TLS für den gesamten Transit, mTLS für internen Verkehr (wo aktiviert) |
| A.5.30 (ICT-Bereitschaft für Business Continuity) | k8up-Backups, restic-Off-Site-Speicherung, Wiederherstellungsverfahren |
| A.5.33 (Schutz von Aufzeichnungen) | Audit-Logging (Kubernetes, Keycloak, anwendungsebene) |
| A.5.34 (Datenschutz und Schutz von personenbezogenen Daten) | DSGVO-Compliance-Kontrollen (Datenminimierung, Recht auf Löschung) |
| A.8.1 (Benutzer-Endgeräte) | N/A (Endgeräte werden von der Einrichtung verwaltet, nicht von der Plattform) |
| A.8.2 (Privilegierte Zugriffsrechte) | Kubernetes-Cluster-Admin, Namespace-Admin, Read-Only-Rollen |
| A.8.3 (Informationszugriffsbeschränkung) | Netzwerkrichtlinien, RBAC, Namespace-Isolation |
| A.8.4 (Zugriff auf Quellcode) | Git-Repository-Zugriffskontrolle, ArgoCD-GitOps |
| A.8.5 (Sichere Authentifizierung) | DFN-AAI-Föderation, Keycloak-SSO, MFA-Unterstützung |
| A.8.7 (Malware-Schutz) | ClamAV-Virenscanning (wo eingesetzt) |
| A.8.9 (Konfigurationsmanagement) | GitOps mit ArgoCD, deklarative Helm-Charts, versionierte Konfiguration |
| A.8.12 (Verhinderung von Datenabfluss) | Netzwerkrichtlinien, Namespace-Isolation, Default-Deny-Modell |
| A.8.13 (Informations-Backup) | k8up-Backup-Zeitplan, restic-verschlüsselte Backups |
| A.8.14 (Redundanz der Informationsverarbeitung) | Datenbankreplikation (MariaDB, PostgreSQL), PV-Replikation (Ceph) |
| A.8.15 (Protokollierung) | Kubernetes-Audit-Logging, Keycloak-Ereignisprotokollierung, Anwendungs-Audit-Logs |
| A.8.24 (Kryptographie-Einsatz) | TLS, SOPS/age, restic-Verschlüsselung |

## Sicherheits-Hardening-Checkliste

Die folgende Checkliste fasst die Sicherheitskontrollen zusammen, die für jede Bereitstellung überprüft werden sollten:

- [ ] **Secrets verschlüsselt**: Alle in Git gespeicherten Secrets sind SOPS-verschlüsselt mit age. Keine Klartext-Secrets in irgendeinem Git-Repository.
- [ ] **TLS erzwungen**: Der gesamte externe Verkehr verwendet TLS 1.2+. HTTP wird zu HTTPS weitergeleitet. HSTS ist aktiviert.
- [ ] **Netzwerkrichtlinien**: Default-Deny-Modell ist aktiv. Jeder Dienst hat explizite Netzwerkrichtlinien, die nur notwendigen Verkehr erlauben.
- [ ] **RBAC konfiguriert**: Kubernetes-RBAC-Rollen sind auf minimale Rechte beschränkt. Service-Accounts haben minimale Berechtigungen.
- [ ] **Audit-Logging aktiviert**: Kubernetes-Audit-Logging, Keycloak-Ereignisprotokollierung und Anwendungs-Audit-Logs sind aktiv und werden gesammelt.
- [ ] **Backups verschlüsselt**: Alle restic-Backups sind verschlüsselt. Der Backup-Key ist vom age-Key getrennt.
- [ ] **Backup-Überwachung**: Prometheus-Alarme sind für Backup-Fehler konfiguriert. Der Zeitstempel der letzten erfolgreichen Sicherung wird überwacht.
- [ ] **Key-Rotationsverfahren dokumentiert**: Age-Key, TLS-Zertifikate, Datenbankpasswörter und API-Schlüssel haben dokumentierte Rotationsverfahren.
- [ ] **Namespace-Isolation**: Dienste laufen in separaten Namespaces. Namespace-übergreifender Verkehr ist explizit.
- [ ] **Container-Images gescannt**: Container-Images werden vor der Bereitstellung auf Schwachstellen gescannt (z. B. Kubescape, Trivy).

---

## Weiterführende Literatur

- [Identitäts- und Authentifizierungsarchitektur](/architecture/identity-authentication) — die Authentifizierungskette, Föderation und Attributzuordnung
- [Netzwerk- und Datenflussarchitektur](/architecture/networking-traffic-flow) — Datenfluss, TLS, Ingress und Netzwerkrichtlinien
- [Speicher- und Datenverwaltungsarchitektur](/architecture/storage-data-management) — persistenter Speicher, Datenbanken und Backup-Integration
- [Systemarchitektur-Übersicht](/architecture/overview) — die vollständige Plattformarchitektur
- [Sicherheit und Compliance](/blog/security-compliance) — Blog-Beitrag zum Sicherheits- und Compliance-Ansatz der Plattform
- [SOPS Secret Management mit ArgoCD CMP](/blog/sops-secret-management-argocd-cmp) — Blog-Beitrag zum SOPS + age + ArgoCD-Muster
- [BSI IT-Grundschutz Compliance](/blog/zki-it-grundschutz-compliance) — Blog-Beitrag zur BSI-IT-Grundschutz-Ausrichtung

---

*Sicherheit ist eine mehrschichtige Architektur, kein einzelnes Feature. Jede Schicht — Secrets, Netzwerk, Zugriffskontrolle, Audit, Compliance — verstärkt die anderen. Keine Schicht allein ist ausreichend; zusammen bieten sie Defence in Depth.*
