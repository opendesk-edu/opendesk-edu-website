---
title: "Collab Services：11 个科学计算工具加入 openDesk Edu"
date: "2026-05-29"
description: "openDesk Edu 新增 11 个开源科学计算工具——JupyterHub、Overleaf、RStudio、code-server、Open WebUI、Ollama 等——通过 Helmfile 部署在 Kubernetes 上，统一使用 Keycloak SSO。"
image: "/static/blog/collab-services-teaser.png"
categories: ["announcement"]
tags: ["collab-services", "scientific-computing", "jupyter", "rstudio", "overleaf", "kubernetes", "opensource"]
---

# Collab Services：11 个科学计算工具加入 openDesk Edu

openDesk Edu 迎来了迄今为止最大的功能更新。**Collab Services**——分三阶段推进的计划的 A 阶段——向平台新增了 11 个开源科学计算工具，将其从生产力与学习管理系统转变为面向大学和研究机构的完整数字研究环境。

新工具涵盖交互式笔记本、协作 LaTeX、浏览器 IDE、本地 AI 助手、分布式计算等。全部通过 Helmfile 部署在 Kubernetes 上，集成 Keycloak 单点登录，并通过 HAProxy Ingress 共享 Let's Encrypt TLS 证书。

## 新增内容

| 类别 | 工具 | 功能 | 状态 | 子域名 |
|---|---|---|---|---|
| **计算** | [JupyterHub](https://jupyter.org/hub) | 多用户笔记本（Python、R、Julia、SageMath、Octave） | ✅ 稳定 | `jupyter.*` |
| | [code-server](https://github.com/coder/code-server) | 浏览器中的 VS Code | ✅ 稳定 | `code.*` |
| | [RStudio Server](https://posit.co/products/open-source/rstudio-server/) | R IDE，支持 Shiny 应用 | 🟡 测试版 | `r.*` |
| | [Dask Gateway](https://gateway.dask.org/) | 分布式并行计算集群 | 🔵 计划中 | `compute.*` |
| **编辑** | [Overleaf CE](https://github.com/overleaf/overleaf) | 协作实时 LaTeX | ✅ 稳定 | `latex.*` |
| | [Slidev](https://github.com/slidevjs/slidev) | Markdown 转演示文稿 | 🟡 测试版 | `slides.*` |
| **AI** | [Open WebUI](https://github.com/open-webui/open-webui) | 本地 LLM 的类 ChatGPT 界面 | 🟡 测试版 | `ai.*` |
| | [Ollama](https://ollama.ai/) | 本地 LLM 后端（llama3.2、nomic-embed-text） | 🟡 测试版 | — |
| **可视化** | [Excalidraw](https://github.com/excalidraw/excalidraw) | 协作白板 | ✅ 稳定 | — |
| **基础设施** | [ttyd](https://github.com/tsl0922/ttyd) | 浏览器中的 Linux 终端 | ✅ 稳定 | `term.*` |
| | [KasmVNC](https://kasmweb.com/) | 浏览器中的完整 Linux 桌面 | 🟡 测试版 | `desktop.*` |

每个服务在机构的通配符 DNS 下获得自己的子域名——`jupyter.uni-marburg.de`、`r.uni-marburg.de`、`latex.uni-marburg.de` 等——通过 HAProxy Ingress 路由，自动配置 Let's Encrypt TLS 证书。

## 为何重要

openDesk Edu 已经提供学习管理（ILIAS、Moodle）、视频会议（BigBlueButton、Jitsi）、文件同步（Nextcloud、OpenCloud）和生产力工具（Collabora、XWiki、OpenProject）。缺少的是像 CoCalc 等平台提供给大学的**交互式计算基础设施**。

Collab Services 填补了这一空白。学生和研究人员现在可以：

- 使用 Python、R、Julia、SageMath 和 GNU Octave 内核运行 Jupyter 笔记本
- 使用 Overleaf CE 实时编写协作 LaTeX 文档
- 在专用 IDE 中开发 R 脚本和 Shiny 应用程序
- 在任何设备上通过浏览器使用 VS Code 编码，无需本地安装
- 通过 Open WebUI 与私有 LLM 聊天，由 Ollama 驱动
- 从浏览器访问完整的 Linux 终端或桌面环境
- 使用 Slidev 从 Markdown 创建演示文稿
- 向 Dask Gateway 集群提交分布式计算作业

所有这些都无需离开 openDesk Edu 生态系统，也无需配置任何额外基础设施。

## 架构

部署遵循 openDesk Edu 既定惯例。所有工具位于 `helmfile/apps/` 中，作为独立的应用组与现有教育及生产力服务并列。

### 仓库结构

```
opendesk-edu/
├── helmfile/apps/
│   ├── jupyterhub/          # 上游 Chart（hub.jupyter.org）
│   ├── overleaf/            # 上游 Chart（ghcr.io/sharelatex）
│   ├── open-webui/          # 上游 Chart（helm.openwebui.com）
│   ├── ollama/              # 上游 Chart（ollama.github.io）
│   ├── code-server/         # 上游 Chart（helm.coder.com）
│   ├── kasmvnc/             # 上游 Chart（registry.kasmweb.com）
│   ├── dask/                # 上游 Chart（helm.dask.org）
│   ├── rstudio/             # 自定义本地 Chart
│   ├── ttyd/                # 自定义本地 Chart
│   ├── slidev/              # 自定义本地 Chart
│   └── collab-dashboard/    # 自定义本地 Chart + React SPA
├── helmfile/charts/
│   ├── rstudio/             # Deployment + Service + Ingress + PVC
│   ├── ttyd/                # Deployment + Service + Ingress
│   ├── slidev/              # Init 容器 + nginx + PVC
│   ├── collab-dashboard/    # 提供 React SPA 的 nginx
│   └── opencloud-sidecar/   # 基于 rclone 的文件同步 Sidecar
└── collab-dashboard/        # React 应用源码（Vite + TypeScript + Tailwind）
    ├── src/
    │   ├── data/tools.ts    # 功能目录数据模型
    │   ├── components/
    │   │   ├── CardGrid.tsx
    │   │   └── ToolCard.tsx
    │   └── pages/Home.tsx
    ├── package.json
    ├── vite.config.ts
    └── Dockerfile
```

七个工具直接使用**上游 Helm Chart**。四个工具需要**自定义 Chart**，因为没有生产级质量的 Helm Chart：

| 自定义 Chart | 镜像 | 端口 | 存储 | 认证 |
|---|---|---|---|---|---|
| `rstudio` | `rocker/rstudio:4.4.2` | 8787 | 10Gi PVC | oauth2-proxy |
| `ttyd` | `tsl0922/ttyd:1.7.7` | 7681 | — | oauth2-proxy |
| `slidev` | `ghcr.io/slidevjs/slidev:0.49.0` → `nginx:alpine` | 80 | 1Gi PVC | oauth2-proxy |
| `collab-dashboard` | `weissto/collab-dashboard`（自定义构建） | 80 | — | oauth2-proxy |

### 部署顺序

Helmfile 按阶段分组发布，以尊重依赖链：

| 阶段 | 发布内容 |
|---|---|
| `010-infra` | ollama（LLM 后端——必须在 Open WebUI 之前运行） |
| `050-components` | jupyterhub、overleaf、open-webui、rstudio、code-server、ttyd、kasmvnc、dask、slidev |
| `060-frontend` | collab-dashboard（依赖服务可用） |

### 单点登录架构

所有服务通过 Keycloak 使用以下两种模式之一进行认证：

**模式 1：oauth2-proxy Sidecar**——注入与 RStudio、ttyd、Slidev、code-server 和 Collab Dashboard 相同 Pod 的反向代理 Sidecar。Sidecar 拦截端口 4180 上的所有传入 HTTP 流量，将未认证用户重定向到 Keycloak 的 OIDC 端点，并将已认证请求代理到本地端口上的应用程序容器。

**模式 2：原生 OIDC**——JupyterHub 使用 [OAuthenticator](https://oauthenticator.readthedocs.io/) 的 GenericOAuthenticator 类，Open WebUI 具有内置 OIDC 支持。两者都直接指向 Keycloak 的标准 OIDC 端点（`/realms/opendesk/protocol/openid-connect/...`）。

在马尔堡菲利普斯大学的实际生产环境中，Keycloak 配置了身份提供者重定向器，自动转发到 Shibboleth SAML。结果是一个无缝的认证链：

```
用户 → 服务（例如 RStudio）
  → oauth2-proxy 重定向到 Keycloak
    → Keycloak 自动重定向到 Shibboleth SAML
      → 大学登录（weblogin.uni-marburg.de）
        → SAML 断言 → Keycloak OIDC 令牌
          → 经过认证访问 RStudio
```

用户使用其大学凭证认证一次即可访问所有 11 个工具，无需重新认证。

### OpenCloud 存储集成

RStudio 还获得了一个 OpenCloud WebDAV Sidecar。该 Sidecar 使用 `rclone` 将用户的 OpenCloud 文件挂载到 RStudio 工作区，使 R 用户可以直接从 IDE 访问其文件同步存储：

```yaml
opencloud:
  enabled: true
  url: "https://opencloud.example.com"
  username: "demo"
  password: "demo"
  syncInterval: "60s"
```

相同的 `opencloud-sidecar` 模式计划用于 code-server 和 ttyd。

### Collab Dashboard

一个自定义 React SPA——使用 Vite、TypeScript 和 Tailwind CSS 构建——位于 `collab.*`，作为功能目录。它将每个 CoCalc 功能映射到其开源的 Kubernetes 原生替代方案：

```typescript
export const tools: CollabTool[] = [
  {
    id: 'jupyterhub',
    name: 'JupyterHub',
    description: '多用户笔记本，支持 Python、R、Julia、SageMath 和 Octave 内核。',
    coCalcFeature: '↔ Jupyter Notebooks',
    category: 'computing',
    status: 'stable',
  },
  {
    id: 'overleaf',
    name: 'Overleaf CE',
    coCalcFeature: '↔ 协作 LaTeX',
    category: 'editing',
    status: 'stable',
  },
  // ... 另外 9 个工具
];
```

该仪表板由 nginx 容器提供，并受相同的 oauth2-proxy Sidecar 保护，确保只有经过认证的用户可以浏览服务目录。

## 如何部署

Collab Services 是 Codeberg 上 `main` 分支的一部分。使用 Helmfile 选择器与 openDesk Edu 的其他部分一起部署：

```bash
# 部署单个工具
helmfile -e prod apply --selector name=rstudio

# 先部署 LLM 后端，再部署 AI 界面
helmfile -e prod apply --selector name=ollama
helmfile -e prod apply --selector name=open-webui

# 一次性全部部署
helmfile -e prod apply
```

对于 Helmfile 协调之外的独立部署，每个自定义 Chart 支持直接 Helm 安装：

```bash
helm upgrade --install rstudio ./helmfile/charts/rstudio \
  --namespace opendesk-edu \
  --set ingress.hosts[0].host=r.${DOMAIN} \
  --set oauth2.enabled=true \
  --set oauth2.clientSecret=${CLIENT_SECRET} \
  --set oauth2.cookieSecret=$(openssl rand -hex 16) \
  --set oauth2.oidcIssuerUrl=https://id.${DOMAIN}/realms/opendesk
```

对于使用原生 OIDC 的 JupyterHub：

```bash
helm upgrade --install jupyterhub jupyterhub/jupyterhub \
  --namespace opendesk-edu \
  --set ingress.enabled=true \
  --set ingress.hosts[0]=jupyter.${DOMAIN} \
  --set hub.config.GenericOAuthenticator.client_id=opendesk-jupyterhub \
  --set hub.config.GenericOAuthenticator.client_secret=${JH_CLIENT_SECRET} \
  --set hub.config.GenericOAuthenticator.oauth_callback_url=https://jupyter.${DOMAIN}/hub/oauth_callback \
  --set hub.config.GenericOAuthenticator.authorize_url=https://id.${DOMAIN}/realms/opendesk/protocol/openid-connect/auth
```

启用认证前，必须为每个服务创建 Keycloak OIDC 客户端。详情请参阅 [OAuth2-proxy 配置指南](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/oauth2-proxy-config.md)。

## 验证

一个烟雾测试脚本（`scripts/smoke-test.sh`）验证所有服务是否正确响应。2026 年 5 月 28 日马尔堡大学 HRZ 集群的实际结果：

```
=== Collab Services 烟雾测试 ===
域名：opendesk.hrz.uni-marburg.de | Ingress：192.168.3.201

  ✅ RStudio (r) → HTTP 302
  ✅ ttyd (term) → HTTP 302
  ✅ Dashboard (collab) → HTTP 302
  ✅ Slidev (slides) → HTTP 200
  ✅ Open WebUI (ai) → HTTP 200
  ✅ JupyterHub (jupyter) → HTTP 302
  ✅ code-server (code) → HTTP 302

  加上现有服务：
  ✅ ILIAS (lms) → HTTP 200
  ✅ Moodle (moodle) → HTTP 200

✅ 烟雾测试完成——所有 9 个服务正常运行
```

所有五个自定义 Chart 还通过了专用的 Helm 测试连通性检查，使用 `nc -z`（TCP 端口探测）：

```bash
$ helm test rstudio -n opendesk-edu          → ✅ 通过
$ helm test ttyd -n opendesk-edu             → ✅ 通过
$ helm test slidev -n opendesk-edu           → ✅ 通过
$ helm test collab-dashboard -n opendesk-edu → ✅ 通过
$ helm test code-server -n opendesk-edu      → ✅ 通过
```

## 下一步：B 阶段和 C 阶段

Collab Services 计划分三个阶段进行。A 阶段（基础）已完成。还有两个阶段在路线图上。

**B 阶段——核心工具完善**
- 通过 singleuser 镜像配置为 SageMath、Octave 和 Julia 内核提供完整的 JupyterHub 配置
- Overleaf CE 具有持久存储和实时协作调优
- 更深入的 Open WebUI + Ollama 集成，通过 Ollama API 进行模型管理
- 根据试点用户反馈调整生产配置值

**C 阶段——剩余工具和打磨**
- KasmVNC 和 Dask 具有完整的生产就绪配置
- Nubus 导航中为所有 11 个服务添加门户磁贴
- React 仪表板中的功能详情页面（每个工具的路由，带文档）
- OpenCloud Sidecar 扩展到 code-server 和 ttyd
- 每个工具的资源配额建议

## 参与贡献

Collab Services 是开源（Apache 2.0）的，属于 Codeberg 上的 [opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu) 仓库。该仓库双向镜像到 [GitHub](https://github.com/opendesk-edu/opendesk-edu)。

**实用链接：**

- [部署指南](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/collab-services-deployment.md)——每个工具的逐步说明
- [设计规范](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/superpowers/specs/2026-05-27-collab-services-design.md)——完整架构和 CoCalc 功能映射
- [OAuth2-proxy 配置](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/oauth2-proxy-config.md)——每个服务的 Keycloak 客户端设置
- [实施计划](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/superpowers/plans/2026-05-27-collab-services-phase-a.md)——A 阶段的详细任务分解

**今天部署：**

```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
cd opendesk-edu
helmfile -e prod apply --selector name=jupyterhub
```

问题、错误报告和贡献欢迎通过 [Codeberg Issues](https://codeberg.org/opendesk-edu/opendesk-edu/issues) 或 [Matrix 频道](https://matrix.to/#/#opendesk-edu:matrix.org) 提交。

---

*openDesk Edu 是一个面向高等教育的开源数字工作平台。它将 [openDesk Community Edition](https://www.opencode.de/en/opendesk) 扩展至学习管理、视频会议、文件同步以及现在的科学计算工具——全部在 Kubernetes 上，具有统一的单点登录。基于 Apache 2.0 许可证。*

*该项目在马尔堡菲利普斯大学的 [Hochschulrechenzentrum (HRZ)](https://www.uni-marburg.de/en/hrz) 开发，作为该大学数字主权战略的一部分。*
