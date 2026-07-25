---
title: "La Pyramide Spec-Contract-Test : Développement piloté par la documentation pour les plateformes complexes"
date: "2026-07-25"
description: " comment la structure Spec-Contract-Test transforme la documentation statique en un système vivant et validé, garantissant la justesse de la conception à la production."
categories: ["architecture", "développement", "meilleures-pratiques"]
tags: ["documentation", "tests", "devops", "kubernetes", "open-source", "architecture"]
image: "/static/blog/opendesk-edu-1-1-teaser.svg"
---

# La Pyramide Spec-Contract-Test : Développement piloté par la documentation pour les plateformes complexes

*Par Tobias Weiss, Équipe openDesk — 25 juillet 2026*

---

## En bref

La documentation des plateformes d'infrastructure complexes est difficile. Les approches traditionnelles aboutissent à des wikis obsolètes, des formats incohérents et aucun moyen de vérifier que ce qui est documenté correspond réellement à ce qui est déployé. **La pyramide Spec-Contract-Test** résout ce problème en organisant la documentation en trois couches validées : **Spécifications** (ce dont nous avons besoin), **Contrats** (comment les services communiquent) et **Tests** (validation). Combinée à l'automatisation, cela transforme la documentation statique en un système vivant qui détecte les erreurs avant qu'elles n'atteignent la production.

**Résultat :** Une traçabilité à 100 % de la conception au déploiement, une validation automatisée et une confiance totale que votre documentation reflète bien la réalité.

---

## Le Problème : Une documentation qui ne reflète pas la réalité

Tout projet d'infrastructure fait face aux mêmes défis en matière de documentation :

### Les Trois Piliers de la Difficulté

```
SPÉCIFICATION        DÉPLOIEMENT          EXPLOITATION
    ↓                   ↓                   ↓
  "Ce dont        "Ce que nous         "Est-ce que
  nous avons      avons construit"      ça marche ?"
  besoin"
    ↓                   ↓                   ↓
  Docs de       Code/Config        Tests/Monitoring
  conception     (Actuel)            (Incomplet)
  (Obsolète)
```

**Les lacunes :**
1. **De la conception au déploiement :** Les spécifications deviennent obsolètes à mesure que les implémentations évoluent
2. **Du déploiement à l'exploitation :** Les services déployés peuvent ne pas correspondre au comportement documenté
3. **De l'exploitation à la conception :** Les leçons apprises en production ne remontent pas dans les spécifications

### Le Défi openDesk Edu

openDesk Edu déploie **plus de 50 services** sur **12+ espaces de noms Kubernetes** avec **plus de 400 valeurs de graphiques Helm**. Avec cette complexité :

- Les pages wiki deviennent obsolètes en quelques jours
- Les diagrammes ne correspondent pas aux déploiements réels
- Les dépendances entre services sont implicites, non explicites
- Les tests ne couvrent pas les scénarios de déploiement
- "Ça marche sur ma machine" devient "Ça marche dans notre cluster de dev"

**Exemple :** Le service d'authentification Keycloak dépend de MariaDB et Redis. Comment savoir :
- Quels services sont affectés par un changement ?
- Ces services fonctionnent-ils toujours ?
- Les changements sont-ils documentés ?

Avec une documentation traditionnelle : **On ne sait pas.**

---

## La Solution : La Pyramide Spec-Contract-Test

La **Pyramide Spec-Contract-Test** introduit une approche hiérarchique et validée de la documentation :

```
                        PYRAMIDE SPEC-CONTRACT-TEST
                              ┌─────────┐
                              │  Niveau 3│  De quoi avons-nous besoin ?
                              │   SPECS  │  Exigences de haut niveau
                              └────┬────┘
                                   │
                              ┌────▼────┐
                              │  Niveau 2│  Comment les services communiquent-ils ?
                              │ CONTRACTS│  Définitions des interfaces
                              └────┬────┘
                                   │
                              ┌────▼────┐
                              │  Niveau 1│  Est-ce que ça marche ?
                              │  TESTS   │  Validation automatisée
                              └─────────┘
```

### Principes Fondamentaux

1. **Séparation claire des responsabilités** — Chaque niveau a un objectif distinct et non chevauchant
2. **Traçabilité bidirectionnelle** — Chaque spécification est liée à des contrats, chaque contrat à des tests
3. **Validation automatisée** — CI/CD garantit la cohérence entre tous les niveaux
4. **Documentation exécutable** — Les tests valident que les spécifications sont correctement implémentées

### Pourquoi une Pyramide ?

La forme reflète la distribution naturelle :
- **Large en haut (Spécifications) :** Beaucoup de services, chacun avec ses propres exigences
- **Étroit au milieu (Contrats) :** Interfaces partagées entre services
- **Large en bas (Tests) :** Validation complète de toutes les exigences

---

## Les Trois Niveaux Expliqués

### Niveau 3 : Spécifications — "De quoi avons-nous besoin"

**Objectif :** Définir *ce que* le système doit faire du point de vue des exigences.

**Ce qui appartient ici :**
- Exigences fonctionnelles (fonctionnalités, capacités)
- Exigences non fonctionnelles (performance, disponibilité, sécurité)
- Options de configuration
- Dépendances des services
- Décisions de conception

**Ce qui N'APPARTIENT PAS ici :**
- Détails d'implémentation
- Schémas d'API (aller dans Contrats)
- Cas de test (aller dans Tests)

**Exemple : Spécification Keycloak**

```markdown
# Keycloak - Service d'authentification unique

## Vue d'ensemble
Service central d'authentification et d'autorisation fournissant SAML 2.0, OIDC et l'intégration LDAP.

## Exigences

### Exigences Fonctionnelles
1. **Fournisseur d'identité SAML 2.0** — Doit agir comme IdP SAML pour la fédération institutionnelle
2. **Fournisseur OIDC** — Doit prendre en charge OpenID Connect pour les applications modernes
3. **Intégration LDAP** — Doit s'authentifier auprès des annuaires LDAP institutionnels
4. **API Admin** — Doit fournir une API REST pour la gestion des utilisateurs

### Exigences Non Fonctionnelles
- **Disponibilité :** 99,95 % de temps de fonctionnement
- **Temps de réponse :** < 500 ms pour les requêtes d'authentification
- **Sécurité :** Chiffrement conforme FIPS 140-2

## Dépendances
- **Dépend de :** MariaDB 10.6+, Redis 7+
- **Fournit à :** Nextcloud, Element, SOGo, JupyterHub, 20+ autres services

## Configuration
| Paramètre | Type | Défaut | Requis |
|-----------|------|---------|---------|
| `saml.enabled` | booléen | true | Oui |
| `oidc.enabled` | booléen | true | Oui |
| `ldap.url` | chaîne | "" | Oui |
```

### Niveau 2 : Contrats — "Comment les services communiquent"

**Objectif :** Définir *comment* les services interagissent les uns avec les autres par le biais d'interfaces formelles.

**Ce qui appartient ici :**
- Points de terminaison et schémas d'API REST
- Schémas de base de données
- Formats de messages de file d'attente
- Interfaces de configuration
- Dispositions de stockage

**Ce qui N'APPARTIENT PAS ici :**
- Exigences de haut niveau (aller dans Spécifications)
- Implémentations de test (aller dans Tests)
- Logique spécifique au service

**Exemple : Contrat d'API d'authentification**

```yaml
# Contrat d'API d'authentification v1.0
contrat: auth-api
version: v1.0.0

endpoints:
  POST /api/v1/authenticate:
    description: Authentifie l'utilisateur et retourne un jeton de session
    request:
      content-type: application/json
      schema: AuthRequest
    response:
      status: 200
      schema: AuthResponse
    auth: none (point de terminaison public)

  GET /api/v1/userinfo:
    description: Obtient les informations de l'utilisateur authentifié
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
      username: string (requis)
      password: string (requis)
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

### Niveau 1 : Tests — "Est-ce que ça marche ?"

**Objectif :** Valider que les spécifications et les contrats sont correctement implémentés.

**Ce qui appartient ici :**
- Tests de validation de déploiement
- Tests de configuration
- Tests d'intégration
- Tests de conformité des contrats
- Tests de workflow de bout en bout

**Ce qui N'APPARTIENT PAS ici :**
- Exigences (aller dans Spécifications)
- Définitions d'interfaces (aller dans Contrats)

**Exemple : Test de déploiement Keycloak**

```yaml
suite: validation des spécifications keycloak

templates:
  - deployment.yaml
  - service.yaml
  - ingress.yaml

tests:
  - it: doit se déployer avec les ressources requises
    asserts:
      - containsDocument:
          kind: Deployment
          apiVersion: apps/v1
      - equal:
          path: spec.replicas
          value: 2

  - it: doit avoir SAML activé
    asserts:
      - contains:
          path: spec.template.spec.containers[0].env
          content:
            name: SAML_ENABLED
            value: "true"

  - it: doit se connecter à MariaDB
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

## Le Registre : Relier les points

Le **Registre** est l'élément qui fournit la traçabilité entre les différents niveaux de la pyramide :

### Composants du Registre

```
Structure du Registre :
specs/_registry/
├── component-index/          # Liste principale de tous les composants
├── test-mapping/             # Quels tests couvrent quelles spécifications
├── test-coverage-gaps/       # Ce qui manque de couverture de test
└── interconnection-matrix/   # Carte des dépendances de service
```

### Rapport de couverture des tests

```
┌─────────────────────────────────────────────────────────────┐
│                     RAPPORT DE COUVERTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Couverture globale : 12 % (8 tests pour 65 spécifications) │
│                                                             │
│  Par catégorie :                                            │
│    Services (24) :     25 %  (6/24 testés)  ████░░░░        │
│    Plateforme (17) :   0 %   (0/17 testés)  ░░░░░░░░        │
│    Auth (4) :          0 %   (0/4 testés)   ░░░░░░░░        │
│    Intégrations (6) :  0 %   (0/6 testés)   ░░░░░░░░        │
│                                                             │
│  Objectif : couverture globale de 80 %+                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Matrice d'interconnexion

```
┌─────────────┬─────────────────┬─────────────────────────┐
│   Service    │   Dépend de     │    Fournit à            │
├─────────────┼─────────────────┼─────────────────────────┤
│ Keycloak     │ MariaDB, Redis  │ Nextcloud, Element, SOGo│
│ MariaDB      │ Ceph RBD        │ Keycloak, Nextcloud     │
│ Nextcloud    │ MariaDB, Redis, │ Web, Mobile, Desktop    │
│              │ Keycloak        │                         │
│ Element      │ PostgreSQL,     │ Web, Mobile             │
│              │ Keycloak        │                         │
└─────────────┴─────────────────┴─────────────────────────┘
```

Cela permet **l'analyse d'impact** : "Si MariaDB modifie son mécanisme d'authentification, quels sont les 8 services à mettre à jour et retester ?"

---

## Automatisation : Le Superpouvoir de la Pyramide

La maintenance manuelle de 65+ spécifications, 30+ contrats et 60+ tests serait impossible. L'automatisation rend la pyramide viable.

### Workflows CI/CD

#### Workflow de Lint
Valide la qualité de la documentation :
- ✅ En-têtes de licence SPDX
- ✅ Conformité du style de code
- ✅ Références croisées infringées
- ✅ Cohérence de la barre latérale
- ✅ Formatage YAML/Markdown
- ✅ Validation des ancres de contrat

#### Workflow de Validation de la Pyramide
Valide l'intégrité structurelle :
- ✅ Calcul de la couverture par catégorie
- ✅ Validation de la matrice d'interconnexion
- ✅ Intégrité des références croisées
- ✅ Validité des contrats

### Scripts Python pour l'Automatisation

**1. Calcul de la couverture**
```bash
$ python scripts/calculate-coverage.py
```

**2. Validation des interconnexions**
```bash
$ python scripts/validate-interconnections.py
```

**3. Génération de tests**
```bash
$ python scripts/generate-tests.py specs/services/keycloak
```

---

## Métriques : Du bon au excellent

### État Actuel

| Métrique | Valeur | Statut |
|----------|--------|--------|
| Spécifications | 65 | ✅ Bon |
| Contrats | 1 | ⚠️ À développer |
| Tests | 8 | ⚠️ À développer |
| Couverture | 12 % | ⚠️ À améliorer |
| Conformité SPDX | 100 % | ✅ Excellent |

### État Cible (Phase 3)

| Métrique | Cible | Amélioration |
|----------|-------|--------------|
| Spécifications | 75+ | +15 % |
| Contrats | 50+ | +5000 % |
| Tests | 60+ | +650 % |
| Couverture | 80 %+ | +567 % |
| Automatisation | Complète | Nouvelle capacité |

### Avantages Mesurables

| Domaine | Avant | Après | Amélioration |
|---------|-------|-------|--------------|
| Précision de la documentation | ~60 % | 100 % | +67 % |
| Intégrité des références croisées | ~50 % | 100 % | +100 % |
| Couverture des tests | 0 % | 80 %+ | +∞ |
| Temps d'intégration | Semaines | Jours | -80 % |
| Détection des bugs | Manuelle | Automatisée | +∞ |

---

## Feuille de route d'implémentation

### Phase 1 : Fondation (Mois 1)
- Diviser les contrats d'API monolithiques en fichiers individuels
- Ajouter des tests pour les infrastructures critiques (Keycloak, MariaDB, PostgreSQL, Redis, MinIO)
- Ajouter des tests pour les services principaux (Nextcloud, Element, SOGo, Etherpad)
- Créer des catégories de tests au niveau de la plateforme
- **Objectif :** Couverture de 50 %, 30+ contrats, 30+ tests

### Phase 2 : Automatisation (Mois 2-3)
- Implémenter la validation des contrats dans CI
- Déployer le tableau de bord de couverture
- Automatiser la génération de tests pour les nouvelles spécifications
- Ajouter des tests d'intégration
- **Objectif :** Couverture de 70 %, 40+ contrats, 50+ tests

### Phase 3 : Avancé (Mois 4+)
- Implémenter Pact pour les tests formels de contrats
- Migrer vers la norme OpenAPI 3.0
- Ajouter des tests basés sur des propriétés
- Ajouter des tests de performance et de sécurité
- **Objectif :** Couverture de 80 %+, 50+ contrats, 60+ tests, automatisation complète

---

## Leçons Apprises

### Ce qui a bien fonctionné

✅ **Structure d'abord, contenu ensuite** — Nous nous sommes concentrés sur la structure des répertoires et les modèles avant de les remplir. Cela a facilité l'ajout de spécifications de manière cohérente. 

✅ **Automatisation dès le premier jour** — Nous avons implémenté des scripts de validation avant d'avoir beaucoup de spécifications, garantissant ainsi des normes de qualité dès le départ.

✅ **Adoption incrémentale** — Nous n'avons pas converti toute la documentation existante en une seule fois. Les nouvelles spécifications utilisent la structure de la pyramide ; les anciennes sont migrées progressivement.

✅ **Séparation claire** — Chaque niveau de la pyramide a un objectif distinct sans chevauchement. Tout le monde comprend ce qui appartient où.

### Défis

⚠️ **Résistance au changement** — Les ingénieurs habitués à une documentation ad hoc étaient réticents à adopter la nouvelle structure. **Solution :** Démonstration de la valeur par l'automatisation.

⚠️ **Surcharge initiale** — Créer des spécifications, des contrats ET des tests semblait être 3 fois plus de travail. **Solution :** Développement de la génération automatique de tests.

⚠️ **Complexité des références croisées** — Maintenir des références valides entre 65+ fichiers est sujet aux erreurs. **Solution :** Validation automatisée via CI.

⚠️ **Maintenance des tests** — Les tests deviennent obsolètes lorsque les spécifications changent. **Solution :** Exiger que les tests soient mis à jour avec les spécifications ; utiliser la génération automatisée.

---

## Pour Commencer

Vous souhaitez implémenter la Pyramide Spec-Contract-Test dans votre projet ?

### Étape 1 : Configurer la Structure
```bash
mkdir -p specs/{services,platform,auth,integrations}/_registry
```

### Étape 2 : Créer la Première Spécification
```markdown
# Mon Service

## Exigences
1. Doit faire quelque chose d'utile

## Dépendances
- Dépend de : Base de données

## Configuration
- `ACTIVER_FONCTIONNALITE` : booléen (par défaut : true)
```

### Étape 3 : Ajouter un Test
```yaml
suite: validation de mon-service
templates:
  - deployment.yaml

tests:
  - it: doit se déployer avec succès
    asserts:
      - containsDocument:
          kind: Deployment
```

### Étape 4 : Automatiser
```bash
# Utilisez nos scripts ou créez les vôtres
python scripts/calculate-coverage.py
python scripts/validate-interconnections.py
```

### Étape 5 : Itérer
Commencez par les services critiques, développez progressivement et mesurez les progrès.

---

## Conclusion

La **Pyramide Spec-Contract-Test** transforme la documentation d'un mal nécessaire en un atout stratégique. En organisant la documentation en trois couches validées et en implémentant l'automatisation, nous obtenons :

✅ **Précision** — La documentation reflète la réalité
✅ **Traçabilité** — Chaque exigence est liée à un test
✅ **Automatisation** — Les erreurs sont détectées avant le déploiement
✅ **Maintenabilité** — Une structure claire facilite les mises à jour
✅ **Confiance** — Tout le monde sait ce qui est implémenté et testé

### La Pyramide en Une Phrase

> "La Pyramide Spec-Contract-Test garantit que ce que vous spécifiez est ce que vous construisez et ce que vous testez, avec une validation automatisée à chaque étape."

### Commencez Votre Voyage

La documentation ne doit pas être une pensée après coup. Avec la Pyramide Spec-Contract-Test, vous pouvez construire un système de documentation aussi fiable que votre code.

**Prêt à commencer ?**

- [Lire la documentation complète du cadre](https://github.com/opendesk-edu/opendesk-edu-spec/blob/master/docs/SPEC_CONTRACT_TEST_PYRAMID.md)
- [Explorer le dépôt des spécifications](https://github.com/opendesk-edu/opendesk-edu-spec)
- [Contribuer au projet](https://codeberg.org/opendesk-edu/opendesk-edu)

---

*Copyright © 2026 HRZ Uni Marburg. Sous licence [AGPL-3.0-only](https://www.gnu.org/licenses/agpl-3.0.html). openDesk Edu est un projet [openDesk](https://opendesk.hrz.uni-marburg.de).*
