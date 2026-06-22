---
title: "Dask Gateway"
date: "2026-05-29"
description: "分布式并行计算集群，用于扩展数据科学和科学计算工作负载。"
categories: ["科学计算", "基础设施", "计划中"]
tags: ["dask", "distributed-computing", "parallel", "big-data", "scientific-computing"]
version: "2024.1"
---

# Dask Gateway

Dask Gateway 提供按需分布式计算集群，可将 Python 和数据科学工作负载扩展到多个节点。它专为需要处理大型数据集、运行并行模拟或加速机器学习训练流程的研究人员而设计。

## 核心功能

- **按需集群**：根据工作负载需求动态创建和扩展 Dask 集群。
- **Python 原生**：与 Python 数据科学生态系统（NumPy、Pandas、Scikit-learn、Xarray）全面集成。
- **作业队列**：管理多个用户提交的任务并设置优先级，具备可配置的资源限制。
- **仪表板**：实时监控集群健康状态、任务进度和资源使用情况。
- **可扩展**：从单节点开发到多节点生产集群均可支持。

## 与 openDesk Edu 的集成

Dask Gateway 属于协作服务套件（C 阶段——计划中），通过其上游 Helm Chart（`helm.dask.org`）部署。它将在机构通配符 DNS 下的 `compute.*` 地址访问，并与 Keycloak 集成进行身份验证。

## 了解更多

- [官方文档](https://gateway.dask.org/) — Dask Gateway 文档和资源
- [Dask 项目](https://dask.org/) — Python 并行计算
