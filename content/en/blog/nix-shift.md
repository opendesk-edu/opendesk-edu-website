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

The symptoms were always the same:

- **Cascading failures** — a typo in `values-grommunio.yaml.gotmpl` took down the entire deployment, even if only Moodle needed an update.
- **Opaque error messages** — Helmfile swallows the actual context. Instead of "line 12, column 3: undefined variable," we got cryptic Go template stack traces.
- **No caching guarantees** — `helmfile sync` re-renders every template every time, even if nothing changed for a given service. With 28 services, that's ~3 minutes of pure rendering time.
- **Hard to reproduce** — the same commit produced different results on CI than locally, because Helmfile implicitly absorbs environment variables and `.env` files.

## Why Nix?

Nix is purely functional. Every build is deterministic and cached. Instead of imperative templates rendered at runtime, we describe each service as a **pure function** — input in, manifest out, no side effects.

**Before:** `helmfile sync → helm template → Go templates → YAML → kubectl apply`
**After:** `nix build .#service-name → pure Nix → JSON → kubectl apply`

The key difference: Nix **caches** every result. If nothing changed for a service, it's loaded from the Nix store in ~2 seconds — no rendering, no re-computation.

## The Architecture

Each service is a Nix function that returns a Kubernetes manifest (as JSON):

```nix
# flake.nix (simplified)
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

    # 26 more services ...
  };
}
```

The `mkK8sApp` helper generates a Deployment, a Service, an Ingress, and optional ConfigMaps — all as typed Nix derivations. Errors surface at **build time**, not at **runtime**.

## The Results

| Metric | Helmfile | Nix |
|--------|----------|-----|
| Full deploy | ~3 min | ~30s (first) / ~2s (cached) |
| Error clarity | "failed to render" | "line 12: undefined variable" |
| Deterministic | No | Yes |
| Services | 28 | 28 |
| Lines per service | ~80 | ~5 |
| Reproducibility | Environment-dependent | Bit-for-bit identical |
| Rollback | Manual (helm rollback) | `nix flake lock --revision` |

## Migration: Step by Step

The migration was incremental — no big bang, but service by service:

1. **Dual operation** — Helmfile and Nix ran in parallel at first. New services were defined directly in Nix; existing ones stayed on Helmfile.
2. **Parity tests** — for each migrated service, we compared the Nix and Helmfile manifests with `diff`. Only when the output was identical did we switch the service over.
3. **Flake locking** — `flake.lock` pins all inputs (nixpkgs version, image digests, config hashes). A rollback is a `git revert` of the lock file.
4. **CI integration** — GitHub Actions builds each service with `nix build` and pushes the JSON manifests. `kubectl apply` is idempotent and takes seconds.

## Lessons Learned

**What worked well:**
- Incremental migration — no risk to running services
- Nix store as build cache — 90% of services are cached on every deploy
- JSON instead of YAML — no indentation errors, no templating language

**What surprised us:**
- The Nix learning curve is real, but the surface area we actually need (`mkK8sApp`, `flake.lock`, `nix build`) is manageable
- CI builds got **faster**, not slower — thanks to caching
- Debugging is more pleasant: `nix build` gives exact errors with line numbers; Helmfile gives Go stack traces

**What we'd avoid:**
- No `if` conditions in Nix expressions for environment differences — instead, separate flakes per environment (`flake.prod.nix`, `flake.staging.nix`)
- No inline secrets — secrets stay in Kubernetes Secrets, not in the Nix store

## Outlook

Nix has transformed our deployment pipeline from a fragile template chain into a deterministic build pipeline. The 28 services of openDesk Edu can now be rolled out in seconds rather than minutes — and every build is reproducible down to the last byte.

The next step: **NixOS as the base image** for the services themselves, not just the manifests. Then not only the deployment is deterministic, but the runtime environment too.

---

*openDesk Edu is the education variant of [openDesk](https://opendesk.eu), extended with 25 services for research and teaching. Charts and community platform are available at [opencode.de](https://opencode.de).*
