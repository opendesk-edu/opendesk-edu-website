---
title: "ZKI IT-Grundschutz 合规：openDesk Edu 迈向高等教育安全基线的旅程"
date: "2026-08-01"
description: "openDesk Edu 正在系统地对齐 ZKI IT-Grundschutz 配置文件——BSI 基线的高等教育适配版——通过可执行的 Kyverno 策略、加固的 GitOps 流水线和透明的差距分析。以下是我们的进展。"
categories: ["安全", "合规"]
tags: ["zki", "it-grundschutz", "bsi", "合规", "kyverno", "安全", "高等教育", "isms"]
image: "/static/blog/zki-it-grundschutz-compliance-teaser.svg"
---

# ZKI IT-Grundschutz 合规：openDesk Edu 迈向高等教育安全基线的旅程

> **基线：** 每个德国大学 IT 中心都按照 ZKI IT-Grundschutz 配置文件工作——这是 BSI IT-Grundschutz 方法论的高等教育适配版。
>
> **现实：** 对于一个由 一套全面的开源服务组成的平台，合规不是一次性勾选的复选框。它是一项必须持续执行的架构属性——通过策略、流水线和透明的文档。
>
> **我们的方法：** 我们没有写一份合规声明，而是构建了一个合规系统：20 多个可执行的 Kyverno 策略、一条加固的 GitOps 流水线，以及一份公开的差距分析，精确展示我们的位置——包括差距本身。

## 什么是 ZKI IT-Grundschutz 配置文件？

**ZKI IT-Grundschutz 配置文件**是德国高等教育机构的信息安全参考框架。它将**BSI IT-Grundschutz**方法论——德国联邦信息安全基线——适配到大学的特定现实：

- **研究数据**具有独特的保护要求
- **学生数据和考试系统**需要特殊处理规则
- **开放协作**必须在安全控制下保持可能
- **跨院系和研究所的分散管理**

BSI IT-Grundschutz 为所有组织提供通用模块，而 ZKI 配置文件则针对大学运营进行定制——与 DSGVO/GDPR、HDSG 以及德国高等教育信息安全标准 ISIS12 对齐。

对 openDesk Edu 而言，这不是理论练习。德国大学不能采用一个不符合自身 IT 中心所依据的安全基线的数字工作场所平台。

## openDesk Edu 已处于什么水平

在编写任何新策略之前，我们审计了平台已经执行的内容。结果令人鼓舞——许多 ZKI 措施已通过设计实现：

### 身份与访问管理 ✅
- **Keycloak** 作为中央身份提供商，支持 OIDC 和 SAML
- **联合身份** 通过 Shibboleth 和 DFN-AAI
- **多因素认证**、密码策略和账户锁定
- **基于角色的访问控制** 具有细粒度权限
- **会话管理** 具有可配置超时

### 网络安全 ✅
- **HAProxy** 入口，支持 TLS 终止
- **Traefik** 作为额外的入口层
- **网络策略** 限制服务间流量
- **Pod 安全准入（PSA）** 在集群范围内执行
- 跨命名空间的网络分段

### 系统加固 ✅
- **非 root 容器**（`runAsNonRoot: true`）
- **能力丢弃**（`drop: ["ALL"]`）
- **只读根文件系统**（适用时）
- **Seccomp 配置文件**（`RuntimeDefault`）
- **每个工作负载的资源限制**

### 数据保护 ✅
- **Ceph 存储** 支持静态加密
- **k8up 备份运算符** 搭配 restic——加密、定时、经过测试
- **保留策略** 和 PVC 备份注释
- **Git 中的 SOPS 加密密钥**

### 可观测性 ✅
- **Prometheus** 用于指标
- **Grafana** 用于仪表板
- **Loki** 用于集中日志聚合
- **Alertmanager** 用于告警路由

## 差距：从良好实践到强制执行合规

强大的默认姿态是必要的——但还不够。ZKI 合规要求安全属性必须被*执行*、*可验证*且*持续验证*。这正是我们识别差距的地方。

### 111 点检查清单

我们将相关的 ZKI/BSI 模块转化为**111 个具体检查点**，分布在十个类别中，每个都映射到 BSI 模块和优先级：

| 优先级 | 类别 | 状态 |
|--------|------|------|
| **P0** | 身份与访问管理 | ⚠️ 部分 |
| **P0** | 网络安全 | ✅ 良好 |
| **P0** | 数据保护 | ⚠️ 部分 |
| **P1** | 审计与日志 | ⚠️ 部分 |
| **P1** | 事件响应 | ❌ 缺失 |
| **P1** | 变更管理 | ⚠️ 部分 |
| **P2** | 应用安全 | ⚠️ 部分 |
| **P2** | 物理安全 | ✅ 良好 |
| **P2** | 意识与培训 | ❌ 缺失 |

我们的内部起点（自我评估，非认证审计）：**约 37% 的总体合规率**，在平台已运行的领域，BSI 模块覆盖率约 **81%**。这些数字是内部估算，不是官方审计结论。

## 我们构建的内容：策略即代码

实现的核心是**20 多个 Kyverno ClusterPolicy**，将合规要求转化为可执行的准入控制。部署到集群的每个工作负载都会针对这些策略进行验证——在到达运行时之前。

### Pod 安全（8 个策略）

| 策略 | 强制执行内容 | BSI 模块 |
|------|--------------|----------|
| `zki-require-non-root` | 禁止 root 容器 | INF.1 |
| `zki-require-readonly-rootfs` | 不可变的根文件系统 | INF.1 |
| `zki-drop-all-capabilities` | 丢弃所有 Linux 能力 | INF.1 |
| `zki-require-seccomp` | 必须使用 Seccomp 配置文件 | INF.1 |
| `zki-prevent-privilege-escalation` | 禁止特权提升 | INF.1 |
| `zki-restrict-capabilities` | 禁止重新添加能力 | INF.1 |
| `zki-require-pod-security-context` | Pod 安全上下文必填 | INF.1 |
| `zki-require-sidecar-logging` | 强制日志 Sidecar | INF.1 |

### 网络安全（4 个策略）

| 策略 | 强制执行内容 | BSI 模块 |
|------|--------------|----------|
| `zki-require-network-policy` | 每个命名空间都需要 NetworkPolicy | INF.5 |
| `zki-default-deny-all` | 默认拒绝所有流量 | INF.5 |
| `zki-restrict-ingress-to-haproxy` | 入口仅通过 HAProxy | INF.5 |
| `zki-require-tls-for-ingress` | 所有入口必须使用 TLS | INF.5 |

### 访问控制（3 个策略）

| 策略 | 强制执行内容 | BSI 模块 |
|------|--------------|----------|
| `zki-restrict-host-path` | 禁止 hostPath 卷 | INF.1 |
| `zki-restrict-host-network` | 禁止 hostNetwork | INF.1 |
| `zki-require-loki-labels` | 强制日志标签 | INF.1 |

### 数据保护（3 个策略）

| 策略 | 强制执行内容 | BSI 模块 |
|------|--------------|----------|
| `zki-require-storage-encryption` | 仅允许加密存储 | DS |
| `zki-require-data-classification` | 数据分类标签 | DS |
| `zki-k8up-backup-annotation` | 必须添加备份注释 | DS |

### 应用安全（2 个策略）

| 策略 | 强制执行内容 | BSI 模块 |
|------|--------------|----------|
| `zki-require-security-headers` | 安全头（CSP、HSTS、X-Frame-Options） | INF.14 |
| `zki-require-probe-timeouts` | 正确的探针配置 | INF.14 |

所有策略首先以**审计模式**运行，在 CI 中针对真实工作负载进行验证，然后才提升为强制执行。策略违规通过 PolicyReports 报告并在监控栈中呈现。

## 治理：让合规成为现实的文档

没有治理的策略只是装饰。我们写了相应的治理层：

### IT 安全政策（14 章）

安全政策涵盖目的和范围、安全原则、组织结构、访问控制、网络安全、系统安全、数据保护、应用安全、事件管理、业务连续性、合规、意识、例外和维护——与 BSI IT-Grundschutz 模块和 ISO/IEC 27001:2022 对齐。

### 事件响应计划（BSI 标准 200-3）

四级事件分类矩阵（0-3 级）、六阶段响应流程、DSGVO 违规通知程序以及十个沟通模板。与 BSI 200-3、NIST SP 800-61 和 ISO/IEC 27035 对齐。

### GitOps 作为变更管理

openDesk Edu 的变更管理*就是*其 GitOps 流水线：

- **ArgoCD** 用于声明式、可审计的部署
- **PR 纪律**——代码变更和图表变更绝不混合
- **版本固定**——镜像按摘要固定
- **SOPS** 用于 Git 中的密钥，使用 age/OpenPGP 加密
- **REUSE 合规**，每个文件都有 SPDX 头

每个变更都是一个提交；每个提交都是一条审计轨迹。

## 剩余的 P0 工作：生产前必须完成的事项

我们对尚未完成的工作保持透明。五个关键（P0）项目位于当前状态与全面生产执行之间：

1. **法律和机构批准**——DPO、法律部门和大学管理层必须批准安全政策框架（唯一的真正障碍）。
2. **Kyverno Webhook 认证**——为准入 webhook 配置 TLS 和客户端证书，确保策略无法被绕过。
3. **Kyverno 策略备份**——所有策略的自动化、可恢复备份（合规证明需要它）。
4. **策略变更管理流程**——文档化的请求、审查和批准工作流。
5. **策略紧急禁用程序**——受控、可记录且可逆的紧急程序。

## 通往 90%+ 的路线图

我们的路线图是具体的——大约十六周内分四个阶段：

| 阶段 | 重点 | 目标 |
|------|------|------|
| **准备** | 完成所有 P0 行动 | 生产就绪 |
| **阶段 1** | 基础：ISMS、风险管理 | 60% 合规 |
| **阶段 2** | 运营：日志、事件响应、补丁管理 | 75% 合规 |
| **阶段 3** | 高级：mTLS、SIEM、漏洞管理 | 85% 合规 |
| **阶段 4** | 成熟：IDS/IPS、WAF、意识项目 | **90%+ 合规** |

## 那么使用 Microsoft 365 能达到多远？

我们在大学评估中经常听到一个问题：*“使用 Microsoft 365 难道不能达到同样的合规水平吗？”* 诚实的回答值得单独一节——因为在很大程度上答案是*是的*，而差距本身很有启发性。

### M365 覆盖良好的部分

Microsoft 365 结合完整的合规技术栈（Entra ID P2、Purview、Defender、Compliance Manager），根据我们的估算可以合理地直接满足 **~60–70% 的 111 个检查点**（内部估算，非官方审计）：

- **身份与访问管理**——开箱即用甚至比自建 Keycloak 方案更强大：MFA、条件访问、特权身份管理、细粒度 RBAC。
- **数据保护**——Purview 敏感度标签、跨 Exchange/SharePoint/Teams/端点的 DLP、保留和法律保留、客户托管密钥、Customer Lockbox。
- **设备加固**——Intune 合规策略、BitLocker、补丁环覆盖客户端。
- **物理安全**——由微软数据中心及其 BSI C5 Type 2 和 ISO 27001 认证覆盖。

### M365 无法覆盖的部分

另外 **约 15–20%** 只能通过*供应商认证*而非自我执行来实现——这是 IT-Grundschutz 云模块 OPS.3.1 下公认的桥梁。而 **约 10–15% 的结构性残留** 是任何租户配置都无法弥合的：

| 领域 | 为什么仅靠 M365 无法达到 |
|------|--------------------------|
| 网络安全（INF.5） | 你没有自己的网络可以分段——租户级控制（条件访问、外部共享）无法替代自己的分段和防火墙。 |
| 系统加固（INF.1） | 没有 Pod、没有 seccomp、没有能力丢弃——工作负载加固检查项直接失效。 |
| 完整可审计性 | 统一审计日志有边界（默认 90 天）、存在记录缺口，且保存在微软云中而非你自己的 Loki/SIEM 中。 |
| 主权 | 欧盟数据边界（EU Data Boundary）解决的是*存储位置*，不是*管辖权*——美国当局仍可强制访问（CLOUD Act）。BSI 在 2023 年发布了一份关于[在公共行政中使用 Microsoft 365 的通知](https://www.bsi.bund.de/SharedDocs/CyberSicherheitswarnungen/TechnischeWarnungen/2023/Hinweis_Microsoft_365_public_cloud.html)，强调了这些风险。 |
| 自托管服务 | ILIAS、Moodle、JupyterHub、Nextcloud、Matrix 没有 M365 对应物——它们运行在你自己的基础设施上，需要本文描述的 Kyverno/GitOps/k8up 处理。 |
| 备份 | 原生保留不等于备份——你需要第三方工具（Veeam、AvePoint 等）。 |

### 诚实的定位

**混合路径**是德国高校实际运行的方案：M365 A3/A5 用于协作、主权开源服务用于敏感工作负载、第三方备份、Sentinel 作为 SIEM，以及你自己的治理文档。根据我们的估算，这可以达到 ~85–90% 的范围——但这不再是纯粹的 M365 故事，最后 ~10% 是政策问题，而非技术问题。

所以"使用 M365 能走多远？"的答案是：*~70% 的控制通过微软合规栈实现，~20% 通过 BSI C5 认证实现，~10% 的结构性残留需要主权决策——而这个残留恰恰就是 openDesk 存在的原因。*（所有百分比均为内部估算，非认证审计值。）

## 为什么这对大学很重要

对于评估 openDesk Edu 的大学，合规故事在三个方面具体重要：

1. **它是可验证的。** 差距分析、策略和路线图都是公开的。您不必相信营销声明——您可以检查策略代码。
2. **这是您的基线，不是供应商的。** ZKI IT-Grundschutz 是*您的* IT 中心所依据的框架。对齐意味着 openDesk Edu 与您的机构使用相同的安全语言。
3. **它是持续的。** 合规在流水线中执行，而不是在文档中断言。当平台变化时，策略会自动执行基线。

## 参与贡献

ZKI 合规工作与 openDesk Edu 的其他一切一样都是开源的。如果您的机构有 BSI IT-Grundschutz、ZKI 工作组或 ISIS12 的经验——或者如果您想帮助填补剩余的 P0 差距——我们欢迎您的审查。

**探索代码仓库，审查策略，帮助我们达到 90%+。**

[访问 opendesk-edu.org 获取架构文档和部署指南](https://opendesk-edu.org)

---

## 说明和来源

- **非官方审计：** 本文中提到的百分比数据（37%、81%、60–70%、85–90%）是 openDesk Edu 团队的内部自我评估，不是认证审计结论，也不是 BSI 或 ZKI 的官方评估。
- **无 ZKI 或 BSI 背书：** 在策略名称中使用"ZKI"（例如 `zki-require-non-root`）是对 ZKI IT-Grundschutz 配置文件的引用，不是 ZKI 或 BSI 的官方认证或推荐。openDesk Edu 未通过 ZKI 或 BSI 的认证。
- **商标声明：** 本文中提到的所有产品和服务名称（Microsoft 365、Entra ID、Purview、Defender、Compliance Manager、Sentinel、Veeam、AvePoint、Keycloak、ArgoCD、Shibboleth、DFN-AAI、Loki、Prometheus、Grafana、BitLocker、Intune、ILIAS、Moodle、JupyterHub、Nextcloud、Matrix）均为其各自所有者的商标或注册商标。提及它们仅供信息和技术描述之用。
- **来源：** [BSI 关于 Microsoft 365 的通知（2023）](https://www.bsi.bund.de/SharedDocs/CyberSicherheitswarnungen/TechnischeWarnungen/2023/Hinweis_Microsoft_365_public_cloud.html) · [BSI IT-Grundschutz](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/IT-Grundschutz_node.html) · [BSI C5 认证](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Cloud-Computing/C5/c5_node.html) · [CLOUD Act](https://www.congress.gov/bill/115th-congress/house-bill/4943)
- **比较性声明：** 与 Microsoft 365 的比较仅供信息参考，并非旨在贬低 Microsoft 或其产品。所提及的 Microsoft 365 属性基于其公开文档。
