---
title: "Etherpad"
date: "2026-04-17"
description: "Éditeur de documents collaboratif en temps réel pour les comptes-rendus et les ateliers."
categories: ["collaboration", "beta-education"]
tags: ["etherpad", "edition-collaborative", "comptes-rendus", "atelier"]
---

# Etherpad

Etherpad est un éditeur de documents collaboratif en temps réel. Plusieurs personnes peuvent rédiger simultanément dans le même document, avec une mise en couleur des contributions de chaque auteur. C'est un outil idéal pour les comptes-rendus de réunions, les ateliers d'écriture et les séances de brainstorming collectif.

## Fonctionnalités clés

- **Édition collaborative en temps réel**: Plusieurs rédacteurs travaillent simultanément sur le même texte
- **Attribution par couleur**: Chaque auteur est identifié par une couleur pour suivre les contributions
- **Historique des modifications**: Retrouvez chaque version du document avec la timeline intégrée
- **Export multi-format**: Téléchargez le document en HTML, PDF, texte brut ou Word
- **Plugins extensibles**: Fonctionnalités supplémentaires via un système de plugins (tableaux, images, etc.)

## Intégration avec openDesk Edu

Etherpad est un composant en version Beta pour le contexte éducatif. Il se déploie via Helm et s'intègre au portail unifié avec authentification Keycloak en SSO (SAML 2.0 / OIDC). Les enseignants peuvent créer des pads pour leurs ateliers et les partager avec leurs étudiants directement depuis le portail.
