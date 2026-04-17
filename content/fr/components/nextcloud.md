---
title: "Fichiers"
date: "2026-03-07"
description: "Suite complète de stockage cloud et de collaboration pour le partage et la synchronisation de documents."
categories: ["stockage", "composant-de-base"]
tags: ["nextcloud", "stockage-cloud", "partage", "synchronisation"]
---

# Fichiers

Fichiers repose sur Nextcloud et offre une solution complète de stockage cloud, de synchronisation et de collaboration. C'est le composant central pour la gestion des documents dans openDesk Edu, permettant aux utilisateurs de stocker, partager et co-éditer leurs fichiers depuis n'importe quel appareil.

## Fonctionnalités clés

- **Stockage cloud personnel et partagé**: Chaque utilisateur dispose d'un espace personnel avec possibilité de dossiers partagés
- **Synchronisation multi-appareils**: Clients de synchronisation pour bureau (Windows, macOS, Linux) et mobile (iOS, Android)
- **Partage de fichiers**: Liens de partage publics ou protégés par mot de passe avec dates d'expiration
- **Intégration bureautique**: Édition en ligne des documents via Collabora directement depuis l'interface
- **Sauvegarde automatique**: Les données persistantes sont sauvegardées par k8up

## Intégration avec openDesk Edu

Fichiers est un composant de base d'openDesk CE, déployé via Helm et intégré au portail unifié. L'authentification passe par Keycloak en SSO (SAML 2.0 / OIDC). Les données sont protégées par des sauvegardes automatiques via k8up, garantissant la pérennité des documents des utilisateurs.
