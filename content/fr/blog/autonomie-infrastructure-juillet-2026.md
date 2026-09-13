---
title: "Autonomie d'infrastructure — rapport d'avancement juillet 2026"
date: "2026-07-28"
description: "Stalwart v0.16 remplace Postfix, tous les services connectés via SSO Keycloak, ArgoCD GitOps étendu, et des dépôts d'infrastructures propres créés pour découpler des registres externes."
categories: ["Infrastructure"]
tags: ["stalwart", "oidc", "keycloak", "argocd", "gitops", "monitoring"]
image: "/static/blog/infrastructure-autonomy-july-2026-teaser.svg"
---

# Autonomie d'infrastructure — rapport d'avancement juillet 2026

Le déploiement openDesk Edu a franchi ce mois-ci deux jalons majeurs : l'intégration SSO complète de tous les services et une autonomie d'infrastructure largement rétablie vis-à-vis des registres externes.

## Stalwart v0.16 remplace Postfix

Après des mois de planification, Stalwart Mail Server a été mis à jour de v0.15 vers **v0.16.15** et a pris le rôle de principal serveur de transfert de courrier (MTA). Postfix a été désactivé.

**Nouveautés :**
- **9 écouteurs** — SMTP (25), Submission (587), IMAP (143, 993), POP3 (110, 995), Sieve (4190) et JMAP (8080) — tous actifs
- **Format de configuration** — passage de TOML à JSON avec backend RocksDB
- **Chemins** — unifiés vers `/var/lib/stalwart/` (données) et `/etc/stalwart/config.json` (configuration)
- **Sondes** — bascule de httpGet (aucun point de terminaison `/api/health` dans v0.16) vers des sondes TCP-socket
- **Sécurité** — `allowPrivilegeEscalation=true`, `capabilities.drop` vide (requis pour v0.16 sur K3s v1.32.3)

Les services utilisent désormais Stalwart comme relais SMTP :
- SOGo — `smtp://stalwart-stalwart:587`
- OpenCloud — `stalwart-stalwart.opendesk.svc.cluster.local:587`
- Tous les autres services émetteurs de notifications

## SSO unifié via Keycloak

Chaque service s'authentifie désormais via le realm Keycloak central (`opendesk`) :

| ID client | Service | Statut |
|-----------|---------|--------|
| `opendesk-opencloud` | Cloud OpenCloud | ✅ |
| `stalwart` | Serveur mail Stalwart | ✅ |
| `sogo` | Groupware SOGo | ✅ |
| `opendesk-matrix` | Chat Element/Synapse | ✅ |
| `opendesk-xwiki` | Base de connaissances XWiki | ✅ |
| `univention/oidc` | Portail (Nubus) | ✅ |

Le chart de bootstrap Keycloak (`opendesk-keycloak-bootstrap`) a été réparé (problème DNS `ums-keycloak..svc.cluster.local` → `ums-keycloak.opendesk.svc.cluster.local`) et crée désormais automatiquement tous les clients OIDC et scopes personnalisés.

## Extension ArgoCD GitOps

La gestion ArgoCD est passée de 2 à **27 applications Edu** en convertissant les apps basées CMP (plugin Helmfile) en apps enfants basées Helm :

- **Basé Helm (géré)** — opencloud, stalwart, sogo, etherpad, portal-entries (5)
- **CE-géré (Synced)** — 22 apps
- **Basé CMP (cosmétique Unknown)** — 23 apps Edu (fonctionnent parfaitement, le statut de sync est cosmétique)

**Défis :**
- Corrections de charts — modèle `fullname` manquant dans `_helpers.tpl` (ilias, etherpad)
- Le tag `bitnami/kubectl:1.32` n'existe pas (404) — remplacé par une image maison
- Les conteneurs d'init ne fonctionnent pas en réseau cloisonné — `initSchema` désactivé
- Les hooks Helm avec images de registre OCI bloquent le sync — option `skipOidcHook` ajoutée

## Dépôts d'infrastructure propres

Pour découpler des registres externes inaccessibles depuis le réseau du cluster, quatre dépôts indépendants ont été créés :

| Dépôt | GitHub | GitLab | Objectif |
|-------|--------|--------|----------|
| **opendesk-kubectl** | [tobias-weiss-ai-xr/opendesk-kubectl](https://github.com/tobias-weiss-ai-xr/opendesk-kubectl) | [tbsweiss/opendesk-kubectl](https://gitlab.com/tbsweiss/opendesk-kubectl) | kubectl minimal (~30 Mo, basé Alpine) |
| **opendesk-helm-charts** | [tobias-weiss-ai-xr/opendesk-helm-charts](https://github.com/tobias-weiss-ai-xr/opendesk-helm-charts) | [tbsweiss/opendesk-helm-charts](https://gitlab.com/tbsweiss/opendesk-helm-charts) | Charts corrigés + outils de miroir OCI |
| **opendesk-sogo-image** | [tobias-weiss-ai-xr/opendesk-sogo-image](https://github.com/tobias-weiss-ai-xr/opendesk-sogo-image) | [tbsweiss/opendesk-sogo-image](https://gitlab.com/tbsweiss/opendesk-sogo-image) | SOGo avec prise en charge OIDC/SSO |
| **opendesk-collab-dashboard** | [tobias-weiss-ai-xr/opendesk-collab-dashboard](https://github.com/tobias-weiss-ai-xr/opendesk-collab-dashboard) | [tbsweiss/opendesk-collab-dashboard](https://gitlab.com/tbsweiss/opendesk-collab-dashboard) | Tableau de bord de tous les services Edu |

Chaque dépôt contient : Dockerfile avec métadonnées et licence, Makefile avec cibles `build` et `push`, pipelines GitHub Actions et GitLab CI, et un README détaillé.

L'image kubectl a été poussée vers `registry.gitlab.com/tbsweiss/opendesk-kubectl:1.32.3` et `registry.opendesk-edu.org/opendesk/kubectl`, remplaçant `bitnami/kubectl` (tag 1.32 introuvable) ainsi que `lachlanevenson/k8s-kubectl`.

## Surveillance et sauvegardes

- **28/29 tests contractuels réussis** (1 sauté : détection de version Stalwart, cosmétique)
- **11 règles d'alarme Prometheus** pour l'état des services, l'épuisement des quotas, les erreurs de sauvegarde
- **Opérateur k8up** — 0 redémarrages, binaire fourni via conteneur d'init
- **Plans de sauvegarde** — `backup-live` (PVC RWX, quotidien 00:42), `backup-stalwart` (RWO via label, quotidien 01:00)
- Les 29 PVC RWO annotés avec `k8up.io/exclude: true`

## Perspectives

- **Relais Smarthost** — configurer la livraison Stalwart via le relais MX universitaire
- **Miroirs OCI de charts Helm** — transférer les charts en cache vers le registre de conteneurs GitLab
- **Registre de conteneurs GitHub** — corriger les autorisations PAT pour les pushs ghcr.io
- **Autres conversions ArgoCD** — basculer les apps CMP restantes vers Helm
- **Optimisation des performances** — optimisation des ressources pour 76+ services en cours d'exécution

---

*Exploité sur K3s v1.32.3 · 9 nœuds · stockage Ceph-CSI · cluster de production*