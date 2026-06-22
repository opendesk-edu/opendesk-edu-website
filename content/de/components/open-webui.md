---
title: "Open WebUI"
date: "2026-05-29"
description: "ChatGPT-ähnliche Weboberfläche zur Interaktion mit lokalen großen Sprachmodellen über Ollama."
categories: ["ki", "wissenschaftliches-rechnen", "beta"]
tags: ["open-webui", "llm", "ki", "chatbot", "wissenschaftliches-rechnen"]
version: "0.5"
---

# Open WebUI

Open WebUI ist eine funktionsreiche Weboberfläche zur Interaktion mit großen Sprachmodellen (LLMs) und eine selbst gehostete Alternative zu ChatGPT. Sie verbindet sich mit Ollama als Backend und bietet eine vertraute Chat-Oberfläche mit Sitzungsverwaltung, Modellwechsel und Gesprächsverlauf.

## Hauptfunktionen

- **Chat-Oberfläche**: Saubere, ChatGPT-ähnliche Benutzeroberfläche mit Markdown-Darstellung und Code-Hervorhebung.
- **Modellwechsel**: Wechsel zwischen verschiedenen Ollama-Modellen (llama3.2, Mistral u. a.) im laufenden Betrieb.
- **Gesprächsverlauf**: Dauerhafte Chat-Sitzungen mit Such- und Exportfunktionen.
- **Natives OIDC**: Integrierte OIDC-Unterstützung für Keycloak Single Sign-On.
- **Dokumentenupload**: Textdateien hochladen, die das LLM analysieren und in Antworten berücksichtigen kann.

## Integration mit openDesk Edu

Open WebUI ist Teil der Collab Services Suite und wird über das zugehörige upstream Helm-Chart (`helm.openwebui.com`) bereitgestellt. Die Authentifizierung erfolgt über Keycloak mittels nativer OIDC-Unterstützung und ist unter `ai.*` des institutionellen Wildcard-DNS erreichbar. Es ist auf Ollama als LLM-Backend angewiesen, das zuerst bereitgestellt werden muss.

## Mehr erfahren

- [Offizielle Dokumentation](https://github.com/open-webui/open-webui) — Open WebUI-Dokumentation und Ressourcen
