---
title: "RStudio Server"
date: "2026-05-29"
description: "专业的 R 语言 IDE，支持 Shiny 应用、工作区管理和 OpenCloud 文件同步。"
categories: ["科学计算", "研究", "测试版"]
tags: ["rstudio", "r", "shiny", "statistics", "data-science", "scientific-computing"]
version: "2024.12.0"
---

# RStudio Server

RStudio Server 为 R 语言提供专业的集成开发环境，可从任何 Web 浏览器访问。它包括控制台、语法高亮编辑器、绘图工具、工作区管理和 Shiny 应用支持——全部在服务器端运行。

## 核心功能

- **完整的 R IDE**：浏览器中的控制台、编辑器、环境查看器、绘图历史记录和文件浏览器。
- **Shiny 应用支持**：开发、测试和部署交互式 Shiny Web 应用。
- **包管理**：安装和管理 CRAN 包，具备依赖解析功能。
- **OpenCloud 集成**：通过 rclone WebDAV sidecar 挂载用户的 OpenCloud 存储，实现直接文件访问。
- **数据导入/导出**：原生支持 CSV、Excel、SPSS、SAS 和 Stata 文件格式。

## 与 openDesk Edu 的集成

RStudio Server 属于协作服务套件，通过自定义本地 Helm Chart（`helmfile/charts/rstudio`）部署。它通过 oauth2-proxy sidecar 使用 Keycloak 进行身份验证，可通过机构通配符 DNS 下的 `r.*` 访问。OpenCloud WebDAV sidecar 提供与用户云存储的无缝文件同步。

## 了解更多

- [官方文档](https://posit.co/products/open-source/rstudio-server/) — RStudio Server 文档和资源
