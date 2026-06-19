---
title: "GitOps at Scale: App of Apps vs ApplicationSet for openDesk"
date: "2026-06-19"
description: "As openDesk Edu grows past 30 services, our single monolithic ArgoCD Application hits its limits. This post compares App of Apps and ApplicationSet patterns, weighing pros and cons for an education deployment targeting multiple clusters and environments."
categories: ["technical", "architecture", "devops"]
tags: ["gitops", "argocd", "kubernetes", "app-of-apps", "applicationset", "helmfile", "architecture"]
---

# GitOps at Scale: App of Apps vs ApplicationSet for openDesk

> **Current state:** One ArgoCD Application, one helmfile, 30+ services, 8 sync phases.
> **Target state:** A multi-cluster, multi-environment GitOps architecture that scales.

This post examines where we are, where we want to go, and the two main ArgoCD patterns — App of Apps and ApplicationSet — that can get us there.

## Where We Are Today

openDesk Edu currently deploys using a **monolithic ArgoCD Application** backed by the [helmfile plugin](https://github.com/travisghansen/argo-cd-helmfile). A single Application resource in ArgoCD points to a helmfile that orchestrates all 30+ services across 8 sync phases:

| Phase | What Deploys |
|-------|-------------|
| 0 | Pre-deployment migration jobs |
| 1 | Core services (home, certs, alerts) |
| 2 | Databases, caches, S3, mail relay |
| 3 | Nubus IAM, Keycloak, portal |
| 4–5 | Groupware, apps (Nextcloud, Jitsi, OX, etc.) |
| 6–7 | Bootstrap jobs and post-migrations |

This works. The cluster is running, services are healthy, and backups are flowing. But as we scale — more environments (dev/staging/prod), more clusters (HRZ, future sites), and more services (we have 6 still missing) — the limitations of a single Application become clear.

### What Breaks at Scale

- **Single blast radius:** A bad helmfile change affects every service. There is no gradual rollout.
- **No self-service:** Adding a service means editing the central helmfile and waiting for maintainers to approve.
- **Slow syncs:** The root app reconciles all 30+ services at once. Sync timeouts and resource contention are real.
- **No per-service sync policy:** You cannot auto-sync one service while manually promoting another. It is all or nothing.
- **No per-environment differentiation:** Environment overrides live in a single `global.yaml.gotmpl`. You can craft conditionals, but the structure does not scale to N environments.

The community has converged on two patterns to solve these problems: **App of Apps** and **ApplicationSets**. They are not mutually exclusive, but they serve different needs.

## Pattern 1: App of Apps

The App of Apps pattern uses a root ArgoCD Application that syncs a directory containing other Application manifests. The root app discovers child applications, creates them, and monitors their health. Deleting a child manifest from Git makes ArgoCD prune it.

```yaml
# Root Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-opendesk
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/opendesk-edu/gitops-config.git
    path: apps/
  destination:
    server: https://kubernetes.default.svc
  syncPolicy:
    automated:
      prune: true
```

```yaml
# apps/keycloak.yaml — child Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: keycloak
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/opendesk-edu/gitops-config.git
    path: charts/keycloak/
  destination:
    server: https://kubernetes.default.svc
    namespace: opendesk
  syncPolicy:
    automated:
      selfHeal: true
```

### Pros

- **Full per-app control.** Each child Application gets its own sync policy, sync waves, ignore differences, and project. You can auto-sync Keycloak while manually promoting Nextcloud.
- **Helm/Kustomize templating.** The apps directory can itself be a Helm chart, so you template Application manifests with `values.yaml`. One values change propagates to all generated apps.
- **Simple mental model.** It is just Applications managing Applications. No new CRDs, no generators, no templating language. Every ArgoCD user understands it.
- **Dependency ordering.** Sync waves work at the Application level. You set `sync-wave: 1` on databases, `sync-wave: 5` on apps that depend on them.
- **Battle-tested.** The pattern has been in production since ArgoCD v1.x. The maintainers explicitly stated it is **not deprecated** ([discussion #11892](https://github.com/argoproj/argo-cd/discussions/11892)).

### Cons

- **One YAML per app per environment.** For 30 services × 3 environments = 90 Application manifests. Even with Helm templating, that is a lot of files to maintain.
- **No dynamic discovery.** Adding a service means committing a new Application YAML. There is no "scan this directory and create apps automatically."
- **Admin-only capability.** Creating Applications across projects requires admin privileges. Giving teams self-service means trusting them with Application manifests, including sensitive fields like `project`, `cluster`, and `namespace`.
- **Root app can become a bottleneck.** The parent application syncs all children. If one child is misconfigured, the root may show as degraded even if the rest are healthy.

### When It Shines

- Single cluster with a fixed set of services
- Teams that need fine-grained per-app control
- Complex dependency chains with strict ordering
- Migrating from a monolithic app — the structure mirrors what you already have

## Pattern 2: ApplicationSet

ApplicationSets are ArgoCD's native generator-based approach. Instead of writing N Application manifests, you define one ApplicationSet with a **template** and a **generator** that produces the parameters. The controller creates, updates, and deletes Applications automatically.

### Generator Types That Matter for openDesk

**Git Directory Generator** — auto-discovers services by scanning repository directories:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: opendesk-services
  namespace: argocd
spec:
  goTemplate: true
  generators:
    - git:
        repoURL: https://github.com/opendesk-edu/gitops-config.git
        revision: main
        directories:
          - path: services/*
  template:
    metadata:
      name: '{{.path.basename}}'
    spec:
      project: opendesk
      source:
        repoURL: https://github.com/opendesk-edu/gitops-config.git
        path: '{{.path.path}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{.path.basename}}'
      syncPolicy:
        automated:
          selfHeal: true
```

New service? Create a `services/nextcloud/` directory with your Kustomize overlay. ArgoCD picks it up. No config changes, no PR review for the ApplicationSet itself.

**Matrix Generator** — combines clusters and services for multi-environment deployments:

```yaml
generators:
  - matrix:
      generators:
        - git:
            repoURL: https://github.com/opendesk-edu/gitops-config.git
            directories:
              - path: services/*
        - clusters:
            selector:
              matchLabels:
                env: prod
```

This produces every combination of service × cluster. Three clusters × 30 services = 90 Applications from one manifest.

**Cluster Generator** — deploys the same set of services to every cluster matching a label selector. Add a cluster, label it `env: staging`, and every service deploys automatically.

**List Generator** — explicit control for when directory structures are not enough. Define a simple YAML list of parameter sets.

### Pros

- **Dynamic discovery.** Services appear and disappear based on Git repository structure. Zero manual Application management.
- **Multi-cluster native.** One ApplicationSet can target 10 clusters. The Cluster generator auto-discovers clusters registered in ArgoCD.
- **Self-service safe.** Administrators lock sensitive fields (`project`, `cluster`, `namespace`) in the template. Developers only control what goes into the source repo. This is the official self-service pattern recommended by the ArgoCD docs.
- **DRY at scale.** One template replaces 30+ Application manifests. With Matrix generators, one manifest replaces 90+.
- **Preserve resources on deletion.** The `preserveResourcesOnDeletion` option prevents cascading deletion of live workloads when an ApplicationSet is removed.

### Cons

- **Harder to debug.** ApplicationSet errors appear in controller logs, not in the ArgoCD UI. If generation fails silently, you may not notice until services are missing. As one community member noted: *"if it's not generating anything, you wouldn't know until you dig some logs"* ([discussion #11892](https://github.com/argoproj/argo-cd/discussions/11892)).
- **Limited per-app customization.** The template applies uniformly to all generated Applications. Want Keycloak on a different sync policy than Nextcloud? You need separate ApplicationSets or selector-based workarounds.
- **Templating complexity.** Go templates with nested generators can become hard to read and maintain. The `missingkey=error` option helps, but debugging template rendering is a skill in itself.
- **Sync waves are per-ApplicationSet, not per-app.** You cannot set different sync waves for different services within the same ApplicationSet without splitting them into multiple ApplicationSets.
- **Blast radius.** A misconfigured ApplicationSet template can affect dozens or hundreds of Applications at once. Thorough CI linting is essential.

### When It Shines

- Multi-cluster deployments (5+ clusters)
- Services that follow a consistent pattern (same repo layout, same sync policy)
- Self-service workflows where teams add services independently
- Preview environments per pull request (PR Generator)
- Any scenario where the cluster or service inventory changes frequently

## Pattern 3: Hybrid (The Community Consensus)

Reading through the GitHub discussion and talking to teams running ArgoCD in production, the most common recommendation is **neither pure pattern** — it is a layered hybrid:

> *"I use app-of-apps and ApplicationSet at the same time: app-of-apps for the very first bootstrapping, with actually two levels of app-of-apps, and then AppSet for self-service by the teams."* — Community member, discussion #11892

> *"I typically use AppSets at the top layer and App-of-Apps as the second layer. Top layer ensures all regions have the product. Second layer ensures the product is deployed consistently within region."* — @nastacio, discussion #11892

A practical layered architecture:

```
ApplicationSet (Cluster generator)
  └── per-cluster: Root Application (App of Apps)
        └── per-service: Child Application
              └── Helm/Kustomize deployment
```

Or inverted depending on where you need the dynamism:

```
Root Application (App of Apps)
  └── ApplicationSet (Git Directory generator)
        └── per-service application
              └── Helm/Kustomize deployment
```

## Decision Matrix

| Factor | App of Apps | ApplicationSet |
|--------|-------------|----------------|
| **Learning curve** | Low | Medium |
| **Per-app customization** | Full | Limited (requires splitting) |
| **Multi-cluster** | Manual duplication | Native (Cluster generator) |
| **Self-service safety** | Low (admin-only perms) | High (template locks fields) |
| **Debugging** | Easy (UI shows everything) | Hard (controller logs) |
| **Scaling to 100+ apps** | Painful (file count) | Natural (one manifest) |
| **Sync wave support** | Per Application | Per ApplicationSet |
| **Dynamic discovery** | No (manual YAML) | Yes (Git directory scan) |
| **Maturity** | Since ArgoCD v1.x | Since ArgoCD v2.x |

## What We Recommend for openDesk

For openDesk Edu's specific context — 30+ services, targeting 1–3 clusters, with a need for environment differentiation and eventual self-service — we see **two natural phases**:

### Phase 1: App of Apps (now)

Migrate from the monolithic helmfile Application to an App of Apps structure. This is the lowest-risk migration:

- Wrap each service's helmfile release as a separate ArgoCD Application
- Group shared infrastructure (databases, caches) into a common sync phase
- Keep the helmfile orchestration but decompose it into child Applications
- Maintain control over sync ordering and per-service policies

### Phase 2: ApplicationSet (next)

Once the App of Apps structure is running and stable, introduce ApplicationSets for repetitive patterns:

- Use a Git Directory generator to auto-discover services that follow a standard layout
- Use a Matrix generator (Git × Cluster) for multi-environment promotion (dev → staging → prod)
- Offload self-service for education-specific services to teams via scoped ApplicationSets with locked templates

### What We Are Not Doing

- **Removing helmfile entirely.** The helmfile plugin already handles dependency ordering and value templating well. The Application layer (App of Apps or ApplicationSet) should orchestrate helmfile releases, not replace them.
- **Going full ApplicationSet on day one.** The debugging and templating complexity is not worth it for a single-cluster, fixed-service-count deployment. ApplicationSet pays off when you hit 10+ clusters or 50+ services.

## References

- [ArgoCD Discussion #11892 — ApplicationSets vs App-of-apps vs Kustomize](https://github.com/argoproj/argo-cd/discussions/11892)
- [ArgoCD Documentation — ApplicationSet](https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/)
- [ArgoCD Documentation — Cluster Bootstrapping](https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/cluster-bootstrapping.md)
- [ArgoCD Application Patterns: App of Apps, ApplicationSets, and Beyond — DevOpsil](https://devopsil.com/articles/2026-03-21-gitops-argocd-application-patterns)
- [ArgoCD ApplicationSet Multi-Cluster Guide — Opsio](https://opsiocloud.com/blogs/argocd-applicationset-multi-cluster/)
- [How to Implement the App-of-Apps Pattern at Scale — OneUptime](https://oneuptime.com/blog/post/2026-02-26-argocd-app-of-apps-pattern-at-scale/view)
- [One Manifest, Hundreds of Apps: How Argo CD ApplicationSets Work — Burrell Tech](https://burrell.tech/blog/argo-cd-applicationsets/)
- [Getting Started with ApplicationSets — Red Hat](https://www.redhat.com/en/blog/getting-started-with-applicationsets)
- [openDesk Edu — Current ArgoCD Deployment](https://codeberg.org/opendesk-edu/argocd-opendesk)
