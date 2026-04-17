---
title: "Plongée dans l'architecture : comment fonctionne openDesk Edu"
date: "2026-04-17"
description: "Une analyse technique approfondie de l'architecture openDesk Edu — orchestration Kubernetes, fédération SAML, SSO Keycloak et conception modulaire des services."
categories: ["technique", "architecture"]
tags: ["architecture", "kubernetes", "saml", "keycloak", "deep-dive"]
---

# Plongée dans l'architecture : comment fonctionne openDesk Edu

Cet article examine en détail l'architecture technique d'openDesk Edu. Si vous évaluez la plateforme pour votre établissement ou envisagez d'y contribuer, voici un aperçu clair de la manière dont les différentes pièces s'assemblent.

## La base : openDesk CE

openDesk Edu est un sur-ensemble d'openDesk Community Edition v1.13.x. Il hérite des services d'espace de travail essentiels fournis par openDesk CE : Nextcloud pour le partage de fichiers, Jitsi Meet pour les appels vidéo, un choix entre Open-Xchange, SOGo ou Grommunio pour la messagerie et le calendrier, Collabora Online pour l'édition de documents, et Keycloak pour la gestion des identités. Ces services sont éprouvés en production dans des déploiements au sein d'administrations publiques et d'entreprises.

Sur cette base, openDesk Edu ajoute 15 services spécifiques à l'éducation : ILIAS, Moodle, BigBlueButton, OpenCloud, Etherpad, CryptPad, BookStack, Planka, Zammad, LimeSurvey, LTB SSP, Draw.io, Excalidraw et TYPO3. Les 25 services partagent la même infrastructure d'authentification, de réseau et de stockage.

## Déploiement natif Kubernetes

Tout dans openDesk Edu fonctionne sur Kubernetes. Chaque service est empaqueté sous forme de chart Helm, et la stack complète est orchestrée via helmfile. Une seule commande `helmfile apply` rend les charts avec votre configuration et les déploie sur votre cluster.

Le système de configuration utilise `global.yaml.gotmpl`, un fichier de templates Go qui centralise tous les paramètres de déploiement. Vous définissez votre domaine, vos paramètres de messagerie, vos classes de stockage et vos indicateurs de fonctionnalités à un seul endroit, et les valeurs se propagent à chaque chart. Vous pouvez ainsi configurer l'ensemble de la plateforme sans modifier les fichiers de valeurs individuels de chaque chart.

Helmfile gère également l'ordre des dépendances. Les services qui dépendent de Keycloak ou du contrôleur d'ingress sont déployés une fois leurs dépendances prêtes. Si vous n'activez qu'un sous-ensemble de services, helmfile ignore ceux que vous avez désactivés et ne déploie que ce dont vous avez besoin.

## Authentification unifiée

Keycloak se trouve au centre de la couche d'authentification. Chaque service d'openDesk Edu délègue l'authentification à Keycloak, que ce soit via OpenID Connect, SAML 2.0 ou des protocoles spécifiques au service. Les utilisateurs se connectent une fois au portail Nubus et peuvent accéder à n'importe quelle application sans avoir à ressaisir leurs identifiants.

Nubus sert à la fois de portail utilisateur et de couche de gestion des identités et des accès (IAM). Il offre un point de lancement pour tous les services activés, affiche les informations de profil utilisateur et gère les sessions. Lorsqu'un utilisateur se connecte via Nubus, Keycloak émet un jeton de session reconnu par chaque service en aval.

Le provisionnement des utilisateurs se fait automatiquement. Lorsqu'un nouvel utilisateur s'authentifie pour la première fois via la fédération SAML ou un fournisseur d'identité local, Keycloak crée le compte utilisateur et le provisionne dans tous les services activés. Aucune création de compte séparée dans ILIAS, Moodle, Nextcloud ou toute autre application n'est nécessaire.

## Fédération SAML pour l'éducation

L'un des atouts majeurs d'openDesk Edu est sa prise en charge de la fédération SAML via DFN-AAI et eduGAIN. Dans un montage fédéré, le fournisseur d'identité (IdP) de l'établissement gère l'authentification, et openDesk Edu agit comme fournisseur de service (SP) dans la fédération.

Keycloak se connecte à la fédération en tant que SP SAML et traduit les assertions entrantes en attributs utilisateur internes. Des attributs comme `eduPersonPrincipalName`, `eduPersonAffiliation` et `eduPersonEntitlement` sont mappés vers des rôles et des appartenances à des groupes Keycloak, qui sont ensuite propagés aux services individuels.

Pour ILIAS, Moodle et BigBlueButton, qui implémentent chacun leur propre interface SP SAML, openDesk Edu déploie Shibboleth comme proxy SAML. Shibboleth reçoit l'assertion de Keycloak, applique des règles de filtrage d'attributs et transmet le résultat à l'application. Cette approche en deux étapes maintient les métadonnées de fédération propres et permet des politiques d'attributs spécifiques à chaque service.

## Sauvegarde et résilience

La protection des données dans openDesk Edu est assurée par k8up, un opérateur Kubernetes basé sur restic. k8up surveille les ressources personnalisées `Backup` et crée automatiquement des instantanés de tous les volumes persistants selon un calendrier configurable.

Le processus de sauvegarde couvre les bases de données, le stockage de fichiers et la configuration. Le chart Helm de chaque service inclut des annotations de sauvegarde indiquant à k8up quels volumes inclure et lesquels exclure. Les sauvegardes sont stockées dans un bucket compatible S3 ou tout autre backend pris en charge par restic.

Pour la reprise après sinistre, le format de sauvegarde restic prend en charge les instantanés incrémentaux avec déduplication. Restaurer un service consiste à pointer k8up vers un instantané spécifique et à le laisser recréer les volumes. Le processus est documenté et peut être automatisé dans le cadre d'un plan de réponse aux incidents.

## Gestion des certificats

openDesk Edu intègre openDesk Certificates de Bundesdruckerei pour le provisionnement automatique des certificats TLS. L'opérateur de certificats fonctionne dans le cluster et demande des certificats à l'autorité de certification Bundesdruckerei, en gérant le renouvellement et la distribution sans intervention manuelle.

Si votre établissement utilise une autre autorité de certification ou gère sa propre CA interne, le système fonctionne également avec cert-manager et les fournisseurs ACME standards comme Let's Encrypt. Les charts Helm acceptent une configuration de certificats personnalisée via le template global.

## Choisir votre stack

openDesk Euroffre délibérément des alternatives au sein de plusieurs catégories de services. L'idée est que les établissements choisissent ce qui correspond à leurs flux de travail et à leur expertise, pas ce qu'un fournisseur décide pour eux.

Pour la messagerie et le groupware, vous pouvez choisir entre Open-Xchange, SOGo et Grommunio. Chacun a des forces différentes en termes de fonctionnalités, de besoins en ressources et de familiarité des administrateurs. Pour la visioconférence, Jitsi Meet convient aux réunions de petite à moyenne taille, tandis que BigBlueButton est conçu pour des sessions de classe virtuelle structurées accueillant jusqu'à des centaines de participants. Pour le partage de fichiers, Nextcloud est le choix par défaut, et OpenCloud propose une variante adaptée aux cas d'usage éducatifs.

La catégorie tableau blanc et collaboration documentaire comprend Excalidraw pour le croquis léger, CryptPad pour la collaboration chiffrée et Etherpad pour l'écriture collaborative structurée. Les trois peuvent être activés simultanément si nécessaire.

## Perspectives

L'architecture continue d'évoluer. Les priorités à court terme incluent la stabilisation des services bêta à partir des retours de production, l'ajout d'options de fédération au-delà de DFN-AAI, et la construction de tableaux de bord de supervision offrant aux administrateurs une visibilité sur l'état de santé des services sur l'ensemble de la stack. La conception modulaire signifie que de nouveaux services peuvent être ajoutés sous forme de charts Helm supplémentaires sans modifier la couche d'orchestration principale.

Si vous souhaitez examiner le code, les charts et la configuration par vous-même, tout est disponible sur Codeberg :

[https://codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu)
