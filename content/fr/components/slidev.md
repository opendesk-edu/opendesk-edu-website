---
title: "Slidev"
date: "2026-05-29"
description: "Outil de transformation Markdown en présentations pour créer des diaporamas à partir de simples fichiers Markdown."
categories: ["calcul-scientifique", "productivité", "bêta"]
tags: ["slidev", "presentations", "markdown", "slides", "scientific-computing"]
version: "0.49"
---

# Slidev

Slidev est un outil de présentation qui transforme des fichiers Markdown en superbes diaporamas. Il est conçu pour les chercheurs et enseignants qui souhaitent créer des supports de présentation sans quitter leur éditeur de texte, prenant en charge la coloration syntaxique du code, les formules LaTeX, les diagrammes et les éléments interactifs.

## Fonctionnalités clés

- **Basé sur Markdown** : Écrivez vos diapositives en Markdown simple avec un frontmatter YAML pour la configuration.
- **Coloration syntaxique** : Blocs de code avec coloration syntaxique via Shiki et Prisma.
- **Formules LaTeX** : Rendez les expressions mathématiques avec KaTeX ou MathJax.
- **Diagrammes** : Intégrez des diagrammes Mermaid et PlantUML directement dans les diapositives.
- **Options d'exportation** : Exportez en PDF, PNG ou hébergez comme une présentation web interactive.

## Intégration avec openDesk Edu

Slidev fait partie de la suite Collab Services et se déploie via un chart Helm local personnalisé (`helmfile/charts/slidev`) qui utilise un conteneur init pour construire la présentation, puis la sert avec nginx. Il s'authentifie auprès de Keycloak via un sidecar oauth2-proxy et est accessible à `slides.*` sous le DNS wildcard de l'établissement.

## En savoir plus

- [Documentation officielle](https://github.com/slidevjs/slidev) — Documentation et ressources Slidev
