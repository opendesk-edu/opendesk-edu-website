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

## 为什么选择Nix？

Nix是纯函数式的。每个构建都是确定性的且可缓存的。

**之前:** `helmfile sync → helm template → Go模板 → YAML → kubectl apply`
**之后:** `nix build .#服务名 → 纯Nix → JSON → kubectl apply`

## 结果

| 指标 | Helmfile | Nix |
|------|----------|-----|
| 完整部署 | ~3分钟 | ~30秒(首次) / ~2秒(缓存) |
| 错误清晰度 | "渲染失败" | "第12行: 未定义的变量" |
| 确定性 | 否 | 是 |
| 服务数 | 28 | 28 |
| 每服务代码行 | ~80 | ~5 |
