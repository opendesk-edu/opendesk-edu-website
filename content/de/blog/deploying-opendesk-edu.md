---
title: "openDesk Edu auf Ihrer Hochschulinfrastruktur deployen"
date: "2026-04-18"
description: "Eine Schritt-für-Schritt-Anleitung zum Deployment von openDesk Edu — vom Aufsetzen des Kubernetes-Clusters bis zur Konfiguration der SAML-Föderation mit DFN-AAI und eduGAIN."
categories: ["Tutorial"]
tags: ["deployment", "infrastruktur", "kubernetes"]
---

# openDesk Edu auf Ihrer Hochschulinfrastruktur deployen

Dieser Leitfaden führt Sie durch das Deployment von openDesk Edu auf der Kubernetes-Infrastruktur Ihrer Hochschule. Am Ende verfügen Sie über einen voll funktionsfähigen digitalen Arbeitsplatz mit 25 integrierten Diensten — alle verbunden durch ein einheitliches Keycloak-SSO.

## Voraussetzungen

Bevor Sie beginnen, stellen Sie sicher, dass Folgendes vorhanden ist:

- **Kubernetes-Cluster** — Version 1.28 oder neuer. Dies kann ein Bare-Metal-Cluster, ein Cloud-Angebot oder eine On-Premises-Installation wie Proxmox VE oder OpenStack sein.
- **Helm 3** — der Paketmanager für Kubernetes. Installieren Sie ihn von [helm.sh](https://helm.sh).
- **Helmfile** — die Orchestrierungsschicht, die alle openDesk-Edu-Charts verwaltet. Installieren Sie es von [helmfile.readthedocs.io](https://helmfile.readthedocs.io/).
- **Eine Domain und DNS-Einträge** — Sie benötigen eine Basisdomain (z. B. `desk.hochschule-beispiel.de`) mit Wildcard-DNS, der auf Ihren Ingress-Controller zeigt. TLS-Zertifikate werden automatisch bereitgestellt.
- **Ausreichende Ressourcen** — Planen Sie mindestens 8 CPU-Kerne und 16 GB RAM für ein Produktionsdeployment ein. Der Speicherbedarf hängt von der Benutzerzahl und den aktivierten Diensten ab.

## Schritt 1: Repository klonen

Klonen Sie zunächst das openDesk-Edu-Repository:

```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
cd opendesk-edu
```

Werfen Sie einen Blick auf die Verzeichnisstruktur. Die wichtigsten Verzeichnisse sind:

- `helmfile/` — enthält alle Helmfile-Konfigurationen und Umgebungen
- `charts/` — individuelle Helm-Charts für jeden Dienst
- `docs/` — detaillierte Dokumentation zu Konfiguration, Skalierung und Monitoring

## Schritt 2: Werte konfigurieren

Die zentrale Konfigurationsdatei ist `helmfile/environments/default/global.yaml.gotmpl`. Diese Go-Templatedatei steuert die Einstellungen für alle Dienste im Stack. Öffnen Sie sie in Ihrem Editor und passen Sie Folgendes an:

**Domain-Konfiguration:**

```yaml
global:
  domain: "desk.hochschule-beispiel.de"
```

**E-Mail-Einstellungen** — erforderlich für Groupware und Benachrichtigungsdienste:

```yaml
global:
  mail:
    host: "smtp.hochschule-beispiel.de"
    port: 587
    fromAddress: "noreply@hochschule-beispiel.de"
```

**Storage-Class** — setzen Sie diesen Wert entsprechend dem Speicheranbieter Ihres Clusters:

```yaml
global:
  storageClass: "ceph-rbd"
```

**Dienstauswahl** — Sie können einzelne Dienste aktivieren oder deaktivieren. Wenn Ihre Hochschule bereits Moodle einsetzt, können Sie es deaktivieren und ILIAS beibehalten:

```yaml
services:
  ilias:
    enabled: true
  moodle:
    enabled: false
  bigbluebutton:
    enabled: true
```

Das Templatingsystem verteilt diese Werte an alle abhängigen Charts, sodass Sie keine individuellen Chart-Wertedateien bearbeiten müssen.

## Schritt 3: Deployment mit Helmfile

Führen Sie das Deployment mit Ihrer Konfiguration durch:

```bash
helmfile -e default apply
```

Dieser einzelne Befehl rendert alle Helm-Charts mit Ihrer Konfiguration, löst die Abhängigkeitsreihenfolge auf und deployt den gesamten Stack in Ihren Cluster. Helmfile steuert die Rollout-Reihenfolge — Infrastrukturdienste wie Keycloak und der Ingress-Controller werden zuerst deployt, gefolgt von den Anwendungsdiensten.

Das initiale Deployment dauert in der Regel 10 bis 20 Minuten, je nach Kapazität und Netzwerkgeschwindigkeit Ihres Clusters. Den Fortschritt können Sie überwachen mit:

```bash
kubectl get pods -n opendesk -w
```

Warten Sie, bis alle Pods den Status `Running` anzeigen, bevor Sie fortfahren.

## Schritt 4: SAML/SSO mit Keycloak konfigurieren

openDesk Edu verwendet Keycloak als zentralen Identity Provider. Für Hochschuldeployments empfiehlt sich die Integration mit der bestehenden SAML-Föderation Ihrer Einrichtung — DFN-AAI in Deutschland oder eduGAIN international.

**Konfigurieren Sie den SAML-Identity Provider in Keycloak:**

1. Greifen Sie auf die Keycloak-Admin-Konsole unter `https://keycloak.desk.hochschule-beispiel.de` zu
2. Navigieren Sie zu Ihrem Realm und fügen Sie einen neuen SAML-Identity Provider hinzu
3. Importieren Sie Ihre Föderationsmetadaten-XML (verfügbar über Ihre DFN-AAI- oder eduGAIN-Verwaltungsoberfläche)
4. Ordnen Sie SAML-Attribute Keycloak-Benutzerattributen zu:

| SAML-Attribut | Keycloak-Zuordnung | Zweck |
|---|---|---|
| `eduPersonPrincipalName` | username | Eindeutiger Identifikator |
| `eduPersonAffiliation` | roles | Student/Mitarbeiter/Dozent |
| `eduPersonEntitlement` | groups | Kurs- und Berechtigungsgruppen |
| `mail` | email | Kontaktadresse |

**Für ILIAS, Moodle und BigBlueButton** deployt openDesk Edu Shibboleth als SAML-Proxy. Diese Dienste erhalten ihre Attribute über Shibboleth anstatt direkt von Keycloak. Der Proxy übernimmt das Attribut-Filtering und die dienstspezifischen Richtlinien, wodurch Ihre Föderationsmetadaten sauber bleiben.

Nach der Konfiguration des Identity Providers testen Sie den Login-Flow, indem Sie auf das Nubus-Portal zugreifen. Sie sollten zur Anmeldeseite Ihrer Einrichtung weitergeleitet und mit Ihren Föderationsattributen zum Portal zurückkehren.

## Schritt 5: Deployment überprüfen

Gehen Sie diese Checkliste durch, um zu bestätigen, dass alles funktioniert:

1. **Portalzugriff** — öffnen Sie `https://desk.hochschule-beispiel.de` im Browser. Das Nubus-Portal sollte mit allen aktivierten Diensten geladen werden.
2. **SSO-Login** — klicken Sie auf einen beliebigen Dienst. Sie sollten sich über Keycloak authentifizieren, ohne erneut nach Anmeldeinformationen gefragt zu werden.
3. **Dateifreigabe** — erstellen Sie eine Testdatei in Nextcloud oder OpenCloud und prüfen Sie, ob sie über Seitenaktualisierungen hinweg erhalten bleibt.
4. **Videokonferenzen** — starten Sie einen Testmeeting in Jitsi oder BigBlueButton und prüfen Sie Audio und Video.
5. **LMS-Zugriff** — loggen Sie sich in ILIAS oder Moodle ein und bestätigen Sie, dass Ihre Föderationsattribute (Name, E-Mail, Rolle) korrekt angezeigt werden.

Wenn ein Dienst Fehler anzeigt, prüfen Sie die Pod-Logs:

```bash
kubectl logs -n opendesk -l app.kubernetes.io/name=<dienst-name> --tail=50
```

## Fehlerbehebung

Hier sind die häufigsten Probleme und ihre Lösungen:

**Pods bleiben im Status `Pending`** — meist ein Ressourcen- oder Speicherproblem. Prüfen Sie die Knotenkapazität mit `kubectl describe pod <name>` und stellen Sie sicher, dass Ihre Storage-Class verfügbar ist.

**Zertifikatsfehler** — der openDesk-Certificates-Operator verwaltet TLS automatisch. Wenn Zertifikate nicht bereitgestellt werden können, überprüfen Sie die DNS-Einträge Ihrer Domain und stellen Sie sicher, dass der Operator die Bundesdruckerei-CA erreichen kann. Alternativ können Sie cert-manager mit Let's Encrypt als Fallback konfigurieren.

**SSO-Weiterleitungsschleife** — dies bedeutet in der Regel, dass die SAML-Identity-Provider-Metadaten falsch konfiguriert sind oder die Assertion Consumer Service URL nicht mit Ihrer Domain übereinstimmt. Überprüfen Sie die Keycloak-Identity-Provider-Einstellungen und stellen Sie sicher, dass Ihre Dienst-URLs HTTPS verwenden.

**Hoher Speicherverbrauch** — BigBlueButton und Collabora sind die ressourcenintensivsten Dienste. Wenn Sie auf begrenzter Hardware arbeiten, deaktivieren Sie BigBlueButton und verwenden Sie stattdessen Jitsi, oder setzen Sie Ressourcenlimits in der globalen Konfiguration.

**Backup-Fehler** — openDesk Edu verwendet k8up für automatisierte Backups. Wenn Backups fehlschlagen, prüfen Sie die k8up-Operator-Logs und stellen Sie sicher, dass Ihr S3-kompatibler Speicherendpunkt aus dem Cluster erreichbar ist.

## Nächste Schritte

Sobald Ihr Deployment läuft, sollten Sie folgende Schritte in Betracht ziehen:

- Richten Sie Monitoring mit Prometheus und Grafana-Dashboards für die Dienstgesundheit ein
- Konfigurieren Sie Backup-Zeitpläne und testen Sie Wiederherstellungsverfahren
- Passen Sie das Portal-Design an das Branding Ihrer Hochschule an
- Prüfen Sie die Dokumentation zu Berechtigungen, um rollenbasierte Zugriffskontrolle einzurichten

Weitere Details finden Sie in der vollständigen Dokumentation unter [codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu).
