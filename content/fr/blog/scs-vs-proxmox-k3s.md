---
title: "SCS vs. Proxmox + K3s : Choisir la base d'openDesk Edu"
date: "2026-08-06"
description: "openDesk Edu est natif Kubernetes — la décision sur la plateforme vient donc en premier. Une comparaison neutre de SCS et de Proxmox VE avec K3s pour les universités : gouvernance, certification, portabilité et exploitation."
categories: ["Architecture"]
tags: ["scs", "sovereign-cloud-stack", "proxmox", "k3s", "kubernetes", "architecture", "achats", "souveraineté"]
author: "Tobias Weiß et les contributeurs openDesk Edu"
image: "/static/blog/scs-vs-proxmox-k3s-teaser.svg"
---

# SCS vs. Proxmox + K3s : Choisir la base d'openDesk Edu

La décision sur la plateforme de base précède la décision sur les services. openDesk Edu est natif Kubernetes — ses services sont livrés sous forme de charts Helm, de manifests GitOps et d'images conteneurs. La question pratique pour un établissement n'est donc pas de savoir quelles applications exécuter, mais comment obtenir une plateforme Kubernetes qu'une petite équipe peut exploiter durablement. Cet article compare deux approches largement utilisées dans l'enseignement supérieur allemand : le standard du Sovereign Cloud Stack (SCS) et une pile autogérée composée de Proxmox VE et K3s. Les deux sont décrites factuellement, et les facteurs qui déterminent habituellement le choix sont présentés.

## Deux approches pour la même exigence

### SCS : un standard, pas un produit

Le Sovereign Cloud Stack (SCS) est un standard pour l'infrastructure cloud souveraine, développé par une communauté sous l'égide de l'Open Source Business Alliance (OSBA). Il définit des couches interopérables pour l'infrastructure-as-a-service (basée sur OpenStack) et les plateformes de conteneurs (Kubernetes), ainsi que des implémentations de référence que les fournisseurs et opérateurs peuvent adopter.

SCS est important parce qu'il agit au niveau de la **certification**. Les opérateurs peuvent atteindre les statuts SCS-compatible ou SCS-sovereign, qui signalent que leur cloud offre des interfaces standardisées et portables. Pour les institutions du secteur public, cette certification est pertinente pour les achats : elle fournit une base documentée pour comparer les fournisseurs et s'inscrit dans les cadres de conformité, comme les exigences de conteneurs de l'administration allemande.

La propriété clé de SCS est la **portabilité par la standardisation** — une charge de travail qui s'exécute sur une plateforme certifiée SCS devrait s'exécuter sur toute autre, et les interfaces sont spécifiées ouvertement plutôt que par un fournisseur unique.

### Proxmox VE + K3s : une pile autogérée

Proxmox VE est une plateforme de virtualisation open source (basée sur KVM et LXC), maintenue par Proxmox Server Solutions GmbH, avec une large communauté dans l'enseignement supérieur européen. K3s est une distribution Kubernetes légère et certifiée CNCF, maintenue par SUSE/Rancher, conçue pour les environnements à ressources limitées et en périphérie.

Ensemble, elles forment une plateforme pragmatique et entièrement autogérée : Proxmox VE assure la virtualisation et la gestion du stockage, K3s fournit le plan de contrôle Kubernetes au-dessus. Cette combinaison est populaire dans les universités parce qu'elle est exploitable par une petite équipe, bien documentée et exempte d'obligations d'abonnement dans sa forme de base.

La propriété clé de cette approche est la **simplicité opérationnelle** : deux composants open source bien compris, aucun processus de certification et un contrôle complet sur chaque couche.

## Comparaison

| Dimension | SCS | Proxmox VE + K3s |
|-----------|-----|------------------|
| **Ce que c'est** | Un standard avec des implémentations de référence | Une pile concrète de virtualisation et de conteneurs |
| **Gouvernance** | Communautaire sous l'OSBA, contexte de financement public | Maintenue par un éditeur (open source), écosystème communautaire |
| **Certification** | Niveaux SCS-compatible / SCS-sovereign | Aucune |
| **Portabilité** | Interfaces standardisées entre plateformes certifiées | Spécifique aux composants choisis |
| **Exploitation** | Exige la compréhension de l'ensemble de la pile de référence SCS | Deux composants, bien documentés, adaptés aux petites équipes |
| **Adéquation aux achats** | Utilisable directement dans les achats de cloud souverain | Indirecte — évaluation sur critères techniques |
| **Alignement souveraineté** | Objectif explicite du standard | Atteint par l'autogestion de l'open source |
| **Opérateur type** | Fournisseurs cloud, grands établissements, consortiums | Établissements individuels, petites équipes IT |

Aucune des deux approches n'est intrinsèquement meilleure ; elles répondent à des contextes institutionnels différents.

## Facteurs de décision

### Taille de l'équipe et compétences

SCS présuppose la capacité d'exploiter une pile cloud complète — même avec les implémentations de référence, la surface opérationnelle est grande. Proxmox VE + K3s convient aux établissements où deux ou trois personnes exploitent toute la plateforme. Si l'équipe sait déjà exploiter OpenStack ou une plateforme certifiée SCS, SCS représente le coût marginal le plus faible ; si ses points forts sont la virtualisation et l'administration Linux, la voie Proxmox + K3s est plus directe.

### Contexte des achats et de la conformité

Pour les établissements qui doivent démontrer leur interopérabilité ou participer à des cadres d'achat de cloud souverain, la certification SCS est un actif documenté et vérifiable. Pour ceux qui achètent directement matériel et logiciels, la pile autogérée peut être spécifiée sur la seule base de critères techniques.

### Besoins de portabilité

Si les charges de travail doivent être déplaçables entre fournisseurs — par exemple dans le cadre d'un consortium ou d'une stratégie cloud multi-fournisseurs — les interfaces standardisées de SCS réduisent le coût de cette migration. Si les charges de travail restent sur le matériel de l'établissement pendant toute leur durée de vie, la portabilité entre fournisseurs est rarement exercée, et la pile plus simple suffit.

### Ce qu'openDesk Edu exige de chaque base

Quel que soit le choix, openDesk Edu impose les mêmes exigences de base :

- Kubernetes 1.28 ou ultérieur, avec un contrôleur d'ingress fonctionnel et des classes de stockage persistantes
- Fédération d'identités via SAML ou OIDC (openDesk Edu fournit Keycloak, qui peut fédérer avec DFN-AAI / eduGAIN)
- Outillage GitOps (ArgoCD) ou déploiement basé sur Helm/Helmfile
- Surveillance et journalisation (la plateforme inclut Prometheus, Grafana et Loki)
- Images conteneurs issues d'un registre accessible au cluster

Les plateformes certifiées SCS comme les clusters K3s satisfont ces exigences. SCS ajoute des interfaces standardisées pour le stockage et le réseau ; Proxmox + K3s les fournit directement via les composants choisis.

## Observations pratiques

- **Commencez par la plus petite plateforme que vous pouvez soutenir.** Kubernetes lui-même est identique sur les deux bases ; les différences se situent dans l'infrastructure environnante.
- **Le stockage est le facteur opérationnel décisif.** Les deux approches nécessitent des classes de stockage persistantes fiables ; la gestion native du stockage de Proxmox VE et les interfaces standardisées de SCS fonctionnent toutes deux, mais le modèle d'exploitation diffère.
- **Les mises à niveau diffèrent en ampleur.** Les mises à niveau de K3s sont petites et fréquentes ; celles de la pile de référence SCS touchent davantage de composants. Les établissements disposant de fenêtres de maintenance limitées doivent en tenir compte.
- **Aucune approche n'exclut l'autre.** Un déploiement Proxmox + K3s peut ensuite être migré vers une plateforme certifiée SCS à l'aide des outils Kubernetes standard, car les manifests de charges de travail sont portables par conception.

## Résumé

| Considération | Oriente vers |
|---------------|--------------|
| Petite équipe, autogestion, contrôle direct | Proxmox VE + K3s |
| Certification pour les achats, portabilité entre fournisseurs | SCS |
| Compétences OpenStack / SCS existantes | SCS |
| Compétences virtualisation / Linux existantes | Proxmox VE + K3s |
| Charges de travail hébergées sur le matériel de l'établissement | Proxmox VE + K3s |
| Stratégie cloud en consortium ou multi-fournisseurs | SCS |

openDesk Edu s'exécute sur Kubernetes ; il ne prescrit pas la base. Le choix entre SCS et Proxmox + K3s est un choix de gouvernance, de portabilité et de capacité opérationnelle de l'établissement — pas une question d'applications.

---

## Pour commencer

1. **Passez en revue les exigences** : Le [guide de déploiement](/fr/blog/deploying-opendesk-edu) décrit ce que toute plateforme de base doit fournir.
2. **Évaluez les deux bases** : Appliquez les facteurs de décision ci-dessus au contexte d'équipe, d'achats et de portabilité de votre établissement.
3. **Rejoignez la discussion** : La communauté openDesk Edu accueille volontiers les retours d'établissements exploitant l'une ou l'autre base. Partagez votre expérience dans la [communauté de pratique](/fr/blog/community-of-practice-juni-2026).

---

*openDesk Edu est la variante éducative d'[openDesk](https://opendesk.eu), enrichie d'une suite complète de services pour la recherche et l'enseignement. Le code source est disponible sur [GitHub](https://github.com/tobias-weiss-ai-xr/opendesk-nix) et [opencode.de](https://gitlab.opencode.de/umr).*
