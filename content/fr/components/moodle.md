---
title: "LMS"
date: "2026-03-25"
description: "Plateforme d'apprentissage riche en plugins avec devoirs, ateliers et carnet de notes."
categories: ["enseignement", "beta-education"]
tags: ["moodle", "lms", "apprentissage", "devoirs", "shibboleth"]
---

# LMS

LMS repose sur Moodle, la plateforme d'apprentissage (Learning Management System) la plus répandue dans l'enseignement supérieur. Riche en plugins et en fonctionnalités pédagogiques, elle permet de gérer des cours complets avec devoirs, ateliers, forums, carnet de notes et certificats. Moodle utilise Shibboleth comme fournisseur de service SAML pour l'authentification.

## Fonctionnalités clés

- **Gestion de cours complète**: Création de cours avec activités, ressources et évaluations
- **Devoirs et ateliers**: Soumission de travaux en ligne avec évaluation par les pairs ou l'enseignant
- **Carnet de notes**: Suivi des résultats et calcul automatique des moyennes
- **Forums et discussions**: Espaces de discussion intégrés à chaque cours
- **Authentification Shibboleth**: Connexion via SAML SP pour un accès unifié à la plateforme

## Intégration avec openDesk Edu

LMS est un composant en version Beta pour le contexte éducatif. Il se déploie via Helm et utilise Shibboleth comme fournisseur de service SAML (SAML SP) pour s'intégrer à Keycloak. Accessible depuis le portail unifié, Moodle bénéficie de l'authentification centralisée tout en offrant son vaste écosystème de plugins pédagogiques.
