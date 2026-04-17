---
title: "ILIAS"
date: "2026-04-15"
description: "ILIAS est un puissant système de gestion de l'apprentissage open source largement utilisé dans l'enseignement supérieur et la formation professionnelle."
categories: ["education", "beta"]
tags: ["ilias", "education", "lms"]
---

# ILIAS

ILIAS est un puissant LMS open source qui offre une plateforme complète pour l'enseignement et l'apprentissage. Il fournit des outils de gestion de cours, d'évaluation, de collaboration et de communication. ILIAS est un composant éducatif Beta dans openDesk Edu.

## Fonctionnalités clés

- **Gestion de cours** : Créer et organiser des cours avec des structures de contenu flexibles
- **Évaluation** : Outils intégrés de tests et sondages avec de nombreux types de questions
- **Collaboration** : Forums, wikis, salles de groupe et partage de fichiers
- **Communication** : Systèmes de messagerie et de notification intégrés
- **Conformité SCORM** : Support complet des contenus SCORM 1.2 et 2004

## Intégration avec openDesk Edu

Dans le cadre de la plateforme openDesk Edu, ILIAS s'intègre de manière transparente avec les autres services via l'authentification unique basée sur SAML et les annuaires d'utilisateurs partagés. ILIAS utilise Shibboleth comme fournisseur de service SAML pour s'authentifier auprès de Keycloak. Déployé comme un composant Beta éducatif via des Helm Charts modulaires, les données persistantes des cours et des évaluations sont sauvegardées par k8up.

## Pour en savoir plus

- [Documentation officielle](https://docu.ilias.de) — Documentation et ressources officielles
