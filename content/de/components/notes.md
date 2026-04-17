---
title: "Notizen"
date: "2026-03-03"
description: "Leichtgewichtige Notizanwendung für schnelle Textnotizen und Dokumente."
categories: ["produktivitaet", "notizen"]
tags: ["notes", "notizen", "dokumente"]
---

# Notizen

Notizen (auch als Notes oder Docs bekannt) ist eine leichtgewichtige Anwendung zum Erstellen und Verwalten von Textnotizen und einfachen Dokumenten. Sie richtet sich an Nutzer, die schnell Gedanken festhalten oder kurze Dokumente erstellen möchten, ohne eine vollwertige Textverarbeitung zu öffnen. Als Basis-openDesk-CE-Komponente ist sie standardmäßig verfügbar.

## Hauptfunktionen

- **Schnelle Notizerstellung**: Direktes Erstellen und Bearbeiten von Textnotizen im Browser
- **Dokumentenverwaltung**: Ordnerstruktur und Suchfunktion für die Organisation von Inhalten
- **Markdown-Unterstützung**: Formatierungsmöglichkeiten durch Markdown-Syntax
- **Einfache Freigabe**: Notizen mit anderen Nutzern und Gruppen teilen

## Integration mit openDesk Edu

Notizen ist Teil der Basis-openDesk-CE-Installation und wird über Helm-Charts bereitgestellt. Die Anmeldung erfolgt zentral über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
