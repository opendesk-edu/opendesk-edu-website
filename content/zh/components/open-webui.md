---
title: "Open WebUI"
date: "2026-05-29"
description: "类 ChatGPT 的 Web 界面，用于通过 Ollama 与本地大语言模型进行交互。"
categories: ["人工智能", "科学计算", "测试版"]
tags: ["open-webui", "llm", "ai", "chatbot", "scientific-computing"]
version: "0.5"
---

# Open WebUI

Open WebUI 是一个功能丰富的 Web 界面，用于与大语言模型（LLM）进行交互，是 ChatGPT 的自托管替代方案。它连接 Ollama 作为后端，提供熟悉的聊天界面，支持会话管理、模型切换和对话历史记录。

## 核心功能

- **聊天界面**：简洁的类 ChatGPT 界面，支持 Markdown 渲染和代码高亮。
- **模型切换**：在不同 Ollama 模型（llama3.2、mistral 等）之间即时切换。
- **对话历史**：持久化的聊天会话，支持搜索和导出功能。
- **原生 OIDC**：内置 OIDC 支持，实现 Keycloak 单点登录集成。
- **文档上传**：上传文本文件供 LLM 分析和参考回答。

## 与 openDesk Edu 的集成

Open WebUI 属于协作服务套件，通过其上游 Helm Chart（`helm.openwebui.com`）部署。它通过原生 OIDC 支持使用 Keycloak 进行身份验证，可通过机构通配符 DNS 下的 `ai.*` 访问。它依赖 Ollama 作为 LLM 后端，后者需优先部署。

## 了解更多

- [官方文档](https://github.com/open-webui/open-webui) — Open WebUI 文档和资源
