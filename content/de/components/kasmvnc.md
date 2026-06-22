---
title: "KasmVNC"
date: "2026-05-29"
description: "Vollständige Linux-Desktop-Umgebung im Browser mit nahezu nativer Leistung."
categories: ["infrastruktur", "wissenschaftliches-rechnen", "beta"]
tags: ["kasmvnc", "desktop", "vnc", "fernzugriff", "wissenschaftliches-rechnen"]
version: "1.16"
---

# KasmVNC

KasmVNC bietet eine vollständige Linux-Desktop-Umgebung direkt im Browser mittels WebAssembly-basiertem Streaming. Studierende und Forschende erhalten Zugriff auf GUI-Anwendungen, Entwicklungswerkzeuge und wissenschaftliche Software, die eine Desktop-Umgebung erfordert – ohne Installation auf dem Client-Gerät.

## Hauptfunktionen

- **Vollständiger Desktop im Browser**: Streamen eines kompletten Linux-Desktops (XFCE) mit nahezu nativer Leistung.
- **GPU-Beschleunigung**: WebGL-Unterstützung für 3D-Visualisierung und GPU-beschleunigte Anwendungen.
- **Vorkonfigurierte Arbeitsumgebungen**: Desktop-Images mit vorinstallierten wissenschaftlichen Werkzeugen und IDEs.
- **Zwischenablage und Dateitransfer**: Bidirektionale Zwischenablage sowie Datei-Upload/-Download zwischen Client und Desktop.
- **Audio-Unterstützung**: Audiostreaming vom entfernten Desktop zum Browser.

## Integration mit openDesk Edu

KasmVNC ist Teil der Collab Services Suite und wird über das zugehörige upstream Helm-Chart (`registry.kasmweb.com`) bereitgestellt. Die Authentifizierung erfolgt über Keycloak mittels eines oauth2-proxy Sidecars und ist unter `desktop.*` des institutionellen Wildcard-DNS erreichbar.

## Mehr erfahren

- [Offizielle Dokumentation](https://kasmweb.com/) — KasmVNC-Dokumentation und Ressourcen
