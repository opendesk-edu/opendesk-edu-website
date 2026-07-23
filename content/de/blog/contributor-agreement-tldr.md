---
title: "TL;DR: openDesk Contributor Agreement"
date: "2026-07-12"
description: "Eine Kurzanleitung zum Unterschreiben der CLA und zum Starten Ihres ersten Beitrags zu openDesk."
categories: ["Gemeinschaft"]
tags: ["beitragen", "cla", "open-source"]
image: "/static/blog/contributor-agreement-tldr-teaser.svg"
---

# TL;DR: openDesk Contributor Agreement

Sie möchten zu openDesk beitragen. Prima. openDesk ist eine community-getriebene Plattform, und jeder Beitrag beginnt mit einem Schritt: dem Unterzeichnen der Contributor License Agreement (CLA). Dieser Leitfaden erklärt, was die CLA ist, warum es sie gibt und wie Sie den Prozess in unter zehn Minuten abschließen.

## Wozu eine CLA?

openDesk wird unter der Apache License 2.0 veröffentlicht, einer freizügigen Open-Source-Lizenz, die jedem die Freiheit gibt, die Software zu nutzen, zu ändern und weiterzuverbreiten. Aber openDesk wird von mehreren Organisationen entwickelt. Hochschulen, Dienstleister und einzelne Beitragende reichen alle Code ein. Die CLA stellt sicher, dass jeder Beitrag eine klare Rechtszusage enthält.

Ohne CLA drohen rechtliche Unsicherheiten. Hatte der Beitragende das Recht, diesen Code einzureichen? Kann sein Arbeitgeber Anspruch darauf erheben? Die CLA klärt diese Fragen, bevor der Code ins Repository gelangt. Sie schützt sowohl die Beitragenden (niemand kann behaupten, sie hätten nicht zugestimmt) als auch das Projekt (die Codebasis bleibt sauber lizenziert).

## Der Zwei-Schritte-Prozess

Beitragen läuft in zwei Schritten ab:

1.  **Stellen Sie einen Zugriffsantrag.** Sie beantragen Zugriff auf das Projekt in GitLab.
2.  **Erstellen Sie einen signierten Commit.** Ihr erster Merge-Request muss mindestens einen mit Ihrem GPG- oder SSH-Schlüssel signierten Commit enthalten.

Das ist alles. Sobald Sie beide Schritte abgeschlossen haben, übernimmt der Bot.

## Wie der Bot arbeitet

Der CLA-Bot läuft alle 15 Minuten. Er prüft auf neue Zugriffsanträge in GitLab, verifiziert die signierten Commits und gewährt automatisch Zugriff. Sie brauchen nicht auf einen menschlichen Prüfer zu warten. Wenn Ihr Commit ordnungsgemäß signiert und Ihr Zugriffsantrag gestellt ist, erledigt der Bot den Rest.

Im Einzelnen prüft der Bot:

-   Ob der Commit kryptografisch signiert ist (GPG oder SSH).
-   Ob die zum Schlüssel gehörige E-Mail-Adresse mit Ihrem GitLab-Profil übereinstimmt.
-   Ob die Commit-Nachricht den `userid:username`-Eintrag enthält (mehr dazu unten).

Alles in Ordnung? Der Zugriff wird im nächsten Bot-Zyklus gewährt. Keine manuelle Freigabe erforderlich.

## Wie ein signierter Commit aussieht

Ein signierter Commit erscheint im Git-Log so:

```
commit a1b2c3d4e5f6...
Author: Ihr Name <ihre.email@example.com>
Date:   Mon Jul 7 14:23:00 2026 +0200

    Implementierung des Widget-Moduls

    userid:ihr-gitlab-benutzername
```

Der entscheidende Teil ist die letzte Zeile des Commit-Textes. Sie muss `userid:` gefolgt von Ihrem GitLab-Benutzernamen enthalten. So ordnet der Bot den signierten Commit Ihrem Zugriffsantrag zu.

## Commit-Signierung einrichten

Falls Sie noch nie einen Commit signiert haben, hier die Kurzfassung.

**GPG-Signierung:**

1.  GPG-Schlüssel erzeugen: `gpg --full-generate-key`
2.  Schlüssel-ID anzeigen: `gpg --list-secret-keys --keyid-format=long`
3.  Git konfigurieren: `git config --global user.signingkey <SCHLÜSSEL-ID>`
4.  Signierung global aktivieren: `git config --global commit.gpgsign true`
5.  Öffentlichen Schlüssel im GitLab-Profil hinterlegen (Einstellungen > GPG Keys).

**SSH-Signierung:**

1.  Vorhandenen SSH-Schlüssel nutzen oder einen neuen erzeugen.
2.  Git konfigurieren: `git config --global gpg.format ssh`
3.  Signierschlüssel setzen: `git config --global user.signingkey ~/.ssh/id_ed25519.pub`
4.  Öffentlichen Schlüssel im GitLab-Profil hinterlegen (Einstellungen > SSH Keys).

Dann den Commit signieren: `git commit -S -m "Ihre Nachricht"` (die Option `-S` aktiviert die Signierung).

## Nach der Zusammenführung Ihres Merge-Requests

Sobald Ihr erster Merge-Request angenommen und vom Bot verarbeitet wurde, erhalten Sie einen persönlichen Fork-Namespace auf GitLab. Das ist Ihr eigener Arbeitsbereich innerhalb des openDesk-Projekts, benannt nach Ihrem GitLab-Benutzernamen. Sie können ihn nutzen, um Merge-Requests zu erstellen, an Funktionen mitzuarbeiten und Ihre Beiträge zu verwalten, ohne das Hauptrepository zu beeinflussen.

## Wo Sie die Repositories finden

Das openDesk-Projekt umfasst mehrere Repositories mit jeweils spezifischem Fokus:

-   **Deployment:** Die helmfile-basierte Deployment-Konfiguration für openDesk CE.
-   **Bildungsvariante:** openDesk Edu mit 25 integrierten Diensten für Hochschulen.
-   **Werkzeuge:** Import-Skripte, Backup-Operatoren (k8up) und Hilfsprogramme.
-   **Dokumentation:** Architektur-Dokumentation, Entwicklerleitfäden und Betriebshandbücher.
-   **Charts:** Lokale Helm-Chart-Anpassungen und von der Community gepflegte Chart-Pakete.
-   **Compose-Variante:** Eine Docker-Compose-Alternative für kleinere Installationen.

Alle Repositories leben in der [openDesk-GitLab-Gruppe](https://gitlab.opencode.de/bmi/opendesk). Durchstöbern Sie die Projektliste, finden Sie etwas das Sie interessiert, und beginnen Sie mit dem Beitragen.

## Das CLA-Repository

Die CLA-Infrastruktur ist ebenfalls Open Source. Sie können den Bot-Code einsehen, den Vertragstext prüfen und selbst Verbesserungen an den CLA-Werkzeugen beitragen. Alles befindet sich im [cla-signer-Repository](https://gitlab.opencode.de/bmi/opendesk/contributing/cla-signer).

---

Bereit zum Beitragen? Stellen Sie Ihren Zugriffsantrag auf GitLab, signieren Sie Ihren ersten Commit, und werden Sie Teil der openDesk-Community.
