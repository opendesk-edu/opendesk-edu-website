---
title: "Föderierte Identität für die Bildung: openDesk Edu und die DFN-AAI-Föderation"
date: "2026-07-10"
description: "Wie openDesk Edu mit der deutschen nationalen Forschungsföderation DFN-AAI als SAML-Service-Provider-Proxy über Keycloak integriert — und ein Aufruf an die Gemeinschaft, eine gemeinsame Evaluierungsinstanz aufzubauen, die die Hürde für jede Institution senkt."
categories: ["technik", "gemeinschaft", "identität"]
tags: ["dfn-aai", "föderation", "saml", "keycloak", "edugain", "identitätsmanagement", "shibboleth", "gemeinschaft", "evaluierung"]
image: "/static/blog/dfn-aai-federation-shared-evaluation-teaser.svg"
---

# Föderierte Identität für die Bildung: openDesk Edu und die DFN-AAI-Föderation

> **Die Vision:** Ein Student einer deutschen Universität meldet sich einmal an seiner lokalen Lernplattform an — und greift auf kollaborative Werkzeuge, Dateispeicher und Videokonferenzen über institutionelle Grenzen hinweg zu, ohne ein zweites Passwort.
>
> **Die Realität:** Föderation ist schwierig. SAML-Metadaten, eduGAIN-Attributmapping, SP-Registrierung, Zertifikatsverwaltung — jede Institution erfindet das Rad neu.
>
> **Der Aufruf:** Lasst uns gemeinsam eine gemeinsame DFN-AAI-Evaluierungsinstanz aufbauen. Eine Föderationseinrichtung, von vielen getestet und dokumentiert. Senken wir die Hürde für jede Institution in der Gemeinschaft.

## Die DFN-AAI-Föderation

DFN-AAI (Deutsches Forschungsnetz — Authentication and Authorization Infrastructure) ist Deutschlands nationale akademische Identitätsföderation, die Universitäten, Forschungseinrichtungen und Dienstanbieter über SAML 2.0 verbindet. Sie ist Teil der globalen eduGAIN-Interföderation, was bedeutet, dass ein DFN-AAI-Login Benutzer über teilnehmende Einrichtungen weltweit authentifizieren kann.

Für openDesk Edu ist die DFN-AAI-Integration nicht optional — sie ist eine Kernanforderung. Deutsche Universitäten erstellen keine separaten Benutzerkonten für jede Plattform. Sie authentifizieren sich über ihren institutionellen Identitätsanbieter (IdP), der bei DFN-AAI registriert ist und mit eduGAIN föderiert.

Ohne DFN-AAI-Unterstützung wäre openDesk Edu eine eigenständige Insel. Mit ihr wird es Teil der nationalen Forschungs- und Bildungsinfrastruktur.

## Was wir gebaut haben

Im Sprint 5 unseres v1.1-Release-Fahrplans (Juli 2026) haben wir umfassende DFN-AAI-Föderationsunterstützung für openDesk Edu implementiert. Hier ist, was ausgeliefert wurde:

### 1. Keycloak als SAML-Service-Provider-Proxy

Die grundlegende Architekturentscheidung: **Keycloak fungiert sowohl als SAML-SP (gegenüber DFN-AAI) als auch als OIDC-IdP (gegenüber openDesk-Diensten).** Das bedeutet:

- Die Außenwelt sieht eine SAML-SP-Entität — sauber, einfach, standardkonform
- Interne Dienste verwenden weiterhin OIDC — keine SAML-Konfiguration pro Dienst erforderlich
- Attributübersetzung erfolgt an einer Stelle — SAML-eduGAIN-Attribute → OIDC-Ansprüche
- Backchannel-Logout propagiert von DFN-AAI → Keycloak → alle 25+ Dienste

```
┌──────────────┐     SAML 2.0     ┌──────────────┐     OIDC      ┌──────────────┐
│  DFN-AAI IdP │◄────────────────►│   Keycloak   │◄────────────►│ openDesk     │
│ (Shibboleth) │    (eduGAIN)     │  (SAML SP)   │   (Claims)    │ Services     │
└──────────────┘                  └──────────────┘               └──────────────┘
```

### 2. eduGAIN-Attributmapping

eduGAIN definiert einen Standardsatz von Attributen, die IdPs über ihre Benutzer freigeben. Wir haben diese auf Keycloak-Benutzerattribute und OIDC-Ansprüche abgebildet:

**5 erforderliche Attribute (Pflicht für DFN-AAI-Registrierung):**

| eduGAIN-Attribut | Beschreibung | Gemappt auf |
|-------------------|-------------|-------------|
| `eduPersonPrincipalName` | Eindeutige Benutzerkennung | `eppn` |
| `mail` | E-Mail-Adresse | `email` |
| `displayName` | Vollständiger Anzeigename | `name` |
| `givenName` | Vorname | `firstName` |
| `sn` | Nachname | `lastName` |

**5 empfohlene Attribute:**

| eduGAIN-Attribut | Beschreibung | Gemappt auf |
|-------------------|-------------|-------------|
| `eduPersonAffiliation` | Rolle (Student/Mitarbeiter/Fakultät) | `affiliation` |
| `eduPersonScopedAffiliation` | Zugehörigkeit mit Bereich | `scopedAffiliation` |
| `eduPersonEntitlement` | Berechtigungs-URNs | `entitlement` |
| `preferredLanguage` | Sprachpräferenz | `locale` |
| `schacHomeOrganization` | Heimatorganisationsdomäne | `organization` |

Das Attributmapping ist der kritische Pfad. Wenn Attribute nicht korrekt ankommen, können sich Benutzer nicht anmelden, Rollen werden nicht zugewiesen und die Personalisierung schlägt fehl. Wir haben jeden Mapper mit seinem SAML-Attributnamenformat dokumentiert (`urn:oasis:names:tc:SAML:2.0:attrname-format:uri` vs. `basic`), um Rätselraten zu vermeiden.

### 3. Service-Provider-Metadatengenerierung

Wir haben einen Metadatengenerierungs-Workflow erstellt, der das SAML-SP-Metadaten-XML produziert, das DFN-AAI für die Registrierung benötigt:

```bash
# SP-Metadaten generieren
./scripts/generate-saml-metadata.sh \
  --entity-id "urn:auth:opendesk:edu:yourdomain" \
  --acs-url "https://keycloak.yourdomain.de/realms/opendesk/broker/dfn-aai/endpoint" \
  --cert-file /etc/ssl/certs/saml-signing.crt

# Metadaten validieren
xmllint --valid --noout sp-metadata.xml
```

### 4. Testen und Fehlerbehebung

Wir haben den vollständigen Test-Workflow dokumentiert — von Test-IdP-Konten über Attributverifizierung bis zur Single-Logout-Propagierung — in einem zweisprachigen (EN/DE) Testleitfaden, der die DFN-AAI-Testföderationsumgebung abdeckt:

| Umgebung | Metadatenquelle | Registrierungszeit |
|-------------|-----------------|-------------------|
| **Test-Föderation** | DFN-AAI-Testföderation: `https://www.aai.dfn.de/fileadmin/metadata/DFN-AAI-Test-metadata.xml` | 1-2 Werktage |
| **Produktions-Föderation** | Ihr DFN-AAI-Administrator der Einrichtung | 3-5 Werktage |

### 5. Vollständige Dokumentationssuite

Die DFN-AAI-Arbeit hat fünf Dokumentationsdateien mit insgesamt ~500 Zeilen hervorgebracht, die Föderationsarchitektur, Keycloak-Integration, Registrierung, Tests (zweisprachig) und Produktionsaufnahme abdecken.

## Die Herausforderung: Jede Institution erfindet das Rad neu

Hier ist das Problem. Jede Universität, die openDesk Edu — oder eine beliebige SAML-kompatible Plattform — einsetzen möchte, muss:

1. **DFN-AAI kontaktieren** für die Föderationsregistrierung (1-2 Wochen Verwaltungsprozess)
2. **SAML-Metadaten generieren** für ihre spezifische Bereitstellung
3. **Zertifikatssignierung konfigurieren** über ihre institutionelle PKI
4. **Attributfreigabe koordinieren** mit ihren institutionellen IdP-Administratoren
5. **Den vollständigen Ablauf testen** — Authentifizierung, Attributmapping, Logout-Propagierung
6. **Eigenständig debuggen** wenn etwas nicht funktioniert

Für eine einzelne Institution ist das machbar. **Für 10, 20 oder 50 Institutionen ist die Wiederholung atemberaubend.** Jedes Team debuggt die gleichen SAML-Fehler. Jedes Team findet das gleiche Attributmapping heraus. Jedes Team durchläuft die gleiche 1-2-wöchige Registrierungswartezeit.

Schlimmer noch: **Es gibt keine gemeinsame Evaluierungsumgebung.** Wenn Sie eine Universität sind, die openDesk Edu evaluiert, können Sie die DFN-AAI-Integration nicht einfach "testen", ohne den vollständigen Registrierungsprozess zu durchlaufen. Sie brauchen einen produktionsreifen SAML-SP, registriert bei DFN-AAI, mit ordentlichen Zertifikaten und Metadaten — nur um zu entscheiden, ob die Plattform für Sie funktioniert.

Das ist der Engpass, den wir gemeinsam lösen müssen.

## Der Aufruf: Eine gemeinsame DFN-AAI-Evaluierungsinstanz

Hier ist der Vorschlag: **Lasst uns eine gemeinsame DFN-AAI-Evaluierungsinstanz einrichten, die jedes Gemeinschaftsmitglied zum Testen der Föderationsintegration nutzen kann.**

### Was es wäre

Eine einzelne, gemeinschaftlich verwaltete Keycloak-Instanz, konfiguriert als DFN-AAI-SAML-Service-Provider, registriert bei der DFN-AAI-Testföderation, die mehrere Projekte zu Evaluierungszwecken nutzen können:

```
┌─────────────────────────────────────────────────────┐
│           Gemeinsame Evaluierungsinstanz              │
│                                                      │
│  Keycloak (SAML SP) ───── Registriert bei DFN-AAI   │
│       │                                              │
│       ├── Realm: opendesk-eval    (openDesk Edu)     │
│       ├── Realm: lms-eval         (Anderes LMS)      │
│       ├── Realm: collab-eval      (Kollaboration)    │
│       └── Realm: your-project     (Ihr Projekt)      │
│                                                      │
│  Gemeinsame SAML-Metadaten: eval.sp.opendesk-edu.org │
│  Gemeinsame Zertifikate: Community-verwaltete PKI    │
│  Gemeinsame Dokumentation: Kampferprobt von vielen    │
└─────────────────────────────────────────────────────┘
```

### Warum es wichtig ist

- **Evaluierungshürde senken** — Föderationsintegration testen ohne 2-wöchige Registrierungswartezeit
- **Debugging-Wissen teilen** — wenn ein Gemeinschaftsmitglied ein SAML-Problem löst, profitieren alle
- **Attributmapping standardisieren** — eine bewährte eduGAIN-Mapper-Konfiguration, validiert von vielen Einrichtungen
- **Referenzimplementierung bereitstellen** — "es funktioniert auf der gemeinsamen Evaluierungsinstanz" wird zur Baseline
- **Beschaffung beschleunigen** — evaluieren bevor Sie sich zum vollständigen Registrierungsprozess verpflichten

### Wie es funktionieren würde

Die gemeinsame Instanz wäre:

1. **Leichtgewichtig** — Eine einzelne VM oder ein Kubernetes-Pod mit Keycloak, registriert bei der DFN-AAI-Testföderation
2. **Mehrermandantenfähig** — Jedes Gemeinschaftsprojekt erhält seinen eigenen Keycloak-Realm für isolierte Tests
3. **Gemeinschaftlich verwaltet** — Konfiguration und Zertifikate werden offen verwaltet, mit Dokumentation für jede Änderung
4. **Dokumentiert** — Jeder Attribut-Mapper, jeder Endpunkt, jede Zertifikatsrotation wird dokumentiert
5. **Standardmäßig temporär** — Realms sind nur zur Evaluierung; Produktionsbereitstellungen benötigen weiterhin eine ordnungsgemäße Registrierung

### Was wir von der Gemeinschaft brauchen

Das funktioniert nur, wenn es eine Gemeinschaftsanstrengung ist. Hier ist, was benötigt wird:

| Rolle | Was Sie beitragen |
|------|---------------------|
| **Infrastruktur-Host** | Eine kleine VM oder ein Container-Host (2 CPU, 4 GB RAM) — könnte monatlich rotieren |
| **DFN-AAI-Verbindung** | Jemand mit einer bestehenden DFN-AAI-Registrierung, der den gemeinsamen SP registrieren kann |
| **Zertifikatsmanager** | SAML-Signierzertifikat generieren und rotieren |
| **Tester** | Ihre SP-Konfiguration anschließen und Attributmapping verifizieren |
| **Dokumentationsautoren** | Arbeitskonfigurationen, häufige Fehler und Lösungen erfassen |
| **Benutzer** | Mit echten institutionellen IdP-Anmeldedaten testen (jedes DFN-AAI-Mitglied) |

### Erste Schritte

Wenn Sie daran interessiert sind, zu einer gemeinsamen DFN-AAI-Evaluierungsinstanz beizutragen oder sie zu nutzen:

1. **Öffnen Sie eine GitHub-Diskussion** — lassen Sie uns Interesse abschätzen und koordinieren: [github.com/opendesk-edu/opendesk-edu/discussions](https://github.com/opendesk-edu/opendesk-edu/discussions)
2. **Überprüfen Sie die DFN-AAI-Dokumentation** — verstehen Sie, was benötigt wird: [`docs/dfn-aai-federation.md`](https://github.com/opendesk-edu/opendesk-edu/blob/main/docs/dfn-aai-federation.md)
3. **Testen Sie mit den vorhandenen Leitfäden** — validieren Sie, dass unsere Keycloak-Konfiguration mit Ihrem IdP funktioniert
4. **Teilen Sie Ihre Erfahrungen** — welche Attribute gibt Ihre Einrichtung frei? Auf welche Fehler sind Sie gestoßen? Welche Konfigurationsbesonderheiten haben Sie entdeckt?

### Was wir bereits getan haben

Das Fundament ist gelegt:

- Vollständige Keycloak-SAML-SP/IdP-Konfiguration dokumentiert und überprüft
- 10 eduGAIN-Attribut-Mapper (5 erforderliche + 5 empfohlene) mit genauen SAML-Attributnamenformaten dokumentiert
- SP-Metadatengenerierungsskript mit Zertifikatsunterstützung
- Zweisprachiger (EN/DE) Testleitfaden für die DFN-AAI-Testföderation
- 5 Dokumentationsdateien zu Föderation, Aufnahme, Integration, Tests und Produktionsbereitstellung
- Backchannel-Logout für alle 25+ openDesk-Edu-Dienste konfiguriert — Logout-Propagierung funktioniert Ende-zu-Ende

Was fehlt, ist die gemeinsame Infrastruktur. Und da brauchen wir Sie.

## Föderation ist eine Mannschaftssportart

Das openDesk-Edu-Projekt basiert auf dem Prinzip, dass Bildungstechnologie souverän, kollaborativ und offen sein sollte. Die DFN-AAI-Föderation verkörpert alle drei:

- **Souverän** — Institutionen kontrollieren ihre eigene Identitätsinfrastruktur
- **Kollaborativ** — Föderation verbindet Institutionen, isoliert sie nicht
- **Offen** — SAML 2.0 und eduGAIN sind offene Standards, keine proprietären Protokolle

Eine gemeinsame Evaluierungsinstanz erweitert diese Philosophie auf den Evaluierungsprozess selbst. Anstatt dass jede Institution denselben Berg allein erklimmt, bauen wir den Weg gemeinsam — und jeder, der folgt, profitiert von dem Pfad, den wir freigeräumt haben.

**Machen Sie mit. Testen Sie Ihre Föderationseinrichtung gegen eine gemeinsame Instanz. Tragen Sie Ihre Erkenntnisse bei. Helfen Sie, die Evaluierungsinfrastruktur aufzubauen, die jede Institution braucht.**

---

*Die DFN-AAI-Föderationsarbeit ist Teil des openDesk-Edu-v1.1-Releases. Die gesamte Dokumentation ist im [openDesk-Edu-Repository](https://github.com/opendesk-edu/opendesk-edu) verfügbar. Bei Fragen zur gemeinsamen Evaluierungsinitiative eröffnen Sie eine GitHub-Diskussion oder kontaktieren Sie die Gemeinschaft.*

**openDesk Edu: Souveräne, integrierte, produktionsreife Open-Source-Bildungstechnologie.**
