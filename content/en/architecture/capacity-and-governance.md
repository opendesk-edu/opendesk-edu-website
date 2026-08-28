---
title: "Capacity Analysis and Governance Model"
date: "2026-08-27"
description: "A companion technical document. Detailed capacity planning for deployments of any scale, and the governance model for operating an openDesk Edu platform."
categories: ["architecture", "infrastructure", "operations"]
tags: ["architecture", "capacity", "governance", "scaling", " sanoans-based", "openDesk edu", "operations", "lifecycle"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/capacity-and-governance-teaser.svg"
---

# Capacity Analysis and Governance Model

This is the companion technical document to the [System Architecture Overview](/architecture/overview). It provides detailed capacity planning guidance for deployments at any scale, and describes the governance model for operating an openDesk Edu platform — how decisions are made, how changes are managed, and how the platform evolves over time.

The capacity sections help you size your infrastructure before deployment. The governance sections describe how the platform keeps running after it is deployed — upgrade cycles, lifecycle management, change control, and organisational roles.

## Capacity Analysis

### Sizing Philosophy

openDesk Edu is designed as a reference architecture, not a fixed-size appliance. There is no single "recommended" hardware specification because every institution has different user counts, workloads, peak load characteristics, and service selections. Instead, capacity planning follows a **modular approach**: size each service independently based on its requirements, then sum them up (with overhead for cluster operations).

This section provides:

- Base requirements for each service category
- Multipliers for concurrent-user load
- Formulas for storage growth
- Observability-based tuning guidelines

### Deployment Tiers

The platform scales across several deployment tiers. These tiers are conceptual guides for planning, not rigid configurations. An institution can mix tiers across service categories — for example, running a large LMS tier alongside a medium file storage tier.

| Tier | Active Concurrent Users |
|------|-------------------------|
| **Tier 0 (Pilot)** | 0–500 |
| **Tier 1 (School)** | 500–5,000 |
| **Tier 2 (University)** | 5,000–50,000 |
| **Tier 3 (Large University / Consortium)** | 50,000+ |

Each tier description below provides:

- **«Active Concurrent Users»**: Users actively using the platform at peak load
- **«Total Users»**: Total user accounts, including inactive ones
- **«Cluster nodes»**: Rough node count range for Kubernetes worker nodes only (control plane excluded)
- **«Per-service reqs.»**: Typical resources for the heaviest service in that tier

Within each tier, services can be enabled or disabled independently. Disabling resource-heavy services (like ILIAS or BigBlueButton) reduces the cluster footprint accordingly.

#### Tier 0 — Pilot Deployment (0–500 concurrent users)

For pilot programs, proof-of-concept deployments, or classrooms with occasional access. This tier fits on a single node or a small number of machines for learning and evaluation.

- **Total users**: Up to 2,000 accounts
- **Cluster nodes**: 1–2 worker nodes
- **Typical CPU**: 4–8 vCPUs (total cluster)
- **Typical RAM**: 16–32 GB (total cluster)
- **Storage**: 500 GB–2 TB (total)
- **Service mix**: Lightweight subset (Nextcloud, Jitsi, Keycloak, Element)

A Tier 0 deployment is **not production-grade**: it lacks redundancy, high availability, and disaster recovery guarantees. It is intended for evaluation, development, and training purposes only.

#### Tier 1 — School Deployment (500–5,000 concurrent users)

For a typical school, small college, or department with regular daily use. Handles class schedules, office hours, and moderate collaboration workloads.

- **Total users**: 2,000–10,000 accounts
- **Cluster nodes**: 3–5 worker nodes
- **Typical CPU**: 16–32 vCPUs (total cluster)
- **Typical RAM**: 64–128 GB (total cluster)
- **Storage**: 2–10 TB (total)
- **Service mix**: Most platform services, single instance of each component category (e.g., Nextcloud for files, Jitsi for video)

A Tier 1 deployment provides:

- **High availability**: Multiple nodes ensure services remain available if a single node fails
- **Basic redundancy**: Databases with synchronous replication, replicated storage backends
- **Daily backups**: Automatic backups via k8up+restic with off-site storage

#### Tier 2 — University Deployment (5,000–50,000 concurrent users)

For a medium to large university with continuous heavy use. Handles full course loads, large lectures, active collaboration, and institution-wide adoption.

- **Total users**: 10,000–100,000 accounts
- **Cluster nodes**: 8–15 worker nodes
- **Typical CPU**: 64–256 vCPUs (total cluster)
- **Typical RAM**: 256–1024 GB (total cluster)
- **Storage**: 10–100 TB (total)
- **Service mix**: Full platform with all service categories enabled, multiple instances where needed (e.g., Nextcloud and OpenCloud both running)

A Tier 2 deployment provides:

- **Full high availability**: Redundant control plane, multiple availability zones recommended
- **Enterprise-grade storage**: Distributed storage (Ceph) with replication, snapshots, and tiered storage
- **Advanced backups**: hourly snapshots, daily full backups, weekly off-site backups, monthly archive backups
- **Load separation**: Resource-heavy services (BigBlueButton, ILIAS, Nextcloud) colocated with adequate resources

#### Tier 3 — Large University or Consortium (50,000+ concurrent users)

For very large universities, university systems, or regional consortia with sustained high load. May include multiple institutions sharing a single platform instance.

- **Total users**: 100,000+ accounts
- **Cluster nodes**: 20+ worker nodes
- **Typical CPU**: 512+ vCPUs (total cluster)
- **Typical RAM**: 2+ TB (total cluster)
- **Storage**: 100+ TB (total)
- **Service mix**: Full platform with multiple instances per category for redundancy and performance

A Tier 3 deployment includes all Tier 2 capabilities plus:

- **Multi-cluster architecture**: Multiple Kubernetes clusters for isolation (e.g., separate clusters for LMS, groupware, identity)
- **Multi-region deployment**: Geographic distribution for disaster recovery and latency reduction
- **Advanced monitoring**: Centralised logging (Loki), metrics (Prometheus/Grafana), APM, and SLO-based alerting
- **Dedicated infrastructure**: Separate node pools for stateful vs stateless workloads, GPU nodes for specific services

### Service-Specific Capacity Requirements

Each service in the openDesk Edu stack has different resource characteristics. The tables below provide per-service estimates for a **medium load deployment (Tier 1–2)**. Multiply these by your expected load factor to estimate requirements for your institution.

**Note on CPU/memory units:** vCPU counts assume modern x86 processors (Intel Xeon or AMD EPYC). Memory is in GB. Storage is in GB unless otherwise noted. All values are for a single instance of each service.

#### Identity and Authentication

| Service | CPU (vCPU) | RAM (GB) | Storage (GB) | Notes |
|---------|-----------|----------|---------------|-------|
| Keycloak | 0.5–2 | 1–4 | 5–10 | Contrary to common perception, Keycloak is lightweight. Resources scale with active sessions, not total users. |
| Shibboleth SP (per instance) | 0.25–1 | 0.5–2 | 1–2 | One instance per SAML-dependent service. Each instance handles login traffic for that service. |
| Nubus | 0.5–2 | 1–4 | 5–10 | Portal and IAM layer. Sizing depends on portal customization and plugin count. |

**Load factors:**

- Session establishment is CPU-intensive. Ensure adequate CPU during peak login times (start of semester, morning logins)
- Memory scales linearly with the number of active sessions multiplied by the average session size
- Consider session replication across nodes for high availability

#### File Storage and Collaboration

| Service | CPU (vCPU) | RAM (GB) | Storage (GB) | Notes |
|---------|-----------|----------|---------------|-------|
| Nextcloud (app) | 2–8 | 4–16 | 1–5 | Application server only. Storage is on PersistentVolumes. |
| Nextcloud (DB) | 2–4 | 4–8 | 20–50 | PostgreSQL or MariaDB. Size depends on metadata (files, shares, versions) not file contents. |
| Nextcloud (Redis) | 0.5–1 | 1–2 | 1 | Session and lock cache. |
| Nextcloud object storage | – | – | Variable | File contents stored separately. Plan for user data plus versions, trash, shares. |
| OpenCloud | 1–4 | 2–8 | 5–10 | Lighter than Nextcloud but less feature-rich. |

**Storage growth estimates:**

- Per-user storage: 5–50 GB (depending on usage patterns)
- Versioning overhead: 20–50% (if file versioning is enabled)
- Trash retention: 10% (30-day retention added to storage footprint)
- Sharing overhead: Minimal (shares are metadata, not copies)
- For N users with M GB average usage: Total storage ≈ N × M × 1.7 (with versioning and overhead)

#### Email and Groupware

| Service | CPU (vCPU) | RAM (GB) | Storage (GB) | Max Mailboxes | Notes |
|---------|-----------|----------|---------------|---------------|-------|
| OX App Suite | 4–16 | 8–32 | 50–200 | 10,000–100,000 | Heavy database usage. Scales with number of mailboxes. |
| SOGo | 2–4 | 4–8 | 20–50 | 5,000–25,000 | Lightweight webmail. Lower resource requirements than OX. |
| Grommunio | 4–8 | 8–16 | 30–100 | 5,000–50,000 | Similar to OX. ActiveSync adds overhead. |
| MariaDB (Groupware DB) | 4–16 | 8–32 | 50–200 | – | Storage for mail metadata. Mail bodies for OX/SOGo also stored here. |

**Mailbox sizing:**

- Average mailbox size: 1–10 GB (depending on retention policies)
- IOPS requirements: High for email databases (SSD/NVMe strongly recommended)
- Connection pooling: Required for groupware databases under load

#### Learning Management Systems

| Service | CPU (vCPU) | RAM (GB) | Storage (GB) | Max Concurrent | Notes |
|---------|-----------|----------|---------------|----------------|-------|
| Moodle | 2–8 | 4–16 | 20–100 | 500–5,000 | LAMP stack. PHP-FPM workers scale with users. |
| Moodle (DB) | 4–16 | 8–32 | 50–200 | – | PostgreSQL recommended. Course data + user submissions. |
| ILIAS | 4–16 | 8–32 | 50–200 | 1,000–10,000 | More resource-intensive than Moodle. Java-based. |
| ILIAS (DB) | 4–16 | 8–32 | 100–500 | – | Database-heavy. Large test/assessment data. |

**Storage growth:**

- Per-course storage: 500 MB–5 GB (slide decks, assignments, resources)
- Per-user submissions: 100–1,000 MB (papers, projects, media)
- Video content: Very high if storing uploaded videos. Consider separate object storage.
- Moodle: Courses are organized as directories. Each course directory can grow large.
- ILIAS: Uses a table-per-object database schema, which adds overhead.

#### Video Conferencing

| Service | CPU (vCPU) | RAM (GB) | Bandwidth | Max Concurrent | Notes |
|---------|-----------|----------|-----------|----------------|-------|
| Jitsi | 2–8 per meeting | 4–16 | 1–8 Mbps per participant (HD) | 50–100 per instance | CPU-intensive (WebRTC transcoding). Scale horizontally with multiple instances. |
| BigBlueButton | 4–16 | 8–32 | 0.5–2 Mbps per participant | 100–200 per instance | Recording storage separate. dedicaed GPU for transcoding recommended. |
| BigBlueButton (Recordings) | – | – | Variable | – | 1 GB–5 GB per hour of recording. Plan for storage and playback bandwidth. |

**Bandwidth considerations:**

- Outbound bandwidth: Most critical for video conferencing (server → participants)
- Inbound bandwidth: Usually less critical unless most participants are upstreaming video
- Recording playback: Excessive if many users replay recorded lectures simultaneously
- Network topology: Participants on the same LAN share bandwidth to the server

#### Collaboration and Productivity

| Service | CPU (vCPU) | RAM (GB) | Storage (GB) | Notes |
|---------|-----------|----------|---------------|-------|
| Collabora Online | 2–8 | 4–16 | 1–5 | Count per WOPI instance. Memory-hungry when many documents are open. |
| Etherpad | 0.5–2 | 1–4 | 1–5 | Lightweight. MySQL/PostgreSQL for persistence. |
| CryptPad | 1–4 | 2–8 | 5–10 | End-to-end encrypted. Higher CPU for encryption. |
| XWiki | 2–4 | 4–8 | 10–50 | Java-based. Content stored in database. |
| BookStack | 1–2 | 2–4 | 5–20 | PHP/MySQL. Lightweight documentation platform. |
| OpenProject | 2–4 | 4–8 | 10–50 | Ruby-based. PostgreSQL. |

#### Real-Time Communication

| Service | CPU (vCPU) | RAM (GB) | Storage (GB) | Max Concurrent | Notes |
|---------|-----------|----------|---------------|----------------|-------|
| Element (Matrix) | 0.5–2 | 1–4 | 5–10 | 500–5,000 | Synapse server for Matrix. Memory scales with state (rooms, users). |
| Jitsi (see above) | – | – | – | – | Already covered in Video Conferencing. |
| Zammad (Helpdesk) | 2–4 | 4–8 | 10–50 | 500–2,000 | Ruby on Rails. PostgreSQL or MySQL. |

#### Databases and Infrastructure

| Service | CPU (vCPU) | RAM (GB) | Storage (GB) | Notes |
|---------|-----------|----------|---------------|-------|
| PostgreSQL (per instance) | 2–8 | 4–16 | 20–100 | Shared or dedicated per service. Connection pooling required. |
| MariaDB (per instance) | 2–8 | 4–16 | 20–100 | Good for read-heavy workloads. Groupware preference. |
| Redis (per instance) | 0.5–2 | 1–4 | 1–5 | Caching and session storage. Memory is the limiting factor. |

### Storage Planning

Storage is typically the fastest-growing resource. Plan for **3–5 years of growth** at deployment time, then add capacity as needed.

#### storage growth model

Use this formula to estimate storage requirements:

```
Total Storage = (User Data × Growth Factor) + (Service Overhead) + (Backup Overhead) + (Headroom)

Where:
- User Data = N × average.storage.per.user
- Growth Factor = 1 + annual.growth.rate × years
- Service Overhead = databases + logs + temporary files (≈ 10–20% of user data)
- Backup Overhead = backup.count × user.data (typically 200–400%: 2x daily + 1x weekly)
- Headroom = 0.2 × (everything above) — buffer for unexpected growth
```

**Example for Tier 2 (25,000 users, 20 GB average/user, 15% annual growth, 3 years):**

1. User data: 25,000 × 20 GB = **500 TB**
2. Growth factor: 1 + 0.15 × 3 = **1.45**
3. User data after growth: 500 TB × 1.45 = **725 TB**
4. Service overhead: 725 TB × 0.15 = **109 TB**
5. Backup overhead: 725 TB × 2.5 = **1,813 TB** (assuming 2 daily + 1 weekly for 3 years)
6. Subtotal: 725 + 109 + 1,813 = **2,647 TB**
7. Headroom: 2,647 TB × 0.2 = **529 TB**
8. **Total: ~3,176 TB ≈ 3.2 PB**

This is the **upper bound** for storage planning. In practice:

- Backups can be deduplicated (especially database dumps and file snapshots)
- External object storage can be used for old backups and archives
- Not all users will use their full allocation simultaneously
- Compression can reduce storage footprint by 20–40% for many workloads

**Simplified estimate:** 40–60 GB per user including backups and overhead, scaled by duration and growth rate. For 25,000 users for 3 years: 25,000 × 50 GB = **1.25 PB** (more realistic than the upper bound above).

#### Storage Classes and Access Patterns

Match your storage class to the access pattern:

| Storage Class | Use Case | Access Pattern | Cost | Performance |
|---------------|----------|----------------|------|-------------|
| Local SSD | Databases, high-IOPS workloads | Frequent random read/write | High | Very high |
| Ceph/RBD | General persistent volumes | Mixed read/write | Medium | High |
| Ceph Filesystem | Shared file storage | Shared read/write | Medium | Medium |
| NFS | Shared configuration, legacy access | Frequent read, occasional write | Low | Medium |
| Object Storage (S3-like) | Backups, archives, recordings | Rare access, sequential read | Low | Low |

**Recommended strategy:**

- **Hot storage** (Ceph SSD or Local SSD): Databases, frequently accessed files
- **Warm storage** (Ceph HDD): User files, less frequently accessed content
- **Cold storage** (Object Storage): Backups older than 30 days, recordings older than 90 days
- **Archive storage** (External/tape): Backups older than 1 year

### Network Planning

Network capacity is often overlooked but critical for user experience.

#### internal network

- **Pod-to-pod**: 1–10 Gbps per node (minimum). Use 10 Gbps for Tier 2+ deployments.
- **Node-to-storage**: 10 Gbps minimum for Ceph. 25 Gbps+ for Tier 3.
- **Control plane**: Low bandwidth (1 Gbps adequate)
- **Ingress**: Depends on external traffic (see below)

**Rule of thumb:** Internal network should be 10× the external ingress capacity.

#### External Network (Ingress/Egress)

Estimate based on peak concurrent users and their activities:

| Activity | Bandwidth per User |
|----------|---------------------|
| Basic browsing (Nextcloud, Moodle) | 100–500 kbps |
| Document editing (Collabora) | 200–1,000 kbps |
| Video conferencing (Jitsi, self-view) | 500–8,000 kbps |
| Video conferencing (BigBlueButton) | 0.5–2 Mbps |
| Video playback (recordings) | 1–5 Mbps |
| File upload/download | 1–10 Mbps (depends on file size) |

**Peak throughput estimate:**

```
Total Bandwidth = Peak Users × Average bandwidth per user × Peak Factor

Where Peek Factor = 1.5–3.0 (accounts for bursts and uneven usage)
```

**Example for Tier 2 (5,000 concurrent users):**

- Average bandwidth: 500 kbps (mix of activities)
- Peak factor: 2.0 (conservative estimate)
- Total: 5,000 × 0.5 Mbps × 2 = **5 Gbps egress required**

For inbound: usually half of egress unless many users are uploading large files.

#### DNS and TLS

- DNS: Normal requirement. Any authoritative DNS server can handle this.
- TLS certificates: Weekend Automatic via Cert-Manager + Bundesdruckerei for tiers 1 and up, otherwise also possible
- Certificate renewal: 1–100 certificates, renewed quarterly via Bundesdruckerei

### Kubernetes Cluster Sizing

Beyond service resources, the Kubernetes cluster itself has overhead:

| Overhead Category | CPU (vCPU) | RAM (GB) | Storage (GB) | Notes |
|-------------------|-----------|----------|---------------|-------|
| Control plane (etcd) | 2–4 | 8–16 | 20–50 | 3 or 5 nodes recommended for HA. |
| Control plane (API, scheduler, etc.) | 2–4 | 4–8 | 5–10 | Per control plane node. |
| Node OS overhead | 0.5 per worker | 1–2 per worker | 20–50 per worker | OS + kubelet + container runtime. |
| Cluster networking (CNI) | 0.5 per node | 1 per node | – | Calico/Flannel overhead. |
| Monitoring (Prometheus) | 2–4 | 8–16 | 50–100 | Scales with cluster size. |
| Logging (Loki) | 2–8 | 8–32 | 100–500 | Scales with log volume. |
| Ingress (Traefik) | 1–2 | 2-4 | 1 | Per ingress controller instance. |

**Total cluster overhead:** 10–20 vCPUs, 20–40 GB RAM for a typical Tier 2 cluster (excluding worker node OS overhead).

### Scaling Strategies

#### Horizontal Scaling

Most services scale horizontally by adding replicas:

- **Stateless services** (Nextcloud app, Moodle, Jitsi): Scale by adding pod replicas. Session affinity may be required for some services.
- **Stateful services** (Databases): Scale by adding read replicas or sharding. PostgreSQL and MariaDB support read replicas.
- **Storage**: Scale by adding OSD nodes to Ceph cluster or adding NFS servers.
- **In'nıngress**: Scale by adding ingress controller replicas.

**Horizontal Pod Autoscaler (HPA):**

Use HPA to automatically scale services based on CPU, memory, or custom metrics:

```yaml
# Example HPA for Nextcloud
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nextcloud
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nextcloud
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

HPA thresholds: 70–80% CPU or memory utilization is typical.

#### Vertical Scaling

For services that cannot scale horizontally (e.g., databases with write-heavy workloads):

- Increase vCPU and RAM for the pod
- Use larger node sizes (e.g., move from `Large` to `XLarge` instance type)
- Separate read and write workloads onto different nodes

#### Cluster Autoscaling

Use the Cluster Autoscaler to add/remove nodes based on demand:

- **Scale-up**: When pods cannot be scheduled due to resource constraints
- **Scale-down**: When nodes are underutilized for a configurable period (default: 10 minutes)
- **Min/max nodes**: Set boundaries to prevent runaway scaling

Cluster Autoscaler works with cloud providers and on-premises solutions (via custom implementations).

### Monitoring and Observability

Capacity planning cannot be done accurately without observability. Instrument your cluster:

- **Prometheus + Grafana**: Metrics for CPU, memory, storage, network, custom application metrics
- **Loki + Tempo**: Logging and tracing for debugging and auditing
- **Alertmanager**: Alerts on resource saturation, service health, backup failures
- **kube-state-metrics**: Kubernetes-specific metrics (pod restarts, deployments, etc.)

**Key metrics to monitor:**

| Metric | Warning Threshold | Critical Threshold | Action |
|--------|-------------------|--------------------|--------|
| CPU utilization | 70% sustained | 90% | Scale up or out |
| Memory utilization | 70% | 90% | Scale up or memory leak investigation |
| Disk I/O wait | 10% | 30% | Faster storage or scale storage |
| Network saturation | 70% | 90% | Increase network capacity |
| Pod restarts (5m) | 3 | 10 | Investigate pod health |
| Database connections | 70% of max | 90% of max | Increase connection pool or database resources |

**Resource utilization formula:**

```
Utilization % = (Used / Total) × 100

For clusters: Aggregate across all nodes, accounting for reservable resources.
```

## Governance Model

The governance model describes **how** the openDesk Edu platform is operated after deployment. It covers decision-making, change management, lifecycle management, and the roles and responsibilities within the operating organisation.

### Operating Model

openDesk Edu is designed for **self-hosted operation**. The platform provides:

- Reference Helm charts and values files
- Automated deployment pipelines
- Documentation for operation

The **institution** is responsible for:

- Deploying the platform
- Operating the infrastructure
- Managing user accounts
- Monitoring and support
- Upgrades and maintenance

This **shared responsibility model** is intentional: it preserves institutional autonomy and data sovereignty.

### Organisational Roles

Define clear roles for operating the platform:

| Role | Responsibilities | Typical Team |
|------|-----------------|--------------|
| **Platform Owner** | Strategic direction, budget, overall responsibility | IT leadership, CIO |
| **Platform Operator** | Day-to-day operation, monitoring, incident response | Infrastructure team, DevOps |
| **Service Administrator** | Configuration and management of individual services | Application team, service-specific admins |
| **Federation Administrator** | Identity federation, SAML/OIDC configuration, IdP connections | Identity team, IAM specialists |
| **Storage Administrator** | Storage provisioning, Ceph/NFS management, backup configuration | Storage team |
| **Security Officer** | Security policies, compliance, vulnerability management | Security team |
| **Database Administrator** | Database tuning, backups, replication, query optimization | DBA team |

**Note:** In smaller institutions, multiple roles may be combined into a single person or team. In larger institutions, each role may have dedicated specialists and sub-teams.

### Decision-Making Process

**All changes to the platform follow a structured decision-making process:**

1. **Proposal**: Change is proposed via a ticket, issue, or change request
2. **Impact Assessment**: Impact on users, services, infrastructure, and dependencies is evaluated
3. **Feasibility Study**: Technical feasibility and resource requirements are verified
4. **Approval**: Change is approved by the appropriate authority (depending on impact and risk)
5. **Planning**: Implementation plan, rollback plan, and timeline are created
6. **Communication**: Stakeholders are notified of the change and its impact
7. **Implementation**: Change is implemented during a maintenance window (if required)
8. **Verification**: Implementation is verified and tested
9. **Documentation**: Change is documented and updated in relevant documentation
10. **Closing**: Change is closed with post-implementation review

**Approval matrix:**

| Change Type | Approval Required | Lead Time | Maintenance Window |
|-------------|-------------------|-----------|---------------------|
| Emergency fix (security, outage) | Platform Operator + Security Officer | 0–1 hour | As needed |
| Minor change (configuration, small update) | Platform Operator | 1–3 days | Optional |
| Standard change (new service, major update) | Platform Owner + Platform Operator | 1–2 weeks | Required |
| Major change (architecture, Kubernetes version) | platform operator with approval of Platform Owner | 2–4 weeks | Required, extended |

### Change Management

Applied **ITIL-based change management** with adaptations for agile, DevOps teams

#### Change Categories

| Category | Description | Risk | Example |
|----------|-------------|------|---------|
| **Standard** | Pre-approved, low-risk, routine changes | Low | Configuration change, minor version update |
| **Normal** | Requires approval, moderate risk | Medium | New service deployment, major version update |
| **Emergency** | Urgent, high-impact changes to resolve incidents | High | Security patch, outage fix |

#### Change Workflow

**Standard Change:**

1. Change is logged in the change management system
2. Pre-approved template is selected
3. Change is implemented at scheduled time
4. Change is logged as completed

**Normal Change:**

1. **Request for Change (RFC)** is created
2. RFC is reviewed by Change Advisory Board (CAB)
3. RFC is approved or rejected
4. If approved: implementation plan created, schedule set
5. Change is implemented during maintenance window
6. Change is verified and documented
7. CAB review (post-implementation)

**Emergency Change:**

1. Incident is identified, emergency fix is needed
2. Fix is planned and tested (in staging if possible)
3. Emergency Change Advisory Board (ECAB) reviews and approves
4. Fix is implemented
5. Post-implementation review with full CAB
6. Standard change process applied retroactively

### MaintenanceWindows

**Scheduled Maintenance:**

- **Frequency**: Weekly or bi-weekly
- **Duration**: 2–4 hours
- **Start time**: Outside of business hours (e.g., 02:00–06:00)
- **Communication**: 1 week in advance via user portal and email
- **Scope**: Standard changes, service updates, configuration changes

**Extended Maintenance:**

- **Frequency**: Quarterly or as needed
- **Duration**: 4–12 hours
- **Start time**: Weekend (e.g., Saturday 02:00–14:00)
- **Communication**: 2–4 weeks in advance
- **Scope**: Major architecture changes, Kubernetes version updates, large service deployments

**Emergency Maintenance:**

- **Frequency**: As needed
- **Duration**: Varies
- **Start time**: Immediate or as soon as possible
- **Communication**: Immediate notification via user portal and email
- **Scope**: Security patches, outage fixes

### Upgrade and Lifecycle Management

Regular upgrades keep the platform secure, performant, and feature-rich.

#### Upgrade Policies

| Component | Upgrade Frequency | Process | Downtime | Rollback |
|-----------|-------------------|---------|----------|----------|
| Kubernetes | Quarterly or as needed | Blue-green or rolling update | Required | Required (snapshot) |
| Helm charts | Per release | Rolling update | Optional | Optional |
| Application services | Per release | Rolling update | Optional | Optional (per service) |
| Databases | As needed | Blue-green or maintenance window | Required | Required (dump) |
| Storage (Ceph) | As needed | Rolling update | None (with replication) | Snapshot-based |
| Certificates | Quarterly | Automatic (cert-manager) | None | Automatic (previous cert still valid) |

**Upgrade strategy:**

- Kubernetes: Follow N-2 support policy (support versions N, N-1, N-2)
- Application services: Follow upstream support policy
- Databases: Use same major version across all services when possible
- Dependencies: Regularly update base images and libraries for security patches

**Upgrade process:**

1. **Review release notes**: Identify breaking changes, new features, deprecated features
2. **Test in staging**: Deploy to staging environment, run integration tests
3. **Update values**: Update helmfile values for new configuration options
4. **Plan maintenance window**: Schedule and communicate
5. **Create backup**: Ensure latest backups are available and verified
6. **Execute upgrade**: Deploy changes with rollback plan
7. **Verify**: Run smoke tests, check monitoring
8. **Monitor**: Watch for issues for 24–48 hours
9. **Clean up**: Remove old versions, update documentation

**Rollback process:**

- Kubernetes: Revert to previous helmfile commit and apply
- Application: Change image tag back to previous version
- Database: Restore from pre-upgrade backup
- Storage: Restore from snapshot
- Verify rollback: Same verification steps as upgrade

#### End-of-Life (EOL) Management

Services, dependencies, and infrastructure components reach end-of-life and must be replaced or upgraded.

**EOL tracking:**

- Maintain a list of all components with their EOL dates
- Monitor upstream announcements for EOL notices
- Set calendar reminders 6 months, 3 months, and 1 month before EOL
- Plan replacement or upgrade before EOL date

**EOL response:**

1. **Assess impact**: Which services are affected? What are the alternatives?
2. **Plan migration**: For each affected service, plan migration to supported version or alternative
3. **Test migration**: Verify migration process in staging
4. **Communicate**: Notify users of upcoming changes and migration timeline
5. **Execute**: Migrate services during maintenance window
6. **Decommission**: Remove old service after successful migration

### Security Management

Security is a shared responsibility across all roles.

#### Security Team Responsibilities

- Define security policies and standards
- Monitor security posture and threats
- Manage firewalls, network security groups, and network policies
- Coordinate vulnerability management
- Respond to security incidents
- Conduct security audits and assessments
- Maintain security documentation

#### Vulnerability Management

**Scanning:**

- **Container images**: Scan all images before deployment (Trivy, Kubescape)
- **Dependencies**: Scan for vulnerable packages (npm audit, OWASP Dependency Check)
- **Configuration**: Check for insecure configurations (kube-bench, CIS benchmarks)
- **Network**: Scan for open ports, misconfigurations (Nmap, OpenVAS)

**Remediation:**

- **Critical vulnerabilities**: Patch or mitigate within 24 hours
- **High vulnerabilities**: Patch or mitigate within 7 days
- **Medium vulnerabilities**: Patch or mitigate within 30 days
- **Low vulnerabilities**: Patch or mitigate within 90 days

**Exemption:**

Vulnerabilities can be exempted if:
- Patch is not available
- Mitigation is in place (e.g., network isolation, WAF rules)
- Risk is accepted by security team and platform owner
- Exemption is documented and has an expiration date

#### Access Control and Auditing

**Access review:**

- Conduct access reviews quarterly
- Verify that users and service accounts have appropriate access
- Remove access for users who no longer need it
- Document all access changes

**Audit logging:**

- Enable audit logging for Kubernetes API, Keycloak, and critical services
- Retain audit logs for at least 1 year (longer for compliance requirements)
- Review audit logs regularly for suspicious activity
- Protect audit log integrity (read-only storage, separate from application data)

#### Compliance Monitoring

- Map compliance requirements to platform controls
- Conduct regular compliance assessments
- Document compliance status and evidence
- Address gaps and non-compliance findings
- Provide compliance reports to auditors as needed

### Backup and Disaster Recovery Governance

#### Backup Policies

- **Frequency**: Daily for databases and critical data, weekly for less critical data
- **Retention**: 30 days of daily backups, 12 months of weekly backups, 7 years of monthly backups
- **Testing**: Restore from backup quarterly to verify backup integrity
- **Encryption**: All backups are encrypted at rest with a separate backup key
- **Off-site**: All backups are stored off-site (separate location or cloud storage)
- **Immutable**: Critical backups are immutable (WORM — Write Once Read Many) to prevent deletion or modification

#### Disaster Recovery

**Recovery Time Objective (RTO):** Target time to restore service after an incident
- **Tier 0**: Not defined (pilot, non-production)
- **Tier 1**: 4–8 hours for critical services, 24 hours for all services
- **Tier 2**: 1–4 hours for critical services, 8–24 hours for all services
- **Tier 3**: < 1 hour for critical services, 4–12 hours for all services

**Recovery Point Objective (RPO):** Maximum acceptable data loss (age of the latest backup)
- **Tier 0**: 24 hours
- **Tier 1**: 1 hour
- **Tier 2**: 15 minutes
- **Tier 3**: 5 minutes

**Disaster Recovery Plan:**

1. **Incident declaration**: Incident is identified and DR plan is activated
2. **Assessment**: Impact and scope of incident are assessed
3. **Recovery**: Services are restored from backups in priority order
4. **Verification**: Restored services are verified and tested
5. **Communication**: Users and stakeholders are notified of service restoration
6. **Post-incident review**: Incident is reviewed, root cause identified, improvements implemented

### Incident Management

#### Incident Severity Levels

| Severity | Impact | Response Time | Escalation |
|----------|--------|---------------|------------|
| **SEV-1** | Total service outage, data loss, security breach | Immediate | 24/7, all hands |
| **SEV-2** | Major service degradation, multiple services affected | 15 minutes | Extended team |
| **SEV-3** | Minor service degradation, single service affected | 1 hour | Standard team |
| **SEV-4** | Cosmetic issues, non-critical bugs | 4 hours | Individual contributor |

#### Incident Response Process

1. **Detection**: Incident is detected via monitoring, user report, or other means
2. **Triage**: Initial assessment of severity, impact, and scope
3. **Declaration**: Incident is declared with severity level and assigned owner
4. **Escalation**: Incident is escalated to appropriate team and stakeholders
5. **Investigation**: Root cause is identified and verified
6. **Mitigation**: Temporary fix or workaround is applied to restore service
7. **Resolution**: Permanent fix is implemented
8. **Recovery**: Service is verified as fully operational
9. **Post-mortem**: Incident is reviewed, documented, and improvements are identified
10. **Closing**: Incident is closed with all follow-up actions completed

#### Communication During Incidents

- **Internal**: incident updates are shared via team chat, incident management system
- **External (users)**: Status page shows current incident status and estimated resolution time
- **Stakeholders**: Regular updates via email, phone, or video conference for SEV-1 and SEV-2 incidents
- **Post-incident**: Post-mortem report shared with stakeholders for SEV-1 and SEV-2 incidents

### Documentation and Knowledge Management

**Documentation is a critical part of governance.** Maintain up-to-date documentation for:

- **Architecture**: System architecture, service dependencies, data flows
- **Operations**: Deployment, configuration, troubleshooting, maintenance procedures
- **Security**: Security policies, procedures, standards, guidelines
- **Compliance**: Compliance requirements, controls, evidence
- **Change**: Change request templates, approval processes, CAB meeting minutes
- **Incident**: Incident reports, post-mortems, lessons learned
- **User**: User guides, FAQs, tutorials

**Documentation standards:**

- Keep documentation in version control (Git) alongside the code
- Format documentation in Markdown for easy editing and versioning
- Review documentation as part of every change
- Update documentation before or immediately after implementing changes
- Use diagrams and examples to clarify complex concepts
- Keep documentation up-to-date with the current state of the platform

### Community and Contribution

**openDesk Edu is a community-driven project.** Contributions are welcome in the form of:

- Bug reports and feature requests via GitHub issues
- Documentation improvements
- Code contributions via pull requests
- Community support on Matrix chat (`#opendesk-ce-public:matrix.opendesk-edu.org`)
- Presentations, blog posts, and conference talks

**Contribution process:**

1. **Fork** the repository and create a feature branch
2. **Commit** changes with clear commit messages
3. **Open** a pull request with description and context
4. **Discuss** changes with maintainers
5. **Address** feedback and make updates as needed
6. **Merge** once approved and all tests pass

**Code review:**

- All changes are reviewed by at least one maintainer
- Review focuses on code quality, architecture, and adherence to standards
- Constructive feedback is provided and discussd respectfully
- Contributors are expected to address feedback and update their changes

**Maintainer guidelines:**

- Respond to issues and pull requests in a timely manner
- Provide clear and constructive feedback
- Be welcoming and inclusive to all contributors
- Follow the project's code of conduct
- Make release decisions based on consensus with the community

---

## Putting It All Together

This companion document gives you the tools to **plan** and **operate** a successful openDesk Edu deployment:

- The **Capacity Analysis** section helps you size your infrastructure for your institution's needs
- The **Governance Model** section describes how to manage the platform over its lifecycle

Use the capacity tables as starting points, then observe and adjust based on your actual usage patterns. Use the governance processes as templates, then adapt them to your institution's culture and requirements.

**Next Steps:**

1. **Plan your deployment**: Use the tier descriptions and service tables to estimate your resource requirements
2. **Design your governance**: Adopt and adapt the governance processes to your institution
3. **Deploy**: Install openDesk Edu using the [System Architecture Overview](/architecture/overview) as your guide
4. **Monitor**: Set up observability and alerting to track resource usage and platform health
5. **Iterate**: Regularly review capacity and governance, making improvements based on real-world experience

---

*Capacity planning is about preparation. Governance is about sustainability. Together, they ensure your openDesk Edu platform can grow with your institution and remain reliable year after year.*
