---
title: "RStudio Server"
date: "2026-05-29"
description: "IDE R professionnel avec support d'applications Shiny, gestion d'espace de travail et synchronisation de fichiers OpenCloud."
categories: ["calcul-scientifique", "recherche", "bêta"]
tags: ["rstudio", "r", "shiny", "statistics", "data-science", "scientific-computing"]
version: "2024.12.0"
---

# RStudio Server

RStudio Server fournit un environnement de développement intégré professionnel pour R, accessible depuis n'importe quel navigateur web. Il inclut une console, un éditeur avec coloration syntaxique, des outils de tracé, une gestion d'espace de travail et le support d'applications Shiny — le tout s'exécutant sur le serveur.

## Fonctionnalités clés

- **IDE R complet** : Console, éditeur, visualisateur d'environnement, historique des tracés et explorateur de fichiers dans le navigateur.
- **Support d'applications Shiny** : Développez, testez et déployez des applications web interactives Shiny.
- **Gestion de paquets** : Installez et gérez les paquets CRAN avec résolution des dépendances.
- **Intégration OpenCloud** : Monte le stockage OpenCloud de l'utilisateur via un sidecar rclone WebDAV pour un accès direct aux fichiers.
- **Import/Export de données** : Prise en charge native des formats CSV, Excel, SPSS, SAS et Stata.

## Intégration avec openDesk Edu

RStudio Server fait partie de la suite Collab Services et se déploie via un chart Helm local personnalisé (`helmfile/charts/rstudio`). Il s'authentifie auprès de Keycloak via un sidecar oauth2-proxy et est accessible à `r.*` sous le DNS wildcard de l'établissement. Un sidecar OpenCloud WebDAV assure une synchronisation transparente des fichiers avec le stockage cloud de l'utilisateur.

## En savoir plus

- [Documentation officielle](https://posit.co/products/open-source/rstudio-server/) — Documentation et ressources RStudio Server
