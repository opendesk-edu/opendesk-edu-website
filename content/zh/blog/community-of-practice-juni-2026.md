---
title: "回顾：openDesk 社区实践 — 2026年6月"
date: "2026-06-22"
description: "感谢所有参加昨天 openDesk 社区实践活动的参与者。以下是本次会议的摘要，涵盖重要主题、文档链接以及下次会议的调查问卷。"
categories: ["社区"]
tags: ["community-of-practice", "opendesk", "交流", "社区", "校园"]
image: "/static/diagrams/architecture.svg"
---

# 回顾：openDesk 社区实践 — 2026年6月

感谢所有参加昨天 openDesk 社区实践活动的参与者！讨论非常热烈，来自各所高校的反馈表明 openDesk Edu 已经得到了广泛的应用。

以下是本次会议主要主题的摘要。

---

## 1. ILIAS 稳定化

MariaDB 在新创建的 Pod（ILIAS 定时任务）上反复出现 `Connection refused` 错误，已通过实现 5 次重试循环（每次间隔 10 秒）解决——此后运行稳定。升级路径和更新版本 ILIAS 的测试仍有待完成。

## 2. OIDC / SSO

`opendesk` 域中的 Keycloak 作为中央 IdP，配置了 `email` 和 `preferred_username` 映射器。讨论了接下来应通过 OIDC 接入哪些服务（OpenProject？Nextcloud？Etherpad？）以及 SAML 与 OIDC 的使用经验。

## 3. 备份基础设施（k8up）

k8up 运算符（v2.13.0）目前将 6 个 RWX PVC 备份到 S3。29 个 RWO PVC 仍被排除，需要单独的策略（CSI 快照或按节点调度）。提出了一个**三层模型**：

| 层级 | 示例 | RPO | RTO | 保留期 |
|:-----|:-----|:----|:----|:------|
| **A**（关键） | Keycloak、PostgreSQL、Redis、MariaDB、MinIO | 1h | 2h | 30d |
| **B**（重要） | Nextcloud、OX、OpenProject、ILIAS、Moodle | 1h | 4h | 14d |
| **C**（实验） | JupyterHub、Ollama、Dask | 24h | 1d | 7d |

## 4. 监控

Collabora 已有指标、告警和仪表板。Nextcloud 还缺少告警和仪表板。备份健康仪表板和资源告警（CPU > 80%、内存 > 85%、磁盘 > 80%）方面存在空白。

## 5. 已知 HRZ 问题

- **DNS CNAME 链**：CoreDNS → SERVFAIL，通过 `hostAliases` 解决
- **Nextcloud AIO 探针 Bug**：`initialDelaySeconds` 配置错误
- **Planka Ingress**：硬编码了 `nginx`，需要移除注解
- **Grafana Ingress 类**：切换到 haproxy
- **ClamAV ICAP 重启循环**：需要清理容器
- **k8up RWO PVC**：备份 Pod 无法挂载 → 已排除

## 6. 上游与集群状态

**openDesk 1.15.0**（当前版本，2026年5月28日）带来了 SeaweedFS 作为 S3 对象存储、OX App Suite 8.48、Nextcloud 32.0.9 和 HAProxy Ingress 支持。**v1.16.0** 正在准备中，将包含 Nextcloud Worker 调优和 Dovecot/Postfix LoadBalancerIP。

HRZ 集群运行在 K3s v1.32.3（9 个节点，Debian 12）上，使用 Ceph 存储、kube-prometheus-stack 和 ArgoCD。

## 7. 教育领域

ILIAS 已在生产环境中运行，Moodle 已准备好 Helm Chart（部署待定）。小组讨论了还缺少哪些服务——例如 Stud.IP、HIS 或其他高校系统——以及数据保护要求（GDPR、高校云服务）的发展趋势。

## 8. 架构

当前的 **openDesk Edu 架构**，包括 IAM、应用、集成和邮件流，展示在架构图中：

➡️ [架构图 (SVG)](/static/diagrams/architecture.svg)

包括存储拓扑和备份矩阵在内的详细运行时架构可在 [CoP 仓库](https://codeberg.org/opendesk-edu/opendesk-cop) 中查看。

---

## 链接

- **📄 会议文档**：[Codeberg — CoP Session 2025-06-19](https://codeberg.org/opendesk-edu/opendesk-cop/src/branch/main/2025-06-19-community-of-practice-session.md)
- **📋 下次 CoP 日期调查**：[DFN Terminplaner](https://terminplaner6.dfn.de/de/p/1509a06af2198fc680b2cac353ecca55-1808219)
- **🏗️ 架构图**：[/static/diagrams/architecture.svg](/static/diagrams/architecture.svg)
- **💻 openDesk Edu**：[opendesk-edu.org](https://opendesk-edu.org/)
- **🐘 Codeberg**：[codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu/)

请在下周结束前参与调查——我们将在约三个月后通知您下次 CoP 会议的确定时间。
