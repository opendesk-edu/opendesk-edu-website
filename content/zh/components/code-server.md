---
title: "code-server"
date: "2026-05-29"
description: "浏览器中的 VS Code — 功能完整的基于浏览器的 IDE，适用于开发和教育场景。"
categories: ["科学计算", "效率工具"]
tags: ["code-server", "vscode", "ide", "development", "scientific-computing"]
version: "4.99"
---

# code-server

code-server 将 Microsoft Visual Studio Code 带入浏览器，提供一个功能完整的 IDE，完全在服务器端运行。学生和研究人员可以在任何有浏览器的设备上编写、调试和运行代码，无需本地安装。

## 核心功能

- **完整的 VS Code 体验**：所有编辑器功能、扩展、主题和快捷键均在浏览器中正常工作。
- **扩展市场**：安装数千个扩展，支持语言服务、代码检查、调试器和主题。
- **内置终端**：直接从 IDE 访问服务器端终端。
- **Git 集成**：完整的源代码控制，支持提交、推送、拉取和差异比较。
- **多语言支持**：通过扩展支持 Python、R、Julia、JavaScript、Go、Rust 以及数百种其他语言。

## 与 openDesk Edu 的集成

code-server 属于协作服务套件，通过其上游 Helm Chart（`helm.coder.com`）部署。它通过 oauth2-proxy sidecar 使用 Keycloak 进行身份验证，可通过机构通配符 DNS 下的 `code.*` 访问。

## 了解更多

- [官方文档](https://github.com/coder/code-server) — code-server 文档和资源
