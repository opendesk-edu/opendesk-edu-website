---
title: "Storage & Data Management Architecture"
date: "2026-08-27"
description: "How openDesk Edu manages persistent storage, database backends, backup integration, and data lifecycle — from PersistentVolumes and storage classes to k8up/restic backups and capacity planning."
categories: ["architecture", "infrastructure"]
tags: ["architecture", "storage", "persistent-volumes", "database", "mariadb", "postgresql", "redis", "backup", "k8up", "restic", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/storage-data-management-teaser.svg"
---

# Storage & Data Management Architecture

Every service on the platform produces data: course materials in the LMS, files in cloud storage, emails in mailboxes, collaboration documents, and configuration state. This data is the institution's most valuable asset, and how it is stored, protected, and managed determines the platform's reliability. This article documents the storage architecture: how PersistentVolumes provide durable storage, how database backends serve stateful applications, how backups protect against data loss, and how data lifecycle — from creation to archival — is managed.

For the network path that delivers data to users, see [Networking & Traffic Flow Architecture](/architecture/networking-traffic-flow). For the full platform overview, see [System Architecture Overview](/architecture/overview).

## Persistent Storage

### PersistentVolumes and Storage Classes

Kubernetes separates compute (pods, which are ephemeral) from storage (PersistentVolumes, which are durable). When a pod restarts, its local data is lost. PersistentVolumes (PVs) survive pod restarts, node failures, and rescheduling.

The platform uses PersistentVolumeClaims (PVCs) to request storage. A PVC specifies:

- **Access mode**: How the volume can be mounted (read-write once, read-only many, read-write many)
- **Storage size**: How much capacity is needed
- **Storage class**: What type of backing storage to use

The storage class determines the physical storage backend. Common storage classes in the platform include:

- **Local persistent storage**: Direct-attached storage on the node. Fast but tied to a specific node. Suitable for databases that benefit from low latency.
- **Network-attached storage (NFS)**: Shared filesystem accessible from multiple nodes. Suitable for file storage services (Nextcloud, OpenCloud) that need read-write access from any node.
- **Software-defined storage (Ceph)**: Distributed storage that provides resilience through replication. Data is written to multiple nodes, so a single node failure does not cause data loss. Suitable for all service types.
- **Object storage (S3-compatible)**: For backup targets and large unstructured data. Not used for application PVs, but used by restic for backup storage.

Each service declares its storage needs via a PVC in its Helm chart. The platform's storage classes ensure that the right type of storage is provisioned automatically.

### Access Modes

| Access Mode | Abbreviation | Description | Typical Use |
|-------------|-------------|-------------|-------------|
| ReadWriteOnce | RWO | One node mounts read-write | Databases (MariaDB, PostgreSQL) |
| ReadOnlyMany | ROX | Many nodes mount read-only | Configuration, static assets |
| ReadWriteMany | RWX | Many nodes mount read-write | File storage (Nextcloud, OpenCloud) |

Most databases use RWO because they run as a single instance and do not need concurrent writes from multiple nodes. File storage services use RWX because any node might serve a file request.

### Capacity Planning

Storage capacity is one of the most critical operational concerns. Each service has different storage needs:

- **File storage** (Nextcloud, OpenCloud): The largest consumer. User files accumulate over time. Plan for growth — a platform with active users may need terabytes of file storage within months.
- **Email** (Grommunio): Mailboxes grow steadily. Each user's mailbox may range from a few hundred megabytes to several gigabytes.
- **Databases** (MariaDB, PostgreSQL): Relatively small compared to file storage, but critical. Database storage should be on fast storage (SSD or NVMe) for performance.
- **Video recordings** (BigBlueButton): Recordings can be large (hundreds of megabytes to gigabytes per session). Plan for retention policies (how long to keep recordings).
- **Configuration and state** (Keycloak, Nubus): Small but critical. Loss of Keycloak's database means loss of all user accounts and federation configuration.

The platform does not prescribe specific capacity numbers — each institution's needs are different. However, the platform provides monitoring (Prometheus + Grafana) to track storage usage and alert when capacity is low.

## Database Backends

The platform uses three types of database backends, each suited to different workloads:

### MariaDB

MariaDB (a MySQL fork) is the primary relational database for services that require MySQL compatibility. It is used by:

- **Grommunio** (email): Mailbox metadata, user configuration
- **ILIAS** (LMS): Course data, user progress, assessments
- **Moodle** (LMS): Course data, user progress, assignments
- **XWiki** (wiki): Wiki pages, attachments, metadata

MariaDB runs as a StatefulSet in Kubernetes, with a PersistentVolume for data storage. Each service has its own MariaDB instance (or database within a shared instance), isolated by namespace.

#### High Availability

For production deployments, MariaDB can be configured with primary-replica replication. The primary handles writes; replicas handle reads and provide failover. If the primary fails, a replica is promoted. This is configuration, not code — the Helm chart supports both single-instance and replicated setups.

### PostgreSQL

PostgreSQL is used by services that prefer or require PostgreSQL-specific features (JSONB, full-text search, advanced indexing):

- **Nextcloud** (file storage): Metadata, file index, shares
- **OpenProject** (project management): Projects, tasks, time tracking
- **Keycloak** (identity): Realm configuration, user accounts, federation metadata
- **Zammad** (helpdesk): Tickets, articles, user data

PostgreSQL also runs as a StatefulSet with a PersistentVolume. Like MariaDB, it can be configured for high availability with primary-replica replication.

#### Connection Pooling

Both MariaDB and PostgreSQL support connection pooling (via ProxySQL for MariaDB and PgBouncer for PostgreSQL). Connection pooling reduces the overhead of establishing new database connections by maintaining a pool of reusable connections. This is important when services have many short-lived database queries.

### Redis

Redis is an in-memory key-value store used for:

- **Caching**: Session data, frequently accessed objects, rendered pages
- **Rate limiting**: Tracking API request counts
- **Message queues**: Lightweight job queues for background tasks
- **Session storage**: For services that store sessions in Redis rather than the database

Redis runs as a StatefulSet with a PersistentVolume for persistence (so cached data survives restarts). It is configured with a maximum memory limit and an eviction policy (typically `allkeys-lru` — evict least recently used keys when memory is full).

### Database Connectivity

Services connect to their databases via Kubernetes DNS names. For example, a service connects to `mariadb.database-namespace.svc.cluster.local:3306` rather than an IP address. This abstraction means databases can be moved, restarted, or reconfigured without changing application configuration.

Each database has its own credentials, stored as Kubernetes Secrets. The application reads the credentials from environment variables or mounted secret files. No database passwords are stored in plaintext in the Helm configuration — they are generated during deployment and stored in Secrets.

## Backup Integration

### k8up Backup Operator

The platform uses k8up, a Kubernetes-native backup operator, to manage automated backups. k8up runs inside the cluster and coordinates backup schedules across all services.

k8up uses restic as the backup backend. Restic is a fast, secure, and efficient backup tool that supports:

- **Incremental backups**: Only changed data is transferred, reducing backup time and storage usage
- **Deduplication**: Identical data blocks are stored only once, reducing storage costs
- **Encryption**: All backup data is encrypted at rest with a configurable key
- **Multiple storage backends**: Local directories, NFS, S3-compatible object storage, SFTP servers

### Backup Schedule

The platform's backup schedule is configurable. A typical setup:

- **Database backups**: Daily, via database dumps (e.g., `mariadb-dump` or `pg_dump`). These are logical backups that capture the database state at a point in time.
- **Persistent volume snapshots**: Weekly full snapshots of all PersistentVolumes. These are volume-level backups that capture the entire PV, including databases, files, and configuration.
- **Configuration backups**: Configuration is stored in Git (via ArgoCD), so Git history serves as the configuration backup. No separate backup is needed.

### What Gets Backed Up

All persistent data from all services is included in backups:

- LMS course content and user submissions (ILIAS, Moodle)
- BigBlueButton recording files
- Nextcloud and OpenCloud user files
- Grommunio mailboxes (via MariaDB dumps)
- Collabora document caches
- Keycloak and Nubus configuration state
- Database contents (MariaDB, PostgreSQL)
- Redis persistence data

Non-persistent data is excluded: container images, ephemeral caches, and temporary files that can be regenerated.

### Backup Storage Targets

Restic supports a wide range of storage backends. Institutions can direct backups to:

- **Local NFS/S3-compatible storage**: On-premises storage that the institution controls
- **Off-site object storage**: Cloud-based S3-compatible storage for disaster recovery
- **SFTP servers**: Remote servers for off-site backup storage
- **Any restic-supported backend**: Restic's flexible backend support means institutions can choose the storage that fits their infrastructure and compliance requirements

The backup target is configured in k8up's schedule definition. Multiple targets can be used simultaneously (e.g., local for fast restores, off-site for disaster recovery).

### Restore Process

Restoring from a backup involves:

1. **Identify the restore point**: Which backup snapshot contains the desired state
2. **Stop the affected service**: To avoid data conflicts during restore
3. **Run the restic restore**: k8up initiates a restore job that copies data from the backup target back to the PersistentVolume
4. **Restart the service**: Once the restore is complete, the service is restarted with the restored data

For database restores, the process is similar but uses the database dump: the dump file is restored to the database, which replays the SQL statements to recreate the database state.

### Backup Monitoring

k8up integrates with Prometheus to expose backup metrics:

- Last successful backup timestamp
- Backup duration
- Backup size
- Number of snapshots in the repository
- Backup failures (alerted via Alertmanager)

Operators should monitor these metrics and alert on backup failures — a silent backup failure is worse than no backup, because it creates a false sense of security.

## Data Lifecycle

### Creation

Data is created by services as users interact with the platform. Each service manages its own data format and storage location. The platform does not impose a unified data model — each service uses its native storage (files in Nextcloud, records in MariaDB, documents in Collabora).

### Growth

As the platform is used, data grows. The platform provides monitoring (Prometheus + Grafana) to track:

- PersistentVolume usage (how full each PV is)
- Database size (rows, storage consumed)
- Backup size and growth rate
- Remaining capacity

When storage approaches capacity, operators can:

- **Expand PersistentVolumes**: Most storage classes support volume expansion. The PVC is updated with a larger size, and the PV grows automatically (no downtime for RWO volumes; brief remount for RWX volumes).
- **Add nodes**: For distributed storage (Ceph), adding nodes increases both compute and storage capacity.
- **Archive old data**: Move infrequently accessed data to cheaper storage or delete it per retention policies.

### Retention and Archival

Each service has its own data retention requirements:

- **Email**: Mailboxes are retained as long as the user account exists. Deleted emails may be recoverable for a configurable period.
- **LMS data**: Course data is retained per institutional policy. Some institutions archive courses after the semester ends; others retain them indefinitely.
- **Video recordings**: BigBlueButton recordings can be retained for a configurable period and then automatically deleted or archived.
- **File storage**: User files are retained until the user deletes them or the account is removed.

The platform does not impose retention policies — each institution configures retention based on its own legal and operational requirements. The platform provides the tools (backup schedules, monitoring, storage expansion) to implement whatever retention policy the institution chooses.

### Deletion

Data deletion is permanent. When a user account is removed, the platform deletes:

- The user's files (Nextcloud, OpenCloud)
- The user's mailbox (Grommunio)
- The user's course data and submissions (ILIAS, Moodle)
- The user's configuration in Keycloak and Nubus

Deletion is performed by the service's own deletion logic, not by a central platform-wide script. This ensures that each service's deletion process respects its own data model and referential integrity.

## Database Migrations

When services are updated, their databases may need schema migrations. The platform handles this through Helm chart hooks:

1. **Pre-upgrade hook**: Runs database migration scripts before the new version starts
2. **New version starts**: The service comes up with the updated schema
3. **Rollback (if needed)**: If the migration is reversible, the Helm chart can roll back to the previous version

Migrations are service-specific. Each service's Helm chart includes the migration logic for its database. The platform does not impose a unified migration framework — it delegates to each service's native migration tooling.

## Failure Modes and Troubleshooting

### PersistentVolume Full

**Symptom**: Services report "disk full" or "no space left on device" errors.
**Cause**: A PersistentVolume has reached its capacity.
**Resolution**: Expand the PVC (if the storage class supports expansion) or clean up unnecessary data. Monitor PV usage to catch this before it becomes critical.

### Database Connection Failure

**Symptom**: Services report "connection refused" or "unable to connect to database" errors.
**Cause**: The database pod is down, the network policy is blocking traffic, or the database credentials are wrong.
**Resolution**: Check the database pod status (`kubectl get pods`), verify the network policy allows the service to reach the database, and check the Secret for correct credentials.

### Backup Failure

**Symptom**: k8up reports backup failures, or the last successful backup is old.
**Cause**: The backup target is unreachable, the restic repository is locked, or the backup encryption key has changed.
**Resolution**: Check the backup target connectivity, verify the restic repository is not locked by another process, and ensure the backup encryption key has not changed.

### Storage Class Misconfiguration

**Symptom**: PVCs are stuck in "Pending" state.
**Cause**: The storage class is not available, the storage class does not support the requested access mode, or there is insufficient storage.
**Resolution**: Check the storage class (`kubectl get storageclass`), verify the access mode is supported, and check available capacity.

---

## Further Reading

- [System Architecture Overview](/architecture/overview) — the full platform architecture
- [Storage & Data Management in the Overview](/architecture/overview#backup-and-data-management) — backup overview in the system architecture
- [Networking & Traffic Flow Architecture](/architecture/networking-traffic-flow) — how traffic reaches services
- [Security Architecture](/architecture/security) — how data is protected at rest and in transit
- [Sovereign Cloud: SCS vs Proxmox + K3s](/blog/scs-vs-proxmox-k3s) — infrastructure platform comparison including storage

---

*Data is the institution's most valuable asset. Storage architecture is not just about where data lives — it's about ensuring data is durable, recoverable, and growable for the lifetime of the platform.*
