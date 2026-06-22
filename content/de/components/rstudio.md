---
title: "RStudio Server"
date: "2026-05-29"
description: "Professionelle R-IDE mit Shiny-App-Unterstützung, Arbeitsbereichsverwaltung und OpenCloud-Dateisynchronisation."
categories: ["wissenschaftliches-rechnen", "forschung", "beta"]
tags: ["rstudio", "r", "shiny", "statistics", "data-science", "scientific-computing"]
version: "2024.12.0"
---

# RStudio Server

RStudio Server bietet eine professionelle integrierte Entwicklungsumgebung für R, die von jedem Webbrowser aus zugänglich ist. Sie umfasst eine Konsole, einen Editor mit Syntaxhervorhebung, Plotting-Werkzeuge, Arbeitsbereichsverwaltung und Shiny-App-Unterstützung — alles serverbasiert.

## Hauptfunktionen

- **Vollständige R-IDE**: Konsole, Editor, Umgebungsansicht, Plot-Verlauf und Dateibrowser im Browser.
- **Shiny-App-Unterstützung**: Interaktive Shiny-Webanwendungen entwickeln, testen und bereitstellen.
- **Paketverwaltung**: CRAN-Pakete mit Abhängigkeitsauflösung installieren und verwalten.
- **OpenCloud-Integration**: Bindet den OpenCloud-Speicher des Benutzers über einen rclone-WebDAV-Sidecar für direkten Dateizugriff ein.
- **Datenimport/-export**: Native Unterstützung für CSV, Excel, SPSS, SAS und Stata-Dateiformate.

## Integration mit openDesk Edu

RStudio Server ist Teil der Collab Services Suite und wird über ein benutzerdefiniertes lokales Helm-Chart (`helmfile/charts/rstudio`) bereitgestellt. Die Authentifizierung erfolgt über Keycloak mithilfe eines oauth2-proxy-Sidecars. Der Dienst ist unter `r.*` der Wildcard-DNS der Einrichtung erreichbar. Ein OpenCloud-WebDAV-Sidecar sorgt für nahtlose Dateisynchronisation mit dem Cloud-Speicher des Benutzers.

## Weitere Informationen

- [Offizielle Dokumentation](https://posit.co/products/open-source/rstudio-server/) — RStudio Server-Dokumentation und Ressourcen
