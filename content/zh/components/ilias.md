---
title: "ILIAS 学习管理系统"
date: "2026-04-15"
description: "ILIAS 是一个功能强大的开源学习管理系统，广泛应用于高等教育和企业培训领域。"
categories: ["lms", "教学"]
tags: ["ilias", "教育", "lms"]
---

# ILIAS 学习管理系统

ILIAS 是一个功能强大的开源学习管理系统（LMS），为教学和学习提供全面的平台。它提供课程管理、评估、协作和通信等工具。ILIAS 是 openDesk Edu 的教育版专属 Beta 组件。

## 核心功能

- **课程管理**: 创建和组织具有灵活内容结构的课程
- **评估工具**: 内置测试和调查工具，支持多种题型
- **协作功能**: 论坛、Wiki、小组房间和文件共享
- **通信系统**: 集成的消息和通知系统
- **SCORM 兼容**: 完整支持 SCORM 1.2 和 2004 内容包

## 与 openDesk Edu 的集成

作为 openDesk Edu 平台的一部分，ILIAS 通过基于 SAML 的单点登录和共享用户目录与其他服务无缝集成。ILIAS 使用 Shibboleth 作为 SAML SP 与 Keycloak 身份提供商对接。作为教育版 Beta 组件，采用模块化 Helm Chart 部署，课程和评估等持久化数据由 k8up 负责备份。
