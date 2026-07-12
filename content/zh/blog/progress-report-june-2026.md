---
title: "进度报告：openDesk Edu 在 HRZ Maui 的部署 — 2026 年 6 月"
date: "2026-06-04"
description: "经过五个月的部署和两个强化 Sprint，openDesk Edu 已在马尔堡大学全面投入运营。以下是我们取得的成就及后续计划——包括向上游集成到主 openDesk HRZ 集群。"
categories: ["状态更新"]
tags: ["部署", "基础设施", "kubernetes", "sprint", "马尔堡大学"]
image: "/static/blog/progress-report-june-2026-teaser.svg"
---

# 进度报告：openDesk Edu 在 HRZ Maui 的部署 — 2026 年 6 月

> **57 个 Pod 运行中。33 个服务实现统一 SSO。44 个 Keycloak 客户端已完成审计和迁移。**
> k8up 备份已激活，Grafana 仪表板已部署，所有 ingress 已整合至单一域名下。

自将 openDesk Edu 部署到 HRZ Maui 集群（K3s v1.32.3，9 节点，Debian 12）以来，我们完成了两个专注的强化 Sprint（Sprint 5–6），目标为运维稳定性、域名整合和服务健康。

## 集群概览

| 指标 | 值 |
|:-------|:------|
| 集群 | K3s v1.32.3, 9 节点 (3 CP, 6 worker) |
| 域名 | `*.opendesk.hrz.uni-marburg.de` |
| Ingress | HAProxy 控制器 (192.168.3.201) |
| 存储 | Ceph RBD SSD (RWO), CephFS HDD EC (RWX) |
| SSO | Keycloak OIDC + SAML, 44 客户端 |
| 备份 | k8up / restic → S3, 每日 01:22, 14 天保留 |
| 监控 | Prometheus + Grafana (12.4.1) |

## 已修复的问题

### SSO 审计（Sprint 5）
对 `opendesk` 领域中的所有 44 个 Keycloak 客户端进行了审计，并从旧域名 `opendesk-edu.org` 迁移到 `opendesk.hrz.uni-marburg.de`。通过 Keycloak 管理 API 验证了每个客户端的 URI、重定向 URL 和颁发者。

### 域名迁移
十二个 ingress（3 个门户，9 个静态文件）已从 `*.opendesk-edu.org` 迁移到 `*.opendesk.hrz.uni-marburg.de`。硬编码旧域名的来源——`portal-saml-multidomain.yaml.gotmpl`——已在 chart 层面修复并提交。

### 服务修复

| 服务 | 问题 | 修复 |
|:--------|:------|:----|
| **Planka** | Ingress class `nginx`（无控制器），OIDC 端点包含未渲染的 `.gotmpl` 模板语法 | 修改为 `haproxy`，OIDC URL 通过 `--set` 设置 |
| **SSP** | Ingress 后端指向不存在的服务名称 | Chart 模板已修复；应用升级 |
| **Planka chart** | `values.yaml` 包含破坏直接 `helm` 部署的 helmfile `.gotmpl` 表达式 | 替换为空字符串；端点在部署时设置 |

### 基础设施
- **k8up** 操作符部署在 `opendesk` 命名空间中。备份计划 `backup-edu` 每天 01:22 运行，保留 14 天。已在 S3 中确认 33 个快照。
- **Grafana** 仪表板已部署，用于教育服务健康、k8up 备份概览和集群概览。
- **外部 DNS**——为仍依赖 `/etc/hosts` 解析的 12 个服务生成了脚本（n8n, code, collab, draw, jupyter, limesurvey, typo3, zammad, r, slides, term, ai）。

## 当前服务健康状态

所有核心服务均正常响应：

| 服务 | 端点 | 状态 |
|:--------|:---------|:-------|
| Moodle LMS | `moodle.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| ILIAS LMS | `lms.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| JupyterHub | `jupyter.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO 重定向) |
| BookStack | `bookstack.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO 重定向) |
| OpenProject | `projects.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO 重定向) |
| Element (聊天) | `chat.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| Jitsi (会议) | `meet.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| Nextcloud (文件) | `files.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO 重定向) |
| OX App Suite (邮件) | `webmail.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO 重定向) |
| XWiki | `wiki.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO 重定向) |
| Planka | `planka.opendesk.hrz.uni-marburg.de` | ✅ 200 带 OIDC |
| SSP | `ssp.opendesk.hrz.uni-marburg.de` | ✅ 403/200 (OIDC 认证) |

## 向上游集成到 openDesk 集群

6 月 1 日，所有 20+ 个 opendesk-edu 服务已向上游集成到主 openDesk HRZ 集群部署中。教育服务的 chart、值和配置现已成为 openDesk helmfile 流水线的一部分——与核心 openDesk 基础设施一起部署，共享相同的 ingress 控制器、监控栈和备份计划。

**已集成的服务：**

| 类型 | 服务 |
|:-----|:---------|
| 本地 charts | Etherpad, BookStack, Planka, Zammad, LimeSurvey, Draw.io, Excalidraw, Self-Service-Password, SOGo, RStudio, ttyd, Slidev, Collab Dashboard, Portal Entries |
| 外部 charts | JupyterHub, Open WebUI, Code-Server, Dask, Ollama |
| 跳过（认证待定） | Overleaf, KasmVNC, TYPO3, Grommunio |

此次集成消除了独立的 `opendesk-edu` 命名空间，将教育服务纳入统一集群管理——相同的 Grafana 仪表板、相同的 k8up 备份保留策略、相同的 HAProxy ingress 规则。`opendesk-edu` 仓库仍然是教育服务特定 chart 值和文档的事实标准，但运行时部署现在位于主 openDesk 流水线中。

## 路线图展望

随着强化 Sprint 的完成和上游集成的推进，工作重点现转向：

1. **外部 DNS 解析**——将生成的 DNS 记录脚本交给 HRZ 网络管理员，以消除 12 个服务对 `/etc/hosts` 的依赖
2. **Helmfile 流水线**——目标在主 openDesk 集群上运行 `helmfile sync`（不再是独立的 `opendesk-edu` 命名空间）；6 月 1 日的上游合并已奠定基础
3. **完整登录测试**——对所有服务进行端到端 OIDC/SAML 流程验证
4. **v1.1 基础项目**——DFN-AAI SAML 联邦测试、容器镜像构建流水线、反向注销验证、剩余认证待定的 chart 集成

想要在您的大学部署 openDesk Edu？请参阅我们的[入门指南](/docs/deployment)和[代码仓库](https://codeberg.org/opendesk-edu/opendesk-edu)。
