---
title: "Identity & Authentication Architecture"
date: "2026-08-27"
description: "The complete authentication chain in openDesk Edu — from DFN-AAI federation through Keycloak SSO to SAML and OIDC service connections, attribute mapping, and multi-IdP scenarios."
categories: ["architecture", "infrastructure"]
tags: ["architecture", "identity", "authentication", "saml", "oidc", "keycloak", "federation", "dfn-aai", "edugain", "shibboleth", "nubus"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/identity-authentication-teaser.svg"
---

# Identity & Authentication Architecture

Identity is the first thing every user touches. Before a student opens a file, joins a lecture, or edits a document, they authenticate. In higher education, that authentication rarely happens on the platform itself — it happens at the user's home institution, federated through national and international identity networks. This article documents how openDesk Edu handles that flow end to end: from the federation layer through Keycloak as the central identity broker, down to the individual service that ultimately receives the user's identity attributes.

For a high-level overview of the entire platform, see [System Architecture Overview](/architecture/overview). For a comparison of component choices (email, video, files), see [Component Alternatives](/architecture/component-alternatives).

## The Authentication Chain

The platform uses a three-tier authentication architecture. Each tier has a distinct responsibility, and the boundaries between them are the security boundaries of the system.

### Tier 1: Federation Layer (External)

The outermost tier is the identity federation. In Germany, this is DFN-AAI (Deutsches Forschungsnetz — Authentication and Authorization Infrastructure), operated by the DFN-Verein. DFN-AAI connects university Identity Providers (IdPs) with Service Providers (SPs) through SAML 2.0 metadata exchange. It is itself part of eduGAIN, the global inter-federation that extends the trust network to participating institutions worldwide.

When a student at a German university logs in, their browser is redirected to their home institution's IdP (typically a Shibboleth IdP). The IdP authenticates the user (via the institution's local method — LDAP, password, MFA) and issues a SAML assertion containing attributes about the user: their name, email, affiliation, and home organisation. This assertion travels back through the federation to the platform's Service Provider endpoint.

The federation layer is the trust root. The platform does not authenticate the user directly — it trusts the federation's assertion. This means no university needs to create or manage accounts on the platform; existing institutional accounts work automatically.

### Tier 2: Identity Broker (Keycloak)

Keycloak sits at the centre of the platform's identity stack. It acts as both a SAML Service Provider (to the federation) and an OpenID Connect (OIDC) Identity Provider (to internal services). This dual role is the architectural keystone: it lets the platform speak SAML to the outside world while speaking OIDC to its own services.

The authentication flow through Keycloak works as follows:

1. **Service redirects to Keycloak**: When a user accesses a service (e.g., Nextcloud, Moodle), the service checks for a valid session. If none exists, it redirects the user to Keycloak's authorization endpoint with an OIDC authorisation request.
2. **Keycloak checks for existing session**: If the user already has a Keycloak session (from a previous service login), Keycloak issues an OIDC token immediately. This is single sign-on (SSO) — the user authenticates once and accesses all services.
3. **Keycloak redirects to federation**: If no session exists, Keycloak redirects the user to the configured identity broker (DFN-AAI / eduGAIN). The user selects their home organisation via a discovery interface and authenticates at their institutional IdP.
4. **Federation returns SAML assertion**: The IdP issues a SAML assertion containing the user's attributes. Keycloak receives this assertion, validates it against the federation metadata, and creates a local user session with the mapped attributes.
5. **Keycloak issues OIDC token**: Keycloak translates the SAML attributes into OIDC claims and issues an access token, refresh token, and ID token to the requesting service. The service uses these tokens to identify the user and enforce authorisation.

This flow is transparent to the user. They see their institutional login page, then they are in the platform. The SAML-to-OIDC translation, attribute mapping, and token issuance all happen behind the scenes.

### Tier 3: Service Layer (Internal)

Each service in the platform receives the user's identity through one of two protocols:

- **OpenID Connect (OIDC)**: Modern services (Nextcloud, OpenProject, XWiki, Planka, Zammad, CryptPad, OpenCloud) connect directly to Keycloak using the standard OIDC authorisation code flow. They receive JWT access tokens and ID tokens, which they validate against Keycloak's public keys.

- **SAML 2.0**: Education services that require a dedicated SAML Service Provider (ILIAS, Moodle, BigBlueButton) use Shibboleth as an SP. Shibboleth sits between Keycloak and the service, translating Keycloak's SAML assertions into the format each application expects. Each service gets its own Shibboleth configuration with service-specific attribute filters.

The choice of protocol is driven by the service, not by the platform. Services that support OIDC use it directly; services that only support SAML get a Shibboleth SP in front. Keycloak handles both simultaneously.

## Federation Integration

### DFN-AAI

DFN-AAI is Germany's national academic identity federation. It connects over 400 universities and research institutions through SAML 2.0 metadata exchange. For openDesk Edu, integrating with DFN-AAI means:

- **Entity ID registration**: The platform's Keycloak instance is registered as a Service Provider in the DFN-AAI federation metadata. This registration includes the entity ID, the Assertion Consumer Service (ACS) URL, and the signing certificate.
- **Metadata exchange**: The platform consumes the DFN-AAI federation metadata (a signed XML file listing all trusted IdPs) and publishes its own SP metadata. Keycloak automatically refreshes the federation metadata on a configurable schedule.
- **Attribute release**: Each institutional IdP configures which attributes it releases to the platform. The platform requests a standard set of eduGAIN attributes (see Attribute Mapping below), but the IdP ultimately decides what to release based on its own policies.

### eduGAIN

eduGAIN is the global inter-federation that connects national federations (DFN-AAI in Germany, SWAMID in Sweden, InCommon in the US, the UK Access Management Federation in the UK, and others). Through eduGAIN, a user from any participating federation can authenticate to the platform — not just German institutions.

The platform's DFN-AAI registration automatically includes eduGAIN participation. No separate registration is needed; the eduGAIN metadata is embedded in the DFN-AAI metadata feed.

### Multi-Federation Scenarios

An institution may need to accept users from multiple national federations simultaneously — for example, a German university collaborating with Swedish and Dutch partners. Keycloak supports this through multiple identity broker configurations:

- Each federation is configured as a separate identity provider in Keycloak
- The login page presents an IdP discovery interface where users select their federation and home organisation
- Keycloak routes the authentication request to the selected federation
- Upon return, Keycloak normalises the attributes (different federations may use slightly different attribute names) and creates the local session

This multi-federation setup is configuration, not code. Adding a new federation is a matter of importing its metadata and configuring the attribute mappers in Keycloak's admin console.

## Attribute Mapping

When a user authenticates through the federation, their IdP releases a set of SAML attributes. Keycloak maps these to internal user attributes and then to OIDC claims that services consume. The mapping is the critical path: if attributes do not arrive correctly, users cannot authenticate, roles are not assigned, and personalisation fails.

### Standard eduGAIN Attributes

| Attribute | Description | Keycloak Mapping | OIDC Claim |
|-----------|-------------|------------------|------------|
| `eduPersonPrincipalName` | Unique, persistent user identifier | `eppn` | `eppn` |
| `mail` | Email address | `email` | `email` |
| `displayName` | Full display name | `name` | `name` |
| `givenName` | First name | `firstName` | `given_name` |
| `sn` | Surname | `lastName` | `family_name` |
| `eduPersonAffiliation` | Role (student, staff, faculty, member) | `affiliation` | `affiliation` |
| `eduPersonScopedAffiliation` | Affiliation with scope domain | `scopedAffiliation` | `scoped_affiliation` |
| `eduPersonEntitlement` | Entitlement URNs (group memberships) | `entitlement` | `entitlement` |
| `preferredLanguage` | Language preference | `locale` | `locale` |
| `schacHomeOrganization` | Home organisation domain | `organization` | `home_organization` |

The first five attributes (eppn, mail, displayName, givenName, sn) are mandatory for DFN-AAI registration. The remaining five are recommended and enhance the user experience but are not required for basic authentication.

### Attribute Mapper Configuration

Keycloak uses attribute mappers to translate between SAML and OIDC. Each mapper defines:

- **Source attribute**: The SAML attribute name from the federation (using `urn:oasis:names:tc:SAML:2.0:attrname-format:uri` format)
- **Target claim**: The OIDC claim name that services receive
- **Transformation**: Optional — some attributes require normalisation (e.g., trimming scope from `eduPersonScopedAffiliation` to extract the affiliation value)

The mappers are configured once in Keycloak's realm settings and apply to all services. This centralises the attribute handling — services do not need to know about SAML or federation attributes; they receive standard OIDC claims.

## Protocol Dual-Stack: SAML and OIDC

The platform runs both SAML 2.0 and OpenID Connect simultaneously. This is not redundancy — it is a necessity driven by the heterogeneous service landscape in higher education.

### Why Both Protocols

Modern web applications (Nextcloud, OpenProject, Zammad, CryptPad) support OIDC natively. OIDC offers JSON Web Tokens (JWT), a simpler configuration surface, and better support for mobile and SPA clients. For these services, OIDC is the natural choice.

However, many education-specific applications (ILIAS, Moodle, BigBlueButton) have deep SAML integrations built over years of federation work. Their authentication plugins expect SAML assertions, SP-initiated flows, and attribute statements in a specific format. Rewriting these to use OIDC would be a significant effort and would break compatibility with existing federation setups.

Keycloak solves this by speaking both protocols. It receives SAML from the federation and can issue either SAML or OIDC to downstream services. Services that need SAML get a Shibboleth SP; services that prefer OIDC connect directly to Keycloak.

### Shibboleth Service Provider

Shibboleth acts as the SAML SP for services that require it. The flow is:

1. User accesses a SAML-based service (e.g., Moodle)
2. The service redirects to its Shibboleth SP
3. Shibboleth SP redirects to Keycloak (acting as the IdP)
4. Keycloak authenticates the user (via federation if no session, or via SSO if session exists)
5. Keycloak issues a SAML assertion to Shibboleth SP
6. Shibboleth SP passes the assertion to the service with the attributes it expects

Each SAML-based service has its own Shibboleth SP configuration with service-specific attribute filters. This means ILIAS, Moodle, and BigBlueButton each receive only the attributes they need — not the full attribute set from the federation.

## Nubus: The User-Facing Portal

While Keycloak handles the protocol-level authentication, Nubus provides the user-facing layer of the identity stack. Nubus (v1.18.1, AGPL-3.0) is a self-service portal that sits in front of Keycloak and gives end users a single place to manage their identity.

### What Nubus Does

- **Self-service password reset**: Users can reset their password without contacting an administrator, using a verification flow (email or security questions)
- **Profile management**: Users view and edit their profile (display name, email, language preference)
- **Group management**: Users can see their group memberships and, where permitted, join or leave groups
- **Application launcher**: A dashboard of available services, with direct links that bypass the login flow (SSO handles authentication)
- **Audit logging**: Administrative actions are logged for compliance and troubleshooting

### What Keycloak Does (vs. Nubus)

Keycloak remains the identity provider. It handles:
- Federation (SAML to DFN-AAI/eduGAIN)
- Token issuance (OIDC to services)
- Session management (SSO across services)
- Protocol brokering (SAML ↔ OIDC)
- User attribute storage and mapping

Nubus does not replace Keycloak — it wraps it. Nubus calls Keycloak's Admin REST API to perform user-facing operations, providing a friendlier interface than Keycloak's own admin console (which is designed for administrators, not end users).

## Security Boundaries and Failure Modes

### Trust Boundaries

The platform has three trust boundaries:

1. **Federation → Platform**: The platform trusts the federation's SAML assertions. If a DFN-AAI IdP asserts that a user is `max.mustermann@uni-example.de` with affiliation `student`, the platform accepts this. The trust is anchored in the federation metadata, which is cryptographically signed.

2. **Keycloak → Services**: Services trust Keycloak's OIDC tokens. Each service validates the JWT signature against Keycloak's public keys. A service never sees the federation attributes directly — it only sees the normalised OIDC claims that Keycloak issues.

3. **User → IdP**: The user authenticates to their home IdP using whatever method the institution provides (password, MFA, smart card). The platform has no visibility into this interaction.

### Failure Modes

**IdP unavailable**: If the user's home IdP is down, federated login fails. Keycloak shows an error message. Locally-provisioned users (administrators, service accounts) can still log in directly via Keycloak's local login, so the platform remains manageable.

**Federation metadata stale**: Federation metadata has a validity period. If the platform's copy is stale (e.g., the DFN-AAI metadata has rotated its signing keys and the platform has not refreshed), authentication fails for all federated users. Keycloak refreshes metadata automatically on a configurable schedule (typically every 6–12 hours), but administrators should monitor metadata freshness.

**Insufficient attributes**: If the IdP releases fewer attributes than expected (e.g., `eduPersonAffiliation` is missing), Keycloak's mappers handle the gap gracefully — the user is authenticated but may have reduced functionality (no role-based access, no personalised UI). The platform logs the missing attributes so administrators can work with the IdP to release them.

**Token expiry**: OIDC access tokens have a short lifetime (typically 5–15 minutes). Services use refresh tokens to obtain new access tokens without re-authenticating. If the refresh token also expires, the user is redirected through the full authentication flow again. This is transparent to the user if they have an active Keycloak session (SSO).

## Local User Accounts

Not all users come through the federation. The platform supports locally-provisioned accounts in Keycloak for:

- **Administrators**: Platform operators who need access regardless of federation status
- **Service accounts**: Automated systems that authenticate via client credentials (no interactive login)
- **Test users**: Accounts for testing and evaluation before federation is configured

Local accounts are managed in Keycloak's admin console or via the Nubus portal. They coexist with federated accounts — both types can be active simultaneously, and the same user can have both a federated and a local identity (though this is uncommon and requires careful attribute mapping to avoid duplicate accounts).

## Compliance and Data Protection

The identity architecture is designed with data-protection principles in mind:

- **Minimal attribute release**: The platform requests only the attributes it needs. It does not store sensitive attributes (e.g., national ID numbers, biometric data) from the federation.
- **No password storage for federated users**: The platform never sees or stores the user's institutional password. Authentication happens at the IdP; the platform only receives assertions.
- **GDPR/DSGVO alignment**: User data (name, email, affiliation) is processed for the purpose of authentication and service delivery. Institutions are responsible for their lawful basis for processing, as the data controller.
- **Audit trail**: Keycloak logs authentication events (successful and failed logins, token issuance, session creation). These logs support incident investigation and compliance evidence.

For a broader view of security and compliance across the platform, see the [Security Architecture](/architecture/security) article.

---

## Further Reading

- [System Architecture Overview](/architecture/overview) — the full platform architecture
- [Component Alternatives](/architecture/component-alternatives) — email, video, file storage, and whiteboard choices
- [Federated Identity for Education](/blog/dfn-aai-federation-shared-evaluation) — blog post on DFN-AAI integration and the call for a shared evaluation instance
- [Networking & Traffic Flow Architecture](/architecture/networking-traffic-flow) — how traffic enters the cluster and reaches services
- [Storage & Data Management Architecture](/architecture/storage-data-management) — persistent storage, databases, and backup integration

---

*Authentication is the gateway to every service. Get it right, and users never think about it. Get it wrong, and nothing else matters.*
