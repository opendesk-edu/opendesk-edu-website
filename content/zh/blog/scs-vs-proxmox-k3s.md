---
title: "SCS 与 Proxmox + K3s：为 openDesk Edu 选择基础平台"
date: "2026-08-06"
description: "openDesk Edu 基于 Kubernetes 构建，因此平台决策先行。面向高校的 SCS 与 Proxmox VE + K3s 中立比较：治理、认证、可移植性与运维。"
categories: ["架构"]
tags: ["scs", "sovereign-cloud-stack", "proxmox", "k3s", "kubernetes", "架构", "采购", "数字主权"]
author: "Tobias Weiß 与 openDesk Edu 贡献者"
image: "/static/blog/scs-vs-proxmox-k3s-teaser.svg"
---

# SCS 与 Proxmox + K3s：为 openDesk Edu 选择基础平台

基础平台决策先于服务决策。openDesk Edu 基于 Kubernetes 构建——其服务以 Helm Chart、GitOps 清单和容器镜像形式交付。因此，一所机构面临的实际问题不是运行哪些应用，而是如何获得一个可由小团队可持续运维的 Kubernetes 平台。本文比较德国高等教育中两种广泛采用的做法：Sovereign Cloud Stack（SCS）标准，以及由 Proxmox VE 与 K3s 组成的自运维技术栈。本文对二者进行事实性描述，并列出通常决定取舍的因素。

## 满足同一需求的两种路径

### SCS：标准而非产品

Sovereign Cloud Stack（SCS）是一个面向主权云基础设施的标准，由 Open Source Business Alliance（OSBA）主持下的社区开发。它定义了基础设施即服务（基于 OpenStack）和容器平台（Kubernetes）的可互操作层，以及供服务商和运营者采用的参考实现。

SCS 的意义在于它作用于**认证**层面。运营者可达到 SCS-compatible 或 SCS-sovereign 状态，表明其云提供标准化、可移植的接口。对公共部门机构而言，该认证与采购相关：它为比较服务商提供了有据可查的基础，并可与德国政府的容器要求等合规框架相衔接。

SCS 的关键特性是**通过标准化实现可移植性**——在某个通过 SCS 认证的平台上运行的工作负载，应当能在任何其他认证平台上运行，且接口由开放规范定义，而非由单一供应商决定。

### Proxmox VE + K3s：自运维技术栈

Proxmox VE 是一款开源虚拟化平台（基于 KVM 与 LXC），由 Proxmox Server Solutions GmbH 维护，在欧洲高等教育领域拥有庞大的社区。K3s 是一款轻量级、经 CNCF 认证的 Kubernetes 发行版，由 SUSE/Rancher 维护，专为资源受限与边缘环境设计。

二者结合构成一套务实、完全自运维的平台：Proxmox VE 负责虚拟化与存储管理，K3s 在其上提供 Kubernetes 控制平面。这种组合在大学中广受欢迎，因为它可由小团队运维、文档完善，且基础形式无订阅义务。

该路径的关键特性是**运维简单**——两个易于理解的开放源码组件、无需认证流程、对每一层拥有完全控制。

## 对比

| 维度 | SCS | Proxmox VE + K3s |
|-----------|-----|------------------|
| **本质** | 带有参考实现的标准 | 具体的虚拟化与容器技术栈 |
| **治理** | OSBA 下社区驱动，公共资助背景 | 供应商维护（开源），社区生态 |
| **认证** | SCS-compatible / SCS-sovereign 等级 | 无 |
| **可移植性** | 认证平台之间的标准化接口 | 取决于所选组件 |
| **运维** | 需要理解完整的 SCS 参考技术栈 | 两个组件，文档完善，适合小团队 |
| **采购适配** | 可直接用于主权云采购 | 间接——按技术标准评估 |
| **主权契合** | 该标准明确目标 | 通过自运维开源实现 |
| **典型运营者** | 云服务商、大型机构、联盟 | 单一机构、小型 IT 团队 |

两种路径并无内在优劣之分；它们面向不同的机构情境。

## 决策因素

### 团队规模与技能

SCS 预设了运营完整云技术栈的能力——即使有参考实现，其运维面也很大。Proxmox VE + K3s 适合两三人运维整个平台的机构。如果团队已能运营 OpenStack 或经认证的 SCS 平台，SCS 的边际成本更低；如果团队强项是虚拟化与 Linux 管理，Proxmox + K3s 路线更为直接。

### 采购与合规情境

对于必须证明互操作性或参与主权云采购框架的机构，SCS 认证是一项有据可查、可审计的资产。对于直接采购硬件与软件的机构，自运维技术栈可仅凭技术标准进行规定。

### 可移植性需求

如果工作负载必须在服务商之间迁移——例如作为联盟的一部分或采用多服务商云战略——SCS 的标准化接口可降低迁移成本。如果工作负载整个生命周期都停留在机构自有硬件上，服务商间可移植性很少被实际使用，更简单的技术栈即可满足需求。

### openDesk Edu 对任一基础平台的要求

无论选择如何，openDesk Edu 都提出相同的基础要求：

- Kubernetes 1.28 或更高版本，具备可用的 Ingress 控制器与持久化存储类
- 通过 SAML 或 OIDC 进行身份联合（openDesk Edu 内置 Keycloak，可与 DFN-AAI / eduGAIN 联合）
- GitOps 工具（ArgoCD）或基于 Helm/Helmfile 的部署
- 监控与日志（平台包含 Prometheus、Grafana 和 Loki）
- 集群可访问的容器镜像仓库

经 SCS 认证的平台与 K3s 集群均能满足这些要求。SCS 增加了标准化的存储与网络接口；Proxmox + K3s 则直接通过所选组件提供。

## 实践观察

- **从您能持续运维的最小平台开始。** Kubernetes 本身在两种基础平台上完全相同；差异在于周边基础设施。
- **存储是决定性的运维因素。** 两种路径都需要可靠的持久化存储类；Proxmox VE 的原生存储管理与 SCS 的标准化存储接口均能胜任，但运维模式不同。
- **升级范围不同。** K3s 升级小而频繁；SCS 参考技术栈升级涉及的组件更多。维护窗口有限的机构应将其纳入考量。
- **两种路径互不排斥。** Proxmox + K3s 部署日后可使用标准 Kubernetes 工具迁移到经 SCS 认证的平台，因为工作负载清单在设计上即可移植。

## 总结

| 考量 | 倾向于 |
|---------------|---------------|
| 小团队、自运维、直接控制 | Proxmox VE + K3s |
| 采购认证、服务商可移植性 | SCS |
| 已有 OpenStack / SCS 技能 | SCS |
| 已有虚拟化 / Linux 技能 | Proxmox VE + K3s |
| 工作负载留在机构自有硬件 | Proxmox VE + K3s |
| 联盟或多服务商云战略 | SCS |

openDesk Edu 运行于 Kubernetes；它并不规定基础平台。SCS 与 Proxmox + K3s 之间的选择，是关于治理、可移植性与机构运维能力的决策——与应用本身无关。

---

## 开始使用

1. **查看要求**：[部署指南](/zh/blog/deploying-opendesk-edu) 描述了任何基础平台都必须提供的功能。
2. **评估两种基础平台**：结合您机构的团队、采购与可移植性情境，运用上述决策因素。
3. **加入讨论**：openDesk Edu 社区欢迎运行任一基础平台的机构分享经验。欢迎在[实践社区](/zh/blog/community-of-practice-juni-2026)中交流。

---

*openDesk Edu 是 [openDesk](https://opendesk.eu) 的教育版本，扩展了面向科研与教学的全套服务。源代码可在 [GitHub](https://github.com/tobias-weiss-ai-xr/opendesk-nix) 与 [opencode.de](https://gitlab.opencode.de/umr) 获取。*
