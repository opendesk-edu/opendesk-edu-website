---
title: "Der Nix-Shift: Warum wir Helmfile durch pure Funktionen ersetzt haben"
date: "2026-07-29"
description: "Wie wir Helmfile durch Nix ersetzt haben — für deterministische, gecachte und komponierbare Kubernetes-Deployments mit 28 Diensten."
categories: ["Engineering"]
tags: ["nix", "kubernetes", "helmfile", "devops"]
image: "/static/blog/nix-shift-teaser.svg"
---

# Der Nix-Shift: Warum wir Helmfile durch pure Funktionen ersetzt haben

## Das Problem

Wir betrieben openDesk Edu — 28 Dienste auf 9 K3s-Knoten — mit Helmfile und Go-Templates. Jedes Deployment kam mit vertrauter Angst:

```
failed to render values file "values-grommunio.yaml.gotmpl":
  template: stringTemplate:17: unexpected "\\" in operand
```

Dieser Fehler blockiert **alle** 28 Dienste, nicht nur einen. Da Helmfile alle Templates in einem Schritt verarbeitet, stoppt ein einziger YAML-Syntaxfehler das gesamte Cluster-Update.

## Warum Nix?

Nix ist rein funktional. Jeder Build ist deterministisch und gecached.

**Vorher:** `helmfile sync → helm template → Go-Templates → YAML → kubectl apply`
**Nachher:** `nix build .#dienstname → reines Nix → JSON → kubectl apply`

## Die Ergebnisse

| Metrik | Helmfile | Nix |
|--------|----------|-----|
| Volles Deployment | ~3 Min | ~30s (erstes) / ~2s (gecached) |
| Fehlerklarheit | "failed to render" | "Zeile 12: undefined variable" |
| Deterministisch | Nein | Ja |
| Dienste | 28 | 28 |
| Zeilen pro Dienst | ~80 | ~5 |
