---
title: "组件对比矩阵"
date: "2025-04-18"
description: "对比 openDesk Edu 全部 25 项服务，涵盖类别、许可证和核心功能。"
categories:
  - "Components"
tags:
  - "comparison"
  - "overview"
---

# 组件对比矩阵

openDesk Edu 在 openDesk 社区版的 **10 项基础服务** 之上，新增了 **15 项教育专属 Beta 服务**，为学校、高校和科研机构打造了一套完整的数字化工作平台。全部 25 项服务通过 **Keycloak SSO**（SAML 2.0 / OIDC）集成，并可在统一的 Nubus 门户中访问。

同一类别中的服务可能互为替代方案——例如，视频会议可以在 Jitsi 和 BigBlueButton 之间选择，邮件协作可以在 OX App Suite、SOGo 和 Grommunio 之间选择。**Beta** 服务功能完整，但仍在积极开发中，未来版本可能发生变化。

## 通讯与协作

| 服务 | 类型 | 状态 | 许可证 | 核心功能 |
|---|---|---|---|---|
| Element (Matrix) | 即时通讯 | 稳定 | Apache 2.0 | 实时消息、房间、文件共享、Nordeck 教育组件、联邦互通 |
| Jitsi | 视频会议 | 稳定 | Apache 2.0 | 浏览器端会议、屏幕共享、背景虚化、SIP 电话拨入 |
| BigBlueButton | 虚拟教室 | Beta | LGPL-3.0 | 课程录制、交互式白板、分组讨论室、投票测验 |
| Etherpad | 协同编辑 | Beta | Apache 2.0 | 实时协同编辑、彩色作者标识、插件系统、多格式导出 |

## 邮件与日历

| 服务 | 类型 | 状态 | 许可证 | 核心功能 |
|---|---|---|---|---|
| OX App Suite | 协作套件 | 稳定 | 专有（CE） | 完整网页邮箱、共享日历、LDAP 联系人、任务管理 |
| SOGo | 轻量协作套件 | Beta | LGPL-2.1 | 快速网页邮箱、CalDAV/CardDAV、ActiveSync、低资源占用 |
| Grommunio | 兼容 Microsoft 365 的协作套件 | Beta | AGPL-3.0 | ActiveSync 16.1、Outlook/Thunderbird 兼容、MariaDB 后端 |

## 文件管理

| 服务 | 类型 | 状态 | 许可证 | 核心功能 |
|---|---|---|---|---|
| Nextcloud | 云存储 | 稳定 | AGPL-3.0 | 文件同步与共享、外部存储挂载、版本控制、Collabora 集成 |
| OpenCloud | 轻量云存储 | Beta | Apache 2.0 | 基于 CS3 的存储、按课程共享、WebDAV 访问、低资源消耗 |

## 办公与效率

| 服务 | 类型 | 状态 | 许可证 | 核心功能 |
|---|---|---|---|---|
| Collabora | 在线办公 | 稳定 | MPL-2.0 | DOCX/XLSX/PPTX 编辑、实时协作、多格式兼容、纯浏览器运行 |
| CryptPad | 隐私优先办公 | 稳定 | AGPL-3.0 | 端到端加密、协同编辑、内置 diagrams.net、网盘 |
| Notes | 笔记 | 稳定 | MIT | 快速无干扰编辑器、Markdown 支持、简洁组织方式 |
| Draw.io | 绘图工具 | Beta | Apache 2.0 | 丰富图形库、导出 PDF/VSDX/SVG、导入 Lucidchart/Gliffy |
| Excalidraw | 白板 | Beta | MIT | 手绘风格、实时协作、形状识别、秒级加载 |

## 教学与教育

| 服务 | 类型 | 状态 | 许可证 | 核心功能 |
|---|---|---|---|---|
| ILIAS | 学习管理系统 | Beta | GPL-3.0 | 课程管理、考核评估、SCORM 标准、论坛、维基 |
| Moodle | 学习管理系统 | Beta | GPL-3.0+ | 课程搭建、作业提交、成绩簿、同伴互评、插件生态 |
| XWiki | 企业级维基 | 稳定 | LGPL-2.1 | 结构化内容、所见即所得编辑器、脚本支持、扩展市场 |

## 项目与知识管理

| 服务 | 类型 | 状态 | 许可证 | 核心功能 |
|---|---|---|---|---|
| OpenProject | 项目管理 | 稳定 | GPL-3.0 | 敏捷看板、甘特图、时间追踪、内置维基、缺陷追踪 |
| Planka | 看板 | Beta | AGPL-3.0 | 拖拽式看板、实时更新、标签、清单、截止日期 |
| BookStack | 文档维基 | Beta | MIT | 书架/书/章节层级、所见即所得 + Markdown、全文搜索、角色权限 |

## IT 与管理

| 服务 | 类型 | 状态 | 许可证 | 核心功能 |
|---|---|---|---|---|
| Nubus | 门户与身份管理 | 稳定 | Apache 2.0 (Keycloak) | 统一门户、SAML 2.0/OIDC、用户配置、基于角色的访问控制 |
| Zammad | 工单系统 | Beta | AGPL-3.0 | 多渠道支持、工作流自动化、知识库、SLA 管理 |
| LimeSurvey | 问卷调查平台 | Beta | GPL-2.0+ | 丰富题型、条件逻辑、配额管理、多语言问卷 |
| TYPO3 | 内容管理系统 | Beta | GPL-2.0+ | 多站点管理、灵活内容建模、前台编辑、可扩展性 |
| LTB SSP | 密码自助服务 | Beta | GPL-2.0+ | 邮件重置密码、安全问题、解锁账户、LDAP 后端 |
