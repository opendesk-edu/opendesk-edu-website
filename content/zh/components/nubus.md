---
title: "门户和身份管理"
date: "2026-04-17"
description: "基于 Keycloak 的统一门户和身份管理，支持 SAML 2.0 和 OIDC。"
categories: ["基础设施"]
tags: ["nubus", "keycloak", "身份管理", "门户", "sso"]
---

# 门户和身份管理

Nubus 是基于 Keycloak 构建的统一门户和身份管理系统。作为 openDesk Edu 的核心 IAM 组件，为所有应用提供单点登录和统一用户管理，支持 SAML 2.0 和 OIDC 协议。

## 核心功能

- **单点登录 (SSO)**: 一次登录即可访问所有已集成的应用
- **SAML 2.0 支持**: 作为 IdP 或 SP，与外部身份提供者互操作
- **OIDC 支持**: OpenID Connect 协议，支持现代 Web 和移动应用
- **用户管理**: 统一的用户目录和角色权限管理
- **统一门户**: 所有应用的自定义入口页面

## 与 openDesk Edu 的集成

门户和身份管理是 openDesk Edu 的核心组件，所有其他组件均通过 Keycloak SSO（SAML 2.0 / OIDC）实现身份认证。统一门户为用户提供所有应用的集中入口。采用模块化 Helm Chart 部署，是整个平台身份认证体系的基础。
