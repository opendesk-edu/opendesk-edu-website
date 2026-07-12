---
title: "Extension du Service Intercom : Un Appel au Consensus Communauté-ZenDiS sur les Modèles de Développement Communs"
date: "2026-06-27"
description: "Comment nous avons étendu le service intercom d'openDesk pour prendre en charge OpenCloud, SOGo et ILIAS, et pourquoi nous exhortons ZenDiS et la communauté à établir un consensus formel sur les modèles de développement communs."
categories: ["Ingénierie", "Communauté", "Open Source"]
tags: ["intercom-service", "zendis", "opendesk", "extension", "communauté", "gouvernance"]
author: "Tobias Weiß et les contributeurs openDesk Edu"
image: "/static/blog/extending-intercom-service-community-consensus-teaser.svg"
---

# Extension du Service Intercom : Un Appel au Consensus Communauté-ZenDiS sur les Modèles de Développement Communs

## Introduction

Le **service intercom** (ICS) est un élément d'infrastructure petit mais critique dans l'écosystème openDesk. Il agit comme un intermédiaire qui permet la communication inter-applications basée sur le navigateur : sélecteurs de fichiers, intégration de visioconférence, authentification unique entre applications, et navigation portail.

Lorsque nous avons commencé à construire **openDesk Edu**, nous avons découvert que le service intercom upstream (maintenu par Univention et déployé par ZenDiS) était conçu principalement pour **openDesk CE** (Community Edition), en se concentrant sur **Nextcloud, OX App Suite et Matrix** comme intégrations principales.

Pour **openDesk Edu**, nous avions besoin d'intégrations supplémentaires pour **OpenCloud, SOGo et ILIAS**. Ceci est notre histoire d'extension du service intercom — et notre appel urgent pour un **consensus formel entre ZenDiS et la communauté** sur les modèles de développement communs.

## Le Service Intercom : Ce Qu'il Fait

Le service intercom est un proxy/broker léger qui s'exécute dans le contexte du navigateur. Il permet aux applications de :

- **Sélecteur de fichiers** : Ouvrir un fichier depuis Nextcloud/OpenCloud dans une autre application
- **Connexion silencieuse** : Transmettre les jetons OIDC entre applications sans interaction utilisateur
- **Navigation portail** : Récupérer le menu de navigation central depuis le Portail Univention
- **Intégration visioconférence** : Créer des salles BBB/Jitsi depuis d'autres applications
- **Déconnexion canal arrière** : Coordonner la terminaison de session OIDC

Ces fonctionnalités nécessitent que l'ICS soit **intégré en tant qu'iframe** dans chaque application, qui utilise ensuite **postMessage** pour communiquer avec l'application parente. L'ICS agit comme un intermédiaire de confiance qui détient les jetons OIDC de l'utilisateur et peut agir en son nom.

## Ce Que Nous Avons Étendu

Dans notre fork openDesk Edu, nous avons ajouté :

### 1. **Prise en charge d'OpenCloud** (route `/oc/`)

L'upstream ne prend en charge que Nextcloud (route `/fs/`). Nous avons ajouté une route `/oc/` parallèle pour OpenCloud, qui est notre service de fichiers principal dans openDesk Edu.

```typescript
// Nouveau : gestionnaire de route opencloud
router.get('/oc/*', handleOpenCloudProxy);

// Existant : route nextcloud (conservée pour compatibilité)
router.get('/fs/*', handleNextCloudProxy);
```

### 2. **Prise en charge de SOGo Groupware** (route `/sogo/`)

L'upstream ne prend pas en charge SOGo. Nous avons ajouté une route `/sogo/` qui proxifie les requêtes CalDAV et CardDAV vers le backend SOGo, permettant l'intégration calendrier et contacts entre applications.

### 3. **Prise en charge d'ILIAS LMS** (route `/ilias/`)

L'upstream ne prend pas en charge ILIAS. Nous avons ajouté une route `/ilias/` qui proxifie les appels d'API REST et les téléchargements de fichiers vers le backend ILIAS, permettant une intégration LMS approfondie.

### 4. **Image de Base Node.js Standard**

L'upstream nécessite l'**image de base Univention UCS**, qui fait plus de 2 Go avec de nombreuses dépendances spécifiques à Univention. Nous l'avons remplacée par une **image de base Node.js Alpine standard**, réduisant la taille de l'image à environ 150 Mo et rendant l'ICS déployable sur n'importe quel cluster Kubernetes sans dépendances Univention.

### 5. **`opendesk_username` comme Revendication par Défaut**

L'upstream utilise `username` comme revendication par défaut. Nous l'avons changé en `opendesk_username` pour correspondre à la convention de nommage des revendications d'openDesk Edu.

### 6. **Point de Terminaison de Santé** (`/health`)

Un simple point de terminaison `/health` retournant `{"status": "ok"}` pour les sondes de vivacité/disponibilité Kubernetes.

## Le Problème : Des Bases de Code Divergentes

Voici la vérité inconfortable : **notre fork diverge de l'upstream**.

Chaque fois que ZenDiS met à jour le service intercom upstream (par exemple, correctifs de sécurité, nouvelles fonctionnalités pour openDesk CE), nous sommes confrontés à un choix :

1. **Fusionner l'upstream et perdre nos modifications** → Nous perdrions la prise en charge d'OpenCloud, SOGo et ILIAS
2. **Rester sur notre fork et manquer les améliorations upstream** → Nous accumulerions une dette technique
3. **Rebaser manuellement et résoudre les conflits** → Cela prend des jours à chaque fois et est sujet aux erreurs

**Aucune de ces options n'est durable.** Nous avons besoin d'une meilleure approche.

## La Cause Profonde : Aucun Modèle de Développement Commun

Le problème fondamental est qu'il n'y a **aucun accord formel** entre :

- **ZenDiS** (le mainteneur principal de la plateforme openDesk)
- **La communauté openDesk Edu** (et potentiellement d'autres variantes d'openDesk)

...sur **comment les extensions comme la nôtre devraient être développées, contribuées et fusionnées**.

Aujourd'hui, la situation est :

- ZenDiS développe pour **openDesk CE** (focus secteur public)
- Nous développons pour **openDesk Edu** (focus secteur éducation)
- Les deux projets utilisent le **même service intercom upstream** mais avec des besoins différents
- Il n'y a **aucun canal officiel** pour contribuer nos modifications en retour
- Il n'y a **aucun modèle de gouvernance** pour gérer les forks divergents

## Ce Que Nous Exhortons : Un Consensus Formel ZenDiS-Communauté

Nous croyons qu'il est temps d'établir un **consensus formel** entre ZenDiS et la communauté sur les modèles de développement communs. Voici notre proposition :

### 1. **Accord de Licence de Contributeur (CLA)**

ZenDiS devrait fournir un CLA léger qui permet aux contributeurs externes de soumettre des modifications sans surcharge juridique complexe. C'est une pratique standard dans de nombreux projets open source (par exemple, CNCF, Apache Foundation).

### 2. **Architecture Générique et Modulaire**

Le service intercom devrait être refactorisé pour être **agnostique au service** avec une **architecture de plugins**. Au lieu de gestionnaires codés en dur pour Nextcloud, SOGo, OpenCloud, etc., il devrait y avoir une interface commune que n'importe quel service peut implémenter.

```typescript
// Proposé : Architecture modulaire
interface BackendService {
  name: string;
  baseUrl: string;
  healthCheck(): Promise<boolean>;
  proxyRequest(req: Request): Promise<Response>;
}

// Enregistrer n'importe quel service
registry.register('opencloud', new OpenCloudService());
registry.register('sogo', new SOGoService());
registry.register('ilias', new ILIASService());
```

Cela permettrait à openDesk Edu d'ajouter la prise en charge d'OpenCloud, SOGo et ILIAS en tant que **plugins** qui ne nécessitent pas de modifications upstream.

### 3. **Schéma de Configuration Commun**

Toutes les variantes d'openDesk devraient utiliser un **schéma de configuration commun** pour le service intercom. Cela facilite :

- Le déploiement de la même image à travers toutes les variantes
- Le partage des charts Helm et des manifestes Kubernetes
- Les tests d'intégration cohérents

```yaml
# Proposé : Schéma de config commun
intercom:
  backends:
    - name: nextcloud
      type: ocis  # ou "nextcloud", "opencloud", etc.
      url: https://nextcloud.example.com
    - name: sogo
      type: caldav
      url: https://sogo.example.com
```

### 4. **CI/CD pour les Tests Multi-Variantes**

Le CI/CD de ZenDiS devrait tester le service intercom contre **toutes les principales variantes d'openDesk** (CE, Edu, PME, etc.), pas seulement CE. Cela garantit que les modifications ne cassent pas les autres variantes.

### 5. **Appels Communautaires Réguliers**

Des appels communautaires mensuels ou bimestriels entre les mainteneurs ZenDiS et les contributeurs communautaires pour :

- Discuter des modifications à venir
- Coordonner les releases
- Résoudre les conflits tôt
- Partager les roadmaps

### 6. **Roadmap Publique**

ZenDiS devrait publier une **roadmap publique** pour le service intercom (et les autres composants partagés) afin que la communauté puisse planifier autour des modifications.

### 7. **Chemin de Contribution Clair**

Il devrait y avoir un **chemin clair et documenté** pour les contributions communautaires :

- Comment soumettre un PR
- Quels critères de revue sont utilisés
- Comment les fusions sont décidées
- Qui a les droits de fusion
- Comment les conflits sont résolus

## Pourquoi C'est Important pour la Souveraineté Numérique

Il ne s'agit pas seulement de qualité de code ou de commodité pour les développeurs. Cela a **de réelles implications pour la souveraineté numérique dans l'administration publique européenne**.

La plateforme openDesk est une **initiative stratégique** du gouvernement fédéral allemand pour fournir une alternative souveraine à Microsoft 365 et Google Workspace. Si la plateforme se fragmente en forks incompatibles, cela compromet la proposition de valeur fondamentale :

- **Interopérabilité** : Différentes agences gouvernementales utilisant différentes variantes d'openDesk devraient pouvoir collaborer
- **Maintenabilité** : Les forks qui divergent trop deviennent impossibles à maintenir
- **Adoption** : Les administrateurs publics sont réticents à adopter des plateformes fragmentées
- **Coût** : Chaque fork nécessite sa propre équipe de maintenance, augmentant le coût total

**Un consensus formel sur les modèles de développement communs est essentiel pour le succès à long terme d'openDesk en tant que plateforme souveraine.**

## Ce Que Nous Faisons en Attendant

En attendant un consensus officiel, nous faisons de notre mieux pour être de bons citoyens communautaires :

1. **Open-source notre fork** sur GitHub : https://github.com/opendesk-edu/opendesk/tree/main/helmfile/charts/intercom-service
2. **Soumettre des PRs upstream** pour toute modification qui pourrait être utile à tous
3. **Documenter nos modifications clairement** dans le README (voir la section "What's different from upstream")
4. **Maintenir la compatibilité** en conservant toutes les routes upstream intactes
5. **Contribuer en retour** des améliorations comme l'image de base Node.js standard

Nous n'essayons pas de forker le projet de façon permanente. **Nous voulons fusionner en retour**. Mais nous avons besoin d'un processus pour rendre cela possible.

## Une Proposition Concrète pour ZenDiS

À ZenDiS, nous proposons les **premières étapes** suivantes :

1. **Ouvrir un ticket GitHub** intitulé "RFC: Multi-variant intercom-service development" sur le dépôt univention/intercom-service
2. **Inviter les mainteneurs d'openDesk Edu, PME et autres variantes** à un appel de lancement
3. **Établir un groupe de travail** pour rédiger un guide de contribution
4. **Publier un modèle de CLA** pour les contributions communautaires
5. **Refactoriser le service intercom** pour qu'il soit plus modulaire (même une première étape simple aide)

Nous sommes prêts à contribuer notre temps, notre code et nos ressources pour que cela se réalise. **La balle est dans le camp de ZenDiS.**

## Conclusion : La Voie à Suivre

La plateforme openDesk est une réalisation remarquable — 25+ services open source intégrés, conformité à la protection des données allemande, et une véritable alternative aux géants du SaaS américains. Mais son succès à long terme dépend de la **collaboration, pas de la fragmentation**.

Nous exhortons ZenDiS à travailler avec la communauté pour établir des **modèles de développement communs** pour les composants partagés comme le service intercom. Il ne s'agit pas seulement de nous faciliter la vie — il s'agit de garantir qu'openDesk reste une **plateforme souveraine viable** pour le long terme.

**Construisons cela ensemble.**

---

## Appel à l'Action

Si vous partagez cette vision, voici comment vous pouvez aider :

1. **Partager cet article** avec la communauté openDesk
2. **Interagir avec ZenDiS** sur les réseaux sociaux et lors des conférences
3. **Contribuer** au service intercom ou à d'autres composants partagés
4. **Commenter** le ticket GitHub (une fois qu'il existe) avec votre cas d'usage
5. **Documenter** les besoins de votre propre variante d'openDesk

Ensemble, nous pouvons construire une véritable infrastructure numérique souveraine pour l'administration publique et l'éducation européennes.

---

**À Propos des Auteurs** : Cet article a été écrit par la communauté openDesk Edu. openDesk Edu est un déploiement en production de 25 services open source intégrés pour les établissements d'enseignement allemands, basé au HRZ Marburg. Voir [opendesk-edu.org](https://opendesk-edu.org) pour plus d'informations.

**Licence** : Cet article est sous licence Apache-2.0.
