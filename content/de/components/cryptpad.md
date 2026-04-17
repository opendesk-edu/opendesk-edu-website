---
title: "CryptPad"
date: "2026-03-15"
description: "Datenschutzorientierte kollaborative Office-Suite mit integriertem diagrams.net für sichere Zusammenarbeit."
categories: ["office", "kollaboration", "datenschutz"]
tags: ["cryptpad", "diagramme", "whiteboard", "office"]
---

# CryptPad

CryptPad ist eine datenschutzorientierte, Ende-zu-Ende-verschlüsselte Office-Suite für kollaboratives Arbeiten. Sie bietet Textverarbeitung, Tabellenkalkulation, Präsentationen und ein integriertes diagrams.net für die Erstellung von Diagrammen. Als Basis-openDesk-CE-Komponente eignet sie sich auch als datenschutzfreundliche Whiteboard-Alternative.

## Hauptfunktionen

- **Ende-zu-Ende-Verschlüsselung**: Alle Inhalte werden clientseitig verschlüsselt, bevor sie gespeichert werden
- **Collaborative Docs**: Gemeinsames Bearbeiten von Textdokumenten, Tabellen und Präsentationen
- **Integriertes diagrams.net**: Diagrammerstellung direkt in der Suite, ohne externe Tools
- **Whiteboard**: Kollaboratives Whiteboard für Brainstorming und Skizzen
- **Datenschutz**: Zero-Knowledge-Prinzip, der Serverbetreiber hat keinen Zugriff auf Inhalte

## Integration mit openDesk Edu

CryptPad ist Teil der Basis-openDesk-CE-Installation und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
