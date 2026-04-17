---
title: "Chat"
date: "2026-03-01"
description: "Messagerie en temps réel basée sur Matrix avec widgets Nordeck pour l'éducation."
categories: ["communication", "composant-de-base"]
tags: ["element", "matrix", "messagerie", "nordeck"]
---

# Chat

Chat repose sur Element avec les widgets Nordeck spécialement conçus pour les contextes éducatifs. Cette messagerie instantanée, basée sur le protocole ouvert Matrix, offre une communication en temps réel entre élèves, enseignants et personnels administratifs au sein d'un environnement sécurisé.

## Fonctionnalités clés

- **Messagerie en temps réel**: Conversations privées et salons de groupe avec historique complet et recherche
- **Widgets Nordeck**: Extensions pédagogiques intégrées (sondages, listes de présence, suivi d'activités)
- **Partage de fichiers**: Envoi de documents, images et pièces jointes directement dans les conversations
- **Salons thématiques**: Création de canaux par matière, par classe ou par projet
- **Chiffrement de bout en bout**: Protection des échanges grâce au protocole Matrix

## Intégration avec openDesk Edu

Chat est un composant de base d'openDesk CE, déployé via Helm et intégré au portail unifié. L'authentification passe par Keycloak en SSO (SAML 2.0 / OIDC), ce qui garantit un accès unifié avec les autres services de la plateforme. Les utilisateurs retrouvent leurs conversations depuis le portail sans connexion séparée.
