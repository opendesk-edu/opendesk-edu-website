---
title: "Office"
date: "2026-03-11"
description: "Online-Office-Suite auf LibreOffice-Basis für kollaboratives Bearbeiten von Dokumenten."
categories: ["office", "kollaboration"]
tags: ["collabora", "office", "libreoffice", "dokumente"]
---

# Office

Office basiert auf Collabora und bietet eine Online-Office-Suite, die auf LibreOffice aufbaut. Nutzer können Dokumente, Tabellen und Präsentationen direkt im Browser erstellen und gemeinsam bearbeiten. Als Basis-openDesk-CE-Komponente dient Collabora als zentrale Online-Bearbeitungsoberfläche für die Plattform.

## Hauptfunktionen

- **Textverarbeitung**: Erstellen und Bearbeiten von Dokumenten im ODF- und Microsoft Office-Format
- **Tabellenkalkulation**: Kalkulationstabellen mit Formeln und Diagrammen
- **Präsentationen**: Erstellen von Folienpräsentationen im Browser
- **Kollaboratives Bearbeiten**: Gleichzeitiges Arbeiten mehrerer Nutzer am selben Dokument
- **Formatkompatibilität**: Nahtlose Unterstützung für ODF, DOCX, XLSX und PPTX

## Integration mit openDesk Edu

Office ist Teil der Basis-openDesk-CE-Installation und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt zentral über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Collabora wird von Nextcloud und anderen Komponenten als eingebetteter Editor genutzt. Persistente Daten werden automatisch von k8up gesichert.
