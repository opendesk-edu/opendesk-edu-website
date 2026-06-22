---
title: "Ollama"
date: "2026-05-29"
description: "Lokales LLM-Backend zum Bereitstellen von Open-Source-Modellen wie llama3.2 und nomic-embed-text."
categories: ["ki", "infrastruktur", "beta"]
tags: ["ollama", "llm", "ai", "machine-learning", "scientific-computing"]
version: "0.6"
---

# Ollama

Ollama ist ein lokales LLM-Backend, das Open-Source-Sprachmodelle für die Inferenz bereitstellt. Es bietet die Modell-Laufzeitumgebung für Open WebUI und unterstützt eine wachsende Bibliothek von Modellen, darunter llama3.2, Mistral, Gemma und nomic-embed-text für Embeddings.

## Hauptfunktionen

- **Lokale Modellbereitstellung**: Open-Source-LLMs lokal ausführen, ohne externe API-Abhängigkeiten.
- **Modellbibliothek**: Modelle aus einer kuratierten Bibliothek herunterladen und bereitstellen (llama3.2, Mistral, Gemma, Phi und mehr).
- **REST-API**: Vollständige API für Chat-Completions, Embeddings und Modellverwaltung.
- **GPU-Beschleunigung**: Unterstützt NVIDIA-GPU-Beschleunigung über CUDA für schnellere Inferenz.
- **Leichtgewichtig**: Minimaler Ressourcenverbrauch für CPU-basierte Bereitstellungen.

## Integration mit openDesk Edu

Ollama ist Teil der Collab Services Suite und wird über das offizielle Helm-Chart (`ollama.github.io`) bereitgestellt. Es wird zuerst in der Helmfile-Abhängigkeitskette bereitgestellt (Stufe `010-infra`) als LLM-Backend, von dem Open WebUI abhängt. Es läuft als interner Dienst und ist nicht direkt für Benutzer zugänglich.

## Weitere Informationen

- [Offizielle Dokumentation](https://ollama.ai/) — Ollama-Dokumentation und Ressourcen
- [Modellbibliothek](https://ollama.ai/library) — Verfügbare Open-Source-Modelle
