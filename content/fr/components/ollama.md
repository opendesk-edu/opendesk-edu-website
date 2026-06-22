---
title: "Ollama"
date: "2026-05-29"
description: "Moteur LLM local servant des modèles open-source comme llama3.2 et nomic-embed-text."
categories: ["ia", "infrastructure", "bêta"]
tags: ["ollama", "llm", "ai", "machine-learning", "scientific-computing"]
version: "0.6"
---

# Ollama

Ollama est un moteur LLM local qui sert des modèles de langage open-source pour l'inférence. Il fournit l'exécution des modèles pour Open WebUI et prend en charge une bibliothèque croissante de modèles incluant llama3.2, Mistral, Gemma et nomic-embed-text pour les embeddings.

## Fonctionnalités clés

- **Service de modèles local** : Exécutez des LLM open-source localement sans dépendances API externes.
- **Bibliothèque de modèles** : Téléchargez et servez des modèles depuis une bibliothèque organisée (llama3.2, Mistral, Gemma, Phi, et plus).
- **API REST** : API complète pour les complétions de chat, les embeddings et la gestion des modèles.
- **Accélération GPU** : Prend en charge l'accélération GPU NVIDIA via CUDA pour une inférence plus rapide.
- **Léger** : Empreinte ressource minimale pour les déploiements sans GPU.

## Intégration avec openDesk Edu

Ollama fait partie de la suite Collab Services et se déploie via son chart Helm amont (`ollama.github.io`). Il est déployé en premier dans la chaîne de dépendance Helmfile (étape `010-infra`) en tant que moteur LLM dont Open WebUI dépend. Il fonctionne comme un service interne non directement exposé aux utilisateurs.

## En savoir plus

- [Documentation officielle](https://ollama.ai/) — Documentation et ressources Ollama
- [Bibliothèque de modèles](https://ollama.ai/library) — Modèles open-source disponibles
