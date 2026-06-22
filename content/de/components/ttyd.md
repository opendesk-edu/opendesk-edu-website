---
title: "ttyd"
date: "2026-05-29"
description: "Browserbasiertes Linux-Terminal mit vollem Befehlszeilenzugriff von jedem Gerät."
categories: ["infrastruktur", "wissenschaftliches-rechnen"]
tags: ["ttyd", "terminal", "ssh", "cli", "scientific-computing"]
version: "1.7"
---

# ttyd

ttyd ist ein leichtgewichtiges Werkzeug, das ein vollständiges Linux-Terminal über den Webbrowser bereitstellt. Es bietet Studierenden und Forschenden Befehlszeilenzugriff auf die Serverumgebung von jedem Gerät aus und ermöglicht SSH-Zugriff, Skriptausführung und Systemadministration ohne Installation eines Terminalemulators.

## Hauptfunktionen

- **Browserbasiertes Terminal**: Vollständiges xterm-kompatibles Terminal in jedem modernen Webbrowser.
- **Keine Client-Installation**: Funktioniert auf Chromebooks, Tablets und eingeschränkten Geräten mit einem Browser.
- **Dateizugriff**: Voller Dateisystemzugriff auf Benutzerspeicher und gemeinsame Forschungsdaten.
- **Zwischenablage-Unterstützung**: Kopieren und Einfügen zwischen lokalem Rechner und Browser-Terminal.
- **Sitzungspersistenz**: Terminalsitzungen bleiben über Seitenneuladungen hinweg erhalten dank tmux-Integration.

## Integration mit openDesk Edu

ttyd ist Teil der Collab Services Suite und wird über ein benutzerdefiniertes lokales Helm-Chart (`helmfile/charts/ttyd`) bereitgestellt. Die Authentifizierung erfolgt über Keycloak mithilfe eines oauth2-proxy-Sidecars. Der Dienst ist unter `term.*` der Wildcard-DNS der Einrichtung erreichbar.

## Weitere Informationen

- [Offizielle Dokumentation](https://github.com/tsl0922/ttyd) — ttyd-Dokumentation und Ressourcen
