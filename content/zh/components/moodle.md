---
title: "学习管理系统"
date: "2026-03-25"
description: "插件丰富的学习管理系统，支持作业、工作坊、成绩簿和 Shibboleth 认证。"
categories: ["教学"]
tags: ["moodle", "学习管理系统", "lms", "shibboleth"]
---

# 学习管理系统

Moodle 是全球广泛使用的开源学习管理系统（LMS），插件生态丰富。支持作业提交、互动工作坊、成绩簿和课程管理，使用 Shibboleth 作为 SAML SP 实现身份认证。这是教育版专属的 Beta 组件。

## 核心功能

- **课程管理**: 创建和管理课程内容、活动和资源
- **作业系统**: 支持多种作业类型和在线提交
- **互动工作坊**: 同伴互评和协作学习工具
- **成绩簿**: 灵活的成绩管理和评分系统
- **测验和问卷**: 在线测验和问卷调查功能

## 与 openDesk Edu 的集成

Moodle 作为教育版 Beta 组件，使用 Shibboleth 作为 SAML SP 与 Keycloak IdP 对接，实现单点登录。通过统一门户可直接进入课程页面。采用模块化 Helm Chart 部署，可与其他教育组件（如 BigBlueButton、Etherpad）深度集成。
