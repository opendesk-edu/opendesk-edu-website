---
title: "系统架构概览"
date: "2026-04-15"
description: "openDesk Edu 系统架构概览，包括 Kubernetes 编排、DFN-AAI 和 eduGAIN SAML 联邦认证、Keycloak 统一 SSO 以及 25 个组件的完整服务目录。"
categories: ["架构", "基础设施"]
tags: ["架构", "kubernetes", "saml", "keycloak", "联邦认证"]
---

# 系统架构概览

openDesk Edu 在 openDesk 协作环境（CE）的基础上扩展了专属的教育服务层，为学校、大学和科研机构打造统一的数字化工作空间。基于 openDesk CE v1.13.x 构建，平台将 25 个服务打包到一个可部署的 Kubernetes 集群中，提供集中认证、自动备份以及由 Bundesdruckerei 提供的证书管理。全部代码采用 Apache-2.0 许可证发布，仅需一条命令即可部署：`helmfile -e default apply`。

## 核心原则

**原生容器化设计**

每个服务都以容器镜像形式运行，由 Kubernetes 1.28+ 编排。Helm 3 charts 管理各个服务的独立部署，helmfile 以声明式方式编排整个技术栈。配置文件位于 `helmfile/environments/default/global.yaml.gotmpl`，运维人员只需编辑这一个文件即可调整全平台的服务设置、资源限制和功能开关。这意味着可以单独更新某个组件，而无需触碰栈中的其他部分，回滚同样简单。

**联邦身份认证**

身份验证通过 Keycloak 作为中央身份提供者来完成，同时支持 SAML 2.0 和 OpenID Connect 协议。机构可以接入国家级科研身份联邦（德国的 DFN-AAI、国际的 eduGAIN），让师生使用已有的学校账号登录。Shibboleth 充当 SAML 服务提供者，为需要它的服务（如 ILIAS、Moodle 和 BigBlueButton）提供支持。Nubus 则提供自助门户，用于身份和访问管理。

**数据主权**

所有数据保留在机构自有基础设施内。没有任何组件会向外部 SaaS 端点发送数据。持久化存储基于 Kubernetes PersistentVolumes，由 k8up 操作器通过 restic 自动备份。TLS 证书来自 openDesk Certificates（Bundesdruckerei），整个信任链完全在机构掌控之中。

**模块化架构**

25 个服务按功能分组，可通过 helmfile 配置值独立启用或禁用。只需要 LMS 层？部署 ILIAS 和 Moodle，不需要群件或视频栈。不需要 LimeSurvey？直接排除即可。每个组件都有自己的 Helm chart、自己的数据库或存储声明，以及独立的扩缩容参数。

## 技术栈

| 组件 | 版本 / 说明 |
|------|------------|
| Kubernetes | 1.28+ |
| Helm | 3.x |
| helmfile | 声明式编排 |
| Keycloak | SAML 2.0 + OIDC 身份提供者 |
| Shibboleth | LMS/视频服务的 SAML SP |
| Nubus | AGPL-3.0, v1.18.1, 门户和 IAM |
| k8up | Kubernetes 备份操作器 |
| restic | 备份存储后端 |
| openDesk Certificates | 通过 Bundesdruckerei 提供 TLS |
| 基础平台 | openDesk CE v1.13.x |

## 服务架构

平台分为三个独立的层次：

**openDesk CE 基础层**

这是上游 openDesk 协作环境，提供核心的生产力和协作工具。包括即时通讯（Element）、文件共享（Nextcloud、OpenCloud）、群件（OX App Suite、SOGo）、视频会议（Jitsi）、协作编辑（Collabora、Etherpad）和知识管理（XWiki、BookStack）。这些服务已经生产就绪，跟踪上游 openDesk CE 的发布周期。

**教育服务层**

在基础层之上，openDesk Edu 新增了 15 个面向教育的服务。这一层包括学习管理系统（ILIAS、Moodle）、虚拟教室（BigBlueButton）、机构邮件（Grommunio）、内容管理系统（TYPO3）、调查工具（LimeSurvey）等。该层所有服务目前处于 Beta 状态，正在持续优化集成方案。

**SSO 和认证层**

Keycloak 位于核心位置，为两个层次中的每个服务提供认证代理。它通过 SAML 元数据交换连接上游的 DFN-AAI 或 eduGAIN，并通过 SAML 2.0 或 OIDC 与下游服务通信（取决于各服务的支持情况）。Shibboleth 填补了需要专用 SAML 服务提供者的应用空白。Nubus 提供面向用户的门户，用于账户管理、群组管理和应用启动。

## 认证与 SAML 联邦

Keycloak 作为整个平台的中央身份提供者，同时支持两个协议族：

- **SAML 2.0** 用于与国家级科研身份联邦及传统服务提供者的集成
- **OpenID Connect（OIDC）** 用于偏好令牌认证的现代应用

**联邦支持**

平台内置了 DFN-AAI（德国科研教育身份联邦）和 eduGAIN（国际互操作联邦）的元数据模板。接入机构身份提供者只需在联邦注册 Keycloak 实例、上传联邦元数据并配置属性映射。完成后，任何来自参与机构的 eduGAIN 有效账户用户都可以使用原机构凭据登录。

**Shibboleth 服务提供者**

部分教育服务（特别是 ILIAS、Moodle 和 BigBlueButton）需要专用的 SAML SP 而非直接 OIDC。Shibboleth 通过将 Keycloak 的 SAML 断言转换为这些应用期望的格式来满足这一需求。每个服务都有独立的 Shibboleth 实例，配有服务专用的属性过滤器。

**Nubus 门户**

Nubus（v1.18.1，AGPL-3.0）是身份栈的用户界面层。它为终端用户提供一个集中位置来查看个人资料、管理群组成员、启动应用和重置密码。管理员可以使用 Nubus 进行群组管理、角色分配和跨所有连接服务的审计日志查看。

## 备份与数据管理

k8up 操作器运行在 Kubernetes 集群内部，使用 restic 作为存储后端管理自动备份。备份遵循可配置的计划：

- **每日** 备份数据库和应用状态
- **每周** 对持久化卷进行完整快照
- **按需** 手动触发，用于迁移前或灾难恢复

**备份范围**

所有服务的持久化数据均包含在内：LMS 课程内容和学生提交（ILIAS、Moodle）、BigBlueButton 录制文件、Nextcloud 和 OpenCloud 用户文件、Grommunio 邮箱（通过 MariaDB 导出）、Collabora 文档缓存，以及 Keycloak 和 Nubus 的配置状态。容器镜像和临时缓存等非持久化数据不包含在内。

**存储目标**

Restic 支持多种存储后端，机构可以将备份定向到本地 NFS、S3 兼容对象存储或任何 restic 支持的目标。加密功能内置：所有备份数据在静态存储时使用可配置密钥加密。

## 组件概览

下表列出了 openDesk Edu 栈中的全部 25 个服务，按功能分组。

| 功能 | 服务 | 版本 | 状态 |
|------|------|------|------|
| **即时通讯** | Element | 1.12.6 | 稳定 |
| **笔记** | Notes | 4.4.0 | 稳定 |
| **图表** | Draw.io | 29.6 | 稳定 |
| **图表** | Excalidraw | latest | 稳定 |
| **文件** | Nextcloud | 32.0.6 | 稳定 |
| **文件** | OpenCloud | 4.0.3 | Beta |
| **群件** | OX App Suite | 8.46 | 稳定 |
| **群件** | SOGo | 5.11 | 稳定 |
| **群件** | Grommunio | 2025.01 | Beta |
| **Wiki** | XWiki | 17.10.4 | 稳定 |
| **Wiki** | BookStack | 26.03 | 稳定 |
| **门户 / IAM** | Nubus | 1.18.1 | Beta |
| **项目管理** | OpenProject | 17.2.1 | 稳定 |
| **会议** | Jitsi | 2.0.10590 | 稳定 |
| **办公套件** | Collabora | 25.04.8 | 稳定 |
| **协作编辑** | Etherpad | 1.9.9 | 稳定 |
| **协作编辑** | CryptPad | 2025.9.0 | 稳定 |
| **LMS** | ILIAS | 7.28 | Beta |
| **LMS** | Moodle | 4.4 | Beta |
| **在线课堂** | BigBlueButton | 2.7 | Beta |
| **看板** | Planka | 2.1.0 | 稳定 |
| **帮助台** | Zammad | 7.0 | 稳定 |
| **问卷调查** | LimeSurvey | 6.6 | Beta |
| **密码重置** | LTB SSP | 1.7 | Beta |
| **CMS** | TYPO3 | 13.4 | Beta |

标记为"稳定"的服务作为上游 openDesk CE 发布版的一部分提供。标记为"Beta"的服务属于 openDesk Edu 教育层，正在积极稳定中。

## 可替代组件

多个功能领域提供了多种服务选项，机构可以选择最适合自身需求的工具：

- **邮件**：OX App Suite、SOGo 或 Grommunio
- **视频会议**：Jitsi 或 BigBlueButton
- **文件存储**：Nextcloud 或 OpenCloud
- **白板**：Excalidraw 或 CryptPad

每个替代方案都使用相同的 Keycloak 认证、相同的备份管道和相同的证书基础设施。在替代方案之间切换只需在 helmfile 配置中启用或禁用对应的 chart 即可。如需详细了解功能、许可证和资源需求的对比，请参阅[组件对比页面](/components/comparison)。
