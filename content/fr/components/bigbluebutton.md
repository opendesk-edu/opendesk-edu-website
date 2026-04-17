---
title: "Cours en ligne"
date: "2026-03-27"
description: "Salle de classe virtuelle avec enregistrement, tableau blanc, sous-groupes et sondages."
categories: ["enseignement", "beta-education"]
tags: ["bigbluebutton", "visioconference", "salle-de-classe-virtuelle", "shibboleth"]
---

# Cours en ligne

Cours en ligne repose sur BigBlueButton, une plateforme de salle de classe virtuelle conçue pour l'enseignement. Contrairement à un simple outil de visioconférence, BigBlueButton intègre des fonctionnalités pédagogiques avancées : tableau blanc interactif, enregistrement des sessions, sous-groupes pour le travail en équipe et sondages en temps réel. Il utilise Shibboleth comme fournisseur de service SAML.

## Fonctionnalités clés

- **Tableau blanc interactif**: Dessin, annotations et présentations directement sur le tableau
- **Enregistrement des sessions**: Capture complète des cours pour une consultation ultérieure
- **Sous-groupes (breakout rooms)**: Division de la classe en petits groupes de travail
- **Sondages en temps réel**: Interrogations rapides et feedback instantané pendant le cours
- **Authentification Shibboleth**: Connexion via SAML SP pour un accès unifié
- **Alternative à Jitsi**: Solution plus complète que Réunions pour l'enseignement magistral

## Intégration avec openDesk Edu

Cours en ligne est un composant en version Beta pour le contexte éducatif. Il se déploie via Helm et utilise Shibboleth comme fournisseur de service SAML (SAML SP) pour s'intégrer à Keycloak. C'est l'alternative à Jitsi (Réunions) lorsque l'établissement a besoin de fonctionnalités pédagogiques avancées comme l'enregistrement et le tableau blanc interactif.
