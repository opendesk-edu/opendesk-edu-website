---
title: "网络和流量架构"
date: "2026-08-27"
description: "网络流量如何进入 openDesk Edu 集群，经过 DNS、TLS 终止、Ingress 路由和网络策略到达服务——完整的流量路径。"
categories: ["architecture", "infrastructure"]
tags: ["architecture", "networking", "dns", "tls", "ingress", "traefik", "certificates", "network-policies", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/networking-traffic-flow-teaser.svg"
---

# 网络和流量架构

对平台的每个请求——无论是学生查看邮件、教授上传课程材料，还是管理员配置服务——都经过相同的网络路径。理解该路径对于需要排除连接故障、规划容量或实施安全策略的运维人员至关重要。本文记录了完整的流量路径：从 DNS 解析到 TLS 终止、Ingress 路由和网络策略执行，直到 individual 服务 Pod。

对于流量到达后进行认证的身份层，请参阅[身份与认证架构](/architecture/identity-authentication)。有关完整的平台概览，请参阅[系统架构概览](/architecture/overview)。

## 流量路径

当用户浏览器请求 `https://cloud.example.edu` 时，请求在到达应用 Pod 之前经过多个层。每层有特定的职责，按顺序理解它们是诊断任何连接问题的关键。

```
用户浏览器
    │
    ▼
DNS 解析 ──► Ingress 控制器的 IP 地址
    │
    ▼
TLS 终止 ──► 呈现证书，HTTPS 握手
    │
    ▼
Ingress 控制器 (Traefik) ──► 匹配路由规则，检查 Host 头
    │
    ▼
网络策略 ──► 允许/拒绝 Pod 间流量
    │
    ▼
服务 (Kubernetes Service) ──► 负载均衡到健康的 Pod
    │
    ▼
应用 Pod ──► 处理请求，返回响应
```

### 第 1 层：DNS 解析

旅程从 DNS 开始。当用户在浏览器中输入 `cloud.example.edu` 时，浏览器查询其配置的 DNS 解析器，解析器从根区域通过顶级域名（`.edu`）到机构的权威名称服务器的链路。

机构的 DNS 配置将每个服务主机名映射到集群的 Ingress IP 地址。典型设置使用通配符 DNS 或单独的 A/AAAA 记录：

- `cloud.example.edu` → Ingress IP（Nextcloud）
- `meet.example.edu` → Ingress IP（BigBlueButton）
- `auth.example.edu` → Ingress IP（Keycloak）
- `portal.example.edu` → Ingress IP（Nubus）

所有服务共享相同的 Ingress IP。区分在 Ingress 控制器层（第 3 层）进行，它检查 `Host` 头以将流量路由到正确的服务。这意味着单个 IP 地址服务整个平台——Ingress 控制器充当反向代理，基于主机名分配流量。

一些机构使用指向 Ingress IP 的通配符 DNS 记录（`*.example.edu`），这在添加新服务时简化了配置。其他机构更喜欢单独记录以获得更严格的控制。两种方法都可以；选择是运维偏好。

### 第 2 层：TLS 终止

当浏览器连接到 Ingress IP 的 443 端口时，Ingress 控制器呈现 TLS 证书。该证书证明服务器身份并加密连接。平台在 Ingress 层处理 TLS——单个应用 Pod 不需要自己的证书。

#### 证书来源

平台支持多种证书来源：

- **openDesk Certificates（Bundesdruckerei）**：默认和推荐的来源。机构从 Bundesdruckerei 获取 TLS 证书，在机构控制下提供证书。这将信任链完全保持在机构内部——不涉及外部证书颁发机构。
- **cert-manager 与 Let's Encrypt**：适用于偏好自动证书颁发的机构。cert-manager 与 ACME 协议集成，自动获取和续订 Let's Encrypt 证书。适用于评估环境或没有现有 PKI 的机构。
- **自定义 CA / 机构 PKI**：拥有自己证书颁发机构的机构可以直接导入证书。这在运营自己 PKI 基础设施的大型大学中很常见。

#### 证书管理

无论来源如何，证书都作为 Kubernetes TLS 密钥管理。Ingress 控制器在其 TLS 配置中引用这些密钥。证书续订是自动化的：

- **openDesk Certificates**：通过机构的采购流程续订。平台监控证书到期并在需要续订前提醒运维人员。
- **cert-manager / Let's Encrypt**：在到期前 30 天自动续订。cert-manager 处理 ACME 挑战（HTTP-01 或 DNS-01）并更新 TLS 密钥，无需运维干预。
- **自定义 CA**：续订取决于机构的 CA 策略。运维人员必须在到期前手动替换 TLS 密钥。

#### TLS 配置

平台强制执行现代 TLS 标准：

- **TLS 1.2 最低**（在支持的地方优先使用 TLS 1.3）
- **HSTS**（HTTP 严格传输安全），长 max-age，包括子域名
- **现代密码套件**（无 RC4、无 3DES、无 SHA1）
- **OCSP 装订**（在证书来源支持的地方）

所有 HTTP 流量重定向到 HTTPS。没有未加密的流量到达应用 Pod。Ingress 控制器在转发任何请求之前处理重定向（301）。

### 第 3 层：Ingress 控制器（Traefik）

Ingress 控制器是平台的前门。它接收所有传入的 HTTPS 流量，检查 `Host` 头，匹配路由规则，并将请求转发到适当的 Kubernetes 服务。

#### 为什么选择 Traefik

Traefik 是平台的默认 Ingress 控制器。它被选中是因为：

- **动态配置**：Traefik 从 Kubernetes API 实时读取 Ingress 资源。添加新服务不需要重新加载控制器——Traefik 检测新 Ingress 并立即路由流量。
- **Let's Encrypt 集成**：内置 ACME 客户端，用于自动证书管理（当使用 Let's Encrypt 作为证书来源时）。
- **中间件支持**：Traefik 中间件处理速率限制、认证转发、头操作和重定向强制。
- **原生 Kubernetes 集成**：Traefik 使用标准 Kubernetes Ingress API，并支持 IngressRoute（Traefik 的自定义资源）用于高级配置。
- **可观测性**：内置指标（Prometheus）和追踪（OpenTelemetry），用于流量分析和故障排除。

一些机构在 Traefik 旁边部署 HAProxy 用于特定的负载均衡场景（例如，BigBlueButton 的 UDP 视频流量，Traefik 不原生处理）。在这些设置中，Traefik 处理 HTTP/HTTPS，HAProxy 处理非 HTTP 流量。

#### 路由规则

路由通过 Kubernetes Ingress 资源（或 IngressRoute CRD）配置。每个服务都有自己的 Ingress 定义，指定：

- **主机**：触发此路由的主机名（例如 `cloud.example.edu`）
- **路径**：可选的基于路径的路由（例如 `/api` vs `/web`）
- **服务**：目标 Kubernetes 服务和端口
- **TLS**：引用此主机的 TLS 密钥
- **中间件**：速率限制、头操作等

Ingress 控制器为每个传入请求评估这些规则。第一个匹配的规则获胜。如果没有规则匹配，控制器返回 404。

#### 速率限制和安全中间件

Ingress 控制器对每个请求应用多个中间件：

- **速率限制**：防止暴力攻击和滥用。限制按服务配置，可根据服务的流量模式调整。
- **安全头**：添加 `X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、`X-XSS-Protection` 和 `Content-Security-Policy` 头。
- **请求大小限制**：防止过大的负载压垮服务。
- **超时强制**：通过强制连接和读取超时来防止慢速攻击。

### 第 4 层：网络策略

一旦 Ingress 控制器将流量转发到 Kubernetes 服务，网络策略就控制哪些 Pod 可以与哪些其他 Pod 通信。网络策略是 Kubernetes 原生的网络分段强制方式。

#### 默认拒绝模型

平台使用默认拒绝模型：所有 Pod 间流量都被拒绝，除非明确允许。这意味着：

- Web 前端 Pod 可以到达数据库 Pod（因为策略允许）
- Web 前端 Pod 不能到达另一个租户的数据库 Pod（因为没有策略允许）
- 攻破一个 Pod 的外部攻击者不能随意转向其他服务（因为网络策略限制了横向移动）

#### 命名空间隔离

平台使用 Kubernetes 命名空间在服务组之间提供逻辑隔离：

- 每个主要服务（或相关服务组）在自己的命名空间中运行
- 网络策略控制命名空间间流量
- 跨命名空间通信是显式的（策略必须允许）而非隐式的

这种命名空间结构提供了爆炸半径遏制：如果一个服务被攻破，攻击者到达其他服务的能力受到命名空间间网络策略的限制。

#### 典型策略模式

常见的网络策略模式包括：

- **前端 → 后端**：允许 Web 前端命名空间在特定端口上到达后端 API 命名空间的策略
- **后端 → 数据库**：允许后端命名空间仅在数据库端口上到达数据库命名空间的策略
- **Ingress → 所有**：允许 Ingress 控制器命名空间在 HTTP/HTTPS 端口上到达所有服务命名空间的策略
- **监控 → 所有**：允许监控命名空间（Prometheus）在所有命名空间中抓取指标端点的策略

每个策略都限定在最低必要权限。没有策略允许"所有流量到所有 Pod"——这将破坏网络分段的目的。

### 第 5 层：服务和 Pod

最后一层是应用 Pod 本身。流量经过 DNS、TLS、Ingress 和网络策略后，到达 Kubernetes 服务，该服务在健康的 Pod 之间进行负载均衡。

#### 服务发现

Kubernetes 服务提供稳定的虚拟 IP 地址（ClusterIP），将流量路由到健康的 Pod。当 Pod 创建、销毁或变得不健康时，服务自动更新其端点列表。应用不需要了解 Pod 生命周期变化——它只需处理请求。

#### Pod 级通信

在一个 Pod 内，容器通过 `localhost` 通信。在同一命名空间内的 Pod 之间，通信使用 ClusterIP。在命名空间之间，通信使用完全限定的服务名称（例如 `database.backend-namespace.svc.cluster.local`）。

## DNS 架构

### 外部 DNS

机构的外部 DNS 配置将公共主机名映射到集群的 Ingress IP。这是所有外部流量的入口点。

### 内部 DNS（CoreDNS）

在集群内部，CoreDNS 处理服务发现。每个 Kubernetes 服务获得一个 DNS 记录：

- `servicename.namespace.svc.cluster.local` — 完全限定名称
- `servicename.namespace` — 短名称（在同一集群内）
- `servicename` — 最短名称（在同一命名空间内）

应用使用这些 DNS 名称来访问其他服务。例如，前端 Pod 使用 `database.backend:3306` 而不是 IP 地址连接到数据库。这种抽象意味着 Pod 可以移动、重启和扩展，而无需配置更改。

### 自定义 DNS 条目

平台支持需要特定主机名配置的服务的自定义 DNS 条目（例如，Keycloak 的 SAML 端点需要精确的主机名匹配）。这些通过 CoreDNS 自定义配置或 ExternalName 服务配置。

## TLS 证书管理

### 信任链

平台的 TLS 信任链旨在将所有控制权保持在机构内部：

1. **信任根**：机构的证书颁发机构（或 openDesk Certificates 的 Bundesdruckerei）签署 TLS 证书
2. **证书存储**：证书作为 Kubernetes TLS 密钥存储，仅 Ingress 控制器和需要它们的服务可访问
3. **证书呈现**：Ingress 控制器在 TLS 握手期间向客户端呈现证书
4. **证书续订**：续订是自动化的（cert-manager）或受监控的（自定义 CA），确保没有证书在无人干预的情况下过期

### 证书范围

每个主机名获得自己的证书，或通配符证书覆盖所有子域名。选择取决于机构的 PKI：

- **单独证书**：更严格的安全（每个证书独立），但需要管理更多证书
- **通配符证书**：更简单的管理（一个证书覆盖所有子域名），但受损的通配符证书影响所有服务

平台支持两种方法。默认配置使用每个服务的单独证书，但也支持偏好通配符证书的机构。

## 网络安全态势

### 传输中加密

所有流量都加密：

- **外部流量**：用户浏览器和 Ingress 控制器之间的 HTTPS（TLS 1.2+）
- **内部流量**：Pod 间流量可以使用 mTLS（双向 TLS）加密，但这取决于服务网格配置。默认情况下，集群内的 Pod 间流量未加密（依靠网络策略进行隔离），但可以为需要的服务启用 mTLS。

### DDoS 防护

Ingress 控制器通过速率限制和连接限制提供基本的 DDoS 防护。对于面临复杂攻击的机构，可以在集群前面放置外部 DDoS 防护服务（例如，机构的上游提供商或专用 DDoS 缓解服务）。

### 防火墙集成

集群的主机防火墙（例如 iptables、nftables 或云提供商的安全组）将传入流量限制为平台所需的端口：

- **端口 443（HTTPS）**：所有用户流量
- **端口 80（HTTP）**：仅重定向到 HTTPS（无应用流量）
- **端口 22（SSH）**：仅管理访问，限制到管理网络

所有其他传入端口都关闭。Pod 间流量由 Kubernetes 网络策略管理，而非主机防火墙。

## 故障模式和故障排除

### DNS 解析失败

**症状**：用户看到"无法访问此网站"或 `NXDOMAIN` 错误。
**原因**：DNS 记录配置错误或 DNS 提供商不可用。
**解决方案**：验证 A/AAAA 记录指向正确的 Ingress IP。使用 `dig` 或 `nslookup` 检查 DNS 传播。

### TLS 证书过期

**症状**：用户看到"您的连接不是私密的"或 `NET::ERR_CERT_DATE_INVALID`。
**原因**：TLS 证书已过期。
**解决方案**：对于 cert-manager 管理的证书，检查 cert-manager 日志和 Certificate 资源状态。对于自定义 CA 证书，用续订的证书替换 TLS 密钥。

### Ingress 路由失败

**症状**：用户看到 404 或 502 错误。
**原因**：Ingress 资源配置错误、目标服务没有健康的 Pod、或 Ingress 类错误。
**解决方案**：检查 Ingress 资源（`kubectl get ingress`），验证服务有端点（`kubectl get endpoints`），并检查 Traefik 仪表板的路由规则。

### 网络策略拒绝

**症状**：一个服务无法到达另一个服务（超时或连接被拒绝）。
**原因**：网络策略阻止了流量。
**解决方案**：检查源和目标命名空间中的网络策略。使用 `kubectl exec` 从源 Pod 测试连接。暂时放宽策略以确认诊断，然后将其收紧到最低必要权限。

---

## 延伸阅读

- [系统架构概览](/architecture/overview) — 完整的平台架构
- [身份与认证架构](/architecture/identity-authentication) — 流量到达后认证如何工作
- [安全架构](/architecture/security) — 安全控制、密钥、RBAC 和合规
- [存储和数据管理架构](/architecture/storage-data-management) — 持久存储、数据库和备份
- [安全与合规](/blog/security-compliance) — 关于平台安全和合规方法的博客文章
- [主权云：SCS vs Proxmox + K3s](/blog/scs-vs-proxmox-k3s) — 关于基础设施平台比较的博客文章

---

*每个请求在从浏览器到 Pod 的旅程中都讲述一个故事。了解路径意味着知道出问题时去哪里寻找。*
