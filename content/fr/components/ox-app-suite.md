---
title: "OX App Suite"
date: "2026-03-09"
description: "Suite groupware d'entreprise complète avec e-mail, calendrier, contacts et gestion de documents."
categories: ["groupware", "composant-de-base"]
tags: ["ox-app-suite", "groupware", "email", "calendrier", "contacts"]
---

# OX App Suite

OX App Suite est la suite groupware par défaut d'openDesk Edu. Elle regroupe messagerie électronique, calendrier, carnet d'adresses et gestion de documents dans une interface unifiée. Conçue pour les environnements professionnels et éducatifs, elle offre des fonctionnalités avancées de collaboration et de productivité.

## Fonctionnalités clés

- **Messagerie électronique**: Client mail complet avec tri intelligent, filtres et recherche avancée
- **Calendrier partagé**: Gestion d'agenda personnel et partagé avec planification de réunions
- **Carnet d'adresses global**: Contacts partagés et carnets d'adresses personnels avec synchronisation
- **Gestion de documents**: Création et édition de documents directement depuis la suite
- **Option groupware par défaut**: Solution complète préconfigurée dans openDesk Edu

## Intégration avec openDesk Edu

OX App Suite est un composant de base d'openDesk CE et constitue l'option groupware par défaut. Déployée via Helm, elle s'intègre au portail unifié avec authentification Keycloak en SSO (SAML 2.0 / OIDC). Les données persistantes sont sauvegardées automatiquement par k8up.
