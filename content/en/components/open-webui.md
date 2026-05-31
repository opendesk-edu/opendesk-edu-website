---
title: "Open WebUI"
date: "2026-05-29"
description: "ChatGPT-like web interface for interacting with local large language models via Ollama."
categories: ["ai", "scientific-computing", "beta"]
tags: ["open-webui", "llm", "ai", "chatbot", "scientific-computing"]
version: "0.5"
---

# Open WebUI

Open WebUI is a feature-rich web interface for interacting with large language models (LLMs), designed as a self-hosted alternative to ChatGPT. It connects to Ollama as the backend and provides a familiar chat interface with session management, model switching, and conversation history.

## Key Features

- **Chat interface**: Clean, ChatGPT-like UI with markdown rendering and code highlighting.
- **Model switching**: Switch between different Ollama models (llama3.2, mistral, etc.) on the fly.
- **Conversation history**: Persistent chat sessions with search and export capabilities.
- **Native OIDC**: Built-in OIDC support for Keycloak single sign-on integration.
- **Document upload**: Upload text files for the LLM to analyze and reference in responses.

## Integration with openDesk Edu

Open WebUI is part of the Collab Services suite and deploys via its upstream Helm chart (`helm.openwebui.com`). It authenticates through Keycloak using native OIDC support and is accessible at `ai.*` under the institution's wildcard DNS. It depends on Ollama as the LLM backend, which must be deployed first.

## Learn More

- [Official Documentation](https://github.com/open-webui/open-webui) — Open WebUI docs and resources
