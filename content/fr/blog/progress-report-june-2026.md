---
title: "Rapport d'Avancement : openDesk Edu au HRZ Maui — Juin 2026"
date: "2026-06-04"
description: "Après cinq mois de déploiement et deux sprints de durcissement, openDesk Edu fonctionne à pleine capacité opérationnelle à l'Université de Marbourg. Voici ce que nous avons accompli et la suite — y compris l'intégration amont dans le cluster principal openDesk HRZ."
categories: ["Statut"]
tags: ["deployment", "infrastructure", "kubernetes", "sprint", "university-of-marburg"]
image: "/static/blog/progress-report-june-2026-teaser.png"
---

# Rapport d'Avancement : openDesk Edu au HRZ Maui — Juin 2026

> **57 pods en cours d'exécution. 33 services avec SSO unifié. 44 clients Keycloak audités et migrés.**
> Sauvegardes k8up actives, tableaux de bord Grafana déployés, et tous les ingresses consolidés sous un seul domaine.

Depuis le déploiement d'openDesk Edu sur le cluster HRZ Maui (K3s v1.32.3, 9 nœuds, Debian 12), nous avons réalisé deux sprints de durcissement ciblés (Sprints 5–6) axés sur la stabilité opérationnelle, la consolidation du domaine et la santé des services.

## Aperçu du Cluster

| Métrique | Valeur |
|:---------|:-------|
| Cluster | K3s v1.32.3, 9 nœuds (3 CP, 6 workers) |
| Domaine | `*.opendesk.hrz.uni-marburg.de` |
| Ingress | Contrôleur HAProxy (192.168.3.201) |
| Stockage | Ceph RBD SSD (RWO), CephFS HDD EC (RWX) |
| SSO | Keycloak OIDC + SAML, 44 clients |
| Sauvegardes | k8up / restic → S3, quotidien à 01:22, rétention 14 jours |
| Supervision | Prometheus + Grafana (12.4.1) |

## Ce Qui a Été Corrigé

### Audit SSO (Sprint 5)
Les 44 clients Keycloak du realm `opendesk` ont été audités et migrés de l'ancien domaine `opendesk-edu.org` vers `opendesk.hrz.uni-marburg.de`. Chaque URI client, URL de redirection et émetteur a été vérifié via l'API d'administration Keycloak.

### Migration de Domaine
Douze ingresses (3 portail, 9 fichiers statiques) ont été migrés de `*.opendesk-edu.org` vers `*.opendesk.hrz.uni-marburg.de`. La source de l'ancien domaine codé en dur — `portal-saml-multidomain.yaml.gotmpl` — a été corrigée au niveau du chart et validée.

### Réparations de Services

| Service | Problème | Correctif |
|:--------|:---------|:----------|
| **Planka** | Classe d'ingress `nginx` (aucun contrôleur), les points de terminaison OIDC contenaient une syntaxe de template `.gotmpl` non rendue | Corrigé vers `haproxy`, URLs OIDC définies via `--set` |
| **SSP** | Le backend d'ingress pointait vers un nom de service inexistant | Le template du chart était déjà corrigé ; mise à niveau appliquée |
| **Chart Planka** | `values.yaml` contenait des expressions `.gotmpl` helmfile qui cassent les déploiements `helm` directs | Remplacées par des chaînes vides ; points de terminaison définis au moment du déploiement |

### Infrastructure
- L'opérateur **k8up** déployé dans l'espace de noms `opendesk`. La planification de sauvegarde `backup-edu` s'exécute quotidiennement à 01:22 avec une rétention de 14 jours. 33 instantanés confirmés dans S3.
- Tableaux de bord **Grafana** déployés pour la santé des services edu, l'aperçu des sauvegardes k8up et l'aperçu du cluster.
- **DNS Externe** — script généré pour 12 services reposant encore sur la résolution `/etc/hosts` (n8n, code, collab, draw, jupyter, limesurvey, typo3, zammad, r, slides, term, ai).

## État de Santé Actuel des Services

Tous les services cœur répondent correctement :

| Service | Point de terminaison | Statut |
|:--------|:--------------------|:-------|
| Moodle LMS | `moodle.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| ILIAS LMS | `lms.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| JupyterHub | `jupyter.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| BookStack | `bookstack.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| OpenProject | `projects.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| Element (Chat) | `chat.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| Jitsi (Meet) | `meet.opendesk.hrz.uni-marburg.de` | ✅ 200 |
| Nextcloud (Fichiers) | `files.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| OX App Suite (Mail) | `webmail.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| XWiki | `wiki.opendesk.hrz.uni-marburg.de` | ✅ 302 (SSO redirect) |
| Planka | `planka.opendesk.hrz.uni-marburg.de` | ✅ 200 avec OIDC |
| SSP | `ssp.opendesk.hrz.uni-marburg.de` | ✅ 403/200 (auth OIDC) |

## Intégration Amont dans le Cluster openDesk

Le 1er juin, les 20+ services opendesk-edu ont été intégrés en amont dans le déploiement du cluster HRZ principal d'openDesk. Les charts, valeurs et configuration des services edu font maintenant partie du pipeline helmfile d'openDesk — se déployant aux côtés de l'infrastructure cœur d'openDesk et partageant le même contrôleur d'ingress, la même pile de supervision et les mêmes planifications de sauvegarde.

**Services intégrés :**

| Type | Services |
|:-----|:---------|
| Charts locaux | Etherpad, BookStack, Planka, Zammad, LimeSurvey, Draw.io, Excalidraw, Self-Service-Password, SOGo, RStudio, ttyd, Slidev, Collab Dashboard, Entrées du Portail |
| Charts externes | JupyterHub, Open WebUI, Code-Server, Dask, Ollama |
| Reportés (auth en attente) | Overleaf, KasmVNC, TYPO3, Grommunio |

Cette intégration élimine l'espace de noms `opendesk-edu` séparé et place les services edu sous une gestion de cluster unifiée — les mêmes tableaux de bord Grafana, les mêmes politiques de rétention des sauvegardes k8up, les mêmes règles d'ingress HAProxy. Le dépôt `opendesk-edu` reste la source de vérité pour les valeurs de chart et la documentation spécifiques à edu, mais l'exécution au moment du déploiement réside maintenant dans le pipeline principal d'openDesk.

## Perspectives de la Feuille de Route

Les sprints de durcissement étant terminés et l'intégration amont en cours, l'accent se déplace maintenant vers :

1. **Résolution DNS externe** — remettre le script d'enregistrement DNS généré aux administrateurs réseau du HRZ pour supprimer la dépendance `/etc/hosts` pour 12 services
2. **Pipeline Helmfile** — cibler `helmfile sync` sur le cluster openDesk principal (plus l'espace de noms `opendesk-edu` séparé) ; la fusion amont du 1er juin a déjà posé les bases
3. **Tests de connexion complets** — validation de bout en bout du flux OIDC/SAML pour tous les services
4. **Éléments de la v1.1** — tests de fédération SAML DFN-AAI, pipeline de construction d'images conteneur, vérification de la déconnexion par canal de retour, intégrations des charts en attente d'authentification

Vous souhaitez déployer openDesk Edu dans votre université ? Consultez notre [guide de démarrage](/fr/docs/deployment) et notre [dépôt](https://codeberg.org/opendesk-edu/opendesk-edu).
