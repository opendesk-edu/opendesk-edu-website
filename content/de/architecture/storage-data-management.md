---
title: "Speicher- und Datenverwaltungsarchitektur"
date: "2026-08-27"
description: "Wie openDesk Edu persistenten Speicher, Datenbank-Backends, Backup-Integration und Datenlebenszyklus verwaltet — von PersistentVolumes und Storage-Klassen bis zu k8up/restic-Backups und Kapazitätsplanung."
categories: ["architecture", "infrastructure"]
tags: ["architektur", "speicher", "persistent-volumes", "datenbank", "mariadb", "postgresql", "redis", "backup", "k8up", "restic", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/storage-data-management-teaser.svg"
---

# Speicher- und Datenverwaltungsarchitektur

Jeder Dienst auf der Plattform produziert Daten: Kursmaterialien im LMS, Dateien im Cloud-Speicher, E-Mails in Postfächern, Kollaborationsdokumente und Konfigurationszustände. Diese Daten sind der wertvollste Besitz der Einrichtung, und wie sie gespeichert, geschützt und verwaltet werden, bestimmt die Zuverlässigkeit der Plattform. Dieser Artikel dokumentiert die Speicherarchitektur: wie PersistentVolumes dauerhaften Speicher bereitstellen, wie Datenbank-Backends zustandsbehaftete Anwendungen bedienen, wie Backups vor Datenverlust schützen und wie der Datenlebenszyklus — von der Erstellung bis zur Archivierung — verwaltet wird.

Für den Netzwerkpfad, der Daten zu Nutzern liefert, siehe [Netzwerk- und Datenflussarchitektur](/architecture/networking-traffic-flow). Für die vollständige Plattformübersicht siehe [Systemarchitektur-Übersicht](/architecture/overview).

## Persistenter Speicher

### PersistentVolumes und Storage-Klassen

Kubernetes trennt Compute (Pods, die kurzlebig sind) von Speicher (PersistentVolumes, die dauerhaft sind). Wenn ein Pod neu startet, gehen seine lokalen Daten verloren. PersistentVolumes (PVs) überdauern Pod-Neustarts, Knotenausfälle und Neuschedulierung.

Die Plattform verwendet PersistentVolumeClaims (PVCs), um Speicher anzufordern. Ein PVC gibt an:

- **Zugriffsmodus**: Wie das Volume gemountet werden kann (read-write einmal, read-only mehrfach, read-write mehrfach)
- **Speichergröße**: Wie viel Kapazität benötigt wird
- **Storage-Klasse**: Welche Art von Hintergrundspeicher verwendet werden soll

Die Storage-Klasse bestimmt den physischen Speicher-Backend. Gängige Storage-Klassen in der Plattform umfassen:

- **Lokaler persistenter Speicher**: Direkt angeschlossener Speicher auf dem Knoten. Schnell, aber an einen bestimmten Knoten gebunden. Geeignet für Datenbanken, die von niedriger Latenz profitieren.
- **Netzwerk-angebundener Speicher (NFS)**: Geteiltes Dateisystem, zugänglich von mehreren Knoten. Geeignet für Dateispeicherdienste (Nextcloud, OpenCloud), die Lese-Schreib-Zugriff von jedem Knoten benötigen.
- **Software-definierter Speicher (Ceph)**: Verteilter Speicher, der Ausfallsicherheit durch Replikation bietet. Daten werden auf mehrere Knoten geschrieben, sodass ein einzelner Knotenausfall keinen Datenverlust verursacht. Geeignet für alle Diensttypen.
- **Objektspeicher (S3-kompatibel)**: Für Backup-Ziele und große unstrukturierte Daten. Nicht für Anwendungs-PVs verwendet, aber von restic für Backup-Speicherung verwendet.

Jeder Dienst deklariert seinen Speicherbedarf über einen PVC in seinem Helm-Chart. Die Storage-Klassen der Plattform stellen sicher, dass die richtige Art von Speicher automatisch bereitgestellt wird.

### Zugriffsmodi

| Zugriffsmodus | Abkürzung | Beschreibung | Typische Verwendung |
|-------------|-------------|-------------|-------------|
| ReadWriteOnce | RWO | Ein Knoten mountet read-write | Datenbanken (MariaDB, PostgreSQL) |
| ReadOnlyMany | ROX | Viele Knoten mounten read-only | Konfiguration, statische Assets |
| ReadWriteMany | RWX | Viele Knoten mounten read-write | Dateispeicher (Nextcloud, OpenCloud) |

Die meisten Datenbanken verwenden RWO, da sie als einzelne Instanz laufen und keine gleichzeitigen Schreibvorgänge von mehreren Knoten benötigen. Dateispeicherdienste verwenden RWX, da jeder Knoten eine Dateianfrage bedienen kann.

### Kapazitätsplanung

Speicherkapazität ist eines der kritischsten betrieblichen Anliegen. Jeder Dienst hat unterschiedliche Speicherbedürfnisse:

- **Dateispeicher** (Nextcloud, OpenCloud): Der größte Verbraucher. Nutzerdateien sammeln sich über die Zeit an. Planen Sie Wachstum ein — eine Plattform mit aktiven Nutzern kann innerhalb von Monaten Terabyte an Dateispeicher benötigen.
- **E-Mail** (Grommunio): Postfächer wachsen stetig. Jedes Nutzerpostfach kann von wenigen hundert Megabyte bis mehreren Gigabyte reichen.
- **Datenbanken** (MariaDB, PostgreSQL): Relativ klein im Vergleich zu Dateispeicher, aber kritisch. Datenbankspeicher sollte auf schnellem Speicher (SSD oder NVMe) liegen, um die Leistung zu gewährleisten.
- **Videoaufzeichnungen** (BigBlueButton): Aufzeichnungen können groß sein (Hunderte von Megabyte bis Gigabyte pro Sitzung). Planen Sie Aufbewahrungsrichtlinien ein (wie lange Aufzeichnungen aufbewahrt werden).
- **Konfiguration und Zustand** (Keycloak, Nubus): Klein, aber kritisch. Verlust der Keycloak-Datenbank bedeutet Verlust aller Nutzerkonten und Föderationskonfiguration.

Die Plattform schreibt keine spezifischen Kapazitätszahlen vor — die Bedürfnisse jeder Einrichtung sind unterschiedlich. Die Plattform bietet jedoch Monitoring (Prometheus + Grafana), um die Speichernutzung zu verfolgen und bei geringer Kapazität zu warnen.

## Datenbank-Backends

Die Plattform verwendet drei Arten von Datenbank-Backends, jeweils geeignet für unterschiedliche Workloads:

### MariaDB

MariaDB (ein MySQL-Fork) ist die primäre relationale Datenbank für Dienste, die MySQL-Kompatibilität benötigen. Sie wird verwendet von:

- **Grommunio** (E-Mail): Postfach-Metadaten, Nutzerkonfiguration
- **ILIAS** (LMS): Kursdaten, Nutzerfortschritt, Prüfungen
- **Moodle** (LMS): Kursdaten, Nutzerfortschritt, Aufgaben
- **XWiki** (Wiki): Wiki-Seiten, Anhänge, Metadaten

MariaDB läuft als StatefulSet in Kubernetes mit einem PersistentVolume für Datenspeicherung. Jeder Dienst hat seine eigene MariaDB-Instanz (oder Datenbank innerhalb einer geteilten Instanz), isoliert durch Namespace.

#### Hochverfügbarkeit

Für Produktionsbereitstellungen kann MariaDB mit Primary-Replica-Replikation konfiguriert werden. Der Primary behandelt Schreibvorgänge; Replicas behandeln Lesevorgänge und bieten Failover. Wenn der Primary ausfällt, wird ein Replica befördert. Dies ist Konfiguration, kein Code — der Helm-Chart unterstützt sowohl Single-Instance- als auch replizierte Setups.

### PostgreSQL

PostgreSQL wird von Diensten verwendet, die PostgreSQL-spezifische Funktionen bevorzugen oder benötigen (JSONB, Volltextsuche, erweiterte Indizierung):

- **Nextcloud** (Dateispeicher): Metadaten, Dateiindex, Freigaben
- **OpenProject** (Projektmanagement): Projekte, Aufgaben, Zeiterfassung
- **Keycloak** (Identität): Realm-Konfiguration, Nutzerkonten, Föderationsmetadaten
- **Zammad** (Helpdesk): Tickets, Artikel, Nutzerdaten

PostgreSQL läuft ebenfalls als StatefulSet mit einem PersistentVolume. Wie MariaDB kann es für Hochverfügbarkeit mit Primary-Replica-Replikation konfiguriert werden.

#### Verbindungs-Pooling

Sowohl MariaDB als auch PostgreSQL unterstützen Verbindungs-Pooling (über ProxySQL für MariaDB und PgBouncer für PostgreSQL). Verbindungs-Pooling reduziert den Overhead beim Aufbau neuer Datenbankverbindungen, indem ein Pool wiederverwendbarer Verbindungen aufrechterhalten wird. Dies ist wichtig, wenn Dienste viele kurzlebige Datenbankabfragen haben.

### Redis

Redis ist ein In-Memory-Key-Value-Store, verwendet für:

- **Caching**: Sitzungsdaten, häufig zugegriffene Objekte, gerenderte Seiten
- **Ratenbegrenzung**: Verfolgung von API-Anfragezählern
- **Message Queues**: Leichte Job-Warteschlangen für Hintergrundaufgaben
- **Sitzungsspeicherung**: Für Dienste, die Sitzungen in Redis statt in der Datenbank speichern

Redis läuft als StatefulSet mit einem PersistentVolume für Persistenz (sodass zwischengespeicherte Daten Neustarts überstehen). Es ist mit einem Speicherlimit und einer Eviction-Richtlinie konfiguriert (typischerweise `allkeys-lru` — zuletzt verwendete Schlüssel entfernen, wenn der Speicher voll ist).

### Datenbankverbindung

Dienste verbinden sich über Kubernetes-DNS-Namen mit ihren Datenbanken. Zum Beispiel verbindet sich ein Dienst mit `mariadb.database-namespace.svc.cluster.local:3306` statt mit einer IP-Adresse. Diese Abstraktion bedeutet, dass Datenbanken verschoben, neu gestartet oder neu konfiguriert werden können, ohne die Anwendungskonfiguration zu ändern.

Jede Datenbank hat ihre eigenen Anmeldeinformationen, die als Kubernetes-Secrets gespeichert werden. Die Anwendung liest die Anmeldeinformationen aus Umgebungsvariablen oder gemounteten Secret-Dateien. Keine Datenbankpasswörter werden im Klartext in der Helm-Konfiguration gespeichert — sie werden während der Bereitstellung generiert und in Secrets gespeichert.

## Backup-Integration

### k8up-Backup-Operator

Die Plattform verwendet k8up, einen Kubernetes-nativen Backup-Operator, um automatisierte Backups zu verwalten. k8up läuft im Cluster und koordiniert Backup-Zeitpläne über alle Dienste hinweg.

k8up verwendet restic als Backup-Backend. Restic ist ein schnelles, sicheres und effizientes Backup-Tool, das unterstützt:

- **Inkrementelle Backups**: Nur geänderte Daten werden übertragen, was Backup-Zeit und Speicherverbrauch reduziert
- **Deduplizierung**: Identische Datenblöcke werden nur einmal gespeichert, was die Speicherkosten reduziert
- **Verschlüsselung**: Alle Backup-Daten werden im Ruhezustand mit einem konfigurierbaren Schlüssel verschlüsselt
- **Mehrere Speicher-Backends**: Lokale Verzeichnisse, NFS, S3-kompatiblen Objektspeicher, SFTP-Server

### Backup-Zeitplan

Der Backup-Zeitplan der Plattform ist konfigurierbar. Ein typisches Setup:

- **Datenbank-Backups**: Täglich, über Datenbank-Dumps (z. B. `mariadb-dump` oder `pg_dump`). Dies sind logische Backups, die den Datenbankzustand zu einem Zeitpunkt erfassen.
- **Persistent-Volume-Snapshots**: Wöchentliche vollständige Snapshots aller PersistentVolumes. Dies sind Volume-Level-Backups, die das gesamte PV erfassen, einschließlich Datenbanken, Dateien und Konfiguration.
- **Konfigurations-Backups**: Konfiguration wird in Git gespeichert (über ArgoCD), sodass die Git-Historie als Konfigurations-Backup dient. Kein separates Backup ist erforderlich.

### Was gesichert wird

Alle persistenten Daten aller Dienste sind in Backups enthalten:

- LMS-Kursinhalte und Nutzerabgaben (ILIAS, Moodle)
- BigBlueButton-Aufzeichnungsdateien
- Nextcloud- und OpenCloud-Nutzerdateien
- Grommunio-Postfächer (über MariaDB-Dumps)
- Collabora-Dokument-Caches
- Keycloak- und Nubus-Konfigurationszustand
- Datenbankinhalte (MariaDB, PostgreSQL)
- Redis-Persistenzdaten

Nicht-persistente Daten sind ausgeschlossen: Container-Images, kurzlebige Caches und temporäre Dateien, die neu generiert werden können.

### Backup-Speicherziele

Restic unterstützt eine Vielzahl von Speicher-Backends. Einrichtungen können Backups leiten zu:

- **Lokaler NFS/S3-kompatibler Speicher**: Vor-Ort-Speicher, den die Einrichtung kontrolliert
- **Off-Site-Objektspeicher**: Cloud-basierter S3-kompatibler Speicher für Disaster Recovery
- **SFTP-Server**: Remote-Server für Off-Site-Backup-Speicherung
- **Jedes restic-unterstützte Backend**: Restics flexible Backend-Unterstützung bedeutet, dass Einrichtungen den Speicher wählen können, der zu ihrer Infrastruktur und ihren Compliance-Anforderungen passt

Das Backup-Ziel wird in k8ups Zeitplandefinition konfiguriert. Mehrere Ziele können gleichzeitig verwendet werden (z. B. lokal für schnelle Wiederherstellungen, Off-Site für Disaster Recovery).

### Wiederherstellungsprozess

Die Wiederherstellung aus einem Backup umfasst:

1. **Wiederherstellungspunkt identifizieren**: Welcher Backup-Snapshot enthält den gewünschten Zustand
2. **Betroffenen Dienst stoppen**: Um Datenkonflikte während der Wiederherstellung zu vermeiden
3. **Restic-Wiederherstellung ausführen**: k8up initiiert einen Wiederherstellungsjob, der Daten vom Backup-Ziel zurück auf das PersistentVolume kopiert
4. **Dienst neu starten**: Sobald die Wiederherstellung abgeschlossen ist, wird der Dienst mit den wiederhergestellten Daten neu gestartet

Für Datenbank-Wiederherstellungen ist der Prozess ähnlich, verwendet aber den Datenbank-Dump: Die Dump-Datei wird in die Datenbank wiederhergestellt, was die SQL-Anweisungen abspielt, um den Datenbankzustand zu rekonstruieren.

### Backup-Überwachung

k8up integriert sich mit Prometheus, um Backup-Metriken bereitzustellen:

- Zeitstempel der letzten erfolgreichen Sicherung
- Backup-Dauer
- Backup-Größe
- Anzahl der Snapshots im Repository
- Backup-Fehler (über Alertmanager alarmiert)

Betreiber sollten diese Metriken überwachen und bei Backup-Fehlern alarmieren — ein stiller Backup-Fehler ist schlimmer als kein Backup, weil er ein falsches Sicherheitsgefühl erzeugt.

## Datenlebenszyklus

### Erstellung

Daten werden von Diensten erstellt, wenn Nutzer mit der Plattform interagieren. Jeder Dienst verwaltet sein eigenes Datenformat und seine eigene Speicherposition. Die Plattform erzwingt kein einheitliches Datenmodell — jeder Dienst verwendet seine native Speicherung (Dateien in Nextcloud, Datensätze in MariaDB, Dokumente in Collabora).

### Wachstum

Wenn die Plattform genutzt wird, wachsen die Daten. Die Plattform bietet Monitoring (Prometheus + Grafana), um zu verfolgen:

- PersistentVolume-Nutzung (wie voll jedes PV ist)
- Datenbankgröße (Zeilen, verbrauchter Speicher)
- Backup-Größe und Wachstumsrate
- Verbleibende Kapazität

Wenn sich der Speicher der Kapazität nähert, können Betreiber:

- **PersistentVolumes erweitern**: Die meisten Storage-Klassen unterstützen Volume-Erweiterung. Der PVC wird mit einer größeren Größe aktualisiert, und das PV wächst automatisch (keine Ausfallzeit für RWO-Volumes; kurzes Remount für RWX-Volumes).
- **Knoten hinzufügen**: Für verteilten Speicher (Ceph) erhöht das Hinzufügen von Knoten sowohl Compute- als auch Speicherkapazität.
- **Alte Daten archivieren**: Verschieben Sie selten zugegriffene Daten auf billigeren Speicher oder löschen Sie sie gemäß Aufbewahrungsrichtlinien.

### Aufbewahrung und Archivierung

Jeder Dienst hat seine eigenen Datenaufbewahrungsanforderungen:

- **E-Mail**: Postfächer werden so lange aufbewahrt, wie das Nutzerkonto existiert. Gelöschte E-Mails können für einen konfigurierbaren Zeitraum wiederherstellbar sein.
- **LMS-Daten**: Kursdaten werden gemäß institutioneller Richtlinie aufbewahrt. Einige Einrichtungen archivieren Kurse nach Semesterende; andere behalten sie unbegrenzt.
- **Videoaufzeichnungen**: BigBlueButton-Aufzeichnungen können für einen konfigurierbaren Zeitraum aufbewahrt und dann automatisch gelöscht oder archiviert werden.
- **Dateispeicher**: Nutzerdateien werden aufbewahrt, bis der Nutzer sie löscht oder das Konto entfernt wird.

Die Plattform erzwingt keine Aufbewahrungsrichtlinien — jede Einrichtung konfiguriert die Aufbewahrung basierend auf ihren eigenen rechtlichen und betrieblichen Anforderungen. Die Plattform bietet die Werkzeuge (Backup-Zeitpläne, Monitoring, Speichererweiterung), um jede Aufbewahrungsrichtlinie zu implementieren, die die Einrichtung wählt.

### Löschung

Datenlöschung ist dauerhaft. Wenn ein Nutzerkonto entfernt wird, löscht die Plattform:

- Die Dateien des Nutzers (Nextcloud, OpenCloud)
- Das Postfach des Nutzers (Grommunio)
- Die Kursdaten und Abgaben des Nutzers (ILIAS, Moodle)
- Die Konfiguration des Nutzers in Keycloak und Nubus

Die Löschung wird durch die eigene Löschlogik des Dienstes durchgeführt, nicht durch ein zentrares plattformweites Skript. Dies stellt sicher, dass der Löschprozess jedes Dienstes sein eigenes Datenmodell und seine referenzielle Integrität respektiert.

## Datenbankmigrationen

Wenn Dienste aktualisiert werden, benötigen ihre Datenbanken möglicherweise Schema-Migrationen. Die Plattform behandelt dies durch Helm-Chart-Hooks:

1. **Pre-Upgrade-Hook**: Führt Datenbank-Migrationsskripte aus, bevor die neue Version startet
2. **Neue Version startet**: Der Dienst startet mit dem aktualisierten Schema
3. **Rollback (falls erforderlich)**: Wenn die Migration umkehrbar ist, kann der Helm-Chart auf die vorherige Version zurückrollen

Migrationen sind dienstspezifisch. Der Helm-Chart jedes Dienstes enthält die Migrationslogik für seine Datenbank. Die Plattform erzwingt kein einheitliches Migrations-Framework — sie delegiert an die native Migrations-Tooling jedes Dienstes.

## Fehlermodi und Fehlerbehebung

### PersistentVolume voll

**Symptom**: Dienste melden „Festplatte voll" oder „Kein Speicherplatz mehr auf dem Gerät".
**Ursache**: Ein PersistentVolume hat seine Kapazität erreicht.
**Lösung**: Erweitern Sie den PVC (wenn die Storage-Klasse Erweiterung unterstützt) oder bereinigen Sie unnötige Daten. Überwachen Sie die PV-Nutzung, um dies zu erkennen, bevor es kritisch wird.

### Datenbankverbindungsfehler

**Symptom**: Dienste melden „Verbindung abgelehnt" oder „Verbindung zur Datenbank nicht möglich".
**Ursache**: Der Datenbank-Pod ist ausgefallen, die Netzwerkrichtlinie blockiert Verkehr, oder die Datenbank-Anmeldeinformationen sind falsch.
**Lösung**: Überprüfen Sie den Datenbank-Pod-Status (`kubectl get pods`), verifizieren Sie, dass die Netzwerkrichtlinie dem Dienst erlaubt, die Datenbank zu erreichen, und überprüfen Sie das Secret auf korrekte Anmeldeinformationen.

### Backup-Fehler

**Symptom**: k8up meldet Backup-Fehler, oder die letzte erfolgreiche Sicherung ist alt.
**Ursache**: Das Backup-Ziel ist nicht erreichbar, das restic-Repository ist gesperrt, oder der Backup-Verschlüsselungsschlüssel hat sich geändert.
**Lösung**: Überprüfen Sie die Konnektivität zum Backup-Ziel, verifizieren Sie, dass das restic-Repository nicht durch einen anderen Prozess gesperrt ist, und stellen Sie sicher, dass der Backup-Verschlüsselungsschlüssel nicht geändert wurde.

### Storage-Klassen-Fehlkonfiguration

**Symptom**: PVCs bleiben im Status „Pending" stecken.
**Ursache**: Die Storage-Klasse ist nicht verfügbar, die Storage-Klasse unterstützt den angeforderten Zugriffsmodus nicht, oder es gibt nicht genügend Speicher.
**Lösung**: Überprüfen Sie die Storage-Klasse (`kubectl get storageclass`), verifizieren Sie, dass der Zugriffsmodus unterstützt wird, und überprüfen Sie die verfügbare Kapazität.

---

## Weiterführende Literatur

- [Systemarchitektur-Übersicht](/architecture/overview) — die vollständige Plattformarchitektur
- [Speicher- & Datenverwaltung in der Übersicht](/architecture/overview#backup-and-data-management) — Backup-Übersicht in der Systemarchitektur
- [Netzwerk- und Datenflussarchitektur](/architecture/networking-traffic-flow) — wie Verkehr Dienste erreicht
- [Sicherheitsarchitektur](/architecture/security) — wie Daten im Ruhezustand und im Transit geschützt werden
- [Sovereign Cloud: SCS vs Proxmox + K3s](/blog/scs-vs-proxmox-k3s) — Infrastrukturplattform-Vergleich einschließlich Speicher

---

*Daten sind der wertvollste Besitz der Einrichtung. Speicherarchitektur handelt nicht nur davon, wo Daten leben — es geht darum, sicherzustellen, dass Daten für die Lebensdauer der Plattform dauerhaft, wiederherstellbar und erweiterbar sind.*
