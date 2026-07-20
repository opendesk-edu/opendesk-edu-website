---
title: "教育联合身份：openDesk Edu 与 DFN-AAI 联合体"
date: "2026-07-10"
description: "openDesk Edu 如何通过 Keycloak 作为 SAML 服务提供商代理与德国国家研究联合体 DFN-AAI 集成——以及呼吁社区建立共享评估实例以降低每个机构的门槛。"
categories: ["技术", "社区", "身份"]
tags: ["dfn-aai", "联合体", "saml", "keycloak", "edugain", "身份管理", "shibboleth", "社区", "评估"]
image: "/static/blog/dfn-aai-federation-shared-evaluation-teaser.svg"
---

# 教育联合身份：openDesk Edu 与 DFN-AAI 联合体

> **愿景：** 任何德国大学的学生只需登录一次本地学习平台——就能跨机构访问协作工具、文件存储和视频会议，无需第二个密码。
>
> **现实：** 联合体很困难。SAML 元数据、eduGAIN 属性映射、SP 注册、证书管理——每个机构都在重复造轮子。
>
> **行动号召：** 让我们共同建立一个共享的 DFN-AAI 评估实例。一套联合体配置，由多人测试和记录。为社区中的每个机构降低门槛。

## DFN-AAI 联合体

DFN-AAI（德国研究网络——认证与授权基础设施）是德国的国家学术身份联合体，通过 SAML 2.0 连接大学、研究机构和服务提供商。它是全球 eduGAIN 互联合体的一部分，这意味着 DFN-AAI 登录可以认证全球参与机构的用户。

对于 openDesk Edu，DFN-AAI 集成不是可选的——它是一个核心需求。德国大学不会为每个平台创建单独的用户帐户。它们通过向 DFN-AAI 注册并与 eduGAIN 联合的机构身份提供商（IdP）进行认证。

没有 DFN-AAI 支持，openDesk Edu 将成为一个孤岛。有了它，它就成为国家研究和教育基础设施的一部分。

## 我们构建了什么

在 v1.1 发布路线图的第 5 个 Sprint（2026 年 7 月）中，我们为 openDesk Edu 实现了全面的 DFN-AAI 联合体支持。以下是交付成果：

### 1. Keycloak 作为 SAML 服务提供商代理

核心架构决策：**Keycloak 同时充当 SAML SP（面向 DFN-AAI）和 OIDC IdP（面向 openDesk 服务）。** 这意味着：

- 外部世界看到一个 SAML SP 实体——简洁、简单、标准
- 内部服务继续使用 OIDC——无需为每个服务配置 SAML
- 属性翻译在一个地方完成——SAML eduGAIN 属性 → OIDC 声明
- 反向通道注销从 DFN-AAI → Keycloak → 所有 25+ 服务传播

```
┌──────────────┐     SAML 2.0     ┌──────────────┐     OIDC      ┌──────────────┐
│  DFN-AAI IdP │◄────────────────►│   Keycloak   │◄────────────►│ openDesk     │
│ (Shibboleth) │    (eduGAIN)     │  (SAML SP)   │   (声明)      │ 服务         │
└──────────────┘                  └──────────────┘               └──────────────┘
```

### 2. eduGAIN 属性映射

eduGAIN 定义了一套 IdP 发布关于其用户的标准属性。我们将这些映射到 Keycloak 用户属性和 OIDC 声明：

**5 个必需属性（DFN-AAI 注册必需）：**

| eduGAIN 属性 | 描述 | 映射到 |
|-------------------|-------------|-----------|
| `eduPersonPrincipalName` | 唯一用户标识符 | `eppn` |
| `mail` | 电子邮件地址 | `email` |
| `displayName` | 完整显示名称 | `name` |
| `givenName` | 名字 | `firstName` |
| `sn` | 姓氏 | `lastName` |

**5 个推荐属性：**

| eduGAIN 属性 | 描述 | 映射到 |
|-------------------|-------------|-----------|
| `eduPersonAffiliation` | 角色（学生/员工/教师） | `affiliation` |
| `eduPersonScopedAffiliation` | 带范围的从属关系 | `scopedAffiliation` |
| `eduPersonEntitlement` | 权限 URN | `entitlement` |
| `preferredLanguage` | 语言偏好 | `locale` |
| `schacHomeOrganization` | 所属机构域名 | `organization` |

属性映射是关键路径。如果属性未正确传递，用户将无法认证、角色无法分配、个性化失败。我们记录了每个映射器及其 SAML 属性名称格式（`urn:oasis:names:tc:SAML:2.0:attrname-format:uri` vs `basic`），以消除猜测。

### 3. 服务提供商元数据生成

我们创建了一个元数据生成工作流，生成 DFN-AAI 注册所需的 SAML SP 元数据 XML：

```bash
# 生成 SP 元数据
./scripts/generate-saml-metadata.sh \
  --entity-id "urn:auth:opendesk:edu:yourdomain" \
  --acs-url "https://keycloak.yourdomain.de/realms/opendesk/broker/dfn-aai/endpoint" \
  --cert-file /etc/ssl/certs/saml-signing.crt

# 验证元数据
xmllint --valid --noout sp-metadata.xml
```

### 4. 测试与故障排除

我们记录了完整的测试工作流程——从测试 IdP 帐户到属性验证再到单点注销传播——涵盖 DFN-AAI 测试联合体环境的测试指南：

| 环境 | 元数据来源 | 注册时间 |
|-------------|-----------------|-------------------|
| **测试联合体** | DFN-AAI 测试联合体：`https://www.aai.dfn.de/fileadmin/metadata/DFN-AAI-Test-metadata.xml` | 1-2 个工作日 |
| **生产联合体** | 您机构的 DFN-AAI 管理员 | 3-5 个工作日 |

### 5. 完整文档套件

DFN-AAI 工作产生了五份文档文件，总计约 500 行，涵盖联合体架构、Keycloak 集成、注册、测试和生产部署。

## 挑战：每个机构都在重复造轮子

问题在于：每所想要部署 openDesk Edu（或任何兼容 SAML 平台）的大学都需要：

1. **联系 DFN-AAI** 进行联合体注册（1-2 周行政流程）
2. **为其特定部署生成 SAML 元数据**
3. **通过其机构 PKI 配置证书签名**
4. **与其机构 IdP 管理员协调属性发布**
5. **测试完整流程**——认证、属性映射、注销传播
6. **独立调试**当出现问题时

对于单个机构来说，这是可管理的。**但对于 10、20 或 50 个机构来说，重复程度令人震惊。** 每个团队都要调试相同的 SAML 错误。每个团队都要搞清楚相同的属性映射。每个团队都要经历相同的 1-2 周注册等待。

更糟糕的是：**没有共享的评估环境。** 如果您是评估 openDesk Edu 的大学，您无法在不经过完整注册流程的情况下"简单测试"DFN-AAI 集成。您需要一个生产级的 SAML SP，在 DFN-AAI 注册，配备合适的证书和元数据——仅仅是为了决定平台是否适合您。

这就是我们需要共同解决的瓶颈。

## 行动号召：共享的 DFN-AAI 评估实例

以下是建议：**让我们建立一个共享的 DFN-AAI 评估实例，任何社区成员都可以用它来测试联合体集成。**

### 它将是什么

一个由社区管理的单一 Keycloak 实例，配置为 DFN-AAI SAML 服务提供商，在 DFN-AAI 测试联合体中注册，可供多个项目用于评估目的：

```
┌─────────────────────────────────────────────────────┐
│           共享评估实例                                │
│                                                      │
│  Keycloak (SAML SP) ───── 在 DFN-AAI 注册            │
│       │                                              │
│       ├── Realm: opendesk-eval    (openDesk Edu)     │
│       ├── Realm: lms-eval         (其他 LMS)          │
│       ├── Realm: collab-eval      (协作)             │
│       └── Realm: your-project     (您的项目)          │
│                                                      │
│  共享 SAML 元数据：eval.sp.opendesk-edu.org            │
│  共享证书：社区管理的 PKI                              │
│  共享文档：经过多人实战检验                             │
└─────────────────────────────────────────────────────┘
```

### 为什么重要

- **降低评估门槛**——无需等待 2 周的注册即可测试联合体集成
- **共享调试知识**——当一个社区成员解决 SAML 问题时，所有人受益
- **标准化属性映射**——一个经过验证的 eduGAIN 映射器配置，由多个机构验证
- **提供参考实现**——"它在共享评估实例上能工作"成为基准
- **加速采购流程**——在承诺完整注册流程之前进行评估

### 如何运作

共享实例将：

1. **轻量级**——运行 Keycloak 的单个 VM 或 Kubernetes Pod，在 DFN-AAI 测试联合体中注册
2. **多租户**——每个社区项目获得自己独立的 Keycloak realm 进行隔离测试
3. **社区管理**——配置和证书公开管理，每次更改都有文档记录
4. **有文档**——每个属性映射器、每个端点、每次证书轮换都有记录
5. **默认临时**——Realm 仅用于评估；生产部署仍需适当注册

### 我们需要社区的什么

这只有作为社区努力才能实现。以下是需要的内容：

| 角色 | 您贡献什么 |
|------|---------------------|
| **基础设施托管** | 小型 VM 或容器主机（2 CPU，4 GB 内存）——可每月轮换 |
| **DFN-AAI 联络人** | 有现有 DFN-AAI 注册并能注册共享 SP 的人 |
| **证书管理员** | 生成和轮换 SAML 签名证书 |
| **测试人员** | 连接您的 SP 配置并验证属性映射 |
| **文档撰写者** | 记录有效的配置、常见错误和解决方案 |
| **用户** | 使用真实的机构 IdP 凭据进行测试（任何 DFN-AAI 成员） |

### 入门指南

如果您有兴趣贡献或使用共享的 DFN-AAI 评估实例：

1. **开启 GitHub 讨论**——让我们评估兴趣并协调：[github.com/opendesk-edu/opendesk-edu/discussions](https://github.com/opendesk-edu/opendesk-edu/discussions)
2. **查看 DFN-AAI 文档**——了解需要什么：[`docs/dfn-aai-federation.md`](https://github.com/opendesk-edu/opendesk-edu/blob/main/docs/dfn-aai-federation.md)
3. **使用现有指南测试**——验证我们的 Keycloak 配置是否适用于您的 IdP
4. **分享您的经验**——您的机构发布哪些属性？您遇到了哪些错误？您发现了哪些配置特点？

### 我们已经做了什么

基础已经到位：

- 完整的 Keycloak SAML SP/IdP 配置文档化和审查
- 10 个 eduGAIN 属性映射器（5 个必需 + 5 个推荐）记录了精确的 SAML 属性名称格式
- 带证书支持的 SP 元数据生成脚本
- DFN-AAI 测试联合体的测试指南
- 5 份文档文件涵盖联合体、注册、集成、测试和生产部署
- 为所有 25+ openDesk Edu 服务配置的反向通道注销——端到端注销传播正常工作

缺少的是共享基础设施。这正是我们需要您的地方。

## 联合体是团队运动

openDesk Edu 项目建立在教育技术应主权、协作和开放的原则之上。DFN-AAI 联合体体现了所有三点：

- **主权**——机构控制自己的身份基础设施
- **协作**——联合体连接机构，而不是隔离它们
- **开放**——SAML 2.0 和 eduGAIN 是开放标准，不是专有协议

共享评估实例将这一理念延伸到评估过程本身。每个机构不必独自攀登同一座山，我们共同开辟道路——而每个后来者都受益于我们清理出的路径。

**加入我们。针对共享实例测试您的联合体设置。贡献您的发现。帮助建设每个机构都需要的评估基础设施。**

---

*DFN-AAI 联合体工作是 openDesk Edu v1.1 版本的一部分。所有文档可在 [openDesk Edu 仓库](https://github.com/opendesk-edu/opendesk-edu) 中找到。关于共享评估计划的疑问，请开启 GitHub 讨论或联系社区。*

**openDesk Edu：主权、集成、可投入生产的开源教育技术。**
