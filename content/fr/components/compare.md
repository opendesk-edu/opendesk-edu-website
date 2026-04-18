---
title: "Matrice de comparaison des composants"
date: "2025-04-18"
description: "Comparez les 25 services openDesk Edu par catégorie, licence et fonctionnalités clés."
categories:
  - "Components"
tags:
  - "comparison"
  - "overview"
---

# Matrice de comparaison des composants

openDesk Edu associe les **10 services de base** d'openDesk Community Edition à **15 services Beta spécifiques à l'enseignement**, offrant un environnement de travail numérique complet adapté aux écoles, aux universités et aux organismes de recherche. Les 25 services s'intègrent via **Keycloak SSO** (SAML 2.0 / OIDC) et sont accessibles depuis le portail unifié Nubus.

Les services d'une même catégorie peuvent se substituer les uns aux autres — on peut par exemple choisir entre Jitsi et BigBlueButton pour la visioconférence, ou entre OX App Suite, SOGo et Grommunio pour la messagerie collaborative. Les services en **Beta** sont pleinement fonctionnels mais encore en cours de développement actif ; ils sont susceptibles d'évoluer dans les prochaines versions.

## Communication & Collaboration

| Service | Type | Statut | Licence | Fonctionnalités clés |
|---|---|---|---|---|
| Element (Matrix) | Messagerie instantanée | Stable | Apache 2.0 | Messages en temps réel, salons, partage de fichiers, widgets pédagogiques Nordeck, fédération |
| Jitsi | Visioconférence | Stable | Apache 2.0 | Réunions dans le navigateur, partage d'écran, flou d'arrière-plan, connexion téléphonique SIP |
| BigBlueButton | Salle de classe virtuelle | Beta | LGPL-3.0 | Enregistrement de sessions, tableau blanc interactif, sous-groupes, sondages |
| Etherpad | Édition collaborative | Beta | Apache 2.0 | Co-édition en temps réel, auteurs codés par couleur, système de plugins, export multi-formats |

## Messagerie & Agenda

| Service | Type | Statut | Licence | Fonctionnalités clés |
|---|---|---|---|---|
| OX App Suite | Groupware | Stable | Propriétaire (CE) | Webmail complet, agenda partagé, contacts avec LDAP, gestion des tâches |
| SOGo | Groupware léger | Beta | LGPL-2.1 | Webmail rapide, CalDAV/CardDAV, ActiveSync, faible empreinte ressources |
| Grommunio | Groupware compatible Microsoft 365 | Beta | AGPL-3.0 | ActiveSync 16.1, compatibilité Outlook/Thunderbird, base de données MariaDB |

## Gestion de fichiers

| Service | Type | Statut | Licence | Fonctionnalités clés |
|---|---|---|---|---|
| Nextcloud | Stockage cloud | Stable | AGPL-3.0 | Synchronisation et partage de fichiers, montages de stockages externes, gestion des versions, intégration Collabora |
| OpenCloud | Stockage cloud léger | Beta | Apache 2.0 | Stockage basé sur CS3, partage par cours, accès WebDAV, faible consommation de ressources |

## Bureautique & Productivité

| Service | Type | Statut | Licence | Fonctionnalités clés |
|---|---|---|---|---|
| Collabora | Suite bureautique en ligne | Stable | MPL-2.0 | Édition DOCX/XLSX/PPTX, collaboration en temps réel, compatibilité de formats, 100 % navigateur |
| CryptPad | Suite bureautique confidentielle | Stable | AGPL-3.0 | Chiffrement de bout en bout, édition collaborative, diagrams.net intégré, espace de stockage |
| Notes | Prise de notes | Stable | MIT | Éditeur léger sans distraction, support Markdown, organisation simple |
| Draw.io | Schémas et diagrammes | Beta | Apache 2.0 | Bibliothèques de formes étendues, export PDF/VSDX/SVG, import Lucidchart/Gliffy |
| Excalidraw | Tableau blanc | Beta | MIT | Style dessiné à main levée, collaboration en temps réel, reconnaissance de formes, chargement instantané |

## Enseignement & Éducation

| Service | Type | Statut | Licence | Fonctionnalités clés |
|---|---|---|---|---|
| ILIAS | Plateforme d'apprentissage | Beta | GPL-3.0 | Gestion de cours, évaluations, conformité SCORM, forums, wikis |
| Moodle | Plateforme d'apprentissage | Beta | GPL-3.0+ | Constructeur de cours, devoirs, carnet de notes, évaluation par les pairs, écosystème de plugins |
| XWiki | Wiki d'entreprise | Stable | LGPL-2.1 | Contenu structuré, éditeur WYSIWYG, scripts, marketplace d'extensions |

## Gestion de projets & Connaissances

| Service | Type | Statut | Licence | Fonctionnalités clés |
|---|---|---|---|---|
| OpenProject | Gestion de projets | Stable | GPL-3.0 | Tableaux agiles, diagrammes de Gantt, suivi du temps, wiki intégré, suivi de bugs |
| Planka | Tableau Kanban | Beta | AGPL-3.0 | Tableaux glisser-déposer, mises à jour en temps réel, étiquettes, listes de contrôle, échéances |
| BookStack | Wiki de documentation | Beta | MIT | Hiérarchie étagère/livre/chapitre, WYSIWYG + Markdown, recherche plein texte, permissions par rôle |

## Informatique & Administration

| Service | Type | Statut | Licence | Fonctionnalités clés |
|---|---|---|---|---|
| Nubus | Portail & IAM | Stable | Apache 2.0 (Keycloak) | Portail unifié, SAML 2.0/OIDC, provisioning des utilisateurs, contrôle d'accès par rôle |
| Zammad | Système de tickets | Beta | AGPL-3.0 | Support multicanal, automatisation des workflows, base de connaissances, gestion des SLA |
| LimeSurvey | Plateforme d'enquêtes | Beta | GPL-2.0+ | Types de questions variés, logique conditionnelle, gestion des quotas, enquêtes multilingues |
| TYPO3 | Système de gestion de contenu | Beta | GPL-2.0+ | Gestion multi-sites, modélisation de contenu flexible, édition front-office, extensibilité |
| LTB SSP | Auto-service de mots de passe | Beta | GPL-2.0+ | Réinitialisation par courriel, questions de sécurité, déverrouillage de compte, annuaire LDAP |
