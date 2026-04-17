---
title: "Planka"
date: "2026-04-17"
description: "Application de tableaux Kanban avec support OIDC pour les projets étudiants."
categories: ["gestion-de-projet", "beta-education"]
tags: ["planka", "kanban", "gestion-de-projet", "oidc"]
---

# Planka

Planka est une application de tableaux Kanban pour la gestion visuelle de projets. Simple, moderne et reactive, elle permet d'organiser des tâches sous forme de cartes réparties en colonnes. Avec son support natif d'OIDC, elle s'intègre naturellement à l'écosystème openDesk Edu. C'est un outil idéal pour les projets étudiants et le suivi d'activités de groupe.

## Fonctionnalités clés

- **Tableaux Kanban**: Organisation visuelle des tâches avec colonnes personnalisables
- **Cartes et listes**: Création de cartes avec descriptions, échéances, étiquettes et pièces jointes
- **Support OIDC**: Authentification native via OpenID Connect
- **Gestion de projets multiples**: Plusieurs tableaux par utilisateur ou par équipe
- **Interface reactive**: Mises à jour en temps réel sans rechargement de page

## Intégration avec openDesk Edu

Planka est un composant en version Beta pour le contexte éducatif. Il se déploie via Helm et s'intègre au portail unifié avec authentification Keycloak via OIDC. Il vient en complément de Projets (OpenProject) pour les besoins plus légers en gestion de tâches, particulièrement adaptés aux projets étudiants.
