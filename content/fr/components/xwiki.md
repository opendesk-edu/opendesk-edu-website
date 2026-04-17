---
title: "Wiki"
date: "2026-03-19"
description: "Plateforme wiki d'entreprise pour la gestion des connaissances et le contenu collaboratif."
categories: ["connaissance", "composant-de-base"]
tags: ["xwiki", "wiki", "gestion-des-connaissances", "collaboration"]
---

# Wiki

Wiki repose sur XWiki et offre une plateforme complète de gestion des connaissances. Elle permet aux équipes pédagogiques de créer, organiser et partager du contenu structuré : documentations, procédures, supports de cours et bases de connaissances institutionnelles. XWiki est hautement extensible grâce à son système de macros et d'applications.

## Fonctionnalités clés

- **Éditeur de contenu riche**: Création de pages wiki avec mise en forme avancée, tableaux et médias
- **Hiérarchie structurée**: Organisation du contenu en espaces, pages et sous-pages
- **Système de macros**: Extensibilité via des macros pour diagrammes, formulaires, calendriers et plus
- **Gestion des droits**: Permissions fines par espace, page ou groupe d'utilisateurs
- **Historique et versions**: Suivi des modifications avec comparaison et restauration de versions

## Intégration avec openDesk Edu

Wiki est un composant de base d'openDesk CE, déployé via Helm et accessible depuis le portail unifié. L'authentification est gérée par Keycloak en SSO (SAML 2.0 / OIDC). Les utilisateurs accèdent à leurs espaces de connaissances sans connexion supplémentaire.
