---
title: "Grommunio（替代邮件）"
date: "2026-04-17"
description: "兼容 Microsoft 365 的协同办公套件，支持 ActiveSync 移动同步。"
categories: ["办公", "邮件"]
tags: ["grommunio", "邮件", "activesync", "替代方案"]
---

# Grommunio（替代邮件）

Grommunio 是一款兼容 Microsoft 365 的协同办公套件，支持 ActiveSync 16.1 协议实现原生移动设备同步。这是教育版专属的 Beta 组件，使用 MariaDB 作为数据库后端。

## 核心功能

- **Microsoft 365 兼容**: 界面和功能与 Microsoft 365 类似，降低迁移成本
- **ActiveSync 16.1**: 支持最新的 ActiveSync 协议，原生移动同步体验
- **电子邮件**: 功能完整的邮件服务，支持 EAS 协议
- **日历和联系人**: 集成日历和联系人管理
- **MariaDB 后端**: 使用 MariaDB 数据库，稳定可靠

## 与 openDesk Edu 的集成

Grommunio 作为教育版 Beta 组件，通过 Keycloak SSO（SAML 2.0 / OIDC）实现统一身份认证。通过统一门户可直接访问。采用模块化 Helm Chart 部署。作为 OX App Suite 和 SOGo 的替代方案，适合习惯 Microsoft 365 工作流的学校。
