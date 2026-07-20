---
title: "TL;DR : Accord du contributeur openDesk"
date: "2026-07-12"
description: "Un guide rapide pour signer le CLA et commencer votre première contribution à openDesk."
categories: ["Communauté"]
tags: ["contribution", "cla", "open-source"]
image: "/static/blog/contributor-agreement-tldr-teaser.svg"
---

# TL;DR : Accord du contributeur openDesk

Vous souhaitez contribuer à openDesk. Génial. openDesk est une plateforme pilotée par la communauté, et chaque contribution commence par une chose : signer le Contributor License Agreement (CLA). Ce guide explique ce que c'est, pourquoi ça existe et comment accomplir le processus en moins de dix minutes.

## Pourquoi un CLA ?

openDesk est publié sous licence Apache 2.0, une licence open-source permissive qui donne à chacun la liberté d'utiliser, de modifier et de distribuer le logiciel. Mais openDesk est également développé par plusieurs organisations. Universités, fournisseurs de services et contributeurs individuels soumettent tous du code. Le CLA garantit que chaque contribution comporte une cession de droits claire.

Sans CLA, le projet pourrait faire face à une incertitude juridique. Le contributeur avait-il le droit de soumettre ce code ? Son employeur peut-il y prétendre ? Le CLA répond à ces questions avant que le code n'entre dans le dépôt. Il protège à la fois le contributeur (personne ne peut prétendre qu'il n'a pas autorisé sa contribution) et le projet (la base de code reste correctement licenciée).

## Le processus en deux étapes

Contribuer est un workflow en deux étapes :

1.  **Soumettre une demande d'accès.** Vous demandez l'accès au projet sur GitLab.
2.  **Effectuer un commit signé.** Votre première demande de fusion doit inclure au moins un commit signé avec votre clé GPG ou SSH.

C'est tout. Une fois que vous avez terminé les deux étapes, le bot prend le relais.

## Comment fonctionne le bot

Le bot CLA s'exécute toutes les 15 minutes. Il vérifie les nouvelles demandes d'accès sur GitLab, vérifie les commits signés et accorde l'accès automatiquement. Vous n'avez pas besoin d'attendre un relecteur humain. Si votre commit est correctement signé et votre demande d'accès soumise, le bot s'occupe du reste.

Sous le capot, le bot vérifie :

-   Que votre commit est cryptographiquement signé (GPG ou SSH).
-   Que l'e-mail associé à la signature correspond à votre profil GitLab.
-   Que le message de commit inclut le marqueur `userid:username` (plus de détails ci-dessous).

Tout est en ordre ? L'accès est accordé dans le cycle suivant du bot. Aucune approbation manuelle nécessaire.

## À quoi ressemble un commit signé

Un commit signé ressemble à ceci dans le journal Git :

```
commit a1b2c3d4e5f6...
Author: Votre Nom <votre.email@example.com>
Date:   Mon Jul 7 14:23:00 2026 +0200

    Implémentation initiale du module widget

    userid:votre-nom-utilisateur-gitlab
```

La partie critique est la dernière ligne du corps du message de commit. Elle doit contenir `userid:` suivi de votre nom d'utilisateur GitLab. C'est ainsi que le bot fait correspondre le commit signé à votre demande d'accès.

## Configuration de la signature des commits

Si vous n'avez jamais signé un commit auparavant, voici la version courte.

**Signature GPG :**

1.  Générer une clé GPG : `gpg --full-generate-key`
2.  Trouver l'ID de la clé : `gpg --list-secret-keys --keyid-format=long`
3.  Configurer Git : `git config --global user.signingkey <ID-CLÉ>`
4.  Activer la signature globalement : `git config --global commit.gpgsign true`
5.  Ajouter la clé publique à votre profil GitLab (Paramètres > GPG Keys).

**Signature SSH :**

1.  Utiliser votre clé SSH existante ou en générer une nouvelle.
2.  Configurer Git : `git config --global gpg.format ssh`
3.  Définir la clé de signature : `git config --global user.signingkey ~/.ssh/id_ed25519.pub`
4.  Ajouter la clé publique à votre profil GitLab (Paramètres > SSH Keys).

Ensuite, signez votre commit : `git commit -S -m "Votre message"` (le drapeau `-S` déclenche la signature).

## Après la fusion de votre demande de fusion

Une fois votre première demande de fusion acceptée et traitée par le bot, vous recevez un espace de noms de fork personnel sur GitLab. C'est votre propre espace de travail dans le projet openDesk, nommé d'après votre nom d'utilisateur GitLab. Vous pouvez l'utiliser pour créer des demandes de fusion, collaborer sur des fonctionnalités et gérer vos contributions sans affecter le dépôt principal.

## Où trouver les dépôts

Le projet openDesk s'étend sur plusieurs dépôts, chacun avec un objectif spécifique :

-   **Déploiement :** La configuration de déploiement principale basée sur helmfile pour openDesk CE.
-   **Variante éducation :** openDesk Edu avec 25 services intégrés pour les universités.
-   **Outillage :** Scripts d'importation, opérateurs de sauvegarde (k8up) et outils utilitaires.
-   **Documentation :** Documents d'architecture, guides développeurs et manuels opérationnels.
-   **Charts :** Remplacements locaux de charts Helm et packages de charts maintenus par la communauté.
-   **Variante Compose :** Une alternative Docker Compose pour les déploiements plus petits.

Tous les dépôts se trouvent dans le [groupe GitLab openDesk](https://gitlab.opencode.de/bmi/opendesk). Parcourez la liste des projets, trouvez quelque chose qui vous intéresse et commencez à contribuer.

## Le dépôt CLA

L'infrastructure CLA est également open-source. Vous pouvez inspecter le code du bot, examiner le texte de l'accord et même contribuer des améliorations aux outils CLA eux-mêmes. Tout se trouve dans le [dépôt cla-signer](https://gitlab.opencode.de/bmi/opendesk/contributing/cla-signer).

---

Prêt à contribuer ? Soumettez votre demande d'accès sur GitLab, signez votre premier commit et rejoignez la communauté openDesk.
