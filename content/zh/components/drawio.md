---
title: "Draw.io（图表）"
date: "2026-04-12"
description: "图表绘制工具，支持架构图、流程图和 UML，可导出多种格式。"
categories: ["图表"]
tags: ["drawio", "图表", "流程图", "uml"]
---

# Draw.io（图表）

Draw.io（现称 diagrams.net）是一款功能丰富的图表绘制工具，支持架构图、流程图、UML 图等多种图表类型。适用于教学素材制作和技术文档编写。这是教育版专属的 Beta 组件。

## 核心功能

- **多种图表**: 支持流程图、架构图、UML、ER 图、网络图等
- **丰富的模板**: 内置大量图表模板和形状库
- **导出格式**: 支持导出为 PDF、PNG、SVG、VSDX 等格式
- **协作编辑**: 支持多人实时协作编辑
- **云存储集成**: 支持保存到多种云存储服务

## 与 openDesk Edu 的集成

Draw.io 作为教育版 Beta 组件，通过 Keycloak SSO（SAML 2.0 / OIDC）实现统一身份认证。通过统一门户可直接访问图表编辑器。采用模块化 Helm Chart 部署。与 CryptPad 内置的 diagrams.net 功能互补，提供独立的图表绘制环境。
