---
title: "JupyterHub"
date: "2026-05-29"
description: "多用户 Jupyter Notebook 服务器，支持 Python、R、Julia、SageMath 和 Octave 内核。"
categories: ["科学计算", "研究"]
tags: ["jupyter", "notebooks", "python", "r", "julia", "scientific-computing"]
version: "5.2"
---

# JupyterHub

JupyterHub 是一个多用户 Jupyter Notebook 服务器，为学生和研究人员提供交互式计算环境。它支持 Python、R、Julia、SageMath 和 GNU Octave 内核，是数据科学、科学计算和教学的通用平台。

## 核心功能

- **多内核支持**：开箱即用支持 Python、R、Julia、SageMath 和 GNU Octave 内核。
- **用户隔离**：每个用户拥有独立的 Notebook 服务器和隔离环境。
- **原生 OIDC 认证**：通过 OAuthenticator 与 Keycloak 集成，实现无缝单点登录。
- **可扩展架构**：按需生成用户 Pod，具备可配置的资源限制。
- **持久化存储**：用户 Notebook 和数据通过 PVC 挂载跨会话持久保存。

## 与 openDesk Edu 的集成

JupyterHub 属于协作服务套件，通过其上游 Helm Chart（`hub.jupyter.org`）部署。它通过原生 OIDC（OAuthenticator GenericOAuthenticator）使用 Keycloak 进行身份验证，可通过机构通配符 DNS 下的 `jupyter.*` 访问。用户可直接从统一的 Nubus 门户访问其 Notebook。

## 了解更多

- [官方文档](https://jupyter.org/hub) — JupyterHub 文档和资源
- [OAuthenticator](https://oauthenticator.readthedocs.io/) — OIDC 认证配置
