---
title: "openDesk Edu 项目发布"
date: "2026-04-15"
description: "openDesk Edu 将 openDesk 数字工作空间带入高等教育领域 — 25 个开源服务、统一 SSO、一键部署。"
categories: ["公告", "社区"]
tags: ["公告", "opendesk", "教育", "开源"]
---

# openDesk Edu 项目发布

我们很高兴地宣布 openDesk Edu 项目正式启动。这是一个将 openDesk 数字工作空间引入高等教育机构的新项目。openDesk Edu 将 25 个开源服务整合为一个统一的平台，提供统一的单点登录、SAML 联邦支持以及一键部署功能。所有代码均采用 Apache-2.0 许可证，可供大学、研究机构和教育网络采用和扩展。

## 什么是 openDesk Edu？

openDesk Edu 基于 openDesk 社区版 (CE) 构建，在现有工作空间技术栈的基础上增加了 15 个面向教育的专用服务。最终成果是一个覆盖学习管理、视频会议、实时协作、文件共享、办公生产力等功能的综合平台。各机构无需再拼凑各种专有工具，即可获得一个完全开源的数字环境，充分尊重数据主权和互操作性标准。

## 包含哪些服务？

openDesk Edu 提供 25 个服务，涵盖以下几个类别：

- **学习管理系统**，包括 ILIAS 和 Moodle，这是欧洲高等教育领域使用最广泛的两个 LMS 平台。
- **视频会议**，包括 Jitsi Meet 和 BigBlueButton，从轻量级会议到功能完备的虚拟教室，支持白板、分组讨论室和录制功能。
- **协作工具**，包括 Nextcloud（文件同步与共享）、Etherpad（实时协同编辑）和 CryptPad（端到端加密文档协作）。
- **办公生产力**，提供多种群件栈选择：Open-Xchange、SOGo 或 Grommunio 用于邮件和日历管理，配合 Collabora Online 实现浏览器内文档编辑。
- **其他工具**，包括 Draw.io（流程图绘制）、Excalidraw（手绘草图）、BookStack（知识管理）、Planka（项目看板）、Zammad（支持工单）、LimeSurvey（问卷调查）和 TYPO3（机构网站）。

## 核心特性

**一键部署。** 整个技术栈通过一条 `helmfile apply` 命令即可部署到任何 Kubernetes 集群。无需逐个服务手动配置，无需脆弱的 Shell 脚本。Helmfile 编排 25 个模块化 Helm Chart，采用声明式配置。

**统一 Keycloak SSO。** 所有服务通过中央 Keycloak 实例进行身份验证。用户只需登录一次即可访问所有应用，无需重复输入凭据。Keycloak 同时支持 SAML 2.0 和 OpenID Connect 协议。

**DFN-AAI 和 eduGAIN 联邦认证。** openDesk Edu 连接 DFN-AAI 基础设施和更广泛的 eduGAIN 联邦。学生和教职员工使用本机构的凭据进行身份验证，所属机构和权限等属性会自动映射。

**数据主权。** 所有服务运行在您自己控制的基础设施上。除非您主动配置，否则任何数据都不会离开您的集群。这对于受 GDPR 和国家数据保护法规约束的机构尤为重要。

**模块化架构。** 并非每个机构都需要全部 25 个服务。配置系统允许您只启用用户需要的服务。可以只运行 ILIAS 和 Nextcloud，也可以部署完整技术栈，选择权在您手中。

## 教育服务处于 Beta 阶段

在 openDesk CE 基础上新增的 15 个服务以 Beta 版本发布。这意味着它们功能完整且已通过基本使用场景测试，但可能尚未达到 openDesk CE 核心服务同等的成熟度和稳定性。我们正在积极征集早期用户的反馈。

Beta 服务包括：ILIAS、Moodle、BigBlueButton、OpenCloud（基于 Nextcloud 的文件共享变体）、Grommunio、Etherpad、BookStack、Planka、Zammad、LimeSurvey、LTB SSP、Draw.io、Excalidraw 和 TYPO3。

如果您的机构有兴趣测试这些服务，我们非常欢迎您的反馈。Bug 报告、功能请求和部署经验都有助于塑造项目的发展方向。

## 参与其中

openDesk Edu 采用开放式开发模式，欢迎各界贡献。无论您是开发者、系统管理员、教育工作者，还是希望采用开源数字基础设施的机构，都有很多参与方式。

主要开发在 Codeberg 上进行：

[https://codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu)

GitHub 镜像也可用：

[https://github.com/opendesk-edu/opendesk-edu](https://github.com/opendesk-edu/opendesk-edu)

欢迎提交 Issue、Pull Request、文档改进和翻译。

## 下一步计划

未来几个月的路线图重点是：基于早期用户的实际反馈来稳定 Beta 服务。我们还在努力扩展联邦支持，覆盖 DFN-AAI 之外的更多国家级身份联邦，并简化机构评估 openDesk Edu 的接入流程。

请关注后续文章，我们将深入解析技术架构细节。
