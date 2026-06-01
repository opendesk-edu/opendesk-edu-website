---
title: "阻止 OpenCloud OIDC 登录的三个 Bug — 调试实战故事"
date: "2026-06-01"
description: "三个独立的 bug — 缺少的 LDAP equality 规则、不可见的禁用过滤器和配置错误的角色驱动程序 — 如何叠加起来阻止了 OpenCloud OIDC 自动配置，以及我们如何逐一修复它们。"
image: "/static/blog/opencloud-oidc-war-story-teaser.png"
categories: ["engineering"]
tags: ["opencloud", "oidc", "keycloak", "ldap", "debugging", "kubernetes", "helm", "sso"]
---

# 阻止 OpenCloud OIDC 登录的三个 Bug — 调试实战故事

当用户通过 Keycloak OIDC 自动配置成功在 LDAP 中创建后，OpenCloud 的代理无法发出会话令牌。用户看到"Sie werden eingeloggt"后跟"Nicht angemeldet"。每一次都是如此。

这是一个关于三个独立的 bug 如何叠加起来造成这个故障的故事 — 以及找到它们需要什么。如果您正在使用外部 LDAP 和 Keycloak OIDC 部署 OpenCloud，这些是您需要了解的边缘情况。

---

## 环境配置

- **OpenCloud** 4.0.3，通过 Helm 部署在 Kubernetes 上
- **外部 UMS LDAP** (OpenLDAP) 作为身份后端
- **Keycloak** 使用 Shibboleth SAML → OIDC 进行身份验证
- **自动配置** 已启用：首次登录即时创建 LDAP 条目

该错误 100% 可重现：

1. 用户导航到 OpenCloud → 点击登录
2. 重定向到 Keycloak → 通过 Shibboleth 验证
3. 重定向回 OpenCloud → "Sie werden eingeloggt"
4. **"Nicht angemeldet"** — 访问被拒绝

OpenCloud 的日志显示了一个模式：

```
graph:   failed to add user → LDAP Result Code 68 "Entry Already Exists"
graph:   could not create user: backend error → nameAlreadyExists
proxy:   Error Response → OData Error: a user with that name already exists
proxy:   Error getting token for autoprovisioned user → user not found
```

自动配置流程很直接：从 OIDC `sub` 声明中获取 UUID → 按 UUID 在 LDAP 中搜索现有用户 → 如果未找到则创建。但每次登录都碰到一堵墙。用户*确实*存在于 LDAP 中。三个独立的 bug 是罪魁祸首。

---

## Bug #1：LDAP 模式缺少 `openCloudUUID` 的 `EQUALITY` 规则

### 症状

自动配置在创建用户之前会按 UUID 在 LDAP 中搜索现有用户。用户存在 — 但搜索返回了零结果。

### 调查

直接测试 LDAP 搜索：

```
$ ldapsearch ... "(openCloudUUID=*)"
→ 返回条目（存在检查正常工作）

$ ldapsearch ... "(openCloudUUID=b7ada882-...)"
→ 返回 0 条结果（相等检查失败）
```

属性存在。值是正确的。相等匹配不工作。

### 根本原因

OpenLDAP 模式中的 `openCloudUUID` 属性类型是在**没有** `EQUALITY` 规则的情况下加载的：

```
# 加载的模式（有问题的）：
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )

# Configmap 定义（正确的）：
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  EQUALITY caseIgnoreMatch          ← 加载的模式中缺失！
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )
```

没有 `EQUALITY caseIgnoreMatch`，OpenLDAP 无法对属性执行相等匹配。模式作业只检查新属性 OID 的存在 — 它从未验证现有属性是否有正确的匹配规则。因此，从早期图表版本加载的旧模式在升级过程中持续存在，后续升级也从未修复它。

### 修复

**即时修复** — 通过 `ldapmodify` 向正在运行的 OpenLDAP 添加 `EQUALITY` 规则：

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

**持久修复** — 更新了 Helm chart 的模式作业，以同时验证 `openCloudUUID` 上的 `EQUALITY` 规则，而不仅仅是属性 OID 的存在。

---

## Bug #2：不可见的禁用过滤器

### 症状

修复 UUID 搜索后，LDAP 搜索**仍然返回零结果** — 但现在原因隐藏在搜索过滤器中。

### 调查

Reva LDAP 用户提供程序为 `GetUserByClaim("userid", uuid)` 构建搜索过滤器。跟踪 OpenCloud 源代码发现：

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

生成的过滤器：

```
(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...)(!(openCloudUserEnabled=FALSE)))
```

直接测试：

```
$ ldapsearch ... "(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...))"
→ 找到 1 个条目

$ ldapsearch ... "(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...)(!(openCloudUserEnabled=FALSE)))"
→ 找到 0 个条目
```

### 根本原因

LDAP 使用三值逻辑：TRUE、FALSE 和 **UNDEFINED**。当属性在条目上不存在时：

- `(attr=FALSE)` → UNDEFINED（属性不存在，无法评估比较）
- `(!(attr=FALSE))` → NOT(UNDEFINED) → **UNDEFINED**
- `(TRUE AND TRUE AND UNDEFINED)` → **UNDEFINED** → 条目**不被返回**

外部 UMS LDAP 中的用户条目没有 `openCloudUserEnabled` 属性。这是 OpenCloud 内部属性，存在于 OpenCloud 的 IDM LDAP 中，但不存在于外部目录中。`disabledFilter()` 是为内部 IDM LDAP 设计的，但当指向外部 LDAP 时，它静默地过滤掉了**每一个用户**。

`DisableUserMechanism` 默认设置为 `"attribute"`，这会添加 `(!(openCloudUserEnabled=FALSE))` 过滤器。在 OpenCloud 的内部 IDM 中，每个用户都有此属性设置为 `TRUE`。在外部 LDAP 中，没有人有。

### 修复

```yaml
# values.yaml
oidc:
  roleAssignmentDriver: "default"

# → 设置环境变量 OC_LDAP_DISABLE_USER_MECHANISM=none
```

`OC_LDAP_DISABLE_USER_MECHANISM=none` 告诉用户服务完全跳过禁用过滤器。当使用不管理 OpenCloud 特定属性的外部 LDAP 时，这是正确的设置。

---

## Bug #3：OIDC 角色分配驱动程序需要不存在的角色

### 症状

修复 LDAP 搜索后，登录流程更进一步 — 但出现了新的错误：

```
proxy: no roles in user claims
proxy: Error mapping role names to role ids → oidcroles.go:84
proxy: Could not get user roles → account_resolver.go:192
```

### 调查

代理配置了 `PROXY_ROLE_ASSIGNMENT_DRIVER=oidc`，它从 OIDC 声明中读取角色信息并映射到 OpenCloud 角色。我们的 Keycloak 实例不在 OIDC 令牌中发送角色 — 这是一个简单的仅认证设置。

OIDC 角色映射器遍历声明，寻找角色，找不到，并返回错误。该错误通过帐户解析器传播，并中止登录。

我最初尝试了 `GRAPH_ASSIGN_DEFAULT_USER_ROLE=true`，它控制**Graph API** 在创建用户时是否分配默认角色。但错误来自**代理**在用户创建之后、令牌发行期间。两个不同的代码路径，两个不同的环境变量。

### 根本原因

`PROXY_ROLE_ASSIGNMENT_DRIVER` 支持两个值：

| Driver | 行为 |
|---|---|
| `oidc` | 从 OIDC 声明中读取角色。如果声明中没有角色则**失败**。 |
| `default` | 在登录时为任何没有角色的用户分配"user"角色。 |

`oidc` 驱动程序适用于 Keycloak 通过 OIDC 声明（例如 `roles`、`groups` 或自定义映射器）发送角色的设置。当与不发送角色的 Keycloak 一起使用时，这是一个硬性障碍。

### 修复

```yaml
# values.yaml
oidc:
  roleAssignmentDriver: "default"

# → 设置环境变量 PROXY_ROLE_ASSIGNMENT_DRIVER=default
```

`default` 驱动程序检查用户是否已有分配的角色。如果没有，则分配内置的"user"角色。这是大多数简单 OIDC 设置的正确选择。

---

## 三个 Bug 如何叠加

```
用户通过 OIDC 验证
  ↓
代理调用 GetUserByClaims("userid", uuid)
  ↓
网关委托给用户服务（LDAP 后端）
  ↓
Bug #1：LDAP 模式 → UUID 相等搜索返回 0 条结果
Bug #2：disabledFilter → 现有用户被静默排除
  ↓
GetUserByClaims → ErrAccountNotFound
  ↓
代理调用 CreateUserFromClaims → Graph API → LDAP add → "Entry Already Exists"
  ↓
Cloud 返回 nameAlreadyExists → CreateUserFromClaims 重新读取用户 → 返回用户
  ↓
代理再次调用 GetUserByClaims → 仍然是 ErrAccountNotFound（bug #1 和 #2 再次出现）
  ↓
代理继续执行 → 尝试角色分配
Bug #3：OIDC 驱动程序 → 声明中没有角色 → 错误
  ↓
"No roles in user claims" → 401 → "Nicht angemeldet"
```

每个 bug 单独在不同的配置中都是可以存活的：

- **Bug #1** 只有在有人加载没有 `EQUALITY` 的问题模式时才重要
- **Bug #2** 只在使用没有 OpenCloud 特定属性的外部 LDAP 时才重要
- **Bug #3** 只在使用不在声明中发送角色的 OIDC 提供程序时才重要

但是**在一起**，它们创建了一堵完美的坚不可摧的墙。

---

## 给 openDesk 贡献者的经验教训

### 1. 验证 LDAP 模式相等规则

存在检查 (`attr=*`) 可以正常工作，而相等检查 (`attr=value`) 静默失败。在设置属性模式时，始终测试两者。如果您正在编写部署 LDAP 模式的 Helm chart，请确保升级实际上应用了匹配规则的更改。

### 2. LDAP 的三值逻辑是一个陷阱

`(!(attr=FALSE))` 对于缺失的属性不是无操作 — 它是 **UNDEFINED**，这会将条目从搜索结果中排除。如果您添加禁用过滤器，请确保目录中的每个用户都实际拥有该属性。对于外部 LDAP 集成，始终设置 `OC_LDAP_DISABLE_USER_MECHANISM=none`。

### 3. 知道哪个服务拥有哪个环境变量

`GRAPH_ASSIGN_DEFAULT_USER_ROLE`（Graph API，在用户创建期间）和 `PROXY_ROLE_ASSIGNMENT_DRIVER`（代理，在登录/令牌发行期间）控制同一流程的不同阶段。修复错误的一个变量不会改变任何事情。在调试 OpenCloud OIDC 时，在日志中追踪确切的错误来源 — `oidcroles.go` 意味着代理，而不是 Graph API。

### 4. 每次修复后重新测试

调试三个叠加的 bug 只有在您独立验证每个修复后才能进行。错误信息在每一步都在变化 — 这就是我们知道正在取得进展的方式。一次隔离一个变量。

---

## 使用外部 LDAP 和 Keycloak 部署 OpenCloud

如果您是第一次设置此堆栈，以下是避免所有三个 bug 的正确 `values.yaml` 设置：

```yaml
oidc:
  roleAssignmentDriver: "default"

# 通过 config 设置的环境变量
extraEnv:
  - name: OC_LDAP_DISABLE_USER_MECHANISM
    value: "none"
  - name: PROXY_ROLE_ASSIGNMENT_DRIVER
    value: "default"
```

并确保您的 `openCloudUUID` 的 OpenLDAP 模式包含 `EQUALITY caseIgnoreMatch`：

```
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  DESC 'OpenCloud user UUID'
  EQUALITY caseIgnoreMatch
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )
```

所有三个修复已部署在 OpenCloud 修订版 50 中，图表模板已更新，以防止在未来的部署中再次发生。如果您遇到类似问题，请首先检查这三个配置点。

---

*本文是 openDesk Edu 基础设施工程系列的一部分。openDesk Edu 堆栈是开源的（Apache 2.0），可在 [Codeberg](https://codeberg.org/opendesk-edu/opendesk-edu) 上获取。欢迎通过 [Matrix 频道](https://matrix.to/#/#opendesk-ce-public:matrix.uni-marburg.de) 贡献代码、报告错误和提出问题。*
