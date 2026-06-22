---
title: "Overleaf CE"
date: "2026-05-29"
description: "协作式实时 LaTeX 编辑器，适用于科学写作、论文和学术出版。"
categories: ["科学计算", "效率工具"]
tags: ["overleaf", "latex", "writing", "academic", "scientific-computing"]
version: "5.2"
---

# Overleaf CE

Overleaf 社区版是一款协作式实时 LaTeX 编辑器，专为科学写作而设计。它使学生和研究人员能够在浏览器中协同编写、编辑和编译 LaTeX 文档，支持版本追踪和丰富的模板库。

## 核心功能

- **实时协作**：多位作者同时编辑同一文档，实时同步更新。
- **丰富的 LaTeX 编辑器**：语法高亮、代码补全、参考文献管理和集成的 PDF 预览。
- **模板库**：论文、期刊文章、报告和演示文稿的预制模板。
- **版本历史**：追踪更改并支持回退到任意历史版本，具备完整的差异比较功能。
- **Git 集成**：与 Git 仓库同步文档，实现版本控制和备份。

## 与 openDesk Edu 的集成

Overleaf CE 属于协作服务套件，通过其上游 Helm Chart（`ghcr.io/sharelatex`）部署。它通过 oauth2-proxy sidecar 使用 Keycloak 进行身份验证，可通过机构通配符 DNS 下的 `latex.*` 访问。

## 了解更多

- [官方文档](https://github.com/overleaf/overleaf) — Overleaf CE 文档和资源
