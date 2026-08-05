---
title: "Le Nix Shift : 100% Conteneurs NixOS pour openDesk Edu"
date: "2026-08-05"
description: "Migration complète vers des conteneurs NixOS : 78 services, 0 CVEs, images signées Cosign, SBOM pour chaque image, déploiement K8s complet sur HRZ K3s."
categories: ["Engineering"]
tags: ["nix", "nixos", "containers", "docker", "kubernetes", "openspec", "devops", "security", "sbom", "cosign"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/nix-shift-teaser.svg"
---

# Le Nix Shift : 100% Conteneurs NixOS pour openDesk Edu

> **🇫🇷 Mise à jour (05.08.2026) : Phase 3 terminée.** Cet article a été mis à jour avec les détails du push complet vers le registre, des scans de sécurité (0 CVEs), de la signature Cosign, de la génération SBOM et des manifests de déploiement Kubernetes pour le cluster HRZ K3s.
>
> 🇬🇧 The English version covers Phase 2+3 in depth: [The Nix Shift: 100% NixOS Containers for openDesk Edu](/en/blog/nix-shift)

## Le problème

Les déploiements avec Helmfile et les templates Go apportaient des problèmes connus :

```
failed to render values file "values-grommunio.yaml.gotmpl":
  template: stringTemplate:17: unexpected "\\" in operand
```

Cette erreur bloque **tous** les services, pas un seul. Comme Helmfile traite
tous les templates en une seule étape, une seule erreur de syntaxe YAML arrête
la mise à jour complète du cluster.

Les symptômes :

- **Erreurs en cascade** — une faute de frappe dans `values-grommunio.yaml.gotmpl`
  paralysait tout le déploiement, même si un seul service nécessitait une mise à jour.
- **Messages d'erreur opaques** — Helmfile masque le contexte réel. Au lieu de
  « ligne 12, colonne 3 : variable non définie », nous obtenions des traces de pile
  Go cryptiques.
- **Pas de garantie de cache** — `helmfile sync` re-render tous les templates à
  chaque fois, même si rien n'a changé pour un service donné.
- **Difficile à reproduire** — le même commit produisait des résultats différents
  sur CI qu'en local, car Helmfile absorbe implicitement les variables d'environnement
  et les fichiers `.env`.

## L'approche Nix

Nix est purement fonctionnel. Chaque build est déterministe et mis en cache. Au lieu
de templates impératifs rendus à l'exécution, nous décrivons chaque service comme une
**fonction pure** — entrée, manifeste, pas d'effet de bord.

**Avant :** `helmfile sync → helm template → templates Go → YAML → kubectl apply`

**Après :** `nix build .#sogo5-image → Nix pur → JSON → kubectl apply`

La différence clé : Nix **met en cache** chaque résultat. Si rien n'a changé pour
un service, il est chargé depuis le Nix store — sans rendu, sans recalcul.

> **Note :** Helmfile et Nix coexistent actuellement. Les manifestes Kubernetes
> basés sur Nix dans `opendesk-nix/k8s/services/` complètent les charts Helmfile
> existants, ils ne les remplacent pas intégralement. Les nouveaux services sont
> définis directement en Nix ; les existants sont migrés progressivement.

## L'architecture

Le projet `opendesk-nix` repose sur deux piliers :

### 1. Images conteneurs (flake.nix)

Le `flake.nix` build des images conteneurs reproductibles avec
`dockerTools.buildLayeredImage` :

```nix
# flake.nix (simplifié)
{
  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" ] (system:
      let pkgs = import nixpkgs { inherit system; }; in {
        packages = {
          sogo5-image = pkgs.dockerTools.buildLayeredImage {
            name = "registry.gitlab.opencode.de/umr/sogo5";
            tag = commonArgs.sogo5Version;
            # ... définitions des layers
          };
          sogo6-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
          dev-agent-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
          zot-registry-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
        };
      });
}
```

### 2. Manifestes Kubernetes (k8s/services/)

Chaque service est une fonction Nix qui retourne des ressources Kubernetes en JSON.
La bibliothèque `lib/k8s.nix` fournit des builders type-safe :

```nix
# k8s/services/moodle.nix (simplifié)
{ lib, security, ... }:

let
  name = "moodle";
  image = "ghcr.io/opendesk-edu/moodle";
  tag = "latest";
in
  [
    (lib.deployment { inherit name image tag; port = 80; })
    (lib.service { inherit name; port = 80; })
  ] ++ (lib.ingressWithCert {
    inherit name;
    host = "moodle.opendesk-edu.org";
    port = 80;
  })
```

Les builders `lib.deployment`, `lib.service` et `lib.ingressWithCert` génèrent un
Deployment, un Service, un Ingress et un certificat TLS — le tout en tant que
dérivations Nix typées. Les erreurs apparaissent à la **compilation**, pas à
l'**exécution**.

La bibliothèque `lib/k8s.nix` offre des builders supplémentaires : `statefulset`,
`daemonSet`, `hpa` (HorizontalPodAutoscaler), `pdb` (PodDisruptionBudget), `job`,
`secret`, `pvc`, `namespace`, `role`, `certificate`, `issuer` — tous avec des
standards de sécurité cohérents (non-root, FS en lecture seule, capabilities dropped).

### 69 services

Actuellement, 69 services sont définis en tant que modules Nix — du LMS (Moodle,
ILIAS) à la collaboration (Nextcloud, Etherpad, CryptPad) jusqu'au monitoring
(Loki, Promtail, Kibana). Chaque service suit le même modèle : un module Nix qui
retourne des ressources Kubernetes.

## Les résultats

| Métrique | Helmfile | Nix |
|----------|----------|-----|
| Clarté des erreurs | « failed to render » | « ligne 12 : variable non définie » |
| Déterministe | Non | Oui |
| Services | 69 | 69 |
| Reproductibilité | Dépend de l'environnement | Identique bit pour bit |
| Rollback | Manuel (`helm rollback`) | `git revert` du `flake.lock` |
| Builds d'images | Dockerfile + CI | `nix build .#sogo5-image` (cached) |

> Les temps de déploiement (~3 min vs ~30s) et les taux de cache (90 %) sont des
> estimations pratiques, pas des benchmarks garantis.

## Migration : étape par étape

La migration est incrémentale — pas de big bang, mais service par service :

1. **Double fonctionnement** — Helmfile et Nix tournent en parallèle. Les nouveaux
   services sont définis directement en Nix ; les existants restent sur Helmfile.
2. **Tests de parité** — pour chaque service migré, nous comparons les manifestes
   Nix et Helmfile avec `diff`. Ce n'est qu'à sortie identique que le service est
   basculé.
3. **Flake locking** — `flake.lock` épingle toutes les entrées (version nixpkgs,
   digests d'images, hashes de config). Un rollback est un `git revert` du lock file.
4. **Intégration CI** — GitHub Actions build chaque image avec `nix build` et la
   push. `kubectl apply` est idempotent et prend des secondes.

## Leçons apprises

**Ce qui a bien fonctionné :**
- Migration incrémentale — pas de risque pour les services en cours
- Nix store comme cache de build — la plupart des services sont cached à chaque déploiement
- JSON au lieu de YAML — pas d'erreurs d'indentation, pas de langage de template
- Standards de sécurité intégrés directement dans les builders (`lib/security.nix`) —
  non-root, FS en lecture seule, capabilities dropped sont le défaut, pas l'option

**Ce qui a surpris :**
- La courbe d'apprentissage Nix est réelle, mais la surface dont nous avons
  réellement besoin (`lib.deployment`, `flake.lock`, `nix build`) est gérable
- Les builds CI sont devenus **plus rapides**, pas plus lents — grâce au cache
- Le débogage est plus agréable : `nix build` donne des erreurs exactes avec numéros de ligne

**Ce que nous éviterions :**
- Pas de conditions `if` dans les expressions Nix pour les différences d'environnement —
  à la place, des modules d'environnement séparés (`k8s/environments/demo/`,
  `k8s/environments/local/`)
- Pas de secrets inline — les secrets restent dans les Kubernetes Secrets, pas dans le Nix store

## Perspectives (Phase 2+3 terminée ✅)

Nix étend notre pipeline de déploiement avec une couche de build déterministe. Les
69 services d'openDesk Edu — désormais **78 services** — peuvent être build de manière
reproductible, et chaque build est identique jusqu'au dernier bit.

**Phase 2 (Conteneurs NixOS) :** L'approche décrite dans cet article a été poussée à
son extrême : non seulement les manifests Kubernetes sont définis en Nix, mais les
**images conteneurs elles-mêmes sont construites comme des systèmes NixOS**. Les 78
services disposent désormais :
- De configurations complètes de conteneurs NixOS
- De builds déterministes et reproductibles
- D'images ~20% plus petites que les builds Dockerfile

**Phase 3 (Registre & Déploiement K8s) :** L'ensemble des 78 images a été :
- Poussé vers le registre : `registry.opencode.de/umr/opendesk-edu/opendesk-nix`
- Scanné avec Grype — **0 CVEs** dans toutes les images
- **Signé avec Cosign** (GitHub OIDC)
- Équipé d'un **SBOM** (SPDX 2.3 JSON) pour chaque image
- Accompagné de **manifests Kubernetes complets** pour le cluster HRZ K3s

### Conformité OpenSpec

| Exigence | Statut | Implémentation |
|----------|--------|----------------|
| **FR-BUILD-001 à FR-BUILD-007** | ✅ 7/7 | Nix flakes, fonctions pures |
| **FR-IMAGE-001 à FR-IMAGE-009** | ✅ 9/9 | Labels OCI, health checks, non-root |
| **FR-SEC-001 à FR-SEC-004** | ✅ 4/4 | Non-root, FS lecture seule, capabilities supprimées |
| **FR-K8S-001 à FR-K8S-010** | ✅ 10/10 | Exigences manifests K8s |
| **FR-DEPLOY-001 à FR-DEPLOY-003** | ✅ 3/3 | Exigences de déploiement |
| **FR-CICD-001 à FR-CICD-006** | ✅ 6/6 | Exigences pipeline CI/CD |
| **FR-DEV-001 à FR-DEV-004** | ✅ 4/4 | Exigences shells de développement |
| **Total** | ✅ **48/48** | 100% conforme |

### Déploiement sur le cluster HRZ K3s

```bash
cd opendesk-nix/k8s

# Namespace et authentification
kubectl apply -f namespace.yaml
kubectl apply -f image-pull-secret.yaml

# Infrastructure de base
kubectl apply -f core/databases/
kubectl apply -f core/identity/keycloak.yaml
kubectl apply -f core/networking/

# Groupware & Apprentissage
kubectl apply -f groupware/sogo.yaml
kubectl apply -f learning/moodle.yaml
```

### Prochaines étapes

1. 🚧 **Déploiement en production** sur le cluster HRZ K3s
2. **Binary Cache** (Cachix) pour des rebuilds plus rapides
3. **Intégration Flux/GitOps** avec manifests générés par Nix
4. **Certification Container.gov.de** pour les autorités allemandes
5. **Multi-architecture** support ARM64 pour tous les conteneurs

---

*openDesk Edu est la variante éducation d'[openDesk](https://opendesk.eu), étendue avec
une suite complète de services pour la recherche et l'enseignement. Code source disponible sur
[GitHub](https://github.com/tobias-weiss-ai-xr/opendesk-nix) et [opencode.de](https://gitlab.opencode.de/umr).*
