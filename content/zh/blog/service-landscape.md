---
title: "openDesk Edu 服务全景图 — 一站式纵览完整生态系统"
date: "2026-06-29"
description: "探索交互式 openDesk Edu 服务全景图：一张可视化地图，涵盖所有领域的所有集成开源服务——从核心平台、教育到安全与合规。"
categories: ["平台", "开源", "工具"]
tags: ["服务全景图", "服务", "概览", "opendesk", "生态系统"]
---

# openDesk Edu 服务全景图 — 一站式纵览完整生态系统

## 什么是服务全景图？

在拥有众多集成服务的平台中导航可能颇具挑战——尤其是在您为所在机构评估 openDesk Edu 或试图了解生态系统如何协同工作时。

**[openDesk Edu 服务全景图](https://landscape.opendesk-edu.org)** 是一张交互式可视化地图，能够精确回答这一问题。它展示了 openDesk Edu 生态系统中的每一项服务，按领域分类，并附有状态指示器、描述以及指向主站和文档的直接链接。

您可以将其视为 openDesk Edu 的"CNCF 全景图"——但专门面向高等教育领域的决策者、运维人员和 educators。

## 领域，统一平台

全景图将服务按领域类别分组，每个类别代表了教育数字基础设施的一个支柱：

### 🔐 核心平台
基础组件：**Keycloak** 统一 SSO、**OpenCloud** 文件同步与共享、**Dovecot + Postfix** 邮件服务、**SOGo** 协作套件、**Matrix + Element** 加密通讯、**Etherpad** 实时协作、**Nubus Portal** 身份与访问管理、托管型 **PostgreSQL + MySQL** 数据库，以及 **MinIO S3** 对象存储。

### 🎓 教育与科研
专为学术界打造：**Moodle** 和 **ILIAS** 学习管理系统、**JupyterHub** 计算研究平台、**XWiki** 知识管理平台，以及 **OpenProject** 科研项目管理工具。

### 🤝 协作与生产力
日常办公工具：**Collabora Online** 实时文档编辑、**OpenStreetMap** 地理编码服务、**Jitsi Meet** 视频会议、**Planka** 看板任务管理、**n8n + Dify** 工作流自动化与 AI 代理，以及 **WordPress** 内容管理系统。

### ⚙️ 基础设施与运维
引擎室：**K3s + ArgoCD** 容器编排与 GitOps、**Prometheus + Grafana** 可观测性、**k8up** 备份方案、**Traefik + HAProxy** 入口流量管理，以及 **Ceph CSI** 软件定义存储。

### 🛡️ 安全与合规
保护与治理：**ClamAV** 病毒扫描、**cert-manager** 自动化 TLS 证书管理、**Kubescape** Kubernetes 安全扫描，以及记录在案的 **渗透测试报告** 及修复跟踪。

## 交互功能

全景图不仅仅是一张静态示意图——它是一个鲜活的、可筛选的交互界面：

- **领域分组** — 服务按领域以不同颜色标识
- **状态徽标** — 一目了然地查看服务处于"生产"、"测试"还是"开发"阶段
- **服务卡片** — 每项服务显示关键技术栈和简短描述
- **快速链接** — 一键直达主站或 OpenSpec 文档
- **自动更新** — 全景图反映当前部署状态

## 为什么使用全景图？

对于**决策者**而言，全景图提供鸟瞰视角：您可以快速评估平台的广度，了解覆盖了哪些领域，并确定哪些服务符合所在机构的需求。

对于**运维人员与架构师**而言，它是技术栈的快速参考地图——有助于新团队成员入职、规划集成方案，或向利益相关者介绍平台范围。

对于**社区**而言，它是一种共享的可视化语言：当我们在讨论"平台"时，每个人都能准确理解其含义。

## 访问全景图

[**→ landscape.opendesk-edu.org**](https://landscape.opendesk-edu.org)

全景图是开源的，与平台同步维护。欢迎提交 Pull Request 和建议——源代码与 openDesk Edu 的其他部分一同托管在 GitHub 上。

*最后更新：2026 年 6 月*
