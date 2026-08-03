---
title: "Le Nix Shift: Pourquoi nous avons remplacé Helmfile par des fonctions pures"
date: "2026-07-29"
description: "Comment nous avons remplacé Helmfile par Nix pour des déploiements Kubernetes déterministes, mis en cache et composables sur 28 services."
categories: ["Engineering"]
tags: ["nix", "kubernetes", "helmfile", "devops"]
image: "/static/blog/nix-shift-teaser.svg"
---

# Le Nix Shift: Pourquoi nous avons remplacé Helmfile par des fonctions pures

## Le Problème

Nous gérions openDesk Edu — 28 services sur 9 nœuds K3s — avec Helmfile et ses templates Go. Chaque déploiement apportait son lot d'angoisses :

```
failed to render values file "values-grommunio.yaml.gotmpl":
  template: stringTemplate:17: unexpected "\\" in operand
```

Cette erreur bloque la **totalité** des 28 services, pas un seul. Parce que Helmfile traite tous les templates en une seule étape, une simple erreur de syntaxe YAML arrête toute la mise à jour du cluster.

Les symptômes étaient toujours les mêmes :

- **Défaillances en cascade** — une faute de frappe dans `values-grommunio.yaml.gotmpl` paralysait tout le déploiement, même si seul Moodle avait besoin d'une mise à jour.
- **Messages d'erreur opaques** — Helmfile masque le contexte réel. Au lieu de « ligne 12, colonne 3 : variable non définie », nous obtenions des traces de pile Go cryptiques.
- **Aucune garantie de cache** — `helmfile sync` re-rendait chaque template à chaque fois, même si rien n'avait changé pour un service donné. Avec 28 services, cela représentait ~3 minutes de rendu pur.
- **Difficile à reproduire** — le même commit produisait des résultats différents sur le CI qu'en local, car Helmfile absorbe implicitement les variables d'environnement et les fichiers `.env`.

## Pourquoi Nix ?

Nix est purement fonctionnel. Chaque construction est déterministe et mise en cache. Au lieu de templates impératifs rendus à l'exécution, nous décrivons chaque service comme une **fonction pure** — entrée, manifeste en sortie, aucun effet de bord.

**Avant :** `helmfile sync → helm template → Go templates → YAML → kubectl apply`
**Après :** `nix build .#nom-service → Nix pur → JSON → kubectl apply`

La différence clé : Nix **met en cache** chaque résultat. Si rien n'a changé pour un service, il est chargé depuis le store Nix en ~2 secondes — sans rendu, sans recalcul.

## L'Architecture

Chaque service est une fonction Nix qui renvoie un manifeste Kubernetes (en JSON) :

```nix
# flake.nix (simplifié)
{
  outputs = { self, nixpkgs, ... }: {
    apps.moodle = mkK8sApp {
      name = "moodle";
      image = "ghcr.io/opendesk-edu/moodle-shib:v1.4.0";
      port = 8080;
      replicas = 2;
      env = {
        MOODLE_DB_HOST = "mariadb";
        MOODLE_DB_NAME = "moodle";
      };
      ingress = {
        host = "moodle.opendesk-edu.org";
        tls = true;
      };
    };

    apps.ilias = mkK8sApp {
      name = "ilias";
      image = "ghcr.io/opendesk-edu/ilias-shibboleth:9-php8.2-apache";
      # ...
    };

    # 26 autres services ...
  };
}
```

La fonction utilitaire `mkK8sApp` génère un Deployment, un Service, un Ingress et des ConfigMaps optionnels — le tout sous forme de dérivations Nix typées. Les erreurs apparaissent à la **construction**, pas à l'**exécution**.

## Les Résultats

| Métrique | Helmfile | Nix |
|----------|----------|-----|
| Déploiement complet | ~3 min | ~30s (1er) / ~2s (caché) |
| Clarté des erreurs | « failed to render » | « ligne 12: variable inconnue » |
| Déterministe | Non | Oui |
| Services | 28 | 28 |
| Lignes par service | ~80 | ~5 |
| Reproductibilité | Dépendante de l'environnement | Identique bit pour bit |
| Rollback | Manuel (helm rollback) | `nix flake lock --revision` |

## Migration : Étape par Étape

La migration a été incrémentale — pas de big bang, mais service par service :

1. **Double fonctionnement** — Helmfile et Nix tournaient en parallèle au début. Les nouveaux services étaient définis directement en Nix ; les existants restaient sur Helmfile.
2. **Tests de parité** — pour chaque service migré, nous comparions les manifestes Nix et Helmfile avec `diff`. Ce n'est qu'à sortie identique que nous basculions le service.
3. **Verrouillage des flakes** — `flake.lock` épingle toutes les entrées (version nixpkgs, digests d'images, hashes de config). Un rollback est un `git revert` du fichier de verrouillage.
4. **Intégration CI** — GitHub Actions construit chaque service avec `nix build` et pousse les manifestes JSON. `kubectl apply` est idempotent et prend des secondes.

## Leçons Apprises

**Ce qui a bien fonctionné :**
- Migration incrémentale — aucun risque pour les services en cours d'exécution
- Le store Nix comme cache de build — 90 % des services sont mis en cache à chaque déploiement
- JSON au lieu de YAML — pas d'erreurs d'indentation, pas de langage de template

**Ce qui nous a surpris :**
- La courbe d'apprentissage de Nix est réelle, mais la surface dont nous avons réellement besoin (`mkK8sApp`, `flake.lock`, `nix build`) est gérable
- Les builds CI sont devenus **plus rapides**, pas plus lents — grâce au cache
- Le débogage est plus agréable : `nix build` donne des erreurs exactes avec numéros de ligne ; Helmfile donne des traces de pile Go

**Ce que nous éviterions :**
- Pas de conditions `if` dans les expressions Nix pour les différences d'environnement — à la place, des flakes séparés par environnement (`flake.prod.nix`, `flake.staging.nix`)
- Pas de secrets en ligne — les secrets restent dans les Kubernetes Secrets, pas dans le store Nix

## Perspectives

Nix a transformé notre pipeline de déploiement d'une chaîne de templates fragile en un pipeline de build déterministe. Les 28 services d'openDesk Edu peuvent désormais être déployés en secondes plutôt qu'en minutes — et chaque build est reproductible jusqu'au dernier bit.

La prochaine étape : **NixOS comme image de base** pour les services eux-mêmes, pas seulement pour les manifestes. Ainsi, non seulement le déploiement serait déterministe, mais aussi l'environnement d'exécution.

---

*openDesk Edu est la variante éducative d'[openDesk](https://opendesk.eu), étendue avec 25 services pour la recherche et l'enseignement. Les charts et la plateforme communautaire sont disponibles sur [opencode.de](https://opencode.de).*
