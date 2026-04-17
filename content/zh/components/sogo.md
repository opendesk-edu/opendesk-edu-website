---
title: "SOGo（替代邮件）"
date: "2026-04-17"
description: "轻量级网页邮件和协同办公，OX App Suite 的替代方案。"
categories: ["办公", "邮件"]
tags: ["sogo", "邮件", "替代方案"]
---

# SOGo（替代邮件）

SOGo 是一款轻量级网页邮件和协同办公套件，可作为 OX App Suite 的替代方案。相比 OX App Suite 更加简洁快速，适合对资源占用敏感的教育场景。这是教育版专属的 Beta 组件。

## 核心功能

- **网页邮件**: 简洁高效的网页邮件客户端
- **日历**: 个人和共享日历，支持 CalDAV 协议
- **联系人**: 通讯录管理，支持 CardDAV 协议
- **轻量架构**: 资源占用低，响应速度快
- **ActiveSync**: 支持移动设备同步

## 与 openDesk Edu 的集成

SOGo 作为教育版 Beta 组件，通过 Keycloak SSO（SAML 2.0 / OIDC）实现统一身份认证。通过统一门户可直接访问。采用模块化 Helm Chart 部署。作为 OX App Suite 的替代方案，管理员可在两者之间选择更适合本校需求的邮件客户端。
