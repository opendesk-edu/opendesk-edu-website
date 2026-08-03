---
title: "Nix转型：为什么我们用纯函数取代了Helmfile"
date: "2026-07-29"
description: "我们如何用Nix取代Helmfile，实现28个服务的确定性、可缓存和可组合的Kubernetes部署。"
categories: ["Engineering"]
tags: ["nix", "kubernetes", "helmfile", "devops"]
image: "/static/blog/nix-shift-teaser.svg"
---

# Nix转型：为什么我们用纯函数取代了Helmfile

## 问题

我们使用Helmfile和Go模板运行openDesk Edu——在9个K3s节点上的28个服务。每次部署都伴随着熟悉的恐惧：

```
failed to render values file "values-grommunio.yaml.gotmpl":
  template: stringTemplate:17: unexpected "\\" in operand
```

这个错误会阻塞**所有**28个服务，而不仅仅是一个。因为Helmfile在一个步骤中处理所有模板，任何一个YAML语法错误都会停止整个集群更新。

症状总是相同的：

- **级联故障** — `values-grommunio.yaml.gotmpl` 中的一个拼写错误会导致整个部署瘫痪，即使只需要更新Moodle。
- **晦涩的错误信息** — Helmfile吞没了实际的上下文。我们得到的不是"第12行，第3列：未定义的变量"，而是晦涩的Go模板堆栈跟踪。
- **无缓存保证** — `helmfile sync` 每次都重新渲染每个模板，即使某个服务没有任何变化。28个服务意味着约3分钟的纯渲染时间。
- **难以复现** — 同一个提交在CI服务器上产生的结果与本地不同，因为Helmfile会隐式吸收环境变量和 `.env` 文件。

## 为什么选择Nix？

Nix是纯函数式的。每个构建都是确定性的且可缓存的。我们不再使用运行时渲染的命令式模板，而是将每个服务描述为一个**纯函数** — 输入进入，清单输出，没有副作用。

**之前:** `helmfile sync → helm template → Go模板 → YAML → kubectl apply`
**之后:** `nix build .#服务名 → 纯Nix → JSON → kubectl apply`

关键区别：Nix会**缓存**每个结果。如果某个服务没有变化，它会从Nix存储中在大约2秒内加载 — 无需渲染，无需重新计算。

## 架构

每个服务都是一个返回Kubernetes清单（JSON格式）的Nix函数：

```nix
# flake.nix（简化版）
{
  outputs = { self, nixpkgs, ... }: {
    apps.moodle = mkK8sApp {
      name = "moodle";
      image = "ghcr.io/opendesk-edu/moodle-shib:v1.4.0";
      port = 8080;
      replicas = 2;
      env = {
        MOODLE_DB_HOST = "mariadb";
        MOODLE_DB_NAME = "moodle";
      };
      ingress = {
        host = "moodle.opendesk-edu.org";
        tls = true;
      };
    };

    apps.ilias = mkK8sApp {
      name = "ilias";
      image = "ghcr.io/opendesk-edu/ilias-shibboleth:9-php8.2-apache";
      # ...
    };

    # 另外26个服务 ...
  };
}
```

`mkK8sApp` 辅助函数生成一个Deployment、一个Service、一个Ingress和可选的ConfigMaps — 全部作为类型化的Nix推导。错误在**构建时**出现，而不是在**运行时**。

## 结果

| 指标 | Helmfile | Nix |
|------|----------|-----|
| 完整部署 | ~3分钟 | ~30秒(首次) / ~2秒(缓存) |
| 错误清晰度 | "渲染失败" | "第12行: 未定义的变量" |
| 确定性 | 否 | 是 |
| 服务数 | 28 | 28 |
| 每服务代码行 | ~80 | ~5 |
| 可复现性 | 依赖环境 | 逐位相同 |
| 回滚 | 手动(helm rollback) | `nix flake lock --revision` |

## 迁移：逐步进行

迁移是渐进式的 — 不是一次性切换，而是逐个服务：

1. **双轨运行** — Helmfile和Nix最初并行运行。新服务直接在Nix中定义；现有服务保留在Helmfile上。
2. **一致性测试** — 对于每个迁移的服务，我们用 `diff` 比较Nix和Helmfile清单。只有在输出完全相同时才切换服务。
3. **Flake锁定** — `flake.lock` 锁定所有输入（nixpkgs版本、镜像摘要、配置哈希）。回滚就是对锁定文件执行 `git revert`。
4. **CI集成** — GitHub Actions用 `nix build` 构建每个服务并推送JSON清单。`kubectl apply` 是幂等的，只需几秒钟。

## 经验教训

**效果好的方面：**
- 渐进式迁移 — 对运行中的服务没有风险
- Nix存储作为构建缓存 — 每次部署中90%的服务都被缓存
- JSON代替YAML — 没有缩进错误，没有模板语言

**令人惊讶的方面：**
- Nix的学习曲线是真实的，但我们实际需要的范围（`mkK8sApp`、`flake.lock`、`nix build`）是可控的
- CI构建变得**更快**，而不是更慢 — 得益于缓存
- 调试更愉快：`nix build` 给出带行号的精确错误；Helmfile给出Go堆栈跟踪

**我们会避免的：**
- 不要在Nix表达式中为环境差异使用 `if` 条件 — 而是为每个环境使用独立的flake（`flake.prod.nix`、`flake.staging.nix`）
- 不要内联密钥 — 密钥保留在Kubernetes Secrets中，而不是Nix存储中

## 展望

Nix将我们的部署管道从脆弱的模板链转变为确定性的构建管道。openDesk Edu的28个服务现在可以在几秒钟内部署，而不是几分钟 — 并且每次构建都可以复现到最后一个字节。

下一步：**NixOS作为服务本身的基镜像**，而不仅仅是清单。这样不仅部署是确定性的，运行时环境也是。

---

*openDesk Edu是[openDesk](https://opendesk.eu)的教育变体，扩展了25个用于研究和教学的服务。Chart和社区平台可在[opencode.de](https://opencode.de)获取。*
