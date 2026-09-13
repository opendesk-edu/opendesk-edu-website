---
title: "Stateful Services Are Pets: why your app deploy must never touch the database"
date: "2026-09-13"
description: "A one-line config change in the app repo's compose file let a routine deploy recreate the production Dgraph, SIGKILLing it and contributing to a data-loss incident. Why stateful services are pets, not cattle, and why --no-deps is a deploy-line that saves weekends."
categories: ["Engineering", "DevOps"]
tags: ["deploy", "stateful", "databases", "docker-compose", "dgraph", "postgres", "disaster-recovery", "operability"]
author: "Tobias Weiß and openDesk Edu Contributors"
---

# Stateful Services Are Pets: why your app deploy must never touch the database

Some sentences you only write after paying tuition. Here is mine: a routine,
green deploy took down the production graph store, because the deploy
command was allowed to recreate any dependency whose compose stanza changed
— and the same commit that fixed a memory limit changed the database's stanza.

The fix was one flag. `--no-deps`.

## How a deploy becomes a database incident

The deploy step was the unremarkable, fights-about-whitespace, green-filled
CI job every team runs dozens of times a week:

```bash
docker compose -f docker-compose.prod.yml up -d --force-recreate leads
```

`--force-recreate leads` means "recreate the condition of the `leads`
service." But `docker compose` does not interpret that narrowly: if a
service in `depends_on` — here the Dgraph database — has a *changed config*,
compose recreates it too, as part of resolving the dependency graph. Compose
does not know or care that the database is the one store in the deployment
that must never be recreated on a whim.

So when a commit that was otherwise about load-test budgets also added a
`mem_limit` to the dgraph service, the next deploy "helpfully" recreated the
running database. The recovered containers were SIGKILLed instead of being
stopped gracefully, and the graph came back unreadable.

The full incident is documented in
[the infrastructure-autonomy series](/en/blog/infrastructure-autonomy-july-2026/)
and the Dgraph recovery playbook. The deploy line was the trigger, and the
lesson is deployment design, not database luck.

## Pattern: cattle vs pets, applied to the deploy command

"Servers are cattle, not pets" is true for *disposable compute*. It is a
category error when applied to a database holding months of production
state. The single most useful reframe:

> Treat the app as cattle. Treat the store as pets. Enforce it in the deploy
> command, not in a code-review comment.

That enforcement is mechanical:

```bash
docker compose up -d --force-recreate --no-deps leads
```

`--no-deps` tells compose to bring up *only* the named service and to leave
its `depends_on` graph alone. It is the difference between "I am deploying
the app" and "I am redeploying everything this app happens to depend on."
Stateful services then change only through an explicit, deliberate
procedure (a migration profile, a maintenance window) — never as the
side-effect of an app push.

If you use a container orchestrator instead of compose, the same principle
has a different name: **do not let the app's packaging own the store's
lifecycle.** The database is its own resource kind (StatefulSet / a
dedicated stack), deployed by its own pipeline, upgraded deliberately. The
app deploy updates the app's Deployment; it never `scale`s the store on a
config drift.

## Three rules that make it stick

1. **`--no-deps` (or equivalent) is non-negotiable on app deploys.** It costs
   nothing and removes an entire class of surprise recreation. Stateful
   service changes belong to a migration path, not the app's dependency
   graph.

2. **A stateful service that is killed must be stopped gracefully.** If a
   store does crash, give its container a real `stop_grace_period` and a
   memory ceiling — so that when something *does* exceed capacity, the
   fixture recycles itself rather than taking the rest of the host down (or
   being SIGKILLed mid-write by a sibling's lifecycle).

3. **Verify with uptime, not with a "deploy succeeded" log line.** After any
   deploy, confirm the database's `State.StartedAt` is *older* than the
   deploy — not newer. A database restarting at 18:11 when you deployed at
   18:11 is the deploy having touched your pet, and you want to catch that in
   a smoke test, not next month.

## The takeaway

Deploy tooling is subtracting risk from app releases while adding it to
everything the app depends on. The databases quietly survived dozens of
app deploys — and that quiet record is exactly what lulls you into trusting a
command that was one config-literal away from destroying state.

Pets, by definition, get personalized treatment. Give the database a deploy
path that treats it as one: never recreated as a side-effect, always
recycled gracefully, and its uptime asserted against every deploy. It is one
`--no-deps` and one smoke-test assertion. Cheap insurance, and it would have
saved a Saturday.