## Purpose

Canonical reference documentation for the openDesk Edu storage and data-management architecture, describing persistent volume provisioning, database backends, data lifecycle, and capacity-planning guidance.

## ADDED Requirements

### Requirement: Article covers storage architecture

The article SHALL describe how persistent storage works in the platform: Kubernetes PersistentVolumes, storage classes, dynamic provisioning, volume access modes (RWO, RWX), and how services claim storage. The description SHALL be architectural, not tied to specific cluster sizes or PV counts.

#### Scenario: Reader understands storage model

- **WHEN** an architect reads the article
- **THEN** they can explain how a service obtains persistent storage, what storage classes are, and how volumes are provisioned

### Requirement: Database backends are documented

The article SHALL describe the database landscape: which services use MariaDB/MySQL, which use PostgreSQL, which use Redis, and how database connections are managed. It SHALL describe the pattern (per-service database, shared instance, or external) without revealing internal credentials or connection strings.

#### Scenario: Administrator plans database capacity

- **WHEN** an administrator needs to plan database resources
- **THEN** the article explains which databases are needed, the per-service isolation model, and general capacity considerations

### Requirement: Backup integration is documented at a conceptual level

The article SHALL describe how storage connects to the backup architecture (k8up + restic), what backup tiers exist (daily, weekly, on-demand), and how restores work. It SHALL reference the backup architecture without duplicating the full backup article content.

#### Scenario: Administrator plans backup strategy

- **WHEN** an administrator needs to understand the backup model
- **THEN** the article explains the 3-tier approach, what data is backed up, and how restore works at a conceptual level

### Requirement: Data lifecycle and migration are documented

The article SHALL describe what happens to data when a service is removed, when a component is switched (e.g., Nextcloud → OpenCloud), and when storage needs to grow. It SHALL cover volume expansion, data export, and migration considerations.

#### Scenario: Institution switches file storage component

- **WHEN** an institution switches from one storage component to another
- **THEN** the article explains what data needs to be migrated, what happens to the old volumes, and what the planning steps are

### Requirement: Capacity planning guidance is provided

The article SHALL provide general guidance on storage capacity planning: how to estimate per-user storage, how to size database volumes, and how to plan for growth. Guidance SHALL be general (patterns and formulas) not tied to specific deployment numbers.

#### Scenario: Institution sizes storage for deployment

- **WHEN** an institution plans storage for 5,000 users
- **THEN** the article provides per-user estimates and sizing formulas so the institution can calculate rough storage requirements

### Requirement: Article follows editorial rules

The article SHALL comply with the article-writing skill rules: institutional neutrality (Rule 1), no internal data leaks (Rule 2), no fixed service counts (Rule 3), vendor neutrality (Rule 4), and Abmahnrisiko compliance.

#### Scenario: Pre-publication checklist passes

- **WHEN** the article is reviewed before publication
- **THEN** it contains no internal PV names, storage class names, PVC details, backup targets, or S3 endpoints; all descriptions are architectural patterns

### Requirement: Article exists in all four locales

The article SHALL be written in English (source of truth) and translated to German, French, and Chinese. File names (slugs) SHALL be identical across locales.

#### Scenario: Multi-locale availability

- **WHEN** a user navigates to the article in any of the four locales
- **THEN** the article is available in the respective language with the same structure and technical accuracy
