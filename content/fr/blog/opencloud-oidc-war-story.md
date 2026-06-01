---
title: "Trois bugs qui bloquaient la connexion OIDC d'OpenCloud — Une histoire de débogage"
date: "2026-06-01"
description: "Comment trois bugs indépendants — une règle d'égalité LDAP manquante, un filtre désactivé invisible et un pilote de rôles mal configuré — se sont empilés pour bloquer l'auto-provisionnement OIDC d'OpenCloud, et comment nous avons corrigé chacun d'eux."
image: "/static/blog/opencloud-oidc-war-story-teaser.png"
categories: ["engineering"]
tags: ["opencloud", "oidc", "keycloak", "ldap", "debugging", "kubernetes", "helm", "sso"]
---

# Trois bugs qui bloquaient la connexion OIDC d'OpenCloud — Une histoire de débogage

Après qu'un utilisateur auto-provisionné via Keycloak OIDC a été créé avec succès dans LDAP, le proxy d'OpenCloud n'arrive pas à émettre un jeton de session. L'utilisateur voit « Sie werden eingeloggt » suivi de « Nicht angemeldet ». À chaque. Fois.

Voici l'histoire de la façon dont trois bugs indépendants se sont empilés pour créer cet échec — et ce qu'il a fallu pour les trouver. Si vous déployez OpenCloud avec un LDAP externe et Keycloak OIDC, voici les cas limites que vous devez connaître.

---

## La configuration

- **OpenCloud** 4.0.3, déployé via Helm sur Kubernetes
- **LDAP UMS externe** (OpenLDAP) comme backend d'identité
- **Keycloak** avec Shibboleth SAML → OIDC pour l'authentification
- **Auto-provisionnement** activé : la première connexion crée l'entrée LDAP à la volée

L'erreur était 100% reproductible :

1. L'utilisateur navigue vers OpenCloud → clique sur connexion
2. Redirigé vers Keycloak → s'authentifie via Shibboleth
3. Redirigé vers OpenCloud → « Sie werden eingeloggt »
4. **« Nicht angemeldet »** — accès refusé

Les logs OpenCloud montraient un motif :

```
graph:   failed to add user → LDAP Result Code 68 "Entry Already Exists"
graph:   could not create user: backend error → nameAlreadyExists
proxy:   Error Response → OData Error: a user with that name already exists
proxy:   Error getting token for autoprovisioned user → user not found
```

Le flux d'auto-provisionnement était simple : récupérer l'UUID depuis le claim OIDC `sub` → chercher l'utilisateur dans LDAP par UUID → créer si non trouvé. Mais chaque connexion frappait un mur. L'utilisateur *existait* dans LDAP. Trois bugs indépendants en étaient responsables.

---

## Bug #1 : Schéma LDAP sans `EQUALITY` sur `openCloudUUID`

### Le symptôme

L'auto-provisionnement cherche dans LDAP un utilisateur existant par UUID avant d'en créer un. L'utilisateur existait — mais la recherche retournait zéro résultat.

### L'investigation

Test direct de la recherche LDAP :

```
$ ldapsearch ... "(openCloudUUID=*)"
→ retourne l'entrée (vérification de présence fonctionne)

$ ldapsearch ... "(openCloudUUID=b7ada882-...)"
→ retourne 0 entrées (vérification d'égalité ÉCHOUE)
```

L'attribut existait. La valeur était correcte. La correspondance d'égalité ne fonctionnait pas.

### La cause racine

Le type d'attribut `openCloudUUID` dans le schéma OpenLDAP a été chargé **sans** règle `EQUALITY` :

```
# Schéma chargé (cassé) :
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )

# Définition Configmap (correcte) :
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  EQUALITY caseIgnoreMatch          ← MANQUANT dans le schéma chargé !
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )
```

Sans `EQUALITY caseIgnoreMatch`, OpenLDAP ne peut pas effectuer de correspondance d'égalité sur l'attribut. Le job de schéma vérifiait seulement la présence de nouveaux OIDs d'attributs — il ne vérifiait jamais si les attributs existants avaient des règles de correspondance correctes. Un ancien schéma chargé depuis une version antérieure du chart persistait à travers les mises à jour, et les mises à jour suivantes ne le corrigeaient jamais.

### Le correctif

**Correctif en direct** — ajouter la règle `EQUALITY` à l'OpenLDAP en cours via `ldapmodify` :

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

**Correctif persistant** — mise à jour du job de schéma du chart Helm pour vérifier également les règles `EQUALITY` sur `openCloudUUID`, pas seulement la présence d'OIDs d'attributs.

---

## Bug #2 : Le filtre désactivé invisible

### Le symptôme

Après avoir corrigé la recherche UUID, la recherche LDAP **retournait toujours zéro résultat** — mais la raison était maintenant cachée dans le filtre de recherche.

### L'investigation

Le fournisseur d'utilisateurs LDAP Reva construit un filtre de recherche pour `GetUserByClaim("userid", uuid)`. En traçant à travers le code source OpenCloud :

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

Le filtre résultant :

```
(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...)(!(openCloudUserEnabled=FALSE)))
```

Test direct :

```
$ ldapsearch ... "(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...))"
→ 1 entrée trouvée

$ ldapsearch ... "(&(objectclass=openCloudUser)(openCloudUUID=b7ada882-...)(!(openCloudUserEnabled=FALSE)))"
→ 0 entrées trouvées
```

### La cause racine

LDAP utilise une logique à trois valeurs : TRUE, FALSE et **UNDEFINED**. Quand un attribut n'existe pas sur une entrée :

- `(attr=FALSE)` → UNDEFINED (l'attribut n'est pas présent, la comparaison ne peut pas être évaluée)
- `(!(attr=FALSE))` → NOT(UNDEFINED) → **UNDEFINED**
- `(TRUE AND TRUE AND UNDEFINED)` → **UNDEFINED** → l'entrée n'est **pas retournée**

L'entrée utilisateur dans un LDAP UMS externe n'a pas d'attribut `openCloudUserEnabled`. C'est un attribut interne à OpenCloud qui existe dans le LDAP IDM d'OpenCloud mais pas dans les annuaires externes. Le `disabledFilter()` a été conçu pour le LDAP IDM interne, mais quand on le pointe vers un LDAP externe, il filtrait silencieusement **chaque utilisateur**.

Le `DisableUserMechanism` était défini sur `"attribute"` par défaut, ce qui ajoute le filtre `(!(openCloudUserEnabled=FALSE))`. Dans l'IDM interne d'OpenCloud, chaque utilisateur a cet attribut défini sur `TRUE`. Dans un LDAP externe, personne ne l'a.

### Le correctif

```yaml
# values.yaml
oidc:
  roleAssignmentDriver: "default"

# → définit la var d'env OC_LDAP_DISABLE_USER_MECHANISM=none
```

`OC_LDAP_DISABLE_USER_MECHANISM=none` dit au service utilisateurs d'ignorer complètement le filtre désactivé. C'est le paramètre correct quand on utilise un LDAP externe qui ne gère pas les attributs spécifiques à OpenCloud.

---

## Bug #3 : Le pilote d'attribution de rôles OIDC nécessite des rôles qui n'existent pas

### Le symptôme

Après avoir corrigé la recherche LDAP, le flux de connexion progressait plus loin — mais échouait avec une nouvelle erreur :

```
proxy: no roles in user claims
proxy: Error mapping role names to role ids → oidcroles.go:84
proxy: Could not get user roles → account_resolver.go:192
```

### L'investigation

Le proxy était configuré avec `PROXY_ROLE_ASSIGNMENT_DRIVER=oidc`, qui lit les informations de rôle depuis les claims OIDC et les mappe aux rôles OpenCloud. Notre instance Keycloak n'envoie pas de rôles dans le jeton OIDC — c'est une configuration d'authentification simple.

Le mappeur de rôles OIDC itère sur les claims, cherche des rôles, n'en trouve pas et retourne une erreur. Cette erreur se propage à travers le résolveur de compte, qui abandonne la connexion.

J'ai d'abord essayé `GRAPH_ASSIGN_DEFAULT_USER_ROLE=true`, qui contrôle si l'**API Graph** attribue un rôle par défaut lors de la création des utilisateurs. Mais l'erreur venait du **Proxy** après la création de l'utilisateur, pendant l'émission du jeton. Deux chemins de code différents, deux variables d'env différentes.

### La cause racine

`PROXY_ROLE_ASSIGNMENT_DRIVER` supporte deux valeurs :

| Driver | Comportement |
|---|---|
| `oidc` | Lit les rôles depuis les claims OIDC. **Échoue** si les claims n'ont pas de rôles. |
| `default` | Attribue le rôle "user" à tout utilisateur sans rôle au moment de la connexion. |

Le driver `oidc` est conçu pour les configurations où Keycloak envoie des rôles via un claim OIDC (par exemple, `roles`, `groups`, ou un mappeur personnalisé). Utilisé avec un Keycloak qui n'envoie pas de rôles, c'est un blocage dur.

### Le correctif

```yaml
# values.yaml
oidc:
  roleAssignmentDriver: "default"

# → définit la var d'env PROXY_ROLE_ASSIGNMENT_DRIVER=default
```

Le driver `default` vérifie si l'utilisateur a déjà un rôle attribué. Sinon, il attribue le rôle intégré "user". C'est le choix correct pour la plupart des configurations OIDC simples.

---

## Comment les trois bugs se sont empilés

```
L'utilisateur s'authentifie via OIDC
  ↓
Le proxy appelle GetUserByClaims("userid", uuid)
  ↓
La passerelle délègue au service utilisateurs (backend LDAP)
  ↓
Bug #1 : Schéma LDAP → la recherche d'égalité UUID retourne 0 entrées
Bug #2 : disabledFilter → l'utilisateur existant est silencieusement exclu
  ↓
GetUserByClaims → ErrAccountNotFound
  ↓
Le proxy appelle CreateUserFromClaims → Graph API → LDAP add → "Entry Already Exists"
  ↓
Cloud retourne nameAlreadyExists → CreateUserFromClaims relit l'utilisateur → retourne l'utilisateur
  ↓
Le proxy appelle GetUserByClaims à nouveau → ENCORE ErrAccountNotFound (bugs 1 & 2 à nouveau)
  ↓
Le proxy échoue → essaie l'attribution de rôle
Bug #3 : Driver OIDC → pas de rôles dans les claims → erreur
  ↓
"No roles in user claims" → 401 → "Nicht angemeldet"
```

Chaque bug seul aurait été survivable dans une configuration différente :

- **Bug #1** n'importe que si quelqu'un charge un schéma cassé sans `EQUALITY`
- **Bug #2** n'importe qu'avec un LDAP externe qui manque d'attributs spécifiques à OpenCloud
- **Bug #3** n'importe qu'avec des fournisseurs OIDC qui n'envoient pas de rôles dans les claims

Mais **ensemble**, ils ont créé un mur parfaitement infranchissable.

---

## Leçons pour les contributeurs openDesk

### 1. Vérifiez les règles d'égalité du schéma LDAP

Les vérifications de présence (`attr=*`) peuvent fonctionner alors que les vérifications d'égalité (`attr=value`) échouent silencieusement. Testez toujours les deux lors de la configuration des schémas d'attributs. Si vous écrivez un chart Helm qui déploie un schéma LDAP, vérifiez que les mises à jour appliquent réellement les changements de règles de correspondance.

### 2. La logique à trois valeurs de LDAP est un piège

`(!(attr=FALSE))` n'est PAS un no-op pour les attributs absents — c'est **UNDEFINED**, ce qui exclut les entrées des résultats de recherche. Si vous ajoutez un filtre désactivé, assurez-vous que chaque utilisateur dans l'annuaire possède réellement l'attribut. Pour les intégrations LDAP externes, définissez toujours `OC_LDAP_DISABLE_USER_MECHANISM=none`.

### 3. Sachez quel service possède quelle variable d'env

`GRAPH_ASSIGN_DEFAULT_USER_ROLE` (API Graph, pendant la création d'utilisateur) et `PROXY_ROLE_ASSIGNMENT_DRIVER` (Proxy, pendant la connexion/émission de jeton) contrôlent différentes étapes du même flux. Corriger la mauvaise variable ne change rien. Lors du débogage d'OpenCloud OIDC, tracez la source exacte de l'erreur dans les logs — `oidcroles.go` signifie le Proxy, pas l'API Graph.

### 4. Retestez toujours après chaque correctif

Déboguer trois bugs empilés n'est possible que si vous vérifiez chaque correctif indépendamment avant de passer au suivant. Les messages d'erreur changeaient à chaque étape — c'est ainsi que nous savions que nous progressions. Isolez une variable à la fois.

---

## Déployer OpenCloud avec LDAP externe et Keycloak

Si vous configurez cette stack pour la première fois, voici les paramètres `values.yaml` corrects qui évitent les trois bugs :

```yaml
oidc:
  roleAssignmentDriver: "default"

# Variables d'environnement à définir via config
extraEnv:
  - name: OC_LDAP_DISABLE_USER_MECHANISM
    value: "none"
  - name: PROXY_ROLE_ASSIGNMENT_DRIVER
    value: "default"
```

Et assurez-vous que votre schéma OpenLDAP pour `openCloudUUID` inclut `EQUALITY caseIgnoreMatch` :

```
olcAttributeTypes: ( 1.3.6.1.4.1.99999.1.1
  NAME 'openCloudUUID'
  DESC 'OpenCloud user UUID'
  EQUALITY caseIgnoreMatch
  SYNTAX 1.3.6.1.4.1.1466.115.121.1.15
  SINGLE-VALUE )
```

Les trois correctifs sont déployés dans la révision 50 d'OpenCloud, avec des modèles de chart mis à jour pour empêcher la récurrence lors des déploiements futurs. Si vous rencontrez des problèmes similaires, vérifiez ces trois points de configuration en premier.

---

*Cet article fait partie d'une série sur l'ingénierie d'infrastructure openDesk Edu. La stack openDesk Edu est open source (Apache 2.0) et disponible sur [Codeberg](https://codeberg.org/opendesk-edu/opendesk-edu). Les contributions, signalements de bugs et questions sont les bienvenus via le [canal Matrix](https://matrix.to/#/#opendesk-ce-public:matrix.uni-marburg.de).*
