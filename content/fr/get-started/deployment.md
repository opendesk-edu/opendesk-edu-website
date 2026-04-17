---
title: "Guide de deploiement"
date: "2026-04-15"
description: "Guide pas a pas pour deployer openDesk Edu sur l'infrastructure Kubernetes de votre universite."
categories: ["deploiement", "guide"]
tags: ["deploiement", "kubernetes", "helm", "helmfile", "keycloak"]
---

# Guide de deploiement

openDesk Edu est un espace de travail numerique modulaire concu pour les etablissements d'enseignement. Il regroupe des outils de collaboration, des plateformes d'apprentissage et des applications bureautiques dans un environnement qui fonctionne sur Kubernetes. Tous les services sont distribues sous forme de charts Helm et orchestres via helmfile, ce qui permet de deployer l'ensemble de la pile avec une seule commande.

Ce guide couvre le processus complet de deploiement, d'un cluster vierge a une plateforme fonctionnelle avec authentification, sauvegardes et certificats TLS.

## Prerequis

Avant de commencer, verifiez que les elements suivants sont en place :

- **Kubernetes 1.28 ou superieur**. openDesk Edu utilise des CRDs et Pod Security Admission qui necessitent un cluster recent. Les offres managees comme Hetzner Cloud Kubernetes, OVH Managed Kubernetes ou les clusters on-premise avec kubeadm fonctionnent tous.
- **Helm 3** installe et configure avec acces au cluster.
- **helmfile** installe. C'est la couche d'orchestration qui lit votre configuration et applique tous les releases Helm dans le bon ordre.
- **Un nom de domaine avec acces DNS**. Vous avez besoin d'un domaine de base (par exemple, `desk.uni-exemple.fr`) et de la possibilite de creer des enregistrements de sous-domaine pour chaque service.
- **Acces a un fournisseur d'identite SAML (IdP)**. openDesk Edu authentifie les utilisateurs via Keycloak, qui se connecte au fournisseur d'identite de votre universite. En Allemagne, cela signifie generalement un membre de la federation DFN-AAI ou eduGAIN.
- **Minimum 16 Go de RAM et 4 coeurs CPU**. C'est le minimum pour les services principaux d'openDesk. Les services educatifs (ILIAS, Moodle, BigBlueButton, OpenCloud) ajoutent des besoins significatifs en ressources. Pour un deploiement en production avec tous les services actives, prevoyez 32 Go de RAM et 8 coeurs CPU ou plus.

## Demarrage rapide

Le chemin le plus rapide vers une installation openDesk Edu fonctionnelle comprend quatre etapes.

### 1. Cloner le depot

```bash
git clone https://git.opencode.de/opendesk/edu-deployment.git
cd edu-deployment
```

Ce depot contient la configuration helmfile, les definitions d'environnement et les surcharges de valeurs personnalisees pour tous les services openDesk Edu.

### 2. Modifier la configuration globale

Ouvrez `helmfile/environments/default/global.yaml.gotmpl` dans votre editeur. Au minimum, vous devez definir votre domaine et choisir les services a activer :

```yaml
domain: desk.uni-exemple.fr

services:
  keycloak:
    enabled: true
  nextcloud:
    enabled: true
  ox:
    enabled: false
  sogo:
    enabled: false
  grommunio:
    enabled: true
  jitsi:
    enabled: false
  bbb:
    enabled: true
  ilias:
    enabled: true
  moodle:
    enabled: false
  opencloud:
    enabled: true
  excalidraw:
    enabled: true
  cryptpad:
    enabled: false
```

Chaque service peut etre active ou desactive independamment. Le fichier de configuration utilise la syntaxe de templates Go (`.gotmpl`), ce qui permet de referencer des valeurs partagees comme le domaine dans toutes les definitions de services.

### 3. Deployer

```bash
helmfile -e default apply
```

helmfile lit la configuration de l'environnement, resout toutes les dependances entre les services et applique chaque chart Helm dans l'ordre. Keycloak est deploye en premier car les autres services en dependent pour l'authentification. Comptez 10 a 20 minutes sur un cluster vierge selon les services actives et la vitesse de votre reseau.

### 4. Acceder aux services

Une fois le deploiement termine, chaque service est accessible sur son sous-domaine :

| Service | URL |
|---------|-----|
| Keycloak Admin | `https://keycloak.desk.uni-exemple.fr` |
| Nextcloud | `https://nextcloud.desk.uni-exemple.fr` |
| Grommunio | `https://grommunio.desk.uni-exemple.fr` |
| BigBlueButton | `https://bbb.desk.uni-exemple.fr` |
| ILIAS | `https://ilias.desk.uni-exemple.fr` |
| OpenCloud | `https://opencloud.desk.uni-exemple.fr` |

Les identifiants administrateur Keycloak sont generes lors du premier deploiement et stockes dans un secret Kubernetes. Recuperez-les avec :

```bash
kubectl get secret -n opendesk keycloak-admin -o jsonpath='{.data.password}' | base64 -d
```

## Configuration

Le fichier `helmfile/environments/default/global.yaml.gotmpl` est la configuration centrale de toute votre installation openDesk Edu. Chaque service lit ses valeurs depuis ce fichier, et vous pouvez surcharger toute valeur par defaut des charts Helm ici.

### Domaine et ingress

Le champ `domain` definit l'URL de base pour tous les services. Chaque chart construit sa propre regle d'ingress en ajoutant son nom de service (par exemple, `nextcloud`) au domaine de base. Si vous utilisez un reverse proxy ou un equilibreur de charge externe, vous pouvez aussi definir `ingress.className` pour pointer vers votre controleur Ingress.

### Parametres Keycloak

Keycloak agit comme courtier d'identite central. Dans la configuration globale, vous pouvez definir le nom d'utilisateur admin, le nom du realm et le theme par defaut. Les flux d'authentification et les enregistrements de clients pour chaque service sont geres automatiquement par les charts Helm.

### Composants alternatifs

openDesk Edu propose plusieurs implementations pour plusieurs categories de services. Vous choisissez celle a activer, et le fichier de configuration s'assure qu'une seule par categorie est active :

- **Messagerie** : Open-Xchange (OX), SOGo ou Grommunio
- **Visioconference** : Jitsi Meet ou BigBlueButton
- **Stockage de fichiers** : Nextcloud ou OpenCloud
- **Tableau blanc** : Excalidraw ou CryptPad

Definissez `enabled: true` sur le composant souhaite et `enabled: false` sur les autres de la meme categorie. N'activez jamais deux alternatives en meme temps, car elles entreraient en conflit sur les routes d'ingress et les identifiants de client Keycloak.

## Configuration de l'authentification

Keycloak sert de fournisseur d'identite central pour tous les services openDesk Edu. Il prend en charge SAML 2.0 et OpenID Connect (OIDC), ce qui lui permet de s'integrer a l'infrastructure existante de votre universite et de fournir un authentification unique sur toutes les applications.

### Connexion au fournisseur d'identite de votre universite

La plupart des universites allemandes participent a la federation DFN-AAI, qui fait partie du reseau mondial eduGAIN. Keycloak se connecte a ces federations via une liaison SAML 2.0 avec un fournisseur d'identite (IdP).

Pour configurer la connexion :

1. Connectez-vous a la console d'administration Keycloak sur `https://keycloak.desk.uni-exemple.fr`.
2. Naviguez vers votre realm et creez un nouveau fournisseur d'identite de type SAML 2.0.
3. Saisissez l'URL des metadonnees de l'IdP de votre universite (fournie par votre operateur de federation DFN-AAI).
4. Configurez l'identifiant SAML entity ID pour qu'il corresponde a la valeur enregistree aupres de votre federation.
5. Activez le fournisseur d'identite et testez le flux de connexion.

### Support des protocoles

Chaque service en aval utilise le protocole le plus adapte :

- **SAML 2.0** : utilise par ILIAS et Moodle via la configuration du fournisseur de services Shibboleth (SP). Ces plateformes LMS attendent des assertions SAML d'un IdP de confiance, que Keycloak fournit.
- **OIDC** : utilise par Nextcloud, OpenCloud, Grommunio, BigBlueButton et Excalidraw. OIDC est le protocole plus moderne et plus simple a configurer pour les applications web.

### Shibboleth SP pour les services LMS

ILIAS et Moodle utilisent Shibboleth comme fournisseur de services pour consommer les assertions SAML de Keycloak. Les charts Helm openDesk Edu incluent des conteneurs sidecar Shibboleth SP pour ces services. La configuration SP est generee automatiquement a partir des parametres du realm Keycloak, vous n'avez donc pas besoin de modifier manuellement les fichiers XML Shibboleth.

## Selection des composants

openDesk Edu est modulaire. Vous activez uniquement les services dont votre etablissement a besoin, ce qui limite la consommation de ressources et simplifie la maintenance. Tous les services sont controles depuis `global.yaml.gotmpl`.

### Services principaux

- **Keycloak** : obligatoire. C'est la colonne vertebrale de l'authentification et il ne peut pas etre desactive.
- **Element Web (Matrix)** : le hub de messagerie et de collaboration. Active par defaut.

### Alternatives de messagerie

Choisissez-en une :

- **Open-Xchange (OX)** : groupware complet avec calendrier, contacts et messagerie. Adapte aux etablissements qui necessitent une integration etroite avec d'autres composants OX.
- **SOGo** : groupware leger avec bon support ActiveSync. Convient aux deploiements de plus petite taille.
- **Grommunio** : remplacement complet de Microsoft Exchange avec compatibilite native Outlook. Stocke les donnees de messagerie dans MariaDB.

### Visioconference

Choisissez-en une :

- **Jitsi Meet** : visioconference legere, pair-a-pair. Besoins en ressources reduits. Approprie pour des reunions jusqu'a environ 25 participants.
- **BigBlueButton (BBB)** : concu specifiquement pour l'enseignement en ligne. Supporte l'enregistrement, les sous-groupes, les tableaux blancs et le telechargement de presentations. Necessite plus de ressources mais constitue la norme pour les classes virtuelles.

### Stockage de fichiers

Choisissez-en un :

- **Nextcloud** : mature et largement utilise. Vaste ecosysteme d'applications pour l'edition de documents, le calendrier et la gestion de taches.
- **OpenCloud** : fork de Nextcloud avec des fonctionnalites enterprise supplementaires et une integration plus etroite avec la pile openDesk.

### Tableau blanc

Choisissez-en un :

- **Excalidraw** : tableau blanc collaboratif simple et intuitif. Ideal pour des croquis rapides et du brainstorming.
- **CryptPad** : suite collaborative chiffree de bout en bout incluant un tableau blanc. Garanties de confidentialite renforcees.

### Services educatifs

- **ILIAS** : plateforme d'apprentissage largement utilisee dans l'enseignement superieur allemand. Supporte SCORM, LTI et des outils d'edition integres.
- **Moodle** : la plateforme LMS la plus populaire au monde. Vaste ecosysteme de plugins et grande communaute.

## Configuration des sauvegardes

openDesk Edu utilise l'operateur k8up avec restic en backend. k8up fonctionne comme un controleur Kubernetes et cree des sauvegardes planifiees selon les CRDs `Schedule` definis dans les charts Helm.

### Ce qui est sauvegarde

La configuration des sauvegardes couvre les donnees suivantes :

- **Contenu LMS** : repertoires de donnees ILIAS et stockage de fichiers Moodle, y compris les documents de cours telecharges, les soumissions des etudiants et les paquets SCORM.
- **Enregistrements BigBlueButton** : enregistrements de reunions sur des volumes persistants. Ceux-ci peuvent etre volumineux, surveillez donc l'utilisation du stockage.
- **Fichiers Nextcloud / OpenCloud** : fichiers utilisateurs, dossiers partages et donnees d'applications sur des volumes persistants.
- **Donnees Grommunio** : dumps de base de donnees MariaDB contenant les donnees de messagerie, de calendrier et de contacts de tous les utilisateurs Grommunio.

### Depot restic

Les sauvegardes sont stockees dans un depot restic. Vous configurez l'emplacement du depot (le stockage compatible S3 est recommande pour la durabilite hors site) et le mot de passe de chiffrement dans la configuration globale. La premiere sauvegarde prend du temps selon le volume de donnees. Les executions suivantes utilisent la deduplication de restic et ne transfert que les donnees modifiees.

### Restauration

Pour restaurer depuis une sauvegarde, utilisez la CRD `Restore` de k8up. Pointez vers un instantane specifique et l'operateur s'occupe du reste, en montant les donnees restaurees dans les pods correspondants.

## Gestion des certificats

openDesk Edu utilise openDesk Certificates de Bundesdruckerei pour TLS. Ce service fournit une provision automatique et un renouvellement des certificats pour tous les sous-domaines de services.

L'operateur de certificats fonctionne comme un controleur Kubernetes. Il demande des certificats pour chaque ressource Ingress et gere le renouvellement avant expiration. Vous n'avez pas besoin de gerer manuellement les certificats ou de configurer des clients ACME externes.

Si votre etablissement necessite des certificats d'une autre autorite de certification, vous pouvez configurer l'operateur pour utiliser votre fournisseur prefere. Les ressources Ingress referencent les certificats via des secrets TLS Kubernetes, les services en aval n'ont donc besoin d'aucune configuration liee aux certificats.

## Prochaines etapes

- Lisez la **vue d'ensemble de l'architecture** pour comprendre comment les services interagissent et comment les donnees circulent entre eux.
- Consultez les **pages des composants** pour les options de configuration specifiques a chaque service, le reglage des ressources et les guides d'integration.
- Consultez la section **depannage** si vous rencontrez des problemes lors du deploiement.
