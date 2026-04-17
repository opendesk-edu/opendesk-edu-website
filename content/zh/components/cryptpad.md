---
title: "CryptPad（图表）"
date: "2026-03-15"
description: "注重隐私的协作办公套件，集成 diagrams.net 图表工具。"
categories: ["办公", "图表"]
tags: ["cryptpad", "diagrams", "图表", "隐私"]
---

# CryptPad（图表）

CryptPad 是一款注重隐私的协作办公套件，集成了 diagrams.net 图表工具。所有数据在浏览器端加密，服务器无法读取内容，同时也可作为白板的替代方案使用。

## 核心功能

- **端到端加密**: 所有文档在客户端加密，零知识架构
- **diagrams.net 集成**: 支持流程图、架构图、UML 图等多种图表类型
- **协作编辑**: 多人实时协同编辑文档
- **富文本编辑**: 支持文档、表格、演示文稿和表单
- **白板功能**: 可作为轻量级白板替代方案

## 与 openDesk Edu 的集成

CryptPad 作为 openDesk CE 基础组件，通过 Keycloak SSO（SAML 2.0 / OIDC）实现统一身份认证。通过统一门户可直接访问。采用模块化 Helm Chart 部署。端到端加密特性特别适合处理敏感教学数据和学术研究内容。
