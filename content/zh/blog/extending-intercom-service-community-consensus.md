---
title: "扩展 Intercom 服务：呼吁 ZenDiS 与社区就共同开发模式达成共识"
date: "2026-06-27"
description: "我们如何扩展 openDesk 的 intercom 服务以支持 OpenCloud、SOGo 和 ILIAS，以及为什么我们强烈敦促 ZenDiS 和社区就共同开发模式建立正式共识。"
categories: ["工程", "社区", "开源"]
tags: ["intercom-service", "zendis", "opendesk", "扩展", "社区", "治理"]
author: "Tobias Weiß 和 openDesk Edu 贡献者"
image: "/static/blog/extending-intercom-service-community-consensus-teaser.svg"
---

# 扩展 Intercom 服务：呼吁 ZenDiS 与社区就共同开发模式达成共识

## 引言

**intercom 服务** (ICS) 是 openDesk 生态系统中一个小但关键的基础设施组件。它充当中间件，支持基于浏览器的跨应用程序通信——文件选择器、视频会议集成、应用程序间单点登录，以及门户导航。

当我们着手构建 **openDesk Edu** 时，我们发现上游 intercom 服务（由 Univention 维护，由 ZenDiS 部署）主要为 **openDesk CE**（社区版）设计，专注于 **Nextcloud、OX App Suite 和 Matrix** 作为主要集成。

对于 **openDesk Edu**，我们需要 **OpenCloud、SOGo 和 ILIAS** 的额外集成。这是我们扩展 intercom 服务的故事——以及我们就共同开发模式向 **ZenDiS 和社区** 发出正式共识呼吁。

## Intercom 服务：它的功能

intercom 服务是一个轻量级的代理/代理程序，在浏览器上下文中运行。它使应用程序能够：

- **文件选择器**：在其他应用程序中从 Nextcloud/OpenCloud 打开文件
- **静默登录**：在应用程序之间传递 OIDC 令牌，无需用户交互
- **门户导航**：从 Univention 门户获取中央导航菜单
- **视频会议集成**：从其他应用程序创建 BBB/Jitsi 会议室
- **反向通道注销**：协调 OIDC 会话终止

这些功能要求 ICS 作为 **iframe 嵌入到每个应用程序** 中，然后使用 **postMessage** 与父应用程序通信。ICS 充当持有用户 OIDC 令牌的受信中间件，并可以代表用户执行操作。

## 我们的扩展

在 openDesk Edu 分支中，我们添加了以下内容：

### 1. **OpenCloud 支持** (`/oc/` 路由)

上游仅支持 Nextcloud (`/fs/` 路由)。我们为 OpenCloud 添加了一个并行的 `/oc/` 路由，它是 openDesk Edu 中的主要文件服务。

```typescript
// 新增：opencloud 路由处理器
router.get('/oc/*', handleOpenCloudProxy);

// 现有：nextcloud 路由（为兼容性保留）
router.get('/fs/*', handleNextCloudProxy);
```

### 2. **SOGo Groupware 支持** (`/sogo/` 路由)

上游不支持 SOGo。我们添加了一个 `/sogo/` 路由，将 CalDAV 和 CardDAV 请求代理到 SOGo 后端，实现跨应用程序的日历和联系人集成。

### 3. **ILIAS LMS 支持** (`/ilias/` 路由)

上游不支持 ILIAS。我们添加了一个 `/ilias/` 路由，将 REST API 调用和文件上传代理到 ILIAS 后端，实现深度 LMS 集成。

### 4. **标准 Node.js 基础镜像**

上游需要 **Univention UCS 基础镜像**，这是一个 2GB+ 的镜像，包含许多 Univention 特定的依赖项。我们将其替换为 **标准 Node.js Alpine 基础镜像**，将镜像大小减少到约 150MB，并使 ICS 可以在任何 Kubernetes 集群上部署，而无需 Univention 依赖。

### 5. **`opendesk_username` 作为默认声明**

上游使用 `username` 作为默认声明。我们将其更改为 `opendesk_username` 以匹配 openDesk Edu 的声明命名约定。

### 6. **健康检查端点** (`/health`)

一个简单的 `/health` 端点，返回 `{"status": "ok"}` 用于 Kubernetes 活跃度/就绪度探测。

## 问题：代码库分化

这是不舒服的事实：**我们的分支正在与上游分化**。

每次 ZenDiS 更新上游 intercom 服务（例如，安全补丁、openDesk CE 的新功能），我们都面临一个选择：

1. **合并上游并失去我们的更改** → 我们将失去 OpenCloud、SOGo 和 ILIAS 支持
2. **留在我们的分支上并错过上游改进** → 我们将积累技术债务
3. **手动 rebase 并解决冲突** → 每次都需要几天时间，而且容易出错

**这些选项都不可持续。** 我们需要更好的方法。

## 根本原因：没有共同的开发模式

根本问题是没有 **正式协议** 关于：

- **ZenDiS**（openDesk 平台的主要维护者）
- **openDesk Edu 社区**（以及可能的其他 openDesk 变体）

...关于 **像我们这样的扩展应该如何开发、贡献和合并**。

目前的情况是：

- ZenDiS 为 **openDesk CE**（公共部门焦点）开发
- 我们为 **openDesk Edu**（教育部门焦点）开发
- 两个项目使用 **相同的上游 intercom 服务** 但有不同的需求
- **没有官方渠道** 来回馈我们的更改
- **没有治理模型** 来管理分化的分支

## 我们的呼吁：正式的 ZenDiS-社区共识

我们认为是时候在 ZenDiS 和社区之间就共同开发模式建立 **正式共识**。这是我们的提案：

### 1. **贡献者许可协议（CLA）**

ZenDiS 应提供一个轻量级的 CLA，允许外部贡献者在没有复杂法律开销的情况下提交更改。这在许多开源项目中是标准做法（例如，CNCF、Apache Foundation）。

### 2. **通用、可插拔的架构**

intercom 服务应重构为 **与服务无关**，并采用 **插件架构**。不应有针对 Nextcloud、SOGo、OpenCloud 等的硬编码处理程序，而应有一个任何服务都可以实现的通用接口。

```typescript
// 建议：可插拔架构
interface BackendService {
  name: string;
  baseUrl: string;
  healthCheck(): Promise<boolean>;
  proxyRequest(req: Request): Promise<Response>;
}

// 注册任何服务
registry.register('opencloud', new OpenCloudService());
registry.register('sogo', new SOGoService());
registry.register('ilias', new ILIASService());
```

这将允许 openDesk Edu 添加 OpenCloud、SOGo 和 ILIAS 支持作为 **插件**，而不需要上游修改。

### 3. **通用配置模式**

所有 openDesk 变体应对 intercom 服务使用 **通用配置模式**。这使得以下操作变得容易：

- 在所有变体中部署相同的镜像
- 共享 Helm charts 和 Kubernetes 清单
- 一致地测试集成

```yaml
# 建议：通用配置模式
intercom:
  backends:
    - name: nextcloud
      type: ocis  # 或 "nextcloud"、"opencloud" 等
      url: https://nextcloud.example.com
    - name: sogo
      type: caldav
      url: https://sogo.example.com
```

### 4. **多变体测试的 CI/CD**

ZenDiS 的 CI/CD 应针对 **所有主要的 openDesk 变体**（CE、Edu、SME 等）测试 intercom 服务，而不仅仅是 CE。这确保更改不会破坏其他变体。

### 5. **定期社区通话**

ZenDiS 维护者和社区贡献者之间每月或每两个月举行社区通话：

- 讨论即将到来的更改
- 协调发布
- 及早解决冲突
- 分享路线图

### 6. **公开路线图**

ZenDiS 应为 intercom 服务（和其他共享组件）发布 **公开路线图**，以便社区可以围绕更改进行规划。

### 7. **清晰的贡献路径**

应该有 **清晰、文档化的路径** 用于社区贡献：

- 如何提交 PR
- 使用什么审查标准
- 如何决定合并
- 谁有合并权限
- 如何解决冲突

## 为什么这对数字主权很重要

这不仅仅是关于代码质量或开发人员的便利性。它对 **欧洲公共行政的数字主权** 有 **真正的影响**。

openDesk 平台是德国联邦政府的一项 **战略举措**，旨在提供 Microsoft 365 和 Google Workspace 的主权替代方案。如果平台分散成不兼容的分支，它会破坏核心价值主张：

- **互操作性**：使用不同 openDesk 变体的不同政府机构应该能够协作
- **可维护性**：分歧太大的分支变得无法维护
- **采用**：公共管理员不愿意采用分散的平台
- **成本**：每个分支都需要自己的维护团队，增加总成本

**就共同开发模式达成正式共识对于 openDesk 作为主权平台的长期成功至关重要。**

## 我们在等待期间做什么

在等待正式共识的同时，我们尽力成为优秀的社区公民：

1. **开源我们的分支** 在 GitHub 上：https://github.com/opendesk-edu/opendesk/tree/main/helmfile/charts/intercom-service
2. **向上游提交 PR** 以获取对所有人有用的任何更改
3. **清楚地记录我们的更改** 在 README 中（参见"What's different from upstream"部分）
4. **保持兼容性** 保留所有上游路由
5. **回馈改进** 如标准 Node.js 基础镜像

我们不打算永久分叉项目。**我们想合并回去**。但我们需要一个流程来使这成为可能。

## 给 ZenDiS 的具体提案

对于 ZenDiS，我们提出以下 **第一步**：

1. **打开一个 GitHub issue**，标题为 "RFC: Multi-variant intercom-service development"，在 univention/intercom-service 仓库上
2. **邀请 openDesk Edu、SME 和其他变体维护者** 参加启动通话
3. **建立一个工作组** 来起草贡献指南
4. **发布 CLA 模板** 用于社区贡献
5. **重构 intercom 服务** 使其更加模块化（即使是一个简单的第一步也有帮助）

我们准备贡献我们的时间、代码和资源来实现这一目标。**球在 ZenDiS 那边。**

## 结论：前进的道路

openDesk 平台是一项了不起的成就——25+ 集成的开源服务、德国数据保护合规性，以及对美国 SaaS 巨头的真正替代方案。但其长期成功取决于 **协作，而不是分化**。

我们强烈敦促 ZenDiS 与社区合作，为 intercom 服务等共享组件建立 **共同开发模式**。这不仅仅是让我们的生活更轻松——这是为了确保 openDesk 长期保持 **可行的主权平台**。

**让我们一起构建。**

---

## 行动呼吁

如果您认同这一愿景，您可以通过以下方式提供帮助：

1. **分享本文** 与 openDesk 社区
2. **与 ZenDiS 互动** 在社交媒体和会议上
3. **贡献** 到 intercom 服务或其他共享组件
4. **评论** GitHub issue（一旦存在）并附上您的用例
5. **记录** 您自己的 openDesk 变体的需求

我们可以共同为欧洲公共行政和教育构建一个真正的主权数字基础设施。

---

**关于作者**：本文由 openDesk Edu 社区撰写。openDesk Edu 是为德国教育机构部署的 25 个集成开源服务的生产部署，总部位于 HRZ Marburg。请参阅 [opendesk-edu.org](https://opendesk-edu.org) 了解更多信息。

**许可证**：本文采用 Apache-2.0 许可证。
