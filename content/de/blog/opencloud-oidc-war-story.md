---
title: "Drei Bugs, die den OpenCloud OIDC-Login blockierten — Eine Debugging-War-Story"
date: "2026-06-01"
description: "Wie drei unabhängige Bugs — eine fehlende LDAP-Equality-Regel, ein unsichtbarer deaktivierter Filter und ein falsch konfigurierter Role-Driver — sich stapelten, um die OpenCloud OIDC-Auto-Provisionierung zu blockieren, und wie wir jeden einzelnen behoben haben."
image: "/static/blog/opencloud-oidc-war-story-teaser.png"
categories: ["engineering"]
tags: ["opencloud", "oidc", "keycloak", "ldap", "debugging", "kubernetes", "helm", "sso"]
---

# Drei Bugs, die den OpenCloud OIDC-Login blockierten — Eine Debugging-War-Story

Nachdem ein über Keycloak OIDC auto-provisionierter Benutzer erfolgreich in LDAP angelegt wurde, kann der OpenCloud-Proxy keine Session-Token ausstellen. Der Benutzer sieht „Sie werden eingeloggt", gefolgt von „Nicht angemeldet". Jedes. Einzelne. Mal.

Dies ist die Geschichte, wie drei unabhängige Bugs sich stapelten, um diesen Fehler zu verursachen — und was es brauchte, um sie zu finden. Wenn Sie OpenCloud mit einem externen LDAP und Keycloak OIDC betreiben, sind dies die Edge Cases, die Sie kennen müssen.

---

## Das Setup

- **OpenCloud** 4.0.3, deployed via Helm auf Kubernetes
- **Externes UMS-LDAP** (OpenLDAP) als Identity-Backend
- **Keycloak** mit Shibboleth SAML → OIDC für Authentifizierung
- **Auto-Provisionierung** aktiviert: Erster Login erstellt den LDAP-Eintrag on the fly

Der Fehler war 100% reproduzierbar:

1. Benutzer navigiert zu OpenCloud → klickt auf Login
2. Weiterleitung zu Keycloak → authentifiziert via Shibboleth
3. Zurückgeleitet → „Sie werden eingeloggt"
4. **„Nicht angemeldet"** — Zugriff verweigert

Die OpenCloud-Logs zeigten ein Muster:

```
graph:   failed to add user → LDAP Result Code 68 "Entry Already Exists"
graph:   could not create user: backend error → nameAlreadyExists
proxy:   Error Response → OData Error: a user with that name already exists
proxy:   Error getting token for autoprovisioned user → user not found
```

Der Auto-Provisionierungs-Flow war straightforward: UUID aus OIDC `sub`-Claim holen → LDAP nach existierendem Benutzer per UUID durchsuchen → erstellen, wenn nicht gefunden. Aber jeder Login traf auf eine Wand. Der Benutzer *existierte* in LDAP. Drei unabhängige Bugs waren verantwortlich.

---

## Bug #1: LDAP-Schema fehlt `EQUALITY` auf `openCloudUUID`

### Das Symptom

Die Auto-Provisionierung durchsucht LDAP nach einem existierenden Benutzer per UUID, bevor sie einen erstellt. Der Benutzer existierte — aber die Suche gab null Ergebnisse zurück.

### Die Untersuchung

Direkter Test der LDAP-Suche:

```
$ ldapsearch ... "(openCloudUUID=*)"
→ gibt den Eintrag zurück (Presence-Check funktioniert)

$ ldapsearch ... "(openCloudUUID=b7ada882-...)"
→ gibt 0 Einträge zurück (Equality-Check SCHLÄGT FEHL)
```

Das Attribut existierte. Der Wert war korrekt. Der Equality-Match funktionierte nicht.

### Die Ursache

Der `openCloudUUID`-Attributtyp im OpenLDAP-Schema wurde **ohne** `EQUALITY`-Regel geladen:

```
# Geladenes Schema (kaputt):
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )

# Configmap-Definition (korrekt):
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  EQUALITY caseIgnoreMatch          ← FEHLT im geladenen Schema!
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )
```

Ohne `EQUALITY caseIgnoreMatch` kann OpenLDAP keine Equality-Matches auf dem Attribut durchführen. Der Schema-Job prüfte nur auf das Vorhandensein neuer Attribut-OIDs — er verifizierte nie, ob vorhandene Attribute korrekte Matching-Regeln hatten. So persistierte ein altes Schema aus einer früheren Chart-Version durch Upgrades, und nachfolgende Upgrades behoben es nie.

### Der Fix

**Live-Fix** — `EQUALITY`-Regel zum laufenden OpenLDAP via `ldapmodify` hinzufügen:

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

**Persistenter Fix** — Das Helm-Chart-Schema-Job aktualisiert, um auch `EQUALITY`-Regeln auf `openCloudUUID` zu prüfen, nicht nur das Vorhandensein von Attribut-OIDs.

---

## Bug #2: Der unsichtbare deaktivierte Filter

### Das Symptom

Nach der Behebung der UUID-Suche gab die LDAP-Suche **immer noch null Ergebnisse** zurück — aber der Grund lag jetzt im Suchfilter verborgen.

### Die Untersuchung

Der Reva-LDAP-User-Provider baut einen Suchfilter für `GetUserByClaim("userid", uuid)` auf. Ein Blick in den OpenCloud-Quellcode zeigte:

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

Der resultierende Filter:

```
(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...)(!(openCloudUserEnabled=FALSE)))
```

Direkter Test:

```
$ ldapsearch ... "(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...))"
→ 1 Eintrag gefunden

$ ldapsearch ... "(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...)(!(openCloudUserEnabled=FALSE)))"
→ 0 Einträge gefunden
```

### Die Ursache

LDAP verwendet eine dreiwertige Logik: TRUE, FALSE und **UNDEFINED**. Wenn ein Attribut auf einem Eintrag nicht existiert:

- `(attr=FALSE)` → UNDEFINED (Attribut ist nicht vorhanden, Vergleich kann nicht ausgewertet werden)
- `(!(attr=FALSE))` → NOT(UNDEFINED) → **UNDEFINED**
- `(TRUE AND TRUE AND UNDEFINED)` → **UNDEFINED** → Eintrag wird **nicht zurückgegeben**

Der Benutzereintrag in einem externen UMS-LDAP hat kein `openCloudUserEnabled`-Attribut. Dies ist ein OpenCloud-internes Attribut, das im OpenCloud-IDM-LDAP existiert, aber nicht in externen Verzeichnissen. Der `disabledFilter()` wurde für das interne IDM-LDAP entwickelt, aber wenn er auf ein externes LDAP zeigt, filterte er **jeden einzelnen Benutzer** stillschweigend aus.

Der `DisableUserMechanism` war standardmäßig auf `"attribute"` gesetzt, was den `(!(openCloudUserEnabled=FALSE))`-Filter hinzufügt. Im OpenCloud-internen IDM hat jeder Benutzer dieses Attribut auf `TRUE` gesetzt. In einem externen LDAP hat es niemand.

### Der Fix

```yaml
# values.yaml
oidc:
  roleAssignmentDriver: "default"

# → setzt env var OC_LDAP_DISABLE_USER_MECHANISM=none
```

`OC_LDAP_DISABLE_USER_MECHANISM=none` teilt dem Users-Service mit, den deaktivierten Filter vollständig zu überspringen. Dies ist die korrekte Einstellung bei Verwendung eines externen LDAP, das keine OpenCloud-spezifischen Attribute verwaltet.

---

## Bug #3: OIDC-Role-Assignment-Driver benötigt Rollen, die nicht existieren

### Das Symptom

Nach der Behebung der LDAP-Suche kam der Login-Flow weiter — scheiterte aber mit einem neuen Fehler:

```
proxy: no roles in user claims
proxy: Error mapping role names to role ids → oidcroles.go:84
proxy: Could not get user roles → account_resolver.go:192
```

### Die Untersuchung

Der Proxy war mit `PROXY_ROLE_ASSIGNMENT_DRIVER=oidc` konfiguriert, was Rolleninformationen aus OIDC-Claims liest und auf OpenCloud-Rollen abbildet. Unsere Keycloak-Instanz sendet keine Rollen im OIDC-Token — es ist ein reines Authentifizierungs-Setup.

Der OIDC-Role-Mapper iteriert über die Claims, sucht nach Rollen, findet keine und gibt einen Fehler zurück. Dieser Fehler propagiert durch den Account-Resolver, der den Login abbricht.

Ich habe zunächst `GRAPH_ASSIGN_DEFAULT_USER_ROLE=true` versucht, was steuert, ob die **Graph-API** eine Standardrolle beim Erstellen von Benutzern zuweist. Aber der Fehler kam vom **Proxy** nach der Benutzererstellung, während der Token-Ausstellung. Zwei verschiedene Codepfade, zwei verschiedene Env-Vars.

### Die Ursache

`PROXY_ROLE_ASSIGNMENT_DRIVER` unterstützt zwei Werte:

| Driver | Verhalten |
|---|---|
| `oidc` | Liest Rollen aus OIDC-Claims. **Schlägt fehl**, wenn Claims keine Rollen enthalten. |
| `default` | Weist jedem Benutzer ohne Rolle beim Login die Rolle "user" zu. |

Der `oidc`-Driver ist für Setups gedacht, bei denen Keycloak Rollen via OIDC-Claim sendet (z.B. `roles`, `groups` oder ein benutzerdefinierter Mapper). Bei Verwendung mit einem Keycloak, das keine Rollen sendet, ist es ein harter Blocker.

### Der Fix

```yaml
# values.yaml
oidc:
  roleAssignmentDriver: "default"

# → setzt env var PROXY_ROLE_ASSIGNMENT_DRIVER=default
```

Der `default`-Driver prüft, ob der Benutzer bereits eine Rolle zugewiesen hat. Wenn nicht, weist er die integrierte Rolle "user" zu. Dies ist die korrekte Wahl für die meisten einfachen OIDC-Setups.

---

## Wie die drei Bugs sich stapelten

```
Benutzer authentifiziert via OIDC
  ↓
Proxy ruft GetUserByClaims("userid", uuid) auf
  ↓
Gateway delegiert an Users-Service (LDAP-Backend)
  ↓
Bug #1: LDAP-Schema → UUID-Equality-Suche gibt 0 Einträge
Bug #2: disabledFilter → existierender Benutzer stillschweigend ausgeschlossen
  ↓
GetUserByClaims → ErrAccountNotFound
  ↓
Proxy ruft CreateUserFromClaims auf → Graph API → LDAP add → "Entry Already Exists"
  ↓
Cloud gibt nameAlreadyExists zurück → CreateUserFromClaims liest Benutzer erneut → gibt Benutzer zurück
  ↓
Proxy ruft GetUserByClaims erneut auf → IMMER NOCH ErrAccountNotFound (Bugs 1 & 2 erneut)
  ↓
Proxy fällt durch → versucht Rollenzuweisung
Bug #3: OIDC-Driver → keine Rollen in Claims → Fehler
  ↓
"No roles in user claims" → 401 → "Nicht angemeldet"
```

Jeder Bug für sich wäre in einer anderen Konfiguration überlebbar gewesen:

- **Bug #1** betrifft nur, wenn jemand ein kaputtes Schema ohne `EQUALITY` lädt
- **Bug #2** betrifft nur externe LDAPs, die keine OpenCloud-spezifischen Attribute haben
- **Bug #3** betrifft nur OIDC-Provider, die keine Rollen in Claims senden

Aber **zusammen** errichteten sie eine perfekt undurchdringliche Mauer.

---

## Lehren für openDesk-Contributors

### 1. LDAP-Schema-Equality-Regeln prüfen

Presence-Checks (`attr=*`) können funktionieren, während Equality-Checks (`attr=value`) stillschweigend fehlschlagen. Testen Sie immer beides beim Einrichten von Attribut-Schemas. Wenn Sie ein Helm-Chart schreiben, das ein LDAP-Schema deployed, stellen Sie sicher, dass Upgrades tatsächlich Änderungen an Matching-Regeln anwenden.

### 2. LDAPs dreiwertige Logik ist eine Falle

`(!(attr=FALSE))` ist KEIN No-Op für nicht vorhandene Attribute — es ist **UNDEFINED**, was Einträge von Suchergebnissen ausschließt. Wenn Sie einen deaktivierten Filter hinzufügen, stellen Sie sicher, dass jeder Benutzer im Verzeichnis das Attribut tatsächlich besitzt. Für externe LDAP-Integrationen setzen Sie immer `OC_LDAP_DISABLE_USER_MECHANISM=none`.

### 3. Wissen, welcher Service welche Env-Var besitzt

`GRAPH_ASSIGN_DEFAULT_USER_ROLE` (Graph API, während Benutzererstellung) und `PROXY_ROLE_ASSIGNMENT_DRIVER` (Proxy, während Login/Token-Ausstellung) steuern verschiedene Stufen desselben Flows. Die falsche Variable zu korrigieren ändert nichts. Beim Debuggen von OpenCloud OIDC, verfolgen Sie die genaue Fehlerquelle in den Logs — `oidcroles.go` bedeutet Proxy, nicht Graph API.

### 4. Nach jedem Fix erneut testen

Das Debuggen von drei gestapelten Bugs ist nur machbar, wenn Sie jeden Fix unabhängig verifizieren, bevor Sie zum nächsten übergehen. Die Fehlermeldungen änderten sich bei jedem Schritt — so wussten wir, dass wir Fortschritte machten. Isolieren Sie immer nur eine Variable.

---

## OpenCloud mit externem LDAP und Keycloak deployen

Wenn Sie diesen Stack zum ersten Mal einrichten, hier die korrekten `values.yaml`-Einstellungen, die alle drei Bugs vermeiden:

```yaml
oidc:
  roleAssignmentDriver: "default"

# Umgebungsvariablen via config setzen
extraEnv:
  - name: OC_LDAP_DISABLE_USER_MECHANISM
    value: "none"
  - name: PROXY_ROLE_ASSIGNMENT_DRIVER
    value: "default"
```

Und stellen Sie sicher, dass Ihr OpenLDAP-Schema für `openCloudUUID` `EQUALITY caseIgnoreMatch` enthält:

```
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  DESC 'OpenCloud user UUID'
  EQUALITY caseIgnoreMatch
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )
```

Alle drei Fixes sind in OpenCloud Revisionsstand 50 deployed, mit aktualisierten Chart-Templates, um ein erneutes Auftreten bei zukünftigen Deployments zu verhindern. Wenn Sie auf ähnliche Probleme stoßen, prüfen Sie diese drei Konfigurationspunkte zuerst.

---

*Dieser Artikel ist Teil einer Serie über openDesk Edu-Infrastruktur-Engineering. Der openDesk-Edu-Stack ist Open Source (Apache 2.0) und verfügbar auf [Codeberg](https://codeberg.org/opendesk-edu/opendesk-edu). Beiträge, Bug-Reports und Fragen sind willkommen via [Matrix-Channel](https://matrix.to/#/#opendesk-ce-public:matrix.uni-marburg.de).*
