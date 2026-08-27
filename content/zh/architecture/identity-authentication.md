---
title: "身份与认证架构"
date: "2026-08-27"
description: "openDesk Edu 的完整认证链——从 DFN-AAI 联邦通过 Keycloak 单点登录到 SAML 和 OIDC 服务连接、属性映射及多 IdP 场景。"
categories: ["architecture", "infrastructure"]
tags: ["architecture", "identity", "authentication", "saml", "oidc", "keycloak", "federation", "dfn-aai", "edugain", "shibboleth", "nubus"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/identity-authentication-teaser.svg"
---

# 身份与认证架构

身份是每个用户接触的第一件事。在学生打开文件、加入课程或编辑文档之前，他们需要先认证。在高等教育领域，这种认证很少发生在平台本身——它发生在用户的所属机构，通过国家和国际身份网络进行联邦。本文记录了 openDesk Edu 如何端到端地处理这一流程：从联邦层通过 Keycloak 作为中央身份代理，到最终接收用户身份属性的服务。

有关整个平台的高层概览，请参阅[系统架构概览](/architecture/overview)。有关组件选择（邮件、视频、文件）的比较，请参阅[组件替代方案](/architecture/component-alternatives)。

## 认证链

平台使用三层认证架构。每层有明确的责任，层与层之间的边界就是系统的安全边界。

### 第一层：联邦层（外部）

最外层是身份联邦。在德国，这是 DFN-AAI（Deutsches Forschungsnetz — Authentication and Authorization Infrastructure），由 DFN-Verein 运营。DFN-AAI 通过 SAML 2.0 元数据交换将大学身份提供者（IdP）与服务提供者（SP）连接起来。它本身是 eduGAIN 的一部分，eduGAIN 是全球互联联邦，将信任网络扩展到全球参与的机构。

当德国大学的学生登录时，他们的浏览器被重定向到所属机构的 IdP（通常是 Shibboleth IdP）。IdP 认证用户（通过机构的本地方法——LDAP、密码、MFA），并发布包含用户属性的 SAML 断言：姓名、电子邮件、从属关系和所属机构。此断言通过联邦传回平台的服务提供者端点。

联邦层是信任根。平台不直接认证用户——它信任联邦的断言。这意味着没有大学需要在平台上创建或管理账户；现有的机构账户自动可用。

### 第二层：身份代理（Keycloak）

Keycloak 位于平台身份堆栈的中心。它同时充当 SAML 服务提供者（面向联邦）和 OpenID Connect（OIDC）身份提供者（面向内部服务）。这种双重角色是架构的关键：它使平台能够对外使用 SAML，同时对自己的服务使用 OIDC。

通过 Keycloak 的认证流程如下：

1. **服务重定向到 Keycloak**：当用户访问服务（例如 Nextcloud、Moodle）时，服务检查是否存在有效会话。如果不存在，它将用户重定向到 Keycloak 的授权端点，附带 OIDC 授权请求。
2. **Keycloak 检查现有会话**：如果用户已有 Keycloak 会话（来自之前的服务登录），Keycloak 立即发出 OIDC 令牌。这就是单点登录（SSO）——用户认证一次即可访问所有服务。
3. **Keycloak 重定向到联邦**：如果没有会话，Keycloak 将用户重定向到配置的身份代理（DFN-AAI / eduGAIN）。用户通过发现界面选择其所属机构，并在其机构 IdP 进行认证。
4. **联邦返回 SAML 断言**：IdP 发布包含用户属性的 SAML 断言。Keycloak 接收此断言，根据联邦元数据进行验证，并创建带有映射属性的本地用户会话。
5. **Keycloak 发出 OIDC 令牌**：Keycloak 将 SAML 属性转换为 OIDC 声明，并向请求服务发出访问令牌、刷新令牌和 ID 令牌。服务使用这些令牌来识别用户并执行授权。

此流程对用户是透明的。他们看到机构登录页面，然后就进入了平台。SAML 到 OIDC 的转换、属性映射和令牌发出都在后台发生。

### 第三层：服务层（内部）

平台中的每个服务通过两种协议之一接收用户身份：

- **OpenID Connect（OIDC）**：现代服务（Nextcloud、OpenProject、XWiki、Planka、Zammad、CryptPad、OpenCloud）直接连接到 Keycloak，使用标准 OIDC 授权码流程。它们接收 JWT 访问令牌和 ID 令牌，并根据 Keycloak 的公钥进行验证。

- **SAML 2.0**：需要专用 SAML 服务提供者的教育服务（ILIAS、Moodle、BigBlueButton）使用 Shibboleth 作为 SP。Shibboleth 位于 Keycloak 和服务之间，将 Keycloak 的 SAML 断言转换为每个应用程序期望的格式。每个服务都有自己的 Shibboleth 配置，具有特定于服务的属性过滤器。

协议的选择由服务而非平台决定。支持 OIDC 的服务直接使用它；只支持 SAML 的服务在前面加上 Shibboleth SP。Keycloak 同时处理两种协议。

## 联邦集成

### DFN-AAI

DFN-AAI 是德国国家学术身份联邦。它通过 SAML 2.0 元数据交换连接了超过 400 所大学和研究机构。对于 openDesk Edu，与 DFN-AAI 集成意味着：

- **实体 ID 注册**：平台的 Keycloak 实例在 DFN-AAI 联邦元数据中注册为服务提供者。此注册包括实体 ID、断言消费服务（ACS）URL 和签名证书。
- **元数据交换**：平台消费 DFN-AAI 联邦元数据（一个签名的 XML 文件，列出所有受信任的 IdP）并发布自己的 SP 元数据。Keycloak 按可配置的时间表自动刷新联邦元数据。
- **属性发布**：每个机构 IdP 配置它向平台发布哪些属性。平台请求一组标准 eduGAIN 属性（参见下面的属性映射），但 IdP 最终根据其自身策略决定发布什么。

### eduGAIN

eduGAIN 是连接国家联邦（德国的 DFN-AAI、瑞典的 SWAMID、美国的 InCommon、英国的 UK Access Management Federation 等）的全球互联联邦。通过 eduGAIN，来自任何参与联邦的用户都可以向平台认证——不仅限于德国机构。

平台的 DFN-AAI 注册自动包含 eduGAIN 参与。无需单独注册；eduGAIN 元数据嵌入在 DFN-AAI 元数据源中。

### 多联邦场景

机构可能需要同时接受来自多个国家联邦的用户——例如，一所德国大学与瑞典和荷兰合作伙伴合作。Keycloak 通过多个身份代理配置支持这一点：

- 每个联邦在 Keycloak 中配置为单独的身份提供者
- 登录页面呈现一个 IdP 发现界面，用户在其中选择其联邦和所属机构
- Keycloak 将认证请求路由到所选联邦
- 返回时，Keycloak 规范化属性（不同联邦可能使用略有不同的属性名称）并创建本地会话

这种多联邦设置是配置，不是代码。添加新联邦就是导入其元数据并在 Keycloak 管理控制台中配置属性映射器。

## 属性映射

当用户通过联邦认证时，其 IdP 发布一组 SAML 属性。Keycloak 将这些映射到内部用户属性，然后映射到服务消费的 OIDC 声明。映射是关键路径：如果属性不能正确到达，用户无法认证，角色不会分配，个性化会失败。

### 标准 eduGAIN 属性

| 属性 | 描述 | Keycloak 映射 | OIDC 声明 |
|-----------|-------------|------------------|------------|
| `eduPersonPrincipalName` | 唯一持久用户标识符 | `eppn` | `eppn` |
| `mail` | 电子邮件地址 | `email` | `email` |
| `displayName` | 完整显示名称 | `name` | `name` |
| `givenName` | 名字 | `firstName` | `given_name` |
| `sn` | 姓氏 | `lastName` | `family_name` |
| `eduPersonAffiliation` | 角色（student、staff、faculty、member） | `affiliation` | `affiliation` |
| `eduPersonScopedAffiliation` | 带作用域的从属关系 | `scopedAffiliation` | `scoped_affiliation` |
| `eduPersonEntitlement` | 权限 URN（组成员身份） | `entitlement` | `entitlement` |
| `preferredLanguage` | 语言偏好 | `locale` | `locale` |
| `schacHomeOrganization` | 所属机构域名 | `organization` | `home_organization` |

前五个属性（eppn、mail、displayName、givenName、sn）是 DFN-AAI 注册的必填属性。其余五个是推荐属性，可增强用户体验但不是基本认证所必需的。

### 属性映射器配置

Keycloak 使用属性映射器在 SAML 和 OIDC 之间进行转换。每个映射器定义：

- **源属性**：来自联邦的 SAML 属性名称（使用 `urn:oasis:names:tc:SAML:2.0:attrname-format:uri` 格式）
- **目标声明**：服务接收的 OIDC 声明名称
- **转换**：可选——某些属性需要规范化（例如，从 `eduPersonScopedAffiliation` 中截取作用域以提取从属关系值）

映射器在 Keycloak 的域设置中配置一次，适用于所有服务。这集中了属性处理——服务不需要了解 SAML 或联邦属性；它们接收标准 OIDC 声明。

## 协议双栈：SAML 和 OIDC

平台同时运行 SAML 2.0 和 OpenID Connect。这不是冗余——这是由高等教育中异构服务景观所驱动的必要性。

### 为什么两种协议

现代 Web 应用程序（Nextcloud、OpenProject、Zammad、CryptPad）原生支持 OIDC。OIDC 提供 JSON Web 令牌（JWT）、更简单的配置界面以及对移动和 SPA 客户端的更好支持。对于这些服务，OIDC 是自然的选择。

然而，许多教育专用应用程序（ILIAS、Moodle、BigBlueButton）具有经过多年联邦工作建立的深度 SAML 集成。它们的认证插件期望 SAML 断言、SP 发起的流程和特定格式的属性声明。将它们重写为使用 OIDC 将是一项重大工作，并会破坏与现有联邦设置的兼容性。

Keycloak 通过同时使用两种协议来解决这个问题。它从联邦接收 SAML，并可以向下游服务发出 SAML 或 OIDC。需要 SAML 的服务获得 Shibboleth SP；偏好 OIDC 的服务直接连接到 Keycloak。

### Shibboleth 服务提供者

Shibboleth 充当需要它的服务的 SAML SP。流程如下：

1. 用户访问基于 SAML 的服务（例如 Moodle）
2. 服务重定向到 Shibboleth SP
3. Shibboleth SP 重定向到 Keycloak（充当 IdP）
4. Keycloak 认证用户（如果没有会话则通过联邦，如果有会话则通过 SSO）
5. Keycloak 向 Shibboleth SP 发出 SAML 断言
6. Shibboleth SP 将断言及其期望的属性传递给服务

每个基于 SAML 的服务都有自己的 Shibboleth SP 配置，具有特定于服务的属性过滤器。这意味着 ILIAS、Moodle 和 BigBlueButton 各自只接收它们需要的属性——而不是联邦的完整属性集。

## Nubus：面向用户的门户

虽然 Keycloak 处理协议级认证，但 Nubus 提供身份堆栈的面向用户层。Nubus（v1.18.1，AGPL-3.0）是一个自助服务门户，位于 Keycloak 前面，为最终用户提供一个管理身份的单一位置。

### Nubus 的功能

- **自助密码重置**：用户可以通过验证流程（电子邮件或安全问题）重置密码，无需联系管理员
- **个人资料管理**：用户查看和编辑其个人资料（显示名称、电子邮件、语言偏好）
- **组管理**：用户可以查看其组成员身份，并在允许的情况下加入或离开组
- **应用启动器**：可用服务的仪表板，带有直接链接，绕过登录流程（SSO 处理认证）
- **审计日志**：管理操作被记录用于合规和故障排除

### Keycloak 的功能（vs. Nubus）

Keycloak 仍然是身份提供者。它处理：
- 联邦（SAML 到 DFN-AAI/eduGAIN）
- 令牌发出（OIDC 到服务）
- 会话管理（跨服务 SSO）
- 协议代理（SAML ↔ OIDC）
- 用户属性存储和映射

Nubus 不取代 Keycloak——它封装了 Keycloak。Nubus 调用 Keycloak 的管理 REST API 来执行面向用户的操作，提供比 Keycloak 自己的管理控制台（为管理员而非最终用户设计）更友好的界面。

## 安全边界和故障模式

### 信任边界

平台有三个信任边界：

1. **联邦 → 平台**：平台信任联邦的 SAML 断言。如果 DFN-AAI IdP 断言用户是 `max.mustermann@uni-example.de`，从属关系为 `student`，平台接受这一点。信任锚定在联邦元数据中，该元数据经过加密签名。

2. **Keycloak → 服务**：服务信任 Keycloak 的 OIDC 令牌。每个服务根据 Keycloak 的公钥验证 JWT 签名。服务永远不会直接看到联邦属性——它只看到 Keycloak 发出的规范化 OIDC 声明。

3. **用户 → IdP**：用户使用其机构提供的方法（密码、MFA、智能卡）向其所属 IdP 认证。平台对这种交互没有可见性。

### 故障模式

**IdP 不可用**：如果用户的所属 IdP 宕机，联邦登录失败。Keycloak 显示错误消息。本地配置的用户（管理员、服务账户）仍然可以通过 Keycloak 的本地登录直接登录，因此平台保持可管理。

**联邦元数据过期**：联邦元数据有一个有效期。如果平台的副本过期（例如，DFN-AAI 轮换了其签名密钥而平台未刷新），所有联邦用户的认证都会失败。Keycloak 按可配置的时间表（通常每 6-12 小时）自动刷新元数据，但管理员应监控元数据的新鲜度。

**属性不足**：如果 IdP 发布的属性少于预期（例如，缺少 `eduPersonAffiliation`），Keycloak 的映射器会优雅地处理差距——用户被认证但可能功能受限（没有基于角色的访问控制，没有个性化界面）。平台记录缺失的属性，以便管理员与 IdP 合作发布它们。

**令牌过期**：OIDC 访问令牌的寿命很短（通常 5-15 分钟）。服务使用刷新令牌来获取新的访问令牌，而无需重新认证。如果刷新令牌也过期，用户将再次通过完整的认证流程。如果用户有活动的 Keycloak 会话（SSO），这对用户是透明的。

## 本地用户账户

并非所有用户都来自联邦。平台支持在 Keycloak 中本地配置的账户，用于：

- **管理员**：需要独立于联邦状态访问的平台运营者
- **服务账户**：通过客户端凭证认证的自动化系统（无交互式登录）
- **测试用户**：在配置联邦之前用于测试和评估的账户

本地账户在 Keycloak 管理控制台或通过 Nubus 门户管理。它们与联邦账户共存——两种类型可以同时活跃，同一用户可以同时拥有联邦和本地身份（虽然这不常见，需要仔细的属性映射以避免重复）。

## 合规和数据保护

身份架构按照数据保护原则设计：

- **最小属性发布**：平台只请求它需要的属性。它不存储来自联邦的敏感属性（例如，身份证号码、生物识别数据）。
- **联邦用户不存储密码**：平台永远不会看到或存储用户的机构密码。认证在 IdP 进行；平台只接收断言。
- **GDPR/DSGVO 对齐**：用户数据（姓名、电子邮件、从属关系）用于认证和服务提供目的进行处理。机构作为数据控制者负责其处理的法律依据。
- **审计跟踪**：Keycloak 记录认证事件（成功和失败的登录、令牌发出、会话创建）。这些日志支持事件调查和合规证据。

有关平台安全和合规的更广泛视图，请参阅[安全架构](/architecture/security)文章。

---

## 延伸阅读

- [系统架构概览](/architecture/overview) — 完整的平台架构
- [组件替代方案](/architecture/component-alternatives) — 邮件、视频、文件存储和白板选择
- [面向教育的联邦身份](/blog/dfn-aai-federation-shared-evaluation) — 关于 DFN-AAI 集成和共享评估实例呼吁的博客文章
- [网络和流量架构](/architecture/networking-traffic-flow) — 流量如何进入集群并到达服务
- [存储和数据管理架构](/architecture/storage-data-management) — 持久存储、数据库和备份集成

---

*认证是每个服务的门户。如果它运行正常，用户永远不会想到它。如果它出错了，其他一切都无关紧要。*
