---
title: "Erweiterung des Intercom-Service: Ein Aufruf an ZenDiS und die Community für gemeinsame Entwicklungsmuster"
date: "2026-06-27"
description: "Wie wir den openDesk intercom-service erweitert haben, um OpenCloud, SOGo und ILIAS zu unterstützen, und warum wir ZenDiS und die Community dringend bitten, einen formellen Konsens über gemeinsame Entwicklungsmuster zu etablieren."
categories: ["Engineering", "Community", "Open Source"]
tags: ["intercom-service", "zendis", "opendesk", "erweiterung", "community", "governance"]
author: "Tobias Weiß und openDesk Edu Mitwirkende"
---

# Erweiterung des Intercom-Service: Ein Aufruf an ZenDiS und die Community für gemeinsame Entwicklungsmuster

## Einleitung

Der **intercom-service** (ICS) ist ein kleines, aber kritisches Infrastrukturelement im openDesk-Ökosystem. Er fungiert als Vermittler, der browserbasierte Anwendungs-zu-Anwendungs-Kommunikation ermöglicht – Datei-Auswahl, Videokonferenz-Integration, Single Sign-On zwischen Apps und Portal-Navigation.

Als wir uns anschickten, **openDesk Edu** aufzubauen, stellten wir fest, dass der Upstream-intercom-service (gepflegt von Univention und bereitgestellt von ZenDiS) hauptsächlich für **openDesk CE** (Community Edition) konzipiert war, mit Fokus auf **Nextcloud, OX App Suite und Matrix** als primäre Integrationen.

Für **openDesk Edu** benötigten wir zusätzliche Integrationen für **OpenCloud, SOGo und ILIAS**. Dies ist unsere Geschichte über die Erweiterung des intercom-service – und unser dringender Aufruf für einen **formellen Konsens zwischen ZenDiS und der Community** über gemeinsame Entwicklungsmuster.

## Der Intercom-Service: Was er tut

Der intercom-service ist ein leichtgewichtiger Proxy/Broker, der im Browser-Kontext läuft. Er ermöglicht Apps:

- **Datei-Auswahl**: Eine Datei aus Nextcloud/OpenCloud in einer anderen App öffnen
- **Silent Login**: OIDC-Tokens zwischen Apps ohne Benutzerinteraktion weitergeben
- **Portal-Navigation**: Das zentrale Navigationsmenü vom Univention Portal abrufen
- **Videokonferenz-Integration**: BBB/Jitsi-Räume aus anderen Apps erstellen
- **Backchannel-Logout**: OIDC-Sitzungsbeendigung koordinieren

Diese Funktionen erfordern, dass der ICS als **iframe in jede App eingebettet** wird, der dann **postMessage** verwendet, um mit der übergeordneten Anwendung zu kommunizieren. Der ICS fungiert als vertrauenswürdiger Vermittler, der die OIDC-Tokens des Benutzers hält und im Namen des Benutzers handeln kann.

## Was wir erweitert haben

In unserem openDesk Edu-Fork haben wir Folgendes hinzugefügt:

### 1. **OpenCloud-Unterstützung** (`/oc/`-Route)

Upstream unterstützt nur Nextcloud (`/fs/`-Route). Wir haben eine parallele `/oc/`-Route für OpenCloud hinzugefügt, die unser primärer Datei-Service in openDesk Edu ist.

### 2. **SOGo Groupware-Unterstützung** (`/sogo/`-Route)

Upstream unterstützt SOGo nicht. Wir haben eine `/sogo/`-Route hinzugefügt, die CalDAV- und CardDAV-Anfragen an das SOGo-Backend weiterleitet.

### 3. **ILIAS LMS-Unterstützung** (`/ilias/`-Route)

Upstream unterstützt ILIAS nicht. Wir haben eine `/ilias/`-Route hinzugefügt, die REST-API-Aufrufe und Datei-Uploads an das ILIAS-Backend weiterleitet.

### 4. **Standard Node.js Base Image**

Upstream erfordert das **Univention UCS Base Image** (2GB+). Wir haben dies durch ein **Standard Node.js Alpine Base Image** ersetzt (~150MB).

### 5. **`opendesk_username` als Standard-Claim**

Geändert von `username` auf `opendesk_username` für Konsistenz.

### 6. **Health-Endpoint** (`/health`)

Kubernetes-kompatibler Health-Check.

## Das Problem: Auseinanderlaufende Codebasen

**Unser Fork divergiert vom Upstream.** Jedes Mal, wenn ZenDiS Updates veröffentlicht, stehen wir vor einer unmöglichen Wahl: Upstream zusammenführen (unsere Änderungen verlieren) oder bei unserem Fork bleiben (technische Schulden anhäufen).

## Was wir fordern: Einen formellen ZenDiS-Community-Konsens

Wir schlagen **7 konkrete Maßnahmen** vor:

1. **Contributor License Agreement (CLA)** - Schlanke rechtliche Grundlage
2. **Generische, steckbare Architektur** - Plugin-System statt hartcodierter Handler
3. **Gemeinsames Konfigurations-Schema** - Einheitliche YAML-Syntax
4. **CI/CD für Multi-Varianten-Tests** - Nicht nur CE testen
5. **Regelmäßige Community-Calls** - Monatliche Treffen
6. **Öffentliche Roadmap** - Transparente Planung
7. **Klarer Beitragsweg** - Dokumentierter Prozess

## Warum das für digitale Souveränität wichtig ist

Die openDesk-Plattform ist eine **strategische Initiative** der deutschen Bundesregierung. Fragmentierung in inkompatible Forks untergräbt:

- **Interoperabilität** zwischen Behörden
- **Wartbarkeit** der Plattform
- **Adoption** durch öffentliche Administratoren
- **Kosten** (jeder Fork benötigt eigenes Wartungsteam)

**Ein formeller Konsens ist wesentlich für den langfristigen Erfolg von openDesk als souveräne Plattform.**

## Was wir in der Zwischenzeit tun

1. **Open-Source unseres Forks** auf GitHub
2. **PRs upstream einreichen** für nützliche Änderungen
3. **Änderungen klar dokumentieren** im README
4. **Kompatibilität wahren** durch Beibehaltung aller Upstream-Routen
5. **Verbesserungen zurückgeben** wie das Standard Node.js Base Image

**Wir wollen zurückführen. Aber wir brauchen einen Prozess, um das möglich zu machen.**

## Ein konkreter Vorschlag für ZenDiS

**Erste Schritte:**
1. GitHub Issue öffnen: "RFC: Multi-variant intercom-service development"
2. Maintainer zu Kickoff-Call einladen
3. Arbeitsgruppe für Beitragsleitfaden einrichten
4. CLA-Vorlage veröffentlichen
5. intercom-service modularer gestalten

**Der Ball liegt bei ZenDiS.**

---

**Über die Autoren**: Dieser Artikel wurde von der openDesk Edu Community geschrieben. openDesk Edu ist eine Produktionsbereitstellung von 25 integrierten Open-Source-Diensten für deutsche Bildungseinrichtungen. Siehe [opendesk-edu.org](https://opendesk-edu.org) für weitere Informationen.

**Lizenz**: Dieser Artikel ist lizenziert unter Apache-2.0.
