---
title: "Vue d'ensemble de l'architecture système"
date: "2026-04-15"
description: "Vue d'ensemble de l'architecture système d'openDesk Edu, incluant l'orchestration Kubernetes, la fédération SAML avec DFN-AAI et eduGAIN, le SSO centralisé Keycloak et le catalogue complet de 25 composants."
categories: ["architecture", "infrastructure"]
tags: ["architecture", "kubernetes", "saml", "keycloak", "fédération"]
---

# Vue d'ensemble de l'architecture système

openDesk Edu étend l'environnement de collaboration openDesk (CE) avec une couche dédiée de services éducatifs, créant un espace de travail numérique unifié pour les écoles, les universités et les établissements de recherche. Basé sur openDesk CE v1.13.x, la plateforme regroupe 25 services dans un cluster Kubernetes unique avec authentification centralisée, sauvegardes automatisées et gestion des certificats par la Bundesdruckerei. Le tout est distribué sous licence Apache-2.0 et se déploie en une seule commande : `helmfile -e default apply`.

## Principes fondamentaux

**Architecture conteneurisée native**

Chaque service s'exécute sous forme d'image conteneur orchestrée par Kubernetes 1.28+. Les charts Helm 3 gèrent les déploiements individuels, tandis que helmfile orchestre l'ensemble de la pile de manière déclarative. La configuration se trouve dans `helmfile/environments/default/global.yaml.gotmpl`, offrant aux administrateurs un fichier unique pour ajuster les paramètres, les limites de ressources et les options de fonctionnalités sur toute la plateforme. Cela signifie qu'un composant peut être mis à jour sans toucher au reste de la pile.

**Identité fédérée**

L'authentification transite par Keycloak en tant que fournisseur d'identité central, prenant en charge à la fois SAML 2.0 et OpenID Connect. Les établissements peuvent se connecter aux fédérations de recherche nationales (DFN-AAI en Allemagne, eduGAIN au niveau international) pour que les étudiants et le personnel utilisent leurs identifiants existants. Shibboleth agit comme fournisseur de service SAML pour les applications qui le nécessitent, comme ILIAS, Moodle et BigBlueButton. Nubus complète l'ensemble avec un portail en libre-service pour la gestion des identités et des accès.

**Souveraineté des données**

Toutes les données restent au sein de l'infrastructure de l'établissement. Aucun composant n'envoie de données vers des services SaaS externes. Le stockage persistant repose sur les PersistentVolumes Kubernetes, sauvegardés automatiquement par l'opérateur k8up avec restic. Les certificats TLS proviennent d'openDesk Certificates (Bundesdruckerei), gardant l'ensemble de la chaîne de confiance sous contrôle institutionnel.

**Architecture modulaire**

Les 25 services sont regroupés par fonction et peuvent être activés ou désactivés indépendamment via les valeurs helmfile. Besoin uniquement de la couche LMS ? Déployez ILIAS et Moodle sans la messagerie ni la visioconférence. LimeSurvey n'est pas nécessaire ? Laissez-le de côté. Chaque composant dispose de son propre chart Helm, de son propre volume de stockage et de ses propres paramètres de montée en charge.

## Stack technologique

| Composant | Version / Détails |
|-----------|-------------------|
| Kubernetes | 1.28+ |
| Helm | 3.x |
| helmfile | orchestration déclarative |
| Keycloak | SAML 2.0 + OIDC IdP |
| Shibboleth | SP SAML pour les services LMS/visio |
| Nubus | AGPL-3.0, v1.18.1, portail et IAM |
| k8up | opérateur de sauvegarde Kubernetes |
| restic | backend de stockage de sauvegarde |
| openDesk Certificates | TLS via Bundesdruckerei |
| Plateforme de base | openDesk CE v1.13.x |

## Architecture des services

La plateforme est organisée en trois couches distinctes :

**Couche de base openDesk CE**

Il s'agit de l'environnement de collaboration openDesk en amont, fournissant les outils de base de productivité et de collaboration. Elle comprend la messagerie instantanée (Element), le partage de fichiers (Nextcloud, OpenCloud), la messagerie d'entreprise (OX App Suite, SOGo), la visioconférence (Jitsi), l'édition collaborative (Collabora, Etherpad) et la gestion des connaissances (XWiki, BookStack). Ces services sont prêts pour la production et suivent les cycles de publication amont d'openDesk CE.

**Couche des services éducatifs**

Au-dessus de la couche de base, openDesk Edu ajoute 15 services axés sur l'éducation. Cette couche comprend les plateformes d'apprentissage (ILIAS, Moodle), les salles de classe virtuelles (BigBlueButton), la messagerie institutionnelle (Grommunio), un système de gestion de contenu (TYPO3), des outils d'enquête (LimeSurvey) et bien d'autres. Tous les services de cette couche sont en version Beta pendant la stabilisation des patterns d'intégration.

**Couche SSO et authentification**

Keycloak est au centre et gère l'authentification pour chaque service des deux couches. Il se connecte en amont à DFN-AAI ou eduGAIN via l'échange de métadonnées SAML, et en aval vers les services via SAML 2.0 ou OIDC selon ce que chaque service prend en charge. Shibboleth comble le vide pour les applications nécessitant un fournisseur de service SAML dédié. Nubus fournit le portail orienté utilisateur pour la gestion des comptes, des groupes et l'accès aux applications.

## Authentification et fédération SAML

Keycloak sert de fournisseur d'identité central pour l'ensemble de la plateforme. Il prend en charge deux familles de protocoles simultanément :

- **SAML 2.0** pour l'intégration avec les fédérations de recherche nationales et les fournisseurs de service existants
- **OpenID Connect (OIDC)** pour les applications modernes préférant l'authentification par jetons

**Prise en charge de la fédération**

La plateforme fournit des modèles de métadonnées pour DFN-AAI (la fédération d'identité allemande pour la recherche et l'éducation) et eduGAIN (l'interfédération internationale). La connexion au fournisseur d'identité de votre établissement nécessite l'enregistrement de votre instance Keycloak auprès de la fédération, le téléchargement des métadonnées de la fédération et la configuration du mappage des attributs. Ensuite, tout utilisateur disposant d'un compte eduGAIN valide d'un établissement participant peut se connecter avec ses identifiants d'origine.

**Fournisseur de service Shibboleth**

Certains services éducatifs, notamment ILIAS, Moodle et BigBlueButton, nécessitent un SP SAML dédié plutôt qu'un OIDC direct. Shibboleth s'en charge en traduisant les assertions SAML de Keycloak dans le format attendu par ces applications. Chaque service dispose de sa propre instance Shibboleth avec des filtres d'attributs spécifiques.

**Portail Nubus**

Nubus (v1.18.1, AGPL-3.0) constitue la couche utilisateur de la pile d'identité. Il offre aux utilisateurs un point d'accès central pour consulter leur profil, gérer les adhésions aux groupes, lancer des applications et gérer les réinitialisations de mot de passe. Pour les administrateurs, Nubus propose la gestion des groupes, l'attribution des rôles et le journal d'audit sur tous les services connectés.

## Sauvegarde et gestion des données

L'opérateur k8up s'exécute dans le cluster Kubernetes et gère les sauvegardes automatisées avec restic comme backend de stockage. Les sauvegardes suivent un planning configurable :

- **Quotidien** pour les bases de données et l'état des applications
- **Hebdomadaire** snapshots complets des volumes persistants
- **À la demande** déclenchement manuel pour les pré-migrations ou la reprise après sinistre

**Ce qui est sauvegardé**

Toutes les données persistantes de tous les services sont incluses : contenus de cours et soumissions (ILIAS, Moodle), enregistrements BigBlueButton, fichiers utilisateurs Nextcloud et OpenCloud, boîtes mail Grommunio (via dumps MariaDB), caches de documents Collabora et état de configuration de Keycloak et Nubus. Les données non persistantes comme les images conteneur et les caches éphémères sont exclues.

**Cibles de stockage**

Restic prend en charge un large éventail de backends de stockage, permettant aux établissements de diriger les sauvegardes vers du stockage NFS local, du stockage objet compatible S3 ou toute autre cible supportée par restic. Le chiffrement est intégré : toutes les données de sauvegarde sont chiffrées au repos avec une clé configurable.

## Vue d'ensemble des composants

Le tableau suivant liste les 25 services de la pile openDesk Edu, regroupés par fonction.

| Fonction | Service | Version | Statut |
|----------|---------|---------|--------|
| **Messagerie** | Element | 1.12.6 | Stable |
| **Notes** | Notes | 4.4.0 | Stable |
| **Diagrammes** | Draw.io | 29.6 | Stable |
| **Diagrammes** | Excalidraw | latest | Stable |
| **Fichiers** | Nextcloud | 32.0.6 | Stable |
| **Fichiers** | OpenCloud | 4.0.3 | Beta |
| **Messagerie d'entreprise** | OX App Suite | 8.46 | Stable |
| **Messagerie d'entreprise** | SOGo | 5.11 | Stable |
| **Messagerie d'entreprise** | Grommunio | 2025.01 | Beta |
| **Wiki** | XWiki | 17.10.4 | Stable |
| **Wiki** | BookStack | 26.03 | Stable |
| **Portail / IAM** | Nubus | 1.18.1 | Beta |
| **Projets** | OpenProject | 17.2.1 | Stable |
| **Réunions** | Jitsi | 2.0.10590 | Stable |
| **Bureautique** | Collabora | 25.04.8 | Stable |
| **Édition collaborative** | Etherpad | 1.9.9 | Stable |
| **Édition collaborative** | CryptPad | 2025.9.0 | Stable |
| **LMS** | ILIAS | 7.28 | Beta |
| **LMS** | Moodle | 4.4 | Beta |
| **Cours en ligne** | BigBlueButton | 2.7 | Beta |
| **Kanban** | Planka | 2.1.0 | Stable |
| **Assistance** | Zammad | 7.0 | Stable |
| **Sondages** | LimeSurvey | 6.6 | Beta |
| **Réinitialisation mot de passe** | LTB SSP | 1.7 | Beta |
| **CMS** | TYPO3 | 13.4 | Beta |

Les services marqués "Stable" font partie de la publication amont openDesk CE. Les services marqués "Beta" appartiennent à la couche éducative openDesk Edu et sont en cours de stabilisation.

## Composants alternatifs

Plusieurs domaines fonctionnels offrent plusieurs options de services, permettant aux établissements de choisir l'outil le mieux adapté à leurs besoins :

- **Messagerie** : OX App Suite, SOGo ou Grommunio
- **Visioconférence** : Jitsi ou BigBlueButton
- **Stockage de fichiers** : Nextcloud ou OpenCloud
- **Tableau blanc** : Excalidraw ou CryptPad

Chaque alternative utilise la même authentification Keycloak, la même pipeline de sauvegarde et la même infrastructure de certificats. Le passage d'une alternative à l'autre se fait en activant ou désactivant le chart correspondant dans les valeurs helmfile. Pour une comparaison détaillée des fonctionnalités, des licences et des ressources requises, consultez la [page de comparaison des composants](/components/comparison).
