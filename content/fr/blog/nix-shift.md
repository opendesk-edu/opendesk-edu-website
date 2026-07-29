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

## Pourquoi Nix ?

Nix est purement fonctionnel. Chaque construction est déterministe et mise en cache.

**Avant :** `helmfile sync → helm template → Go templates → YAML → kubectl apply`
**Après :** `nix build .#nom-service → Nix pur → JSON → kubectl apply`

## Les Résultats

| Métrique | Helmfile | Nix |
|----------|----------|-----|
| Déploiement complet | ~3 min | ~30s (1er) / ~2s (caché) |
| Clarté des erreurs | "failed to render" | "ligne 12: variable inconnue" |
| Déterministe | Non | Oui |
| Services | 28 | 28 |
| Lignes par service | ~80 | ~5 |
