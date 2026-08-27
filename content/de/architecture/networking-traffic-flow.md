---
title: "Netzwerk- und Datenflussarchitektur"
date: "2026-08-27"
description: "Wie Netzwerkverkehr in den openDesk-Edu-Cluster gelangt, DNS, TLS-Terminierung, Ingress-Routing und Netzwerkrichtlinien durchläuft, um Dienste zu erreichen — der vollständige Datenflusspfad."
categories: ["architecture", "infrastructure"]
tags: ["architektur", "netzwerk", "dns", "tls", "ingress", "traefik", "zertifikate", "netzwerkrichtlinien", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/networking-traffic-flow-teaser.svg"
---

# Netzwerk- und Datenflussarchitektur

Jede Anfrage an die Plattform — sei es von einem Studierenden, der E-Mails abruft, einer Professorin, die Vorlesungsmaterialien hochlädt, oder einem Administrator, der Dienste konfiguriert — durchläuft denselben Netzwerkpfad. Das Verständnis dieses Pfads ist unerlässlich für Betreiber, die Konnektivitätsprobleme beheben, Kapazitäten planen oder Sicherheitsrichtlinien implementieren müssen. Dieser Artikel dokumentiert den vollständigen Datenfluss: von der DNS-Auflösung über TLS-Terminierung, Ingress-Routing und Netzwerkrichtlinien-Erzwingung bis hin zum einzelnen Dienst-Pod.

Für die Identitätsschicht, die den Verkehr nach der Ankunft authentifiziert, siehe [Identitäts- und Authentifizierungsarchitektur](/architecture/identity-authentication). Für die vollständige Plattformübersicht siehe [Systemarchitektur-Übersicht](/architecture/overview).

## Der Datenflusspfad

Wenn der Browser eines Nutzers `https://cloud.example.edu` anfragt, durchläuft die Anfrage mehrere Schichten, bevor sie den Anwendungs-Pod erreicht. Jede Schicht hat eine spezifische Verantwortung, und das Verständnis ihrer Reihenfolge ist der Schlüssel zur Diagnose jedes Konnektivitätsproblems.

```
Nutzer-Browser
    │
    ▼
DNS-Auflösung ──► IP-Adresse des Ingress-Controllers
    │
    ▼
TLS-Terminierung ──► Zertifikat präsentiert, HTTPS-Handshake
    │
    ▼
Ingress-Controller (Traefik) ──► Routing-Regel abgeglichen, Host-Header inspiziert
    │
    ▼
Netzwerkrichtlinie ──► Pod-zu-Pod-Verkehr erlaubt/abgelehnt
    │
    ▼
Service (Kubernetes-Service) ──► Lastverteilt auf einen gesunden Pod
    │
    ▼
Anwendungs-Pod ──► Anfrage verarbeitet, Antwort zurückgegeben
```

### Schicht 1: DNS-Auflösung

Die Reise beginnt mit DNS. Wenn ein Nutzer `cloud.example.edu` in seinen Browser eingibt, fragt der Browser seinen konfigurierten DNS-Resolver ab, der der Kette von der Root-Zone über die Top-Level-Domain (`.edu`) zu den autoritativen Nameservern der Einrichtung folgt.

Die DNS-Konfiguration der Einrichtung ordnet jeden Dienst-Hostnamen der Ingress-IP-Adresse des Clusters zu. Ein typisches Setup verwendet Wildcard-DNS oder einzelne A/AAAA-Einträge:

- `cloud.example.edu` → Ingress-IP (Nextcloud)
- `meet.example.edu` → Ingress-IP (BigBlueButton)
- `auth.example.edu` → Ingress-IP (Keycloak)
- `portal.example.edu` → Ingress-IP (Nubus)

Alle Dienste teilen sich dieselbe Ingress-IP. Die Differenzierung erfolgt auf der Ingress-Controller-Schicht (Schicht 3), die den `Host`-Header inspiziert, um den Verkehr an den richtigen Dienst weiterzuleiten. Dies bedeutet, dass eine einzige IP-Adresse die gesamte Plattform bedient — der Ingress-Controller fungiert als Reverse-Proxy und verteilt den Verkehr basierend auf dem Hostnamen.

Einige Einrichtungen verwenden einen Wildcard-DNS-Eintrag (`*.example.edu`), der auf die Ingress-IP zeigt, was die Konfiguration beim Hinzufügen neuer Dienste vereinfacht. Andere bevorzugen einzelne Einträge für eine strengere Kontrolle. Beide Ansätze funktionieren; die Wahl ist eine betriebliche Präferenz.

### Schicht 2: TLS-Terminierung

Wenn der Browser eine Verbindung zur Ingress-IP auf Port 443 herstellt, präsentiert der Ingress-Controller ein TLS-Zertifikat. Dieses Zertifikat beweist die Identität des Servers und verschlüsselt die Verbindung. Die Plattform behandelt TLS auf der Ingress-Schicht — einzelne Anwendungs-Pods benötigen keine eigenen Zertifikate.

#### Zertifikatsquellen

Die Plattform unterstützt mehrere Zertifikatsquellen:

- **openDesk Certificates (Bundesdruckerei)**: Die Standard- und empfohlene Quelle. Die Einrichtung erhält TLS-Zertifikate von der Bundesdruckerei, die Zertifikate unter institutioneller Kontrolle bereitstellt. Dies hält die Vertrauenskette vollständig innerhalb der Einrichtung — keine externe Zertifizierungsstelle ist beteiligt.
- **cert-manager mit Let's Encrypt**: Für Einrichtungen, die automatische Zertifikatsausstellung bevorzugen. cert-manager integriert sich mit dem ACME-Protokoll, um Let's-Encrypt-Zertifikate automatisch zu erhalten und zu erneuern. Dies eignet sich für Evaluierungsumgebungen oder Einrichtungen ohne vorhandene PKI.
- **Custom CA / institutionelle PKI**: Einrichtungen mit eigener Zertifizierungsstelle können Zertifikate direkt importieren. Dies ist in größeren Universitäten üblich, die ihre eigene PKI-Infrastruktur betreiben.

#### Zertifikatsverwaltung

Unabhängig von der Quelle werden Zertifikate als Kubernetes-TLS-Secrets verwaltet. Der Ingress-Controller referenziert diese Secrets in seiner TLS-Konfiguration. Die Zertifikatserneuerung ist automatisiert:

- **openDesk Certificates**: Erneuerung über den Beschaffungsprozess der Einrichtung. Die Plattform überwacht den Zertifikatsablauf und warnt Betreiber vor der notwendigen Erneuerung.
- **cert-manager / Let's Encrypt**: Automatische Erneuerung 30 Tage vor Ablauf. cert-manager behandelt die ACME-Challenge (HTTP-01 oder DNS-01) und aktualisiert das TLS-Secret ohne Eingreifen des Betreibers.
- **Custom CA**: Erneuerung hängt von den CA-Richtlinien der Einrichtung ab. Betreiber müssen das TLS-Secret vor Ablauf manuell ersetzen.

#### TLS-Konfiguration

Die Plattform erzwingt moderne TLS-Standards:

- **TLS 1.2 Minimum** (TLS 1.3 bevorzugt, wo unterstützt)
- **HSTS** (HTTP Strict Transport Security) mit langer max-age, einschließlich Subdomains
- **Moderne Cipher-Suite** (kein RC4, kein 3DES, kein SHA1)
- **OCSP-Stapling**, wo von der Zertifikatsquelle unterstützt

Der gesamte HTTP-Verkehr wird zu HTTPS weitergeleitet. Kein unverschlüsselter Verkehr erreicht die Anwendungs-Pods. Der Ingress-Controller behandelt die Weiterleitung (301), bevor er eine Anfrage weiterleitet.

### Schicht 3: Ingress-Controller (Traefik)

Der Ingress-Controller ist die Eingangstür der Plattform. Er empfängt den gesamten eingehenden HTTPS-Verkehr, inspiziert den `Host`-Header, gleicht Routing-Regeln ab und leitet die Anfrage an den entsprechenden Kubernetes-Service weiter.

#### Warum Traefik

Traefik ist der Standard-Ingress-Controller der Plattform. Er wurde gewählt für:

- **Dynamische Konfiguration**: Traefik liest Ingress-Ressourcen von der Kubernetes-API in Echtzeit. Das Hinzufügen eines neuen Dienstes erfordert kein Neuladen des Controllers — Traefik erkennt den neuen Ingress und leitet Verkehr sofort weiter.
- **Let's-Encrypt-Integration**: Eingebauter ACME-Client für automatische Zertifikatsverwaltung (bei Verwendung von Let's Encrypt als Zertifikatsquelle).
- **Middleware-Unterstützung**: Traefik-Middlewares behandeln Ratenbegrenzung, Authentifizierungsweiterleitung, Header-Manipulation und Weiterleitungserzwingung.
- **Native Kubernetes-Integration**: Traefik verwendet die Standard-Kubernetes-Ingress-API und unterstützt IngressRoute (Traefiks Custom Resource) für erweiterte Konfigurationen.
- **Observability**: Eingebaute Metriken (Prometheus) und Tracing (OpenTelemetry) für Verkehrsanalyse und Fehlerbehebung.

Einige Einrichtungen setzen HAProxy neben Traefik für spezifische Lastverteilungs-Szenarien ein (z. B. BigBlueButtons UDP-Verkehr für Video, den Traefik nicht nativ behandelt). In diesen Setups behandelt Traefik HTTP/HTTPS und HAProxy den Nicht-HTTP-Verkehr.

#### Routing-Regeln

Routing wird durch Kubernetes-Ingress-Ressourcen (oder IngressRoute-CRDs) konfiguriert. Jeder Dienst hat seine eigene Ingress-Definition, die Folgendes angibt:

- **Host**: Der Hostname, der diese Route auslöst (z. B. `cloud.example.edu`)
- **Pfad**: Optionales pfadbasiertes Routing (z. B. `/api` vs. `/web`)
- **Service**: Der Ziel-Kubernetes-Service und Port
- **TLS**: Referenz auf das TLS-Secret für diesen Host
- **Middlewares**: Ratenbegrenzung, Header-Manipulation usw.

Der Ingress-Controller wertet diese Regeln für jede eingehende Anfrage aus. Die erste übereinstimmende Regel gewinnt. Wenn keine Regel übereinstimmt, gibt der Controller einen 404 zurück.

#### Ratenbegrenzung und Sicherheits-Middlewares

Der Ingress-Controller wendet mehrere Middlewares auf jede Anfrage an:

- **Ratenbegrenzung**: Schützt vor Brute-Force-Angriffen und Missbrauch. Limits werden pro Dienst konfiguriert und können basierend auf den Verkehrsmustern des Dienstes angepasst werden.
- **Sicherheits-Header**: Fügt `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection` und `Content-Security-Policy`-Header hinzu.
- **Anfragengrößenlimits**: Verhindert, dass übergroße Payloads Dienste überlasten.
- **Timeout-Erzwingung**: Verhindert Slow-Loris-Angriffe durch Erzwingung von Verbindungs- und Lese-Timeouts.

### Schicht 4: Netzwerkrichtlinien

Sobald der Ingress-Controller Verkehr an einen Kubernetes-Service weiterleitet, regeln Netzwerkrichtlinien, welche Pods mit welchen anderen Pods kommunizieren können. Netzwerkrichtlinien sind die Kubernetes-native Methode zur Erzwingung von Netzwerksegmentierung.

#### Default-Deny-Modell

Die Plattform verwendet ein Default-Deny-Modell: Der gesamte Pod-zu-Pod-Verkehr wird abgelehnt, es sei denn, er ist explizit erlaubt. Das bedeutet:

- Ein Web-Frontend-Pod kann das Datenbank-Pod erreichen (weil eine Richtlinie es erlaubt)
- Ein Web-Frontend-Pod kann das Datenbank-Pod eines anderen Mandanten nicht erreichen (weil keine Richtlinie es erlaubt)
- Ein Angreifer, der einen Pod kompromittiert, kann nicht beliebig zu anderen Diensten wechseln (weil die Netzwerkrichtlinien die laterale Bewegung einschränken)

#### Namespace-Isolation

Die Plattform verwendet Kubernetes-Namespaces zur logischen Isolation zwischen Dienstgruppen:

- Jeder Hauptdienst (oder Gruppe verwandter Dienste) läuft in seinem eigenen Namespace
- Netzwerkrichtlinien steuern den Verkehr zwischen Namespaces
- Namespace-übergreifende Kommunikation ist explizit (eine Richtlinie muss sie erlauben) und nicht implizit

Diese Namespace-Struktur bietet Blast-Radius-Eindämmung: Wenn ein Dienst kompromittiert wird, ist die Fähigkeit des Angreifers, andere Dienste zu erreichen, durch die Netzwerkrichtlinien zwischen Namespaces begrenzt.

#### Typische Richtlinienmuster

Häufige Netzwerkrichtlinienmuster umfassen:

- **Frontend → Backend**: Eine Richtlinie, die dem Web-Frontend-Namespace erlaubt, den Backend-API-Namespace auf bestimmten Ports zu erreichen
- **Backend → Datenbank**: Eine Richtlinie, die dem Backend-Namespace erlaubt, den Datenbank-Namespace nur auf dem Datenbank-Port zu erreichen
- **Ingress → Alle**: Eine Richtlinie, die dem Ingress-Controller-Namespace erlaubt, alle Dienst-Namespaces auf HTTP/HTTPS-Ports zu erreichen
- **Monitoring → Alle**: Eine Richtlinie, die dem Monitoring-Namespace (Prometheus) erlaubt, Metrik-Endpunkte in allen Namespaces zu scrapen

Jede Richtlinie ist auf die minimal notwendigen Berechtigungen beschränkt. Keine Richtlinie erlaubt "allen Verkehr zu allen Pods" — das würde den Zweck der Netzwerksegmentierung zunichte machen.

### Schicht 5: Service und Pod

Die letzte Schicht ist der Anwendungs-Pod selbst. Nachdem der Verkehr DNS, TLS, Ingress und Netzwerkrichtlinien durchlaufen hat, erreicht er den Kubernetes-Service, der über gesunde Pods lastverteilt.

#### Service-Discovery

Kubernetes-Services bieten stabile virtuelle IP-Adressen (ClusterIPs), die Verkehr an gesunde Pods weiterleiten. Wenn ein Pod erstellt, zerstört oder ungesund wird, aktualisiert der Service automatisch seine Endpunktliste. Die Anwendung muss nichts über Pod-Lebenszyklusänderungen wissen — sie bedient einfach Anfragen.

#### Pod-Level-Kommunikation

Innerhalb eines Pods kommunizieren Container über `localhost`. Zwischen Pods im selben Namespace verwendet die Kommunikation die ClusterIP. Zwischen Namespaces verwendet die Kommunikation den vollqualifizierten Service-Namen (z. B. `database.backend-namespace.svc.cluster.local`).

## DNS-Architektur

### Externes DNS

Die externe DNS-Konfiguration der Einrichtung ordnet öffentliche Hostnamen der Ingress-IP des Clusters zu. Dies ist der Einstiegspunkt für den gesamten externen Verkehr.

### Internes DNS (CoreDNS)

Innerhalb des Clusters behandelt CoreDNS die Service-Discovery. Jeder Kubernetes-Service erhält einen DNS-Eintrag:

- `servicename.namespace.svc.cluster.local` — der vollqualifizierte Name
- `servicename.namespace` — der Kurzname (innerhalb desselben Clusters)
- `servicename` — der kürzeste Name (innerhalb desselben Namespaces)

Anwendungen verwenden diese DNS-Namen, um andere Dienste zu erreichen. Zum Beispiel verbindet sich ein Frontend-Pod mit der Datenbank über `database.backend:3306` statt über eine IP-Adresse. Diese Abstraktion bedeutet, dass Pods verschoben, neu gestartet und skaliert werden können, ohne Konfigurationsänderungen.

### Benutzerdefinierte DNS-Einträge

Die Plattform unterstützt benutzerdefinierte DNS-Einträge für Dienste, die spezifische Hostnamen-Konfigurationen benötigen (z. B. erfordern Keycloaks SAML-Endpunkte exakte Hostnamen-Übereinstimmung). Diese werden durch CoreDNS-Konfigurationen oder ExternalName-Services konfiguriert.

## TLS-Zertifikatsverwaltung

### Die Vertrauenskette

Die TLS-Vertrauenskette der Plattform ist so konzipiert, dass die gesamte Kontrolle innerhalb der Einrichtung bleibt:

1. **Vertrauenswurzel**: Die Zertifizierungsstelle der Einrichtung (oder Bundesdruckerei für openDesk Certificates) signiert die TLS-Zertifikate
2. **Zertifikatspeicherung**: Zertifikate werden als Kubernetes-TLS-Secrets gespeichert, zugänglich nur für den Ingress-Controller und Dienste, die sie benötigen
3. **Zertifikatspräsentation**: Der Ingress-Controller präsentiert das Zertifikat dem Client während des TLS-Handshakes
4. **Zertifikatserneuerung**: Erneuerung ist automatisiert (cert-manager) oder überwacht (Custom CA), sodass kein Zertifikat ohne Eingreifen abläuft

### Zertifikatsumfang

Jeder Hostname erhält ein eigenes Zertifikat, oder ein Wildcard-Zertifikat deckt alle Subdomains ab. Die Wahl hängt von der PKI der Einrichtung ab:

- **Einzelzertifikate**: Engere Sicherheit (jedes Zertifikat ist unabhängig), aber mehr Zertifikate zu verwalten
- **Wildcard-Zertifikate**: Einfachere Verwaltung (ein Zertifikat für alle Subdomains), aber ein kompromittiertes Wildcard-Zertifikat betrifft alle Dienste

Die Plattform unterstützt beide Ansätze. Die Standardkonfiguration verwendet einzelne Zertifikate pro Dienst, aber Wildcard-Zertifikate werden für Einrichtungen unterstützt, die sie bevorzugen.

## Netzwerk-Sicherheitsstatus

### Verschlüsselung im Transit

Der gesamte Verkehr ist verschlüsselt:

- **Externer Verkehr**: HTTPS (TLS 1.2+) zwischen dem Browser des Nutzers und dem Ingress-Controller
- **Interner Verkehr**: Verkehr zwischen Pods kann mit mTLS (mutual TLS) verschlüsselt werden, dies hängt jedoch von der Service-Mesh-Konfiguration ab. Standardmäßig ist Pod-zu-Pod-Verkehr innerhalb des Clusters unverschlüsselt (verlässt sich auf Netzwerkrichtlinien für Isolation), aber mTLS kann für Dienste aktiviert werden, die es benötigen.

### DDoS-Schutz

Der Ingress-Controller bietet grundlegenden DDoS-Schutz durch Ratenbegrenzung und Verbindungslimits. Für Einrichtungen, die ausgeklügelten Angriffen ausgesetzt sind, kann ein externer DDoS-Schutzdienst (z. B. der Upstream-Provider der Einrichtung oder ein dedizierter DDoS-Schutzdienst) vor das Cluster geschaltet werden.

### Firewall-Integration

Die Host-Firewall des Clusters (z. B. iptables, nftables oder die Security-Groups des Cloud-Providers) beschränkt eingehenden Verkehr auf die Ports, die die Plattform benötigt:

- **Port 443 (HTTPS)**: Der gesamte Nutzerverkehr
- **Port 80 (HTTP)**: Nur Weiterleitung zu HTTPS (kein Anwendungsverkehr)
- **Port 22 (SSH)**: Nur administrativer Zugriff, beschränkt auf Verwaltungsnetzwerke

Alle anderen eingehenden Ports sind geschlossen. Inter-Pod-Verkehr wird durch Kubernetes-Netzwerkrichtlinien geregelt, nicht durch die Host-Firewall.

## Fehlermodi und Fehlerbehebung

### DNS-Auflösungsfehler

**Symptom**: Nutzer sehen „Diese Website kann nicht erreicht werden" oder `NXDOMAIN`-Fehler.
**Ursache**: DNS-Einträge sind falsch konfiguriert oder der DNS-Provider ist nicht verfügbar.
**Lösung**: Überprüfen Sie, dass die A/AAAA-Einträge auf die richtige Ingress-IP zeigen. Prüfen Sie die DNS-Propagation mit `dig` oder `nslookup`.

### TLS-Zertifikatsablauf

**Symptom**: Nutzer sehen „Ihre Verbindung ist nicht privat" oder `NET::ERR_CERT_DATE_INVALID`.
**Ursache**: Ein TLS-Zertifikat ist abgelaufen.
**Lösung**: Für cert-managed-Zertifikate prüfen Sie die cert-manager-Logs und den Certificate-Ressourcen-Status. Für Custom-CA-Zertifikate ersetzen Sie das TLS-Secret durch ein erneuertes Zertifikat.

### Ingress-Routing-Fehler

**Symptom**: Nutzer sehen einen 404- oder 502-Fehler.
**Ursache**: Die Ingress-Ressource ist falsch konfiguriert, der Ziel-Service hat keine gesunden Pods, oder die Ingress-Klasse ist falsch.
**Lösung**: Überprüfen Sie die Ingress-Ressource (`kubectl get ingress`), verifizieren Sie, dass der Service Endpunkte hat (`kubectl get endpoints`), und prüfen Sie das Traefik-Dashboard auf Routing-Regeln.

### Netzwerkrichtlinien-Ablehnung

**Symptom**: Ein Dienst kann einen anderen Dienst nicht erreichen (Timeout oder Connection Refused).
**Ursache**: Eine Netzwerkrichtlinie blockiert den Verkehr.
**Lösung**: Überprüfen Sie die Netzwerkrichtlinien in beiden Namespaces (Quelle und Ziel). Verwenden Sie `kubectl exec`, um die Konnektivität vom Quell-Pod zu testen. Lockern Sie die Richtlinie vorübergehend, um die Diagnose zu bestätigen, und beschränken Sie sie dann auf die minimal notwendigen Berechtigungen.

---

## Weiterführende Literatur

- [Systemarchitektur-Übersicht](/architecture/overview) — die vollständige Plattformarchitektur
- [Identitäts- und Authentifizierungsarchitektur](/architecture/identity-authentication) — wie die Authentifizierung funktioniert, sobald Verkehr ankommt
- [Sicherheitsarchitektur](/architecture/security) — Sicherheitskontrollen, Secrets, RBAC und Compliance
- [Speicher- und Datenverwaltungsarchitektur](/architecture/storage-data-management) — persistenter Speicher, Datenbanken und Backups
- [Sicherheit und Compliance](/blog/security-compliance) — Blog-Beitrag zum Sicherheits- und Compliance-Ansatz der Plattform
- [Sovereign Cloud: SCS vs Proxmox + K3s](/blog/scs-vs-proxmox-k3s) — Blog-Beitrag zum Infrastrukturplattform-Vergleich

---

*Jede Anfrage erzählt eine Geschichte, während sie vom Browser zum Pod reist. Den Pfad zu kennen, bedeutet zu wissen, wo man suchen muss, wenn etwas schiefgeht.*
