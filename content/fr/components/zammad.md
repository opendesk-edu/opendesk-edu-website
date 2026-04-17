---
title: "Zammad"
date: "2026-04-17"
description: "Système de support et tickets multicanal avec authentification SAML pour les services d'assistance."
categories: ["support", "beta-education"]
tags: ["zammad", "tickets", "support", "multicanal", "saml"]
---

# Zammad

Zammad est un système de gestion de tickets et de support multicanal. Il centralise les demandes provenant de l'e-mail, du chat, du téléphone et des formulaires web dans une interface unique. Adapté aux services d'assistance des établissements (aide informatique, scolarité, bibliothèque), Zammad facilite le suivi, la priorisation et la résolution des demandes.

## Fonctionnalités clés

- **Support multicanal**: Centralisation des demandes par e-mail, chat web, téléphone et formulaires
- **Gestion de tickets**: Suivi complet des demandes avec priorisation, affectation et escalades
- **Base de connaissances intégrée**: Articles d'aide et FAQ accessibles aux utilisateurs
- **Authentification SAML**: Connexion unifiée via le fournisseur d'identité de l'établissement
- **Rapports et statistiques**: Tableaux de bord pour le suivi de la performance du support

## Intégration avec openDesk Edu

Zammad est un composant en version Beta pour le contexte éducatif. Il se déploie via Helm et s'intègre au portail unifié avec authentification Keycloak via SAML. Les agents de support et les utilisateurs accèdent à la plateforme depuis le portail unifié, avec les rôles et permissions gérés par l'IAM central.
