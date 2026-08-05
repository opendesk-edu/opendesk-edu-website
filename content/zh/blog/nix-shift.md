---
title: "Nix转型：100% NixOS 容器用于 openDesk Edu"
date: "2026-08-05"
description: "完整的 NixOS 容器迁移：78 个服务、0 个 CVE、Cosign 签名镜像、每个镜像的 SBOM、完整的 K8s 部署在 HRZ K3s 上。"
categories: ["Engineering"]
tags: ["nix", "nixos", "containers", "docker", "kubernetes", "openspec", "devops", "security", "sbom", "cosign"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/nix-shift-teaser.svg"
---

# Nix转型：100% NixOS 容器用于 openDesk Edu

> **🇨🇳 更新（2026-08-05）：第三阶段已完成。** 本文已更新，包含完整的注册表推送、安全扫描（0 CVE）、Cosign 签名、SBOM 生成以及面向 HRZ K3s 集群的 Kubernetes 部署清单的详细信息。
>
> 🇬🇧 The English version covers Phase 2+3 in depth: [The Nix Shift: 100% NixOS Containers for openDesk Edu](/en/blog/nix-shift)

## 问题

使用 Helmfile 和 Go 模板的部署带来了已知的痛点：

```
failed to render values file "values-grommunio.yaml.gotmpl":
  template: stringTemplate:17: unexpected "\\" in operand
```

这个错误会阻塞**所有**服务，而不仅仅是一个。因为 Helmfile 在一个步骤中处理
所有模板，任何一处 YAML 语法错误都会中止整个集群更新。

症状：

- **级联故障** — `values-grommunio.yaml.gotmpl` 中的一个拼写错误会导致整个部署
 瘫痪，即使只有一个服务需要更新。
- **错误信息不透明** — Helmfile 吞没了实际上下文。我们得到的不是"第 12 行，
  第 3 列：未定义变量"，而是晦涩的 Go 模板堆栈跟踪。
- **无缓存保证** — `helmfile sync` 每次都重新渲染所有模板，即使某个服务没有任何
  变化。
- **难以重现** — 同一个提交在 CI 上产生的结果与本地不同，因为 Helmfile 会隐式
  吸收环境变量和 `.env` 文件。

## Nix 方法

Nix 是纯函数式的。每次构建都是确定性的且被缓存。我们不再使用运行时渲染的命令式
模板，而是将每个服务描述为一个**纯函数** — 输入进入，清单输出，无副作用。

**之前：** `helmfile sync → helm template → Go 模板 → YAML → kubectl apply`

**之后：** `nix build .#sogo5-image → 纯 Nix → JSON → kubectl apply`

关键区别：Nix **缓存**每个结果。如果某个服务没有变化，它将从 Nix store 加载 —
无需渲染，无需重新计算。

> **注意：** Helmfile 和 Nix 目前共存。`opendesk-nix/k8s/services/` 中基于 Nix 的
> Kubernetes 清单是对现有 Helmfile charts 的补充，并非完全取代。新服务直接在 Nix
> 中定义；现有服务逐步迁移。

## 架构

`opendesk-nix` 项目有两大支柱：

### 1. 容器镜像 (flake.nix)

`flake.nix` 使用 `dockerTools.buildLayeredImage` 构建可重现的容器镜像：

```nix
# flake.nix (简化)
{
  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" ] (system:
      let pkgs = import nixpkgs { inherit system; }; in {
        packages = {
          sogo5-image = pkgs.dockerTools.buildLayeredImage {
            name = "registry.gitlab.opencode.de/umr/sogo5";
            tag = commonArgs.sogo5Version;
            // ... 层定义
          };
          sogo6-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
          dev-agent-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
          zot-registry-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
        };
      });
}
```

### 2. Kubernetes 清单 (k8s/services/)

每个服务都是一个 Nix 函数，返回 JSON 格式的 Kubernetes 资源。
`lib/k8s.nix` 库提供类型安全的构建器：

```nix
# k8s/services/moodle.nix (简化)
{ lib, security, ... }:

let
  name = "moodle";
  image = "ghcr.io/opendesk-edu/moodle";
  tag = "latest";
in
  [
    (lib.deployment { inherit name image tag; port = 80; })
    (lib.service { inherit name; port = 80; })
  ] ++ (lib.ingressWithCert {
    inherit name;
    host = "moodle.opendesk-edu.org";
    port = 80;
  })
```

`lib.deployment`、`lib.service` 和 `lib.ingressWithCert` 构建器生成 Deployment、
Service、Ingress 和 TLS 证书 — 全部作为类型化的 Nix 派生。错误在**构建时**出现，
而非**运行时**。

`lib/k8s.nix` 库提供更多构建器：`statefulset`、`daemonSet`、`hpa`
（HorizontalPodAutoscaler）、`pdb`（PodDisruptionBudget）、`job`、`secret`、`pvc`、
`namespace`、`role`、`certificate`、`issuer` — 全部具有一致的安全标准
（non-root、只读 FS、dropped capabilities）。

### 69 个服务

目前有 69 个服务定义为 Nix 模块 — 从 LMS（Moodle、ILIAS）到协作工具
（Nextcloud、Etherpad、CryptPad）再到监控（Loki、Promtail、Kibana）。每个服务
遵循相同的模式：一个返回 Kubernetes 资源的 Nix 模块。

## 结果

| 指标 | Helmfile | Nix |
|------|----------|-----|
| 错误清晰度 | "failed to render" | "第 12 行：未定义变量" |
| 确定性 | 否 | 是 |
| 服务数 | 69 | 69 |
| 可重现性 | 依赖环境 | 逐位相同 |
| 回滚 | 手动（`helm rollback`） | `git revert` `flake.lock` |
| 镜像构建 | Dockerfile + CI | `nix build .#sogo5-image`（缓存） |

> 部署时间（约 3 分钟 vs 约 30 秒）和缓存命中率（90%）是实际估算，
> 不是保证的基准测试。

## 迁移：逐步进行

迁移是增量式的 — 不是一次性切换，而是逐个服务：

1. **双运行** — Helmfile 和 Nix 并行运行。新服务直接在 Nix 中定义；现有服务
   保留在 Helmfile 上。
2. **一致性测试** — 对于每个迁移的服务，我们用 `diff` 比较 Nix 和 Helmfile 清单。
   只有输出完全相同时才切换服务。
3. **Flake 锁定** — `flake.lock` 锁定所有输入（nixpkgs 版本、镜像摘要、配置哈希）。
   回滚就是对锁文件执行 `git revert`。
4. **CI 集成** — GitHub Actions 使用 `nix build` 构建每个镜像并推送。
   `kubectl apply` 是幂等的，只需几秒钟。

## 经验教训

**效果好的方面：**
- 增量迁移 — 对运行中的服务无风险
- Nix store 作为构建缓存 — 大多数服务在每次部署时都被缓存
- JSON 替代 YAML — 无缩进错误，无模板语言
- 安全标准直接内置在构建器中（`lib/security.nix`）— non-root、只读 FS、
  dropped capabilities 是默认值，而非可选项

**意外的发现：**
- Nix 的学习曲线确实存在，但我们实际需要的范围（`lib.deployment`、`flake.lock`、
  `nix build`）是可控的
- CI 构建变得**更快**，而不是更慢 — 得益于缓存
- 调试更愉快：`nix build` 给出带行号的精确错误

**我们会避免的：**
- 不在 Nix 表达式中使用 `if` 条件来处理环境差异 — 而是使用单独的环境模块
  （`k8s/environments/demo/`、`k8s/environments/local/`）
- 不内联 secrets — secrets 保留在 Kubernetes Secrets 中，不在 Nix store 中

## 展望（第二阶段+第三阶段已完成 ✅）

Nix 为我们的部署管道扩展了确定性构建层。openDesk Edu 的 69 个服务 — 现已增至
**78 个服务** — 可以可重现地构建，每次构建都逐位相同。

**第二阶段（NixOS 容器）：** 本文描述的方法已被推向极致：不仅 Kubernetes 清单
用 Nix 定义，**容器镜像本身也被构建为 NixOS 系统**。所有 78 个服务现在拥有：
- 完整的 NixOS 容器配置
- 确定性和可重现的构建
- 比 Dockerfile 构建小约 20% 的镜像

**第三阶段（注册表推送与 K8s 部署）：** 所有 78 个镜像已：
- 推送到注册表：`registry.opencode.de/umr/opendesk-edu/opendesk-nix`
- 通过 Grype 扫描 — 所有镜像 **0 个 CVE**
- **通过 Cosign 签名**（GitHub OIDC）
- 为每个镜像配备 **SBOM**（SPDX 2.3 JSON）
- 提供完整的 **Kubernetes 清单**，可用于 HRZ K3s 集群

### OpenSpec 合规性

| 要求 | 状态 | 实现 |
|------|------|------|
| **FR-BUILD-001 至 FR-BUILD-007** | ✅ 全部 7 项 | Nix flakes，纯函数 |
| **FR-IMAGE-001 至 FR-IMAGE-009** | ✅ 全部 9 项 | OCI 标签，健康检查，非 root |
| **FR-SEC-001 至 FR-SEC-004** | ✅ 全部 4 项 | 非 root，只读文件系统，删除能力 |
| **FR-K8S-001 至 FR-K8S-010** | ✅ 全部 10 项 | K8s 清单要求 |
| **FR-DEPLOY-001 至 FR-DEPLOY-003** | ✅ 全部 3 项 | 部署要求 |
| **FR-CICD-001 至 FR-CICD-006** | ✅ 全部 6 项 | CI/CD 管道要求 |
| **FR-DEV-001 至 FR-DEV-004** | ✅ 全部 4 项 | 开发 shell 要求 |
| **总计** | ✅ **48/48** | 100% 合规 |

### 在 HRZ K3s 集群上部署

```bash
cd opendesk-nix/k8s

# 命名空间和身份验证
kubectl apply -f namespace.yaml
kubectl apply -f image-pull-secret.yaml

# 核心基础设施
kubectl apply -f core/databases/
kubectl apply -f core/identity/keycloak.yaml
kubectl apply -f core/networking/

# 协作与学习
kubectl apply -f groupware/sogo.yaml
kubectl apply -f learning/moodle.yaml
```

### 下一步

1. 🚧 **生产部署**到 HRZ K3s 集群
2. **二进制缓存**（Cachix）以加快重建速度
3. **Flux/GitOps 集成**，使用 Nix 生成的清单
4. **Container.gov.de 认证**，满足德国政府合规要求
5. **多架构**对所有容器提供 ARM64 支持

---

*openDesk Edu 是 [openDesk](https://opendesk.eu) 的教育变体，扩展了 用于研究和
教学的服务。源代码可在 [GitHub](https://github.com/tobias-weiss-ai-xr/opendesk-nix) 和 [opencode.de](https://gitlab.opencode.de/umr) 获取。*
