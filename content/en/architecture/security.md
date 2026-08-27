---
title: "Security Architecture"
date: "2026-08-27"
description: "The security architecture of openDesk Edu — secret management with SOPS and age encryption, network policies, RBAC, audit logging, and compliance framework mapping to BSI IT-Grundschutz, GDPR, and ISO 27001."
categories: ["architecture", "infrastructure", "security"]
tags: ["architecture", "security", "sops", "rbac", "network-policies", "audit-logging", "compliance", "bsi", "gdpr", "iso-27001", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/security-architecture-teaser.svg"
---

# Security Architecture

Security is not a single feature — it is a layered architecture that spans secrets, network isolation, access control, audit trails, and compliance frameworks. This article consolidates the platform's security model into a single reference: how secrets are managed, how access is controlled, how traffic is isolated, and how the architecture maps to recognised compliance frameworks.

For the identity layer that authenticates users, see [Identity & Authentication Architecture](/architecture/identity-authentication). For how traffic enters and is routed, see [Networking & Traffic Flow Architecture](/architecture/networking-traffic-flow). For data storage and backups, see [Storage & Data Management Architecture](/architecture/storage-data-management).

## Secret Management

### The Problem with Secrets in GitOps

A GitOps workflow stores all configuration in Git — including Helm charts, values files, and deployment manifests. But some configuration contains secrets: database passwords, API keys, TLS private keys, and authentication tokens. Storing these in plaintext in Git is a security risk: anyone with repository access can read them, and Git history preserves them forever.

### SOPS with age Encryption

The platform uses SOPS (Secrets OPerationS) with age encryption to manage secrets in Git. SOPS encrypts the values of secret keys while leaving the key names and structure in plaintext. This means:

- **The secret file structure is visible** — operators can see which secrets exist without decrypting
- **The secret values are encrypted** — only the values are unreadable without the age private key
- **Git history is safe** — encrypted values in old commits remain encrypted

The age encryption key is stored outside Git (typically on the deployment server or in a hardware security module). The GitOps controller (ArgoCD) uses a CMP (Config Management Plugin) sidecar to decrypt secrets at deploy time. The decryption happens in the cluster, and the decrypted secrets are never written to disk or Git.

### ArgoCD CMP Sidecar Pattern

The decryption flow works as follows:

1. **Encrypted secrets in Git**: SOPS-encrypted secret files are stored in the Git repository alongside other configuration
2. **ArgoCD detects changes**: ArgoCD monitors the Git repository and detects when secret files change
3. **CMP sidecar decrypts**: The Config Management Plugin sidecar runs in the ArgoCD repository server pod. It receives the encrypted secret, uses the age private key to decrypt it, and produces a Kubernetes Secret manifest
4. **Kubernetes Secret created**: The decrypted Secret manifest is applied to the cluster. The Secret exists only in the cluster's etcd, never in Git
5. **Pods mount the Secret**: Application pods reference the Secret in their deployment manifests and mount it as environment variables or files

This pattern ensures that:
- No plaintext secrets exist in Git (only encrypted values)
- No plaintext secrets exist on disk outside the cluster (the age key is separate)
- Decryption happens at deploy time, not at build time
- The age key can be rotated without re-encrypting all secrets (age supports recipient rotation)

### Secret Rotation

Secrets should be rotated periodically. The platform's approach:

- **Database passwords**: Rotated by generating a new password, updating the SOPS-encrypted secret, and letting ArgoCD deploy the change. The database accepts both the old and new password briefly during the transition.
- **API keys**: Rotated by the service that issued them. The old key is revoked after the new key is deployed.
- **TLS private keys**: Rotated alongside certificate renewal (see [Networking & Traffic Flow Architecture](/architecture/networking-traffic-flow) for certificate management).
- **Age encryption key**: Rotated by generating a new key, re-encrypting all secrets with the new key, and updating the ArgoCD CMP sidecar. This is a maintenance window operation.

## Network Security and Isolation

### Network Policies

The platform uses Kubernetes network policies to enforce network segmentation. The default-deny model means all pod-to-pod traffic is denied unless explicitly allowed. For a detailed description of network policies and the traffic flow path, see [Networking & Traffic Flow Architecture](/architecture/networking-traffic-flow).

From a security perspective, network policies provide:

- **Blast-radius containment**: If one pod is compromised, the attacker cannot reach other pods unless a network policy allows it
- **Least privilege**: Each service can only reach the specific services and ports it needs
- **Audit trail**: Network policies are declarative (stored in Git), so the network security posture is versioned and reviewable

### Namespace Isolation

Services run in separate Kubernetes namespaces, providing logical isolation:

- Each major service (or group of related services) has its own namespace
- Cross-namespace traffic requires an explicit network policy
- Resource quotas can be applied per-namespace to prevent a compromised service from consuming all cluster resources

### Encryption in Transit

All external traffic is encrypted with TLS (see [Networking & Traffic Flow Architecture](/architecture/networking-traffic-flow) for TLS details). Internal pod-to-pod traffic is not encrypted by default but can be upgraded to mTLS (mutual TLS) for services that require it.

### Encryption at Rest

Data at rest is encrypted through:

- **PersistentVolumes**: Storage-class-dependent. Ceph supports encrypted volumes. Local and NFS storage rely on the underlying storage encryption (e.g., LUKS on the node).
- **Database storage**: Database files on PersistentVolumes inherit the PV encryption. Application-level encryption (e.g., column-level encryption in PostgreSQL) is service-specific.
- **Backups**: All restic backups are encrypted with a configurable key. The backup key is separate from the age encryption key used for GitOps secrets.

## Role-Based Access Control (RBAC)

The platform has two layers of RBAC: Kubernetes RBAC for cluster operations and Keycloak RBAC for application-level access.

### Kubernetes RBAC

Kubernetes RBAC controls who can perform what actions on cluster resources. The platform defines roles at three levels:

- **Cluster admin**: Full access to all cluster resources. Used by platform operators for cluster-level management.
- **Namespace admin**: Full access to resources within a specific namespace. Used by service operators who manage a single service or group of services.
- **Read-only**: View access to resources without modification. Used for monitoring, auditing, and debugging.

Each role is bound to users or groups via RoleBindings (namespace-scoped) or ClusterRoleBindings (cluster-scoped). Service accounts (used by pods and automation) get their own roles with minimal permissions.

### Keycloak RBAC

Keycloak manages application-level access through realm roles and client roles:

- **Realm roles**: Roles defined at the Keycloak realm level (e.g., `admin`, `user`, `student`, `staff`)
- **Client roles**: Roles specific to a service (e.g., `nextcloud-admin`, `moodle-teacher`)
- **Group memberships**: Users can be members of groups, which grant roles across multiple services

When a user authenticates (see [Identity & Authentication Architecture](/architecture/identity-authentication)), Keycloak includes their roles in the OIDC token. Services read these roles and enforce access control:

- **Nextcloud**: Checks Keycloak roles for admin vs. user access
- **Moodle**: Maps Keycloak roles to course roles (teacher, student, manager)
- **OpenProject**: Maps Keycloak roles to project permissions

### Principle of Least Privilege

Both Kubernetes RBAC and Keycloak RBAC follow the principle of least privilege:

- **Kubernetes**: Service accounts have only the permissions needed to function. A service that reads ConfigMaps does not get permissions to delete Pods.
- **Keycloak**: Users have only the roles needed for their function. A student does not have admin roles. A teacher does not have cluster-admin roles.
- **Network policies**: A service can only reach the specific services and ports it needs (see [Networking & Traffic Flow Architecture](/architecture/networking-traffic-flow))

## Audit Logging

Audit logging provides a trail of who did what and when. The platform has multiple audit log sources:

### Kubernetes Audit Logging

Kubernetes can audit-log all API requests to the cluster. The audit log captures:

- **Who**: The authenticated user (or service account) making the request
- **What**: The resource being accessed (e.g., `pods`, `secrets`, `configmaps`)
- **When**: Timestamp of the request
- **How**: The HTTP verb (GET, POST, PUT, DELETE)
- **Result**: Whether the request was allowed or denied

Audit logging is configured at the Kubernetes API server level. The logs can be sent to a central logging system (e.g., Loki, Elasticsearch) for long-term storage and analysis.

### Keycloak Event Logging

Keycloak logs authentication events:

- Successful and failed logins
- Token issuance and refresh
- Session creation and termination
- Role and group membership changes
- Federation events (IdP connections, attribute mapping)

These logs support incident investigation (who logged in when, from where) and compliance evidence (access patterns for auditors).

### Application-Level Audit Logs

Each service maintains its own audit log:

- **Nextcloud**: File access, shares, deletions
- **Moodle**: Course access, grade changes, content modifications
- **OpenProject**: Project changes, task assignments
- **Zammad**: Ticket access and modifications

Application audit logs are service-specific and stored in the service's database or log files. They are included in the platform's backup schedule (see [Storage & Data Management Architecture](/architecture/storage-data-management)).

### Central Log Aggregation

For production deployments, logs from all services can be aggregated into a central logging system:

- **Loki**: Log aggregation with Grafana dashboards
- **Prometheus**: Metrics (not logs, but related to observability)
- **Alertmanager**: Alerts on log patterns (e.g., repeated failed logins, unusual API access)

Central log aggregation is optional but recommended for larger deployments. It enables cross-service correlation (e.g., "user X logged in at Keycloak, then accessed Nextcloud, then deleted a file") and long-term log retention.

## Compliance Framework Mapping

The platform's security controls map to recognised compliance frameworks. This mapping is factual — it describes which architectural features satisfy which compliance requirements. It is not a certification or an endorsement.

### BSI IT-Grundschutz (ZKI Higher-Education Profile)

BSI IT-Grundschutz is the German federal security standard. The ZKI (Zentrum für Konsortiale IT-Dienste) higher-education profile adapts IT-Grundschutz for universities. The platform's security controls map to several IT-Grundschutz modules:

| IT-Grundschutz Module | Platform Control |
|----------------------|-----------------|
| ORP.4 (Authentication) | DFN-AAI federation, Keycloak SSO, MFA support |
| CON.1 (Crypto Concept) | TLS for transit, SOPS/age for secrets, restic encryption for backups |
| CON.6 (Cryptographic Keys) | Age key management, TLS certificate lifecycle, key rotation |
| OPS.1 (Operation) | GitOps with ArgoCD, declarative configuration, version-controlled changes |
| OPS.4 (Administration) | Kubernetes RBAC, namespace isolation, least-privilege service accounts |
| APP.3 (Web Applications) | Security headers (HSTS, CSP, X-Frame-Options), rate limiting, input validation |
| SYS.1 (Servers) | Kubernetes hardening, network policies, default-deny model |
| INF.2 (IT Systems) | PersistentVolume encryption, backup encryption |
| DER.4 (Business Continuity) | k8up backup schedule, restic off-site backup, restore procedures |

### GDPR / DSGVO

The General Data Protection Regulation (GDPR / DSGVO in German) regulates the processing of personal data. The platform supports GDPR compliance through:

- **Data minimisation**: The platform requests only the attributes it needs from the federation (see [Identity & Authentication Architecture](/architecture/identity-authentication) for the attribute mapping). It does not store sensitive attributes (e.g., national ID numbers) from the federation.
- **No password storage for federated users**: The platform never sees or stores the user's institutional password. Authentication happens at the IdP; the platform only receives assertions.
- **Right to erasure**: When a user account is removed, the platform deletes the user's data across all services (see [Storage & Data Management Architecture](/architecture/storage-data-management) for the deletion process).
- **Data portability**: User data can be exported from each service (Nextcloud file export, Moodle course export, etc.).
- **Audit trail**: Keycloak event logging and application audit logs provide evidence of who accessed what data and when.
- **Encryption**: Data is encrypted in transit (TLS) and at rest (PV encryption, backup encryption).

The platform is a data processor; the institution is the data controller. The institution is responsible for the lawful basis of processing, data protection impact assessments, and data subject rights. The platform provides the technical controls to support these obligations.

### ISO 27001

ISO/IEC 27001 is the international standard for information security management systems (ISMS). The platform's controls map to several ISO 27001 Annex A controls:

| ISO 27001 Control | Platform Control |
|------------------|-----------------|
| A.5.15 (Access Control) | Keycloak RBAC, Kubernetes RBAC, network policies |
| A.5.17 (Authentication Information) | SOPS/age secret management, no plaintext secrets in Git |
| A.5.18 (Access Rights) | Least-privilege service accounts, namespace isolation |
| A.5.21 (Information Transfer) | TLS for all transit, mTLS for internal traffic (where enabled) |
| A.5.30 (ICT Readiness for Business Continuity) | k8up backups, restic off-site storage, restore procedures |
| A.5.33 (Protection of Records) | Audit logging (Kubernetes, Keycloak, application-level) |
| A.5.34 (Privacy and Protection of PII) | GDPR compliance controls (data minimisation, right to erasure) |
| A.8.1 (User Endpoint Devices) | N/A (endpoints are managed by the institution, not the platform) |
| A.8.2 (Privileged Access Rights) | Kubernetes cluster-admin, namespace-admin, read-only roles |
| A.8.3 (Information Access Restriction) | Network policies, RBAC, namespace isolation |
| A.8.4 (Access to Source Code) | Git repository access control, ArgoCD GitOps |
| A.8.5 (Secure Authentication) | DFN-AAI federation, Keycloak SSO, MFA support |
| A.8.7 (Malware Protection) | ClamAV virus scanning (where deployed) |
| A.8.9 (Configuration Management) | GitOps with ArgoCD, declarative Helm charts, version-controlled configuration |
| A.8.12 (Data Leakage Prevention) | Network policies, namespace isolation, default-deny model |
| A.8.13 (Information Backup) | k8up backup schedule, restic encrypted backups |
| A.8.14 (Redundancy of Information Processing) | Database replication (MariaDB, PostgreSQL), PV replication (Ceph) |
| A.8.15 (Logging) | Kubernetes audit logging, Keycloak event logging, application audit logs |
| A.8.24 (Use of Cryptography) | TLS, SOPS/age, restic encryption |

## Security Hardening Checklist

The following checklist summarises the security controls that should be verified for any deployment:

- [ ] **Secrets encrypted**: All secrets stored in Git are SOPS-encrypted with age. No plaintext secrets in any Git repository.
- [ ] **TLS enforced**: All external traffic uses TLS 1.2+. HTTP is redirected to HTTPS. HSTS is enabled.
- [ ] **Network policies**: Default-deny model is active. Each service has explicit network policies allowing only necessary traffic.
- [ ] **RBAC configured**: Kubernetes RBAC roles are scoped to least privilege. Service accounts have minimal permissions.
- [ ] **Audit logging enabled**: Kubernetes audit logging, Keycloak event logging, and application audit logs are active and being collected.
- [ ] **Backups encrypted**: All restic backups are encrypted. The backup key is separate from the age key.
- [ ] **Backup monitoring**: Prometheus alerts are configured for backup failures. The last successful backup timestamp is monitored.
- [ ] **Key rotation procedure documented**: Age key, TLS certificates, database passwords, and API keys have documented rotation procedures.
- [ ] **Namespace isolation**: Services run in separate namespaces. Cross-namespace traffic is explicit.
- [ ] **Container images scanned**: Container images are scanned for vulnerabilities (e.g., Kubescape, Trivy) before deployment.

---

## Further Reading

- [Identity & Authentication Architecture](/architecture/identity-authentication) — the authentication chain, federation, and attribute mapping
- [Networking & Traffic Flow Architecture](/architecture/networking-traffic-flow) — traffic flow, TLS, ingress, and network policies
- [Storage & Data Management Architecture](/architecture/storage-data-management) — persistent storage, databases, and backup integration
- [System Architecture Overview](/architecture/overview) — the full platform architecture
- [Security and Compliance](/blog/security-compliance) — blog post on the platform's security and compliance approach
- [SOPS Secret Management with ArgoCD CMP](/blog/sops-secret-management-argocd-cmp) — blog post on the SOPS + age + ArgoCD pattern
- [BSI IT-Grundschutz Compliance](/blog/zki-it-grundschutz-compliance) — blog post on BSI IT-Grundschutz alignment

---

*Security is a layered architecture, not a single feature. Each layer — secrets, network, access control, audit, compliance — reinforces the others. No single layer is sufficient; together, they provide defence in depth.*
