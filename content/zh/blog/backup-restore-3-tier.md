---
title: "openDesk Edu 的备份与恢复——面向高校数据主权的三层模型"
date: "2026-08-22"
description: "数据主权在备份层面决定：openDesk Edu 借助 k8up 和三层模型（RPO/RTO/保留期）将关键服务备份到 S3，在生产环境中验证恢复，并诚实展示仍存在的缺口——29 个 RWO PVC 等待 CSI 快照。"
categories: ["运维", "数据主权"]
tags: ["backup", "restore", "k8up", "restic", "s3", "ceph", "csi-snapshots", "rpo", "rto", "高校", "数据主权"]
image: "/static/blog/backup-restore-3-tier-teaser.svg"
---

# openDesk Edu 的备份与恢复——面向高校数据主权的三层模型

> **论点：** 数据主权不由登录环节决定，而由备份环节决定。如果你在紧急情况下无法拿回自己的数据，那么无论平台在其他方面多么主权独立，你都不真正拥有这些数据。
>
> **现实：** 一个由 20 多个开源服务构建的高校平台包含截然不同的数据类别：故障会在几秒内级联的键值存储、以 TB 计的文件、以及实验性 AI 沙箱。任何单一备份策略都无法适配这些类别中的任何一个。
>
> **我们的做法：** 我们不采用一刀切的备份，而是运行一个**三层模型**——每个数据类别拥有自己的 RPO、RTO 和保留期，基于 Kubernetes 上的 k8up 运维器实现，依托 **Ceph** 和 **S3**，并配合经过验证的恢复演练和诚实的差距分析。

## 为什么备份才是真正的数据主权问题

离开 Microsoft 365、Google Workspace 或 Zoom，是主权转向中看得见的部分。看不见的部分始于决定不再光鲜的地方：在数据中心里，凌晨三点，面对一块故障的存储控制器或一张被误删的数据表。

法律意义上的数据主权意味着：责任方决定数据**存放在哪里**、**谁能访问**。运营意义上的数据主权意味着：即使**出了差错**，责任方也能把数据拿回来。故障不是“会不会发生”的问题，而是“何时发生”的问题——这正是为什么要构建一套不仅仅是欢快地把数据写进存储黑洞的周期任务的备份系统。

对高校而言还有一个额外的维度：大量数据是**不可再生**的——考试成绩、研究数据、学位论文、跨越多个学期的邮件归档。一个被遗忘的计算集群可以重建；一篇丢失的博士论文却不行。因此，备份策略与 SSO 和监控一起，构成了生产化运营开放校园的三大支柱之一。

## k8up：将备份建模为 GitOps 原生资源

openDesk Edu 没有在虚拟机上跑 cron 任务，而是把备份作为 Kubernetes 平台的一部分来建模——借助 **k8up**（v2.13.0），K8up 项目的备份运维器：

```yaml
apiVersion: k8up.io/v1
kind: Schedule
metadata:
  name: backup-live
spec:
  backup:
    schedule: "15 2 * * *"          # 每夜 02:15 开始
    backend:
      repoPasswordSecretRef:
        name: backup-credentials
        key: password
      s3:
        endpoint: s3.hrz.uni-marburg.de
        bucket: backups
        accessKeyIDSecretRef:
          name: backup-credentials
          key: accessKey
        secretAccessKeySecretRef:
          name: backup-credentials
          key: secretKey
```

这其中的优势是架构性的：备份是**声明的、版本化的、可评审的**——它们以 YAML 形式存在于 Git 仓库中，紧挨着它们所保护的服务。夜间备份因此与部署流程一样可追溯。**Restic** 负责实际的数据存储：去重、加密、快照在多年间保持一致。目标是位于集群**之外**的一个 **S3 存储桶**（生产环境：`s3.hrz.uni-marburg.de`）——这样即使平台本身完全损毁，备份也能存活。

在生产环境中，k8up 目前将 **6 个 RWX PVC** 直接备份到 S3——包括 Nextcloud、OpenProject 和群件服务的共享卷。一个 **Grafana 备份仪表盘**让计划与快照的状态可见，而不是依赖“应该没问题”。

## 三层模型：按数据类别划分 RPO、RTO 与保留期

我们方法的核心是认识到：对如此规模的平台而言，“一个备份”并不是一个有意义的单位。openDesk Edu 的数据在三个维度上存在根本差异：

- **可以接受多少丢失？**（RPO——恢复点目标）
- **必须多快恢复？**（RTO——恢复时间目标）
- **必须保留多久？**（保留期）

因此我们定义了一个**三层模型**：

| 层级 | 示例服务 | RPO | RTO | 保留期 |
|:-----|:---------|:----|:----|:-------|
| **A——关键** | Keycloak、PostgreSQL、Redis、MariaDB、MinIO | 1 小时 | 2 小时 | 30 天 |
| **B——重要** | Nextcloud、OX App Suite、OpenProject、ILIAS、Moodle | 1 小时 | 4 小时 | 14 天 |
| **C——实验性** | JupyterHub、Ollama、Dask | 24 小时 | 1 天 | 7 天 |

### A 层——身份与数据核心

身份提供商（Keycloak）、数据库（PostgreSQL、MariaDB、Redis）和对象存储（MinIO）是平台的心脏。Keycloak 一旦宕机，所有登录都会失败；配置数据库一旦丢失，服务就会失去身份。这里的规则是：**每小时备份、快速恢复、保留 30 天**——因为对于身份系统，你希望能在必要时回溯很远，例如回滚错误的供给操作。

### B 层——协同工作空间

Nextcloud、OX App Suite、OpenProject、ILIAS 和 Moodle 构成高校实际的工作空间。恢复比数据库更繁琐——TB 级的文件不可能在两小时内“导入”。通过**每小时 RPO 和 4 小时 RTO**，我们平衡了成本：不丢失任何工作日，重启窗口保持可预期。14 天保留期覆盖典型的错误窗口（误删、过期客户端、故障更新）。

### C 层——实验空间

JupyterHub、Ollama 和 Dask 有意被设计为**可丢弃环境**。这里丢失的内容都是可再生的——来自 Git、来自 Nix、来自文档化的运行手册。**24 小时 RPO** 意味着：丢失一天实验数据可以接受，前提是让基础设施免于不必要的负担。这种划分是有意识的选择——它为数据真正重要的层级节省了资源。

## RWO 挑战：29 个无法“随便”备份的 PVC

到目前为止一切井井有条——现在说诚实的缺口。平台现有的 PVC 中有 **29 个目前未被 k8up 覆盖**，因为它们是 **RWO**（ReadWriteOnce）。RWO 卷绑定在单一节点上，无法被其他位置的备份 Pod 并行挂载。“随手挂一块卷”的经典做法在结构上就行不通。

两条路径都已摆在桌上，且均已文档化：

**方案 A——CSI VolumeSnapshot（首选）。** Ceph 通过其 CSI 驱动器 `rbd.csi.ceph.com` 提供 VolumeSnapshot。这样可以自动为 RWO 卷创建**崩溃一致性**快照——无需挂载、无需停机：

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: csi-rbd-snapclass
  annotations:
    k8up.io/snapshot-class: "true"
driver: rbd.csi.ceph.com
deletionPolicy: Delete
```

**方案 B——按节点计划。** 在不存在快照类的地方，每个 RWO PVC 都可以通过自己的 k8up 计划保护，用 `nodeSelector` 精确定位卷所绑定的节点。工作量更大，但不依赖存储后端。

A 与 B 的抉择取决于唯一一个前提：集群中是否存在 `VolumeSnapshotClass`？若存在，CSI 路径就是明确的推荐——29 个 PVC 即可脱离排除维护模式（`k8up.io/exclude: "true"`），进入常规运营。

## 恢复验证：建立信任的测试

从未被恢复过的备份只是一种观点。我们在生产环境中验证恢复——在 **Maui** 平台上，**33 个快照**已成功验证：数据库被恢复并检查、文件路径核对完整性、服务在恢复后经过功能测试。

k8up 同样把恢复建模为原生资源，这很有帮助：

```yaml
apiVersion: k8up.io/v1
kind: Restore
metadata:
  name: restore-verify
spec:
  restoreMethod:
    folder:
      claimName: restore-target
  backend:
    repoPasswordSecretRef:
      name: backup-credentials
      key: password
    s3:
      endpoint: s3.hrz.uni-marburg.de
      bucket: backups
      accessKeyIDSecretRef:
        name: backup-credentials
        key: accessKey
      secretAccessKeySecretRef:
        name: backup-credentials
        key: secretKey
```

大规模运维的准则是：**任何恢复在目标环境中每季度至少演练一次的计划，都只存在于纸上。** 数一数快照固然不错；成功地回放它们才是证明。

## 展望：从集群备份到灾难恢复

当前配置保护的是集群——并且有意备份到**外部** S3 目标。下一步的问题是：如果故障的不只是一个服务，而是整个站点呢？议程上有三个构件：

1. **填补 RWO 缺口：** 为 29 个 RWO PVC 配置 CSI 快照（方案 A），让集群中的每个数据类别都有明确的路径。
2. **地理冗余：** 将 S3 存储桶复制到第二站点或第二数据中心——以抵御火灾、水灾和那唯一的倒霉时刻。
3. **运维手册：** 为每个层级编写恢复运行手册，包含目标时限、责任分工，以及每年一次、在空目标上重建整个集群的 DR 演练日。

对于正在替换 Microsoft 365 的决策者而言，核心信息很简单：**在 M365 需要靠合同购买的东西，在 openDesk Edu 你可以自己构建——而且它属于你。** 备份策略不是附录，而是平台的一等公民：在 Git 仓库中声明、在生产中验证、被诚实地记录。

## 结语

openDesk Edu 的备份与恢复不是一个千篇一律的产品，而是一个**分级清晰、决策明确的系统**：

- **k8up** 把备份变成 GitOps 原生、可评审的资源，而不是被遗忘的 cron 任务。
- **Restic + S3** 提供去重、加密、外部的快照。
- **三层模型**在身份、协作与实验空间之间合理地分配 RPO、RTO 和保留期。
- **经过验证的恢复**（33 个快照）把纸面变成实践。
- **RWO 缺口**（29 个 PVC）已点名，配有两条文档化的解决路径——而下一步就是通过 CSI 快照落地实施。

数据主权不是一个可以勾掉的法律选项。它是一项需要证明的运维成就——而证明就是把快照成功恢复回来。

---

## 链接

- **k8up**——备份运维器：[k8up.io](https://k8up.io)
- **Restic**——去重加密备份：[restic.net](https://restic.net)
- **Ceph**——集群的存储基础：[ceph.io](https://ceph.io)
- **实践社区**——备份基础设施会议：[Codeberg](https://codeberg.org/opendesk-edu/opendesk-cop)
- **openDesk Edu**：[opendesk-edu.org](https://opendesk-edu.org/)
