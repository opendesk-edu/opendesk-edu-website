---
title: "Eine föderale Architektur für souveräne Studierenden-E-Mail in der deutschen Hochschullandschaft"
date: "2026-08-26"
description: "Eine konservative Analyse einer föderierten, quelloffenen E-Mail- und Kollaborationsplattform für 2,8 Millionen Studierende, modelliert nach der föderalen Bildungsstruktur Deutschlands mit einer Instanz je Bundesland."
categories: ["architektur", "digitale-souveränität", "bildung"]
tags: ["föderation", "e-mail", "digitale-souveränität", "hochschulbildung", "stalwart-mail", "kubernetes", "deutsche-hochschulen", "kostenanalyse"]
author: "Tobias Weiß und openDesk Edu Contributors"
image: "/static/blog/federated-student-email-architecture-teaser.svg"
---

# Eine föderale Architektur für souveräne Studierenden-E-Mail in der deutschen Hochschullandschaft

Rund 2,8 Millionen Studierende sind an deutschen Hochschulen eingeschrieben. Jede und jeder benötigt eine E-Mail-Adresse. Die meisten Einrichtungen stellen eine bereit, doch das vorherrschende Modell — individuelle Mailserver an jeder der rund 400 Einrichtungen oder Outsourcing an kommerzielle Cloud-Anbieter — führt zu Fragmentierung, dupliziertem Betriebsaufwand und Datenflüssen, die Studierendenkommunikation außerhalb der deutschen Rechtsprechung belassen.

Dieser Beitrag untersucht, ob eine föderierte, quelloffene Architektur diese Probleme *unter den Bedingungen des deutschen Bildungsföderalismus* lösen könnte. Er plädiert nicht für eine zentralisierte Plattform. Stattdessen schlägt er ein Modell vor, das die föderale Struktur abbildet: eine Instanz je Bundesland, gewahrte Hochschulautonomie und Föderation über Standardprotokolle. Die Analyse ist bewusst konservativ — Kostenangaben werden als Bereiche mit benannten Annahmen angegeben, nicht als präzise Behauptungen.

## Der föderale Kontext

Jeder Vorschlag für infrastrukturelle Lösungen im Maßstab des deutschen Hochschulwesens muss sich mit einer strukturellen Realität auseinandersetzen: Bildungspolitik ist Ländersache (*Kulturhoheit der Länder*). Die 16 Bundesländer verfügen über die hoheitliche Zuständigkeit für ihre Bildungssysteme, einschließlich der Hochschulen. Der Bund kann keine Teilnahme erzwingen, noch wäre ein solcher Erlass wünschenswert — er widerspräche der verfassungsrechtlichen Kompetenzverteilung (Artikel 30 und 70 des Grundgesetzes).

Das ist keine bloße Rechtstechnikalität. Es prägt jeden Aspekt des Vorschlags:

- **Governance:** Keine Bundesbehörde kann eine einheitliche E-Mail-Plattform verordnen. Teilnahme muss freiwillig sein, auf Länderebene organisiert und durch bestehende föderale Strukturen koordiniert.
- **Datenschutz:** Jedes Land hat eine eigene Datenschutzbehörde (*Landesdatenschutzbeauftragter*). Eine zentrale Lösung über alle 16 Länder hinweg müsste bis zu 16 separate Aufsichtsbehörden sowie den Bundesbeauftragten befriedigen. Ein föderales Modell — eine Instanz je Land — belässt die Daten in der jeweiligen Landeszuständigkeit und unter der jeweiligen Landesbehörde.
- **Vergaberecht:** Öffentliche Beschaffung in Deutschland unterliegt EU-Richtlinien und nationalem Recht (VgV, UVgO). Eine auf Länderebene beschaffte Instanz folgt Vergaberegeln, die den Landesbehörden bereits vertraut sind.
- **Hochschulautonomie:** Artikel 5 Abs. 3 des Grundgesetzes garantiert die Autonomie von Forschung und Lehre. Universitäten sind keine bloßen Verwaltungseinheiten ihres Landes; sie haben institutionelle Autonomie. Das Modell muss einzelnen Einrichtungen ermöglichen, selbst zu hosten oder als Mandant innerhalb einer Landesinstanz zu operieren, wie sie wählen.

Der DFN (*Deutsches Forschungsnetz*) betreibt bereits das nationale Forschungs- und Bildungsnetz und die DFN-AAI-Föderationsinfrastruktur für Identitäten. Er ist ein natürlicher Kandidat für die Koordinationsschicht — nicht als zentraler Betreiber, sondern als neutrales Backbone, das gemeinsame Dienste (Netzverbindung, Identitätsföderation, gemeinsame Sicherheit) bereitstellt, auf denen alle Landesinstanzen aufbauen können.

## Größenordnung und aktuelle Ausgaben

Konkrete Zahlen helfen, die Diskussion zu fundieren, sollten aber als Schätzungen mit erheblicher Unsicherheit behandelt werden.

| Kennzahl | Schätzung | Unsicherheit |
|---|---|---|
| Hochschulen | ~400 | Universitäten, Fachhochschulen und weitere Anbieter |
| Studierende | ~2,8 Millionen | Schwankt nach Semester |
| Mail-Speicher (nur E-Mail, 1 GB/Studierende) | ~2,8 PB nutzbar | Nach Archivierung und Bereinigung |
| Eingehende Nachrichten (vor Filter, 100/Mailbox/Tag) | ~280 Millionen/Tag | 2,8 M × 100; 60% an der Kante abgewiesen |
| Aktuelle Gesamtausgaben | 40–80 Mio. €/Jahr | Verteilt über ~400 Budgets; schwer exakt zu verifizieren |

Die Nachrichtenmenge bedarf einer Klärung: 2,8 Millionen Mailboxen mit geschätzt 100 Nachrichten pro Tag (legitim und Spam, vor Filterung) ergeben etwa 280 Millionen Nachrichten pro Tag, nicht 100 Millionen. Davon können rund 60% an der Netzwerkkante abgewiesen werden (ungültige HELO, DNSBL, SPF-Fehler), bevor Content-Scanning erfolgt, sodass etwa 110 Millionen Nachrichten für die weitere Verarbeitung verbleiben.

Die aktuellen Ausgaben sind die am schwersten zu verifizierende Größe, da sie über hunderte institutionelle Budgets mit unterschiedlicher Buchungspraxis verteilt sind. Die Spanne von 40–80 Millionen Euro pro Jahr deckt Lizenzen, Personal und Hardware für E-Mail und grundlegende Kollaboration. Sie ist richtungsweisend, nicht autoritativ.

## Ein föderales Drei-Schichten-Modell

Die vorgeschlagene Architektur hat drei Schichten, die jeweils auf einer bestehenden strukturellen Einheit des deutschen Bildungswesens aufbauen.

### Schicht 1 — DFN-Gemeinschaftsdienste (Neutrales Backbone)

Der DFN betreibt das nationale Forschungsnetz und die DFN-AAI-Identitätsföderation. In diesem Modell stellt der DFN gemeinsame Dienste bereit, die allen Landesinstanzen nutzen, ohne selbst eine Instanz zu betreiben:

- **Netzverbindung** (bereits vorhanden)
- **Identitätsföderation** über DFN-AAI und eduPerson-Attribute (bereits vorhanden)
- **Gemeinsame Sicherheitsdienste**: DNSBL-Reputation, MTA-STS-Richtlinienverteilung, DKIM/DMARC-Monitoring und Threat-Intelligence-Austausch über alle Landesinstanzen
- **Koordination**: technische Standards, Interoperabilitätstests und ein Forum für Landes-IT-Organisationen

Der DFN speichert keine Studierenden-Mailboxen. Er stellt das Bindegewebe. Das respektiert seine bestehende Rolle und vermeidet die Schaffung einer neuen Zentralbehörde.

### Schicht 2 — Landesinstanzen (Eine je Bundesland)

Jedes Bundesland betreibt seine eigene Instanz, die den Studierenden an den Einrichtungen in diesem Land dient. Kleine Länder (Bremen, Saarland) können Ressourcen bündeln oder eine Instanz mit einem Nachbarland teilen, was die effektive Anzahl auf etwa 10–13 Betriebsinstanzen reduziert.

Eine Landesinstanz bietet:

- **E-Mail** (SMTP, IMAP, POP3, JMAP) mit Spam- und Virenfilterung
- **Dateispeicher** (Nextcloud)
- **Kalender und Kontakte** (CalDAV, CardDAV)
- **Messenger** (Matrix, föderiert)
- **Kollaborative Dokumentbearbeitung**
- **Single Sign-on** integriert in den Identitätsanbieter des Landes, föderiert über DFN-AAI

Jede Landesinstanz wird von der IT-Organisation des Landes (oder einem beauftragten Dienstleister) unter der Landesdatenschutzbehörde betrieben. Die Instanz ist für die Studierendenzahl dieses Landes dimensioniert, nicht für die nationale Gesamtzahl.

### Schicht 3 — Hochschulautonomie (Mandanten oder Eigenbetrieb)

Innerhalb einer Landesinstanz operiert jede Universität als Mandant — mit eigener Domain, Nutzerverwaltung und administrativen Richtlinien. Einrichtungen, die volle betriebliche Kontrolle bevorzugen, können denselben quelloffenen Stack auf eigener Hardware deployen und mit der Landesinstanz sowie mit anderen Einrichtungen föderieren.

Dies ist die entscheidende Designentscheidung für die Wahrung der Hochschulautonomie: Keine Einrichtung wird zur Nutzung der Landesinstanz gezwungen, und diejenigen, die teilnehmen, behalten die administrative Kontrolle über ihre eigene Domain, ihre Nutzer und ihre Richtlinien.

### Föderation

Die drei Schichten sind durch Standardprotokolle verbunden, nicht durch eine Zentralbehörde:

- **SMTP**: E-Mail ist nativ föderiert — eine Studierende an einer Landesinstanz kann einer Beschäftigten an einer selbstgehosteten Einrichtung schreiben, ohne dass eine von beiden ihre Umgebung verlässt.
- **Matrix**: Föderierter Messenger über Instanzen und Eigenbetrieb hinweg.
- **CalDAV/CardDAV**: Kalender- und Kontaktfreigaben über Einrichtungsgrenzen.
- **Nextcloud-Föderation**: Dateifreigaben zwischen Landesinstanzen und selbstgehosteten Instanzen.
- **DFN-AAI**: Identitätsföderation — Studierende authentifizieren sich mit ihren institutionellen Credentials, validiert über den Identitätsanbieter ihrer Heimseinrichtung.

Föderation ist der Mechanismus, der Zentralisierung ersetzt. Kein einzelner Betreiber hält alle Studierendendaten. Jedes Land kontrolliert seine eigene Instanz. Jede Einrichtung kontrolliert ihre eigene Domain. Interoperabilität wird durch offene Standards gewährleistet, nicht durch eine Zentralbehörde.

## Kostenabschätzung

Die folgenden Schätzungen sind bewusst konservativ, mit Bereichen, die die Unsicherheit bei Hardwarepreisen, Personalmodellen und Speicherzuweisung widerspiegeln. Sie decken das föderale Modell (Landesinstanzen + DFN-Gemeinschaftsdienste), nicht eine einzelne zentrale Bereitstellung.

### Landesinstanz (3-Jahres-TCO)

| Komponente | Untergrenze | Obergrenze |
|---|---|---|
| Hardware (Mail, Kollaboration, Speicher, Control Plane) | 80.000 € | 150.000 € |
| Colocation und Konnektivität | 45.000 € | 90.000 € |
| Betrieb (0,5–1 VZÄ, geteilt mit bestehender Landes-IT) | 120.000 € | 225.000 € |
| **Pro Instanz (3 Jahre)** | **245.000 €** | **465.000 €** |

### Gemeinschaftsdienste (DFN-Ebene, 3-Jahres-TCO)

| Komponente | Untergrenze | Obergrenze |
|---|---|---|
| Sicherheitsinfrastruktur (gemeinsame DNSBL, MTA-STS, Monitoring) | 100.000 € | 200.000 € |
| Koordination und Entwicklung (3–5 VZÄ) | 675.000 € | 1.125.000 € |
| **Gemeinsam (3 Jahre)** | **775.000 €** | **1.325.000 €** |

### Gesamtabschätzung (13 Instanzen + Gemeinsames, 3-Jahres-TCO)

| Szenario | Gesamt (3 Jahre) | Pro Studierende/Monat |
|---|---|---|
| Untergrenze (13 × 245.000 € + 775.000 €) | ~4,0 Mio. € | ~0,04 € |
| Zentralschätzung (13 × 355.000 € + 1.050.000 €) | ~5,7 Mio. € | ~0,06 € |
| Obergrenze (13 × 465.000 € + 1.325.000 €) | ~7,4 Mio. € | ~0,07 € |

Diese Zahlen gehen von einer E-Mail-fokussierten Bereitstellung aus (1 GB/Studierende). Einschließlich Kollaborationsspeicher (Dateispeicher, Versionierung, Backups) bei 10–20 GB/Studierende würden die Speicherkosten erheblich steigen — möglicherweise eine Verdopplung der Untergrenze. Migrations-, Schulungs- und Integrationskosten sind nicht enthalten und würden in der anfänglichen Deploy-Phase hinzukommen.

Zum Vergleich: Die aktuellen Gesamtausgaben werden auf 40–80 Millionen Euro pro Jahr geschätzt (120–240 Millionen Euro über drei Jahre). Das föderale Modell bedeutet eine erhebliche Reduzierung der aggregierten Infrastrukturkosten, obwohl ein direkter Vergleich unvollkommen ist: Die aktuellen Ausgaben umfassen institutionellen Mehraufwand (lokales IT-Personal, einzelne Beschaffung, lizenzgebühren pro Einrichtung), der nicht vollständig, aber substanziell durch Konsolidierung reduziert würde.

Die Kosten pro Studierende liegen bei etwa 0,04–0,07 € pro Monat für E-Mail-fokussierte Bereitstellung — rund zwei Größenordnungen unter typischen kommerziellen Cloud-Lizenzen. Dies spiegelt die Warennatur von E-Mail im großen Maßstab wider: Die Grenzkosten für Speicherung und Zustellung sind sehr gering. Der dominante Kostenfaktor ist nicht die Infrastruktur, sondern die Koordination — und genau diese adressiert das föderale Modell.

## Technische Grundlagen

Die einzelnen Komponenten sind heute im produktiven Einsatz:

- **Stalwart Mail** (AGPL-3.0): ein Rust-basierter Mailserver mit IMAP, POP3, SMTP und JMAP sowie nativer Volltextsuche. Die AGPL-3.0-Lizenz stellt sicher, dass Modifikationen offen bleiben; eine kommerzielle Lizenz ist für Organisationen verfügbar, die den AGPL-Bedingungen nicht nachkommen können.
- **Nextcloud** (AGPL-3.0): Dateispeicher, Freigabe und Kollaboration.
- **Matrix/Element** (AGPL-3.0): föderierter Messenger.
- **Keycloak** (Apache-2.0): Identity- und Access-Management, SAML/OIDC.
- Weitere Komponenten für Kalender, Kontakte und Videokonferenzen, deployt als container-native Pakete (Kubernetes, Helm) und über Konfigurationsmanagement (Ansible).

Die Quelloffen-Lizenzen sind gemischt (AGPL-3.0, Apache-2.0, MPL-2.0). Die AGPL-3.0-Komponenten (Stalwart, Nextcloud, Matrix) verlangen, dass Modifikationen, die Nutzern über das Netz bereitgestellt werden, unter derselben Lizenz veröffentlicht werden — ein stärkeres Copyleft als Apache-2.0, und eines, das die Souveränität eher verstärkt als untergräbt: Einrichtungen, die die Software modifizieren, müssen ihre Modifikationen teilen, was private Forks am Untergraben der Commons hindert.

Die technische Herausforderung im großen Maßstab ist die operative Orchestrierung — Bereitstellung von Mailboxen über mehrere Landesinstanzen, Verarbeitung von ~280 Millionen eingehenden Nachrichten pro Tag und Aufrechterhaltung responsiver IMAP-Antwortzeiten. Dies sind Skalierungsprobleme mit bekannten Lösungen; das Quelloffen-Ökosystem hat sie in anderen Sektoren in vergleichbaren Dimensionen gelöst.

## Governance

Ein föderales Modell erfordert föderale Governance. Die vorgeschlagene Struktur:

- **Jedes Land** betreibt seine eigene Instanz unter seiner eigenen Datenschutzbehörde (*Landesdatenschutzbeauftragter*). Keine Zentralbehörde hält Studierendendaten.
- **DFN** stellt Gemeinschaftsdienste bereit und koordiniert technische Standards, in seiner bestehenden Rolle als neutrale Forschungsnetz-Organisation.
- **Ein Koordinationsgremium** (technischer Beirat, aus Landes-IT-Organisationen und DFN) legt Interoperabilitätsstandards fest und verwaltet gemeinsame Sicherheitsdienste. Es betreibt keine Instanzen.
- **Finanzierung** kombiniert Landesbudgets (proportional zu Studierendenzahlen), freiwillige institutionelle Beiträge für erweiterte Dienste und — falls verfügbar — Bundes-Startfinanzierung über einen Digitalpakt-artigen Mechanismus nach Artikel 104b des Grundgesetzes (Bund finanziert, Länder führen aus). Der bestehende Digitalpakt Schule gilt für Schulen; ein vergleichbares Instrument für die Hochschule müsste geschaffen oder eine bestehende Hochschul-Förderlinie umgewidmet werden.

Teilnahme ist auf jeder Ebene freiwillig. Kein Land wird zum Beitritt gezwungen. Keine Einrichtung wird zur Nutzung ihrer Landesinstanz gezwungen. Datenexport über Standardprotokolle (IMAP, CalDAV) ist jederzeit möglich. Es gibt keinen Vendor-Lock-in: Der gesamte Stack ist quelloffen, und die AGPL-3.0-Lizenz stellt sicher, dass Modifikationen offen bleiben.

## Offene Fragen und Limitationen

Diese Analyse ist ein Ausgangspunkt, kein fertiger Vorschlag. Mehrere Fragen erfordern weitere Untersuchung:

1. **Kostenvalidierung.** Die obigen Schätzungen basieren auf Produktions-Benchmarks einzelner Komponenten, hochgerechnet auf nationale Skalierung. Ein Proof-of-Concept — beispielsweise 5.000 simulierte Mailboxen über 30 Tage auf einer einzelnen Landesinstanz — würde die Kapazitätsannahmen validieren und operative Grenzfälle identifizieren.

2. **Adoption auf Länderebene.** Das Modell geht von freiwilliger Land-Teilnahme aus. In der Praxis hat jedes Land eine eigene IT-Strategie, Vergaberegeln und politische Prioritäten. Ein Pilot mit drei bis fünf Ländern unterschiedlicher Größe würde das Governance-Modell testen und Koordinationsherausforderungen aufdecken.

3. **Datenschutz über Landesgrenzen.** Während eine Landesinstanz die Daten im jeweiligen Land belässt, bedeutet Föderation über Instanzen, dass Metadaten (Routing-Informationen, Kalenderfreigaben) Landesgrenzen überschreiten können. Eine Datenschutz-Folgenabschätzung (*Datenschutz-Folgenabschätzung* nach Art. 35 DSGVO) sollte den föderierten Metadatenfluss vor jedem Pilot evaluieren.

4. **Migration.** Die Migration von rund 2,8 Millionen Mailboxen aus bestehenden Systemen — kommerzielle Cloud, institutionelle Mailserver oder andere Anbieter — ist ein erhebliches operatives Unterfangen. Migrationstools, Nutzerkommunikation und eine Übergangsphase (Parallelbetrieb) wären erforderlich.

5. **Kleine Länder.** Bremen (~20.000 Studierende) und das Saarland (~35.000) rechtfertigen möglicherweise keine eigene Instanz. Pooling-Vereinbarungen (gemeinsame Instanz mit einem Nachbarland oder eine DFN-gehostete Instanz für kleine Länder) müssen definiert werden.

6. **Hochschulautonomie in der Praxis.** Das Modell erlaubt Eigenbetrieb, aber eine Universität, die selbst hostet, verzichtet auf die Kostenvorteile der Landesinstanz. Die Balance zwischen Autonomie und Konsolidierung ist eine politische Frage für jede Einrichtung.

## Fazit

Eine souveräne, föderierte E-Mail- und Kollaborationsplattform für das deutsche Hochschulwesen ist technisch machbar und wirtschaftlich plausibel. Die Kosten pro Studierende sind ein Bruchteil der aktuellen aggregierten Ausgaben. Der Quelloffen-Stack schließt Vendor-Abhängigkeit aus. Datensouveränität wird durch Design erreicht — jedes Land kontrolliert seine eigene Instanz unter eigener Rechtsprechung.

Das föderale Modell ist kein Kompromiss, der durch verfassungsrechtliche Zwänge erzwungen wird. Es ist die natürliche Architektur für ein System, das auf Landessouveränität, Hochschulautonomie und freiwilliger Zusammenarbeit aufbaut. Eine Instanz je Bundesland, koordiniert über den DFN, bewahrt politische Verantwortung während die operative Last eines Commodity-Dienstes geteilt wird. Föderation über Standardprotokolle stellt sicher, dass keine Einrichtung isoliert ist — eine Studierende an einer Landesinstanz kann mit einer Beschäftigten an einer selbstgehosteten Universität so natürlich kooperieren wie zwei Studierende auf derselben Plattform.

Was bleibt, ist keine technische Frage. Es ist eine Frage der Koordination: die politische Willensbildung von 16 Ländern in Einklang bringen, Governance über den DFN etablieren und das Modell mit einem Pilot validieren. Die Technologie ist bereit. Die föderale Struktur ist bereit. Die Wirtschaftlichkeit ist günstig. Der nächste Schritt ist ein Gespräch.

---

## Weiterführende Literatur

1. **Begleitdokument.** Eine detaillierte Kapazitätsanalyse und das Governance-Modell sind als technisches Begleitdokument verfügbar.
2. **Den Stack evaluieren.** Die Quelloffen-Komponenten können aus Ansible-Playbooks auf einem einzelnen Knoten zur Evaluierung deployt werden.
3. **Mit Landes-IT-Organisationen sprechen.** Das Modell ist für freiwillige Adoption konzipiert; je mehr Landes-IT-Organisationen die Zahlen prüfen, desto schneller kann die Koordination beginnen.

---

*Föderation ist nicht Zentralisierung. Sie ist Zusammenarbeit ohne Verzicht.*
