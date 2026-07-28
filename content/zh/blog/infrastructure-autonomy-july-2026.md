---
title: "基础设施自主化 — 2026年7月进展报告"
date: "2026-07-28"
description: "Stalwart v0.16 取代 Postfix，所有服务通过 Keycloak SSO 连接，ArgoCD GitOps 扩展，创建自定义基础设施仓库。"
categories: ["基础设施"]
tags: ["stalwart", "oidc", "keycloak", "argocd", "gitops"]
image: "/static/blog/infrastructure-autonomy-july-2026-teaser.svg"
---

# 基础设施自主化 — 2026年7月进展报告

HRZ Marburg 的 openDesk Edu 部署本月达到了两个重要里程碑：所有服务的完全 SSO 集成和对外部注册表的基础设施自主化。

## Stalwart v0.16 取代 Postfix

Stalwart 邮件服务器已从 v0.15 升级到 **v0.16.15**，并承担了主要 MTA 的角色。Postfix 已被禁用。

**新增功能：** 9 个活跃监听器，JSON 配置与 RocksDB，TCP 套接字探测，适用于 K3s v1.32.3 的安全配置。

服务现在通过 Stalwart 中继 SMTP：
- SOGo — `smtp://stalwart-stalwart:587`
- OpenCloud — `stalwart-stalwart.opendesk.svc.cluster.local:587`

## 通过 Keycloak 实现统一 SSO

所有服务都通过中央 Keycloak 领域（`opendesk`）进行身份验证：OpenCloud、Stalwart、SOGo、Element/Matrix、XWiki 和门户。

## ArgoCD GitOps 扩展

通过将基于 CMP 的应用转换为 Helm 应用，ArgoCD 管理从 2 个扩展到 **27 个教育应用**。

## 自定义基础设施仓库

创建了四个独立仓库以与外部注册表解耦：

- **opendesk-kubectl** — 最小化 kubectl 镜像（约 30MB）
- **opendesk-helm-charts** — 自定义图表 + OCI 镜像工具
- **opendesk-sogo-image** — 支持 OIDC/SSO 的 SOGo 镜像
- **opendesk-collab-dashboard** — 教育服务仪表板

## 监控与备份

- **28/29 合同测试通过**
- **11 条 Prometheus 告警规则**
- **k8up 操作员** — 0 次重启
- **备份计划** — 每日 00:42 和 01:00

---

*部署于 K3s v1.32.3 · 9 节点 · Ceph CSI 存储 · HRZ Marburg*
