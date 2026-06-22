---
title: "Overleaf CE"
date: "2026-05-29"
description: "Éditeur LaTeX collaboratif en temps réel pour la rédaction scientifique, les thèses et les publications académiques."
categories: ["calcul-scientifique", "productivité"]
tags: ["overleaf", "latex", "writing", "academic", "scientific-computing"]
version: "5.2"
---

# Overleaf CE

Overleaf Community Edition est un éditeur LaTeX collaboratif en temps réel conçu pour la rédaction scientifique. Il permet aux étudiants et chercheurs d'écrire, d'éditer et de compiler des documents LaTeX en collaboration dans le navigateur, avec un suivi des versions et une riche galerie de modèles.

## Fonctionnalités clés

- **Collaboration en temps réel** : Plusieurs auteurs éditent le même document simultanément avec des mises à jour en direct.
- **Éditeur LaTeX riche** : Coloration syntaxique, complétion de code, gestion des références et aperçu PDF intégré.
- **Galerie de modèles** : Modèles pré-construits pour thèses, articles de revues, rapports et présentations.
- **Historique des versions** : Suivez les modifications et revenez aux versions précédentes avec un support de diff complet.
- **Intégration Git** : Synchronisez les documents avec des dépôts Git pour le contrôle de version et la sauvegarde.

## Intégration avec openDesk Edu

Overleaf CE fait partie de la suite Collab Services et se déploie via son chart Helm amont (`ghcr.io/sharelatex`). Il s'authentifie auprès de Keycloak via un sidecar oauth2-proxy et est accessible à `latex.*` sous le DNS wildcard de l'établissement.

## En savoir plus

- [Documentation officielle](https://github.com/overleaf/overleaf) — Documentation et ressources Overleaf CE
