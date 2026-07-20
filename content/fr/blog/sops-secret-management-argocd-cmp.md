---
title: "Gestion des secrets native GitOps avec SOPS et sidecar ArgoCD CMP"
date: "2026-07-10"
description: "Comment openDesk Edu chiffre 126 secrets dans Git avec SOPS et le chiffrement age, et les déchiffre au moment du déploiement via un sidecar ArgoCD Config Management Plugin — sans Vault, sans External Secrets Operator, sans infrastructure propriétaire."
categories: ["technique", "sécurité", "devops"]
tags: ["sops", "gestion-secrets", "argocd", "gitops", "kubernetes", "sécurité", "chiffrement-age", "helmfile"]
image: "/static/blog/sops-secret-management-argocd-cmp-teaser.svg"
---

# Gestion des secrets native GitOps avec SOPS et sidecar ArgoCD CMP

> **Le défi :** Comment gérez-vous les mots de passe de base de données, les jetons API et les secrets clients OIDC dans un workflow GitOps où *tout* — y compris la configuration de déploiement — vit dans un dépôt Git public ?
>
> **La réponse :** Chiffrez les secrets avec SOPS en utilisant des clés age, commitez-les en tant que fichiers `.enc.yaml` à côté de vos valeurs en clair, et déchiffrez-les au moment du déploiement avec un sidecar ArgoCD Config Management Plugin. Pas de cluster Vault. Pas d'External Secrets Operator. Pas d'infrastructure propriétaire — juste `sops`, `age` et un script shell de 10 lignes.

## Le problème : les secrets dans GitOps

Chez openDesk Edu, nous déployons 25+ services intégrés sur plusieurs clusters Kubernetes en utilisant un workflow GitOps avec ArgoCD et Helmfile. Chaque élément de configuration — valeurs Helm, surcharges d'environnement, définitions de services — vit dans un dépôt Git et est automatiquement synchronisé avec le cluster.

C'est excellent pour tout *sauf les secrets*.

Un déploiement standard d'openDesk Edu nécessite environ 126 valeurs secrètes distinctes :

- **P0 (Critique) :** Identifiants administrateur Keycloak, mots de passe root de base de données, authentification du relais mail
- **P1 (Élevé) :** Secrets clients OIDC, identifiants de liaison LDAP, mots de passe SMTP
- **P2 (Moyen) :** Jetons d'authentification Redis, mots de passe des réplicas MariaDB
- **P3 (Faible) :** Clés de stockage Ceph, jetons API de service

Avec GitOps, vous ne pouvez pas simplement exécuter `kubectl create secret` — cela viole le principe de Git comme source unique de vérité. Mais vous ne pouvez pas non plus commiter des secrets en clair dans un dépôt Git.

L'écosystème open-source offre plusieurs solutions. Voici pourquoi nous avons choisi notre approche.

## Pourquoi SOPS (+ age) plutôt que les alternatives

### Option rejetée : Sealed Secrets

[Bitnami Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) chiffre les secrets avec une clé locale au cluster. Le problème : la CRD SealedSecret est limitée au cluster. Si votre cluster meurt, vous perdez votre clé de scellement à moins de l'avoir sauvegardée séparément. Pour un déploiement multi-cluster (dev, staging, prod), vous auriez besoin de secrets scellés séparés par cluster, ce qui duplique le travail et crée un risque de dérive.

### Option rejetée : External Secrets Operator

[External Secrets Operator](https://external-secrets.io/) extrait les secrets d'un coffre externe (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault). C'est un excellent modèle pour les déploiements cloud-natifs, mais il introduit une dépendance externe et une seconde source de vérité. Pour un déploiement sur site dans les universités allemandes où vous souhaitez minimiser les dépendances d'infrastructure, ajouter un cluster HashiCorp Vault juste pour gérer les secrets semblait remplacer un problème par un autre.

### Option rejetée : Helm Secrets / Helm S3

Ceux-ci nécessitent les outils de déchiffrement sur chaque machine de développeur et ne s'intègrent pas proprement avec le modèle de synchronisation déclarative d'ArgoCD.

### Choix retenu : SOPS avec age et sidecar ArgoCD CMP

[SOPS (Secrets OPerationS)](https://github.com/getsops/sops) est un outil mature et éprouvé pour chiffrer des valeurs individuelles ou des fichiers entiers. Nous l'avons choisi car :

- **Chiffrement sans état** — le déchiffrement ne nécessite que la clé privée age, pas un service en cours d'exécution
- **Natürlich Git** — les fichiers chiffrés se trouvent à côté de leurs homologues en clair dans le dépôt
- **Natürlich ArgoCD** — le modèle de sidecar Config Management Plugin s'intègre parfaitement
- **Aucune dépendance au cluster** — la clé de déchiffrement est un seul fichier, sauvegardé indépendamment de tout cluster
- **Piste d'audit** — chaque modification de secret est un commit Git avec auteur, horodatage et diff

## L'architecture

Notre architecture de gestion des secrets se compose de quatre composants :

```
┌─────────────────────────────────────────────────────────┐
│                    Dépôt Git                             │
│                                                          │
│  .sops.yaml          helmfile/secrets/                   │
│  ──────────          ───────────────────                 │
│  creation_rules:     secrets.enc.yaml (P0 critique)      │
│    age: <public_key> secrets.prod.enc.yaml (P1-P3)       │
│                                                          │
└──────────────────────┬──────────────────────────────────┘
                        │ git push
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    ArgoCD                                 │
│                                                          │
│  ┌─────────────────┐    ┌────────────────────────────┐  │
│  │  repo-server     │    │  Sidecar CMP (sops)        │  │
│  │  (principal)     │◄───│                            │  │
│  │                  │    │  sops --decrypt *.enc.yaml │  │
│  │  Reçoit le YAML  │    │  clé age : /sops-age-key/  │  │
│  │  déchiffré       │    └────────────────────────────┘  │
│  └─────────────────┘                                     │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ┌─────────────────────┐
                     │  Cluster Kubernetes  │
                     │  Secrets + ConfigMaps│
                     └─────────────────────┘
```

### 1. Configuration SOPS (`.sops.yaml`)

La racine du dépôt contient un fichier `.sops.yaml` qui définit les règles de chiffrement :

```yaml
creation_rules:
  - path_regex: \.enc\.yaml$
    age: <age-public-key>
```

Cela indique à SOPS : *tout fichier se terminant par `.enc.yaml` doit être chiffré avec cette clé publique age.* La magie est que SOPS génère une clé de chiffrement de données unique par fichier, qui est ensuite enveloppée avec la clé publique age. Cela signifie que vous pouvez faire tourner la clé age sans rechiffrer chaque fichier — il suffit de ré-envelopper les clés de chiffrement de données.

### 2. Fichiers de secrets chiffrés

Nous organisons les secrets par environnement et criticité :

| Fichier | Contenu | Priorité |
|------|----------|----------|
| `helmfile/environments/default/secrets.enc.yaml` | Secrets critiques P0 (97 valeurs) | 🔴 Critique |
| `helmfile/environments/default/secrets.prod.enc.yaml` | Secrets P1-P3 par environnement (29 valeurs) | 🟠 Élevée |

L'extension `.enc.yaml` est notre signal à la fois pour SOPS et ArgoCD que le fichier nécessite un déchiffrement. Lorsque vous ouvrez l'un de ces fichiers, vous voyez :

```yaml
keycloak_admin_password: ENC[AES256_GCM,data:...,iv:...,tag:...,type:str]
mariadb_root_password: ENC[AES256_GCM,data:...,iv:...,tag:...,type:str]
sops:
    kms: null
    gcp_kms: null
    azure_kv: null
    hc_vault: null
    age:
        - recipient: age1...
          enc: |
            ---
            ...
    lastmodified: '2026-07-09T12:00:00Z'
```

Chaque valeur est individuellement chiffrée avec AES-256-GCM, et le fichier porte des métadonnées sur les clés de chiffrement, la version et la date de dernière modification.

### 3. Sidecar ArgoCD CMP

Le point d'intégration clé est le sidecar ArgoCD Config Management Plugin (CMP). Ce sidecar s'exécute à côté du conteneur principal du repo-server ArgoCD et intercepte les fichiers `.enc.yaml` avant qu'ils n'atteignent la détection de ressources.

**La configuration du sidecar est une seule ConfigMap :**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmp-sops-plugin
  namespace: argocd
data:
  plugin.yaml: |
    apiVersion: argoproj.io/v1alpha1
    kind: ConfigManagementPlugin
    metadata:
      name: sops
    spec:
      sidecar: true
      generate:
        command:
          - /bin/sh
          - -c
          - |
            for f in $(find . -name '*.enc.yaml' -type f); do
              /custom-tools/sops --decrypt \
                --input-type yaml --output-type yaml "$f" 2>/dev/null
            done
      discover:
        find:
          glob: "**/*.enc.yaml"
```

Lorsqu'ArgoCD détecte un fichier correspondant à `*.enc.yaml`, il invoque la commande generate du sidecar, qui exécute `sops --decrypt` sur chaque fichier chiffré. Le YAML déchiffré est ensuite transmis à la détection de ressources standard d'ArgoCD.

**Le sidecar a besoin de deux choses pour fonctionner :**

1. Le binaire `sops` dans le conteneur sidecar
2. La clé privée age montée en tant que secret Kubernetes

Les deux sont injectés via un correctif de fusion stratégique sur le déploiement du repo-server ArgoCD :

```yaml
# Correctif de fusion stratégique (abrégé)
spec:
  template:
    spec:
      initContainers:
        - name: install-sops
          image: alpine:3.20
          command: ["/bin/sh", "-c"]
          args:
            - |
              wget -q https://github.com/getsops/sops/releases/...
              mv sops /custom-tools/sops
          volumeMounts:
            - name: extra-tools
              mountPath: /custom-tools
      containers:
        - name: sops
          image: alpine:3.20
          command: [/var/run/argocd/argocd-cmp-server]
          volumeMounts:
            - name: extra-tools
              mountPath: /custom-tools
            - name: argocd-sops-age-key
              mountPath: /sops-age-key
              readOnly: true
      volumes:
        - name: extra-tools
          emptyDir: {}
        - name: argocd-sops-age-key
          secret:
            secretName: argocd-sops-age-key
```

### 4. Annotation des applications ArgoCD

Chaque application ArgoCD qui utilise des fichiers chiffrés SOPS doit déclarer le plugin :

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: opendesk-edu
spec:
  source:
    repoURL: https://github.com/opendesk-edu/opendesk-edu.git
    path: .
  plugin:
    name: sops
```

C'est tout. L'application déchiffre désormais les secrets de manière transparente lors de la synchronisation.

## Vérifié de bout en bout

Le sidecar CMP a été déployé et testé sur le cluster HRZ de production (K3s v1.32.3, ArgoCD v3.0.12) en juillet 2026. Nous avons vérifié :

1. **Secret chiffré commité** — Un `test-secret.enc.yaml` a été commité dans le dépôt
2. **ArgoCD a détecté le changement** — Le statut de synchronisation de l'application montrait un diff
3. **Le sidecar a déchiffré le secret** — `kubectl -n argocd logs deployment/argocd-repo-server sops` a confirmé le déchiffrement
4. **La ressource a été appliquée** — Le secret en clair a été créé dans le namespace cible
5. **Aucune fuite de texte en clair** — Vérifié que le fichier chiffré est resté chiffré dans Git

L'ensemble de la configuration — de la configuration du dépôt au déploiement fonctionnel — a pris environ 4 heures, y compris le débogage des montages de volumes du sidecar.

## Ce que cela signifie pour les opérateurs

### Opérations quotidiennes

Pour la plupart des opérateurs, l'intégration SOPS est invisible. Ils :

1. Modifient les valeurs Helm dans les fichiers `.yaml` et `.gotmpl` habituels
2. Committent et poussent vers Git
3. ArgoCD synchronise automatiquement

La seule différence est que les secrets sont stockés sous forme de fichiers chiffrés. Lorsqu'un opérateur doit ajouter ou mettre à jour un secret :

```bash
# Déchiffrer le fichier de secrets
sops helmfile/environments/default/secrets.enc.yaml

# Modifier le fichier (s'ouvre dans $EDITOR)
# Lors de la sauvegarde, SOPS rechiffre automatiquement

# Commiter
git add helmfile/environments/default/secrets.enc.yaml
git commit -m "feat(secrets): update Keycloak admin password"
git push
```

La CLI `sops` gère le déchiffrement et le rechiffrement de manière transparente. Les opérateurs ne voient ou ne manipulent jamais les secrets en clair à moins d'avoir la clé privée age.

### Rotation des secrets

Faire tourner un secret est aussi simple que :

```bash
sops helmfile/environments/default/secrets.enc.yaml
# Modifier la valeur sur place
# Sauvegarder → automatiquement rechiffré

# Ou faire tourner toutes les clés de chiffrement de données :
sops --rotate helmfile/environments/default/secrets.enc.yaml
```

### Reprise après sinistre

La préoccupation opérationnelle la plus importante : **sauvegardez la clé privée age.** Ce seul fichier (`~/.age/opendesk-edu.txt`) contrôle l'accès à tous les secrets chiffrés. Sans lui, vous ne pouvez déchiffrer aucun fichier `.enc.yaml`.

Notre guide de reprise après sinistre inclut désormais la récupération de la clé SOPS comme première étape dans l'ordre de récupération (priorité P0, avant le stockage et les bases de données).

## Les 126 secrets chiffrés : en chiffres

| Priorité | Nombre | Catégories |
|----------|-------|------------|
| P0 (Critique) | 97 | Admin Keycloak, racines DB, auth relais mail, admin LDAP |
| P1 (Élevée) | 16 | Secrets clients OIDC, identifiants SMTP, jetons API |
| P2 (Moyenne) | 8 | Auth Redis, mots de passe DB réplica, clés de cache |
| P3 (Faible) | 5 | Clés Ceph, jetons de service, identifiants de surveillance |
| **Total** | **126** | |

Chaque valeur est individuellement chiffrée avec AES-256-GCM. Aucune deux valeurs ne partagent un nonce. La clé de chiffrement de données au niveau du fichier est unique par fichier, enveloppée avec la clé publique age.

## Pourquoi c'est important pour GitOps

Cette approche préserve les principes fondamentaux de GitOps :

- **Git est la source unique de vérité** — chaque valeur secrète a un commit Git
- **Déploiement déclaratif** — ArgoCD gère tout de manière autonome
- **Aucune dépendance d'infrastructure** — pas de Vault, pas de fournisseur cloud, pas de service externe
- **Piste d'audit** — `git log` montre exactement qui a changé quel secret et quand
- **Reproductible** — un nouveau cluster peut être amorcé à partir de Git seul (avec la clé age)

## Leçons apprises

1. **Les montages de volumes sont la partie la plus délicate** — Le sidecar CMP a besoin d'accéder au même checkout de dépôt que le repo-server principal. Le montage de volume `tmp` partagé est essentiel.

2. **La configuration du proxy est importante** — Sur le cluster HRZ, le conteneur init `install-sops` avait besoin des variables d'environnement `HTTP_PROXY` et `HTTPS_PROXY` pour télécharger le binaire sops.

3. **La mise en cache du plugin peut causer des secrets obsolètes** — Si une synchronisation précédente est mise en cache dans Redis, ArgoCD peut ne pas réexécuter le plugin après une mise à jour de secret. Forcer une vidange du cache (`redis-cli FLUSHALL`) ou augmenter le hash du commit résout ce problème.

4. **Tester d'abord avec un secret factice** — Nous avons commité un `test-secret.enc.yaml` inoffensif et vérifié de bout en bout avant de chiffrer de véritables identifiants de production.

5. **Sauvegarder la clé age à plusieurs endroits** — Ce seul fichier est la racine de confiance pour tous les secrets. Le perdre signifie perdre l'accès à chaque valeur chiffrée.

## Prochaines étapes

L'intégration SOPS est fondamentale pour notre version v1.1. Maintenant que la gestion des secrets est résolue, nous pouvons :

- **Définir les exigences de secret pour chaque service** — chaque chart Helm déclare exactement de quels secrets il a besoin
- **Auditer la couverture des secrets** — des vérifications automatisées garantissent qu'aucun service ne référence un secret non défini
- **Faire tourner les secrets selon un calendrier** — en utilisant les métadonnées SOPS (horodatage de chiffrement) pour suivre les fenêtres de rotation
- **Étendre aux pipelines CI/CD** — les jobs GitLab CI peuvent déchiffrer les secrets pour les tests d'intégration

Le guide d'intégration complet est disponible dans notre dépôt à [`docs/developer/sops-argocd-integration.md`](https://github.com/opendesk-edu/opendesk-edu/blob/main/docs/developer/sops-argocd-integration.md), et les secrets chiffrés se trouvent dans `helmfile/environments/*/secrets*.enc.yaml`.

---

*La gestion des secrets basée sur SOPS fait partie de la version openDesk Edu v1.1. Pour la feuille de route complète v1.1, consultez notre [plan de version](https://github.com/opendesk-edu/opendesk-edu/blob/main/docs/v1.1-release-checklist.md).*

**openDesk Edu : Technologie éducative open-source souveraine, intégrée et prête pour la production.**
