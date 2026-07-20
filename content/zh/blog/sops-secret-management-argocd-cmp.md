---
title: "使用 SOPS 和 ArgoCD CMP Sidecar 的 GitOps 原生机密管理"
date: "2026-07-10"
description: "openDesk Edu 如何使用 SOPS 和 age 加密在 Git 中加密 126 个机密，并通过 ArgoCD 配置管理插件 Sidecar 在部署时解密——无需 Vault、无需 External Secrets Operator、无需专有基础设施。"
categories: ["技术", "安全", "运维"]
tags: ["sops", "机密管理", "argocd", "gitops", "kubernetes", "安全", "age-加密", "helmfile"]
image: "/static/blog/sops-secret-management-argocd-cmp-teaser.svg"
---

# 使用 SOPS 和 ArgoCD CMP Sidecar 的 GitOps 原生机密管理

> **挑战：** 在 GitOps 工作流中，当*所有内容*（包括部署配置）都存在于公共 Git 仓库中时，如何管理数据库密码、API 令牌和 OIDC 客户端机密？
>
> **答案：** 使用 SOPS 和 age 密钥加密机密，以 `.enc.yaml` 文件形式与明文值一起提交，并在部署时使用 ArgoCD 配置管理插件 Sidecar 解密。无需 Vault 集群。无需 External Secrets Operator。无需专有基础设施——只需 `sops`、`age` 和一个 10 行 shell 脚本。

## 问题：GitOps 中的机密

在 openDesk Edu，我们使用 ArgoCD 和 Helmfile 的 GitOps 工作流在多个 Kubernetes 集群上部署 25+ 集成服务。每项配置（Helm 值、环境覆盖、服务定义）都存在于 Git 仓库中，并自动同步到集群。

这对*除机密以外*的所有内容都非常好。

标准的 openDesk Edu 部署需要约 126 个不同的机密值：

- **P0（关键）：** Keycloak 管理员凭据、数据库 root 密码、邮件中继认证
- **P1（高）：** OIDC 客户端机密、LDAP 绑定凭据、SMTP 密码
- **P2（中）：** Redis 认证令牌、MariaDB 副本密码
- **P3（低）：** Ceph 存储密钥、服务 API 令牌

使用 GitOps，您不能直接运行 `kubectl create secret`——这违反了 Git 作为唯一真实来源的原则。但您也不能将明文机密提交到 Git 仓库。

开源生态系统提供了多种解决方案。以下是我们选择当前方法的原因。

## 为什么选择 SOPS（+ age）而非替代方案

### 被拒绝的选项：Sealed Secrets

[Bitnami Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) 使用集群本地密钥加密机密。问题在于：SealedSecret CRD 是集群范围的。如果您的集群宕机，除非单独备份，否则将丢失密封密钥。对于多集群部署（开发、预发布、生产），每个集群需要单独的密封机密，这会重复工作并造成漂移风险。

### 被拒绝的选项：External Secrets Operator

[External Secrets Operator](https://external-secrets.io/) 从外部保管库（AWS Secrets Manager、HashiCorp Vault、Azure Key Vault）拉取机密。这是云原生部署的优秀模式，但它引入了外部依赖和第二个真实来源。对于希望最小化基础设施依赖的德国大学本地部署来说，添加 HashiCorp Vault 集群来管理机密感觉像是用一个问题替换另一个问题。

### 被拒绝的选项：Helm Secrets / Helm S3

这些需要在每个开发者的机器上安装解密工具，并且不能与 ArgoCD 的声明式同步模型干净地集成。

### 选定的方案：SOPS + age + ArgoCD CMP Sidecar

[SOPS（Secrets OPerationS）](https://github.com/getsops/sops) 是一个成熟、经过实战检验的加密单个值或整个文件的工具。我们选择它是因为：

- **无状态加密**——解密只需要 age 私钥，不需要运行中的服务
- **Git 原生**——加密文件与对应的明文文件一起存放在仓库中
- **ArgoCD 原生**——配置管理插件 Sidecar 模式无缝集成
- **无集群依赖**——解密密钥是单个文件，可独立于任何集群进行备份
- **审计追踪**——每次机密变更都是一个包含作者、时间戳和差异的 Git 提交

## 架构

我们的机密管理架构由四个组件组成：

```
┌─────────────────────────────────────────────────────────┐
│                    Git 仓库                              │
│                                                          │
│  .sops.yaml          helmfile/secrets/                   │
│  ──────────          ───────────────────                 │
│  creation_rules:     secrets.enc.yaml (P0 关键)          │
│    age: <public_key> secrets.prod.enc.yaml (P1-P3)       │
│                                                          │
└──────────────────────┬──────────────────────────────────┘
                        │ git push
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    ArgoCD                                │
│                                                          │
│  ┌─────────────────┐    ┌────────────────────────────┐  │
│  │  repo-server     │    │  CMP Sidecar (sops)       │  │
│  │  (主进程)        │◄───│                           │  │
│  │                  │    │  sops --decrypt *.enc.yaml│  │
│  │  接收解密后的    │    │  age 密钥: /sops-age-key/  │  │
│  │  YAML            │    └────────────────────────────┘  │
│  └─────────────────┘                                     │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ┌─────────────────────┐
                     │  Kubernetes 集群     │
                     │  Secrets + ConfigMaps│
                     └─────────────────────┘
```

### 1. SOPS 配置（`.sops.yaml`）

仓库根目录包含一个 `.sops.yaml` 文件，定义了加密规则：

```yaml
creation_rules:
  - path_regex: \.enc\.yaml$
    age: <age-public-key>
```

这告诉 SOPS：*任何以 `.enc.yaml` 结尾的文件都应使用此 age 公钥加密。* 巧妙之处在于 SOPS 为每个文件生成一个唯一的数据加密密钥，然后用 age 公钥包装。这意味着您可以轮换 age 密钥而无需重新加密每个文件——只需重新包装数据加密密钥即可。

### 2. 加密的机密文件

我们按环境和关键程度组织机密：

| 文件 | 内容 | 优先级 |
|------|----------|----------|
| `helmfile/environments/default/secrets.enc.yaml` | P0 关键机密（97 个值） | 🔴 关键 |
| `helmfile/environments/default/secrets.prod.enc.yaml` | 每个环境的 P1-P3 机密（29 个值） | 🟠 高 |

`.enc.yaml` 扩展名是我们向 SOPS 和 ArgoCD 发出的信号，表明文件需要解密。当您打开这些文件之一时，您会看到：

```yaml
keycloak_admin_password: ENC[AES256_GCM,data:...,iv:...,tag:...,type:str]
mariadb_root_password: ENC[AES256_GCM,data:...,iv:...,tag:...,type:str]
sops:
    kms: null
    gcp_kms: null
    azure_kv: null
    hc_vault: null
    age:
        - recipient: age1...
          enc: |
            ---
            ...
    lastmodified: '2026-07-09T12:00:00Z'
```

每个值都使用 AES-256-GCM 单独加密，文件带有关于加密密钥、版本和最后修改时间的元数据。

### 3. ArgoCD CMP Sidecar

关键集成点是 ArgoCD 配置管理插件（CMP）Sidecar。此 Sidecar 与主 ArgoCD repo-server 容器一起运行，并在文件到达资源检测之前拦截 `.enc.yaml` 文件。

**Sidecar 配置是一个 ConfigMap：**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmp-sops-plugin
  namespace: argocd
data:
  plugin.yaml: |
    apiVersion: argoproj.io/v1alpha1
    kind: ConfigManagementPlugin
    metadata:
      name: sops
    spec:
      sidecar: true
      generate:
        command:
          - /bin/sh
          - -c
          - |
            for f in $(find . -name '*.enc.yaml' -type f); do
              /custom-tools/sops --decrypt \
                --input-type yaml --output-type yaml "$f" 2>/dev/null
            done
      discover:
        find:
          glob: "**/*.enc.yaml"
```

当 ArgoCD 检测到匹配 `*.enc.yaml` 的文件时，它会调用 Sidecar 的 generate 命令，该命令对每个加密文件执行 `sops --decrypt`。解密后的 YAML 随后传递给 ArgoCD 的标准资源检测。

**Sidecar 需要两样东西才能工作：**

1. Sidecar 容器中的 `sops` 二进制文件
2. 作为 Kubernetes Secret 挂载的 age 私钥

两者都通过策略性合并补丁注入到 ArgoCD repo-server 部署中：

```yaml
# 策略性合并补丁（简化版）
spec:
  template:
    spec:
      initContainers:
        - name: install-sops
          image: alpine:3.20
          command: ["/bin/sh", "-c"]
          args:
            - |
              wget -q https://github.com/getsops/sops/releases/...
              mv sops /custom-tools/sops
          volumeMounts:
            - name: extra-tools
              mountPath: /custom-tools
      containers:
        - name: sops
          image: alpine:3.20
          command: [/var/run/argocd/argocd-cmp-server]
          volumeMounts:
            - name: extra-tools
              mountPath: /custom-tools
            - name: argocd-sops-age-key
              mountPath: /sops-age-key
              readOnly: true
      volumes:
        - name: extra-tools
          emptyDir: {}
        - name: argocd-sops-age-key
          secret:
            secretName: argocd-sops-age-key
```

### 4. 注解 ArgoCD 应用程序

每个使用 SOPS 加密文件的 ArgoCD 应用程序必须声明插件：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: opendesk-edu
spec:
  source:
    repoURL: https://github.com/opendesk-edu/opendesk-edu.git
    path: .
  plugin:
    name: sops
```

就是这样。应用程序现在在同步期间透明地解密机密。

## 端到端验证

CMP Sidecar 于 2026 年 7 月在 HRZ 生产集群（K3s v1.32.3，ArgoCD v3.0.12）上部署和测试。我们验证了：

1. **提交了加密机密**——`test-secret.enc.yaml` 提交到仓库
2. **ArgoCD 检测到更改**——应用程序的同步状态显示差异
3. **Sidecar 解密了机密**——`kubectl -n argocd logs deployment/argocd-repo-server sops` 确认了解密
4. **资源已应用**——明文 Secret 在目标命名空间中创建
5. **无明文泄露**——验证了加密文件在 Git 中保持加密状态

从仓库配置到可工作部署的整个设置耗时约 4 小时，包括调试 Sidecar 卷挂载。

## 这对运维人员意味着什么

### 日常运维

对于大多数运维人员来说，SOPS 集成是不可见的。他们：

1. 在常规的 `.yaml` 和 `.gotmpl` 文件中编辑 Helm 值
2. 提交并推送到 Git
3. ArgoCD 自动同步

唯一的区别是机密以加密文件形式存储。当运维人员需要添加或更新机密时：

```bash
# 解密机密文件
sops helmfile/environments/default/secrets.enc.yaml

# 编辑文件（在 $EDITOR 中打开）
# 保存时，SOPS 自动重新加密

# 提交
git add helmfile/environments/default/secrets.enc.yaml
git commit -m "feat(secrets): update Keycloak admin password"
git push
```

`sops` CLI 透明地处理解密和重新加密。除非拥有 age 私钥，否则运维人员永远不会看到或处理明文机密。

### 机密轮换

轮换机密就像这样简单：

```bash
sops helmfile/environments/default/secrets.enc.yaml
# 就地编辑值
# 保存 → 自动重新加密

# 或轮换所有数据加密密钥：
sops --rotate helmfile/environments/default/secrets.enc.yaml
```

### 灾难恢复

最重要的运维关注点：**备份 age 私钥。** 这个单一文件（`~/.age/opendesk-edu.txt`）控制对所有加密机密的访问。没有它，您无法解密任何 `.enc.yaml` 文件。

我们的灾难恢复指南现在将 SOPS 密钥恢复列为恢复顺序的第一步（P0 优先级，在存储和数据库之前）。

## 126 个加密机密：数据一览

| 优先级 | 数量 | 类别 |
|----------|-------|------------|
| P0（关键） | 97 | Keycloak 管理员、数据库 root、邮件中继认证、LDAP 管理员 |
| P1（高） | 16 | OIDC 客户端机密、SMTP 凭据、API 令牌 |
| P2（中） | 8 | Redis 认证、副本数据库密码、缓存密钥 |
| P3（低） | 5 | Ceph 密钥、服务令牌、监控凭据 |
| **总计** | **126** | |

每个值都使用 AES-256-GCM 单独加密。没有两个值共享 nonce。文件级数据加密密钥是每个文件唯一的，用 age 公钥包装。

## 为什么这对 GitOps 很重要

这种方法保留了 GitOps 的核心原则：

- **Git 是唯一真实来源**——每个机密值都有一个 Git 提交
- **声明式部署**——ArgoCD 自主处理一切
- **无基础设施依赖**——无需 Vault、无需云提供商、无需外部服务
- **审计追踪**——`git log` 精确显示谁在何时更改了哪个机密
- **可重现**——新集群可以仅从 Git（加上 age 密钥）启动

## 经验教训

1. **卷挂载是最棘手的部分**——CMP Sidecar 需要访问与主 repo-server 相同的仓库检出。共享的 `tmp` 卷挂载至关重要。

2. **代理配置很重要**——在 HRZ 集群上，`install-sops` init 容器需要 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量来下载 sops 二进制文件。

3. **插件缓存可能导致机密过期**——如果之前的同步缓存在 Redis 中，ArgoCD 在机密更新后可能不会重新运行插件。强制刷新缓存（`redis-cli FLUSHALL`）或增加提交哈希可以解决此问题。

4. **先用虚拟机密测试**——我们在加密真正的生产凭据之前，先提交了一个无害的 `test-secret.enc.yaml` 并进行了端到端验证。

5. **在多个位置备份 age 密钥**——这个单一文件是所有机密的信任根。丢失它意味着失去对每个加密值的访问。

## 下一步

SOPS 集成是我们 v1.1 版本的基础。解决了机密管理问题后，我们现在可以：

- **为每个服务定义机密需求**——每个 Helm chart 声明其需要的确切机密
- **审计机密覆盖范围**——自动化检查确保没有服务引用未定义的机密
- **按计划轮换机密**——使用 SOPS 的元数据（加密时间戳）来跟踪轮换窗口
- **扩展到 CI/CD 流水线**——GitLab CI 作业可以解密机密用于集成测试

完整的集成指南可在我们的仓库中 [`docs/developer/sops-argocd-integration.md`](https://github.com/opendesk-edu/opendesk-edu/blob/main/docs/developer/sops-argocd-integration.md) 找到，加密的机密位于 `helmfile/environments/*/secrets*.enc.yaml`。

---

*基于 SOPS 的机密管理是 openDesk Edu v1.1 版本的一部分。有关完整的 v1.1 路线图，请参阅我们的 [发布计划](https://github.com/opendesk-edu/opendesk-edu/blob/main/docs/v1.1-release-checklist.md)。*

**openDesk Edu：主权、集成、可投入生产的开源教育技术。**
