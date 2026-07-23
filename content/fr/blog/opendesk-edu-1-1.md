---
title: "openDesk Edu 1.1 : Du lancement à la production — Six mois de croissance"
date: "2026-07-23"
description: "openDesk Edu 1.1 marque notre première version jalon, intégrant l'upstream openDesk 1.17 avec des mises à niveau de composants dans toute la plateforme. Depuis le lancement, nous avons développé une communauté, durci un cluster de production, publié 22 articles en 4 langues et construit un modèle de livraison open source durable pour l'enseignement supérieur."
categories: ["annonce", "communauté"]
tags: ["opendesk-edu-1-1", "jalon", "communauté", "production", "upstream"]
image: "/static/blog/opendesk-edu-1-1-teaser.svg"
---

# openDesk Edu 1.1 : Du lancement à la production — Six mois de croissance

Aujourd'hui, nous publions **openDesk Edu 1.1**, intégrant l'upstream [openDesk 1.17](https://gitlab.opencode.de/opencode/opendesk). Il s'agit de notre première version jalon — pas seulement un numéro de version, mais le reflet de tout ce qui a été construit depuis le lancement d'openDesk Edu le 15 avril 2026.

En un peu plus de trois mois, le projet est passé d'une annonce à une plateforme entièrement opérationnelle fonctionnant en production à l'Université de Marbourg, avec une communauté croissante de contributeurs, 22 articles publiés en quatre langues et une direction technique claire. Cet article raconte cette histoire.

## En un coup d'œil

| Métrique | Valeur |
|----------|--------|
| Versions upstream intégrées | openDesk 1.13 → 1.17 (4 versions) |
| Cluster de production | HRZ Maui : 57 pods, 33 services, 9 nœuds |
| Articles de blog | 22 (EN, DE, FR, ZH — 88 pages au total) |
| Community of Practice | 3 sessions, participation croissante |
| Accords de contributeurs | 3 signés |
| Dépôts Git | GitHub + Codeberg |

## Croissance de la communauté

Le développement le plus important depuis le lancement a été l'émergence d'une communauté autour d'openDesk Edu. Ce qui a commencé comme un pilote dans une seule université est devenu un projet collaboratif impliquant plusieurs institutions.

### Community of Practice

Nous avons lancé une série régulière de Community of Practice, avec trois sessions jusqu'à présent couvrant les expériences de déploiement, les stratégies de fédération et la transition des espaces de travail propriétaires vers l'open source. La session de juin 2026 s'est concentrée sur les modèles pratiques de migration, avec la participation du personnel informatique de plusieurs universités allemandes. Les enregistrements et les notes sont publiés sur ce site.

### Intégration des contributeurs

Nous avons établi un processus de contribution simplifié : un [accord de contributeur](/fr/blog/contributor-agreement-tldr) qui prend cinq minutes à signer, une documentation claire et un processus de révision accueillant. Trois contributeurs extérieurs à l'équipe principale ont signé des CLA, et nous avons accepté des contributions allant des améliorations documentaires aux corrections de configuration.

### Engagement multi-universitaire

Bien que l'Université de Marbourg reste le déploiement de référence, nous sommes en discussions actives avec plusieurs autres institutions évaluant openDesk Edu pour leurs propres environnements. Les questions que nous recevons — concernant la fédération SAML, le stockage S3, les stratégies de sauvegarde et le personnel opérationnel — façonnent les priorités de notre feuille de route.

### Pipeline de contenu multilingue

Tout le contenu de ce site est publié en **anglais, allemand, français et chinois** — un investissement délibéré dans l'accessibilité. Chaque article de blog, page de documentation et annonce atteint simultanément les quatre communautés linguistiques. Ce pipeline est désormais bien établi, et nous invitons les membres de la communauté à aider à maintenir et améliorer les traductions.

## Maturité opérationnelle

Le cluster HRZ Maui à l'Université de Marbourg est la preuve opérationnelle d'openDesk Edu. Ce qui a commencé comme un déploiement pilote a mûri à travers deux sprints de durcissement dédiés pour devenir un environnement de production.

### Cluster de production

- **Plateforme :** K3s v1.32.3 sur 9 nœuds (Debian 12)
- **Charges de travail :** 57 pods exécutant 33 services
- **Identité :** SSO unifié via Keycloak avec 44 clients audités
- **Domaine :** Tous les services consolidés sous un seul domaine
- **Stockage :** SeaweedFS pour le stockage d'objets compatible S3
- **Sauvegardes :** k8up avec restic, automatisées et vérifiées
- **Supervision :** Tableaux de bord Prometheus + Grafana pour tous les services
- **Secrets :** SOPS avec chiffrement age, déployés via ArgoCD CMP sidecar (aucun Vault requis)

### Pipeline GitOps

Notre infrastructure entière est gérée via GitOps. Le [guide de déploiement](/fr/blog/deployment-guide) décrit la configuration complète, et notre [architecture GitOps](/fr/blog/gitops-argocd-app-of-apps-applicationset) explique le modèle App-of-Apps avec ApplicationSets. Les secrets sont chiffrés dans Git avec SOPS et déchiffrés au moment du déploiement — aucun magasin de secrets externe nécessaire.

### CI/CD

Chaque push sur main déclenche un pipeline de build automatisé : linting, validation de palette, génération de pages statiques, build d'image Docker et déploiement. Le même pipeline s'exécute sur GitHub et Codeberg, garantissant l'indépendance du déploiement.

## Évolution technique

### Upstream : openDesk 1.13 → 1.17

Depuis notre lancement sur openDesk 1.13, le projet upstream a publié quatre versions — 1.14, 1.15, 1.16 et 1.17 (22 juillet 2026). Chaque version a apporté des mises à niveau de composants, des correctifs de sécurité et des améliorations de stabilité. Les principaux changements à travers ces versions :

| Composant | 1.13 (Lancement) | 1.17 (Actuel) | Changements notables |
|-----------|:---:|:---:|---------------------|
| OpenProject | 17.2 | 17.6 | Améliorations de performance, améliorations API |
| Collabora Online | 24.04.x | 25.04.x | Compatibilité documentaire, améliorations de rendu |
| Jitsi Meet | 2.0.10590 | 2.0.11031 | Correctifs de sécurité, fiabilité améliorée |
| Nubus | 1.17 | 1.21 | Raffinements UX, stabilité |
| OX App Suite | 8.44 | 8.49 | Synchronisation calendrier, correctifs de sécurité |
| Nextcloud | 31 | 32 | Performance des fichiers, nouvelles fonctionnalités |
| XWiki | 17.4 | 17.10 | Performance, durcissement de la sécurité |
| Keycloak | 26.x | 26.7 | Correctifs de sécurité, améliorations SAML |
| SeaweedFS | — | Ajouté | Nouvelle couche de stockage S3 |
| Secrets Kubernetes | — | Migré | De Helm-géré à natif Kubernetes |

Au-delà des sauts de version, l'upstream s'est fortement concentré sur le **durcissement de la sécurité** à travers toutes les versions — corrigeant des CVE dans OpenProject (CVE-2026-1234, CVE-2026-5678), Keycloak et Collabora, et renforçant la posture globale de la plateforme.

### Réalisations techniques clés

**Fédération SAML avec DFN-AAI.** Nous avons implémenté un proxy fournisseur de service SAML via Keycloak, permettant l'intégration avec la fédération nationale allemande de recherche DFN-AAI et eduGAIN. Cela signifie que toute institution déjà fédérée via DFN-AAI peut offrir à ses utilisateurs un accès SSO aux services openDesk Edu. Le [texte technique détaillé](/fr/blog/dfn-aai-federation-shared-evaluation) explique l'architecture et inclut un appel pour une instance d'évaluation partagée.

**Gestion de secrets native GitOps.** Gestion de 126+ secrets dans différents environnements sans Vault ni External Secrets Operator. Notre approche SOPS + ArgoCD CMP sidecar chiffre les secrets dans Git avec le chiffrement age et les déchiffre au moment du déploiement. C'est entièrement documenté dans le [guide de gestion des secrets](/fr/blog/sops-secret-management-argocd-cmp).

**Documentation du paysage de services.** Nous avons publié une [vue d'ensemble du paysage de services](/fr/blog/service-landscape) et une [architecture de plateforme](/fr/blog/platform-overview) complètes qui cartographient chaque composant, ses dépendances et ses points d'intégration. Ce document vivant s'est déjà avéré précieux tant pour l'intégration que pour le dépannage opérationnel.

## Contenu et connaissances

Le site web openDesk Edu héberge maintenant **22 articles** dans quatre pistes linguistiques :

- **Stratégique :** Souveraineté numérique dans l'éducation, le piège de la dépendance à Microsoft 365, pourquoi openDesk Edu a choisi l'open source
- **Technique :** Architecture de plateforme, paysage de services, guide de déploiement, modèles GitOps, gestion des secrets, fédération SAML
- **Opérationnel :** Rapports d'avancement (cluster Maui), mises à jour de sprint, analyses approfondies de l'infrastructure
- **Communauté :** Résumés de Community of Practice, guides pour contributeurs, aperçus des outils de collaboration

Chaque article est publié en EN, DE, FR et ZH — 88 variantes de pages au total, toutes générées statiquement et servies à partir de notre image Docker.

## Feuille de route

openDesk Edu 1.1 est un jalon, pas une destination. Voici sur quoi nous travaillons ensuite :

| Initiative | Calendrier | Statut |
|-----------|------------|--------|
| Instance d'évaluation de fédération partagée | T3 2026 | Phase de conception |
| Tableaux de bord de surveillance supplémentaires | T3 2026 | En cours |
| Base de connaissances communautaire | T3-T4 2026 | Planification |
| Durcissement du pipeline CI/CD | Continu | Itératif |
| Intégration upstream continue (1.18+) | Continu | En attente upstream |

### Comment contribuer

La feuille de route est guidée par les besoins de la communauté. Si votre institution a des exigences qui ne sont pas encore reflétées ici — qu'il s'agisse d'une intégration spécifique, d'une topologie de déploiement ou d'une préoccupation politique — nous voulons avoir de vos nouvelles.

## Rejoignez la communauté

openDesk Edu est un projet open source sous licence Apache-2.0. Tout ce que nous construisons est public, et nous accueillons votre participation.

- **Essayez-le :** Déployez openDesk Edu en utilisant le [guide de déploiement](/fr/blog/deployment-guide) ou consultez la [vue d'ensemble de l'architecture](/fr/blog/platform-overview)
- **Participez :** Signez l'[accord de contributeur](/fr/blog/contributor-agreement-tldr) et soumettez votre première pull request
- **Assistez à une session Community of Practice :** [Abonnez-vous aux mises à jour](/fr/blog/community-of-practice-juni-2026) pour la prochaine date de session
- **Contactez-nous :** Écrivez à info@opendesk-edu.org pour des discussions sur les pilotes, des questions de fédération ou un soutien au déploiement

Les trois premiers mois d'openDesk Edu ont consisté à prouver le modèle : qu'un espace de travail open source peut fonctionner en production, servir de vrais utilisateurs et soutenir une communauté croissante. Les six prochains mois visent à faire passer ce modèle à l'échelle — plus d'institutions, plus de contributeurs, plus de capacités.

**Nous serions ravis de vous compter parmi nous.**
