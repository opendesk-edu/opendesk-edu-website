---
title: "Three Bugs That Blocked OpenCloud OIDC Login — A Debugging War Story"
date: "2026-06-01"
description: "How three independent bugs — a missing LDAP equality rule, an invisible disabled filter, and a misconfigured role driver — stacked to block OpenCloud OIDC auto-provisioning, and how we fixed each one."
image: "/static/blog/collab-services-teaser.png"
categories: ["engineering"]
tags: ["opencloud", "oidc", "keycloak", "ldap", "debugging", "kubernetes", "helm", "sso"]
---

# Three Bugs That Blocked OpenCloud OIDC Login — A Debugging War Story

After a user auto-provisioned via Keycloak OIDC is successfully created in LDAP, OpenCloud's proxy can't issue a session token. The user sees "Sie werden eingeloggt" followed by "Nicht angemeldet". Every. Single. Time.

This is the story of how three independent bugs stacked to create that failure — and what it took to find them. If you're deploying OpenCloud with an external LDAP and Keycloak OIDC, these are the edge cases you need to know about.

---

## The Setup

- **OpenCloud** 4.0.3, deployed via Helm on Kubernetes
- **External UMS LDAP** (OpenLDAP) as the identity backend
- **Keycloak** with Shibboleth SAML → OIDC for authentication
- **Auto-provisioning** enabled: first login creates the LDAP entry on the fly

The error was 100% reproducible:

1. User navigates to OpenCloud → clicks login
2. Redirected to Keycloak → authenticates via Shibboleth
3. Redirected back → "Sie werden eingeloggt"
4. **"Nicht angemeldet"** — access denied

OpenCloud's logs showed a pattern:

```
graph:   failed to add user → LDAP Result Code 68 "Entry Already Exists"
graph:   could not create user: backend error → nameAlreadyExists
proxy:   Error Response → OData Error: a user with that name already exists
proxy:   Error getting token for autoprovisioned user → user not found
```

The auto-provision flow was straightforward: get UUID from OIDC `sub` claim → search LDAP for existing user by UUID → create if not found. But each login hit a wall. The user *did* exist in LDAP. Three independent bugs were responsible.

---

## Bug #1: LDAP Schema Missing `EQUALITY` on `openCloudUUID`

### The Symptom

Auto-provision searches LDAP for an existing user by UUID before creating one. The user existed — but the search returned zero results.

### The Investigation

Testing the LDAP search directly:

```
$ ldapsearch ... "(openCloudUUID=*)"
→ returns the entry (presence check works)

$ ldapsearch ... "(openCloudUUID=b7ada882-...)"
→ returns 0 entries (equality check FAILS)
```

The attribute existed. The value was correct. Equality matching didn't work.

### The Root Cause

The `openCloudUUID` attribute type in the OpenLDAP schema was loaded **without** an `EQUALITY` rule:

```
# Loaded schema (broken):
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )

# Configmap definition (correct):
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  EQUALITY caseIgnoreMatch          ← MISSING from loaded schema!
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )
```

Without `EQUALITY caseIgnoreMatch`, OpenLDAP can't perform equality matching on the attribute. The schema job only checked for the presence of new attribute OIDs — it never verified existing attributes had correct matching rules. So an old schema loaded from an earlier chart version persisted through upgrades, and subsequent upgrades never fixed it.

### The Fix

**Live fix** — add the `EQUALITY` rule to the running OpenLDAP via `ldapmodify`:

```bash
ldapmodify -Y EXTERNAL -H ldapi:/// <<'EOF'
dn: cn={53}opencloud,cn=schema,cn=config
changetype: modify
replace: olcAttributeTypes
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1 NAME 'openCloudUUID'
  DESC 'OpenCloud user UUID'
  EQUALITY caseIgnoreMatch
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 SINGLE-VALUE )
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.2 ... )
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.3 ... )
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.4 ... )
EOF
```

**Persistent fix** — updated the Helm chart's schema job to also verify `EQUALITY` rules on `openCloudUUID`, not just the presence of attribute OIDs.

---

## Bug #2: The Invisible Disabled Filter

### The Symptom

After fixing the UUID search, the LDAP lookup **still returned zero results** — but now the reason was buried in the search filter.

### The Investigation

The reva LDAP user provider builds a search filter for `GetUserByClaim("userid", uuid)`. Tracing through the OpenCloud source code revealed:

```go
filter = fmt.Sprintf("(&%s(objectclass=%s)(%s=%s)%s%s)",
    i.User.Filter,
    i.User.Objectclass,
    attribute,
    value,
    i.tenantFilter(tenantID),
    i.disabledFilter(),  // → "(!(openCloudUserEnabled=FALSE))"
)
```

The resulting filter:

```
(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...)(!(openCloudUserEnabled=FALSE)))
```

Testing it directly:

```
$ ldapsearch ... "(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...))"
→ 1 entry found

$ ldapsearch ... "(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...)(!(openCloudUserEnabled=FALSE)))"
→ 0 entries found
```

### The Root Cause

LDAP uses three-valued logic: TRUE, FALSE, and **UNDEFINED**. When an attribute doesn't exist on an entry:

- `(attr=FALSE)` → UNDEFINED (attribute isn't present, comparison can't be evaluated)
- `(!(attr=FALSE))` → NOT(UNDEFINED) → **UNDEFINED**
- `(TRUE AND TRUE AND UNDEFINED)` → **UNDEFINED** → entry is **not returned**

The user entry in an external UMS LDAP doesn't have an `openCloudUserEnabled` attribute. This is an OpenCloud-internal attribute that exists in OpenCloud's IDM LDAP but not in external directories. The `disabledFilter()` was designed for the internal IDM LDAP, but when pointed at an external LDAP, it silently filtered out **every single user**.

The `DisableUserMechanism` was set to `"attribute"` by default, which adds the `(!(openCloudUserEnabled=FALSE))` filter. In OpenCloud's internal IDM, every user has this attribute set to `TRUE`. In an external LDAP, nobody does.

### The Fix

```yaml
# values.yaml
oidc:
  roleAssignmentDriver: "default"

# → sets env var OC_LDAP_DISABLE_USER_MECHANISM=none
```

Setting `OC_LDAP_DISABLE_USER_MECHANISM=none` tells the users service to skip the disabled filter entirely. This is the correct setting when using an external LDAP that doesn't manage OpenCloud-specific attributes.

---

## Bug #3: OIDC Role Assignment Driver Requires Roles That Don't Exist

### The Symptom

After fixing the LDAP search, the login flow progressed further — but failed with a new error:

```
proxy: no roles in user claims
proxy: Error mapping role names to role ids → oidcroles.go:84
proxy: Could not get user roles → account_resolver.go:192
```

### The Investigation

The proxy was configured with `PROXY_ROLE_ASSIGNMENT_DRIVER=oidc`, which reads role information from OIDC claims and maps them to OpenCloud roles. Our Keycloak instance doesn't send roles in the OIDC token — it's a simple authentication-only setup.

The OIDC role mapper iterates over the claims, looks for roles, finds none, and returns an error. This error propagates up through the account resolver, which aborts the login.

I initially tried `GRAPH_ASSIGN_DEFAULT_USER_ROLE=true`, which controls whether the **Graph API** assigns a default role when creating users. But the error was coming from the **Proxy** after user creation, during token issuance. Two different code paths, two different env vars.

### The Root Cause

The `PROXY_ROLE_ASSIGNMENT_DRIVER` supports two values:

| Driver | Behaviour |
|---|---|
| `oidc` | Reads roles from OIDC claims. **Fails** if claims have no roles. |
| `default` | Assigns the role "user" to any user without a role at login time. |

The `oidc` driver is designed for setups where Keycloak sends roles via an OIDC claim (e.g., `roles`, `groups`, or a custom mapper). When used with a Keycloak that doesn't send roles, it's a hard blocker.

### The Fix

```yaml
# values.yaml
oidc:
  roleAssignmentDriver: "default"

# → sets env var PROXY_ROLE_ASSIGNMENT_DRIVER=default
```

The `default` driver checks if the user already has a role assigned. If not, it assigns the built-in "user" role. This is the correct choice for most simple OIDC setups.

---

## How the Three Bugs Stacked

```
User authenticates via OIDC
  ↓
Proxy calls GetUserByClaims("userid", uuid)
  ↓
Gateway delegates to users service (LDAP backend)
  ↓
Bug #1: LDAP schema → UUID equality search returns 0 entries
Bug #2: disabledFilter → existing user silently excluded from results
  ↓
GetUserByClaims → ErrAccountNotFound
  ↓
Proxy calls CreateUserFromClaims → Graph API → LDAP add → "Entry Already Exists"
  ↓
Cloud returns nameAlreadyExists → CreateUserFromClaims re-reads user → returns user
  ↓
Proxy calls GetUserByClaims again → STILL ErrAccountNotFound (bugs 1 & 2 again)
  ↓
Proxy falls through → tries role assignment
Bug #3: OIDC driver → no roles in claims → error
  ↓
"No roles in user claims" → 401 → "Nicht angemeldet"
```

Each bug alone would have been survivable in a different configuration:

- **Bug #1** only matters if someone loads a broken schema without `EQUALITY`
- **Bug #2** only matters with external LDAP that lacks OpenCloud-specific attributes
- **Bug #3** only matters with OIDC providers that don't send roles in claims

But **together**, they created a perfectly impenetrable wall.

---

## Lessons for openDesk Contributors

### 1. Verify LDAP schema equality rules

Presence checks (`attr=*`) can work fine while equality checks (`attr=value`) silently fail. Always test both when setting up attribute schemas. If you're writing a Helm chart that deploys an LDAP schema, verify that upgrades actually apply matching rule changes.

### 2. LDAP's three-valued logic is a trap

`(!(attr=FALSE))` is NOT a no-op for absent attributes — it's **UNDEFINED**, which excludes entries from search results. If you're adding a disabled filter, make sure every user in the directory actually has the attribute. For external LDAP integrations, always set `OC_LDAP_DISABLE_USER_MECHANISM=none`.

### 3. Know which service owns which env var

`GRAPH_ASSIGN_DEFAULT_USER_ROLE` (Graph API, during user creation) and `PROXY_ROLE_ASSIGNMENT_DRIVER` (Proxy, during login/token issuance) control different stages of the same flow. Fixing the wrong one changes nothing. When debugging OpenCloud OIDC, trace the exact error source in the logs — `oidcroles.go` means the Proxy, not the Graph API.

### 4. Always re-test after each fix

Debugging three stacked bugs is only feasible if you verify each fix independently before moving to the next. The error messages changed at each step — that's how we knew we were making progress. Isolate one variable at a time.

---

## How to Deploy OpenCloud with External LDAP and Keycloak

If you're setting up this stack for the first time, here are the correct `values.yaml` settings that avoid all three bugs:

```yaml
oidc:
  roleAssignmentDriver: "default"

# Environment variables to set via config
extraEnv:
  - name: OC_LDAP_DISABLE_USER_MECHANISM
    value: "none"
  - name: PROXY_ROLE_ASSIGNMENT_DRIVER
    value: "default"
```

And ensure your OpenLDAP schema for `openCloudUUID` includes `EQUALITY caseIgnoreMatch`:

```
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  DESC 'OpenCloud user UUID'
  EQUALITY caseIgnoreMatch
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )
```

All three fixes are deployed in OpenCloud revision 50, with chart templates updated to prevent recurrence on future deployments. If you hit similar issues, check these three configuration points first.

---

*This article is part of a series on openDesk Edu infrastructure engineering. The openDesk Edu stack is open-source (Apache 2.0) and available on [Codeberg](https://codeberg.org/opendesk-edu/opendesk-edu). Contributions, bug reports, and questions are welcome via the [Matrix channel](https://matrix.to/#/#opendesk-ce-public:matrix.uni-marburg.de).*
