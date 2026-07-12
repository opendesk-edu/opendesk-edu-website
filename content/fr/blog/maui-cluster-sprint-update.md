---
title: "Sprint 1 Terminé : Correctifs d'Infrastructure sur le Cluster Maui"
date: "2026-06-17"
description: "Le Sprint 1 du plan de remédiation du cluster Maui est terminé — le PVC slidev bloqué est résolu, SOGo migré vers le bon espace de noms, les classes de stockage auditées et les tests de fumée passent pour tous les services cœur."
image: "/static/blog/maui-cluster-sprint-update-teaser.svg"
categories: ["Statut"]
tags: ["maui", "kubernetes", "sprint", "infrastructure", "cluster", "k3s"]
---

# Sprint 1 Terminé : Correctifs d'Infrastructure sur le Cluster Maui

> **PVC slidev débloqué. SOGo migré. Classes de stockage auditées sur 31 déploiements. Tous les tests de fumée au vert.**

Le 14 juin, nous avons publié le [plan de sprint du cluster Maui](/fr/blog/hrz-maui-cluster-progress) — quatre sprints pour combler l'écart sur six services manquants et durcir l'infrastructure. Aujourd'hui, nous rapportons que le Sprint 1 est terminé et que le travail sur le Sprint 2 est déjà en cours.

## Ce Qui a Été Corrigé

### PVC slidev : Débloqué

Le PersistentVolumeClaim de slidev était bloqué à l'état `Pending` depuis le déploiement initial. La cause racine était une annotation StorageClass manquante sur le PVC — il référençait `ceph-rbd-ssd` mais le champ `spec.storageClassName` était vide, ce qui a fait que le provisionneur CSI l'a complètement ignoré.

**Correctif appliqué :**
- Suppression du PVC bloqué (aucune perte de données — slidev est sans état)
- Recréation avec `storageClassName: ceph-rbd-ssd` explicite
- Pod programmé immédiatement après la liaison du PVC
- Le service répond à `slides.opendesk.hrz.uni-marburg.de`

### Migration de l'Espace de Noms SOGo

SOGo était déployé dans l'espace de noms `demo` lors des tests initiaux — un vestige de la phase de prototypage. Nous l'avons migré vers `opendesk-edu` pour nous aligner sur les conventions de nommage du cluster.

**Étapes de migration :**
1. Export de la base de données PostgreSQL de SOGo depuis l'espace de noms `demo`
2. Redéploiement du chart SOGo avec `namespace: opendesk-edu`
3. Restauration de la base de données dans le nouvel espace de noms
4. Mise à jour de l'ingress pour pointer vers le nouveau point de terminaison du service
5. Suppression de l'ancien déploiement de l'espace de noms `demo`

La propagation DNS a pris ~2 minutes ; le service est stable depuis.

### Audit des Classes de Stockage

Chaque PVC sur les 31 déploiements dans les espaces de noms `opendesk` et `opendesk-edu` a été audité pour une affectation correcte de StorageClass :

| StorageClass | Objectif | PVCs | Statut |
|---|---|---|---|
| `ceph-rbd-ssd` | RWO rapide (bases de données, stateful sets) | 18 | ✅ Tous corrects |
| `ceph-cephfs-hdd-ec` | RWX lent à effacement (fichiers) | 9 | ✅ Tous corrects |
| `local-path` | Temporaire/scratch (K3s par défaut) | 3 | ✅ Tous corrects |

Aucune mauvaise configuration n'a été trouvée au-delà du PVC slidev — confirmant que les templates de déploiement initiaux étaient sains.

### Tests de Fumée

Une suite complète de tests de fumée a été exécutée sur les 31 déploiements :

- Les 31 déploiements affichent un statut `READY`
- Tous les ingresses retournent HTTP 200 ou 302 (redirection SSO)
- Le flux de connexion Keycloak OIDC fonctionne pour Nextcloud, OpenProject, XWiki et BookStack
- La planification de sauvegarde K8up s'est exécutée avec succès : 33 instantanés poussés vers S3
- Les cibles Prometheus sont toutes saines, les tableaux de bord Grafana n'affichent aucune alerte critique

## Sprint 2 : En Cours

Les correctifs d'infrastructure étant terminés, le Sprint 2 cible trois services manquants :

| Service | Type de Chart | Dépendances | Statut |
|---|---|---|---|
| Zammad | Chart local | PostgreSQL, Elasticsearch, Redis | 🟡 En cours |
| Overleaf | Chart amont | Redis, MongoDB | 🟡 En cours |
| KasmVNC | Chart amont | — | ⏳ En file d'attente |

Le déploiement de Zammad est le plus complexe — il nécessite trois bases de données dépendantes et un routage d'ingress approprié pour ses mises à jour de tickets en temps réel. Nous adaptons le chart depuis `charts-upgrade-v1.12.0/zammad` avec le même motif de retrait de sous-chart PostgreSQL utilisé pour Etherpad.

## Prochaines Étapes

- **Sprint 3** (objectif : cette semaine) : Entrées du portail (chart configmap uniquement) et Snipr (construction Dockerfile requise)
- **Sprint 4** : Durcissement, documentation et audit complet des ingresses

Le cluster Maui exécute maintenant **41 pods** sur **32 déploiements** — contre 39 pods et 31 déploiements le 14 juin. Nous sommes en bonne voie pour une préparation complète à la production d'ici la fin juin.

Vous souhaitez déployer openDesk Edu dans votre université ? Consultez notre [guide de démarrage](/fr/docs/deployment) et notre [dépôt](https://codeberg.org/opendesk-edu/opendesk-edu).

### Partager cet article

Copier le lien [LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fopendesk-edu.org%2Fen%2Fblog%2Fmaui-cluster-sprint-update) [Matrix](https://matrix.to/#/https%3A%2F%2Fopendesk-edu.org%2Fen%2Fblog%2Fmaui-cluster-sprint-update)
