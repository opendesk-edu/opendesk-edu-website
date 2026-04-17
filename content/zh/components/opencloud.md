---
title: "OpenCloud（替代文件存储）"
date: "2026-03-29"
description: "基于 CS3 的轻量级云存储，支持按课程共享文件。"
categories: ["存储"]
tags: ["opencloud", "文件存储", "cs3", "替代方案"]
---

# OpenCloud（替代文件存储）

OpenCloud 是基于 CS3（Cloud Storage for Synchronization and Sharing）标准的轻量级云存储方案，支持按课程组织文件共享。这是教育版专属的 Beta 组件，是 Nextcloud 的替代方案。

## 核心功能

- **云存储**: 提供个人和共享文件存储空间
- **课程共享**: 按课程组织文件，支持教师向学生分发资料
- **CS3 标准**: 基于开放标准，与其他 CS3 兼容服务互操作
- **轻量架构**: 资源占用低于 Nextcloud，适合大规模部署
- **WebDAV**: 支持 WebDAV 协议访问文件

## 与 openDesk Edu 的集成

OpenCloud 作为教育版 Beta 组件，通过 Keycloak SSO（SAML 2.0 / OIDC）实现统一身份认证。通过统一门户可直接访问文件管理。采用模块化 Helm Chart 部署。作为 Nextcloud 的替代方案，适合需要更轻量级存储解决方案的学校。
