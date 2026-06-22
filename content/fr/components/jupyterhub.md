---
title: "JupyterHub"
date: "2026-05-29"
description: "Serveur de carnets Jupyter multi-utilisateurs avec noyaux Python, R, Julia, SageMath et Octave."
categories: ["calcul-scientifique", "recherche"]
tags: ["jupyter", "notebooks", "python", "r", "julia", "scientific-computing"]
version: "5.2"
---

# JupyterHub

JupyterHub est un serveur de carnets Jupyter multi-utilisateurs qui fournit des environnements de calcul interactifs pour les étudiants et les chercheurs. Il prend en charge les noyaux Python, R, Julia, SageMath et GNU Octave, ce qui en fait une plateforme polyvalente pour la science des données, le calcul scientifique et l'enseignement.

## Fonctionnalités clés

- **Support multi-noyaux** : Noyaux Python, R, Julia, SageMath et GNU Octave disponibles immédiatement.
- **Isolation utilisateur** : Chaque utilisateur dispose de son propre serveur de carnets dédié avec des environnements isolés.
- **Authentification OIDC native** : S'intègre à Keycloak via OAuthenticator pour une authentification unique transparente.
- **Architecture évolutive** : Crée des pods utilisateur à la demande avec des limites de ressources configurables.
- **Stockage persistant** : Les carnets et données des utilisateurs persistent entre les sessions via des montages PVC.

## Intégration avec openDesk Edu

JupyterHub fait partie de la suite Collab Services et se déploie via son chart Helm amont (`hub.jupyter.org`). Il s'authentifie auprès de Keycloak via OIDC natif (OAuthenticator GenericOAuthenticator) et est accessible à `jupyter.*` sous le DNS wildcard de l'établissement. Les utilisateurs accèdent à leurs carnets directement depuis le portail Nubus unifié.

## En savoir plus

- [Documentation officielle](https://jupyter.org/hub) — Documentation et ressources JupyterHub
- [OAuthenticator](https://oauthenticator.readthedocs.io/) — Configuration de l'authentification OIDC
