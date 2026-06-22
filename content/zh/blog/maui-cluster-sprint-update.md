---
title: "Sprint 1 完成：Maui 集群基础设施修复"
date: "2026-06-17"
description: "Maui 集群修复计划的 Sprint 1 已完成 — slidev PVC 卡住问题已解决，SOGo 已迁移到正确命名空间，存储类已审计，所有核心服务的冒烟测试均通过。"
image: "/static/blog/maui-cluster-sprint-update-teaser.png"
categories: ["状态更新"]
tags: ["maui", "kubernetes", "sprint", "基础设施", "集群", "k3s"]
---

# Sprint 1 完成：Maui 集群基础设施修复

> **slidev PVC 已解决。SOGo 已迁移。31 个部署的存储类已完成审计。所有冒烟测试通过。**

6 月 14 日，我们发布了 [Maui 集群 Sprint 计划](/zh/blog/hrz-maui-cluster-progress)——通过四个 Sprint 填补六个缺失服务的缺口并强化基础设施。今天，我们报告 Sprint 1 已完成，Sprint 2 的工作已在进行中。

## 已修复的问题

### slidev PVC：卡住问题已解决

slidev 的 PersistentVolumeClaim 自初始部署以来一直卡在 `Pending` 状态。根本原因是 PVC 上缺少 StorageClass 注解——它引用了 `ceph-rbd-ssd`，但 `spec.storageClassName` 字段为空，导致 CSI 驱动完全跳过了它。

**已应用的修复：**
- 删除了卡住的 PVC（无数据丢失 — slidev 无状态）
- 使用显式的 `storageClassName: ceph-rbd-ssd` 重新创建
- Pod 在 PVC 绑定后立即调度
- 服务在 `slides.opendesk.hrz.uni-marburg.de` 正常响应

### SOGo 命名空间迁移

SOGo 在初始测试期间部署在 `demo` 命名空间中——这是原型阶段的遗留问题。我们已将其迁移到 `opendesk-edu` 命名空间以符合集群命名规范。

**迁移步骤：**
1. 从 `demo` 命名空间导出 SOGo PostgreSQL 数据库
2. 使用 `namespace: opendesk-edu` 重新部署 SOGo chart
3. 将数据库恢复到新命名空间
4. 更新 ingress 指向新的服务端点
5. 删除旧的 `demo` 命名空间部署

DNS 传播耗时约 2 分钟；此后服务一直稳定运行。

### 存储类审计

对 `opendesk` 和 `opendesk-edu` 两个命名空间中所有 31 个部署的每个 PVC 进行了存储类分配审计：

| StorageClass | 用途 | PVC 数量 | 状态 |
|---|---|---|---|
| `ceph-rbd-ssd` | 快速 RWO（数据库，有状态集） | 18 | ✅ 全部正确 |
| `ceph-cephfs-hdd-ec` | 慢速 RWX 纠删码（文件） | 9 | ✅ 全部正确 |
| `local-path` | 临时/暂存（K3s 默认） | 3 | ✅ 全部正确 |

除 slidev PVC 外未发现其他配置错误——确认了初始部署模板的正确性。

### 冒烟测试

对所有 31 个部署运行了完整的冒烟测试套件：

- 所有 31 个部署显示 `READY` 状态
- 所有 ingress 返回 HTTP 200 或 302（SSO 重定向）
- Keycloak OIDC 登录流程在 Nextcloud、OpenProject、XWiki 和 BookStack 上正常运行
- K8up 备份计划成功运行：33 个快照推送到 S3
- Prometheus 目标全部健康，Grafana 仪表板无严重告警

## Sprint 2：正在进行中

基础设施修复完成后，Sprint 2 的目标是三个缺失的服务：

| 服务 | Chart 类型 | 依赖 | 状态 |
|---|---|---|---|
| Zammad | 本地 chart | PostgreSQL, Elasticsearch, Redis | 🟡 进行中 |
| Overleaf | 上游 chart | Redis, MongoDB | 🟡 进行中 |
| KasmVNC | 上游 chart | — | ⏳ 已排队 |

Zammad 的部署最为复杂——它需要三个依赖数据库和合适的 ingress 路由以支持其实时工单更新。我们正在使用与 Etherpad 相同的 postgresql-subchart-removal 模式，从 `charts-upgrade-v1.12.0/zammad` 适配 chart。

## 后续计划

- **Sprint 3**（目标：本周）：Portal 条目（仅 configmap 的 chart）和 Snipr（需要 Dockerfile 构建）
- **Sprint 4**：强化、文档和完整 ingress 审计

Maui 集群现在运行 **41 个 Pod**，涵盖 **32 个部署**——较 6 月 14 日的 39 个 Pod 和 31 个部署有所增长。我们有望在 6 月底前实现完全的生产就绪。

想要在您的大学部署 openDesk Edu？请参阅我们的[入门指南](/docs/deployment)和[代码仓库](https://codeberg.org/opendesk-edu/opendesk-edu)。
