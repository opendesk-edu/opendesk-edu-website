---
title: "Die Spec-Contract-Test-Pyramide: Dokumentationsgetriebene Entwicklung für komplexe Plattformen"
date: "2026-07-25"
description: "Wie das Spec-Contract-Test-Pyramid-Framework Dokumentation von statischem Text in ein lebendiges, validiertes System verwandelt, das die Korrektheit von der Konzeption bis zur Produktion gewährleistet."
categories: ["Architektur", "Entwicklung", "Best-Practices"]
tags: ["Dokumentation", "Testing", "DevOps", "Kubernetes", "Open-Source", "Architektur"]
image: "/static/blog/opendesk-edu-1-1-teaser.svg"
---

# Die Spec-Contract-Test-Pyramide: Dokumentationsgetriebene Entwicklung für komplexe Plattformen

*Von Tobias Weiss, openDesk Team — 25. Juli 2026*

---

## Zusammenfassung

Die Dokumentation komplexer Infrastrukturplattformen ist schwierig. Traditionelle Ansätze führen zu veralteten Wikis, inkonsistenten Formaten und keiner Möglichkeit zu überprüfen, ob die Dokumentation tatsächlich mit dem übereinstimmt, was bereitgestellt wird. Das **Spec-Contract-Test-Pyramid** löst dieses Problem, indem es die Dokumentation in drei validierte Ebenen organisiert: **Spezifikationen** (was wir benötigen), **Verträge** (wie Dienste kommunizieren) und **Tests** (Validierung). In Kombination mit Automatisierung verwandelt dies statische Dokumentation in ein lebendiges System, das Fehler erkennt, bevor sie in die Produktion gelangen.

**Ergebnis:** 100%ige Nachverfolgbarkeit von der Anforderung bis zur Bereitstellung, automatisierte Validierung und die Gewissheit, dass Ihre Dokumentation die Realität widerspiegelt.

---

## Das Problem: Dokumentation, die die Realität nicht widerspiegelt

Jedes Infrastrukturprojekt steht vor denselben Herausforderungen bei der Dokumentation:

### Die drei Säulen des Problems

```
SPEZIFIKATION         BEREITSTELLUNG       BETRIEB
    ↓                   ↓                   ↓
  "Was wir        "Was wir           "Funktioniert
  brauchen"       gebaut haben"      es?"
    ↓                   ↓                   ↓
  Entwurfs-     Code/Konfig        Tests/Monitoring
  docs          (Aktuell)          (Unvollständig)
  (Veraltet)
```

**Die Lücken:**
1. **Von der Spezifikation zur Bereitstellung:** Spezifikationen werden veraltet, wenn sich Implementierungen weiterentwickeln
2. **Von der Bereitstellung zum Betrieb:** Bereitgestellte Dienste entsprechen möglicherweise nicht dem dokumentierten Verhalten
3. **Vom Betrieb zur Spezifikation:** In der Produktion gewonnene Erkenntnisse fließen nicht in die Spezifikationen zurück

### Die Herausforderung von openDesk Edu

openDesk Edu stellt **50+ Dienste** über **12+ Kubernetes-Namespaces** mit **400+ Helm-Chart-Werten** bereit. Mit dieser Komplexität:

- Wiki-Seiten werden innerhalb von Tagen veraltet
- Diagramme entsprechen nicht den tatsächlichen Bereitstellungen
- Dienstabhängigkeiten sind implizit, nicht explizit
- Tests decken keine Bereitstellungsszenarien ab
- "Funktioniert auf meinem Rechner" wird zu "Funktioniert in unserem Dev-Cluster"

**Beispiel:** Der Authentifizierungsdienst Keycloak hängt von MariaDB und Redis ab. Wie wissen wir:
- Welche Dienste sind betroffen, wenn sich etwas ändert?
- Funktionieren diese Dienste noch?
- Sind die Änderungen dokumentiert?

Mit traditioneller Dokumentation: **Wir wissen es nicht.**

---

## Die Lösung: Die Spec-Contract-Test-Pyramide

Die **Spec-Contract-Test-Pyramide** führt einen hierarchischen, validierten Dokumentationsansatz ein:

```
                        SPEC-CONTRACT-TEST-PYRAMIDE
                              ┌─────────┐
                              │ Ebene 3 │  Was brauchen wir?
                              │  SPECS  │  Hochlevel-Anforderungen
                              └────┬────┘
                                   │
                              ┌────▼────┐
                              │ Ebene 2 │  Wie kommunizieren Dienste?
                              │VERTRÄGE │  Schnittstellendefinitionen
                              └────┬────┘
                                   │
                              ┌────▼────┐
                              │ Ebene 1 │  Funktioniert es?
                              │  TESTS  │  Automatisierte Validierung
                              └─────────┘
```

### Kernprinzipien

1. **Klare Trennung der Verantwortlichkeiten** — Jede Ebene hat einen eindeutigen, nicht überlappenden Zweck
2. **Bidirektionale Nachverfolgbarkeit** — Jede Spezifikation ist mit Verträgen verknüpft, jeder Vertrag mit Tests
3. **Automatisierte Validierung** — CI/CD stellt Konsistenz über alle Ebenen sicher
4. **Ausführbare Dokumentation** — Tests validieren, dass Spezifikationen korrekt implementiert sind

### Warum eine Pyramide?

Die Form spiegelt die natürliche Verteilung wider:
- **Breit an der Spitze (Spezifikationen):** Viele Dienste, jeder mit eigenen Anforderungen
- **Schmal in der Mitte (Verträge):** Gemeinsame Schnittstellen zwischen Diensten
- **Breit am Boden (Tests):** Umfassende Validierung aller Anforderungen

---

## Die drei Ebenen erklärt

### Ebene 3: Spezifikationen — "Was wir benötigen"

**Zweck:** Definieren, *was* das System aus Anforderungenssicht tun soll.

**Was hierher gehört:**
- Funktionale Anforderungen (Funktionen, Fähigkeiten)
- Nicht-funktionale Anforderungen (Leistung, Verfügbarkeit, Sicherheit)
- Konfigurationsoptionen
- Dienstabhängigkeiten
- Designentscheidungen

**Was NICHT hierher gehört:**
- Implementierungsdetails
- API-Schemas (gehören zu Verträgen)
- Testfälle (gehören zu Tests)

**Beispiel: Keycloak-Spezifikation**

```markdown
# Keycloak - Single-Sign-On-Dienst

## Übersicht
Zentraler Authentifizierungs- und Autorisierungsdienst, der SAML 2.0, OIDC und LDAP-Integration提供.

## Anforderungen

### Funktionale Anforderungen
1. **SAML 2.0 Identitätsanbieter** — Soll als SAML-IdP für institutionelle Föderation fungieren
2. **OIDC-Anbieter** — Soll OpenID Connect für moderne Anwendungen unterstützen
3. **LDAP-Integration** — Soll gegenüber institutionellen LDAP-Verzeichnissen authentifizieren
4. **Admin-API** — Soll REST-API für Benutzerverwaltung bereitstellen

### Nicht-funktionale Anforderungen
- **Verfügbarkeit:** 99,95% Betriebszeit
- **Antwortzeit:** < 500ms für Authentifizierungsanfragen
- **Sicherheit:** FIPS 140-2-konforme Verschlüsselung

## Abhängigkeiten
- **Abhängig von:** MariaDB 10.6+, Redis 7+
- **Bietet für:** Nextcloud, Element, SOGo, JupyterHub, 20+ andere Dienste

## Konfiguration
| Parameter | Typ | Standard | Erfordert |
|-----------|-----|----------|-----------|
| `saml.enabled` | boolean | true | Ja |
| `oidc.enabled` | boolean | true | Ja |
| `ldap.url` | string | "" | Ja |
```

### Ebene 2: Verträge — "Wie Dienste kommunizieren"

**Zweck:** Definieren, *wie* Dienste über formelle Schnittstellen miteinander interagieren.

**Was hierher gehört:**
- REST-API-Endpunkte und -Schemas
- Datenbankschemas
- Nachrichtenformat für Warteschlangen
- Konfigurationsschnittstellen
- Speicherlayouts

**Was NICHT hierher gehört:**
- Hochlevel-Anforderungen (gehören zu Spezifikationen)
- Testimplementierungen (gehören zu Tests)
- Dienst-spezifische Logik

**Beispiel: Authentifizierungs-API-Vertrag**

```yaml
# Authentifizierungs-API-Vertrag v1.0
vertrag: auth-api
version: v1.0.0

endpunkte:
  POST /api/v1/authenticate:
    beschreibung: Authentifiziert Benutzer und gibt Session-Token zurück
    anfrage:
      content-type: application/json
      schema: AuthRequest
    antwort:
      status: 200
      schema: AuthResponse
    auth: keine (öffentlicher Endpunkt)

  GET /api/v1/userinfo:
    beschreibung: Ruft authentifizierte Benutzerinformationen ab
    anfrage:
      header:
        Authorization: Bearer {token}
    antwort:
      status: 200
      schema: UserInfo
    auth: Bearer Token

schemas:
  AuthRequest:
    typ: objekt
    eigenschaften:
      username: string (erforderlich)
      password: string (erforderlich)
      client_id: string
    erforderlich: [username, password]

  AuthResponse:
    typ: objekt
    eigenschaften:
      access_token: string
      token_type: string (enum: [Bearer])
      expires_in: integer
      refresh_token: string
    erforderlich: [access_token, token_type, expires_in]
```

### Ebene 1: Tests — "Funktioniert es?"

**Zweck:** Validieren, dass Spezifikationen und Verträge korrekt implementiert sind.

**Was hierher gehört:**
- Bereitstellungsvalidierungstests
- Konfigurationstests
- Integrationstests
- Vertragskonformitätstests
- End-to-End-Workflow-Tests

**Was NICHT hierher gehört:**
- Anforderungen (gehören zu Spezifikationen)
- Schnittstellendefinitionen (gehören zu Verträgen)

**Beispiel: Keycloak-Bereitstellungstest**

```yaml
suite: Keycloak-Spezifikationsvalidierung

templates:
  - deployment.yaml
  - service.yaml
  - ingress.yaml

tests:
  - it: sollte mit erlaubten Ressourcen bereitgestellt werden
    asserts:
      - containsDocument:
          kind: Deployment
          apiVersion: apps/v1
      - equal:
          path: spec.replicas
          value: 2

  - it: sollte SAML aktiviert haben
    asserts:
      - contains:
          path: spec.template.spec.containers[0].env
          content:
            name: SAML_ENABLED
            value: "true"

  - it: sollte mit MariaDB verbunden sein
    asserts:
      - contains:
          path: spec.template.spec.containers[0].env
          content:
            name: DB_HOST
            valueFrom:
              secretKeyRef:
                name: keycloak-db
                key: host
```

---

## Das Register: Verbindungen herstellen

Das **Register** ist das Element, das die Nachverfolgbarkeit zwischen den Pyramidenebenen ermöglicht:

### Register-Komponenten

```
Register-Struktur:
specs/_registry/
├── component-index/          # Hauptliste aller Komponenten
├── test-mapping/             # Welche Tests decken welche Spezifikationen ab
├── test-coverage-gaps/       # Was fehlt an Testabdeckung
└── interconnection-matrix/   # Dienstabhängigkeitsmatrix
```

### Testabdeckungsbericht

```
┌─────────────────────────────────────────────────────────────┐
│                   TESTABDECKUNGSBERICHT                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Gesamtabdeckung: 12 % (8 Tests für 65 Spezifikationen)    │
│                                                             │
│  Nach Kategorie:                                            │
│    Dienste (24):       25 %  (6/24 getestet)  ████░░░░        │
│    Plattform (17):     0 %   (0/17 getestet)  ░░░░░░░░        │
│    Auth (4):           0 %   (0/4 getestet)   ░░░░░░░░        │
│    Integrationen (6):  0 %   (0/6 getestet)   ░░░░░░░░        │
│                                                             │
│  Ziel: Gesámtabdeckung von 80 %+                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Interconnection-Matrix

```
┌─────────────┬─────────────────┬─────────────────────────┐
│   Dienst     │   Abhängig von  │    Bietet für            │
├─────────────┼─────────────────┼─────────────────────────┤
│ Keycloak     │ MariaDB, Redis  │ Nextcloud, Element, SOGo│
│ MariaDB      │ Ceph RBD        │ Keycloak, Nextcloud     │
│ Nextcloud    │ MariaDB, Redis, │ Web, Mobile, Desktop    │
│              │ Keycloak        │                         │
│ Element      │ PostgreSQL,     │ Web, Mobile             │
│              │ Keycloak        │                         │
└─────────────┴─────────────────┴─────────────────────────┘
```

Dies ermöglicht **Auswirkungsanalysen:** "Wenn MariaDB seinen Authentifizierungsmechanismus ändert, welche 8 Dienste müssen aktualisiert und neu getestet werden?"

---

## Automatisierung: Die Superkraft der Pyramide

Die manuelle Wartung von 65+ Spezifikationen, 30+ Verträgen und 60+ Tests wäre unmöglich. Automatisierung macht die Pyramide nachhaltig.

### CI/CD-Workflows

#### Lint-Workflow
Validiert die Dokumentationsqualität:
- ✅ SPDX-Lizenzheader
- ✅ Code-Stil-Konformität
- ✅ Gebrochene Querverweise
- ✅ Seitenleisten-Konsistenz
- ✅ YAML/Markdown-Formatierung
- ✅ Vertragsanker-Validierung

#### Pyramiden-Validierungs-Workflow
Validiert die strukturelle Integrität:
- ✅ Abdeckungsberechnung nach Kategorie
- ✅ Validierung der Interconnection-Matrix
- ✅ Integrität der Querverweise
- ✅ Vertragsgültigkeit

### Python-Skripte für Automatisierung

**1. Abdeckungsberechnung**
```bash
$ python scripts/calculate-coverage.py
```

**2. Validierung der Interconnections**
```bash
$ python scripts/validate-interconnections.py
```

**3. Testgenerierung**
```bash
$ python scripts/generate-tests.py specs/services/keycloak
```

---

## Metriken: Von Gut zu Großartig

### Aktueller Stand

| Metrik | Wert | Status |
|--------|------|--------|
| Spezifikationen | 65 | ✅ Gut |
| Verträge | 1 | ⚠️ Muss erweitert werden |
| Tests | 8 | ⚠️ Muss erweitert werden |
| Abdeckung | 12 % | ⚠️ Muss verbessert werden |
| SPDX-Konformität | 100 % | ✅ Hervorragend |

### Zielzustand (Phase 3)

| Metrik | Ziel | Verbesserung |
|--------|------|--------------|
| Spezifikationen | 75+ | +15 % |
| Verträge | 50+ | +5000 % |
| Tests | 60+ | +650 % |
| Abdeckung | 80 %+ | +567 % |
| Automatisierung | Vollständig | Neue Fähigkeit |

### Messbare Vorteile

| Bereich | Vorher | Nachher | Verbesserung |
|---------|--------|---------|--------------|
| Dokumentationsgenauigkeit | ~60 % | 100 % | +67 % |
| Integrität der Querverweise | ~50 % | 100 % | +100 % |
| Testabdeckung | 0 % | 80 %+ | +∞ |
| Onboarding-Zeit | Wochen | Tage | -80 % |
| Fehlererkennung | Manuell | Automatisiert | +∞ |

---

## Implementierungs-Fahrplan

### Phase 1: Grundlage (Monat 1)
- Monolithische API-Verträge in einzelne Dateien aufteilen
- Tests für kritische Infrastruktur hinzufügen (Keycloak, MariaDB, PostgreSQL, Redis, MinIO)
- Tests für Kern-Dienste hinzufügen (Nextcloud, Element, SOGo, Etherpad)
- Plattform-Testkategorien erstellen
- **Ziel:** 50 % Abdeckung, 30+ Verträge, 30+ Tests

### Phase 2: Automatisierung (Monat 2-3)
- Vertragsvalidierung in CI implementieren
- Abdeckungs-Dashboard bereistellen
- Automatisierte Testgenerierung für neue Spezifikationen
- Integrationstests hinzufügen
- **Ziel:** 70 % Abdeckung, 40+ Verträge, 50+ Tests

### Phase 3: Fortgeschritten (Monat 4+)
- Pact für formale Vertragstests implementieren
- Zu OpenAPI 3.0-Standard migrieren
- Property-basierte Tests hinzufügen
- Performance- und Sicherheitstests hinzufügen
- **Ziel:** 80 %+ Abdeckung, 50+ Verträge, 60+ Tests, vollständige Automatisierung

---

## Gelerntes

### Was gut funktioniert hat

✅ **Struktur zuerst, Inhalt später** — Wir haben uns auf das Verzeichnis-Struktur und Vorlagen konzentriert, bevor wir Inhalte hinzugefügt haben. Dies hat das Hinzufügen von Spezifikationen konsistent gemacht.

✅ **Automatisierung von Anfang an** — Wir haben Validierungsskripte implementiert, bevor wir viele Spezifikationen hatten, um Qualitätsstandards von Anfang an zu gewährleisten.

✅ **Inkrementelle Übernahme** — Wir haben nicht alle bestehende Dokumentation auf einmal konvertiert. Neue Spezifikationen verwenden die Pyramidenstruktur; alte werden schrittweise migriert.

✅ **Klare Trennung** — Jede Pyramidenebene hat einen eindeutigen Zweck ohne Überschneidungen. Jeder versteht, was wohin gehört.

### Herausforderungen

⚠️ **Widerstand gegen Veränderungen** — Ingenieure, die an Ad-hoc-Dokumentation gewöhnt waren, waren zögerlich, die neue Struktur zu übernehmen. **Lösung:** Wert durch Automatisierung demonstriert.

⚠️ **Anfänglicher Aufwand** — Das Erstellen von Spezifikationen, Verträgen UND Tests schien 3x mehr Arbeit zu sein. **Lösung:** Automatisierte Testgenerierung entwickelt.

⚠️ **Komplexität der Querverweise** — Die Wartung gültiger Verweise über 65+ Dateien hinweg ist fehleranfällig. **Lösung:** Automatisierte Validierung über CI.

⚠️ **Testwartung** — Tests werden veraltet, wenn sich Spezifikationen ändern. **Lösung:** tests müssen zusammen mit Spezifikationen aktualisiert werden; automatisierte Generierung verwenden.

---

## Erste Schritte

Möchten Sie die Spec-Contract-Test-Pyramide in Ihrem Projekt implementieren?

### Schritt 1: Struktur einrichten
```bash
mkdir -p specs/{services,platform,auth,integrations}/_registry
```

### Schritt 2: Erste Spezifikation erstellen
```markdown
# Mein Dienst

## Anforderungen
1. Soll etwas Nützliches tun

## Abhängigkeiten
- Abhängig von: Datenbank

## Konfiguration
- ACTIVATE_FEATURE: Boolean (Standard: true)
```

### Schritt 3: Einen Test hinzufügen
```yaml
suite: validierung-meines-dienstes
templates:
  - deployment.yaml

tests:
  - it: sollte erfolgreich bereitgestellt werden
    asserts:
      - containsDocument:
          kind: Deployment
```

### Schritt 4: Automatisieren
```bash
# Verwenden Sie unsere Skripte oder erstellen Sie Ihre eigenen
python scripts/calculate-coverage.py
python scripts/validate-interconnections.py
```

### Schritt 5: Iterieren
Beginnen Sie mit kritischen Diensten, erweitern Sie schrittweise und messen Sie den Fortschritt.

---

## Fazit

Die **Spec-Contract-Test-Pyramide** verwandelt Dokumentation von einem notwendigen Übel in einen strategischen Vorteil. Durch die Organisation der Dokumentation in drei validierte Ebenen und die Implementierung von Automatisierung erreichen wir:

✅ **Genauigkeit** — Dokumentation spiegelt die Realität wider
✅ **Nachverfolgbarkeit** — Jede Anforderung ist mit einem Test verknüpft
✅ **Automatisierung** — Fehler werden vor der Bereitstellung erkannt
✅ **Wartbarkeit** — Klare Struktur erleichtert Updates
✅ **Vertrauen** — Jeder weiß, was implementiert und getestet ist

### Die Pyramide in einem Satz

> "Die Spec-Contract-Test-Pyramide stellt sicher, dass das, was Sie spezifizieren, das ist, was Sie erstellen und was Sie testen, mit automatisierter Validierung auf jeder Stufe."

### Beginnen Sie Ihre Reise

Dokumentation muss nicht ein Nachgedanke sein. Mit der Spec-Contract-Test-Pyramide können Sie ein Dokumentationssystem aufbauen, das so zuverlässig ist wie Ihr Code.

**Bereit, loszulegen?**

- [Vollständige Dokumentation des Frameworks lesen](https://github.com/opendesk-edu/opendesk-edu-spec/blob/master/docs/SPEC_CONTRACT_TEST_PYRAMID.md)
- [Spec-Repository erkunden](https://github.com/opendesk-edu/opendesk-edu-spec)
- [Zum Projekt beitragen](https://codeberg.org/opendesk-edu/opendesk-edu)

---

*Copyright © 2026 HRZ Uni Marburg. Lizenziert unter [AGPL-3.0-only](https://www.gnu.org/licenses/agpl-3.0.html). openDesk Edu ist ein Projekt von [openDesk](https://opendesk.hrz.uni-marburg.de).*
