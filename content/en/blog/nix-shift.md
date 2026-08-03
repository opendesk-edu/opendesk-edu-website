---
title: "The Nix Shift: Deterministic Deployments with Pure Functions"
date: "2026-07-29"
description: "How we use Nix flakes for reproducible container images and Kubernetes manifests — 69 services, type-safe builds, no runtime template errors."
categories: ["Engineering"]
tags: ["nix", "kubernetes", "helmfile", "devops"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/nix-shift-teaser.svg"
---

# The Nix Shift: Deterministic Deployments with Pure Functions

## The Problem

Deployments with Helmfile and Go templates brought familiar pain points:

```
failed to render values file "values-grommunio.yaml.gotmpl":
  template: stringTemplate:17: unexpected "\\" in operand
```

This error blocks **all** services, not just one. Because Helmfile processes all
templates as a single step, a single YAML syntax error anywhere halts the entire
cluster update.

The symptoms:

- **Cascading failures** — a typo in `values-grommunio.yaml.gotmpl` took down the
  entire deployment, even if only one service needed an update.
- **Opaque error messages** — Helmfile swallows the actual context. Instead of
  "line 12, column 3: undefined variable," we got cryptic Go template stack traces.
- **No caching guarantees** — `helmfile sync` re-renders every template every time,
  even if nothing changed for a given service.
- **Hard to reproduce** — the same commit produced different results on CI than
  locally, because Helmfile implicitly absorbs environment variables and `.env` files.

## The Nix Approach

Nix is purely functional. Every build is deterministic and cached. Instead of
imperative templates rendered at runtime, we describe each service as a **pure
function** — input in, manifest out, no side effects.

**Before:** `helmfile sync → helm template → Go templates → YAML → kubectl apply`

**After:** `nix build .#sogo5-image → pure Nix → JSON → kubectl apply`

The key difference: Nix **caches** every result. If nothing changed for a service,
it's loaded from the Nix store — no rendering, no re-computation.

> **Note:** Helmfile and Nix currently coexist. The Nix-based Kubernetes manifests
> in `opendesk-nix/k8s/services/` complement the existing Helmfile charts, they do
> not replace them wholesale. New services are defined directly in Nix; existing ones
> are migrated gradually.

## The Architecture

The `opendesk-nix` project has two pillars:

### 1. Container Images (flake.nix)

The `flake.nix` builds reproducible container images with
`dockerTools.buildLayeredImage`:

```nix
# flake.nix (simplified)
{
  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" ] (system:
      let pkgs = import nixpkgs { inherit system; }; in {
        packages = {
          sogo5-image = pkgs.dockerTools.buildLayeredImage {
            name = "registry.gitlab.opencode.de/umr/sogo5";
            tag = commonArgs.sogo5Version;
            # ... layer definitions
          };
          sogo6-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
          dev-agent-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
          zot-registry-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
        };
      });
}
```

### 2. Kubernetes Manifests (k8s/services/)

Each service is a Nix function that returns Kubernetes resources as JSON.
The `lib/k8s.nix` library provides type-safe builders:

```nix
# k8s/services/moodle.nix (simplified)
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

The `lib.deployment`, `lib.service`, and `lib.ingressWithCert` builders generate
a Deployment, a Service, an Ingress, and a TLS certificate — all as typed Nix
derivations. Errors surface at **build time**, not at **runtime**.

The `lib/k8s.nix` library offers additional builders: `statefulset`, `daemonSet`,
`hpa` (HorizontalPodAutoscaler), `pdb` (PodDisruptionBudget), `job`, `secret`,
`pvc`, `namespace`, `role`, `certificate`, `issuer` — all with consistent
security standards (non-root, read-only FS, dropped capabilities).

### 69 Services

Currently 69 services are defined as Nix modules — from LMS (Moodle, ILIAS) to
collaboration (Nextcloud, Etherpad, CryptPad) to monitoring (Loki, Promtail,
Kibana). Each service follows the same pattern: a Nix module that returns
Kubernetes resources.

## The Results

| Metric | Helmfile | Nix |
|--------|----------|-----|
| Error clarity | "failed to render" | "line 12: undefined variable" |
| Deterministic | No | Yes |
| Services | 69 | 69 |
| Reproducibility | Environment-dependent | Bit-for-bit identical |
| Rollback | Manual (`helm rollback`) | `git revert` of `flake.lock` |
| Image builds | Dockerfile + CI | `nix build .#sogo5-image` (cached) |

> Deploy times (~3 min vs. ~30s) and cache hit rates (90%) are practical
> estimates, not guaranteed benchmarks.

## Migration: Step by Step

The migration is incremental — no big bang, but service by service:

1. **Dual operation** — Helmfile and Nix run in parallel. New services are defined
   directly in Nix; existing ones stay on Helmfile.
2. **Parity tests** — for each migrated service, we compare the Nix and Helmfile
   manifests with `diff`. Only when the output is identical do we switch the
   service over.
3. **Flake locking** — `flake.lock` pins all inputs (nixpkgs version, image
   digests, config hashes). A rollback is a `git revert` of the lock file.
4. **CI integration** — GitHub Actions builds each image with `nix build` and
   pushes it. `kubectl apply` is idempotent and takes seconds.

## Lessons Learned

**What worked well:**
- Incremental migration — no risk to running services
- Nix store as build cache — most services are cached on every deploy
- JSON instead of YAML — no indentation errors, no templating language
- Security standards built directly into the builders (`lib/security.nix`) —
  non-root, read-only FS, dropped capabilities are the default, not optional

**What surprised us:**
- The Nix learning curve is real, but the surface area we actually need
  (`lib.deployment`, `flake.lock`, `nix build`) is manageable
- CI builds got **faster**, not slower — thanks to caching
- Debugging is more pleasant: `nix build` gives exact errors with line numbers

**What we'd avoid:**
- No `if` conditions in Nix expressions for environment differences — instead,
  separate environment modules (`k8s/environments/demo/`, `k8s/environments/local/`)
- No inline secrets — secrets stay in Kubernetes Secrets, not in the Nix store

## Outlook

Nix extends our deployment pipeline with a deterministic build layer. The 69
services of openDesk Edu can now be built reproducibly — and every build is
identical down to the last byte.

The next step: **NixOS as the base image** for the services themselves, not just
the manifests. Then not only the deployment is deterministic, but the runtime
environment too.

---

*openDesk Edu is the education variant of [openDesk](https://opendesk.eu), extended
with a comprehensive suite of services for research and teaching. Charts and community platform are
available at [opencode.de](https://opencode.de).*
