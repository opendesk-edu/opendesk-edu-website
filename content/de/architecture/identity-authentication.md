---
title: "Identitäts- und Authentifizierungsarchitektur"
date: "2026-08-27"
description: "Die vollständige Authentifizierungskette in openDesk Edu — von der DFN-AAI-Föderation über Keycloak-SSO bis hin zu SAML- und OIDC-Service-Verbindungen, Attributzuordnung und Multi-IdP-Szenarien."
categories: ["architecture", "infrastructure"]
tags: ["architektur", "identität", "authentifizierung", "saml", "oidc", "keycloak", "föderation", "dfn-aai", "edugain", "shibboleth", "nubus"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/identity-authentication-teaser.svg"
---

# Identitäts- und Authentifizierungsarchitektur

Identität ist das Erste, was jeder Nutzer berührt. Bevor ein Studierende eine Datei öffnet, einer Vorlesung beitritt oder ein Dokument bearbeitet, authentifiziert er sich. Im Hochschulbereich findet diese Authentifizierung selten auf der Plattform selbst statt — sie erfolgt an der Heimateinrichtung des Nutzers, geföderiert über nationale und internationale Identitätsnetzwerke. Dieser Artikel dokumentiert, wie openDesk Edu diesen Ablafend-to-end behandelt: von der Föderationsschicht über Keycloak als zentralen Identitäts-Broker bis hin zu dem Dienst, der letztlich die Identitätsattribute des Nutzers empfängt.

Eine Übersicht der gesamten Plattformarchitektur finden Sie unter [Systemarchitektur-Übersicht](/architecture/overview). Einen Vergleich der Komponentenauswahl (E-Mail, Video, Dateien) finden Sie unter [Komponenten-Alternativen](/architecture/component-alternatives).

## Die Authentifizierungskette

Die Plattform verwendet eine dreischichtige Authentifizierungsarchitektur. Jede Schicht hat eine eigene Verantwortung, und die Grenzen zwischen ihnen sind die Sicherheitsgrenzen des Systems.

### Schicht 1: Föderationsschicht (Extern)

Die äußerste Schicht ist die Identitätsföderation. In Deutschland ist dies DFN-AAI (Deutsches Forschungsnetz — Authentication and Authorization Infrastructure), betrieben vom DFN-Verein. DFN-AAI verbindet universitäre Identity Provider (IdPs) mit Service Providern (SPs) über SAML-2.0-Metadatenaustausch. DFN-AAI ist selbst Teil von eduGAIN, der globalen Inter-Föderation, die das Vertrauensnetz auf teilnehmende Einrichtungen weltweit ausweitet.

Wenn ein Studierender einer deutschen Universität sich anmeldet, wird sein Browser zur IdP seiner Heimateinrichtung weitergeleitet (typischerweise ein Shibboleth-IdP). Der IdP authentifiziert den Nutzer (über die lokale Methode der Einrichtung — LDAP, Passwort, MFA) und stellt eine SAML-Assertion aus, die Attribute über den Nutzer enthält: Name, E-Mail, Zugehörigkeit und Heimateinrichtung. Diese Assertion reist durch die Föderation zurück zum Service-Provider-Endpunkt der Plattform.

Die Föderationsschicht ist die Vertrauenswurzel. Die Plattform authentifiziert den Nutzer nicht direkt — sie vertraut der Assertion der Föderation. Das bedeutet, dass keine Universität Konten auf der Plattform erstellen oder verwalten muss; bestehende institutionelle Konten funktionieren automatisch.

### Schicht 2: Identity Broker (Keycloak)

Keycloak bildet das Zentrum der Identitätsarchitektur der Plattform. Es fungiert gleichzeitig als SAML Service Provider (gegenüber der Föderation) und als OpenID Connect (OIDC) Identity Provider (gegenüber internen Diensten). Diese Doppelrolle ist der architektonische Schlüssel: Sie ermöglicht der Plattform, SAML nach außen zu sprechen, während sie OIDC gegenüber ihren eigenen Diensten verwendet.

Der Authentifizierungsfluss durch Keycloak funktioniert wie folgt:

1. **Dienst leitet zu Keycloak weiter**: Wenn ein Nutzer auf einen Dienst zugreift (z. B. Nextcloud, Moodle), prüft der Dienst, ob eine gültige Sitzung vorhanden ist. Wenn nicht, leitet er den Nutzer zum Autorisierungsendpunkt von Keycloak mit einer OIDC-Autorisierungsanfrage weiter.
2. **Keycloak prüft auf bestehende Sitzung**: Wenn der Nutzer bereits eine Keycloak-Sitzung hat (von einer vorherigen Diensteanmeldung), stellt Keycloak sofort ein OIDC-Token aus. Dies ist Single Sign-On (SSO) — der Nutzer authentifiziert sich einmal und hat Zugriff auf alle Dienste.
3. **Keycloak leitet zur Föderation weiter**: Wenn keine Sitzung vorhanden ist, leitet Keycloak den Nutzer zum konfigurierten Identity Broker (DFN-AAI / eduGAIN) weiter. Der Nutzer wählt seine Heimateinrichtung über eine Discovery-Oberfläche und authentifiziert sich am IdP seiner Einrichtung.
4. **Föderation gibt SAML-Assertion zurück**: Der IdP stellt eine SAML-Assertion mit den Nutzerattributen aus. Keycloak empfängt diese Assertion, validiert sie gegen die Föderationsmetadaten und erstellt eine lokale Nutzersitzung mit den zugeordneten Attributen.
5. **Keycloak stellt OIDC-Token aus**: Keycloak übersetzt die SAML-Attribute in OIDC-Claims und stellt dem anfragenden Dienst ein Access-Token, Refresh-Token und ID-Token aus. Der Dienst verwendet diese Tokens, um den Nutzer zu identifizieren und Autorisierung durchzusetzen.

Dieser Ablauf ist für den Nutzer transparent. Er sieht die Anmeldeseite seiner Einrichtung und befindet sich dann auf der Plattform. Die SAML-zu-OIDC-Übersetzung, Attributzuordnung und Token-Ausgabe erfolgen im Hintergrund.

### Schicht 3: Dienstschicht (Intern)

Jeder Dienst auf der Plattform empfängt die Identität des Nutzers über eines von zwei Protokollen:

- **OpenID Connect (OIDC)**: Moderne Dienste (Nextcloud, OpenProject, XWiki, Planka, Zammad, CryptPad, OpenCloud) verbinden sich direkt mit Keycloak über den Standard-OIDC-Autorisierungscode-Flow. Sie erhalten JWT-Access-Tokens und ID-Tokens, die sie gegen die öffentlichen Schlüssel von Keycloak validieren.

- **SAML 2.0**: Bildungsdienste, die einen dedizierten SAML Service Provider benötigen (ILIAS, Moodle, BigBlueButton), verwenden Shibboleth als SP. Shibboleth sitzt zwischen Keycloak und dem Dienst und übersetzt die SAML-Assertions von Keycloak in das Format, das die jeweilige Anwendung erwartet. Jeder Dienst erhält seine eigene Shibboleth-Konfiguration mit dienstspezifischen Attributfiltern.

Die Protokollwahl wird vom Dienst bestimmt, nicht von der Plattform. Dienste, die OIDC unterstützen, verwenden es direkt; Dienste, die nur SAML unterstützen, erhalten einen Shibboleth-SP davor. Keycloak behandelt beide Protokolle gleichzeitig.

## Föderationsintegration

### DFN-AAI

DFN-AAI ist die deutsche nationale akademische Identitätsföderation. Sie verbindet über 400 Universitäten und Forschungseinrichtungen über SAML-2.0-Metadatenaustausch. Für openDesk Edu bedeutet die Integration in DFN-AAI:

- **Entity-ID-Registrierung**: Die Keycloak-Instanz der Plattform wird als Service Provider in den DFN-AAI-Föderationsmetadaten registriert. Diese Registrierung umfasst die Entity-ID, die Assertion Consumer Service (ACS)-URL und das Signaturzertifikat.
- **Metadatenaustausch**: Die Plattform verarbeitet die DFN-AAI-Föderationsmetadaten (eine signierte XML-Datei, die alle vertrauenswürdigen IdPs auflistet) und veröffentlicht ihre eigenen SP-Metadaten. Keycloak aktualisiert die Föderationsmetadaten automatisch nach einem konfigurierbaren Zeitplan.
- **Attributfreigabe**: Jeder institutionelle IdP konfiguriert, welche Attribute er an die Plattform freigibt. Die Plattform fordert einen Standardsatz von eduGAIN-Attributen an (siehe Attributzuordnung unten), aber der IdP entscheidet letztendlich, was freigegeben wird, basierend auf seinen eigenen Richtlinien.

### eduGAIN

eduGAIN ist die globale Inter-Föderation, die nationale Föderationen verbindet (DFN-AAI in Deutschland, SWAMID in Schweden, InCommon in den USA, die UK Access Management Federation im Vereinigten Königreich und andere). Über eduGAIN kann ein Nutzer aus jeder teilnehmenden Föderation sich an der Plattform authentifizieren — nicht nur von deutschen Einrichtungen.

Die DFN-AAI-Registrierung der Plattform umfasst automatisch die eduGAIN-Teilnahme. Es ist keine separate Registrierung erforderlich; die eduGAIN-Metadaten sind in den DFN-AAI-Metadaten eingebettet.

### Multi-Föderations-Szenarien

Eine Einrichtung muss möglicherweise Nutzer aus mehreren nationalen Föderationen gleichzeitig akzeptieren — zum Beispiel eine deutsche Universität, die mit schwedischen und niederländischen Partnern zusammenarbeitet. Keycloak unterstützt dies durch mehrere Identity-Broker-Konfigurationen:

- Jede Föderation ist als separater Identity Provider in Keycloak konfiguriert
- Die Anmeldeseite bietet eine IdP-Discovery-Oberfläche, auf der Nutzer ihre Föderation und Heimateinrichtung auswählen
- Keycloak leitet die Authentifizierungsanfrage an die ausgewählte Föderation weiter
- Bei Rückkehr normalisiert Keycloak die Attribute (verschiedene Föderationen können leicht unterschiedliche Attributnamen verwenden) und erstellt die lokale Sitzung

Dieses Multi-Föderations-Setup ist Konfiguration, kein Code. Das Hinzufügen einer neuen Föderation bedeutet, ihre Metadaten zu importieren und die Attribut-Mapper in der Keycloak-Admin-Konsole zu konfigurieren.

## Attributzuordnung

Wenn ein Nutzer sich über die Föderation authentifiziert, gibt sein IdP eine Menge von SAML-Attributen frei. Keycloak ordnet diese internen Nutzerattributen und dann OIDC-Claims zu, die die Dienste konsumieren. Die Zuordnung ist der kritische Pfad: Wenn Attribute nicht korrekt ankommen, können sich Nutzer nicht authentifizieren, Rollen werden nicht zugewiesen und die Personalisierung schlägt fehl.

### Standard-eduGAIN-Attribute

| Attribut | Beschreibung | Keycloak-Mapping | OIDC-Claim |
|-----------|-------------|------------------|------------|
| `eduPersonPrincipalName` | Eindeutige, persistente Nutzerkennung | `eppn` | `eppn` |
| `mail` | E-Mail-Adresse | `email` | `email` |
| `displayName` | Vollständiger Anzeigename | `name` | `name` |
| `givenName` | Vorname | `firstName` | `given_name` |
| `sn` | Nachname | `lastName` | `family_name` |
| `eduPersonAffiliation` | Rolle (student, staff, faculty, member) | `affiliation` | `affiliation` |
| `eduPersonScopedAffiliation` | Zugehörigkeit mit Scope-Domain | `scopedAffiliation` | `scoped_affiliation` |
| `eduPersonEntitlement` | Entitlement-URIs (Gruppenmitgliedschaften) | `entitlement` | `entitlement` |
| `preferredLanguage` | Spracheinstellung | `locale` | `locale` |
| `schacHomeOrganization` | Domain der Heimateinrichtung | `organization` | `home_organization` |

Die ersten fünf Attribute (eppn, mail, displayName, givenName, sn) sind für die DFN-AAI-Registrierung obligatorisch. Die restlichen fünf sind empfohlen und verbessern die Nutzererfahrung, sind aber für die grundlegende Authentifizierung nicht erforderlich.

### Attribut-Mapper-Konfiguration

Keycloak verwendet Attribut-Mapper, um zwischen SAML und OIDC zu übersetzen. Jeder Mapper definiert:

- **Quellattribut**: Den SAML-Attributnamen aus der Föderation (im Format `urn:oasis:names:tc:SAML:2.0:attrname-format:uri`)
- **Ziel-Claim**: Den OIDC-Claim-Namen, den die Dienste empfangen
- **Transformation**: Optional — einige Attribute erfordern eine Normalisierung (z. B. Abschneiden des Scope von `eduPersonScopedAffiliation`, um den Zugehörigkeitswert zu extrahieren)

Die Mapper werden einmal in den Realm-Einstellungen von Keycloak konfiguriert und gelten für alle Dienste. Dies zentralisiert die Attributverarbeitung — Dienste müssen nichts über SAML oder Föderationsattribute wissen; sie empfangen Standard-OIDC-Claims.

## Protokoll-Dual-Stack: SAML und OIDC

Die Plattform betreibt gleichzeitig SAML 2.0 und OpenID Connect. Dies ist keine Redundanz — es ist eine Notwendigkeit, die durch die heterogene Dienstelandschaft im Hochschulbereich bedingt ist.

### Warum beide Protokolle

Moderne Webanwendungen (Nextcloud, OpenProject, Zammad, CryptPad) unterstützen OIDC nativ. OIDC bietet JSON Web Tokens (JWT), eine einfachere Konfigurationsoberfläche und bessere Unterstützung für mobile und SPA-Clients. Für diese Dienste ist OIDC die natürliche Wahl.

Viele bildungsspezifische Anwendungen (ILIAS, Moodle, BigBlueButton) haben jedoch tiefe SAML-Integrationen, die über Jahre von Föderationsarbeit aufgebaut wurden. Ihre Authentifizierungs-Plugins erwarten SAML-Assertions, SP-initiierte Flows und Attribut-Statements in einem spezifischen Format. Eine Umschreibung auf OIDC wäre ein erheblicher Aufwand und würde die Kompatibilität mit bestehenden Föderations-Setups brechen.

Keycloak löst dies, indem es beide Protokolle spricht. Es empfängt SAML von der Föderation und kann entweder SAML oder OIDC an nachgelagerte Dienste ausgeben. Dienste, die SAML benötigen, erhalten einen Shibboleth-SP; Dienste, die OIDC bevorzugen, verbinden sich direkt mit Keycloak.

### Shibboleth Service Provider

Shibboleth fungiert als SAML-SP für Dienste, die ihn benötigen. Der Ablauf ist:

1. Nutzer greift auf einen SAML-basierten Dienst zu (z. B. Moodle)
2. Der Dienst leitet zum Shibboleth-SP weiter
3. Der Shibboleth-SP leitet zu Keycloak weiter (als IdP fungierend)
4. Keycloak authentifiziert den Nutzer (über Föderation, falls keine Sitzung, oder über SSO, falls Sitzung vorhanden)
5. Keycloak stellt eine SAML-Assertion an den Shibboleth-SP aus
6. Der Shibboleth-SP übergibt die Assertion mit den erwarteten Attributen an den Dienst

Jeder SAML-basierte Dienst hat seine eigene Shibboleth-SP-Konfiguration mit dienstspezifischen Attributfiltern. Das bedeutet, dass ILIAS, Moodle und BigBlueButton jeweils nur die Attribute erhalten, die sie benötigen — nicht die vollständige Attributmenge aus der Föderation.

## Nubus: Das nutzerseitige Portal

Während Keycloak die protokollebene Authentifizierung behandelt, bietet Nubus die nutzerseitige Schicht der Identitätsarchitektur. Nubus (v1.18.1, AGPL-3.0) ist ein Self-Service-Portal, das vor Keycloak sitzt und Endnutzern einen zentralen Ort zur Verwaltung ihrer Identität bietet.

### Was Nubus tut

- **Self-Service-Passwortzurücksetzung**: Nutzer können ihr Passwort ohne Administratorkontakt zurücksetzen, über einen Verifizierungsablauf (E-Mail oder Sicherheitsfragen)
- **Profilverwaltung**: Nutzer sehen und bearbeiten ihr Profil (Anzeigename, E-Mail, Spracheinstellung)
- **Gruppenverwaltung**: Nutzer können ihre Gruppenmitgliedschaften sehen und, falls erlaubt, Gruppen beitreten oder verlassen
- **Applikationsstarter**: Ein Dashboard der verfügbaren Dienste mit direkten Links, die den Anmeldefluss umgehen (SSO übernimmt die Authentifizierung)
- **Audit-Protokollierung**: Administrative Aktionen werden für Compliance und Fehlerbehebung protokolliert

### Was Keycloak tut (vs. Nubus)

Keycloak bleibt der Identity Provider. Es behandelt:
- Föderation (SAML zu DFN-AAI/eduGAIN)
- Token-Ausstellung (OIDC an Dienste)
- Sitzungsverwaltung (SSO über Dienste hinweg)
- Protokoll-Brokering (SAML ↔ OIDC)
- Nutzerattributspeicherung und -zuordnung

Nubus ersetzt Keycloak nicht — es umschließt es. Nubus ruft die Admin-REST-API von Keycloak auf, um nutzerseitige Operationen durchzuführen, und bietet eine freundlichere Oberfläche als die Keycloak-eigene Admin-Konsole (die für Administratoren, nicht für Endnutzer konzipiert ist).

## Sicherheitsgrenzen und Fehlermodi

### Vertrauensgrenzen

Die Plattform hat drei Vertrauensgrenzen:

1. **Föderation → Plattform**: Die Plattform vertraut den SAML-Assertions der Föderation. Wenn ein DFN-AAI-IdP bestätigt, dass ein Nutzer `max.mustermann@uni-example.de` mit der Zugehörigkeit `student` ist, akzeptiert die Plattform dies. Das Vertrauen ist in den Föderationsmetadaten verankert, die kryptografisch signiert sind.

2. **Keycloak → Dienste**: Dienste vertrauen den OIDC-Tokens von Keycloak. Jeder Dienst validiert die JWT-Signatur gegen die öffentlichen Schlüssel von Keycloak. Ein Dienst sieht nie die Föderationsattribute direkt — er sieht nur die normalisierten OIDC-Claims, die Keycloak ausstellt.

3. **Nutzer → IdP**: Der Nutzer authentifiziert sich an seinem Heimat-IdP mit der Methode, die die Einrichtung bereitstellt (Passwort, MFA, Smartcard). Die Plattform hat keine Sichtbarkeit in diese Interaktion.

### Fehlermodi

**IdP nicht verfügbar**: Wenn der Heimat-IdP des Nutzers ausgefallen ist, schlägt die föderierte Anmeldung fehl. Keycloak zeigt eine Fehlermeldung. Lokal bereitgestellte Nutzer (Administratoren, Service-Konten) können sich weiterhin direkt über Keycloak anmelden, sodass die Plattform verwaltbar bleibt.

**Veraltete Föderationsmetadaten**: Föderationsmetadaten haben eine Gültigkeitsdauer. Wenn die Kopie der Plattform veraltet ist (z. B. hat DFN-AAI seine Signierschlüssel rotiert und die Plattform hat nicht aktualisiert), schlägt die Authentifizierung für alle föderierten Nutzer fehl. Keycloak aktualisiert Metadaten automatisch nach einem konfigurierbaren Zeitplan (typischerweise alle 6–12 Stunden), aber Administratoren sollten die Metadatenaktualität überwachen.

**Unzureichende Attribute**: Wenn der IdP weniger Attribute als erwartet freigibt (z. B. fehlt `eduPersonAffiliation`), behandeln die Mapper von Keycloak die Lücke graceful — der Nutzer wird authentifiziert, hat aber möglicherweise eingeschränkte Funktionalität (keine rollenbasierte Zugriffskontrolle, keine personalisierte Oberfläche). Die Plattform protokolliert die fehlenden Attribute, sodass Administratoren mit dem IdP zusammenarbeiten können, um sie freizugeben.

**Token-Ablauf**: OIDC-Access-Tokens haben eine kurze Lebensdauer (typischerweise 5–15 Minuten). Dienste verwenden Refresh-Tokens, um neue Access-Tokens zu erhalten, ohne sich erneut zu authentifizieren. Wenn auch das Refresh-Token abläuft, wird der Nutzer durch den vollständigen Authentifizierungsfluss geleitet. Dies ist für den Nutzer transparent, wenn er eine aktive Keycloak-Sitzung hat (SSO).

## Lokale Nutzerkonten

Nicht alle Nutzer kommen über die Föderation. Die Plattform unterstützt lokal bereitgestellte Konten in Keycloak für:

- **Administratoren**: Plattform-Betreiber, die unabhängig vom Föderationsstatus Zugriff benötigen
- **Service-Konten**: Automatisierte Systeme, die sich über Client-Credentials authentifizieren (keine interaktive Anmeldung)
- **Testnutzer**: Konten für Tests und Evaluierung, bevor die Föderation konfiguriert ist

Lokale Konten werden in der Keycloak-Admin-Konsole oder über das Nubus-Portal verwaltet. Sie koexistieren mit föderierten Konten — beide Typen können gleichzeitig aktiv sein, und derselbe Nutzer kann sowohl eine föderierte als auch eine lokale Identität haben (obwohl dies unüblich ist und eine sorgfältige Attributzuordnung erfordert, um Duplikate zu vermeiden).

## Compliance und Datenschutz

Die Identitätsarchitektur ist nach Datenschutzprinzipien gestaltet:

- **Minimale Attributfreigabe**: Die Plattform fordert nur die Attribute, die sie benötigt. Sie speichert keine sensiblen Attribute (z. B. Personalausweisnummern, biometrische Daten) aus der Föderation.
- **Keine Passwortspeicherung für föderierte Nutzer**: Die Plattform sieht oder speichert niemals das institutionelle Passwort des Nutzers. Die Authentifizierung erfolgt am IdP; die Plattform empfängt nur Assertions.
- **DSGVO-Ausrichtung**: Nutzerdaten (Name, E-Mail, Zugehörigkeit) werden für den Zweck der Authentifizierung und Dienstbereitstellung verarbeitet. Die Einrichtungen sind für ihre Rechtsgrundlage der Verarbeitung als Datenverantwortlicher verantwortlich.
- **Audit-Trail**: Keycloak protokolliert Authentifizierungsereignisse (erfolgreiche und fehlgeschlagene Anmeldungen, Token-Ausstellung, Sitzungserstellung). Diese Protokolle unterstützen die Incident-Untersuchung und Compliance-Nachweise.

Einen breiteren Überblick über Sicherheit und Compliance über die Plattform hinweg finden Sie im Artikel [Sicherheitsarchitektur](/architecture/security).

---

## Weiterführende Literatur

- [Systemarchitektur-Übersicht](/architecture/overview) — die vollständige Plattformarchitektur
- [Komponenten-Alternativen](/architecture/component-alternatives) — E-Mail-, Video-, Dateispeicher- und Whiteboard-Auswahl
- [Föderierte Identität für die Bildung](/blog/dfn-aai-federation-shared-evaluation) — Blog-Beitrag zur DFN-AAI-Integration und dem Aufruf für eine gemeinsame Evaluationsinstanz
- [Netzwerk- und Datenflussarchitektur](/architecture/networking-traffic-flow) — wie Datenverkehr in den Cluster gelangt und Dienste erreicht
- [Speicher- und Datenverwaltungsarchitektur](/architecture/storage-data-management) — persistenter Speicher, Datenbanken und Backup-Integration

---

*Authentifizierung ist das Tor zu jedem Dienst. Wenn sie funktioniert, denken Nutzer nie daran. Wenn sie fehlerhaft ist, ist nichts anderes wichtig.*
