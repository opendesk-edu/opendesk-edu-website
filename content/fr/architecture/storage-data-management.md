---
title: "Architecture de stockage et de gestion des données"
date: "2026-08-27"
description: "Comment openDesk Edu gère le stockage persistant, les bases de données back-end, l'intégration des sauvegardes et le cycle de vie des données — des PersistentVolumes et classes de stockage aux sauvegardes k8up/restic et à la planification de capacité."
categories: ["architecture", "infrastructure"]
tags: ["architecture", "stockage", "persistent-volumes", "base-de-données", "mariadb", "postgresql", "redis", "sauvegarde", "k8up", "restic", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/storage-data-management-teaser.svg"
---

# Architecture de stockage et de gestion des données

Chaque service sur la plateforme produit des données : matériel de cours dans le LMS, fichiers dans le stockage cloud, e-mails dans les boîtes aux lettres, documents collaboratifs et état de configuration. Ces données sont l'actif le plus précieux de l'institution, et la manière dont elles sont stockées, protégées et gérées détermine la fiabilité de la plateforme. Cet article documente l'architecture de stockage : comment les PersistentVolumes fournissent un stockage durable, comment les bases de données back-end servent les applications avec état, comment les sauvegardes protègent contre la perte de données et comment le cycle de vie des données — de la création à l'archivage — est géré.

Pour le chemin réseau qui achemine les données vers les utilisateurs, consultez [Architecture réseau et flux de trafic](/architecture/networking-traffic-flow). Pour un aperçu complet de la plateforme, voir [Vue d'ensemble de l'architecture système](/architecture/overview).

## Stockage persistant

### PersistentVolumes et classes de stockage

Kubernetes sépare le calcul (les pods, qui sont éphémères) du stockage (les PersistentVolumes, qui sont durables). Lorsqu'un pod redémarre, ses données locales sont perdues. Les PersistentVolumes (PV) survivent aux redémarrages de pods, aux pannes de nœuds et au replanification.

La plateforme utilise des PersistentVolumeClaims (PVC) pour demander du stockage. Un PVC spécifie :

- **Mode d'accès** : Comment le volume peut être monté (lecture-écriture unique, lecture seule multiple, lecture-écriture multiple)
- **Taille de stockage** : Combien de capacité est nécessaire
- **Classe de stockage** : Quel type de stockage back-end utiliser

La classe de stockage détermine le back-end de stockage physique. Les classes de stockage courantes dans la plateforme incluent :

- **Stockage persistant local** : Stockage directement attaché au nœud. Rapide mais lié à un nœud spécifique. Convient aux bases de données qui bénéficient d'une faible latence.
- **Stockage attaché au réseau (NFS)** : Système de fichiers partagé accessible depuis plusieurs nœuds. Convient aux services de stockage de fichiers (Nextcloud, OpenCloud) qui nécessitent un accès en lecture-écriture depuis n'importe quel nœud.
- **Stockage défini par logiciel (Ceph)** : Stockage distribué qui fournit la résilience grâce à la réplication. Les données sont écrites sur plusieurs nœuds, de sorte qu'une panne d'un seul nœud ne cause pas de perte de données. Convient à tous les types de services.
- **Stockage d'objets (compatible S3)** : Pour les cibles de sauvegarde et les grandes données non structurées. Non utilisé pour les PV d'application, mais utilisé par restic pour le stockage de sauvegarde.

Chaque service déclare ses besoins de stockage via un PVC dans son chart Helm. Les classes de stockage de la plateforme garantissent que le bon type de stockage est provisionné automatiquement.

### Modes d'accès

| Mode d'accès | Abréviation | Description | Utilisation typique |
|-------------|-------------|-------------|-------------|
| ReadWriteOnce | RWO | Un nœud monte en lecture-écriture | Bases de données (MariaDB, PostgreSQL) |
| ReadOnlyMany | ROX | Plusieurs nœuds montent en lecture seule | Configuration, actifs statiques |
| ReadWriteMany | RWX | Plusieurs nœuds montent en lecture-écriture | Stockage de fichiers (Nextcloud, OpenCloud) |

La plupart des bases de données utilisent RWO car elles s'exécutent en une seule instance et n'ont pas besoin d'écritures concurrentes depuis plusieurs nœuds. Les services de stockage de fichiers utilisent RWX car n'importe quel nœud peut traiter une demande de fichier.

### Planification de la capacité

La capacité de stockage est l'une des préoccupations opérationnelles les plus critiques. Chaque service a des besoins de stockage différents :

- **Stockage de fichiers** (Nextcloud, OpenCloud) : Le plus grand consommateur. Les fichiers utilisateurs s'accumulent au fil du temps. Prévoyez la croissance — une plateforme avec des utilisateurs actifs peut nécessiter des téraoctets de stockage de fichiers en quelques mois.
- **E-mail** (Grommunio) : Les boîtes aux lettres croissent régulièrement. Chaque boîte aux lettres peut varier de quelques centaines de mégaoctets à plusieurs gigaoctets.
- **Bases de données** (MariaDB, PostgreSQL) : Relativement petites par rapport au stockage de fichiers, mais critiques. Le stockage de base de données devrait être sur un stockage rapide (SSD ou NVMe) pour les performances.
- **Enregistrements vidéo** (BigBlueButton) : Les enregistrements peuvent être volumineux (des centaines de mégaoctets à des gigaoctets par session). Prévoyez des politiques de rétention (combien de temps conserver les enregistrements).
- **Configuration et état** (Keycloak, Nubus) : Petits mais critiques. La perte de la base de données Keycloak signifie la perte de tous les comptes utilisateurs et de la configuration de fédération.

La plateforme ne prescrit pas de chiffres de capacité spécifiques — les besoins de chaque institution sont différents. Cependant, la plateforme fournit une surveillance (Prometheus + Grafana) pour suivre l'utilisation du stockage et alerter lorsque la capacité est faible.

## Bases de données back-end

La plateforme utilise trois types de bases de données back-end, chacune adaptée à différentes charges de travail :

### MariaDB

MariaDB (un fork de MySQL) est la base de données relationnelle principale pour les services qui nécessitent une compatibilité MySQL. Elle est utilisée par :

- **Grommunio** (e-mail) : Métadonnées de boîtes aux lettres, configuration utilisateur
- **ILIAS** (LMS) : Données de cours, progression utilisateur, évaluations
- **Moodle** (LMS) : Données de cours, progression utilisateur, devoirs
- **XWiki** (wiki) : Pages wiki, pièces jointes, métadonnées

MariaDB s'exécute en tant que StatefulSet dans Kubernetes avec un PersistentVolume pour le stockage des données. Chaque service a sa propre instance MariaDB (ou base de données dans une instance partagée), isolée par namespace.

#### Haute disponibilité

Pour les déploiements de production, MariaDB peut être configurée avec une réplication primaire-réplica. Le primaire gère les écritures ; les réplicas gèrent les lectures et fournissent le basculement. Si le primaire tombe en panne, un réplica est promu. Il s'agit de configuration, pas de code — le chart Helm prend en charge les configurations à instance unique et répliquées.

### PostgreSQL

PostgreSQL est utilisé par les services qui préfèrent ou nécessitent des fonctionnalités spécifiques à PostgreSQL (JSONB, recherche en texte intégral, indexation avancée) :

- **Nextcloud** (stockage de fichiers) : Métadonnées, index de fichiers, partages
- **OpenProject** (gestion de projet) : Projets, tâches, suivi du temps
- **Keycloak** (identité) : Configuration de realm, comptes utilisateurs, métadonnées de fédération
- **Zammad** (helpdesk) : Tickets, articles, données utilisateur

PostgreSQL s'exécute également en tant que StatefulSet avec un PersistentVolume. Comme MariaDB, il peut être configuré pour la haute disponibilité avec une réplication primaire-réplica.

### Redis

Redis est un magasin de clés-valeurs en mémoire utilisé pour :

- **Mise en cache** : Données de session, objets fréquemment consultés, pages rendues
- **Limitation de débit** : Suivi des compteurs de requêtes API
- **Files d'attente de messages** : Files d'attente de tâches légères pour les tâches en arrière-plan
- **Stockage de session** : Pour les services qui stockent les sessions dans Redis plutôt que dans la base de données

Redis s'exécute en tant que StatefulSet avec un PersistentVolume pour la persistance (afin que les données mises en cache survivent aux redémarrages). Il est configuré avec une limite de mémoire maximale et une politique d'éviction (généralement `allkeys-lru` — éviction des clés les moins récemment utilisées lorsque la mémoire est pleine).

### Connectivité de base de données

Les services se connectent à leurs bases de données via des noms DNS Kubernetes. Par exemple, un service se connecte à `mariadb.database-namespace.svc.cluster.local:3306` plutôt qu'à une adresse IP. Cette abstraction signifie que les bases de données peuvent être déplacées, redémarrées ou reconfigurées sans modifier la configuration de l'application.

Chaque base de données a ses propres informations d'identification, stockées en tant que secrets Kubernetes. L'application lit les informations d'identification à partir de variables d'environnement ou de fichiers de secret montés. Aucun mot de passe de base de données n'est stocké en clair dans la configuration Helm — ils sont générés lors du déploiement et stockés dans des secrets.

## Intégration de sauvegarde

### Opérateur de sauvegarde k8up

La plateforme utilise k8up, un opérateur de sauvegarde natif Kubernetes, pour gérer les sauvegardes automatisées. k8up s'exécute dans le cluster et coordonne les planifications de sauvegarde sur tous les services.

k8up utilise restic comme back-end de sauvegarde. Restic est un outil de sauvegarde rapide, sécurisé et efficace qui prend en charge :

- **Sauvegardes incrémentielles** : Seules les données modifiées sont transférées, réduisant le temps de sauvegarde et l'utilisation du stockage
- **Déduplication** : Les blocs de données identiques ne sont stockés qu'une seule fois, réduisant les coûts de stockage
- **Chiffrement** : Toutes les données de sauvegarde sont chiffrées au repos avec une clé configurable
- **Plusieurs back-ends de stockage** : Répertoires locaux, NFS, stockage d'objets compatible S3, serveurs SFTP

### Planification des sauvegardes

La planification des sauvegardes de la plateforme est configurable. Une configuration typique :

- **Sauvegardes de base de données** : Quotidiennes, via des dumps de base de données (par exemple, `mariadb-dump` ou `pg_dump`). Ce sont des sauvegardes logiques qui capturent l'état de la base de données à un instant donné.
- **Snapshots de volumes persistants** : Snapshots complets hebdomadaires de tous les PersistentVolumes. Ce sont des sauvegardes au niveau du volume qui capturent l'intégralité du PV, y compris les bases de données, les fichiers et la configuration.
- **Sauvegardes de configuration** : La configuration est stockée dans Git (via ArgoCD), donc l'historique Git sert de sauvegarde de configuration. Aucune sauvegarde séparée n'est nécessaire.

### Ce qui est sauvegardé

Toutes les données persistantes de tous les services sont incluses dans les sauvegardes :

- Contenu de cours LMS et soumissions utilisateur (ILIAS, Moodle)
- Fichiers d'enregistrement BigBlueButton
- Fichiers utilisateur Nextcloud et OpenCloud
- Boîtes aux lettres Grommunio (via dumps MariaDB)
- Caches de documents Collabora
- État de configuration Keycloak et Nubus
- Contenus de base de données (MariaDB, PostgreSQL)
- Données de persistance Redis

Les données non persistantes sont exclues : images de conteneurs, caches éphémères et fichiers temporaires qui peuvent être régénérés.

### Cibles de stockage de sauvegarde

Restic prend en charge une large gamme de back-ends de stockage. Les institutions peuvent diriger les sauvegardes vers :

- **Stockage NFS/compatible S3 local** : Stockage sur site que l'institution contrôle
- **Stockage d'objets hors site** : Stockage compatible S3 basé sur le cloud pour la reprise après sinistre
- **Serveurs SFTP** : Serveurs distants pour le stockage de sauvegarde hors site
- **Tout back-end pris en charge par restic** : La flexibilité des back-ends de restic signifie que les institutions peuvent choisir le stockage qui correspond à leur infrastructure et à leurs exigences de conformité

La cible de sauvegarde est configurée dans la définition de planification de k8up. Plusieurs cibles peuvent être utilisées simultanément (par exemple, local pour des restaurations rapides, hors site pour la reprise après sinistre).

### Processus de restauration

La restauration à partir d'une sauvegarde implique :

1. **Identifier le point de restauration** : Quel snapshot de sauvegarde contient l'état souhaité
2. **Arrêter le service affecté** : Pour éviter les conflits de données pendant la restauration
3. **Exécuter la restauration restic** : k8up lance un job de restauration qui copie les données de la cible de sauvegarde vers le PersistentVolume
4. **Redémarrer le service** : Une fois la restauration terminée, le service est redémarré avec les données restaurées

Pour les restaurations de base de données, le processus est similaire mais utilise le dump de base de données : le fichier de dump est restauré dans la base de données, ce qui rejoue les instructions SQL pour recréer l'état de la base de données.

### Surveillance des sauvegardes

k8up s'intègre à Prometheus pour exposer les métriques de sauvegarde :

- Horodatage de la dernière sauvegarde réussie
- Durée de la sauvegarde
- Taille de la sauvegarde
- Nombre de snapshots dans le dépôt
- Échecs de sauvegarde (alertés via Alertmanager)

Les opérateurs devraient surveiller ces métriques et alerter en cas d'échec de sauvegarde — un échec de sauvegarde silencieux est pire qu'aucune sauvegarde, car il crée un faux sentiment de sécurité.

## Cycle de vie des données

### Création

Les données sont créées par les services lorsque les utilisateurs interagissent avec la plateforme. Chaque service gère son propre format de données et son propre emplacement de stockage. La plateforme n'impose pas de modèle de données unifié — chaque service utilise son stockage natif (fichiers dans Nextcloud, enregistrements dans MariaDB, documents dans Collabora).

### Croissance

Au fur et à mesure que la plateforme est utilisée, les données croissent. La plateforme fournit une surveillance (Prometheus + Grafana) pour suivre :

- Utilisation des PersistentVolumes (à quel point chaque PV est plein)
- Taille de la base de données (lignes, stockage consommé)
- Taille de sauvegarde et taux de croissance
- Capacité restante

Lorsque le stockage approche de la capacité, les opérateurs peuvent :

- **Étendre les PersistentVolumes** : La plupart des classes de stockage prennent en charge l'extension de volume. Le PVC est mis à jour avec une taille plus grande, et le PV grandit automatiquement (pas de temps d'arrêt pour les volumes RWO ; brève remontage pour les volumes RWX).
- **Ajouter des nœuds** : Pour le stockage distribué (Ceph), l'ajout de nœuds augmente à la fois la capacité de calcul et de stockage.
- **Archiver les anciennes données** : Déplacer les données rarement consultées vers un stockage moins coûteux ou les supprimer selon les politiques de rétention.

### Rétention et archivage

Chaque service a ses propres exigences de rétention des données :

- **E-mail** : Les boîtes aux lettres sont conservées tant que le compte utilisateur existe. Les e-mails supprimés peuvent être récupérables pendant une période configurable.
- **Données LMS** : Les données de cours sont conservées selon la politique institutionnelle. Certaines institutions archivent les cours après la fin du semestre ; d'autres les conservent indéfiniment.
- **Enregistrements vidéo** : Les enregistrements BigBlueButton peuvent être conservés pendant une période configurable, puis automatiquement supprimés ou archivés.
- **Stockage de fichiers** : Les fichiers utilisateur sont conservés jusqu'à ce que l'utilisateur les supprime ou que le compte soit supprimé.

La plateforme n'impose pas de politiques de rétention — chaque institution configure la rétention en fonction de ses propres exigences légales et opérationnelles. La plateforme fournit les outils (planifications de sauvegarde, surveillance, extension de stockage) pour mettre en œuvre la politique de rétention choisie par l'institution.

### Suppression

La suppression des données est permanente. Lorsqu'un compte utilisateur est supprimé, la plateforme supprime :

- Les fichiers de l'utilisateur (Nextcloud, OpenCloud)
- La boîte aux lettres de l'utilisateur (Grommunio)
- Les données de cours et les soumissions de l'utilisateur (ILIAS, Moodle)
- La configuration de l'utilisateur dans Keycloak et Nubus

La suppression est effectuée par la logique de suppression du service lui-même, pas par un script central à l'échelle de la plateforme. Cela garantit que le processus de suppression de chaque service respecte son propre modèle de données et son intégrité référentielle.

## Migrations de base de données

Lorsque les services sont mis à jour, leurs bases de données peuvent nécessiter des migrations de schéma. La plateforme gère cela via des hooks de chart Helm :

1. **Hook de pré-mise à niveau** : Exécute les scripts de migration de base de données avant que la nouvelle version ne démarre
2. **Nouvelle version démarre** : Le service démarre avec le schéma mis à jour
3. **Rollback (si nécessaire)** : Si la migration est réversible, le chart Helm peut revenir à la version précédente

Les migrations sont spécifiques au service. Le chart Helm de chaque service inclut la logique de migration pour sa base de données. La plateforme n'impose pas de cadre de migration unifié — elle délègue à l'outil de migration natif de chaque service.

## Modes de défaillance et dépannage

### PersistentVolume plein

**Symptôme** : Les services signalent des erreurs « disque plein » ou « plus d'espace sur le périphérique ».
**Cause** : Un PersistentVolume a atteint sa capacité.
**Résolution** : Étendez le PVC (si la classe de stockage prend en charge l'extension) ou nettoyez les données inutiles. Surveillez l'utilisation du PV pour détecter cela avant que cela ne devienne critique.

### Échec de connexion à la base de données

**Symptôme** : Les services signalent « connexion refusée » ou « impossible de se connecter à la base de données ».
**Cause** : Le pod de base de données est en panne, la politique réseau bloque le trafic, ou les informations d'identification de la base de données sont incorrectes.
**Résolution** : Vérifiez l'état du pod de base de données (`kubectl get pods`), vérifiez que la politique réseau permet au service d'atteindre la base de données, et vérifiez le secret pour les informations d'identification correctes.

### Échec de sauvegarde

**Symptôme** : k8up signale des échecs de sauvegarde, ou la dernière sauvegarde réussie est ancienne.
**Cause** : La cible de sauvegarde est inaccessible, le dépôt restic est verrouillé, ou la clé de chiffrement de sauvegarde a changé.
**Résolution** : Vérifiez la connectivité de la cible de sauvegarde, vérifiez que le dépôt restic n'est pas verrouillé par un autre processus, et assurez-vous que la clé de chiffrement de sauvegarde n'a pas changé.

### Mauvaise configuration de la classe de stockage

**Symptôme** : Les PVC restent bloqués dans l'état « Pending ».
**Cause** : La classe de stockage n'est pas disponible, la classe de stockage ne prend pas en charge le mode d'accès demandé, ou le stockage est insuffisant.
**Résolution** : Vérifiez la classe de stockage (`kubectl get storageclass`), vérifiez que le mode d'accès est pris en charge, et vérifiez la capacité disponible.

---

## Pour aller plus loin

- [Vue d'ensemble de l'architecture système](/architecture/overview) — l'architecture complète de la plateforme
- [Stockage et gestion des données dans l'aperçu](/architecture/overview#backup-and-data-management) — aperçu de la sauvegarde dans l'architecture système
- [Architecture réseau et flux de trafic](/architecture/networking-traffic-flow) — comment le trafic atteint les services
- [Architecture de sécurité](/architecture/security) — comment les données sont protégées au repos et en transit
- [Sovereign Cloud : SCS vs Proxmox + K3s](/blog/scs-vs-proxmox-k3s) — comparaison des plateformes d'infrastructure incluant le stockage

---

*Les données sont l'actif le plus précieux de l'institution. L'architecture de stockage ne consiste pas seulement à savoir où vivent les données — il s'agit de s'assurer que les données sont durables, récupérables et évolutives pour la durée de vie de la plateforme.*
