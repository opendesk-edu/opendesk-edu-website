---
title: "在线课堂"
date: "2026-04-17"
description: "虚拟课堂平台，支持录制、白板、分组讨论室和投票。"
categories: ["教学", "通信"]
tags: ["bigbluebutton", "在线课堂", "视频会议", "shibboleth"]
---

# 在线课堂

BigBlueButton 是专为在线教学设计的虚拟课堂平台，支持课程录制、互动白板、分组讨论室和实时投票。使用 Shibboleth 作为 SAML SP 实现身份认证。这是教育版专属的 Beta 组件，是 Jitsi 的替代方案，更适合讲授式教学场景。

## 核心功能

- **虚拟课堂**: 支持大规模在线课程，专为教学设计
- **课程录制**: 自动录制课程，支持回放
- **互动白板**: 多页白板，支持标注和绘图
- **分组讨论室**: 将学生分组到独立的讨论室
- **实时投票**: 课堂中的即时反馈和投票功能

## 与 openDesk Edu 的集成

BigBlueButton 作为教育版 Beta 组件，使用 Shibboleth 作为 SAML SP 与 Keycloak IdP 对接，实现单点登录。通过统一门户可直接创建在线课堂。采用模块化 Helm Chart 部署。作为 Jitsi 的替代方案，适合需要录制、分组讨论等高级教学功能的场景，可与 Moodle 深度集成。
