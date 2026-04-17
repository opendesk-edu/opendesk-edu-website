---
title: "Komponenten-Alternativen"
date: "2026-04-15"
description: "Vergleich der verfügbaren alternativen Komponenten in openDesk Edu, einschließlich E-Mail, Videokonferenzen, Dateispeicher und Whiteboard-Lösungen."
categories: ["architektur", "komponenten"]
tags: ["vergleich", "alternativen", "e-mail", "video", "dateien", "whiteboard"]
---

# Komponenten-Alternativen

openDesk Edu bietet bei einigen Dienstkategorien eine Auswahl. Anstatt Sie auf eine einzige Implementierung festzulegen, können Sie die Komponente auswählen, die zur Größe, zu den Arbeitsabläufen und zu den Compliance-Anforderungen Ihrer Einrichtung passt.

Es gibt vier Kategorien mit Alternativen: E-Mail und Groupware, Videokonferenzen, Dateien und Cloud-Speicher sowie Whiteboards. In den meisten Kategorien kann jeweils nur eine Option aktiv sein. Ausnahmen werden unten genannt.

Alle Komponenten-Auswahlen werden in einer einzigen Datei konfiguriert: `helmfile/environments/default/global.yaml.gotmpl`.

---

## E-Mail und Groupware

Drei Groupware-Suiten stehen zur Verfügung. Es kann jeweils nur eine gleichzeitig aktiv sein.

| Funktion | OX App Suite | SOGo | Grommunio |
|---|---|---|---|
| Umfang | Vollständige Enterprise-Groupware-Suite | Leichtgewichtiges Webmail mit Kalender | Groupware mit nativer mobilem Synchronisation |
| Lizenz | GPL-2.0 / AGPL-3.0 | LGPL-2.1 | AGPL-3.0 |
| Version | 8.46 | 5.11 | 2025.01 |
| Kalender | Ja | Ja | Ja |
| Kontakte | Ja | Ja | Ja |
| Aufgaben | Ja | Ja | Ja |
| ActiveSync-Unterstützung | Ja | Nein | Ja (ActiveSync 16.1) |
| Mobile Push-Benachrichtigungen | Ja | Nein | Ja |
| Ressourcenverwaltung | Ja | Eingeschränkt | Ja |
| Gemeinsame Postfächer | Ja | Ja | Ja |

Die **OX App Suite** ist die funktionsreichste Option. Sie liefert eine vollständige Groupware-Plattform mit E-Mail, Kalender, Kontakten, Aufgaben, Dokumentbearbeitung und Ressourcenverwaltung. Ihre Enterprise-Herkunft zeigt sich in Funktionen wie gemeinsamen Postfächern, Delegation und granularen Berechtigungskontrollen. Der Kompromiss ist die Komplexität: OX benötigt mehr Serverressourcen und hat eine steilere Lernkurve für Administratoren.

**SOGo** hält die Dinge einfach. Es bietet zuverlässiges Webmail zusammen mit Kalender- und Kontaktverwaltung in einem leichtgewichtigen Paket. Wenn Ihre Einrichtung hauptsächlich E-Mail mit grundlegender Terminplanung benötigt, erledigt SOGo die Arbeit mit geringeren Hardwareanforderungen. Die Hauptbeschränkung ist das Fehlen von nativem Mobile-Push über ActiveSync, sodass mobile Nutzer auf IMAP und CalDAV angewiesen sind.

**Grommunio** füllt die Mitte. Seine herausragende Funktion ist die ActiveSync-16.1-Unterstützung, die Nutzern native Outlook- und Mobilgeräteintegration bietet. Das ist wichtig für Einrichtungen, die eine enge mobile Synchronisation ohne eine Drittanbieter-App benötigen. Grommunio bietet außerdem einen modernen Webclient und vollständige Groupware-Funktionen.

Nur eine dieser drei Suiten kann gleichzeitig aktiv sein. Der Wechsel erfordert eine Aktualisierung der Konfiguration und erneutes Anwenden des Helmfiles sowie die Planung der Datenmigration, falls Nutzer bereits Postfächer haben.

---

## Videokonferenzen

 Zwei Videokonferenz-Tools stehen zur Verfügung. Im Gegensatz zur Groupware-Kategorie können beide gleichzeitig betrieben werden.

| Funktion | Jitsi | BigBlueButton |
|---|---|---|
| Umfang | Schnelle Ad-hoc-Meetings | Vollständige Vorlesungen mit interaktiven Tools |
| Lizenz | Apache-2.0 | LGPL-3.0 |
| Version | 2.0.10590 | 2.7 (Beta) |
| Bildschirmfreigabe | Ja | Ja |
| Aufzeichnung | Ja | Ja |
| Whiteboard | Nein | Ja |
| breakout-Räume | Nein | Ja |
| Umfragen | Nein | Ja |
| Präsentationsmodus | Nein | Ja |
| Maximale Teilnehmer | ca. 50 (serverabhängig) | ca. 200+ |
| Moodle-Integration | Eingeschränkt | Ja |

**Jitsi** ist hervorragend für schnelle, informelle Meetings geeignet. Einen Raum erstellen, einen Link teilen und loslegen. Es funktioniert gut für persönliche Sprechstunden, kleine Teamanrufe und spontane Diskussionen. Die Einrichtung ist unkompliziert und der Ressourcenverbrauch moderat. Jitsi bietet keine breakout-Räume, integrierte Umfragen oder ein Whiteboard und ist daher weniger für strukturierte Lehrveranstaltungen geeignet.

**BigBlueButton** ist für die Bildung konzipiert. Es umfasst ein virtuelles Whiteboard, Präsentationsfolien, breakout-Räume, Umfragen und Sitzungsaufzeichnungen in einer einzigen Oberfläche. Diese Funktionen machen es zu einer guten Wahl für vollständige Vorlesungen, Seminare und Workshops, in denen der Dozent eine große Gruppe verwalten muss. BigBlueButton ist in openDesk Edu als Beta gekennzeichnet, was bedeutet, dass die Integration funktionsfähig ist, aber noch auf Basis realer Rückmeldungen verfeinert wird.

Da beide Tools gleichzeitig betrieben werden können, können Einrichtungen Jitsi für alltägliche kurze Anrufe nutzen und BigBlueButton für geplante Vorlesungen reservieren, die die erweiterten Funktionen benötigen.

---

## Dateien und Cloud-Speicher

 Zwei Datei-Sharing-Plattformen stehen zur Verfügung. Es kann jeweils nur eine gleichzeitig aktiv sein.

| Funktion | Nextcloud | OpenCloud |
|---|---|---|
| Umfang | Vollständige Cloud-Suite | Leichtgewichtiges CS3-basiertes Sharing |
| Lizenz | AGPL-3.0 | Apache-2.0 |
| Version | 32.0.6 | 4.0.3 (Beta) |
| Dateisynchronisierungs-Client | Ja | Ja |
| Weboberfläche | Ja | Ja |
| Kollaboratives Bearbeiten | Ja (über Nextcloud Office) | Eingeschränkt |
| Kursbezogene Freigaben | Über Sharing-API | Native Unterstützung |
| Kalender | Ja | Nein |
| Kontakte | Ja | Nein |
| Talk (Chat) | Ja | Nein |
| Externe Speichereinhängungen | Ja | Eingeschränkt |
| App-Ökosystem | Groß | Minimal |

**Nextcloud** ist eine umfassende Self-Hosted-Cloud-Plattform. Über Dateispeicherung hinaus bündelt sie Kalender, Kontakte, Echtzeit-Chat (Nextcloud Talk), kollaborative Dokumentbearbeitung und ein großes App-Ökosystem. Sie integriert sich gut in bestehende Tools und kann externe Speicher-Backends einhängen. Der Funktionsumfang geht mit höherer Komplexität und mehr Ressourcenverbrauch einher, aber für Einrichtungen, die eine einzelne Plattform für viele Kollaborationsaufgaben wünschen, ist Nextcloud die naheliegende Wahl.

**OpenCloud** verfolgt einen fokussierteren Ansatz. Auf Basis des Collabora Spaces 3 (CS3)-Protokolls bietet es leichtgewichtiges Datei-Sharing mit nativer Unterstützung für kursbezogene Freigaben. Das ist besonders interessant für Bildungsumgebungen, in denen Dateien an bestimmte Kurse gebunden sein müssen. OpenCloud ist als Beta gekennzeichnet, was zeigt, dass die Integration noch entwickelt wird.

Nur eine Dateispeicherlösung kann aktiv sein. Wählen Sie Nextcloud, wenn Sie die vollständige Plattform benötigen, oder OpenCloud, wenn Sie ein schlankeres, kursorientiertes Datei-Sharing wünschen.

---

## Whiteboard

 Zwei Whiteboard-Tools stehen zur Verfügung. Beide können gleichzeitig betrieben werden.

| Funktion | Excalidraw | CryptPad-Diagramme |
|---|---|---|
| Umfang | Freihand-Skizzen und Diagramme | Datenschutzorientierte kollaborative Diagramme |
| Lizenz | MIT | AGPL-3.0 |
| Version | Aktuellste | 2025.9.0 |
| Freihandzeichnung | Ja | Eingeschränkt |
| Formen und Pfeile | Ja | Ja |
| Echtzeit-Kollaboration | Ja | Ja |
| Ende-zu-Ende-Verschlüsselung | Nein | Ja |
| Vorlagen | Nein | Ja |
| Exportformate | SVG, PNG, JSON | SVG, PNG |
| Privacy by Design | Nein | Ja |

**Excalidraw** ist ein virtuelles Whiteboard, das sich anfühlt wie Skizzieren auf Papier. Der handgezeichnete Stil macht es zugänglich für Brainstorming, schnelle Diagramme und informelle Erklärungen. Die Kollaboration funktioniert in Echtzeit, und die Exportoptionen decken die gängigen Formate ab. Da die Lizenz MIT ist, integriert es sich reibungslos in openDesk Edu.

**CryptPad-Diagramme** verfolgen einen Datenschutz-first-Ansatz. Alle Diagramme sind Ende-zu-Ende verschlüsselt, sodass nicht einmal der Serveradministrator den Inhalt sehen kann. Das macht es zu einer guten Wahl für Einrichtungen mit strengen Datenschutzanforderungen. Es bietet außerdem Vorlagen und eine strukturiertere Diagrammerfahrung im Vergleich zur freien Leinwand von Excalidraw.

Beide Whiteboards können gleichzeitig betrieben werden. Nutzer können also das Tool wählen, das zu ihrer Aufgabe passt: Excalidraw für schnelles Brainstorming, CryptPad für sensible Diagramme, die Verschlüsselung benötigen.

---

## Die richtigen Komponenten wählen

Es gibt keine einzelne "beste" Kombination. Die richtige Wahl hängt von den Prioritäten Ihrer Einrichtung ab.

**Kleine Einrichtungen** (Schulen, kleine Fachbereiche) bevorzugen in der Regel Einfachheit. SOGo für E-Mail, Jitsi für Video und eine der beiden Dateispeicher-Optionen hält die Infrastruktur überschaubar. Der geringere Ressourcenbedarf bedeutet, dass es auf bescheidener Hardware läuft.

**Große Universitäten** benötigen meist den vollen Funktionsumfang. Die OX App Suite bewältigt komplexe E-Mail-Setups, BigBlueButton führt große Vorlesungen mit breakout-Räumen durch, und Nextcloud bietet die breite Kollaborationsplattform. Diese Kombination erfordert mehr Serverressourcen und Verwaltungskapazität, deckt aber nahezu jeden Anwendungsfall ab.

**Forschungsorientierte Einrichtungen** könnten Flexibilität und Datenschutz priorisieren. Nextcloud gibt Forschenden Raum zum Teilen großer Datensätze, Excalidraw unterstützt schnelle visuelle Erklärungen, und CryptPad verarbeitet Diagramme mit sensiblen Daten. Grommunio für E-Mail stellt sicher, dass Forschende eine solide mobile Synchronisation erhalten, ohne den Self-Hosted-Stack zu verlassen.

---

## Komponenten wechseln

Das Ändern einer Komponente ist eine Konfigurationsänderung, keine Neuinstallation.

1. Öffnen Sie `helmfile/environments/default/global.yaml.gotmpl` in Ihrem Deployment-Repository.
2. Finden Sie den Abschnitt für die Kategorie, die Sie ändern möchten (E-Mail, Video, Dateien oder Whiteboard).
3. Setzen Sie die aktive Komponente und kommentieren Sie die Alternative aus oder entfernen Sie sie.
4. Führen Sie `helmfile apply` aus, um das Deployment zu aktualisieren.

**Datenmigration** ist der Teil, der Aufmerksamkeit erfordert. Wenn Sie zwischen sich gegenseitig ausschließenden Komponenten wechseln (E-Mail oder Dateispeicher), werden vorhandene Nutzerdaten nicht automatisch übertragen. Planen Sie Folgendes ein:

- Exportieren von Postfächern aus der alten Groupware und Importieren in die neue.
- Migrieren von Dateien von einem Speicher-Backend in das andere.
- Aktualisieren von Nutzer-Lesezeichen und geteilten Links.
- rechtzeitige Kommunikation der Änderung an die Nutzer.

Für Kategorien, in denen beide Tools koexistieren (Videokonferenzen und Whiteboards), ist keine Migration erforderlich. Nutzer beginnen einfach, das neue Tool neben dem bestehenden zu nutzen.
