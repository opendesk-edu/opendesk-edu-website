---
title: "TYPO3"
date: "2026-04-14"
description: "Enterprise-CMS für Universitätswebsites und Forschungsportale."
categories: ["cms", "web", "beta"]
tags: ["typo3", "cms", "website", "beta"]
---

# TYPO3

TYPO3 ist ein Enterprise-Content-Management-System für professionelle Websites, das sich besonders für Universitätswebsites, Fakultätsportale und Forschungsseiten eignet. Es bietet eine hohe Flexibilität, mehrsprachige Unterstützung und ein umfangreiches Extension-System. TYPO3 ist als bildungsspezifische Beta-Komponente Teil von openDesk Edu.

## Hauptfunktionen

- **Flexibles Seitenmanagement**: Hierarchische Seitenstruktur mit verschachtelten Inhalten
- **Mehrsprachigkeit**: Native Unterstützung für mehrsprachige Websites
- **Extension-System**: Umfangreiches Ökosystem an Erweiterungen für zusätzliche Funktionen
- **Frontend-Editing**: Direktes Bearbeiten von Inhalten auf der Website
- **Berechtigungskonzept**: Rollenbasierte Zugriffssteuerung für Redakteure und Administratoren

## Integration mit openDesk Edu

TYPO3 ist eine bildungsspezifische Beta-Komponente und wird über Helm-Charts bereitgestellt. Die Authentifizierung erfolgt über Keycloak SSO (SAML 2.0 / OIDC) über das einheitliche Portal. Persistente Daten werden automatisch von k8up gesichert.
