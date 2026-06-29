---
title: "Service Landscape openDesk Edu — L'Écosystème Complet en un Coup d'Œil"
date: "2026-06-29"
description: "Découvrez le paysage interactif des services openDesk Edu : une carte visuelle de tous les services open source intégrés dans tous les domaines — de la plateforme centrale à l'éducation, la sécurité et la conformité."
categories: ["Plateforme", "Open Source", "Outils"]
tags: ["landscape", "services", "aperçu", "opendesk", "écosystème"]
---

# Service Landscape openDesk Edu — L'Écosystème Complet en un Coup d'Œil

## Qu'est-ce que la Service Landscape ?

Naviguer sur une plateforme avec de nombreux services intégrés peut être complexe — surtout lorsque vous évaluez openDesk Edu pour votre établissement ou essayez de comprendre comment l'écosystème s'articule.

La **[Service Landscape openDesk Edu](https://landscape.opendesk-edu.org)** est une carte interactive et visuelle qui répond précisément à cette question. Elle présente chaque service de l'écosystème openDesk Edu, organisé par domaine, avec des indicateurs de statut, des descriptions et un accès direct au site principal et à la documentation.

Considérez-la comme le « CNCF Landscape » d'openDesk Edu — mais conçue spécifiquement pour les décideurs, les opérateurs et les enseignants de l'enseignement supérieur.

## Domaines, une Plateforme

La Landscape regroupe les services par catégories, chacune représentant un pilier de l'infrastructure numérique éducative :

### 🔐 Plateforme Centrale
Les fondations : **Keycloak** pour le SSO unifié, **OpenCloud** pour la synchronisation et le partage de fichiers, **Dovecot + Postfix** pour la messagerie, **SOGo** pour les logiciels collaboratifs, **Matrix + Element** pour la messagerie chiffrée, **Etherpad** pour la collaboration en temps réel, **Nubus Portal** pour l'IAM, les bases de données **PostgreSQL + MySQL** gérées, et le stockage d'objets **MinIO S3**.

### 🎓 Éducation & Recherche
Conçus pour le monde académique : **Moodle** et **ILIAS** comme systèmes de gestion de l'apprentissage, **JupyterHub** pour la recherche computationnelle, **XWiki** pour la gestion des connaissances et **OpenProject** pour la gestion de projets de recherche.

### 🤝 Collaboration & Productivité
Des outils pour le travail quotidien : **Collabora Online** pour l'édition de documents en temps réel, **OpenStreetMap** pour le géocodage, **Jitsi Meet** pour la visioconférence, **Planka** pour la gestion de tâches Kanban, **n8n + Dify** pour l'automatisation des workflows et les agents IA, et **WordPress** pour la gestion de contenu.

### ⚙️ Infrastructure & Opérations
La salle des machines : **K3s + ArgoCD** pour Kubernetes et GitOps, **Prometheus + Grafana** pour l'observabilité, **k8up** pour les sauvegardes, **Traefik + HAProxy** pour l'ingress et **Ceph CSI** pour le stockage défini par logiciel.

### 🛡️ Sécurité & Conformité
Protection et gouvernance : **ClamAV** pour l'analyse antivirus, **cert-manager** pour les certificats TLS automatisés, **Kubescape** pour l'analyse de sécurité Kubernetes, et des **rapports de tests d'intrusion** documentés avec suivi des correctifs.

## Fonctionnalités Interactives

La Landscape n'est pas un simple diagramme statique — c'est une interface vivante et filtrable :

- **Regroupement par domaine** — les services sont codés par couleur selon leur domaine
- **Badges de statut** — voyez en un coup d'œil quels services sont en Production, Beta ou Développement
- **Cartes de service** — chaque service affiche les technologies clés et une brève description
- **Liens rapides** — un clic vers le site principal ou la documentation OpenSpec
- **Mise à jour automatique** — la Landscape reflète l'état actuel du déploiement

## Pourquoi Utiliser la Landscape ?

Pour les **décideurs**, la Landscape offre une vue d'hélicoptère : vous pouvez instantanément évaluer l'étendue de la plateforme, comprendre quels domaines sont couverts et identifier les services qui correspondent aux besoins de votre établissement.

Pour les **opérateurs et architectes**, elle sert de carte de référence rapide de la stack — utile pour l'intégration de nouveaux membres dans l'équipe, la planification d'intégrations ou la communication du périmètre de la plateforme aux parties prenantes.

Pour la **communauté**, c'est un langage visuel partagé : quand nous parlons de « la plateforme », tout le monde peut voir exactement ce que cela signifie.

## Visitez la Landscape

[**→ landscape.opendesk-edu.org**](https://landscape.opendesk-edu.org)

La Landscape est open source et maintenue en parallèle de la plateforme. Les pull requests et suggestions sont les bienvenues — le code source est disponible sur GitHub avec le reste d'openDesk Edu.

*Dernière mise à jour : juin 2026*
