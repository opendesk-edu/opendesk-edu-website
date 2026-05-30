---
title: "LinkedIn: Collab Services — openDesk Edu 上的科学计算"
date: "2026-05-29"
description: "Collab Services 公告的 LinkedIn 文章版本。"
categories: ["linkedin"]
tags: ["opendesk", "科学计算", "kubernetes", "opensource"]
draft: false
---

# Collab Services：科学计算工具加入 openDesk Edu

我们刚刚发布了 openDesk Edu 自上线以来最大的更新：**Collab Services** — 11 个开源科学计算工具，全部集成 Keycloak SSO，通过一条 `helmfile apply` 命令即可部署。

**新增内容：**
JupyterHub、Overleaf（LaTeX）、RStudio Server、code-server（VS Code）、Open WebUI + Ollama（本地 AI）、ttyd（网页终端）、Slidev（演示文稿）、KasmVNC（Linux 桌面）、Dask（分布式计算）和 Excalidraw（白板）。

**为何重要：**
运行 openDesk Edu 的高校现在可以为学生和研究人员提供 Jupyter notebook、协作式 LaTeX 编辑、浏览器 IDE 和私有 AI 助手——全部运行在自己掌控的基础设施上，通过现有的 Shibboleth 联合身份认证（DFN-AAI / eduGAIN）实现单点登录。

**架构：**
- 7 个上游 Helm Chart + 4 个自定义 Chart
- oauth2-proxy sidecar 实现 Keycloak SSO
- JupyterHub 和 Open WebUI 的原生 OIDC 支持
- 带通配符 TLS 的 HAProxy 入口
- RStudio 的 OpenCloud 存储集成

**验证结果：** 全部 9 项服务通过烟雾测试，全部 5 个自定义 Chart 通过 Helm 连接测试。

**试试看：**
```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
helmfile -e prod apply --selector name=jupyterhub
```

完整详情：https://opendesk-edu.org/zh/blog/collab-services-scientific-tools

#开源 #Kubernetes #高等教育 #科学计算 #数字主权
