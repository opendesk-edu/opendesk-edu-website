---
title: "Denk groß: Eine föderierte, souveräne Mailbox für jede Studierende in Deutschland"
date: "2026-08-26"
description: "2,8 Millionen Studierende in Deutschland nutzen eine zersplitterte E-Mail-Infrastruktur. Ein föderierter Open-Source-Ansatz könnte dies auf eine einzige souveräne Plattform konsolidieren -- bei geschätzten fünf Euro pro Studierende und Monat."
categories: ["Meinung", "Digitale Souveränität", "Bildung"]
tags: ["föderation", "e-mail", "digitale-souveränität", "hochschulbildung", "stalwart-mail", "kubernetes", "deutsche-hochschulen", "kostenanalyse"]
author: "Tobias Weiß und openDesk Edu Contributors"
image: "/static/blog/think-big-federated-mailbox-teaser.svg"
---

# Denk groß: Eine föderierte, souveräne Mailbox für jede Studierende in Deutschland

Rund 2,8 Millionen Studierende sind an deutschen Hochschulen eingeschrieben. Jede und jeder von ihnen benötigt eine E-Mail-Adresse. Jede Einrichtung stellt eine bereit -- oder vergibt den Auftrag an einen kommerziellen Anbieter. Das Ergebnis: eine Landschaft aus schätzungsweise 400 separaten E-Mail-Deployments, viele davon auf Infrastruktur, die Studierendendaten außerhalb deutscher Rechtsprechung speichert.

Das muss nicht so sein. Die Technologie, um eine souveräne, föderierte E-Mail- und Kollaborationsplattform in nationaler Dimension zu betreiben, existiert heute. Die Wirtschaftlichkeit stimmt. Die rechtliche Grundlage ist vorhanden. Was fehlt, ist der Entschluss, es zu tun.

## Das Problem ist nicht technisch

Die Hochschul-IT-Landschaft in Deutschland zeichnet sich durch Duplizierung aus. Jede Universität betreibt ihren eigenen Mailserver -- oder bezahlt einen kommerziellen Cloud-Anbieter dafür. Der Verwaltungsaufwand ist beträchtlich: Jede Einrichtung beschäftigt Personal für Identitätsmanagement, Speicher, Spamfilterung, Compliance und Backup für einen Dienst, der im Kern derselbe ist, der tausendfach erbracht wird.

Die Kosten sind nicht nur finanzieller Natur. Studierendendaten -- E-Mails, Kalendereinträge, Dateien -- fließen über kommerzielle Plattformen, deren Rechenzentren in den Vereinigten Staaten, Irland oder den Niederlanden stehen. Der CLOUD Act ermöglicht es US-Behörden, auf Daten zuzugreifen, die von US-Anbietern verwaltet werden -- unabhängig vom Standort der physischen Server. Der Europäische Gerichtshof hat wiederholt signalisiert, dass Standardvertragsklauseln allein möglicherweise nicht ausreichen, um davor zu schützen.

Für ein Forschungssystem, das sich auf Datenschutz und wissenschaftliche Unabhängigkeit beruft, ist das ein struktureller Widerspruch.

## Die Zahlen: Wie groß ist das wirklich?

Konkrete Zahlen helfen, die Diskussion von abstrakter Souveränitätsrhetorik zu umsetzbarer Planung zu führen.

**Skala.** Deutschland hat rund 400 Hochschulen (Universitäten, Fachhochschulen, duale Anbieter), die schätzungsweise 2,8 Millionen Studierende betreuen. Die durchschnittliche Studierenden-Mailbox nimmt nach Archivierung und Bereinigung etwa 1 GB ein. Das ergibt rund 2,8 PB an Mail-Speicher.

**Verkehr.** Ein typisches Studierendenkonto erhält geschätzt 10 legitime E-Mails pro Tag. Mit Spam und automatisierten Nachrichten erreicht das Volumen vor dem Filtern etwa 100 Nachrichten pro Mailbox und Tag -- oder rund 100 Millionen Nachrichten pro Tag über die gesamte Studierendenschaft. Etwa 60% davon können bereits an der Netzwerkkante abgewiesen werden (ungültige HELO, DNSBL, SPF-Fehler), bevor Inhaltsscanning erfolgt.

**Aktuelle Ausgaben.** Veröffentlichte IT-Budgets deuten darauf hin, dass deutsche Hochschulen zusammen schätzungsweise 40 bis 80 Millionen Euro pro Jahr für E-Mail- und Kollaborationsinfrastruktur ausgeben, einschließlich Lizenzen, Personal und Hardware. Diese Zahl verteilt sich auf hunderte einzelner Budgets und lässt sich nur schwer exakt verifizieren, aber selbst die untere Grenze stellt eine erhebliche Ausgabe dar.

## Ein föderiertes Zwei-Säulen-Modell

Der Vorschlag ist einfach: ein Zentraldienst für Studierende, ergänzt durch eine optionale On-Premise-Lösung für Beschäftigte.

**Säule 1 -- der zentrale Studierendendienst.** Ein einzelner Kubernetes-Cluster (oder ein Paar für geografische Redundanz), gehostet auf dem DFN-Backbone, stellt E-Mail, Dateispeicher, Kalender, Messenger und Office-Suite allen teilnehmenden Studierenden zur Verfügung. Die Authentifizierung integriert sich über eduPerson-Attribute in das DFN-AAI. Studierende melden sich mit ihren institutionellen Credentials an; ihre Mailbox liegt auf souveräner Infrastruktur.

**Säule 2 -- On-Premise für Beschäftigte.** Einrichtungen, die Beschäftigtendaten lieber auf eigener Hardware behalten möchten, können denselben Open-Source-Stack lokal deployen. Beide Säulen föderieren: Matrix für Nachrichten, CalDAV und CardDAV für Kalender und Kontakte, Nextcloud für Dateifreigaben. Eine Studierende an der einen Einrichtung kann mit einer Beschäftigten an einer anderen kommunizieren, ohne dass eine von beiden ihre Umgebung verlässt.

Dieses Zwei-Säulen-Design respektiert die föderale Struktur der deutschen Bildungspolitik. Der Zentraldienst ist ein freiwilliges Angebot; keine Einrichtung wird zum Beitritt gezwungen. Aber der wirtschaftliche Nutzen wächst mit jedem Teilnehmer.

## Was kostet das?

Eine Kapazitätsschätzung für den Zentraldienst, basierend auf Produktions-Benchmarks von Stalwart Mail (einem Rust-basierten Mailserver, der deutlich ressourceneffizienter ist als herkömmliche Postfix/Dovecot-Setups), ergibt folgenden ungefähren Hardwarebedarf:

| Komponente | Menge | Funktion |
|---|---|---|
| Storage-Nodes | 14--16 | Ceph-Erasure-Coding-Speicher (ca. 7,5 PB raw) |
| Mail-Worker | 5--6 | SMTP-Annahme, IMAP-Bereitstellung, Spam-/Viren-Scanning |
| Control Plane + Load Balancer | 12 | K8s-Verwaltung und Traffic-Verteilung |
| Monitoring | 3--4 | Observability-Stack |

Über einen Drei-Jahres-Zeitraum belaufen sich die geschätzten Gesamtkosten (Hardware, Colocation und etwa sechs Vollzeitäquivalente für Betrieb und Entwicklung) auf rund 1,8 Millionen Euro. Umgerechnet auf 2,8 Millionen Studierende und 36 Monate ergibt das etwa fünf Euro pro Studierende und Monat.

Dies ist eine Schätzung. Die tatsächlichen Kosten hängen von der gewählten Hardware, den Colocation-Preisen und dem Personalmodell ab. Aber selbst wenn der reale Wert 50% höher läge, bliebe der pro-Kopf-Anteil deutlich unter dem, was die meisten Einrichtungen derzeit für zersplitterte, weniger skalierbare Lösungen ausgeben.

Für Einrichtungen, die sich für die On-Premise-Säule entscheiden, kann eine kleine Universität mit rund 500 Beschäftigten den vollständigen Stack auf einem einzelnen Server ab etwa 3.000 Euro Hardwarekosten betreiben, plus vorhandenem IT-Personal.

## Die technischen Grundlagen sind fertig

Die einzelnen Komponenten sind nicht theoretisch. Stalwart Mail ist im produktiven Einsatz und verarbeitet IMAP, POP3, SMTP und JMAP mit nativer Volltextsuche. Die breitere openDesk-Edu-Plattform bietet Dateispeicher, Videokonferenzen, kollaborative Dokumentbearbeitung, SSO-Integration und eine umfassende Suite weiterer Kollaborationsdienste -- alles container-nativ und per Ansible- und Helm-Charts auf Kubernetes deploybar.

Die eigentliche Herausforderung in nationaler Dimension ist nicht die Reife einzelner Komponenten, sondern die operative Orchestrierung: die Bereitstellung von 2,8 Millionen Mailboxen, die Verarbeitung von 100 Millionen eingehenden Nachrichten pro Tag und die Aufrechterhaltung von Sub-Sekunden-IMAP-Antwortzeiten über einen geografisch verteilten Speichercluster. Das sind Skalierungsprobleme, keine Forschungsprobleme -- und das Open-Source-Ökosystem hat sie in anderen Sektoren in vergleichbaren Dimensionen gelöst.

## Governance: Wer betreibt das?

Ein Zentraldienst für 2,8 Millionen Studierende braucht eine Governance-Struktur, die von allen 16 Bundesländern akzeptiert wird. Bildungspolitik ist in Deutschland Ländersache (Kulturhoheit), ein Bundesauftrag ist also weder realistisch noch wünschenswert.

Ein praktisches Modell: ein eingetragener Verein (e.V.) unter dem Dach einer bestehenden Forschungsnetz-Organisation, gesteuert von einem technischen Beirat aus Landes-IT-Organisationen, einem Datenschutzrat und einer studentischen Vertretung. Die Finanzierung kombiniert Bundesstartfinanzierung (möglicherweise über das Digitalpakt-Programm), laufende Beiträge der teilnehmenden Länder proportional zu ihren Studierendenzahlen und freiwillige Beiträge von Einrichtungen, die erweiterte Services nutzen.

Die Teilnahme ist freiwillig. Der Datenexport über Standardprotokolle (IMAP, CalDAV) ist jederzeit möglich. Es gibt keinen Vendor-Lock-in -- der gesamte Stack ist unter der Apache-2.0-Lizenz.

## Was als Nächstes passieren muss

Die Technologie ist nicht der Engpass. Der Engpass ist die institutionelle Koordination.

1. **Ein Gespräch zwischen Bundes- und Landesbildungsministerien sowie dem DFN.** Der Vorschlag braucht einen politischen Sponsor. Der DFN betreibt bereits das nationale Forschungsnetz und verfügt über Erfahrung mit föderierter Identitätsinfrastruktur.

2. **Eine Datenschutz-Folgenabschätzung.** Die Zentralisierung von 2,8 Millionen Mailboxen verändert die Datenschutzbilanz. Ein externer Datenschutzbeauftragter sollte die Architektur vor jedem Pilot evaluieren.

3. **Ein Proof of Concept.** Ein 30-Tage-Testbetrieb mit 5.000 simulierten Mailboxen auf der vorgeschlagenen Infrastruktur würde die Kapazitätsschätzungen validieren und operative Grenzfälle identifizieren.

4. **Piloteinrichtungen.** Drei bis fünf Universitäten unterschiedlicher Größe und aus verschiedenen Bundesländern könnten das Modell mit echten Nutzern validieren, bevor eine breitere Aufnahme erfolgt.

## Fazit

Den Betrieb einer souveränen E-Mail- und Kollaborationsplattform für jede Studierende in Deutschland zu realisieren, ist keine Frage der technischen Machbarkeit. Es ist eine Frage des politischen Willens und der institutionellen Koordination. Die Kosten pro Studierende sind ein Bruchteil dessen, was die Einrichtungen derzeit zusammen ausgeben. Die Datensouveränitätsvorteile sind sofort und irreversibel. Der Open-Source-Stack schließt die Vendor-Abhängigkeit vollständig aus.

Die Zahlen sind groß. Das ist der Punkt. Im Denken in der Dimension der nationalen Studierendenschaft liegt eine Unbekanntheit, die in einem System, das auf institutioneller Autonomie aufgebaut ist, ungewohnt ist. Aber Autonomie und Föderation sind keine Gegensätze. Eine gut gestaltete föderierte Plattform gibt jeder Einrichtung die volle Kontrolle über ihre On-Premise-Daten, während die operative Last eines Commodore-Dienstes in einem Maß gebündelt wird, das keine von ihnen allein erreichen könnte.

---

## Was Sie tun können

1. **Den vollständigen Vorschlag lesen:** Die detaillierte Kapazitätsanalyse und das Governance-Modell sind als Begleitdokument verfügbar.
2. **Den Stack testen:** openDesk Edu deployt aus einem einzelnen Ansible-Playbook. Starten Sie mit einer Single-Node-Instanz und evaluieren Sie.
3. **Am Gespräch teilnehmen:** Teilen Sie diesen Beitrag mit der IT-Leitung Ihrer Einrichtung. Je mehr Entscheidungsträger die Zahlen sehen, desto schneller kann die Koordination beginnen.

---

*Die skalierbarste Infrastruktur ist die, die man einmal baut und mit allen teilt.*
