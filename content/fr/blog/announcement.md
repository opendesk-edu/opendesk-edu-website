---
title: "Annonce de openDesk Edu"
date: "2026-04-15"
description: "openDesk Edu apporte l'espace de travail numérique openDesk à l'enseignement supérieur — 25 services open source, SSO unifié, déploiement en une seule commande."
categories: ["annonce", "communauté"]
tags: ["annonce", "opendesk", "éducation", "open-source"]
---

# Annonce de openDesk Edu

Nous sommes heureux d'annoncer le lancement de openDesk Edu, un nouveau projet qui apporte l'espace de travail numérique openDesk aux établissements d'enseignement supérieur. openDesk Edu combine 25 services open source en une plateforme cohérente avec authentification unique unifiée, prise en charge de la fédération SAML et déploiement en une seule commande. Le tout est sous licence Apache-2.0 et prêt à être adopté par les universités, les instituts de recherche et les réseaux éducatifs.

## Qu'est-ce que openDesk Edu ?

openDesk Edu s'appuie sur openDesk Community Edition (CE) et ajoute 15 services spécifiques à l'éducation par-dessus la stack de productivité existante. Le résultat est une plateforme couvrant la gestion de l'apprentissage, la visioconférence, la collaboration en temps réel, le partage de fichiers, la productivité et bien plus encore. Au lieu d'assembler un patchwork d'outils propriétaires, les établissements disposent d'un environnement numérique entièrement open source qui respecte la souveraineté des données et les normes d'interopérabilité.

## Ce qui est inclus

openDesk Edu fournit 25 services répartis en plusieurs catégories :

- **Gestion de l'apprentissage** avec ILIAS et Moodle, deux des plateformes LMS les plus utilisées dans l'enseignement supérieur européen.
- **Visioconférence** avec Jitsi Meet et BigBlueButton, couvrant aussi bien les réunions légères que les classes virtuelles complètes avec tableaux blancs, salles de sous-groupes et enregistrement.
- **Collaboration** avec Nextcloud pour la synchronisation et le partage de fichiers, Etherpad pour l'édition collaborative en temps réel, et CryptPad pour la collaboration sur documents chiffrée de bout en bout.
- **Productivité** avec un choix de suites groupware : Open-Xchange, SOGo ou Grommunio pour la messagerie et le calendrier, associés à Collabora Online pour l'édition de documents dans le navigateur.
- **Outils complémentaires** dont Draw.io pour les diagrammes, Excalidraw pour les croquis, BookStack pour la gestion des connaissances, Planka pour les tableaux de projet, Zammad pour les tickets de support, LimeSurvey pour les enquêtes et TYPO3 pour les sites institutionnels.

## Fonctionnalités clés

**Déploiement en une seule commande.** La stack complète se déploie avec une seule commande `helmfile apply` sur n'importe quel cluster Kubernetes. Pas de configuration service par service, pas de scripts shell fragiles. Helmfile orchestre 25 charts Helm modulaires avec une configuration déclarative.

**SSO Keycloak unifié.** Chaque service s'authentifie via une instance Keycloak centrale. Les utilisateurs se connectent une fois et accèdent à toutes les applications sans avoir à ressaisir leurs identifiants. Keycloak prend en charge à la fois SAML 2.0 et OpenID Connect.

**Fédération DFN-AAI et eduGAIN.** openDesk Edu se connecte à l'infrastructure DFN-AAI et à la fédération eduGAIN élargie. Les étudiants et le personnel s'authentifient avec les identifiants de leur établissement d'origine, avec un mappage automatique des attributs tels que l'affiliation et les droits d'accès.

**Souveraineté des données.** Tous les services fonctionnent sur une infrastructure que vous contrôlez. Aucune donnée ne quitte votre cluster sans que vous ne le configuriez. C'est essentiel pour les établissements soumis au RGPD et aux réglementations nationales sur la protection des données.

**Architecture modulaire.** Tous les établissements n'ont pas besoin des 25 services. Le système de configuration permet d'activer uniquement ce dont vos utilisateurs ont besoin. Faites tourner uniquement ILIAS et Nextcloud, ou déployez la stack complète. Le choix vous appartient.

## Services éducatifs en version bêta

Les 15 services ajoutés par-dessus openDesk CE sont publiés en version bêta. Cela signifie qu'ils sont fonctionnels et testés pour les cas d'usage de base, mais qu'ils n'ont peut-être pas encore le même niveau de fiabilité que les services principaux de openDesk CE. Nous recherchons activement les retours des early adopters.

Les services bêta incluent : ILIAS, Moodle, BigBlueButton, OpenCloud (une variante de partage de fichiers basée sur Nextcloud), Grommunio, Etherpad, BookStack, Planka, Zammad, LimeSurvey, LTB SSP, Draw.io, Excalidraw et TYPO3.

Si votre établissement souhaite tester ces services, nous serions ravis d'avoir de vos nouvelles. Les rapports de bugs, les demandes de fonctionnalités et les retours de déploiement contribuent tous à façonner le projet.

## Participez

openDesk Edu est développé de manière ouverte, et les contributions sont les bienvenues. Que vous soyez développeur, administrateur système, enseignant ou établissement souhaitant adopter une infrastructure numérique open source, il y a de nombreuses façons de participer.

Le développement principal a lieu sur Codeberg :

[https://codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu)

Un miroir GitHub est également disponible :

[https://github.com/opendesk-edu/opendesk-edu](https://github.com/opendesk-edu/opendesk-edu)

Les issues, les pull requests, les améliorations de documentation et les traductions sont toutes appréciées.

## Et ensuite ?

La feuille de route des prochains mois se concentre sur la stabilisation des services bêta à partir des retours des early adopters. Nous travaillons également à l'extension de la prise en charge de la fédération à d'autres fédérations d'identité nationales au-delà de DFN-AAI, et à la simplification du processus d'intégration pour les établissements souhaitant évaluer openDesk Edu.

Restez à l'écoute pour un prochain article qui détaillera l'architecture technique.
