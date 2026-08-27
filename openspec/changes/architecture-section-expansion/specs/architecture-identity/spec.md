## Purpose

Canonical reference documentation for the openDesk Edu identity and authentication architecture, describing the full authentication chain from federation to service, attribute mapping, and multi-IdP scenarios.

## ADDED Requirements

### Requirement: Article covers the complete authentication chain

The article SHALL document the full authentication flow: user → DFN-AAI / eduGAIN → Keycloak (IdP) → SAML 2.0 / OIDC → Shibboleth SP (where required) → target service. Each hop SHALL be explained with its protocol, purpose, and failure behaviour.

#### Scenario: Reader understands the full auth chain

- **WHEN** a CIO or architect reads the article
- **THEN** they can describe every component in the authentication chain and explain why each is necessary

### Requirement: Federation integration is documented

The article SHALL describe how Keycloak connects to DFN-AAI and eduGAIN, including metadata exchange, entity IDs, attribute release policies, and how home-organisation credentials are used.

#### Scenario: Institution plans federation integration

- **WHEN** an institution needs to connect its IdP to the platform
- **THEN** the article provides the conceptual steps: register entity ID, exchange metadata, configure attribute mapping, test with a test account

### Requirement: Attribute mapping is documented

The article SHALL explain how SAML attributes from the federation (e.g., eduPersonAffiliation, eduPersonScopedAffiliation, mail, displayName, sn, givenName) are mapped to Keycloak user attributes and then to OIDC claims or downstream SAML assertions for services.

#### Scenario: Administrator configures attribute mapping

- **WHEN** an administrator needs to adjust which attributes are released to a service
- **THEN** the article explains the mapping chain (federation → Keycloak mappers → service claim) at a conceptual level

### Requirement: Protocol dual-stack (SAML + OIDC) is documented

The article SHALL explain why the platform runs both SAML 2.0 and OpenID Connect simultaneously, which services use which protocol, and how Keycloak brokers between them.

#### Scenario: Reader understands protocol selection

- **WHEN** a reader asks "why both SAML and OIDC?"
- **THEN** the article explains that legacy education services (ILIAS, Moodle, BigBlueButton) require SAML SP, while modern applications prefer OIDC, and Keycloak translates between them

### Requirement: Multi-IdP and multi-federation scenarios are documented

The article SHALL describe how the platform supports connecting to multiple identity providers simultaneously (e.g., DFN-AAI for German institutions, SWAMID for Swedish, uk federation for UK) and how home-organisation discovery works.

#### Scenario: Multi-institution deployment

- **WHEN** an institution needs to accept users from multiple federations
- **THEN** the article explains how Keycloak can broker multiple IdPs and how the discovery UI (IDP selector) presents choices to users

### Requirement: Nubus portal integration is documented

The article SHALL describe the role of Nubus as the user-facing portal layer for identity management: self-service password reset, group management, application launch, and audit logging.

#### Scenario: Reader understands Nubus role

- **WHEN** a reader asks what Nubus does vs. Keycloak
- **THEN** the article explains that Keycloak is the IdP/broker while Nubus is the self-service portal that sits in front of it for end-user operations

### Requirement: Security boundaries and failure modes are documented

The article SHALL describe what happens when federation metadata is stale, when an IdP is unavailable, and when attribute release is insufficient. It SHALL explain the security boundary between the federation layer and the service layer.

#### Scenario: IdP outage

- **WHEN** the upstream IdP (DFN-AAI home organisation) is unavailable
- **THEN** the article explains that local services remain accessible to locally-provisioned users but federated login fails gracefully with a clear error

### Requirement: Article follows editorial rules

The article SHALL comply with the article-writing skill rules: institutional neutrality (Rule 1), no internal data leaks (Rule 2), no fixed service counts (Rule 3), vendor neutrality (Rule 4), and Abmahnrisiko compliance.

#### Scenario: Pre-publication checklist passes

- **WHEN** the article is reviewed before publication
- **THEN** it contains no internal hostnames, IP addresses, node names, or institutional identifiers; all trademarks are correctly marked; all quantitative claims are sourced or marked as estimates

### Requirement: Article exists in all four locales

The article SHALL be written in English (source of truth) and translated to German, French, and Chinese. File names (slugs) SHALL be identical across locales. Frontmatter title and description SHALL be translated.

#### Scenario: Multi-locale availability

- **WHEN** a user navigates to /de/architecture/identity-authentication, /fr/architecture/identity-authentication, or /zh/architecture/identity-authentication
- **THEN** the article is available in the respective language with the same structure and technical accuracy as the English version
