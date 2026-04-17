---
title: "LTB SSP"
date: "2026-04-10"
description: "Libre-service de réinitialisation de mot de passe LDAP pour réduire les tickets de support."
categories: ["identite", "beta-education"]
tags: ["ltb-ssp", "mot-de-passe", "ldap", "libre-service"]
---

# LTB SSP

LTB SSP (Self-Service Password) est un outil de libre-service pour la réinitialisation de mots de passe LDAP. Il permet aux utilisateurs de changer ou réinitialiser leur mot de passe en toute autonomie, sans intervention du support technique. En réduisant le volume de tickets liés aux mots de passe oubliés, LTB SSP allège la charge des équipes d'assistance informatique.

## Fonctionnalités clés

- **Réinitialisation autonome**: Les utilisateurs changent leur mot de passe sans aide du support
- **Questions de sécurité**: Vérification d'identité par questions secrètes préalablement configurées
- **Envoi par e-mail**: Lien de réinitialisation envoyé à l'adresse e-mail de l'utilisateur
- **Politique de complexité**: Application de règles de sécurité pour la force des mots de passe
- **Interface simple**: Formulaire web clair et accessible en quelques clics

## Intégration avec openDesk Edu

LTB SSP est un composant en version Beta pour le contexte éducatif. Il se déploie via Helm et interagit directement avec l'annuaire LDAP de la plateforme. Accessible depuis le portail unifié, il s'intègre à l'écosystème Keycloak en tant que service complémentaire de gestion des identités, venant réduire les sollicitations du support technique.
