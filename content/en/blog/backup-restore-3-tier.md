---
title: "Backup & Restore for openDesk Edu – the 3-Tier Approach to University Data Sovereignty"
date: "2026-08-22"
description: "Data sovereignty is decided at the backup layer: openDesk Edu protects critical services with k8up and a 3-tier model (RPO/RTO/retention) on S3, verifies restores in production, and honestly shows what is still missing – 29 RWO PVCs await CSI snapshots."
categories: ["Operations", "Data Sovereignty"]
tags: ["backup", "restore", "k8up", "restic", "s3", "ceph", "csi-snapshots", "rpo", "rto", "university", "data-sovereignty"]
image: "/static/blog/backup-restore-3-tier-teaser.svg"
---

# Backup & Restore for openDesk Edu – the 3-Tier Approach to University Data Sovereignty

> **The thesis:** Data sovereignty is not decided at login, but at the backup layer. If you cannot get your data back in an emergency, you do not really own it – no matter how sovereign the platform is otherwise.
>
> **The reality:** A university platform built from more than 20 open-source services has very different data classes: key/value stores whose failure cascades in seconds, files with terabyte-scale volume, and experimental AI sandboxes. A single backup strategy cannot fit any of these classes.
>
> **Our approach:** Instead of one-size-fits-all backups we operate a **3-tier model** – data classes with their own RPO, RTO and retention, implemented with the k8up operator on Kubernetes, resting on **Ceph** and **S3**, with verified restores and an honest gap analysis.

## Why Backup is the Real Data-Sovereignty Question

Leaving Microsoft 365, Google Workspace or Zoom is the visible part of the sovereignty shift. The invisible part begins where the decision stops being glamorous: in the data centre, at 3 a.m., in front of a failing storage controller or an accidentally deleted table.

Data sovereignty in the legal sense means: the controller decides **where** data resides and **who** can access it. Data sovereignty in the operational sense means: the controller gets the data back even **when something goes wrong**. Outages are not a matter of "if" but "when" – and that is exactly why you build a backup system that is more than a periodic job cheerfully writing into a storage black hole.

For universities there is an additional dimension: much of the data is **irreplaceable** – examination results, research data, theses, e-mail archives spanning semesters. A forgotten compute cluster rebuilds itself; a lost doctoral thesis does not. That is why the backup strategy belongs next to SSO and monitoring as one of the three pillars of an open campus run in production.

## k8up: Backup as a GitOps-Native Resource

Instead of cron jobs on a VM, openDesk Edu models backups as part of the Kubernetes platform – with **k8up** (v2.13.0), the backup operator of the K8up project:

```yaml
apiVersion: k8up.io/v1
kind: Schedule
metadata:
  name: backup-live
spec:
  backup:
    schedule: "15 2 * * *"          # nightly from 02:15
    backend:
      repoPasswordSecretRef:
        name: backup-credentials
        key: password
      s3:
        endpoint: s3.hrz.uni-marburg.de
        bucket: backups
        accessKeyIDSecretRef:
          name: backup-credentials
          key: accessKey
        secretAccessKeySecretRef:
          name: backup-credentials
          key: secretKey
```

The advantage is architectural: backups are **declared, versioned and reviewable** – they live as YAML in the Git repository next to the services they protect. The nightly backup becomes as traceable as the deployment process. **Restic** handles the actual data storage: deduplicated, encrypted, with snapshots that stay consistent over years. The target is an **S3 bucket** (in production: `s3.hrz.uni-marburg.de`) located **outside** the cluster – so the backup survives even a total loss of the platform itself.

In production, k8up currently protects **6 RWX PVCs** directly to S3 – including the shared volumes of Nextcloud, OpenProject and the groupware services. A **Grafana backup dashboard** makes the state of schedules and snapshots visible instead of relying on "should be fine".

## The 3-Tier Model: RPO, RTO and Retention per Data Class

The core of our approach is the insight that "one backup" is not a meaningful unit for a platform of this size. The data of openDesk Edu differs fundamentally in three dimensions:

- **How much loss is acceptable?** (RPO – Recovery Point Objective)
- **How fast must it be back?** (RTO – Recovery Time Objective)
- **How long must it be kept?** (retention)

That is why we defined a **3-tier model**:

| Tier | Example services | RPO | RTO | Retention |
|:-----|:-----------------|:----|:----|:----------|
| **A – critical** | Keycloak, PostgreSQL, Redis, MariaDB, MinIO | 1 h | 2 h | 30 days |
| **B – important** | Nextcloud, OX App Suite, OpenProject, ILIAS, Moodle | 1 h | 4 h | 14 days |
| **C – experimental** | JupyterHub, Ollama, Dask | 24 h | 1 day | 7 days |

### Tier A – the identity and data heart

Identity providers (Keycloak), databases (PostgreSQL, MariaDB, Redis) and object storage (MinIO) are the heart of the platform. If Keycloak fails, every login fails; if the configuration database fails, services lose their identity. Here the rule is: **hourly backup, fast recovery, 30 days retention** – because with identity systems you want to be able to reach back far, for example to roll back faulty provisioning actions.

### Tier B – the collaborative workspace

Nextcloud, OX App Suite, OpenProject, ILIAS and Moodle form the actual workspace of the university. Recovery is more elaborate than for a database – terabyte-scale files cannot be "imported" in two hours. With an **hourly RPO and a 4-hour RTO** we balance the effort: no working day is lost, and the restart window stays predictable. 14 days of retention cover the typical error windows (accidental deletion, stale clients, faulty updates).

### Tier C – room to experiment

JupyterHub, Ollama and Dask are deliberately designed as **disposable environments**. What is lost here is reproducible – from Git, from Nix, from a documented runbook. A **24-hour RPO** means: one lost day of experimental data is acceptable if it keeps unnecessary load off the infrastructure. This classification is a conscious decision – and it conserves resources for the tiers where data truly matters.

## The RWO Challenge: 29 PVCs That Cannot Be Backed Up "Just Like That"

So far, so orderly – and now for the honest gap. Of the platform's PVCs, currently **29 are not covered by k8up** because they are **RWO** (ReadWriteOnce). An RWO volume is bound to a single node and cannot be mounted in parallel by a backup pod elsewhere. The classic "let's just attach a volume" approach fails structurally.

Two paths are on the table, and both are documented:

**Option A – CSI VolumeSnapshots (preferred).** Ceph provides VolumeSnapshots through its CSI driver `rbd.csi.ceph.com`. This allows automated **crash-consistent** snapshots of the RWO volumes – without mounting, without downtime:

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: csi-rbd-snapclass
  annotations:
    k8up.io/snapshot-class: "true"
driver: rbd.csi.ceph.com
deletionPolicy: Delete
```

**Option B – per-node schedules.** Where no snapshot class exists, each RWO PVC can be protected by its own k8up schedule targeting exactly the node the volume is bound to via `nodeSelector`. More effort, but no dependency on the storage backend.

The decision between A and B hinges on one prerequisite: does a `VolumeSnapshotClass` exist in the cluster? If yes, the CSI path is the clear recommendation – and the 29 PVCs can move out of the exclusion maintenance mode (`k8up.io/exclude: "true"`) into regular operation.

## Restore Verification: The Test That Builds Trust

A backup that is never restored is an opinion. We verify restores in production – on the **Maui** platform **33 snapshots** have been successfully verified: databases restored and checked, file paths checked for completeness, services tested after restore.

It helps that k8up models restores as native resources too:

```yaml
apiVersion: k8up.io/v1
kind: Restore
metadata:
  name: restore-verify
spec:
  restoreMethod:
    folder:
      claimName: restore-target
  backend:
    repoPasswordSecretRef:
      name: backup-credentials
      key: password
    s3:
      endpoint: s3.hrz.uni-marburg.de
      bucket: backups
      accessKeyIDSecretRef:
        name: backup-credentials
        key: accessKey
      secretAccessKeySecretRef:
        name: backup-credentials
        key: secretKey
```

The rule for broad operations is: **Any schedule whose restore has not been tested in a target at least once per quarter exists only on paper.** Counting snapshots is nice; replaying them successfully is proof.

## Outlook: From Cluster Backup to Disaster Recovery

The current setup protects the cluster – deliberately to an **external** S3 target. The next step is the question of what happens if not just a service but the site itself fails. Three building blocks are on the agenda:

1. **Close the RWO gap:** CSI snapshots for the 29 RWO PVCs (Option A), so every data class in the cluster has a defined path.
2. **Georedundancy:** replication of the S3 buckets to a second site or data centre – against fire, water and that one unfortunate moment.
3. **Operations handbook:** restore runbooks for every tier, with target times, responsibilities and an annually practised DR day on which the complete cluster is rebuilt on an empty target.

For decision-makers replacing Microsoft 365, the core message is simple: **What you have to buy through contracts at M365, you build yourself at openDesk Edu – and it belongs to you.** The backup strategy is not an appendix but a first-class component of the platform: declared in the Git repo, verified in production, honestly documented.

## Conclusion

Backup & restore at openDesk Edu is not a one-size product but a **graduated system with clear decisions**:

- **k8up** turns backups into GitOps-native, reviewable resources instead of forgotten cron jobs.
- **Restic + S3** provide deduplicated, encrypted, external snapshots.
- The **3-tier model** distributes RPO, RTO and retention sensibly across identity, collaboration and experimentation space.
- **Verified restores** (33 snapshots) turn paper into practice.
- The **RWO gap** (29 PVCs) is named, equipped with two documented solution paths – and the next step is implementation via CSI snapshots.

Data sovereignty is not a legal checkbox. It is an operational achievement you prove – and the proof is the successfully restored snapshot.

---

## Links

- **k8up** – the backup operator: [k8up.io](https://k8up.io)
- **Restic** – deduplicated, encrypted backup: [restic.net](https://restic.net)
- **Ceph** – storage foundation of the cluster: [ceph.io](https://ceph.io)
- **Community of Practice** – backup infrastructure session: [Codeberg](https://codeberg.org/opendesk-edu/opendesk-cop)
- **openDesk Edu**: [opendesk-edu.org](https://opendesk-edu.org/)
