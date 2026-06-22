---
title: "KasmVNC"
date: "2026-05-29"
description: "Environnement de bureau Linux complet dans le navigateur avec des performances quasi-natives."
categories: ["infrastructure", "calcul-scientifique", "bêta"]
tags: ["kasmvnc", "desktop", "vnc", "remote-access", "scientific-computing"]
version: "1.16"
---

# KasmVNC

KasmVNC offre un environnement de bureau Linux complet directement dans le navigateur grâce au streaming basé sur WebAssembly. Il donne aux étudiants et chercheurs un accès à des applications graphiques, des outils de développement et des logiciels scientifiques nécessitant un environnement de bureau, le tout sans rien installer sur l'appareil client.

## Fonctionnalités clés

- **Bureau complet dans le navigateur** : Diffusez un bureau Linux complet (XFCE) avec des performances quasi-natives.
- **Accélération GPU** : Prise en charge WebGL pour la visualisation 3D et les applications accélérées par GPU.
- **Espaces de travail pré-configurés** : Images de bureau pré-chargées avec des outils scientifiques et des IDE.
- **Presse-papiers et transfert de fichiers** : Presse-papiers bidirectionnel et transfert de fichiers entre le client et le bureau.
- **Support audio** : Diffusez l'audio du bureau distant vers le navigateur.

## Intégration avec openDesk Edu

KasmVNC fait partie de la suite Collab Services et se déploie via son chart Helm amont (`registry.kasmweb.com`). Il s'authentifie auprès de Keycloak via un sidecar oauth2-proxy et est accessible à `desktop.*` sous le DNS wildcard de l'établissement.

## En savoir plus

- [Documentation officielle](https://kasmweb.com/) — Documentation et ressources KasmVNC
