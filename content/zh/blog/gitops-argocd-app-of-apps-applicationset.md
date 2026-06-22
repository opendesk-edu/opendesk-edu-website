---
title: "规模化 GitOps：openDesk 的 App of Apps 与 ApplicationSet 模式对比"
date: "2026-06-19"
description: "随着 openDesk Edu 服务超过 30 个，单一的单体 ArgoCD Application 已达到极限。本文比较了 App of Apps 和 ApplicationSet 两种模式，评估了面向多集群和多环境教育部署的优缺点。"
image: "/static/blog/gitops-argocd-app-of-apps-applicationset-teaser.svg"
categories: ["技术", "架构", "运维"]
tags: ["gitops", "argocd", "kubernetes", "app-of-apps", "applicationset", "helmfile", "架构"]
---

# 规模化 GitOps：openDesk 的 App of Apps 与 ApplicationSet 模式对比

> **当前状态：** 一个 ArgoCD Application、一个 helmfile、30+ 个服务、8 个同步阶段。
> **目标状态：** 可扩展的多集群、多环境 GitOps 架构。

本文分析了我们当前的架构、未来的目标，以及两种主要的 ArgoCD 模式——App of Apps 和 ApplicationSet——如何帮助我们实现目标。

## 当前状况

openDesk Edu 目前使用**单体 ArgoCD Application** 进行部署，该 Application 基于 [helmfile 插件](https://github.com/travisghansen/argo-cd-helmfile)。ArgoCD 中的一个 Application 资源指向一个 helmfile，该 helmfile 通过 8 个同步阶段编排所有 30+ 个服务：

| 阶段 | 部署内容 |
|-------|-------------|
| 0 | 部署前迁移任务 |
| 1 | 核心服务（首页、证书、告警） |
| 2 | 数据库、缓存、S3、邮件中继 |
| 3 | 认证与基础设施（Keycloak、Grafana、k8up） |
| 4 | 协作服务（Nextcloud、Collabora、Jitsi、Element） |
| 5 | 教育服务（Moodle、ILIAS、BigBlueButton） |
| 6 | 科研工具（JupyterHub、RStudio、Dask） |
| 7 | 可选组件（XWiki、Zammad、OpenProject） |

### 单体模式的问题

这种模式在早期有效，但随着规模扩大暴露了以下问题：

- **部署周期长**：最小改动也需要完整的 8 阶段同步
- **缺乏隔离**：一个阶段失败可能阻塞整个部署
- **租户支持有限**：无法在不复制整个 Application 的情况下部署不同配置
- **回滚复杂**：无法独立回滚单个服务

## 两种 ArgoCD 模式

### 模式 1：App of Apps

App of Apps 是一种层次化模式，其中根 Application 管理多个子 Application，每个子 Application 负责一组服务。

**优势：**
- 每个服务/组可以独立同步
- 更细粒度的健康监控
- 逐步部署和回滚

**劣势：**
- 随着 Appliction 数量增长，管理开销增加
- 跨多个 Application 的依赖关系管理复杂
- 每个环境需要单独的根 Application

### 模式 2：ApplicationSet

ApplicationSet 引入模板化，通过参数化生成 Application，支持跨环境和集群的部署。

**优势：**
- 声明式模板减少重复
- 内置多集群支持
- 通过生成器支持灵活的拓扑结构

**劣势：**
- 调试模板化 Application 更加困难
- 学习曲线较陡
- 某些高级场景需要额外的生成器插件

## 推荐方案

对于 openDesk Edu，我们推荐**混合方法**：

1. 使用 **ApplicationSet** 生成基于集群和环境的 Application
2. 在每个环境中使用 **App of Apps** 模式组织服务组
3. 基础服务使用 **直接 Application** 管理（Keycloak、监控）

这种方案平衡了灵活性和可维护性，特别适合教育机构的多集群部署需求。

## 了解更多

- [ArgoCD ApplicationSet 文档](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/)
- [App of Apps 模式](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/#app-of-apps-pattern)
- [openDesk 架构概览](/zh/blog/architecture-deep-dive/)
