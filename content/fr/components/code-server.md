---
title: "code-server"
date: "2026-05-29"
description: "VS Code dans le navigateur — un IDE complet pour le développement et l'éducation."
categories: ["calcul-scientifique", "productivité"]
tags: ["code-server", "vscode", "ide", "development", "scientific-computing"]
version: "4.99"
---

# code-server

code-server place Microsoft Visual Studio Code dans le navigateur, offrant un IDE complet qui s'exécute entièrement sur le serveur. Les étudiants et chercheurs peuvent écrire, déboguer et exécuter du code depuis n'importe quel appareil doté d'un navigateur web, sans installation locale requise.

## Fonctionnalités clés

- **Expérience VS Code complète** : Toutes les fonctionnalités de l'éditeur, extensions, thèmes et raccourcis clavier fonctionnent dans le navigateur.
- **Marketplace d'extensions** : Installez des milliers d'extensions pour le support des langages, les linters, les débogueurs et les thèmes.
- **Terminal intégré** : Accédez à un terminal côté serveur directement depuis l'IDE.
- **Intégration Git** : Contrôle de source complet avec les opérations de commit, push, pull et diff.
- **Multi-langages** : Prend en charge Python, R, Julia, JavaScript, Go, Rust et des centaines d'autres langages via les extensions.

## Intégration avec openDesk Edu

code-server fait partie de la suite Collab Services et se déploie via son chart Helm amont (`helm.coder.com`). Il s'authentifie auprès de Keycloak via un sidecar oauth2-proxy et est accessible à `code.*` sous le DNS wildcard de l'établissement.

## En savoir plus

- [Documentation officielle](https://github.com/coder/code-server) — Documentation et ressources code-server
