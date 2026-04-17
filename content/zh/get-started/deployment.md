---
title: "部署指南"
date: "2026-04-15"
description: "在您的大学 Kubernetes 基础设施上部署 openDesk Edu 的分步指南。"
categories: ["部署", "指南"]
tags: ["部署", "kubernetes", "helm", "helmfile", "keycloak"]
---

# 部署指南

openDesk Edu 是专为教育机构设计的模块化数字工作空间。它将协作工具、学习管理系统和办公应用整合到一个运行在 Kubernetes 上的平台中。所有服务以 Helm Chart 形式分发，通过 helmfile 编排，只需一条命令即可部署整个技术栈。

本指南涵盖从全新集群到完整运行平台（含身份认证、备份和 TLS 证书）的全流程部署。

## 前置条件

开始之前，请确认以下条件已满足：

- **Kubernetes 1.28 或更高版本**。openDesk Edu 使用了 CRD 和 Pod 安全准入等需要较新集群版本的功能。Hetzner Cloud Kubernetes、OVH Managed Kubernetes 或使用 kubeadm 搭建的自建集群均可使用。
- **Helm 3** 已安装并配置好集群访问权限。
- **helmfile** 已安装。这是编排层，负责读取您的配置并按正确顺序应用所有 Helm Release。
- **一个域名及 DNS 管理权限**。您需要一个基础域名（例如 `desk.university-example.edu.cn`）以及为每个服务创建子域名记录的能力。
- **SAML IdP 访问权限**。openDesk Edu 通过 Keycloak 对用户进行身份认证，Keycloak 会连接到您大学的身份提供者。在德国，通常意味着加入 DFN-AAI 或 eduGAIN 联盟的成员。
- **最低 16 GB 内存和 4 个 CPU 核心**。这是 openDesk 核心服务的基础要求。教育服务（ILIAS、Moodle、BigBlueButton、OpenCloud）会显著增加资源需求。生产环境中启用全部服务时，建议预留 32 GB 内存和 8 个 CPU 核心或更多。

## 快速开始

部署 openDesk Edu 最快的方式包含四个步骤。

### 1. 克隆仓库

```bash
git clone https://git.opencode.de/opendesk/edu-deployment.git
cd edu-deployment
```

该仓库包含 helmfile 配置、环境定义以及所有 openDesk Edu 服务的自定义 Values 覆盖。

### 2. 编辑全局配置

在编辑器中打开 `helmfile/environments/default/global.yaml.gotmpl`。至少需要设置您的域名并选择要启用的服务：

```yaml
domain: desk.university-example.edu.cn

services:
  keycloak:
    enabled: true
  nextcloud:
    enabled: true
  ox:
    enabled: false
  sogo:
    enabled: false
  grommunio:
    enabled: true
  jitsi:
    enabled: false
  bbb:
    enabled: true
  ilias:
    enabled: true
  moodle:
    enabled: false
  opencloud:
    enabled: true
  excalidraw:
    enabled: true
  cryptpad:
    enabled: false
```

每个服务都可以独立开关。配置文件使用 Go 模板语法（`.gotmpl`），允许在所有服务定义中引用共享值（如域名）。

### 3. 执行部署

```bash
helmfile -e default apply
```

helmfile 读取环境配置，解析所有服务间的依赖关系，并按正确顺序应用每个 Helm Chart。Keycloak 会首先部署，因为其他服务依赖它进行身份认证。在全新集群上预计需要 10 到 20 分钟，具体取决于启用的服务和网络速度。

### 4. 访问服务

部署完成后，每个服务可通过其子域名访问：

| 服务 | URL |
|------|-----|
| Keycloak 管理控制台 | `https://keycloak.desk.university-example.edu.cn` |
| Nextcloud | `https://nextcloud.desk.university-example.edu.cn` |
| Grommunio | `https://grommunio.desk.university-example.edu.cn` |
| BigBlueButton | `https://bbb.desk.university-example.edu.cn` |
| ILIAS | `https://ilias.desk.university-example.edu.cn` |
| OpenCloud | `https://opencloud.desk.university-example.edu.cn` |

Keycloak 管理员凭据在首次部署时自动生成，存储在 Kubernetes Secret 中。通过以下命令获取：

```bash
kubectl get secret -n opendesk keycloak-admin -o jsonpath='{.data.password}' | base64 -d
```

## 配置说明

`helmfile/environments/default/global.yaml.gotmpl` 是整个 openDesk Edu 安装的中央配置文件。每个服务都从这个文件读取配置值，您可以在此覆盖任何 Helm Chart 的默认值。

### 域名和 Ingress

`domain` 字段设置所有服务的基础 URL。每个 Chart 通过将服务名称（例如 `nextcloud`）附加到基础域名来构建自己的 Ingress 规则。如果您使用反向代理或外部负载均衡器，还可以设置 `ingress.className` 指向您的 Ingress 控制器。

### Keycloak 设置

Keycloak 充当中央身份代理。在全局配置中，您可以设置管理员用户名、Realm 名称和默认主题。每个服务的身份认证流程和客户端注册由 Helm Chart 自动处理。

### 替代组件

openDesk Edu 为多个服务类别提供了不同的实现方案。您只需选择要启用的方案，配置文件会确保每个类别只激活一个组件：

- **邮件**：Open-Xchange (OX)、SOGo 或 Grommunio
- **视频会议**：Jitsi Meet 或 BigBlueButton
- **文件存储**：Nextcloud 或 OpenCloud
- **白板**：Excalidraw 或 CryptPad

将所需组件设为 `enabled: true`，同一类别下的其他组件设为 `enabled: false`。切勿同时启用两个替代组件，否则会导致 Ingress 路由和 Keycloak 客户端 ID 冲突。

## 身份认证配置

Keycloak 是所有 openDesk Edu 服务的中央身份提供者。它同时支持 SAML 2.0 和 OpenID Connect (OIDC)，能够与您现有的大学基础设施集成，为所有应用提供单点登录。

### 连接大学 IdP

大多数德国大学是 DFN-AAI 联盟的成员，该联盟属于全球 eduGAIN 网络。Keycloak 通过 SAML 2.0 身份提供者绑定连接到这些联盟。

配置步骤如下：

1. 登录 Keycloak 管理控制台，访问 `https://keycloak.desk.university-example.edu.cn`。
2. 导航到您的 Realm，创建一个 SAML 2.0 类型的身份提供者。
3. 输入您大学的 IdP 元数据 URL（由您的 DFN-AAI 联盟运营者提供）。
4. 配置 SAML Entity ID，使其与在联盟中注册的值匹配。
5. 启用身份提供者并测试登录流程。

### 协议支持

每个下游服务使用最适合的协议：

- **SAML 2.0**：ILIAS 和 Moodle 通过 Shibboleth 服务提供者 (SP) 配置使用。这些学习管理平台期望来自受信任 IdP 的 SAML 断言，Keycloak 负责提供。
- **OIDC**：Nextcloud、OpenCloud、Grommunio、BigBlueButton 和 Excalidraw 使用。OIDC 是更现代的协议，Web 应用配置更简单。

### LMS 服务的 Shibboleth SP

ILIAS 和 Moodle 使用 Shibboleth 作为服务提供者来消费来自 Keycloak 的 SAML 断言。openDesk Edu 的 Helm Chart 为这些服务包含 Shibboleth SP Sidecar 容器。SP 配置根据 Keycloak Realm 设置自动生成，无需手动编辑 Shibboleth XML 文件。

## 组件选择

openDesk Edu 采用模块化架构。您只需启用机构需要的服务，这样既能控制资源消耗，又简化了维护工作。所有服务通过 `global.yaml.gotmpl` 进行管控。

### 核心服务

- **Keycloak**：必需。这是身份认证的基石，不可禁用。
- **Element Web (Matrix)**：消息传递和协作中心。默认启用。

### 邮件方案

选择其中之一：

- **Open-Xchange (OX)**：功能丰富的群件套件，包含日历、联系人和邮件。适合需要与 OX 其他组件紧密集成的机构。
- **SOGo**：轻量级群件，ActiveSync 支持良好。适合小型部署。
- **Grommunio**：完整的 Microsoft Exchange 替代方案，原生兼容 Outlook。邮件数据存储在 MariaDB 中。

### 视频会议

选择其中之一：

- **Jitsi Meet**：轻量级点对点视频会议。资源需求较低。适合约 25 人以内的会议。
- **BigBlueButton (BBB)**：专为在线教学设计。支持录制、分组讨论、白板和演示文稿上传。资源需求较高，但是在线课堂的标准方案。

### 文件存储

选择其中之一：

- **Nextcloud**：成熟且广泛使用。拥有丰富的应用生态系统，支持文档编辑、日历和任务管理。
- **OpenCloud**：Nextcloud 的分支版本，具有额外的企业级功能和与 openDesk 技术栈更紧密的集成。

### 白板

选择其中之一：

- **Excalidraw**：简单直观的协作白板。适合快速草图和头脑风暴。
- **CryptPad**：端到端加密的协作套件，包含白板功能。隐私保障更强。

### 教育服务

- **ILIAS**：在德国高等教育机构中广泛使用的学习管理系统。支持 SCORM、LTI 和集成式内容创作工具。
- **Moodle**：全球最受欢迎的学习管理系统。拥有庞大的插件生态系统和活跃的社区。

## 备份配置

openDesk Edu 使用 k8up Operator，底层基于 restic。k8up 作为 Kubernetes 控制器运行，根据 Helm Chart 中定义的 `Schedule` CRD 创建定时备份。

### 备份范围

备份配置覆盖以下数据：

- **LMS 内容**：ILIAS 数据目录和 Moodle 文件存储，包括上传的课程材料、用户提交作业和 SCORM 包。
- **BigBlueButton 录制**：存储在持久卷上的会议录制文件。这些文件可能很大，请注意监控存储使用情况。
- **Nextcloud / OpenCloud 文件**：用户文件、共享文件夹和持久卷上的应用数据。
- **Grommunio 数据**：包含所有 Grommunio 用户的邮件、日历和联系数据的 MariaDB 数据库转储。

### Restic 仓库

备份存储在 restic 仓库中。在全局配置中设置仓库位置（推荐使用兼容 S3 的存储以实现异地容灾）和加密密码。首次备份所需时间取决于数据量。后续运行利用 restic 的去重功能，仅传输变更数据。

### 数据恢复

要恢复备份，使用 k8up 的 `Restore` CRD。指定一个快照，Operator 会自动将恢复的数据挂载到对应的 Pod 中。

## 证书管理

openDesk Edu 使用 Bundesdruckerei 提供的 openDesk Certificates 服务管理 TLS 证书。该服务为所有服务子域名提供自动化的证书签发和续期。

证书 Operator 作为 Kubernetes 控制器运行。它会为每个 Ingress 资源请求证书，并在到期前自动续期。无需手动管理证书或配置外部 ACME 客户端。

如果您的机构需要使用其他 CA 的证书，可以将证书 Operator 配置为使用您首选的提供商。Ingress 资源通过 Kubernetes TLS Secret 引用证书，下游服务无需任何证书相关配置。

## 后续步骤

- 阅读**架构概览**，了解各服务之间的交互方式和数据流转。
- 访问各**组件页面**，获取特定服务的配置选项、资源调优和集成指南。
- 如果在部署过程中遇到问题，请查阅**故障排除**章节。
