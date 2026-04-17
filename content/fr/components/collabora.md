---
title: "Bureautique"
date: "2026-03-11"
description: "Suite bureautique en ligne basée sur LibreOffice pour l'édition collaborative de documents."
categories: ["bureautique", "composant-de-base"]
tags: ["collabora", "bureautique", "libreoffice", "edition-collaborative"]
---

# Bureautique

Bureautique repose sur Collabora, une suite bureautique en ligne basée sur LibreOffice. Elle permet de créer et modifier des documents texte, des feuilles de calcul et des présentations directement dans le navigateur, avec la possibilité de collaborer en temps réel. Collabora s'intègre nativement avec Nextcloud pour l'édition en ligne des fichiers stockés dans Fichiers.

## Fonctionnalités clés

- **Édition collaborative en temps réel**: Plusieurs utilisateurs peuvent modifier un document simultanément
- **Compatibilité MS Office**: Ouverture et enregistrement aux formats DOCX, XLSX et PPTX
- **Suite complète**: Traitement de texte, tableur, présentations et dessin vectoriel
- **Intégration avec Fichiers**: Édition directe des documents stockés dans Nextcloud
- **Basée sur LibreOffice**: Moteur fiable et mature issu du projet LibreOffice

## Intégration avec openDesk Edu

Bureautique est un composant de base d'openDesk CE, déployé via Helm et intégré au portail unifié. L'authentification passe par Keycloak en SSO (SAML 2.0 / OIDC). Collabora fonctionne comme éditeur en ligne intégré au composant Fichiers (Nextcloud) et est accessible depuis le portail unifié.
