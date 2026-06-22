---
title: "Slidev"
date: "2026-05-29"
description: "Markdown 转演示文稿工具，从简单的 Markdown 文件创建幻灯片。"
categories: ["科学计算", "效率工具", "测试版"]
tags: ["slidev", "presentations", "markdown", "slides", "scientific-computing"]
version: "0.49"
---

# Slidev

Slidev 是一款演示文稿工具，可将 Markdown 文件转换为精美的幻灯片。它专为希望在不离开文本编辑器的情况下创建演示材料的研究人员和教育工作者设计，支持代码高亮、LaTeX 数学公式、图表和交互元素。

## 核心功能

- **基于 Markdown**：使用简单 Markdown 编写幻灯片，通过 YAML frontmatter 进行配置。
- **代码高亮**：支持 Shiki 和 Prism 的语法高亮代码块。
- **LaTeX 数学公式**：通过 KaTeX 或 MathJax 渲染数学表达式。
- **图表**：在幻灯片中直接嵌入 Mermaid 和 PlantUML 图表。
- **导出选项**：导出为 PDF、PNG 幻灯片，或作为交互式 Web 演示文稿托管。

## 与 openDesk Edu 的集成

Slidev 属于协作服务套件，通过自定义本地 Helm Chart（`helmfile/charts/slidev`）部署，该 Chart 使用 init 容器构建演示文稿，然后通过 nginx 提供服务。它通过 oauth2-proxy sidecar 使用 Keycloak 进行身份验证，可通过机构通配符 DNS 下的 `slides.*` 访问。

## 了解更多

- [官方文档](https://github.com/slidevjs/slidev) — Slidev 文档和资源
