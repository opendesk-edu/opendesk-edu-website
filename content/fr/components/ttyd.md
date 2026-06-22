---
title: "ttyd"
date: "2026-05-29"
description: "Terminal Linux dans le navigateur offrant un accès complet en ligne de commande depuis n'importe quel appareil."
categories: ["infrastructure", "calcul-scientifique"]
tags: ["ttyd", "terminal", "ssh", "cli", "scientific-computing"]
version: "1.7"
---

# ttyd

ttyd est un outil léger qui partage un terminal Linux complet via le navigateur web. Il offre aux étudiants et chercheurs un accès en ligne de commande à l'environnement serveur depuis n'importe quel appareil, permettant l'accès SSH, l'exécution de scripts et l'administration système sans installer d'émulateur de terminal.

## Fonctionnalités clés

- **Terminal dans le navigateur** : Terminal compatible xterm complet dans tout navigateur web moderne.
- **Aucune installation client** : Fonctionne sur les Chromebooks, tablettes et appareils restreints avec un simple navigateur.
- **Accès aux fichiers** : Accès complet au système de fichiers pour le stockage utilisateur et les données de recherche partagées.
- **Support du presse-papiers** : Copiez et collez entre la machine locale et le terminal du navigateur.
- **Persistance des sessions** : Les sessions de terminal persistent lors des rechargements de page grâce à l'intégration tmux.

## Intégration avec openDesk Edu

ttyd fait partie de la suite Collab Services et se déploie via un chart Helm local personnalisé (`helmfile/charts/ttyd`). Il s'authentifie auprès de Keycloak via un sidecar oauth2-proxy et est accessible à `term.*` sous le DNS wildcard de l'établissement.

## En savoir plus

- [Documentation officielle](https://github.com/tsl0922/ttyd) — Documentation et ressources ttyd
