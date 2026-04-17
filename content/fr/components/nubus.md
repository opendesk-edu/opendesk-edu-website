---
title: "Portail & IAM"
date: "2026-04-17"
description: "Portail unifié et gestion des identités basé sur Keycloak avec support SAML 2.0 et OIDC."
categories: ["identite", "composant-de-base"]
tags: ["nubus", "keycloak", "portail", "iam", "sso", "saml", "oidc"]
---

# Portail & IAM

Portail & IAM repose sur Nubus, un portail unifié construit autour de Keycloak. C'est le composant central de la plateforme openDesk Edu : il gère les identités, les authentifications et offre un point d'entrée unique vers tous les services. Nubus supporte les protocoles SAML 2.0 et OIDC, ce qui permet de connecter des applications internes et externes au système d'identité central.

## Fonctionnalités clés

- **Portail unifié**: Tableau de bord unique donnant accès à tous les services de la plateforme
- **Gestion des identités (IAM)**: Centralisation des comptes utilisateurs, rôles et permissions
- **Support SAML 2.0 et OIDC**: Protocoles standard pour la fédération d'identité et l'authentification
- **Single Sign-On**: Connexion unique pour tous les services, pas besoin de multiples mots de passe
- **Composant IAM central**: Point de confiance pour l'authentification de tous les autres composants

## Intégration avec openDesk Edu

Portail & IAM est le composant central d'openDesk CE. Tous les autres services s'authentifient via Keycloak (SAML 2.0 / OIDC). Déployé via Helm, il constitue le point d'entrée obligatoire de la plateforme. C'est le composant IAM qui fédère l'ensemble des identités de l'établissement.
