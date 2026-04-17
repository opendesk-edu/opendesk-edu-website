---
title: "Bereitstellungsleitfaden"
date: "2026-04-15"
description: "Schritt-für-Schritt-Anleitung für die Bereitstellung von openDesk Edu auf der Kubernetes-Infrastruktur Ihrer Hochschule."
categories: ["bereitstellung", "leitfaden"]
tags: ["bereitstellung", "kubernetes", "helm", "helmfile", "keycloak"]
---

# Bereitstellungsleitfaden

openDesk Edu ist ein modularer digitaler Arbeitsplatz, der speziell für Bildungseinrichtungen entwickelt wurde. Die Plattform bündelt Kollaborationstools, Learning-Management-Systeme und Office-Anwendungen in einer Umgebung, die auf Kubernetes läuft. Alle Dienste werden als Helm-Charts ausgeliefert und über helmfile orchestriert, sodass sich der gesamte Stack mit einem einzigen Befehl bereitstellen lässt.

Dieser Leitfaden beschreibt den vollständigen Bereitstellungsprozess von einem frischen Cluster bis zur laufenden Plattform mit Authentifizierung, Datensicherung und TLS-Zertifikaten.

## Voraussetzungen

Stellen Sie vor dem Beginn sicher, dass Folgendes vorhanden ist:

- **Kubernetes 1.28 oder neuer**. openDesk Edu verwendet CRDs und Pod Security Admission, die einen aktuellen Cluster voraussetzen. Managed-Angebote wie Hetzner Cloud Kubernetes, OVH Managed Kubernetes oder On-Premises-Cluster mit kubeadm werden unterstützt.
- **Helm 3** ist installiert und hat Zugriff auf den Cluster.
- **helmfile** ist installiert. Diese Orchestrierungsschicht liest Ihre Konfiguration und wendet alle Helm-Releases in der richtigen Reihenfolge an.
- **Eine Domain mit DNS-Zugriff**. Sie benötigen eine Basisdomain (z. B. `desk.hochschule-beispiel.de`) und die Möglichkeit, Subdomain-Einträge für jeden Dienst zu erstellen.
- **SAML-IdP-Zugang**. openDesk Edu authentifiziert Benutzer über Keycloak, das sich mit dem Identity Provider Ihrer Hochschule verbindet. In Deutschland bedeutet das in der Regel eine Mitgliedschaft in der DFN-AAI- oder eduGAIN-Föderation.
- **Mindestens 16 GB RAM und 4 CPU-Kerne**. Dies ist die Grundvoraussetzung für die Kern-Dienste von openDesk. Die Bildungsdienste (ILIAS, Moodle, BigBlueButton, OpenCloud) erfordern erheblich mehr Ressourcen. Für eine Produktionsumgebung mit allen aktivierten Diensten sollten Sie 32 GB RAM und 8 CPU-Kerne oder mehr einplanen.

## Schnellstart

Der schnellste Weg zu einer funktionierenden openDesk Edu-Installation umfasst vier Schritte.

### 1. Repository klonen

```bash
git clone https://git.opencode.de/opendesk/edu-deployment.git
cd edu-deployment
```

Dieses Repository enthält die helmfile-Konfiguration, Umgebungsdefinitionen und benutzerdefinierte Value-Overrides für alle openDesk Edu-Dienste.

### 2. Globale Konfiguration bearbeiten

Öffnen Sie `helmfile/environments/default/global.yaml.gotmpl` in einem Editor. Zumindest müssen Sie Ihre Domain festlegen und auswählen, welche Dienste aktiviert werden sollen:

```yaml
domain: desk.hochschule-beispiel.de

services:
  keycloak:
    enabled: true
  nextcloud:
    enabled: true
  ox:
    enabled: false
  sogo:
    enabled: false
  grommunio:
    enabled: true
  jitsi:
    enabled: false
  bbb:
    enabled: true
  ilias:
    enabled: true
  moodle:
    enabled: false
  opencloud:
    enabled: true
  excalidraw:
    enabled: true
  cryptpad:
    enabled: false
```

Jeder Dienst lässt sich unabhängig ein- und ausschalten. Die Konfigurationsdatei verwendet Go-Template-Syntax (`.gotmpl`), sodass gemeinsame Werte wie die Domain in allen Dienstdefinitionen referenziert werden können.

### 3. Bereitstellung starten

```bash
helmfile -e default apply
```

helmfile liest die Umgebungskonfiguration, löst alle Abhängigkeiten zwischen den Diensten auf und wendet jeden Helm-Chart in der richtigen Reihenfolge an. Keycloak wird zuerst bereitgestellt, da andere Dienste auf die Authentifizierung darüber angewiesen sind. Planen Sie 10 bis 20 Minuten auf einem frischen Cluster ein, je nachdem welche Dienste aktiviert sind und wie schnell Ihre Netzwerkverbindung ist.

### 4. Auf Dienste zugreifen

Nach Abschluss der Bereitstellung ist jeder Dienst unter seiner Subdomain erreichbar:

| Dienst | URL |
|--------|-----|
| Keycloak Admin | `https://keycloak.desk.hochschule-beispiel.de` |
| Nextcloud | `https://nextcloud.desk.hochschule-beispiel.de` |
| Grommunio | `https://grommunio.desk.hochschule-beispiel.de` |
| BigBlueButton | `https://bbb.desk.hochschule-beispiel.de` |
| ILIAS | `https://ilias.desk.hochschule-beispiel.de` |
| OpenCloud | `https://opencloud.desk.hochschule-beispiel.de` |

Die Keycloak-Admin-Zugangsdaten werden bei der ersten Bereitstellung erzeugt und in einem Kubernetes-Secret gespeichert. Rufen Sie sie ab mit:

```bash
kubectl get secret -n opendesk keycloak-admin -o jsonpath='{.data.password}' | base64 -d
```

## Konfiguration

Die Datei `helmfile/environments/default/global.yaml.gotmpl` ist die zentrale Konfiguration für Ihre gesamte openDesk Edu-Installation. Jeder Dienst liest seine Werte aus dieser Datei, und Sie können hier jeden Helm-Chart-Standardwert überschreiben.

### Domain und Ingress

Das Feld `domain` legt die Basis-URL für alle Dienste fest. Jeder Chart konstruiert seine eigene Ingress-Regel, indem er seinen Dienstnamen (z. B. `nextcloud`) an die Basisdomain anhängt. Wenn Sie einen Reverse Proxy oder einen externen Load Balancer verwenden, können Sie auch `ingress.className` setzen, um auf Ihren Ingress-Controller zu verweisen.

### Keycloak-Einstellungen

Keycloak fungiert als zentraler Identity Broker. In der globalen Konfiguration können Sie den Admin-Benutzernamen, den Realm-Namen und das Standard-Theme festlegen. Authentifizierungsabläufe und Client-Registrierungen für jeden Dienst werden automatisch von den Helm-Charts übernommen.

### Alternative Komponenten

openDesk Edu bietet mehrere Implementierungen für verschiedene Dienstkategorien an. Sie wählen aus, welche aktiviert werden soll, und die Konfigurationsdatei stellt sicher, dass pro Kategorie nur eine Komponente aktiv ist:

- **E-Mail**: Open-Xchange (OX), SOGo oder Grommunio
- **Videokonferenzen**: Jitsi Meet oder BigBlueButton
- **Dateispeicher**: Nextcloud oder OpenCloud
- **Whiteboard**: Excalidraw oder CryptPad

Setzen Sie `enabled: true` bei der gewünschten Komponente und `enabled: false` bei den anderen in derselben Kategorie. Aktivieren Sie niemals zwei Alternativen gleichzeitig, da diese sich auf Ingress-Routen und Keycloak-Client-IDs überschneiden würden.

## Authentifizierungseinrichtung

Keycloak dient als zentraler Identity Provider für alle openDesk Edu-Dienste. Es unterstützt sowohl SAML 2.0 als auch OpenID Connect (OIDC), was die Integration in Ihre bestehende Hochschulinfrastruktur und Single Sign-On über alle Anwendungen hinweg ermöglicht.

### Verbindung mit dem Hochschul-IdP

Die meisten deutschen Hochschulen sind Teil der DFN-AAI-Föderation, die dem weltweiten eduGAIN-Netzwerk angehört. Keycloak verbindet sich über eine SAML 2.0-IdP-Bindung mit diesen Föderationen.

So konfigurieren Sie die Verbindung:

1. Melden Sie sich an der Keycloak-Admin-Konsole unter `https://keycloak.desk.hochschule-beispiel.de` an.
2. Navigieren Sie zu Ihrem Realm und erstellen Sie einen neuen Identity Provider vom Typ SAML 2.0.
3. Geben Sie die Metadaten-URL des IdP Ihrer Hochschule ein (bereitgestellt durch Ihren DFN-AAI-Föderationsbetreiber).
4. Konfigurieren Sie die SAML Entity ID so, dass sie dem bei Ihrer Föderation registrierten Wert entspricht.
5. Aktivieren Sie den Identity Provider und testen Sie den Login-Flow.

### Protokollunterstützung

Jeder nachgelagerte Dienst verwendet das Protokoll, das am besten passt:

- **SAML 2.0**: Wird von ILIAS und Moodle über die Shibboleth Service Provider (SP) Konfiguration verwendet. Diese LMS-Plattformen erwarten SAML-Assertions von einem vertrauenswürdigen IdP, den Keycloak bereitstellt.
- **OIDC**: Wird von Nextcloud, OpenCloud, Grommunio, BigBlueButton und Excalidraw verwendet. OIDC ist das modernere Protokoll und lässt sich einfacher für Webanwendungen konfigurieren.

### Shibboleth SP für LMS-Dienste

ILIAS und Moodle nutzen Shibboleth als Service Provider, um SAML-Assertions von Keycloak zu empfangen. Die openDesk Edu Helm-Charts enthalten Shibboleth-SP-Sidecar-Container für diese Dienste. Die SP-Konfiguration wird automatisch auf Basis der Keycloak-Realm-Einstellungen erzeugt, sodass Sie keine Shibboleth-XML-Dateien manuell bearbeiten müssen.

## Komponentenauswahl

openDesk Edu ist modular aufgebaut. Sie aktivieren nur die Dienste, die Ihre Einrichtung benötigt. Das hält den Ressourcenverbrauch überschaubar und vereinfacht die Wartung. Alle Dienste werden über `global.yaml.gotmpl` gesteuert.

### Kern-Dienste

- **Keycloak**: Zwingend erforderlich. Dies ist das Authentifizierungs-Rückgrat und kann nicht deaktiviert werden.
- **Element Web (Matrix)**: Der Messaging- und Kollaborations-Hub. Standardmäßig aktiviert.

### E-Mail-Alternativen

Wählen Sie eine aus:

- **Open-Xchange (OX)**: Funktionsreiche Groupware mit Kalender, Kontakten und E-Mail. Geeignet für Einrichtungen, die eine enge Integration mit anderen OX-Komponenten benötigen.
- **SOGo**: Leichtgewichtige Groupware mit guter ActiveSync-Unterstützung. Eignet sich gut für kleinere Bereitstellungen.
- **Grommunio**: Vollständiger Microsoft-Exchange-Ersatz mit nativer Outlook-Kompatibilität. Speichert Maildaten in MariaDB.

### Videokonferenzen

Wählen Sie eine aus:

- **Jitsi Meet**: Leichtgewichtige Peer-to-Peer-Videokonferenz. Geringerer Ressourcenbedarf. Geeignet für Meetings bis ca. 25 Teilnehmer.
- **BigBlueButton (BBB)**: Speziell für den Online-Unterricht entwickelt. Unterstützt Aufzeichnung, Breakout-Räume, Whiteboards und Präsentations-Upload. Benötigt mehr Ressourcen, ist aber der Standard für virtuelle Klassenzimmer.

### Dateispeicher

Wählen Sie einen aus:

- **Nextcloud**: Ausgereift und weit verbreitet. Umfangreiches App-Ökosystem für Dokumentbearbeitung, Kalender und Aufgabenverwaltung.
- **OpenCloud**: Nextcloud-Fork mit zusätzlichen Enterprise-Features und engerer Integration in den openDesk-Stack.

### Whiteboard

Wählen Sie eines aus:

- **Excalidraw**: Einfaches, intuitives kollaboratives Whiteboard. Ideal für schnelle Skizzen und Brainstorming.
- **CryptPad**: Ende-zu-Ende-verschlüsselte kollaborative Suite inklusive Whiteboard. Stärkere Datenschutzgarantien.

### Bildungsdienste

- **ILIAS**: Learning-Management-System, das an deutschen Hochschulen weit verbreitet ist. Unterstützt SCORM, LTI und integrierte Autorenwerkzeuge.
- **Moodle**: Das weltweit beliebteste LMS. Umfangreiches Plugin-Ökosystem und große Community.

## Backup-Konfiguration

openDesk Edu verwendet den k8up-Operator mit restic als Basis. k8up läuft als Kubernetes-Controller und erstellt zeitgesteuerte Backups gemäß `Schedule`-CRDs, die in den Helm-Charts definiert sind.

### Was gesichert wird

Die Backup-Konfiguration deckt folgende Daten ab:

- **LMS-Inhalte**: ILIAS-Datenverzeichnisse und Moodle-Dateispeicher, einschließlich hochgeladener Kursmaterialien, Benutzerabgaben und SCORM-Pakete.
- **BigBlueButton-Aufzeichnungen**: Meeting-Aufzeichnungen auf persistenten Volumes. Diese können groß werden, daher sollten Sie den Speicherverbrauch überwachen.
- **Nextcloud / OpenCloud Dateien**: Benutzerdateien, geteilte Ordner und App-Daten auf persistenten Volumes.
- **Grommunio-Daten**: MariaDB-Datenbank-Dumps mit E-Mail-, Kalender- und Kontaktdaten aller Grommunio-Benutzer.

### Restic-Repository

Backups werden in einem restic-Repository gespeichert. Sie konfigurieren den Speicherort des Repositories (S3-kompatibler Speicher wird für Ausfallsicherheit empfohlen) und das Verschlüsselungspasswort in der globalen Konfiguration. Das erste Backup dauert je nach Datenvolumen. Folgende Läufe nutzen die Deduplizierung von restic und übertragen nur geänderte Daten.

### Wiederherstellung

Um ein Backup wiederherzustellen, verwenden Sie die k8up `Restore`-CRD. Verweisen Sie auf einen bestimmten Snapshot, und der Operator kümmert sich um den Rest, indem er die wiederhergestellten Daten in die entsprechenden Pods einhängt.

## Zertifikatsverwaltung

openDesk Edu verwendet openDesk Certificates von der Bundesdruckerei für TLS. Dieser Dienst bietet automatische Bereitstellung und Verlängerung von Zertifikaten für alle Service-Subdomains.

Der Zertifikatsoperator läuft als Kubernetes-Controller. Er fordert Zertifikate für jede Ingress-Ressource an und erneuert diese vor Ablauf. Sie müssen Zertifikate nicht manuell verwalten oder externe ACME-Clients einrichten.

Wenn Ihre Einrichtung Zertifikate von einer anderen CA benötigt, können Sie den Zertifikatsoperator so konfigurieren, dass er Ihren bevorzugten Anbieter verwendet. Die Ingress-Ressourcen referenzieren die Zertifikate über Kubernetes-TLS-Secrets, sodass die nachgelagerten Dienste keine zertifikatsbezogene Konfiguration benötigen.

## Nächste Schritte

- Lesen Sie die **Architekturübersicht**, um zu verstehen, wie die Dienste interagieren und wie Daten zwischen ihnen fließen.
- Besuchen Sie die einzelnen **Komponentenseiten** für dienstspezifische Konfigurationsoptionen, Ressourcenabstimmung und Integrationsanleitungen.
- Konsultieren Sie den Bereich **Fehlerbehebung**, wenn Sie bei der Bereitstellung auf Probleme stoßen.
