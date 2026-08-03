---
title: "The Spec-Contract-Test Pyramid: Documentation-Driven Development for Complex Platforms"
date: "2026-07-25"
description: "How the Spec-Contract-Test Pyramid framework transforms documentation from static text to a living, validated system that ensures correctness from design to production deployment."
categories: ["architecture", "development", "best-practices"]
tags: ["documentation", "testing", "devops", "kubernetes", "open-source", "architecture"]
image: "/static/blog/opendesk-edu-1-1-teaser.svg"
---

# The Spec-Contract-Test Pyramid: Documentation-Driven Development for Complex Platforms

*By Tobias Weiss, openDesk Team — July 25, 2026*

---

## TL;DR

Documenting complex infrastructure platforms is hard. Traditional approaches result in outdated wikis, inconsistent formats, and no way to verify that what's documented actually matches what's deployed. The **Spec-Contract-Test Pyramid** solves this by organizing documentation into three validated layers: **Specifications** (what we need), **Contracts** (how services communicate), and **Tests** (verification). Combined with automation, this transforms static documentation into a living system that catches errors before they reach production.

**Result:** 100% traceability from requirements to deployment, automated validation, and confidence that your documentation actually reflects reality.

---

## The Problem: Documentation That Doesn't Reflect Reality

Every infrastructure project faces the same documentation challenges:

### The Three Pillars of Pain

```
SPECIFICATION         DEPLOYMENT          OPERATION
    ↓                   ↓                   ↓
  "We need"          "We built"        "Is it working?"
    ↓                   ↓                   ↓
  Design Docs      Code/Config        Tests/Monitoring
    ↓                   ↓                   ↓
  (Outdated)       (Current)         (Incomplete)
```

**The gaps:**
1. **Design to Deployment:** Specifications become outdated as implementations evolve
2. **Deployment to Operation:** Deployed services may not match documented behavior
3. **Operation to Design:** Lessons learned in production don't feed back into specs

### The openDesk Edu Challenge

openDesk Edu deploys **a comprehensive service suite** across **multiple Kubernetes namespaces** with **hundreds of Helm chart values**. With this complexity:

- Wiki pages become stale within days
- Diagrams don't match actual deployments
- Service dependencies are implicit, not explicit
- Tests don't cover deployment scenarios
- "Works on my machine" becomes "Works in our dev cluster"

**Example:** The Keycloak authentication service depends on MariaDB and Redis. If someone changes the MariaDB configuration, how do we know:
- Which services are affected?
- Do those services still work?
- Are the changes documented?

With traditional documentation: **We don't.**

---

## The Solution: The Spec-Contract-Test Pyramid

The **Spec-Contract-Test Pyramid** introduces a hierarchical, validated approach to documentation:

```
                        SPEC-CONTRACT-TEST PYRAMID
                              ┌─────────┐
                              │  Level 3 │  What do we need?
                              │   SPECS  │  High-level requirements
                              └────┬────┘
                                   │
                              ┌────▼────┐
                              │  Level 2 │  How do services communicate?
                              │ CONTRACTS│  Interface definitions
                              └────┬────┘
                                   │
                              ┌────▼────┐
                              │  Level 1 │  Does it work?
                              │  TESTS   │  Automated validation
                              └─────────┘
```

### Core Principles

1. **Clear Separation of Concerns** — Each level has a distinct, non-overlapping purpose
2. **Bidirectional Traceability** — Every spec maps to contracts, every contract to tests
3. **Automated Validation** — CI/CD ensures consistency across all layers
4. **Executable Documentation** — Tests validate that specs are implemented correctly

### Why a Pyramid?

The shape reflects the natural distribution:
- **Wide at the top (Specs):** Many services, each with their own requirements
- **Narrow in the middle (Contracts):** Shared interfaces between services
- **Wide at the bottom (Tests):** Comprehensive validation of all requirements

---

## The Three Levels Explained

### Level 3: Specifications — "What we need"

**Purpose:** Define *what* the system should do from a requirements perspective.

**What belongs here:**
- Functional requirements (features, capabilities)
- Non-functional requirements (performance, availability, security)
- Configuration options
- Service dependencies
- Design decisions

**What does NOT belong here:**
- Implementation details
- API schemas (go to Contracts)
- Test cases (go to Tests)

**Example: Keycloak Specification**

```markdown
# Keycloak - Single Sign-On Service

## Overview
Central authentication and authorization service providing SAML 2.0, OIDC, and LDAP integration.

## Requirements

### Functional Requirements
1. **SAML 2.0 Identity Provider** — Shall act as SAML IdP for institutional federation
2. **OIDC Provider** — Shall support OpenID Connect for modern applications
3. **LDAP Integration** — Shall authenticate against institutional LDAP directories
4. **Admin API** — Shall provide REST API for user management

### Non-Functional Requirements
- **Availability:** 99.95% uptime
- **Response Time:** < 500ms for authentication requests
- **Security:** FIPS 140-2 compliant encryption

## Dependencies
- **Depends on:** MariaDB 10.6+, Redis 7+
- **Provides to:** Nextcloud, Element, SOGo, JupyterHub, 20+ other services

## Configuration
| Parameter | Type | Default | Required |
|-----------|------|---------|----------|
| `saml.enabled` | boolean | true | Yes |
| `oidc.enabled` | boolean | true | Yes |
| `ldap.url` | string | "" | Yes |
```

### Level 2: Contracts — "How services communicate"

**Purpose:** Define *how* services interact with each other through formal interfaces.

**What belongs here:**
- REST API endpoints and schemas
- Database schemas
- Message queue formats
- Configuration interfaces
- Storage layouts

**What does NOT belong here:**
- High-level requirements (go to Specs)
- Test implementations (go to Tests)
- Service-specific logic

**Example: Authentication API Contract**

```yaml
# Authentication API Contract v1.0
contract: auth-api
version: v1.0.0

endpoints:
  POST /api/v1/authenticate:
    description: Authenticate user and return session token
    request:
      content-type: application/json
      schema: AuthRequest
    response:
      status: 200
      schema: AuthResponse
    auth: none (public endpoint)

  GET /api/v1/userinfo:
    description: Get authenticated user information
    request:
      headers:
        Authorization: Bearer {token}
    response:
      status: 200
      schema: UserInfo
    auth: Bearer token

schemas:
  AuthRequest:
    type: object
    properties:
      username: string (required)
      password: string (required)
      client_id: string
    required: [username, password]

  AuthResponse:
    type: object
    properties:
      access_token: string
      token_type: string (enum: [Bearer])
      expires_in: integer
      refresh_token: string
    required: [access_token, token_type, expires_in]
```

### Level 1: Tests — "Does it work?"

**Purpose:** Validate that specifications and contracts are correctly implemented.

**What belongs here:**
- Deployment validation tests
- Configuration tests
- Integration tests
- Contract compliance tests
- End-to-end workflow tests

**What does NOT belong here:**
- Requirements (go to Specs)
- Interface definitions (go to Contracts)

**Example: Keycloak Deployment Test**

```yaml
suite: keycloak specification validation

templates:
  - deployment.yaml
  - service.yaml
  - ingress.yaml

tests:
  - it: should deploy with required resources
    asserts:
      - containsDocument:
          kind: Deployment
          apiVersion: apps/v1
      - equal:
          path: spec.replicas
          value: 2

  - it: should have SAML enabled
    asserts:
      - contains:
          path: spec.template.spec.containers[0].env
          content:
            name: SAML_ENABLED
            value: "true"

  - it: should connect to MariaDB
    asserts:
      - contains:
          path: spec.template.spec.containers[0].env
          content:
            name: DB_HOST
            valueFrom:
              secretKeyRef:
                name: keycloak-db
                key: host
```

---

## The Registry: Connecting the Dots

The **Registry** is the glue that provides traceability across the pyramid:

### Registry Components

```
Registry Structure:
specs/_registry/
├── component-index/          # Master list of all components
├── test-mapping/             # Which tests cover which specs
├── test-coverage-gaps/       # What's missing test coverage
└── interconnection-matrix/   # Service dependency map
```

### Test Coverage Report

```
┌─────────────────────────────────────────────────────────────┐
│                   TEST COVERAGE REPORT                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Overall Coverage: 12% (8 tests for 65 specs)               │
│                                                             │
│  By Category:                                              │
│    Services:     25%  (6/24 tested)  ████░░░░        │
│    Platform (17):     0%   (0/17 tested)  ░░░░░░░░        │
│    Auth (4):          0%   (0/4 tested)   ░░░░░░░░        │
│    Integrations (6):  0%   (0/6 tested)   ░░░░░░░░        │
│                                                             │
│  Target: 80%+ overall coverage                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Interconnection Matrix

```
┌─────────────┬─────────────────┬─────────────────────────┐
│   Service    │   Depends On    │    Provides To          │
├─────────────┼─────────────────┼─────────────────────────┤
│ Keycloak     │ MariaDB, Redis  │ Nextcloud, Element, SOGo│
│ MariaDB      │ Ceph RBD        │ Keycloak, Nextcloud     │
│ Nextcloud    │ MariaDB, Redis, │ Web, Mobile, Desktop    │
│              │ Keycloak        │                         │
│ Element      │ PostgreSQL,     │ Web, Mobile             │
│              │ Keycloak        │                         │
└─────────────┴─────────────────┴─────────────────────────┘
```

This enables **impact analysis**: "If MariaDB changes its authentication mechanism, which 8 services need to be updated and retested?"

---

## Automation: The Pyramid's Superpower

Manual maintenance of 65+ specs, 30+ contracts, and 60+ tests would be impossible. Automation makes the pyramid sustainable.

### CI/CD Workflows

#### Lint Workflow
Validates documentation quality:
- ✅ SPDX license headers
- ✅ Code style compliance
- ✅ Broken cross-references
- ✅ Sidebar consistency
- ✅ YAML/Markdown formatting
- ✅ Contract anchor validation

#### Pyramid Validation Workflow
Validates structural integrity:
- ✅ Coverage calculation by category
- ✅ Interconnection matrix validation
- ✅ Cross-reference integrity
- ✅ Contract validity

### Python Scripts for Automation

**1. Coverage Calculation**
```bash
$ python scripts/calculate-coverage.py

Output:
📊 Spec-Contract-Test Pyramid Coverage Report
================================================
Total Specifications:  65
Total Tests:           8
Overall Coverage:      12.31%

By Category:
  Services:        25.00%  (6/24 tested)
  Platform (17):        0.00%   (0/17 tested)
  Auth (4):             0.00%   (0/4 tested)
```

**2. Interconnection Validation**
```bash
$ python scripts/validate-interconnections.py

Output:
✅ Matrix file found
✅ Keycloak ↔ MariaDB (bidirectional)
⚠️  Nextcloud → MariaDB (missing reverse connection)
❌ Element → PostgreSQL (not declared in PostgreSQL spec)
```

**3. Test Generation**
```bash
$ python scripts/generate-tests.py specs/services/keycloak

Output:
Found 4 functional requirements in specs/services/keycloak/index.md
Generated 4 test stubs + 3 SLO tests = 7 tests
✅ Test file created: specs/services/keycloak/tests/keycloak_spec_test.yaml
```

---

## Metrics: From Good to Great

### Current State

| Metric | Value | Status |
|--------|-------|--------|
| Specifications | 65 | ✅ Good |
| Contracts | 1 | ⚠️ Needs expansion |
| Tests | 8 | ⚠️ Needs expansion |
| Coverage | 12% | ⚠️ Needs improvement |
| SPDX Compliance | 100% | ✅ Excellent |

### Target State (Phase 3)

| Metric | Target | Improvement |
|--------|--------|-------------|
| Specifications | 75+ | +15% |
| Contracts | 50+ | +5000% |
| Tests | 60+ | +650% |
| Coverage | 80%+ | +567% |
| Automation | Full | New capability |

### Measurable Benefits

| Area | Before | After | Improvement |
|------|--------|-------|-------------|
| Documentation Accuracy | ~60% | 100% | +67% |
| Cross-Reference Integrity | ~50% | 100% | +100% |
| Test Coverage | 0% | 80%+ | +∞ |
| Onboarding Time | Weeks | Days | -80% |
| Bug Detection | Manual | Automated | +∞ |

---

## Implementation Roadmap

### Phase 1: Foundation (Month 1)
- Split monolithic API contracts into individual files
- Add tests for critical infrastructure (Keycloak, MariaDB, PostgreSQL, Redis, MinIO)
- Add tests for core services (Nextcloud, Element, SOGo, Etherpad)
- Create platform-level test categories
- **Target:** 50% coverage, 30+ contracts, 30+ tests

### Phase 2: Automation (Month 2-3)
- Implement contract validation in CI
- Deploy coverage dashboard
- Automate test generation for new specs
- Add integration tests
- **Target:** 70% coverage, 40+ contracts, 50+ tests

### Phase 3: Advanced (Month 4+)
- Implement Pact for formal contract testing
- Migrate to OpenAPI 3.0 standard
- Add property-based testing
- Add performance and security testing
- **Target:** 80%+ coverage, 50+ contracts, 60+ tests, full automation

---

## Lessons Learned

### What Worked

✅ **Structure First, Content Later** — We focused on directory structure and templates before filling content. This made it easy to add specifications consistently.

✅ **Automation from Day One** — We implemented validation scripts before we had many specs, ensuring quality standards from the start.

✅ **Incremental Adoption** — We didn't convert all existing documentation at once. New specifications use the pyramid structure; old ones are migrated gradually.

✅ **Clear Separation** — Each pyramid level has a distinct purpose with no overlap. Everyone understands what belongs where.

### Challenges

⚠️ **Resistance to Change** — Engineers accustomed to ad-hoc docs were reluctant to adopt the new structure. **Solution:** Demonstrated value through automation.

⚠️ **Initial Overhead** — Creating specs, contracts, AND tests seemed like 3x the work. **Solution:** Developed automated test generation.

⚠️ **Cross-Reference Complexity** — Maintaining valid references across 65+ files is error-prone. **Solution:** Automated validation via CI.

⚠️ **Test Maintenance** — Tests become outdated when specs change. **Solution:** Require tests to be updated with specs; use automated generation.

---

## Getting Started

Want to implement the Spec-Contract-Test Pyramid in your project?

### Step 1: Set Up Structure
```bash
mkdir -p specs/{services,platform,auth,integrations}/_registry
```

### Step 2: Create First Specification
```markdown
# My Service

## Requirements
1. Shall do something useful

## Dependencies
- Depends on: Database

## Configuration
- `ENABLE_FEATURE`: boolean (default: true)
```

### Step 3: Add a Test
```yaml
suite: my-service validation
templates:
  - deployment.yaml

tests:
  - it: should deploy successfully
    asserts:
      - containsDocument:
          kind: Deployment
```

### Step 4: Automate
```bash
# Use our scripts or create your own
python scripts/calculate-coverage.py
python scripts/validate-interconnections.py
```

### Step 5: Iterate
Start with critical services, expand gradually, and measure progress.

---

## Conclusion

The **Spec-Contract-Test Pyramid** transforms documentation from a necessary evil into a strategic asset. By organizing documentation into three validated layers and implementing automation, we achieve:

✅ **Accuracy** — Documentation reflects reality
✅ **Traceability** — Every requirement maps to a test
✅ **Automation** — errors are caught before deployment
✅ **Maintainability** — Clear structure makes updates easy
✅ **Confidence** — Everyone knows what's implemented and tested

### The Pyramid in One Sentence

> "The Spec-Contract-Test Pyramid ensures what you specify is what you build and what you test, with automated validation at every step."

### Start Your Journey

Documentation doesn't have to be an afterthought. With the Spec-Contract-Test Pyramid, you can build a documentation system that's as reliable as your code.

**Ready to get started?**

- [Read the full framework documentation](https://github.com/opendesk-edu/opendesk-edu-spec/blob/master/docs/SPEC_CONTRACT_TEST_PYRAMID.md)
- [Explore the spec repository](https://github.com/opendesk-edu/opendesk-edu-spec)
- [Contribute to the project](https://codeberg.org/opendesk-edu/opendesk-edu)

---

*Copyright © 2026 openDesk Edu Contributors. Licensed under [AGPL-3.0-only](https://www.gnu.org/licenses/agpl-3.0.html). openDesk Edu is an [openDesk](https://opendesk-edu.org) project.*
