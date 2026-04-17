---
title: "Projets"
date: "2026-04-17"
description: "Plateforme de gestion de projet avec tableaux agiles, diagrammes de Gantt et suivi du temps."
categories: ["gestion-de-projet", "composant-de-base"]
tags: ["openproject", "gestion-de-projet", "agile", "gantt", "kanban"]
---

# Projets

Projets repose sur OpenProject et offre une plateforme complète de gestion de projet. Elle convient aussi bien à la planification de projets de recherche qu'au suivi de projets étudiants. Avec ses tableaux agiles, diagrammes de Gantt et suivi du temps, elle couvre l'ensemble du cycle de vie d'un projet.

## Fonctionnalités clés

- **Tableaux agiles (Kanban)**: Visualisation des tâches par statut avec glisser-déposer
- **Diagrammes de Gantt**: Planification visuelle des échéances, dépendances et jalons
- **Suivi du temps**: Saisie du temps passé par tâche et par utilisateur
- **Gestion des work packages**: Décomposition des projets en lots de travail traçables
- **Wikis et pages de projet**: Documentation intégrée directement dans chaque projet

## Intégration avec openDesk Edu

Projets est un composant de base d'openDesk CE, déployé via Helm et intégré au portail unifié. L'authentification passe par Keycloak en SSO (SAML 2.0 / OIDC). Les enseignants et les étudiants accèdent à leurs projets depuis le portail sans reconnexion.
