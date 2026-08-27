---
title: "安全架构"
date: "2026-08-27"
description: "openDesk Edu 的安全架构——使用 SOPS 和 age 加密的密钥管理、网络策略、RBAC、审计日志以及到 BSI IT-Grundschutz、GDPR 和 ISO 27001 的合规框架映射。"
categories: ["architecture", "infrastructure", "security"]
tags: ["architecture", "security", "sops", "rbac", "network-policies", "audit-logging", "compliance", "bsi", "gdpr", "iso-27001", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/security-architecture-teaser.svg"
---

# 安全架构

安全不是单一功能——它是一个涵盖密钥、网络隔离、访问控制、审计跟踪和合规框架的分层架构。本文将平台的安全模型整合到一个参考中：密钥如何管理、访问如何控制、流量如何隔离，以及架构如何映射到认可的合规框架。

有关认证用户的身份层，请参阅[身份与认证架构](/architecture/identity-authentication)。有关流量如何进入和路由，请参阅[网络和流量架构](/architecture/networking-traffic-flow)。有关数据存储和备份，请参阅[存储和数据管理架构](/architecture/storage-data-management)。

## 密钥管理

### GitOps 中密钥的问题

GitOps 工作流将所有配置存储在 Git 中——包括 Helm chart、values 文件和部署清单。但某些配置包含密钥：数据库密码、API 密钥、TLS 私钥和认证令牌。以明文形式存储在 Git 中是安全风险：任何有仓库访问权限的人都可以读取它们，而且 Git 历史会永久保存它们。

### 使用 age 加密的 SOPS

平台使用 SOPS（Secrets OPerationS）和 age 加密来管理 Git 中的密钥。SOPS 加密密钥键的值，同时将键名和结构保留为明文。这意味着：

- **密钥文件结构可见**——运维人员可以看到存在哪些密钥，而无需解密
- **密钥值已加密**——没有 age 私钥，只有值是不可读的
- **Git 历史安全**——旧提交中的加密值保持加密

age 加密密钥存储在 Git 之外（通常在部署服务器或硬件安全模块上）。GitOps 控制器（ArgoCD）使用 CMP（Config Management Plugin）sidecar 在部署时解密密钥。解密发生在集群中，解密后的密钥永远不会写入磁盘或 Git。

### ArgoCD CMP Sidecar 模式

解密流程如下：

1. **Git 中的加密密钥**：SOPS 加密的密钥文件与其它配置一起存储在 Git 仓库中
2. **ArgoCD 检测变更**：ArgoCD 监控 Git 仓库，检测密钥文件何时变更
3. **CMP sidecar 解密**：Config Management Plugin sidecar 在 ArgoCD 仓库服务器 pod 中运行。它接收加密密钥，使用 age 私钥解密，并生成 Kubernetes Secret 清单
4. **创建 Kubernetes Secret**：解密后的 Secret 清单应用到集群。Secret 只存在于集群的 etcd 中，从不存在于 Git 中
5. **Pod 挂载 Secret**：应用 pod 在其部署清单中引用 Secret，并将其挂载为环境变量或文件

此模式确保：
- Git 中不存在明文密钥（只有加密值）
- 集群外的磁盘上不存在明文密钥（age 密钥是独立的）
- 解密在部署时发生，而非构建时
- age 密钥可以轮换而无需重新加密所有密钥（age 支持接收者轮换）

### 密钥轮换

密钥应定期轮换。平台的方法：

- **数据库密码**：通过生成新密码、更新 SOPS 加密密钥并让 ArgoCD 部署变更来轮换。数据库在转换期间短暂接受旧密码和新密码。
- **API 密钥**：由发出密钥的服务轮换。旧密钥在新密钥部署后撤销。
- **TLS 私钥**：与证书续订一起轮换（参见[网络和流量架构](/architecture/networking-traffic-flow)了解证书管理）。
- **age 加密密钥**：通过生成新密钥、用新密钥重新加密所有密钥并更新 ArgoCD CMP sidecar 来轮换。这是维护窗口操作。

## 网络安全和隔离

### 网络策略

平台使用 Kubernetes 网络策略来强制网络分段。默认拒绝模型意味着所有 pod 间流量都被拒绝，除非明确允许。有关网络策略和流量路径的详细描述，请参阅[网络和流量架构](/architecture/networking-traffic-flow)。

从安全角度来看，网络策略提供：

- **爆炸半径遏制**：如果一个 pod 被攻破，攻击者无法到达其他 pod，除非网络策略允许
- **最小权限**：每个服务只能到达它需要的特定服务和端口
- **审计跟踪**：网络策略是声明式的（存储在 Git 中），因此网络安全态势是版本化且可审查的

### 命名空间隔离

服务在独立的 Kubernetes 命名空间中运行，提供逻辑隔离：

- 每个主要服务（或相关服务组）有自己的命名空间
- 跨命名空间流量需要明确的网络策略
- 资源配额可以按命名空间应用，以防止被攻破的服务消耗所有集群资源

### 传输中加密

所有外部流量都使用 TLS 加密（参见[网络和流量架构](/architecture/networking-traffic-flow)了解 TLS 详情）。内部 pod 间流量默认不加密，但可以升级为 mTLS（双向 TLS）用于需要的服务。

### 静态加密

静态数据通过以下方式加密：

- **PersistentVolume**：取决于存储类。Ceph 支持加密卷。本地和 NFS 存储依赖底层存储加密（例如节点上的 LUKS）。
- **数据库存储**：PersistentVolume 上的数据库文件继承 PV 加密。应用级加密（例如 PostgreSQL 中的列级加密）是服务特定的。
- **备份**：所有 restic 备份都使用可配置密钥加密。备份密钥与用于 GitOps 密钥的 age 加密密钥是分开的。

## 基于角色的访问控制（RBAC）

平台有两层 RBAC：用于集群操作的 Kubernetes RBAC 和用于应用级访问的 Keycloak RBAC。

### Kubernetes RBAC

Kubernetes RBAC 控制谁可以对集群资源执行什么操作。平台定义了三个级别的角色：

- **集群管理员**：对所有集群资源的完全访问。由平台运维人员用于集群级管理。
- **命名空间管理员**：对特定命名空间内资源的完全访问。由管理单个服务或服务组的服务运维人员使用。
- **只读**：查看资源的权限，不可修改。用于监控、审计和调试。

每个角色通过 RoleBinding（命名空间范围）或 ClusterRoleBinding（集群范围）绑定到用户或组。服务账户（由 pod 和自动化使用）获得具有最小权限的自己的角色。

### Keycloak RBAC

Keycloak 通过 realm 角色和客户端角色管理应用级访问：

- **Realm 角色**：在 Keycloak realm 级别定义的角色（例如 `admin`、`user`、`student`、`staff`）
- **客户端角色**：特定于服务的角色（例如 `nextcloud-admin`、`moodle-teacher`）
- **组成员身份**：用户可以是组的成员，组授予跨多个服务的角色

当用户认证时（参见[身份与认证架构](/architecture/identity-authentication)），Keycloak 在 OIDC 令牌中包含其角色。服务读取这些角色并强制访问控制：

- **Nextcloud**：检查 Keycloak 角色以确定管理员 vs 用户访问
- **Moodle**：将 Keycloak 角色映射到课程角色（教师、学生、管理员）
- **OpenProject**：将 Keycloak 角色映射到项目权限

### 最小权限原则

Kubernetes RBAC 和 Keycloak RBAC 都遵循最小权限原则：

- **Kubernetes**：服务账户只有运行所需的最小权限。读取 ConfigMap 的服务没有删除 Pod 的权限。
- **Keycloak**：用户只有其功能所需的角色。学生没有管理员角色。教师没有集群管理员角色。
- **网络策略**：服务只能到达它需要的特定服务和端口（参见[网络和流量架构](/architecture/networking-traffic-flow)）

## 审计日志

审计日志提供谁在何时做了什么的跟踪。平台有多个审计日志来源：

### Kubernetes 审计日志

Kubernetes 可以审计记录所有对集群的 API 请求。审计日志捕获：

- **谁**：发出请求的认证用户（或服务账户）
- **什么**：被访问的资源（例如 `pods`、`secrets`、`configmaps`）
- **何时**：请求时间戳
- **如何**：HTTP 动词（GET、POST、PUT、DELETE）
- **结果**：请求是被允许还是被拒绝

审计日志在 Kubernetes API 服务器级别配置。日志可以发送到中央日志系统（例如 Loki、Elasticsearch）进行长期存储和分析。

### Keycloak 事件日志

Keycloak 记录认证事件：

- 成功和失败的登录
- 令牌签发和刷新
- 会话创建和终止
- 角色和组成员身份变更
- 联邦事件（IdP 连接、属性映射）

这些日志支持事件调查（谁在何时从何处登录）和合规证据（审计员的访问模式）。

### 应用级审计日志

每个服务维护自己的审计日志：

- **Nextcloud**：文件访问、共享、删除
- **Moodle**：课程访问、成绩变更、内容修改
- **OpenProject**：项目变更、任务分配
- **Zammad**：工单访问和修改

应用审计日志是服务特定的，存储在服务的数据库或日志文件中。它们包含在平台的备份计划中（参见[存储和数据管理架构](/architecture/storage-data-management)）。

### 中央日志聚合

对于生产部署，所有服务的日志可以聚合到中央日志系统：

- **Loki**：日志聚合，带有 Grafana 仪表板
- **Prometheus**：指标（不是日志，但与可观测性相关）
- **Alertmanager**：基于日志模式的警报（例如，重复的失败登录、异常的 API 访问）

中央日志聚合是可选的，但对于较大的部署推荐使用。它支持跨服务关联（例如"用户 X 在 Keycloak 登录，然后访问 Nextcloud，然后删除了一个文件"）和长期日志保留。

## 合规框架映射

平台的安全控制映射到认可的合规框架。此映射是事实性的——它描述了哪些架构功能满足哪些合规要求。它不是认证或认可。

### BSI IT-Grundschutz（ZKI 高等教育配置文件）

BSI IT-Grundschutz 是德国联邦安全标准。ZKI（Zentrum für Konsortiale IT-Dienste）高等教育配置文件为大学调整了 IT-Grundschutz。平台的安全控制映射到多个 IT-Grundschutz 模块：

| IT-Grundschutz 模块 | 平台控制 |
|----------------------|-----------------|
| ORP.4（认证） | DFN-AAI 联邦、Keycloak SSO、MFA 支持 |
| CON.1（加密概念） | 传输 TLS、密钥 SOPS/age、备份 restic 加密 |
| CON.6（加密密钥） | age 密钥管理、TLS 证书生命周期、密钥轮换 |
| OPS.1（操作） | ArgoCD GitOps、声明式配置、版本化变更 |
| OPS.4（管理） | Kubernetes RBAC、命名空间隔离、最小权限服务账户 |
| APP.3（Web 应用） | 安全头（HSTS、CSP、X-Frame-Options）、速率限制、输入验证 |
| SYS.1（服务器） | Kubernetes 加固、网络策略、默认拒绝模型 |
| INF.2（IT 系统） | PersistentVolume 加密、备份加密 |
| DER.4（业务连续性） | k8up 备份计划、restic 异地备份、恢复程序 |

### GDPR / DSGVO

通用数据保护条例（GDPR / DSGVO）规范个人数据的处理。平台通过以下方式支持 GDPR 合规：

- **数据最小化**：平台只从联邦请求它需要的属性（参见[身份与认证架构](/architecture/identity-authentication)了解属性映射）。它不存储来自联邦的敏感属性（例如身份证号码）。
- **联邦用户不存储密码**：平台永远不会看到或存储用户的机构密码。认证在 IdP 进行；平台只接收断言。
- **删除权**：当用户账户被移除时，平台删除所有服务中的用户数据（参见[存储和数据管理架构](/architecture/storage-data-management)了解删除过程）。
- **数据可移植性**：用户数据可以从每个服务导出（Nextcloud 文件导出、Moodle 课程导出等）。
- **审计跟踪**：Keycloak 事件日志和应用审计日志提供谁在何时访问了什么数据的证据。
- **加密**：数据在传输中（TLS）和静态中（PV 加密、备份加密）都加密。

平台是数据处理者；机构是数据控制者。机构负责处理的合法依据、数据保护影响评估和数据主体权利。平台提供技术控制来支持这些义务。

### ISO 27001

ISO/IEC 27001 是信息安全管理系统（ISMS）的国际标准。平台的控制映射到多个 ISO 27001 附录 A 控制：

| ISO 27001 控制 | 平台控制 |
|------------------|-----------------|
| A.5.15（访问控制） | Keycloak RBAC、Kubernetes RBAC、网络策略 |
| A.5.17（认证信息） | SOPS/age 密钥管理、Git 中无明文密钥 |
| A.5.18（访问权限） | 最小权限服务账户、命名空间隔离 |
| A.5.21（信息传输） | 所有传输 TLS、内部流量 mTLS（如启用） |
| A.5.30（ICT 业务连续性准备） | k8up 备份、restic 异地存储、恢复程序 |
| A.5.33（记录保护） | 审计日志（Kubernetes、Keycloak、应用级） |
| A.5.34（隐私和个人信息保护） | GDPR 合规控制（数据最小化、删除权） |
| A.8.1（用户终端设备） | 不适用（终端由机构管理，而非平台） |
| A.8.2（特权访问权限） | Kubernetes 集群管理员、命名空间管理员、只读角色 |
| A.8.3（信息访问限制） | 网络策略、RBAC、命名空间隔离 |
| A.8.4（源代码访问） | Git 仓库访问控制、ArgoCD GitOps |
| A.8.5（安全认证） | DFN-AAI 联邦、Keycloak SSO、MFA 支持 |
| A.8.7（恶意软件保护） | ClamAV 病毒扫描（如部署） |
| A.8.9（配置管理） | ArgoCD GitOps、声明式 Helm chart、版本化配置 |
| A.8.12（数据泄露防护） | 网络策略、命名空间隔离、默认拒绝模型 |
| A.8.13（信息备份） | k8up 备份计划、restic 加密备份 |
| A.8.14（信息处理冗余） | 数据库复制（MariaDB、PostgreSQL）、PV 复制（Ceph） |
| A.8.15（日志记录） | Kubernetes 审计日志、Keycloak 事件日志、应用审计日志 |
| A.8.24（密码学使用） | TLS、SOPS/age、restic 加密 |

## 安全加固清单

以下清单总结了任何部署应验证的安全控制：

- [ ] **密钥已加密**：Git 中存储的所有密钥都使用 SOPS 和 age 加密。任何 Git 仓库中无明文密钥。
- [ ] **TLS 强制执行**：所有外部流量使用 TLS 1.2+。HTTP 重定向到 HTTPS。HSTS 已启用。
- [ ] **网络策略**：默认拒绝模型已激活。每个服务都有明确的网络策略，只允许必要的流量。
- [ ] **RBAC 已配置**：Kubernetes RBAC 角色限定为最小权限。服务账户有最小权限。
- [ ] **审计日志已启用**：Kubernetes 审计日志、Keycloak 事件日志和应用审计日志已激活并正在收集。
- [ ] **备份已加密**：所有 restic 备份都已加密。备份密钥与 age 密钥分开。
- [ ] **备份监控**：Prometheus 警报配置为备份失败。上次成功备份时间戳正在监控。
- [ ] **密钥轮换程序已记录**：age 密钥、TLS 证书、数据库密码和 API 密钥有记录的轮换程序。
- [ ] **命名空间隔离**：服务在独立命名空间中运行。跨命名空间流量是明确的。
- [ ] **容器镜像已扫描**：容器镜像在部署前扫描漏洞（例如 Kubescape、Trivy）。

---

## 延伸阅读

- [身份与认证架构](/architecture/identity-authentication) — 认证链、联邦和属性映射
- [网络和流量架构](/architecture/networking-traffic-flow) — 流量、TLS、ingress 和网络策略
- [存储和数据管理架构](/architecture/storage-data-management) — 持久存储、数据库和备份集成
- [系统架构概览](/architecture/overview) — 完整的平台架构
- [安全与合规](/blog/security-compliance) — 关于平台安全和合规方法的博客文章
- [使用 ArgoCD CMP 的 SOPS 密钥管理](/blog/sops-secret-management-argocd-cmp) — 关于 SOPS + age + ArgoCD 模式的博客文章
- [BSI IT-Grundschutz 合规](/blog/zki-it-grundschutz-compliance) — 关于 BSI IT-Grundschutz 对齐的博客文章

---

*安全是分层架构，不是单一功能。每一层——密钥、网络、访问控制、审计、合规——都相互加强。没有单一层是足够的；它们一起提供纵深防御。*
