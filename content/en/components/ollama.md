---
title: "Ollama"
date: "2026-05-29"
description: "Local LLM backend serving open-source models like llama3.2 and nomic-embed-text."
categories: ["ai", "infrastructure", "beta"]
tags: ["ollama", "llm", "ai", "machine-learning", "scientific-computing"]
version: "0.6"
---

# Ollama

Ollama is a local LLM backend that serves open-source language models for inference. It provides the model runtime for Open WebUI and supports a growing library of models including llama3.2, Mistral, Gemma, and nomic-embed-text for embeddings.

## Key Features

- **Local model serving**: Run open-source LLMs locally without external API dependencies.
- **Model library**: Download and serve models from a curated library (llama3.2, Mistral, Gemma, Phi, and more).
- **REST API**: Full API for chat completions, embeddings, and model management.
- **GPU acceleration**: Supports NVIDIA GPU acceleration via CUDA for faster inference.
- **Lightweight**: Minimal resource footprint for CPU-only deployments.

## Integration with openDesk Edu

Ollama is part of the Collab Services suite and deploys via its upstream Helm chart (`ollama.github.io`). It is deployed first in the Helmfile dependency chain (stage `010-infra`) as the LLM backend that Open WebUI depends on. It runs as an internal service not directly exposed to users.

## Learn More

- [Official Documentation](https://ollama.ai/) — Ollama docs and resources
- [Model Library](https://ollama.ai/library) — Available open-source models
