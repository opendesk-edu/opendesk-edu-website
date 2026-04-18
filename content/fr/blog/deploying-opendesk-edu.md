---
title: "Déployer openDesk Edu sur l'infrastructure de votre université"
date: "2026-04-18"
description: "Un guide pas à pas pour déployer openDesk Edu — de la configuration de votre cluster Kubernetes à la mise en place de la fédération SAML avec DFN-AAI et eduGAIN."
categories: ["Tutoriel"]
tags: ["déploiement", "infrastructure", "kubernetes"]
---

# Déployer openDesk Edu sur l'infrastructure de votre université

Ce guide vous accompagne dans le déploiement d'openDesk Edu sur l'infrastructure Kubernetes de votre université. À l'issue de ce processus, vous disposerez d'un espace de travail numérique complet avec 25 services intégrés, tous connectés via un SSO Keycloak unifié.

## Prérequis

Avant de commencer, vérifiez que les éléments suivants sont en place :

- **Cluster Kubernetes** — version 1.28 ou supérieure. Il peut s'agir d'un cluster bare-metal, d'une offre cloud gérée ou d'un déploiement on-premise comme Proxmox VE ou OpenStack.
- **Helm 3** — le gestionnaire de paquets pour Kubernetes. Installez-le depuis [helm.sh](https://helm.sh).
- **Helmfile** — la couche d'orchestration qui gère tous les charts openDesk Edu. Installez-le depuis [helmfile.readthedocs.io](https://helmfile.readthedocs.io/).
- **Un nom de domaine et des enregistrements DNS** — vous avez besoin d'un domaine de base (par ex. `desk.univ-exemple.fr`) avec un DNS wildcard pointant vers votre contrôleur d'ingress. Les certificats TLS seront provisionnés automatiquement.
- **Ressources suffisantes** — prévoyez au minimum 8 cœurs CPU et 16 Go de RAM pour un déploiement en production. Les besoins en stockage dépendent du nombre d'utilisateurs et des services activés.

## Étape 1 : Cloner le dépôt

Commencez par cloner le dépôt openDesk Edu :

```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
cd opendesk-edu
```

Prenez un moment pour parcourir la structure des répertoires. Les répertoires clés sont :

- `helmfile/` — contient toutes les configurations helmfile et les environnements
- `charts/` — charts Helm individuels pour chaque service
- `docs/` — documentation détaillée sur la configuration, la mise à l'échelle et la supervision

## Étape 2 : Configurer les valeurs

Le fichier de configuration central est `helmfile/environments/default/global.yaml.gotmpl`. Ce fichier template Go contrôle les paramètres de chaque service de la plateforme. Ouvrez-le dans votre éditeur et ajustez les éléments suivants :

**Configuration du domaine :**

```yaml
global:
  domain: "desk.univ-exemple.fr"
```

**Paramètres de messagerie** — nécessaires pour la messagerie unifiée et les services de notification :

```yaml
global:
  mail:
    host: "smtp.univ-exemple.fr"
    port: 587
    fromAddress: "noreply@univ-exemple.fr"
```

**Classe de stockage** — définissez-la en fonction du fournisseur de stockage de votre cluster :

```yaml
global:
  storageClass: "ceph-rbd"
```

**Sélection des services** — vous pouvez activer ou désactiver des services individuels. Si votre université utilise déjà Moodle, vous pouvez le désactiver et conserver ILIAS :

```yaml
services:
  ilias:
    enabled: true
  moodle:
    enabled: false
  bigbluebutton:
    enabled: true
```

Le système de templates propage ces valeurs à tous les charts dépendants, vous n'avez donc jamais besoin de modifier les fichiers de valeurs des charts individuels.

## Étape 3 : Déployer avec Helmfile

Une fois votre configuration prête, lancez le déploiement :

```bash
helmfile -e default apply
```

Cette seule commande rend tous les charts Helm avec votre configuration, résout l'ordre des dépendances et déploie l'ensemble de la plateforme sur votre cluster. Helmfile gère la séquence de déploiement — les services d'infrastructure comme Keycloak et le contrôleur d'ingress sont déployés en premier, suivis des services applicatifs.

Le déploiement initial prend généralement entre 10 et 20 minutes selon la capacité de votre cluster et la vitesse du réseau. Vous pouvez suivre la progression avec :

```bash
kubectl get pods -n opendesk -w
```

Attendez que tous les pods affichent l'état `Running` avant de passer à l'étape suivante.

## Étape 4 : Configurer SAML/SSO avec Keycloak

openDesk Edu utilise Keycloak comme fournisseur d'identité central. Pour les déploiements universitaires, l'approche recommandée consiste à intégrer la fédération SAML existante de votre établissement — DFN-AAI en Allemagne, ou eduGAIN au niveau international.

**Configurez le fournisseur d'identité SAML dans Keycloak :**

1. Accédez à la console d'administration Keycloak à `https://keycloak.desk.univ-exemple.fr`
2. Naviguez vers votre realm et ajoutez un nouveau fournisseur d'identité SAML
3. Importez le XML des métadonnées de votre fédération (disponible depuis l'interface de gestion DFN-AAI ou eduGAIN)
4. Mappez les attributs SAML aux attributs utilisateur Keycloak :

| Attribut SAML | Mappage Keycloak | Usage |
|---|---|---|
| `eduPersonPrincipalName` | username | Identifiant unique |
| `eduPersonAffiliation` | rôles | Étudiant/personnel/enseignant |
| `eduPersonEntitlement` | groupes | Groupes de cours et permissions |
| `mail` | email | Adresse de contact |

**Pour ILIAS, Moodle et BigBlueButton**, openDesk Edu déploie Shibboleth comme proxy SAML. Ces services reçoivent leurs attributs via Shibboleth plutôt que directement depuis Keycloak. Le proxy gère le filtrage des attributs et les politiques par service, ce qui maintient vos métadonnées de fédération propres.

Après avoir configuré le fournisseur d'identité, testez le flux de connexion en accédant au portail Nubus. Vous devriez être redirigé vers la page de connexion de votre établissement, puis revenir au portail avec vos attributs de fédération renseignés.

## Étape 5 : Vérifier le déploiement

Parcourez cette liste de contrôle pour confirmer que tout fonctionne :

1. **Accès au portail** — ouvrez `https://desk.univ-exemple.fr` dans votre navigateur. Le portail Nubus devrait se charger avec tous les services activés.
2. **Connexion SSO** — cliquez sur n'importe quel service. Vous devriez être authentifié via Keycloak sans être invité à saisir vos identifiants à nouveau.
3. **Partage de fichiers** — créez un fichier test dans Nextcloud ou OpenCloud et vérifiez qu'il persiste après rechargement de la page.
4. **Visioconférence** — lancez une réunion test dans Jitsi ou BigBlueButton et vérifiez que l'audio et la vidéo fonctionnent.
5. **Accès au LMS** — connectez-vous à ILIAS ou Moodle et confirmez que vos attributs de fédération (nom, email, rôle) sont correctement affichés.

Si un service affiche des erreurs, consultez les logs des pods :

```bash
kubectl logs -n opendesk -l app.kubernetes.io/name=<nom-du-service> --tail=50
```

## Dépannage

Voici les problèmes les plus courants et leurs solutions :

**Pods bloqués en `Pending`** — généralement un problème de ressources ou de stockage. Vérifiez la capacité des nœuds avec `kubectl describe pod <nom>` et assurez-vous que votre classe de stockage est disponible.

**Erreurs de certificat** — l'opérateur openDesk Certificates gère le TLS automatiquement. Si les certificats ne sont pas provisionnés, vérifiez que les enregistrements DNS de votre domaine sont corrects et que l'opérateur peut atteindre l'autorité de certification Bundesdruckerei. Vous pouvez aussi configurer cert-manager avec Let's Encrypt en solution de secours.

**Boucle de redirection SSO** — cela signifie généralement que les métadonnées du fournisseur d'identité SAML sont mal configurées ou que l'URL du service consommateur d'assertions ne correspond pas à votre domaine. Vérifiez les paramètres du fournisseur d'identité Keycloak et assurez-vous que vos URLs de service utilisent HTTPS.

**Utilisation mémoire élevée** — BigBlueButton et Collabora sont les services les plus gourmands en ressources. Si vous disposez de matériel limité, désactivez BigBlueButton et utilisez Jitsi à la place, ou définissez des limites de ressources dans la configuration globale.

**Échecs de sauvegarde** — openDesk Edu utilise k8up pour les sauvegardes automatisées. Si les sauvegardes échouent, consultez les logs de l'opérateur k8up et vérifiez que votre point d'accès de stockage compatible S3 est accessible depuis le cluster.

## Et ensuite ?

Une fois votre déploiement opérationnel, envisagez les étapes suivantes :

- Mettez en place la supervision avec des tableaux de bord Prometheus et Grafana pour la santé des services
- Configurez les planifications de sauvegarde et testez les procédures de restauration
- Personnalisez le thème du portail pour qu'il corresponde à l'identité visuelle de votre université
- Consultez la documentation sur les permissions pour configurer le contrôle d'accès basé sur les rôles

Pour plus de détails, consultez la documentation complète sur [codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu).
