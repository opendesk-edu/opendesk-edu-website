---
title: "The Nix Shift: Why We Replaced Helmfile with Pure Functions"
date: "2026-07-29"
description: "How we replaced Helmfile with Nix for deterministic, cached, and composable Kubernetes deployments across 28 services."
categories: ["Engineering"]
tags: ["nix", "kubernetes", "helmfile", "devops"]
image: "/static/blog/nix-shift-teaser.svg"
---

# The Nix Shift: Why We Replaced Helmfile with Pure Functions

## The Problem

We ran openDesk Edu — 28 services across 9 K3s nodes — using Helmfile with Go templates. Every deployment came with a familiar dread:

```
failed to render values file "values-grommunio.yaml.gotmpl":
  template: stringTemplate:17: unexpected "\\" in operand
```

This error blocks **all** 28 services, not just one. Because Helmfile processes all templates as a single step, a single YAML syntax error anywhere halts the entire cluster update.

## Why Nix?

Nix is purely functional. Every build is deterministic and cached.

**Before:** `helmfile sync → helm template → Go templates → YAML → kubectl apply`
**After:** `nix build .#service-name → pure Nix → JSON → kubectl apply`

## The Results

| Metric | Helmfile | Nix |
|--------|----------|-----|
| Full deploy | ~3 min | ~30s (first) / ~2s (cached) |
| Error clarity | "failed to render" | "line 12: undefined variable" |
| Deterministic | No | Yes |
| Services | 28 | 28 |
| Lines per service | ~80 | ~5 |
