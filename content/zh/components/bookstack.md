---
title: "BookStack（知识库）"
date: "2026-04-02"
description: "结构化 Wiki，采用书/章节/页面层级结构，适合课程材料管理。"
categories: ["知识管理", "教学"]
tags: ["bookstack", "知识库", "wiki", "课程材料"]
---

# BookStack（知识库）

BookStack 是采用书/章节/页面层级结构的知识库平台，直观易用。适用于课程材料管理、教学资料整理和团队知识共享。这是教育版专属的 Beta 组件。

## 核心功能

- **层级结构**: 书架、书籍、章节和页面的四级内容组织
- **富文本编辑**: 支持 WYSIWYG 和 Markdown 双编辑模式
- **搜索功能**: 全文搜索，快速定位内容
- **权限管理**: 细粒度的角色和页面级权限控制
- **章节导出**: 支持导出为 PDF、HTML 和纯文本

## 与 openDesk Edu 的集成

BookStack 作为教育版 Beta 组件，通过 Keycloak SSO（SAML 2.0 / OIDC）实现统一身份认证。通过统一门户可直接访问知识库。采用模块化 Helm Chart 部署。层级结构特别适合按课程、章节组织教学材料。
