## Purpose

Canonical reference documentation for the openDesk Edu security architecture, consolidating network policies, secret management, RBAC, audit logging, and compliance framework mapping into a single reference article.

## ADDED Requirements

### Requirement: Article covers the security architecture holistically

The article SHALL consolidate the security architecture into a single reference: network policies, secret management, role-based access control (RBAC), audit logging, and compliance framework alignment. It SHALL reference but not duplicate the detailed blog posts on SOPS, ZKI IT-Grundschutz, and security-compliance.

#### Scenario: Security reviewer assesses the platform

- **WHEN** a security reviewer or auditor reads the article
- **THEN** they understand the full security model: how secrets are managed, how access is controlled, how traffic is isolated, and how compliance frameworks map to the architecture

### Requirement: Secret management is documented

The article SHALL describe how secrets are managed: SOPS with age encryption, GitOps-native secret handling, the ArgoCD CMP sidecar pattern, and the principle of no plaintext secrets in Git. It SHALL NOT include actual secret values, age key identifiers, or internal configuration.

#### Scenario: Administrator understands secret management

- **WHEN** an administrator needs to understand how secrets work
- **THEN** the article explains the SOPS + age + ArgoCD CMP pattern at a conceptual level, with a focus on the security properties (encryption at rest, no plaintext in Git, decryption at deploy time)

### Requirement: Network security and isolation are documented

The article SHALL describe how network policies isolate services, how namespace separation provides blast-radius containment, and how ingress is controlled. It SHALL complement the networking architecture article with a security-focused perspective.

#### Scenario: Administrator reviews network security

- **WHEN** an administrator reviews the network security posture
- **THEN** the article explains the network policy model, default-deny patterns, and namespace isolation at a conceptual level

### Requirement: RBAC and access control are documented

The article SHALL describe how role-based access control works: Kubernetes RBAC for cluster operations, Keycloak roles for application-level access, and how the two layers interact. It SHALL describe the principle of least privilege and how service accounts are scoped.

#### Scenario: Administrator configures access

- **WHEN** an administrator needs to grant or restrict access
- **THEN** the article explains the RBAC model: Kubernetes-level (cluster admin, namespace admin, read-only) and application-level (Keycloak realm roles, service-specific roles)

### Requirement: Audit logging is documented

The article SHALL describe what audit trails exist: Kubernetes audit logging, Keycloak event logging, application-level audit logs, and how they support incident response and compliance evidence.

#### Scenario: Compliance audit

- **WHEN** an auditor needs to verify access patterns
- **THEN** the article explains what logs are available, where they are stored, and how they support compliance evidence

### Requirement: Compliance framework mapping is documented

The article SHALL map the platform's security controls to recognised frameworks: BSI IT-Grundschutz (specifically the ZKI higher-education profile), GDPR/DSGVO, and ISO 27001. The mapping SHALL be factual and neutral, not an endorsement or certification claim.

#### Scenario: Institution maps controls to compliance requirements

- **WHEN** an institution needs to map the platform to their compliance framework
- **THEN** the article provides a control-to-framework mapping table showing which architectural features satisfy which compliance requirements

### Requirement: Article follows editorial rules

The article SHALL comply with the article-writing skill rules: institutional neutrality (Rule 1), no internal data leaks (Rule 2), no fixed service counts (Rule 3), vendor neutrality (Rule 4), and Abmahnrisiko compliance. Security descriptions SHALL be architectural patterns, not specific deployment configurations.

#### Scenario: Pre-publication checklist passes

- **WHEN** the article is reviewed before publication
- **THEN** it contains no internal secrets, keys, policy YAML, IP addresses, or specific deployment details; all security descriptions are pattern-level

### Requirement: Article exists in all four locales

The article SHALL be written in English (source of truth) and translated to German, French, and Chinese. File names (slugs) SHALL be identical across locales.

#### Scenario: Multi-locale availability

- **WHEN** a user navigates to the article in any of the four locales
- **THEN** the article is available in the respective language with the same structure and technical accuracy
