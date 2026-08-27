# Angebot: Föderale Studierenden-E-Mail und Kollaborationsinfrastruktur für die deutsche Hochschullandschaft

**Föderal. Souverän. Quelloffen.**

---

## Zusammenfassung

Dieser Beitrag schlägt eine föderierte, quelloffene E-Mail- und Kollaborationsinfrastruktur für **2,8 Millionen Studierende** in Deutschland vor — nicht als zentrale Plattform, sondern als föderales Modell, das die Struktur der deutschen Bildungspolitik abbildet: eine Instanz je Bundesland, gewahrte Hochschulautonomie, Föderation über Standardprotokolle, koordiniert über den DFN.

**Architektur:** Drei Schichten — DFN-Gemeinschaftsdienste (neutrales Backbone), Landesinstanzen (eine je Bundesland), institutionelle Autonomie (Mandanten oder Eigenbetrieb).

**Kosten (konservative Schätzung):** ~4,0–7,4 Mio. € über 3 Jahre (13 Instanzen + DFN-Gemeinsames), ~0,04–0,07 € pro Studierende/Monat (E-Mail-fokussiert). Gegenüber geschätzten 40–80 Mio. €/Jahr aktuelle Ausgaben eine erhebliche Reduzierung.

**Datensouveränität:** Alle Daten verbleiben in der jeweiligen Landeszuständigkeit. Kein CLOUD Act, kein Vendor-Lock-in. Lizenzen: AGPL-3.0 (Stalwart, Nextcloud, Matrix), Apache-2.0 (Keycloak), MPL-2.0 (weitere).

---

## 1. Ausgangslage

### 1.1 Status quo

| | Aktuell |
|---|---|
| **E-Mail-Anbieter** | ~400 Einrichtungen, überwiegend individuelle Mailserver oder kommerzielle Cloud |
| **Lizenzen** | Gemischt: kostenlose Bildungslizenzen (mit Datenabfluss) oder teure On-Premise-Lizenzen |
| **Datenhaltung** | Daten fließen in ausländische Rechenzentren (USA, Irland, Niederlande) |
| **Interoperabilität** | Einrichtungen sind voneinander isoliert; Kollaboration über private Dropbox/WhatsApp/Signal |
| **Kosten** | Geschätzt 40–80 Mio. €/Jahr Gesamt für den Hochschulbereich (Personal + Lizenzen), verteilt über ~400 Budgets |

### 1.2 Rechtlicher und föderaler Rahmen

- **Kulturhoheit der Länder (Art. 30, 70 GG):** Bildungspolitik ist Ländersache. Ein Bundesmandat ist weder realistisch noch wünschenswert.
- **Hochschulautonomie (Art. 5 Abs. 3 GG):** Universitäten haben institutionelle Autonomie. Das Modell muss Eigenbetrieb允许en.
- **DSGVO / Landesdatenschutz:** Jedes Land hat eine eigene Datenschutzbehörde (*Landesdatenschutzbeauftragter*). Eine zentrale Lösung müsste bis zu 16 Behörden befriedigen; das föderale Modell hält Daten in der jeweiligen Landeszuständigkeit.
- **Vergaberecht (VgV, UVgO):** Land-level Beschaffung folgt bekannten Regeln.
- **EU Cloud Act / US CLOUD Act:** Daten bei US-Anbietern sind US-Zugriffsanordnungen ausgesetzt. Der EuGH (Schrems II) hat die Wirksamkeit von SCCs eingeschränkt.
- **Förderung:** Der bestehende *Digitalpakt Schule* gilt für Schulen. Für Hochschulen wäre ein vergleichbares Instrument nach Art. 104b GG (Bund finanziert, Länder führen aus) zu schaffen oder eine bestehende Hochschul-Förderlinie umzuwidmen.

### 1.3 Warum jetzt?

Die Technology Readiness ist gegeben: Stalwart Mail (Rust-basiert, horizontal skalierbar) und die openDesk-Komponenten sind produktionsreif. Der DFN stellt das Netz und die Identitätsföderation (DFN-AAI). Der politische Druck wächst — Föderalismus ist kein Hindernis, sondern der natürliche Rahmen.

---

## 2. Das föderale Drei-Schichten-Modell

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Föderaler Verbund                                 │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SCHICHT 1: DFN-Gemeinschaftsdienste (neutral)               │  │
│  │                                                              │  │
│  │  • DFN-AAI (Identitätsföderation, eduPerson)                │  │
│  │  • Gemeinsame Sicherheitsdienste (DNSBL, MTA-STS, DKIM/DMARC)│  │
│  │  • Technische Standards, Interoperabilität                  │  │
│  │  • Keine Studierendendaten beim DFN                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│                     Föderation (SMTP, Matrix, CalDAV, Nextcloud)    │
│                              │                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SCHICHT 2: Landesinstanzen (eine je Bundesland)             │  │
│  │                                                              │  │
│  │  • Studierenden-Mailboxen (Stalwart Mail)                    │  │
│  │  • Dateispeicher (Nextcloud)                                 │  │
│  │  • Videokonferenz, Messenger (Matrix), Kalender (CalDAV)     │  │
│  │  • Kollaborative Dokumentbearbeitung                         │  │
│  │  • SSO via DFN-AAI                                           │  │
│  │  • Betrieb durch Landes-IT, unter Landes-DSB                 │  │
│  │  • Kleine Länder poolen (Bremen, Saarland) → ~10–13 Inst.   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│                     Föderation (SMTP, Matrix, CalDAV, Nextcloud)    │
│                              │                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SCHICHT 3: Hochschulautonomie (Mandanten oder Eigenbetrieb) │  │
│  │                                                              │  │
│  │  • Universität als Mandant innerhalb der Landesinstanz       │  │
│  │  • Oder: Eigenbetrieb auf eigener Hardware (gleicher Stack)  │  │
│  │  • Eigene Domain, Nutzerverwaltung, Richtlinien              │  │
│  │  • Föderation mit Landesinstanz und anderen Einrichtungen    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.1 Schlüsselentscheidung: Föderation statt Zentralisierung

| | Zentrales Modell (verworfen) | Föderales Modell (vorgeschlagen) |
|---|---|---|
| **Betrieb** | Ein Cluster für alle 2,8 M Studierende | Eine Instanz je Bundesland (~10–13) |
| **Datensouveränität** | Zentral, unter Bundes-Aufsicht | Jedes Land unter eigenem DSB |
| **Kulturhoheit** | Konflikt (Bundesmandat) | Respektiert (Land betreibt) |
| **Hochschulautonomie** | Nur optional (On-Premise für Personal) | Voll gewahrt (Mandant oder Eigenbetrieb) |
| **Vergaberecht** | Bund-Level, komplex | Land-Level, etabliert |
| **Skaleneffekt** | Maximal | Geteilt (13 Instanzen,Shared Services über DFN) |
| **Ausfallrisiko** | Single Point of Failure | Redundant (13 Instanzen) |

---

## 3. Technische Architektur

### 3.1 Landesinstanz (Schicht 2)

Jede Landesinstanz ist für die Studierendenzahl ihres Landes dimensioniert (nicht für die nationale Gesamtzahl). Beispielhafte Konfiguration für ein mittleres Land (~200.000 Studierende):

| Komponente | Knoten | Specs pro Knoten | Funktion |
|---|---|---|---|
| K8s Control Plane | 3 | 8 vCPU, 32 GB RAM | Orchestrierung |
| Mail-Worker (Stalwart) | 3 | 32 vCPU, 128 GB RAM, NVMe | SMTP/IMAP/JMAP, Spam-Scan |
| Storage (Ceph, EC 4+2) | 6 | 16 vCPU, 64 GB RAM, 36×20 TB HDD | ~300 TB nutzbar pro Land |
| Load Balancer | 2 | 8 vCPU, 16 GB RAM, 25 GbE | Traffic-Verteilung |
| Monitoring | 1 | 8 vCPU, 32 GB RAM | Observability |
| **Gesamt** | **~15** | | |

### 3.2 E-Mail-Pipeline (pro Landesinstanz)

```
Internet
  │
  ▼
┌──────────────────────────────────────────────┐
│  Edge (HAProxy + Rspamd)                     │
│  HELO → DNSBL → SPF/DKIM/DMARC → Greylisting │
│  → Rspamd (Bayes, Fuzzy) → ClamAV → Stalwart │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  Stalwart Mail (3 Worker-Nodes)              │
│  SMTP Ingest → IMAP/POP3/JMAP Serving        │
│  → Ceph RBD (erasure-coded 4+2)              │
│  → Tantivy Full-Text-Index                   │
└──────────────────────────────────────────────┘
```

Spam-Behandlung (pro Land, ~20 M E-Mails/Tag bei 200.000 Studierenden):
- 60% vor Scanning rejected (HELO, DNSBL, SPF, Greylisting)
- 25% von Rspamd geblockt (Bayes, Fuzzy, Neural)
- 10% Quarantäne
- 5% legitime Zustellung

### 3.3 DFN-Gemeinschaftsdienste (Schicht 1)

| Dienst | Funktion |
|---|---|
| DFN-AAI | Identitätsföderation (eduPerson, SAML, OIDC) — bereits in Betrieb |
| DNSBL-Reputation | Geteilte Spam-Reputation über alle Landesinstanzen |
| MTA-STS | Verteilung von MTA-STS-Policies |
| DKIM/DMARC-Monitoring | Zentrale Überwachung, lokale Durchsetzung |
| Threat-Intel | Austausch von Indikatoren (IPs, Domains, Hashes) |

### 3.4 Föderation

- **SMTP:** Nativ föderiert — Studierende an Landesinstanz ↔ Beschäftigte an Eigenbetrieb.
- **Matrix/Element:** Föderierter Messenger über Instanz- und Eigenbetriebsgrenzen.
- **CalDAV/CardDAV:** Kalender- und Kontaktfreigaben über Einrichtungsgrenzen.
- **Nextcloud-Federation:** Dateifreigaben zwischen Landesinstanzen und Eigenbetrieb.
- **DFN-AAI:** Studierende authentifizieren sich mit institutionellen Credentials.

---

## 4. Kostenmodell (konservativ, 3-Jahres-TCO)

### 4.1 Landesinstanz

| Komponente | Untergrenze | Obergrenze |
|---|---|---|
| Hardware (Mail, Kollaboration, Storage, Control Plane) | 80.000 € | 150.000 € |
| Colocation und Konnektivität | 45.000 € | 90.000 € |
| Betrieb (0,5–1 VZÄ, geteilt mit Landes-IT) | 120.000 € | 225.000 € |
| **Pro Instanz (3 Jahre)** | **245.000 €** | **465.000 €** |

### 4.2 DFN-Gemeinschaftsdienste

| Komponente | Untergrenze | Obergrenze |
|---|---|---|
| Sicherheitsinfrastruktur | 100.000 € | 200.000 € |
| Koordination und Entwicklung (3–5 VZÄ) | 675.000 € | 1.125.000 € |
| **Gemeinsam (3 Jahre)** | **775.000 €** | **1.325.000 €** |

### 4.3 Gesamtabschätzung (13 Instanzen + Gemeinsames)

| Szenario | Gesamt (3 Jahre) | Pro Studierende/Monat |
|---|---|---|
| Untergrenze | ~4,0 Mio. € | ~0,04 € |
| Zentralschätzung | ~5,7 Mio. € | ~0,06 € |
| Obergrenze | ~7,4 Mio. € | ~0,07 € |

**Annahmen:** E-Mail-fokussiert (1 GB/Studierende). Einschließlich Kollaborationsspeicher (10–20 GB/Studierende) ca. Verdopplung der Untergrenze. Migration, Schulung und Integration nicht enthalten.

**Vergleich:** Aktuelle Ausgaben 40–80 Mio. €/Jahr (120–240 Mio. €/3 Jahre). Das föderale Modell reduziert die aggregierte Infrastrukturkosten erheblich, bei gleichzeitiger Verbesserung der Datensouveränität.

### 4.4 Eigenbetrieb (Schicht 3, optional)

| Größe | Einmalige Hardware | Betrieb/Jahr | Ges./Jahr |
|---|---|---|---|
| Klein (<500 Pers.) | ~3.000 € | ~30.000 € | ~33.000 € |
| Mittel (500–5.000) | ~12.000 € | ~45.000 € | ~57.000 € |
| Groß (>5.000) | ~30.000 € | ~60.000 € | ~90.000 € |

---

## 5. Governance-Modell

### 5.1 Struktur

```
Landes-IT-Organisationen (16 Länder)
  │
  ├── Jedes Land betreibt seine eigene Instanz
  │   (unter eigenem Landesdatenschutzbeauftragten)
  │
  ├── DFN (neutral)
  │   ├── Gemeinschaftsdienste (DNSBL, MTA-STS, Identität)
  │   └── Koordination (technische Standards)
  │
  └── Koordinationsgremium
      ├── Technischer Beirat (Landes-CIOs, DFN)
      ├── Datenschutzbeirat (Landes-DSB)
      └── Nutzungsbeirat (Studierendenvertretung)
```

### 5.2 Finanzierung

- **Landesbudgets:** Proportional zu Studierendenzahlen (Kulturhoheit).
- **Bund-Startfinanzierung:** Digitalpakt-artiger Mechanismus nach Art. 104b GG (falls etabliert).
- **Freiwillige institutionelle Beiträge:** Für erweiterte Dienste (SLA, Support).

### 5.3 Teilnahme

- **Freiwillig** auf allen Ebenen (Land, Einrichtung).
- **Ausstieg:** Datenexport (IMAP, mbox, CalDAV), MX-Record-Änderung, 90-Tage-Frist. Kein Lock-in.
- **Lizenzen:** AGPL-3.0 (Stalwart, Nextcloud, Matrix), Apache-2.0 (Keycloak), MPL-2.0 (weitere). Modifikationen bleiben offen.

---

## 6. Implementierungs-Roadmap

### Phase 0: Vorbereitung (Monat 1–6)

| Schritt | Verantwortlich |
|---|---|
| Koordinationsgremium einberufen | DFN + interessierte Länder |
| Datenschutz-Folgenabschätzung (Art. 35 DSGVO) | Externer DSB + Landes-DSB |
| Technische Standards definieren | Technischer Beirat |
| 1–2 Pilot-Länder identifizieren | Landes-IT-Organisationen |

### Phase 1: Pilot (Monat 7–12)

| Schritt | Verantwortlich |
|---|---|
| 1–2 Landesinstanzen aufsetzen | Pilot-Länder + DFN |
| ~50.000 Studierenden-Mailboxen | Pilot-Länder |
| SSO-Integration via DFN-AAI | DFN + Pilot-Länder |
| Lasttests (~20 M E-Mails/Tag pro Land) | Technischer Beirat |
| Evaluation | Koordinationsgremium |

### Phase 2: Skalierung (Monat 13–24)

| Schritt | Ziel |
|---|---|
| Aufnahme weiterer Länder | 5–8 Länder |
| Eigenbetrieb-Stack veröffentlichen (K3s + Ansible) | 10+ Einrichtungen |
| Matrix-Federation aktivieren | Studierende ↔ Beschäftigte |
| Metadaten-Fluss-Audit (DSGVO) | Datenschutzbeirat |

### Phase 3: Vollbetrieb (Monat 25–36)

| Schritt | Ziel |
|---|---|
| Alle interessierten Länder | 10–13 Instanzen |
| Eigenbetrieb für Beschäftigte | 50+ Einrichtungen |
| Self-Service-Portal | Alle Nutzer |
| Audit (BSI IT-Grundschutz, ISO 27001) | Koordinationsgremium |

---

## 7. Risiken und Gegenmaßnahmen

| Risiko | Wahrscheinlichkeit | Auswirkung | Gegenmaßnahme |
|---|---|---|---|
| Länder wollen eigene Lösung | Hoch | Gering | Föderationsmodell: sie können — aber Kostentransparenz liefern. |
| Kommerzielle Anbieter bieten "kostenlos" an | Hoch | Mittel | Langfristige Gesamtkosten (Personal, Vendor-Lock-in, Datenschutz) aufzeigen. |
| IP-Blacklisting | Mittel | Hoch | Dedizierte IP-Blöcke pro Land, DKIM/DMARC/SPF, DFN-Peerings. |
| Spam-Überlastung | Mittel | Mittel | Rspamd-Edge-Rejection (60% vor Scanning), HPA auf Queue-Depth. |
| Akzeptanz bei Studierenden | Mittel | Hoch | Einfaches Onboarding (SSO), moderne UI, Migration per IMAP-Import. |
| Politische Blockade (Kulturhoheit) | Gering | Hoch | Föderales Modell respektiert Kulturhoheit. Bund finanziert (Art. 104b GG), Länder entscheiden. |
| Kleine Länder ohne Skaleneffekt | Mittel | Gering | Pooling mit Nachbarland oder DFN-gehostete Instanz. |
| Metadaten-Floss über Landesgrenzen | Mittel | Mittel | Datenschutz-Folgenabschätzung (Art. 35 DSGVO) vor Pilot. |

---

## 8. Warum dieses Modell?

| Eigenschaft | Föderales Modell | Kommerzielle Alternative |
|---|---|---|
| **Lizenzen** | AGPL-3.0, Apache-2.0, MPL-2.0 (gemischt, offen) | Proprietär |
| **Mail-Engine** | Stalwart (Rust, speichereffizient) | Exchange / Gmail |
| **Datensouveränität** | Daten in Landeszuständigkeit | Datenabfluss (CLOUD Act) |
| **Föderation** | SMTP, Matrix, CalDAV, Nextcloud (nativ) | Proprietäre APIs, Vendor-Lock-in |
| **Vendor-Lock-in** | Null — IMAP-Export jederzeit | Hoch — proprietäre Formate |
| **Kulturhoheit** | Respektiert (Land betreibt) | Irrelevant (zentral) |
| **Hochschulautonomie** | Voll gewahrt (Mandant oder Eigenbetrieb) | Eingeschränkt |
| **DFN-Integration** | Bereit (Shibboleth, eduPerson, SAML) | Teilweise (Microsoft Entra ID) |
| **Skaleneffekt** | Geteilt (13 Instanzen + DFN) | Maximal (aber Datenabfluss) |
| **Ausfallrisiko** | Redundant (13 Instanzen) | Single Point of Failure |

---

## 9. Nächste Schritte

1. **Gespräch mit DFN und interessierten Ländern:** Vorstellung des föderalen Modells, Klärung der Koordination.
2. **Datenschutz-Folgenabschätzung:** Durchführung gemeinsam mit Landes-DSB, insb. für föderierten Metadaten-Fluss.
3. **Proof of Concept:** 30-Tage-Testbetrieb mit 5.000 simulierten Postfächern auf einer einzelnen Landesinstanz.
4. **Pilotvereinbarung:** Abschluss mit 1–2 Ländern, die bereit sind, im Pilot zu starten.

---

*Erstellt: August 2026 · Version 2.0 (föderales Modell) · openDesk Edu Contributors*

*Kontakt: opendesk-edu.org*
