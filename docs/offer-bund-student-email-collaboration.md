# Angebot: Zentrale Studierenden-E-Mail und Kollaborationsinfrastruktur auf Bundesebene

**Federiert. Souverän. Open Source.**

---

## Zusammenfassung

Wir schlagen vor, die E-Mail- und Kollaborationsinfrastruktur für **2,8 Millionen Studierende** in Deutschland auf Bundesebene zu zentralisieren — als freiwilliger Verbunddienst, betrieben über das DFN-Backbone, mit einer Option für Landes- und Einrichtungs-On-Premise-Instanzen für Beschäftigte.

**Kosten:** ~5 €/Studierende/Monat (Gesamtbetrieb). Gegenüber dezentralen kommerziellen Cloud-Lizenzen oder Campus-IT-Lösungen einsparpotenzial von 40–60 %.

**Datensouveränität:** Alle Daten verbleiben in Deutschland. Kein CLOUD Act, kein Vendor-Lock-in, Apache-2.0-Lizenz.

---

## 1. Ausgangslage

### 1.1 Status quo

| | Aktuell |
|---|---|
| **E-Mail-Anbieter** | ~400 Einrichtungen, überwiegend 2 kommerzielle Cloud-Anbieter |
| **Lizenzen** | Gemischt: kostenlose Bildungslizenzen (mit Datenabfluss) oder teure On-Premise-Lizenzen |
| **Datenhaltung** | Daten fließen in ausländische Rechenzentren (USA, Irland, Niederlande) |
| **Interoperabilität** | Einrichtungen sind voneinander isoliert; Kollaboration über private Dropbox/WhatsApp/Signal |
| **Kosten** | Geschätzt 40–80 Mio. €/Jahr Gesamt für den Hochschulbereich (Personal + Lizenzen) |

### 1.2 Rechtlicher und politischer Druck

- **EU Cloud Act / US CLOUD Act:** Daten von Studierenden und Forschenden sind ausländischen Zugriffsanordnungen ausgesetzt.
- **DSGVO Art. 28:** Auftragsverarbeitungsverträge mit Nicht-EU-Anbietern erfordern SCCs — der EuGH (Schrems II, Data Protection Commissioner) hat die Wirksamkeit eingeschränkt.
- **Digitalpakt:** 5 Mrd. € Bund-Mittel für Hochschul-Digitalisierung — aktuell ohne koordinierte Strategie für die Kommunikationsinfrastruktur.
- **GAIA-X:** Europäische Cloud-Initiative, aber keine spezifische Lösung für den Bildungssektor.

### 1.3 Warum jetzt?

Die Technology Readiness ist gegeben: Stalwart Mail (Rust-basiert, horizontal skalierbar) und die openDesk-Edu-Komponenten sind produktionsreif. DFN stellt das Netzwerk. Der politische Druck wächst — Bundestags-Enquetekommission "Zukunft der Medien" und der IT-Planungsrat fordern seit 2024 souveräne Digitalisierung im Bildungsbereich.

---

## 2. Das Angebot

### 2.1 Zwei-Säulen-Modell

```
┌─────────────────────────────────────────────────────────────────────┐
│                    openDesk Edu Verbund                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SÄULE 1: Zentraldienst (Bund)                              │  │
│  │                                                              │  │
│  │  • 2,8 M Studierende-Mailboxen (Stalwart Mail)              │  │
│  │  • Dateispeicher (Nextcloud, 50 GB/Person)                   │  │
│  │  • Videokonferenz (Jitsi Meet)                               │  │
│  │  • Messenger (Matrix/Element — föderiert)                    │  │
│  │  • Kalender/Kontakte (CalDAV/CardDAV via Radicale/SOGo)      │  │
│  │  • Office-Suite (Collabora Online)                            │  │
│  │  • SSO via DFN-AAI / eduPerson                               │  │
│  │                                                              │  │
│  │  Standort: 2 Rechenzentren (Frankfurt + Berlin)              │  │
│  │  Betreiber: Bund oder beauftragter Verbund (z.B. DFN)         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│                     Föderation (LDAP/Matrix/CalDAV)                 │
│                              │                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SÄULE 2: On-Premise (optional, pro Einrichtung/Land)       │  │
│  │                                                              │  │
│  │  • Identischsoftware wie Säule 1                             │  │
│  │  • Beschäftigten-Mailboxen (Datenschutz/Funktionstrennung)  │  │
│  │  • Lokale Mandantenfähigkeit (K3s-Deploy, Air-Gap möglich)   │  │
│  │  • Föderierte Suche, Freigaben, Kollaboration mit Säule 1   │  │
│  │  • Eigenes Identity-Management (Shibboleth/Keycloak)         │  │
│  │                                                              │  │
│  │  Bereitstellung: Docker/K3s-Stack, Ansible-Playbooks         │  │
│  │  Support: Dokumentation + Community + kostenpflichtiger SLA  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Schüsselentscheidung: Trennung Studierende / Beschäftigte

| | Studierende (Säule 1) | Beschäftigte (Säule 2, optional) |
|---|---|---|
| **Zielgruppe** | 2,8 M Studierende | ~800 K Beschäftigte |
| **Betriebsmodell** | Zentral (Bund/DFN) | On-Premise pro Einrichtung |
| **Begründung** | Hohe Fluktuation, homogeneous Anforderungen | Dienstrecht, Tarifvertrag, Aktenführung |
| **Datenschutz** | Standard DSGVO | Verschärft: Personalakten, Dienstliche Kommunikation |
| **Aufbewahrung** | 3 Jahre (Studienzyklus) | 10+ Jahre (GoBD, Abgabenordnung) |
| **E-Mail-Größe** | 1 GB Durchschnitt | 5–10 GB Durchschnitt |
| **Migration** | Einfach: Neuanlage pro Semester | Komplex: Import bestehender Postfächer |

---

## 3. Technische Architektur

### 3.1 Zentraldienst (Säule 1)

#### Rechenzentrum-Topologie

```
                 ┌──────────────────┐
                 │    Anycast DNS   │
                 │  (MX, SRV, A/AAAA)│
                 └────────┬─────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
       ┌──────▼──────┐        ┌──────▼──────┐
       │  Frankfurt  │        │   Berlin    │
       │  (Primär)   │        │  (Sekundär) │
       │             │        │             │
       │ 3× K8s CP   │        │ 3× K8s CP   │
       │ 3× LB/Traefik│        │ 3× LB/Traefik│
       │ 3× Worker   │        │ 3× Worker   │
       │ 8× Storage  │◄──────►│ 8× Storage  │
       │  (Ceph OSD) │        │  (Ceph OSD) │
       │ 1× Monitor  │        │ 1× Monitor  │
       └─────────────┘        └─────────────┘
              │                       │
              └───────────┬───────────┘
                          │
                  ┌───────▼────────┐
                  │  DFN-BelWü    │
                  │  100 Gbps     │
                  └────────────────┘
```

#### Hardware-Sizing (Gesamt)

| Komponente | Knoten | Specs pro Knoten | Gesamt |
|---|---|---|---|
| K8s Control Plane | 6 (3+3) | 8 vCPU, 32 GB RAM | 48 vCPU, 192 GB |
| Mail-Worker | 6 | 64 vCPU, 256 GB RAM, 2× NVMe | 384 vCPU, 1,5 TB RAM |
| Storage (Ceph OSD) | 16 | 16 vCPU, 128 GB RAM, 36×20 TB HDD + 2×1 TB NVMe | 7,5 PB raw |
| Load Balancer | 6 (3+3) | 8 vCPU, 32 GB RAM, 2×25 GbE | 48 vCPU, 192 GB |
| Monitoring | 4 (2+2) | 16 vCPU, 64 GB RAM | 64 vCPU, 256 GB |
| **Gesamt** | **~38 Knoten** | | **~544 vCPU, ~2,2 TB RAM, 7,5 PB** |

#### E-Mail-Pipeline

```
Internet
  │
  ▼
┌──────────────────────────────────────────────┐
│  Edge (per Site: 3× HAProxy + Rspamd)        │
│  ┌─────────────────────────────────────────┐  │
│  │ HELO-Check → DNSBL → SPF/DKIM/DMARC    │  │
│  │ → Greylisting → Rspamd (Bayes, Fuzzy)   │  │
│  │ → ClamAV → Stalwart SMTP Ingest         │  │
│  └─────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  Stalwart Mail Cluster (6 Worker-Nodes)      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ SMTP LMTP│ │ IMAP/POP3│ │ JMAP     │      │
│  │ Ingest   │ │ Serving  │ │ (modern) │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│       │              │                       │
│       ▼              ▼                       │
│  ┌─────────────────────────────────────────┐  │
│  │  Ceph RBD (erasure-coded 4+2)           │  │
│  │  2,8 M Mailboxen, ~4,3 PB nutzbar      │  │
│  │  Tantivy Full-Text-Index               │  │
│  └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

#### Spam-Behandlung (skaliert)

Bei 100 M E-Mails/Tag (davon ~80 % Spam) ist die Rejection-Rate entscheidend:

- **60 % werden vor Scanning rejected:** HELO-Validierung, DNSBL, SPF-Fail, Greylisting
- **25 % werden von Rspamd geblockt:** Bayes, neural network, Fuzzy-Hashes (gemeinsam über alle Einrichtungen)
- **10 % werden in Quarantäne sortiert:** Verdächtig, aber kein harte Reject
- **5 % gelangen durch:** Legitime E-Mails

Ergibt: Nur ~5 M E-Mails/Tag durchlaufen ClamAV (statt 100 M) — reduziert die CPU-Last um 95 %.

### 3.2 On-Premise-Stack (Säule 2)

Einrichtung erhält einen **K3s-Deploy** (Ansible-Playbook), der auf 1–3 physischen Knoten läuft:

| Dienst | Ressourcen (500 Beschäftigte) | Ressourcen (5.000 Beschäftigte) |
|---|---|---|
| Stalwart Mail | 2 vCPU, 4 GB RAM | 8 vCPU, 16 GB RAM |
| SOGo Groupware | 2 vCPU, 4 GB RAM | 8 vCPU, 16 GB RAM |
| Nextcloud | 4 vCPU, 8 GB RAM | 16 vCPU, 32 GB RAM |
| Keycloak (SSO) | 2 vCPU, 4 GB RAM | 4 vCPU, 8 GB RAM |
| Collabora Online | 4 vCPU, 8 GB RAM | 16 vCPU, 32 GB RAM |
| Jitsi Meet | 4 vCPU, 8 GB RAM | 8 vCPU, 16 GB RAM |
| Matrix/Element | 2 vCPU, 4 GB RAM | 8 vCPU, 16 GB RAM |
| Radicale (CalDAV) | 1 vCPU, 2 GB RAM | 4 vCPU, 8 GB RAM |
| Monitoring | 1 vCPU, 2 GB RAM | 4 vCPU, 8 GB RAM |
| **Gesamt** | **~22 vCPU, 44 GB RAM** | **~76 vCPU, 152 GB RAM** |

Mögliche Bereitstellung auf **einem einzelnen Server ab ~3.000 €** (gebraucht) oder **zwei Server für HA ab ~6.000 €**.

### 3.3 Föderation

```
Studierender@uni-muenchen.de          Beschäftigte@uni-muenchen.de
        │                                          │
        ▼                                          ▼
   ┌─────────┐                               ┌──────────────┐
   │ Säule 1 │  ◄── Matrix Federation ──►    │ Säule 2      │
   │ (Zentral)│  ◄── CalDAV Sharing ───►     │ (On-Prem)    │
   │ DFN-AAI  │  ◄── LDAP Referral ────►    │ Shibboleth   │
   └─────────┘                               └──────────────┘
```

- **Matrix/Element:** Föderierter Messenger — Studierende und Beschäftigte können sich gegenseitig schreiben, ohne dass Nachrichten einen zentralen Server passieren.
- **CalDAV/CardDAV:** Freigaben und gemeinsame Kalender über Einrichtungsgrenzen hinweg.
- **Nextcloud-Federation:** Dateifreigaben zwischen Zentraldienst und On-Premise-Instanzen.
- **SSO:** Studierende authentifizieren sich über DFN-AAI (eduPerson-Attribute). Beschäftigte über lokales IdP, aber mit Verbundweiten Vertrauensstellung.

---

## 4. Kostenmodell

### 4.1 Zentraldienst (Säule 1) — 3-Jahres-TCO

| Position | Menge | Stückpreis (3 J.) | Gesamt |
|---|---|---|---|
| Storage-Nodes (36×20TB, 128 GB) | 16 | 12.000 € | 192.000 € |
| Worker-Nodes (64 vCPU, 256 GB, NVMe) | 6 | 18.000 € | 108.000 € |
| Control-Plane (8 vCPU, 32 GB) | 6 | 4.000 € | 24.000 € |
| Load-Balancer (8 vCPU, 32 GB, 25 GbE) | 6 | 5.000 € | 30.000 € |
| Monitoring (16 vCPU, 64 GB) | 4 | 7.000 € | 28.000 € |
| Spine-Leaf-Switches (2×Site) | 4 | 8.000 € | 32.000 € |
| Colocation (38 Knoten, ~15 kW, 150 €/kW/Monat) | 36 Mo. | 2.250 € | 81.000 € |
| Personal (4 FTE Betrieb, 2 FTE Entwicklung) | 3 J. | 75.000 €/J. | 1.350.000 € |
| **Gesamt 3 Jahre** | | | **1.845.000 €** |

**Pro Studierende und Monat:** 1.845.000 € ÷ 2,8 M × 36 Mo. = **~18 €/Studierende/3 Jahre = ~5 €/Monat**

Im Vergleich:

| | openDesk Edu (Verbund) | Kommerzielle Cloud (Bildungslizenz) | Campus-On-Premise (pro Einrichtung) |
|---|---|---|---|
| **Kosten/Student/Monat** | ~5 € | 0 € ("gratis") | ~8–15 € |
| **Datensouveränität** | ✅ | ❌ | ✅ |
| **Skaleneffekt** | ✅ (gebündelt) | ✅ (aber Datenabfluss) | ❌ (400× dupliziert) |
| **Vendor-Lock-in** | ❌ (Apache-2.0) | ✅ | ❌ (aber höhere Kosten) |
| **Personal-Aufwand** | Gering (6 FTE für 2,8 M) | Gering (externer Anbieter) | Hoch (400× je 1–3 FTE) |

### 4.2 On-Premise (Säule 2) — Einzelne Einrichtung

| Größe | Einmalige Hardware | Betrieb/Jahr (1 FTE anteilig) | Ges./Jahr |
|---|---|---|---|
| Klein (<500 Pers.) | ~3.000 € | ~30.000 € | ~31.000 € |
| Mittel (500–5.000) | ~12.000 € | ~45.000 € | ~49.000 € |
| Groß (>5.000) | ~30.000 € | ~60.000 € | ~70.000 € |

Vergleich: Microsoft 365 E3 (Bildung) = **~30 €/Person/Jahr** für 5.000 Beschäftigte = 150.000 €/Jahr — ohne Hardware, ohne Personal für Betrieb.

---

## 5. Governance-Modell

### 5.1 Rechtsform und Trägerschaft

```
BMBF (Förderung)
  │
  ▼
Verbundverein / An-Institut (z.B. beim DFN)
  ├── Geschäftsführung (operativ)
  ├── Technischer Beirat (CIOs der Länder/DFN)
  ├── Datenschutzbeirat (DSB der Teilnehmer)
  └── Nutzerbeirat (ASTA-Vertreter)
```

- **Träger:** E.V. oder An-Institut unter dem Dach des DFN-Vereins.
- **Finanzierung:** Drei-Säulen-Modell:
  1. **Bund:** Startfinanzierung (Digitalpakt-Mittel, 3 Jahre)
  2. **Länder:** Laufende Beiträge nach Studierendenzahl (Kulturhoheit)
  3. **Einrichtungen:** Freiwillige Beiträge für erweiterte Services (On-Prem-Support, SLAs)

### 5.2 Teilnahme

- **Freiwillig.** Keine Pflicht — aber der Skaleneffekt steigt mit jedem Teilnehmer.
- **Einstieg:** Einrichtung schließt Teilnahmevereinbarung ab, liefert eduPerson-Attribute, konfiguriert MX-Record.
- **Ausstieg:** Datenexport (IMAP, mbox, CalDAV), MX-Record-Änderung, 90-Tage-Frist. Kein Lock-in.

---

## 6. Implementierungs-Roadmap

### Phase 0: Gründung (Monat 1–6)

| Schritt | Verantwortlich |
|---|---|
| Verbundverein gründen, Satzung | BMBF + interessierte Länder |
| Technischen Beirat einberufen | DFN |
| Datenschutz-Folgenabschätzung | Externer DSB + Verbunds-DSB |
| Hosting-Vertrag (2 Rechenzentren) | Geschäftsführung |
| Grundinfrastruktur aufsetzen (K8s, Ceph, Monitoring) | openDesk Edu-Team |

### Phase 1: Pilot (Monat 7–12)

| Schritt | Verantwortlich |
|---|---|
| 3–5 Pilot-Hochschulen (unterschiedliche Größe, Bundesländer) | Pilotpartner |
| ~50.000 Studierende-Mailboxen | openDesk Edu-Team |
| SSO-Integration via DFN-AAI | DFN + Pilotpartner |
| Lasttests (100 M E-Mails/Tag simuliert) | openDesk Edu-Team |
| Evaluation und Anpassung | Technischer Beirat |

### Phase 2: Skalierung (Monat 13–24)

| Schritt | Ziel |
|---|---|
| Aufnahme weiterer Hochschulen | 500.000 Studierende |
| On-Premise-Stack veröffentlichen (K3s + Ansible) | 10 Einrichtungen |
| Matrix-Federation aktivieren | Studierende ↔ Beschäftigte |
| LMS-Integration (Moodle/ILIAS Plugin) | Alle Pilot-Einrichtungen |

### Phase 3: Vollbetrieb (Monat 25–36)

| Schritt | Ziel |
|---|---|
| Vollständige Abdeckung | 2,0+ M Studierende |
| On-Premise für Beschäftigte | 50+ Einrichtungen |
| Self-Service-Portal (Passwort-Reset, Alias-Verwaltung) | Alle Nutzer |
| Audit & Zertifizierung (BSI IT-Grundschutz, ISO 27001) | Verbund |

---

## 7. Risiken und Gegenmaßnahmen

| Risiko | Wahrscheinlichkeit | Auswirkung | Gegenmaßnahme |
|---|---|---|---|
| Länder wollen eigene Lösung | Hoch | Mittel | Föderationsmodell: Sie können — aber warum? Kostentransparenz liefern. |
| Kommerzielle Anbieter bieten "kostenlos" an | Hoch | Hoch | Langfristige Gesamtkosten (Personal, Vendor-Lock-in, Datenschutz-Compliance) aufzeigen. Der Preis ist nicht null — er ist Daten. |
| Blacklisting der IP-Adressen | Mittel | Hoch | Dedizierte IP-Blöcke, DKIM/DMARC/SPF für jede Domain, DFN-Peerings. |
| Spam-Tsunami überlastet Cluster | Mittel | Mittel | Rspamd-Edge-Rejection (60 % vor Scanning), HPA auf Queue-Depth. |
| Akzeptanz bei Studierenden | Mittel | Hoch | Einfaches Onboarding (SSO), moderne UI (Element, Nextcloud, SOGo), Migration per IMAP-Import. |
| Politische Blockade (Kulturhoheit) | Mittel | Hoch | Freiwilligkeit betonen. Bund finanziert — Länder entscheiden über Teilnahme. DFN als neutraler Träger. |

---

## 8. Warum openDesk Edu?

| Eigenschaft | openDesk Edu | Kommerzielle Alternative |
|---|---|---|
| **Lizenz** | Apache-2.0 (vollständig offen) | Proprietär |
| **Mail-Engine** | Stalwart (Rust, speichereffizient) | Exchange / Gmail |
| **Ressourcen/10k Postfächer** | ~1 vCPU, 4 GB RAM | ~4 vCPU, 16 GB RAM |
| **Container-native** | K8s/Helm, horizontal skalierbar | Monolithisch oder managed |
| **Föderation** | Matrix + CalDAV + LDAP (native) | Proprietäre APIs, Vendor-Lock-in |
| **Beitragsfähigkeit** | Ja — jeder kann mitmachen, Code und Architektur prüfen | Nein — Black-Box |
| **Vendor-Lock-in** | Null — IMAP-Export jederzeit | Hoch — Datenformate proprietär |
| **DFN-Integration** | Bereit (Shibboleth, eduPerson, SAML) | Teilweise (Microsoft Entra ID) |

---

## 9. Nächste Schritte

1. **Gespräch mit BMBF und DFN:** Vorstellung des Angebots, Klärung der Fördermöglichkeiten.
2. **Datenschutz-Folgenabschätzung:** Durchführung gemeinsam mit einem externen Datenschutzbeauftragten.
3. **Proof of Concept:** 30-Tage-Testbetrieb mit 5.000 simulierten Postfächern auf dem Zentraldienst.
4. **Pilotvereinbarung:** Abschluss mit 3–5 Hochschulen, die bereit sind, im Pilot zu starten.

---

*Erstellt: August 2026 · Version 1.0 · openDesk Edu (Apache-2.0)*

*Kontakt: opendesk-edu.org*