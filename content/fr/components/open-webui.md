---
title: "Open WebUI"
date: "2026-05-29"
description: "Interface web type ChatGPT pour interagir avec les grands modèles de langage locaux via Ollama."
categories: ["ia", "calcul-scientifique", "bêta"]
tags: ["open-webui", "llm", "ai", "chatbot", "scientific-computing"]
version: "0.5"
---

# Open WebUI

Open WebUI est une interface web riche pour interagir avec les grands modèles de langage (LLM), conçue comme une alternative auto-hébergée à ChatGPT. Elle se connecte à Ollama comme moteur backend et fournit une interface de chat familière avec gestion des sessions, changement de modèle et historique des conversations.

## Fonctionnalités clés

- **Interface de chat** : Interface utilisateur propre, de type ChatGPT, avec rendu Markdown et coloration syntaxique du code.
- **Changement de modèle** : Basculez entre différents modèles Ollama (llama3.2, mistral, etc.) à la volée.
- **Historique des conversations** : Sessions de chat persistantes avec capacités de recherche et d'exportation.
- **OIDC natif** : Prise en charge OIDC intégrée pour l'intégration avec Keycloak en authentification unique.
- **Upload de documents** : Téléchargez des fichiers texte pour que le LLM les analyse et les référence dans ses réponses.

## Intégration avec openDesk Edu

Open WebUI fait partie de la suite Collab Services et se déploie via son chart Helm amont (`helm.openwebui.com`). Il s'authentifie auprès de Keycloak via le support OIDC natif et est accessible à `ai.*` sous le DNS wildcard de l'établissement. Il dépend d'Ollama comme moteur LLM, qui doit être déployé en premier.

## En savoir plus

- [Documentation officielle](https://github.com/open-webui/open-webui) — Documentation et ressources Open WebUI
