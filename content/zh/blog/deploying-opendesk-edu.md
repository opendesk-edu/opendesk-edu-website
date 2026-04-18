---
title: "在高校基础设施上部署 openDesk Edu"
date: "2026-04-18"
description: "从搭建 Kubernetes 集群到配置 DFN-AAI 和 eduGAIN 的 SAML 联邦认证，手把手教你在高校环境中部署 openDesk Edu。"
categories: ["教程"]
tags: ["部署", "基础设施", "kubernetes"]
---

# 在高校基础设施上部署 openDesk Edu

本指南将带你逐步完成在高校 Kubernetes 基础设施上部署 openDesk Edu 的全过程。部署完成后，你将拥有一个包含 25 个集成服务的完整数字化办公平台——所有服务通过统一的 Keycloak SSO 连接。

## 前置条件

在开始之前，请确保以下条件已满足：

- **Kubernetes 集群** — 版本 1.28 或更高。可以是裸金属集群、云托管服务，或基于 Proxmox VE、OpenStack 的本地部署。
- **Helm 3** — Kubernetes 包管理器。从 [helm.sh](https://helm.sh) 安装。
- **Helmfile** — 管理 openDesk Edu 所有 Chart 的编排层。从 [helmfile.readthedocs.io](https://helmfile.readthedocs.io/) 安装。
- **域名和 DNS 记录** — 需要一个基础域名（如 `desk.example-univ.edu.cn`），并配置通配符 DNS 指向你的 Ingress 控制器。TLS 证书将自动签发。
- **充足的计算资源** — 生产环境至少需要 8 个 CPU 核心和 16 GB 内存。存储需求取决于用户数量和启用的服务。

## 第一步：克隆仓库

首先克隆 openDesk Edu 仓库：

```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
cd opendesk-edu
```

花点时间浏览一下目录结构。关键目录包括：

- `helmfile/` — 包含所有 helmfile 配置和环境定义
- `charts/` — 每个服务独立的 Helm Chart
- `docs/` — 关于配置、扩缩容和监控的详细文档

## 第二步：配置参数

核心配置文件是 `helmfile/environments/default/global.yaml.gotmpl`。这个 Go 模板文件控制着整个平台中每个服务的设置。用编辑器打开它并调整以下内容：

**域名配置：**

```yaml
global:
  domain: "desk.example-univ.edu.cn"
```

**邮件设置** — 群件和通知服务所必需：

```yaml
global:
  mail:
    host: "smtp.example-univ.edu.cn"
    port: 587
    fromAddress: "noreply@example-univ.edu.cn"
```

**存储类** — 设置为与你集群的存储提供商匹配：

```yaml
global:
  storageClass: "ceph-rbd"
```

**服务选择** — 你可以单独启用或禁用每个服务。如果学校已经在使用 Moodle，可以关闭它并保留 ILIAS：

```yaml
services:
  ilias:
    enabled: true
  moodle:
    enabled: false
  bigbluebutton:
    enabled: true
```

模板系统会自动将这些值传递给所有依赖的 Chart，无需手动编辑单个 Chart 的 values 文件。

## 第三步：使用 Helmfile 部署

配置就绪后，执行部署：

```bash
helmfile -e default apply
```

这单条命令会用你的配置渲染所有 Helm Chart，解析依赖顺序，然后将整个平台部署到集群。Helmfile 负责管理部署序列——Keycloak 和 Ingress 控制器等基础设施服务先部署，应用服务随后启动。

首次部署通常需要 10 到 20 分钟，取决于集群容量和网络速度。可以用以下命令监控进度：

```bash
kubectl get pods -n opendesk -w
```

等待所有 Pod 都显示 `Running` 状态后再继续。

## 第四步：配置 Keycloak 的 SAML/SSO

openDesk Edu 使用 Keycloak 作为中央身份提供商。对于高校部署，推荐的方式是接入学校现有的 SAML 联邦认证——德国的 DFN-AAI 或国际化的 eduGAIN。

**在 Keycloak 中配置 SAML 身份提供商：**

1. 访问 Keycloak 管理控制台 `https://keycloak.desk.example-univ.edu.cn`
2. 进入你的 Realm，添加新的 SAML 身份提供商
3. 导入你的联邦元数据 XML（可从 DFN-AAI 或 eduGAIN 管理界面获取）
4. 将 SAML 属性映射到 Keycloak 用户属性：

| SAML 属性 | Keycloak 映射 | 用途 |
|---|---|---|
| `eduPersonPrincipalName` | 用户名 | 唯一标识符 |
| `eduPersonAffiliation` | 角色 | 学生/教职工/教师 |
| `eduPersonEntitlement` | 用户组 | 课程和权限组 |
| `mail` | 邮箱 | 联系地址 |

**对于 ILIAS、Moodle 和 BigBlueButton**，openDesk Edu 部署了 Shibboleth 作为 SAML 代理。这些服务通过 Shibboleth 接收属性，而非直接从 Keycloak 获取。代理负责属性过滤和各服务的策略管理，保持联邦元数据的整洁。

配置好身份提供商后，通过访问 Nubus 门户测试登录流程。你应该会被重定向到学校的统一认证页面，然后带着联邦属性返回门户。

## 第五步：验证部署

按以下清单逐项确认一切正常运行：

1. **门户访问** — 在浏览器中打开 `https://desk.example-univ.edu.cn`。Nubus 门户应该加载并显示所有已启用的服务。
2. **SSO 登录** — 点击任意服务。你应该通过 Keycloak 自动完成认证，无需再次输入凭据。
3. **文件共享** — 在 Nextcloud 或 OpenCloud 中创建一个测试文件，确认刷新页面后文件仍然存在。
4. **视频会议** — 在 Jitsi 或 BigBlueButton 中发起一次测试会议，确认音视频正常工作。
5. **LMS 访问** — 登录 ILIAS 或 Moodle，确认你的联邦属性（姓名、邮箱、角色）正确显示。

如果某个服务出现错误，查看 Pod 日志：

```bash
kubectl logs -n opendesk -l app.kubernetes.io/name=<服务名> --tail=50
```

## 故障排除

以下是最常见的问题及解决方案：

**Pod 一直处于 `Pending` 状态** — 通常是资源或存储问题。用 `kubectl describe pod <名称>` 检查节点容量，确认存储类可用。

**证书错误** — openDesk Certificates 运算符自动管理 TLS。如果证书签发失败，检查域名的 DNS 记录是否正确，以及运算符能否访问 Bundesdruckerei CA。也可以配置 cert-manager 使用 Let's Encrypt 作为备选方案。

**SSO 重定向循环** — 通常意味着 SAML 身份提供商的元数据配置有误，或者断言消费服务 URL 与你的域名不匹配。仔细检查 Keycloak 身份提供商的设置，确保服务 URL 使用 HTTPS。

**内存占用过高** — BigBlueButton 和 Collabora 是最耗资源的两个服务。如果硬件资源有限，可以考虑禁用 BigBlueButton 改用 Jitsi，或者在全局配置中设置资源限制。

**备份失败** — openDesk Edu 使用 k8up 进行自动备份。如果备份失败，检查 k8up 运算符的日志，确认集群能访问你的 S3 兼容存储端点。

## 后续步骤

部署运行后，建议进行以下操作：

- 使用 Prometheus 和 Grafana 仪表盘搭建监控体系，实时掌握服务健康状态
- 配置备份计划并测试恢复流程
- 根据学校品牌定制门户主题
- 参考权限文档配置基于角色的访问控制

更多详情，请参阅完整文档：[codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu)。
