---
title: "Alternatives de composants"
date: "2026-04-15"
description: "Comparez les composants alternatifs disponibles dans openDesk Edu, notamment la messagerie, la visioconférence, le stockage de fichiers et les outils de tableau blanc."
categories: ["architecture", "composants"]
tags: ["comparaison", "alternatives", "courriel", "video", "fichiers", "tableau-blanc"]
---

# Alternatives de composants

openDesk Edu propose des choix pour certaines catégories de services. Au lieu de vous enfermer dans une seule implémentation, il vous permet de sélectionner le composant adapté à la taille, aux flux de travail et aux exigences de conformité de votre établissement.

Quatre catégories offrent des alternatives : messagerie et groupware, visioconférence, fichiers et stockage cloud, et tableaux blancs. Dans la plupart des catégories, une seule option peut être active à la fois. Les exceptions sont indiquées ci-dessous.

Tous les choix de composants sont configurés dans un seul fichier : `helmfile/environments/default/global.yaml.gotmpl`.

---

## Messagerie et groupware

Trois suites groupware sont disponibles. Une seule peut être active à un moment donné.

| Fonctionnalité | OX App Suite | SOGo | Grommunio |
|---|---|---|---|
| Périmètre | Suite groupware entreprise complète | Webmail léger avec agenda | Groupware avec synchronisation mobile native |
| Licence | GPL-2.0 / AGPL-3.0 | LGPL-2.1 | AGPL-3.0 |
| Version | 8.46 | 5.11 | 2025.01 |
| Agenda | Oui | Oui | Oui |
| Contacts | Oui | Oui | Oui |
| Tâches | Oui | Oui | Oui |
| Prise en charge ActiveSync | Oui | Non | Oui (ActiveSync 16.1) |
| Notifications push mobiles | Oui | Non | Oui |
| Gestion des ressources | Oui | Limitée | Oui |
| Boîtes mail partagées | Oui | Oui | Oui |

**OX App Suite** est l'option la plus complète. Elle fournit une plateforme groupware complète avec messagerie, agenda, contacts, tâches, édition de documents et gestion des ressources. Son héritage entreprise se manifeste dans des fonctionnalités comme les boîtes mail partagées, la délégation et les contrôles d'accès granulaires. Le compromis est la complexité : OX nécessite plus de ressources serveur et une courbe d'apprentissage plus raide pour les administrateurs.

**SOGo** garde les choses simples. Il offre un webmail fiable associé à la gestion d'agenda et de contacts dans un ensemble léger. Si votre établissement a principalement besoin de messagerie avec une planification basique, SOGo fait le travail avec moins de ressources matérielles. La limitation principale est l'absence de push mobile natif via ActiveSync, ce qui oblige les utilisateurs mobiles à recourir à IMAP et CalDAV.

**Grommunio** occupe le juste milieu. Sa fonctionnalité phare est la prise en charge d'ActiveSync 16.1, offrant une intégration native Outlook et appareils mobiles prête à l'emploi. C'est important pour les établissements qui ont besoin d'une synchronisation mobile étroite sans application tierce. Grommunio fournit également un client web moderne et des fonctionnalités groupware complètes.

Une seule de ces trois suites peut être active à la fois. Passer de l'une à l'autre nécessite de mettre à jour la configuration et de réappliquer le Helmfile, ainsi que de planifier la migration des données si des utilisateurs ont déjà des boîtes mail.

---

## Visioconférence

Deux outils de visioconférence sont disponibles. Contrairement à la catégorie groupware, les deux peuvent fonctionner simultanément.

| Fonctionnalité | Jitsi | BigBlueButton |
|---|---|---|
| Périmètre | Réunions ad hoc rapides | Cours complets avec outils interactifs |
| Licence | Apache-2.0 | LGPL-3.0 |
| Version | 2.0.10590 | 2.7 (Bêta) |
| Partage d'écran | Oui | Oui |
| Enregistrement | Oui | Oui |
| Tableau blanc | Non | Oui |
| Salles de sous-groupes | Non | Oui |
| Sondages | Non | Oui |
| Mode présentation | Non | Oui |
| Participants max | ~50 (selon le serveur) | ~200+ |
| Intégration Moodle | Limitée | Oui |

**Jitsi** excelle pour les réunions rapides et informelles. Créez un salon, partagez un lien et commencez à discuter. Il fonctionne bien pour les heures de bureau individuelles, les petits appels d'équipe et les discussions spontanées. L'installation est simple et l'utilisation des ressources est modérée. Jitsi ne propose pas de salles de sous-groupes, de sondages intégrés ni de tableau blanc, ce qui le rend moins adapté aux sessions d'enseignement structurées.

**BigBlueButton** est conçu pour l'éducation. Il intègre un tableau blanc virtuel, des diapositives de présentation, des salles de sous-groupes, des sondages et l'enregistrement de sessions dans une seule interface. Ces fonctionnalités en font un bon choix pour les cours complets, les séminaires et les ateliers où l'enseignant doit gérer un grand groupe. BigBlueButton est marqué comme Bêta dans openDesk Edu, ce qui signifie que l'intégration est fonctionnelle mais encore en cours d'affinage.

Les deux outils pouvant coexister, les établissements peuvent utiliser Jitsi pour les appels quotidiens rapides et réserver BigBlueButton pour les cours planifiés nécessitant ses fonctionnalités avancées.

---

## Fichiers et stockage cloud

Deux plateformes de partage de fichiers sont disponibles. Une seule peut être active à la fois.

| Fonctionnalité | Nextcloud | OpenCloud |
|---|---|---|
| Périmètre | Suite cloud complète | Partage léger basé sur CS3 |
| Licence | AGPL-3.0 | Apache-2.0 |
| Version | 32.0.6 | 4.0.3 (Bêta) |
| Client de synchronisation | Oui | Oui |
| Interface web | Oui | Oui |
| Édition collaborative | Oui (via Nextcloud Office) | Limitée |
| Partages par cours | Via API de partage | Prise en charge native |
| Agenda | Oui | Non |
| Contacts | Oui | Non |
| Talk (chat) | Oui | Non |
| Montages de stockage externe | Oui | Limité |
| Écosystème d'applications | Vaste | Minimal |

**Nextcloud** est une plateforme cloud auto-hébergée complète. Au-delà du stockage de fichiers, elle regroupe agenda, contacts, chat en temps réel (Nextcloud Talk), édition collaborative de documents et un vaste écosystème d'applications. Elle s'intègre bien aux outils existants et peut monter des backends de stockage externes. L'étendue des fonctionnalités implique plus de complexité et de ressources, mais pour les établissements qui veulent une plateforme unique couvrant de nombreuses tâches collaboratives, Nextcloud est le choix évident.

**OpenCloud** adopte une approche plus ciblée. Basé sur le protocole Collabora Spaces 3 (CS3), il offre un partage de fichiers léger avec des capacités natives de partage par cours. Cela le rend particulièrement intéressant pour les configurations éducatives où les fichiers doivent être liés à des cours spécifiques. OpenCloud est marqué comme Bêta, indiquant que l'intégration est encore en évolution.

Une seule solution de stockage de fichiers peut être active. Choisissez Nextcloud si vous avez besoin de la plateforme complète, ou OpenCloud si vous souhaitez un partage de fichiers plus léger et orienté cours.

---

## Tableau blanc

Deux outils de tableau blanc sont disponibles. Les deux peuvent fonctionner simultanément.

| Fonctionnalité | Excalidraw | CryptPad Diagrammes |
|---|---|---|
| Périmètre | Dessin libre et diagrammes | Diagrammes collaboratifs respectueux de la vie privée |
| Licence | MIT | AGPL-3.0 |
| Version | Dernière | 2025.9.0 |
| Dessin à main levée | Oui | Limité |
| Formes et flèches | Oui | Oui |
| Collaboration en temps réel | Oui | Oui |
| Chiffrement de bout en bout | Non | Oui |
| Modèles | Non | Oui |
| Formats d'export | SVG, PNG, JSON | SVG, PNG |
| Protection de la vie privée par conception | Non | Oui |

**Excalidraw** est un tableau blanc virtuel qui donne l'impression de dessiner sur papier. Son style dessiné à main levée le rend accessible pour le brainstorming, les diagrammes rapides et les explications informelles. La collaboration fonctionne en temps réel et les options d'export couvrent les formats courants. La licence MIT permet une intégration propre dans openDesk Edu.

**CryptPad Diagrammes** adopte une approche centrée sur la vie privée. Tous les diagrammes sont chiffrés de bout en bout, ce qui signifie que même l'administrateur serveur ne peut pas voir le contenu. C'est un bon choix pour les établissements avec des exigences strictes en matière de protection des données. Il offre également des modèles et une expérience de diagramme plus structurée par rapport au canevas libre d'Excalidraw.

Les deux tableaux blancs pouvant coexister, les utilisateurs peuvent choisir l'outil adapté à leur tâche : Excalidraw pour le brainstorming rapide, CryptPad pour les diagrammes sensibles nécessitant un chiffrement.

---

## Choisir les bons composants

Il n'existe pas de combinaison "meilleure" universelle. Le bon choix dépend des priorités de votre établissement.

**Les petits établissements** (écoles, petits départements) privilégient généralement la simplicité. SOGo pour la messagerie, Jitsi pour la vidéo et l'une des options de stockage de fichiers gardent l'infrastructure gérable. L'empreinte ressources réduite permet de fonctionner sur du matériel modeste.

**Les grandes universités** ont généralement besoin de l'ensemble complet des fonctionnalités. OX App Suite gère les configurations mail complexes, BigBlueButton anime de grands cours avec des salles de sous-groupes, et Nextcloud fournit la large plateforme collaborative. Cette combinaison demande plus de ressources serveur et de capacité administrative, mais couvre presque tous les cas d'usage.

**Les établissements axés sur la recherche** pourraient privilégier la flexibilité et la confidentialité. Nextcloud offre aux chercheurs l'espace pour partager de grands jeux de données, Excalidraw supporte les explications visuelles rapides, et CryptPad traite des diagrammes impliquant des données sensibles. Associer Grommunio pour la messagerie garantit aux chercheurs une synchronisation mobile solide sans quitter l'infrastructure auto-hébergée.

---

## Changer de composants

Changer un composant est une modification de configuration, pas une réinstallation.

1. Ouvrez `helmfile/environments/default/global.yaml.gotmpl` dans votre dépôt de déploiement.
2. Repérez la section de la catégorie que vous souhaitez modifier (messagerie, vidéo, fichiers ou tableau blanc).
3. Définissez le composant actif et commentez ou supprimez l'alternative.
4. Exécutez `helmfile apply` pour mettre à jour le déploiement.

La **migration des données** est la partie qui nécessite de l'attention. Lorsque vous changez entre des composants mutuellement exclusifs (messagerie ou stockage de fichiers), les données utilisateur existantes ne sont pas transférées automatiquement. Planifiez :

- L'exportation des boîtes mail de l'ancien groupware et leur importation dans le nouveau.
- La migration des fichiers d'un backend de stockage à l'autre.
- La mise à jour des favoris et des liens partagés des utilisateurs.
- La communication du changement aux utilisateurs en amont.

Pour les catégories où les deux outils coexistent (visioconférence et tableaux blancs), aucune migration n'est nécessaire. Les utilisateurs commencent simplement à utiliser le nouvel outil aux côtés de l'existant.
