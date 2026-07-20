---
title: "Identité fédérée pour l'éducation : openDesk Edu et la fédération DFN-AAI"
date: "2026-07-10"
description: "Comment openDesk Edu s'intègre à la fédération nationale allemande de recherche DFN-AAI en tant que proxy SAML Service Provider via Keycloak — et un appel à l'action pour que la communauté construise une instance d'évaluation partagée qui abaisse la barrière pour chaque établissement."
categories: ["technique", "communauté", "identité"]
tags: ["dfn-aai", "fédération", "saml", "keycloak", "edugain", "gestion-identités", "shibboleth", "communauté", "évaluation"]
image: "/static/blog/dfn-aai-federation-shared-evaluation-teaser.svg"
---

# Identité fédérée pour l'éducation : openDesk Edu et la fédération DFN-AAI

> **La vision :** Un étudiant d'une université allemande se connecte une fois à sa plateforme d'apprentissage locale — et accède à des outils collaboratifs, un stockage de fichiers et des visioconférences au-delà des frontières institutionnelles sans un second mot de passe.
>
> **La réalité :** La fédération est difficile. Métadonnées SAML, mapping d'attributs eduGAIN, enregistrement SP, gestion des certificats — chaque établissement réinvente la roue.
>
> **L'appel à l'action :** Construisons ensemble une instance d'évaluation DFN-AAI partagée. Une configuration de fédération, testée et documentée par plusieurs. Abaissons la barrière pour chaque établissement de la communauté.

## La fédération DFN-AAI

DFN-AAI (Deutsches Forschungsnetz — Authentication and Authorization Infrastructure) est la fédération d'identité académique nationale allemande, reliant les universités, les instituts de recherche et les fournisseurs de services via SAML 2.0. Elle fait partie de l'interfédération mondiale eduGAIN, ce qui signifie qu'une connexion DFN-AAI peut authentifier les utilisateurs dans les établissements participants du monde entier.

Pour openDesk Edu, l'intégration DFN-AAI n'est pas optionnelle — c'est une exigence fondamentale. Les universités allemandes ne créent pas de comptes utilisateur séparés pour chaque plateforme. Elles s'authentifient via leur fournisseur d'identité (IdP) institutionnel, qui est enregistré auprès de DFN-AAI et fédéré avec eduGAIN.

Sans support DFN-AAI, openDesk Edu serait une île isolée. Avec lui, il fait partie de l'infrastructure nationale de recherche et d'éducation.

## Ce que nous avons construit

Au cours du Sprint 5 de notre feuille de route v1.1 (juillet 2026), nous avons implémenté un support complet de la fédération DFN-AAI pour openDesk Edu. Voici ce qui a été livré :

### 1. Keycloak comme proxy SAML Service Provider

La décision architecturale centrale : **Keycloak agit à la fois comme SAML SP (vers DFN-AAI) et OIDC IdP (vers les services openDesk).** Cela signifie :

- Le monde extérieur voit une entité SAML SP — propre, simple, standard
- Les services internes continuent d'utiliser OIDC — aucune configuration SAML par service nécessaire
- La traduction d'attributs se fait à un seul endroit — attributs SAML eduGAIN → revendications OIDC
- La déconnexion par canal arrière se propage de DFN-AAI → Keycloak → tous les 25+ services

```
┌──────────────┐     SAML 2.0     ┌──────────────┐     OIDC      ┌──────────────┐
│  DFN-AAI IdP │◄────────────────►│   Keycloak   │◄────────────►│ openDesk     │
│ (Shibboleth) │    (eduGAIN)     │  (SAML SP)   │   (Claims)    │ Services     │
└──────────────┘                  └──────────────┘               └──────────────┘
```

### 2. Mapping d'attributs eduGAIN

eduGAIN définit un ensemble standard d'attributs que les IdP divulguent sur leurs utilisateurs. Nous les avons mappés aux attributs utilisateur Keycloak et aux revendications OIDC :

**5 attributs obligatoires (obligatoires pour l'enregistrement DFN-AAI) :**

| Attribut eduGAIN | Description | Mappé vers |
|-------------------|-------------|------------|
| `eduPersonPrincipalName` | Identifiant unique utilisateur | `eppn` |
| `mail` | Adresse e-mail | `email` |
| `displayName` | Nom d'affichage complet | `name` |
| `givenName` | Prénom | `firstName` |
| `sn` | Nom de famille | `lastName` |

**5 attributs recommandés :**

| Attribut eduGAIN | Description | Mappé vers |
|-------------------|-------------|------------|
| `eduPersonAffiliation` | Rôle (étudiant/personnel/faculté) | `affiliation` |
| `eduPersonScopedAffiliation` | Affiliation avec portée | `scopedAffiliation` |
| `eduPersonEntitlement` | URNs de droits | `entitlement` |
| `preferredLanguage` | Préférence linguistique | `locale` |
| `schacHomeOrganization` | Domaine de l'organisation d'origine | `organization` |

Le mapping d'attributs est le chemin critique. Si les attributs n'arrivent pas correctement, les utilisateurs ne peuvent pas s'authentifier, les rôles ne sont pas attribués et la personnalisation échoue. Nous avons documenté chaque mappeur avec son format de nom d'attribut SAML (`urn:oasis:names:tc:SAML:2.0:attrname-format:uri` vs `basic`) pour éliminer les conjectures.

### 3. Génération des métadonnées du fournisseur de services

Nous avons créé un workflow de génération de métadonnées qui produit le XML de métadonnées SAML SP requis par DFN-AAI pour l'enregistrement :

```bash
# Générer les métadonnées SP
./scripts/generate-saml-metadata.sh \
  --entity-id "urn:auth:opendesk:edu:yourdomain" \
  --acs-url "https://keycloak.yourdomain.de/realms/opendesk/broker/dfn-aai/endpoint" \
  --cert-file /etc/ssl/certs/saml-signing.crt

# Valider les métadonnées
xmllint --valid --noout sp-metadata.xml
```

### 4. Tests et dépannage

Nous avons documenté le workflow de test complet — des comptes IdP de test à la vérification des attributs en passant par la propagation de la déconnexion unique — dans un guide de test bilingue (EN/FR), couvrant l'environnement de test de la fédération DFN-AAI :

| Environnement | Source des métadonnées | Délai d'enregistrement |
|-------------|-----------------|-------------------|
| **Fédération de test** | Fédération de test DFN-AAI : `https://www.aai.dfn.de/fileadmin/metadata/DFN-AAI-Test-metadata.xml` | 1-2 jours ouvrés |
| **Fédération de production** | Votre administrateur DFN-AAI d'établissement | 3-5 jours ouvrés |

### 5. Suite de documentation complète

Le travail DFN-AAI a produit cinq fichiers de documentation totalisant environ 500 lignes, couvrant l'architecture de la fédération, l'intégration Keycloak, l'enregistrement, les tests (bilingue) et l'inscription en production.

## Le défi : Chaque établissement réinvente la roue

Voici le problème. Chaque université qui souhaite déployer openDesk Edu — ou toute plateforme compatible SAML — doit :

1. **Contacter DFN-AAI** pour l'enregistrement à la fédération (1-2 semaines de processus administratif)
2. **Générer les métadonnées SAML** pour son déploiement spécifique
3. **Configurer la signature de certificat** via son PKI institutionnel
4. **Coordonner la libération d'attributs** avec ses administrateurs IdP institutionnels
5. **Tester le flux complet** — authentification, mapping d'attributs, propagation de la déconnexion
6. **Déboguer indépendamment** quand quelque chose ne fonctionne pas

Pour un seul établissement, c'est gérable. **Pour 10, 20 ou 50 établissements, la répétition est stupéfiante.** Chaque équipe débogue les mêmes erreurs SAML. Chaque équipe découvre le même mapping d'attributs. Chaque équipe subit la même attente d'enregistrement de 1 à 2 semaines.

Pire : **il n'y a pas d'environnement d'évaluation partagé.** Si vous êtes une université évaluant openDesk Edu, vous ne pouvez pas "simplement tester" l'intégration DFN-AAI sans passer par le processus d'enregistrement complet. Vous avez besoin d'un SP SAML de qualité production, enregistré auprès de DFN-AAI, avec des certificats et des métadonnées appropriés — juste pour décider si la plateforme vous convient.

C'est le goulot d'étranglement que nous devons résoudre ensemble.

## L'appel : Une instance d'évaluation DFN-AAI partagée

Voici la proposition : **Établissons une instance d'évaluation DFN-AAI partagée que tout membre de la communauté peut utiliser pour tester l'intégration de la fédération.**

### Ce que ce serait

Une instance Keycloak unique, gérée par la communauté, configurée comme fournisseur de services SAML DFN-AAI, enregistrée auprès de la fédération de test DFN-AAI, que plusieurs projets peuvent utiliser à des fins d'évaluation :

```
┌─────────────────────────────────────────────────────┐
│           Instance d'évaluation partagée              │
│                                                      │
│  Keycloak (SAML SP) ───── Enregistré auprès DFN-AAI │
│       │                                              │
│       ├── Realm: opendesk-eval    (openDesk Edu)     │
│       ├── Realm: lms-eval         (Autre LMS)        │
│       ├── Realm: collab-eval      (Collaboration)    │
│       └── Realm: your-project     (Votre projet)     │
│                                                      │
│  Métadonnées SAML partagées : eval.sp.opendesk-edu.org│
│  Certificats partagés : PKI gérée par la communauté   │
│  Documentation partagée : Éprouvée par plusieurs       │
└─────────────────────────────────────────────────────┘
```

### Pourquoi c'est important

- **Abaisser la barrière d'évaluation** — tester l'intégration de la fédération sans une attente d'enregistrement de 2 semaines
- **Partager les connaissances de débogage** — quand un membre de la communauté résout un problème SAML, tout le monde en profite
- **Standardiser le mapping d'attributs** — une configuration de mappeur eduGAIN éprouvée, validée par de nombreux établissements
- **Fournir une implémentation de référence** — "ça fonctionne sur l'instance d'évaluation partagée" devient une référence
- **Accélérer l'acquisition** — évaluer avant de s'engager dans le processus d'enregistrement complet

### Comment cela fonctionnerait

L'instance partagée serait :

1. **Légère** — Une seule VM ou pod Kubernetes exécutant Keycloak, enregistré auprès de la fédération de test DFN-AAI
2. **Multi-locataire** — Chaque projet communautaire obtient son propre realm Keycloak pour des tests isolés
3. **Gérée par la communauté** — Configuration et certificats gérés ouvertement, avec documentation pour chaque changement
4. **Documentée** — Chaque mappeur d'attributs, chaque point de terminaison, chaque rotation de certificat est documenté
5. **Temporaire par défaut** — Les realms sont uniquement pour l'évaluation ; les déploiements de production nécessitent toujours un enregistrement approprié

### Ce dont nous avons besoin de la communauté

Cela ne fonctionne que si c'est un effort communautaire. Voici ce qui est nécessaire :

| Rôle | Ce que vous apportez |
|------|---------------------|
| **Hôte d'infrastructure** | Une petite VM ou un hôte conteneurisé (2 CPU, 4 Go RAM) — pourrait tourner mensuellement |
| **Agent de liaison DFN-AAI** | Quelqu'un avec un enregistrement DFN-AAI existant qui peut enregistrer le SP partagé |
| **Gestionnaire de certificats** | Générer et faire tourner le certificat de signature SAML |
| **Testeurs** | Connecter votre configuration SP et vérifier le mapping d'attributs |
| **Rédacteurs de documentation** | Capturer les configurations fonctionnelles, les erreurs courantes et les résolutions |
| **Utilisateurs** | Tester avec de véritables identifiants IdP institutionnels (tout membre DFN-AAI) |

### Pour commencer

Si vous êtes intéressé à contribuer ou à utiliser une instance d'évaluation DFN-AAI partagée :

1. **Ouvrez une discussion GitHub** — évaluons l'intérêt et coordonnons-nous : [github.com/opendesk-edu/opendesk-edu/discussions](https://github.com/opendesk-edu/opendesk-edu/discussions)
2. **Consultez la documentation DFN-AAI** — comprenez ce qui est nécessaire : [`docs/dfn-aai-federation.md`](https://github.com/opendesk-edu/opendesk-edu/blob/main/docs/dfn-aai-federation.md)
3. **Testez avec les guides existants** — validez que notre configuration Keycloak fonctionne avec votre IdP
4. **Partagez votre expérience** — quels attributs votre établissement divulgue-t-il ? Quelles erreurs avez-vous rencontrées ? Quelles particularités de configuration avez-vous découvertes ?

### Ce que nous avons déjà fait

Les fondations sont en place :

- Configuration complète de Keycloak SAML SP/IdP documentée et révisée
- 10 mappeurs d'attributs eduGAIN (5 obligatoires + 5 recommandés) documentés avec les formats exacts de noms d'attributs SAML
- Script de génération de métadonnées SP avec support de certificat
- Guide de test bilingue (EN/FR) pour la fédération de test DFN-AAI
- 5 fichiers de documentation couvrant la fédération, l'inscription, l'intégration, les tests et le déploiement en production
- Déconnexion par canal arrière configurée pour tous les 25+ services openDesk Edu — la propagation de la déconnexion fonctionne de bout en bout

Ce qui manque, c'est l'infrastructure partagée. Et c'est là que nous avons besoin de vous.

## La fédération est un sport d'équipe

Le projet openDesk Edu est construit sur le principe que la technologie éducative devrait être souveraine, collaborative et ouverte. La fédération DFN-AAI incarne les trois :

- **Souveraine** — les établissements contrôlent leur propre infrastructure d'identité
- **Collaborative** — la fédération connecte les établissements, ne les isole pas
- **Ouverte** — SAML 2.0 et eduGAIN sont des standards ouverts, pas des protocoles propriétaires

Une instance d'évaluation partagée étend cette philosophie au processus d'évaluation lui-même. Au lieu que chaque établissement gravisse la même montagne seul, nous construisons le chemin ensemble — et tous ceux qui suivent bénéficient du sentier que nous avons dégagé.

**Rejoignez-nous. Testez votre configuration de fédération contre une instance partagée. Contribuez vos découvertes. Aidez à construire l'infrastructure d'évaluation dont chaque établissement a besoin.**

---

*Le travail sur la fédération DFN-AAI fait partie de la version openDesk Edu v1.1. Toute la documentation est disponible dans le [dépôt openDesk Edu](https://github.com/opendesk-edu/opendesk-edu). Pour toute question sur l'initiative d'évaluation partagée, ouvrez une discussion GitHub ou contactez la communauté.*

**openDesk Edu : Technologie éducative open-source souveraine, intégrée et prête pour la production.**
