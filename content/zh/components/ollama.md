---
title: "Ollama"
date: "2026-05-29"
description: "本地 LLM 后端，提供 llama3.2 和 nomic-embed-text 等开源模型服务。"
categories: ["人工智能", "基础设施", "测试版"]
tags: ["ollama", "llm", "ai", "machine-learning", "scientific-computing"]
version: "0.6"
---

# Ollama

Ollama 是一个本地 LLM 后端，为开源语言模型提供推理服务。它为 Open WebUI 提供模型运行时支持，并支持不断增长的模型库，包括 llama3.2、Mistral、Gemma 以及用于嵌入的 nomic-embed-text。

## 核心功能

- **本地模型服务**：本地运行开源 LLM，无需依赖外部 API。
- **模型库**：从精选模型库中下载和服务模型（llama3.2、Mistral、Gemma、Phi 等）。
- **REST API**：完整的 API 支持聊天补全、嵌入和模型管理。
- **GPU 加速**：通过 CUDA 支持 NVIDIA GPU 加速，提升推理速度。
- **轻量级**：仅 CPU 部署所需资源极少。

## 与 openDesk Edu 的集成

Ollama 属于协作服务套件，通过其上游 Helm Chart（`ollama.github.io`）部署。它在 Helmfile 依赖链中率先部署（阶段 `010-infra`），作为 Open WebUI 所依赖的 LLM 后端。它作为内部服务运行，不直接暴露给用户。

## 了解更多

- [官方文档](https://ollama.ai/) — Ollama 文档和资源
- [模型库](https://ollama.ai/library) — 可用的开源模型
