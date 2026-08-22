---
title: "Backup & Restore bei openDesk Edu – der 3-Tier-Ansatz für Hochschul-Datenhoheit"
date: "2026-08-22"
description: "Datenhoheit entscheidet sich beim Backup: openDesk Edu sichert mit k8up und einem 3-Tier-Modell (RPO/RTO/Retention) kritische Dienste auf S3, verifiziert Restores im Produktivbetrieb und zeigt ehrlich, wo noch Lücken sind – 29 RWO-PVCs warten auf CSI-Snapshots."
categories: ["Betrieb", "Datensouveränität"]
tags: ["backup", "restore", "k8up", "restic", "s3", "ceph", "csi-snapshots", "rpo", "rto", "hochschule", "datenhoheit"]
image: "/static/blog/backup-restore-3-tier-teaser.svg"
---

# Backup & Restore bei openDesk Edu – der 3-Tier-Ansatz für Hochschul-Datenhoheit

> **Die These:** Datenhoheit entscheidet sich nicht beim Login, sondern beim Backup. Wer seine Daten nicht im Ernstfall zurückbekommt, besitzt sie nicht wirklich – egal wie souverän die Plattform sonst ist.
>
> **Die Realität:** Eine Hochschulplattform aus über 20 Open-Source-Diensten hat sehr unterschiedliche Datenklassen: Schlüssel-Wert-Speicher mit Ausfallfolge in Sekunden, Dateien mit Terabyte-Volumen und experimentelle KI-Sandboxes. Eine einzige Backup-Strategie passt auf keine dieser Klassen.
>
> **Unser Ansatz:** Statt eines Einheits-Backups betreiben wir ein **3-Tier-Modell** – Datenklassen mit eigenem RPO, RTO und eigener Retention, umgesetzt mit dem k8up-Operator auf Kubernetes, ruhend auf **Ceph** und **S3**, mit verifizierten Restores und einer ehrlichen Gap-Analyse.

## Warum Backup die eigentliche Datenhoheits-Frage ist

Microsoft 365, Google Workspace oder Zoom zu verlassen ist der sichtbare Teil der Souveränitätswende. Der unsichtbare Teil beginnt dort, wo die Entscheidung aufhört zu glänzen: im Rechenzentrum, um 3 Uhr nachts, vor einem defekten Speichercontroller oder einer versehentlich gelöschten Tabelle.

Datenhoheit im juristischen Sinne heißt: Der Verantwortliche kann bestimmen, **wo** Daten liegen und **wer** Zugriff hat. Datenhoheit im betrieblichen Sinne heißt: Der Verantwortliche bekommt seine Daten auch dann zurück, **wenn etwas schiefgeht**. Ausfälle sind keine Frage von „ob", sondern von „wann" – und genau dafür baut man ein Backup-System, das mehr ist als ein Perioden-Job, der fröhlich in ein Speicherloch schreibt.

Für Hochschulen kommt hinzu, dass viele Daten **unwiederbringlich** sind: Prüfungsleistungen, Forschungsdaten, Qualifikationsarbeiten, E-Mail-Verläufe über Semester. Ein vergessener Rechencluster baut sich neu; eine verlorene Doktorarbeit nicht. Deshalb gehört die Backup-Strategie neben SSO und Monitoring zu den drei Säulen eines produktiv betriebenen offenen Campus.

## k8up: Backup als GitOps-native Ressource

Statt Cronjobs auf einer VM haben wir Backup bei openDesk Edu als Teil der Kubernetes-Plattform modelliert – mit **k8up** (v2.13.0), dem Backup-Operator des K8up-Projekts:

```yaml
apiVersion: k8up.io/v1
kind: Schedule
metadata:
  name: backup-live
spec:
  backup:
    schedule: "15 2 * * *"          # Nacht ab 02:15
    backend:
      repoPasswordSecretRef:
        name: backup-credentials
        key: password
      s3:
        endpoint: s3.hrz.uni-marburg.de
        bucket: backups
        accessKeyIDSecretRef:
          name: backup-credentials
          key: accessKey
        secretAccessKeySecretRef:
          name: backup-credentials
          key: secretKey
```

Der Vorteil ist architektonischer Natur: Backups sind **deklariert, versioniert und reviewbar** – sie liegen als YAML im Git-Repository neben den Services, die sie sichern. Die nächtliche Sicherung ist damit genauso nachvollziehbar wie der Deployment-Prozess. **Restic** übernimmt dabei die eigentliche Datenspeicherung: dedupliziert, verschlüsselt, mit Snapshots, die über Jahre hinweg konsistent bleiben. Der Zielspeicher ist ein **S3-Bucket** (im Betrieb: `s3.hrz.uni-marburg.de`), der extern zum Cluster liegt – so überlebt das Backup auch einen Totalausfall der Plattform selbst.

Im Produktiveinsatz sichert k8up aktuell **6 RWX-PVCs** direkt auf S3 – darunter die geteilten Volumes von Nextcloud, OpenProject und den Groupware-Diensten. Ein **Grafana-Backup-Dashboard** macht den Zustand der Schedules und Snapshots sichtbar, statt sich auf „geht schon" zu verlassen.

## Das 3-Tier-Modell: RPO, RTO und Retention pro Datenklasse

Der Kern unseres Ansatzes ist die Einsicht, dass „ein Backup" für eine Plattform dieser Größe keine sinnvolle Einheit ist. Die Daten von openDesk Edu unterscheiden sich fundamental in drei Punkten:

- **Wie viel Verlust ist akzeptabel?** (RPO – Recovery Point Objective)
- **Wie schnell muss es wieder laufen?** (RTO – Recovery Time Objective)
- **Wie lange muss es aufbewahrt werden?** (Retention)

Deshalb haben wir ein **3-Tier-Modell** definiert:

| Tier | Beispiel-Dienste | RPO | RTO | Retention |
|:-----|:-----------------|:----|:----|:----------|
| **A – kritisch** | Keycloak, PostgreSQL, Redis, MariaDB, MinIO | 1 h | 2 h | 30 Tage |
| **B – wichtig** | Nextcloud, OX App Suite, OpenProject, ILIAS, Moodle | 1 h | 4 h | 14 Tage |
| **C – experimentell** | JupyterHub, Ollama, Dask | 24 h | 1 Tag | 7 Tage |

### Tier A – das Identitäts- und Datenherz

Identity-Provider (Keycloak), Datenbanken (PostgreSQL, MariaDB, Redis) und der Objektspeicher (MinIO) sind das Herz der Plattform. Fällt Keycloak aus, fällt jede Anmeldung; fällt die Konfigurationsdatenbank, verlieren die Dienste ihre Identität. Hier gilt: **stündliche Sicherung, schnelle Wiederherstellung, 30 Tage Aufbewahrung** – denn gerade bei Identitätssystemen will man im Zweifel weit zurückgreifen können, etwa um fehlerhafte Provisionierungsaktionen rückgängig zu machen.

### Tier B – die kollaborative Arbeitsfläche

Nextcloud, OX App Suite, OpenProject, ILIAS und Moodle bilden die eigentliche Arbeitsfläche der Hochschule. Die Wiederherstellung ist aufwendiger als bei einer Datenbank – Dateien mit Terabyte-Volumen lassen sich nicht in zwei Stunden „einspielen". Mit **stündlichem RPO und 4 Stunden RTO** balancieren wir den Aufwand: Kein Arbeitstag geht verloren, die Wiederanlaufzeit bleibt planbar. 14 Tage Retention decken die typischen Fehlerfenster ab (versehentliches Löschen, veralteter Client, fehlerhaftes Update).

### Tier C – Raum zum Experimentieren

JupyterHub, Ollama und Dask sind bewusst als **Wegwerf-Umgebungen** ausgelegt. Was hier verloren geht, ist reproduzierbar – aus Git, aus Nix, aus einer Anleitung. **24-Stunden-RPO** heißt: Ein verlorener Tag Experimentierdaten ist verkraftbar, wenn er die Infrastruktur vor unnötiger Last bewahrt. Diese Einordnung ist eine bewusste Entscheidung – und sie spart Ressourcen für die Tiers, in denen Daten wirklich zählen.

## Die RWO-Herausforderung: 29 PVCs, die nicht „einfach so" gesichert werden können

So weit, so ordentlich - und jetzt die ehrliche Lücke. Von den PVCs der Plattform sind aktuell **29 nicht durch k8up gesichert**, weil sie **RWO** (ReadWriteOnce) sind. Ein RWO-Volume ist an einen einzelnen Node gebunden und kann nicht parallel von einem Backup-Pod an einem anderen Ort gemountet werden. Der klassische „da fährt man mal ein Volume ran“-Ansatz scheitert strukturell.

Zwei Wege stehen zur Wahl, und beide sind dokumentiert:

**Option A – CSI VolumeSnapshots (bevorzugt).** Ceph stellt über seinen CSI-Treiber `rbd.csi.ceph.com` VolumeSnapshots bereit. Damit lassen sich **crash-konsistente** Snapshots der RWO-Volumes automatisiert erstellen – ohne Mount, ohne Ausfall:

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: csi-rbd-snapclass
  annotations:
    k8up.io/snapshot-class: "true"
driver: rbd.csi.ceph.com
deletionPolicy: Delete
```

**Option B – Per-Node-Schedules.** Wo kein Snapshot-Class existiert, kann jeder RWO-PVC mit einem eigenen k8up-Schedule gesichert werden, der per `nodeSelector` auf genau den Node zielt, an den das Volume gebunden ist. Mehr Aufwand, dafür ohne Abhängigkeit vom Storage-Backend.

Die Entscheidung zwischen A und B hängt an einer einzigen Voraussetzung: Existiert eine `VolumeSnapshotClass` im Cluster? Falls ja, ist der CSI-Weg die klare Empfehlung – und die 29 PVCs können aus dem Exklusions-Wartungsmodus (`k8up.io/exclude: "true"`) in den geregelten Betrieb.

## Restore-Verifikation: Der Test, der Vertrauen schafft

Ein Backup, das nie zurückgespielt wird, ist eine Meinung. Wir verifizieren Restores im Betrieb – auf der Produktionsplattform **Maui** wurden **33 Snapshots** erfolgreich verifiziert: Datenbanken zurückgespielt und geprüft, Dateipfade auf Vollständigkeit kontrolliert, Dienste nach dem Restore auf Funktion getestet.

Dabei hilft, dass k8up Restores ebenfalls als native Ressourcen modelliert:

```yaml
apiVersion: k8up.io/v1
kind: Restore
metadata:
  name: restore-verify
spec:
  restoreMethod:
    folder:
      claimName: restore-target
  backend:
    repoPasswordSecretRef:
      name: backup-credentials
      key: password
    s3:
      endpoint: s3.hrz.uni-marburg.de
      bucket: backups
      accessKeyIDSecretRef:
        name: backup-credentials
        key: accessKey
      secretAccessKeySecretRef:
        name: backup-credentials
        key: secretKey
```

Die Regel für den breiten Betrieb lautet: **Jeder Schedule, dessen Wiederherstellung nicht mindestens einmal pro Quartal in einem Testziel getestet wurde, existiert nur auf dem Papier.** Snapshots zu zählen ist schön, sie erfolgreich zurückzuspielen ist Beweis genug.

## Ausblick: Vom Cluster-Backup zum Disaster-Recovery

Das aktuelle Setup sichert den Cluster – und zwar bewusst **extern** ans S3-Ziel. Der nächste Schritt ist die Frage, was passiert, wenn nicht nur ein Dienst, sondern der Standort ausfällt. Drei Bausteine stehen dafür auf der Agenda:

1. **RWO-Abdeckung schließen:** CSI-Snapshots für die 29 RWO-PVCs (Option A), damit jede Datenklasse des Clusters einen geregelten Pfad hat.
2. **Georedundanz:** Replikation der S3-Buckets in einen zweiten Standort oder ein zweites Rechenzentrum – gegen Brand, Wasser und den einen ungünstigen Moment.
3. **Betriebshandbuch:** Restore-Runbooks für jeden Tier, mit Zielzeiten, Verantwortlichkeiten und einem jährlich geübten DR-Tag, an dem der komplette Cluster auf einem leeren Ziel aufgebaut wird.

Für Entscheider bei der Ablösung von Microsoft 365 ist der Kern der Botschaft simpel: **Was Sie bei M365 über Verträge erkaufen müssen, bauen Sie bei openDesk Edu selbst – und es gehört Ihnen.** Die Backup-Strategie ist dabei kein Appendix, sondern ein First-Class-Baustein der Plattform: deklariert im Git-Repo, verifiziert im Betrieb, ehrlich dokumentiert.

## Fazit

Backup & Restore bei openDesk Edu ist kein Einheitsprodukt, sondern ein **abgestuftes System mit klaren Entscheidungen**:

- **k8up** macht Backups zu GitOps-nativen, reviewbaren Ressourcen statt zu vergessenen Cronjobs.
- **Restic + S3** liefern deduplizierte, verschlüsselte, externe Snapshots.
- Das **3-Tier-Modell** verteilt RPO, RTO und Retention sinnvoll auf Identität, Kollaboration und Experimentierraum.
- **Verifizierte Restores** (33 Snapshots) machen aus Papier Praxis.
- Die **RWO-Lücke** (29 PVCs) ist benannt, mit zwei dokumentierten Lösungswegen versehen – und der nächste Schritt ist die Umsetzung per CSI-Snapshots.

Datenhoheit ist keine Rechtsfrage, die man abhakt. Sie ist eine Betriebsleistung, die man beweist – und der Beweis ist der erfolgreich zurückgespielte Snapshot.

---

## Links

- **k8up** – der Backup-Operator: [k8up.io](https://k8up.io)
- **Restic** – dedupliziertes, verschlüsseltes Backup: [restic.net](https://restic.net)
- **Ceph** – Storage-Basis des Clusters: [ceph.io](https://ceph.io)
- **Community of Practice** – Backup-Infrastruktur-Session: [Codeberg](https://codeberg.org/opendesk-edu/opendesk-cop)
- **openDesk Edu**: [opendesk-edu.org](https://opendesk-edu.org/)
