---
title: "Architecture de sécurité"
date: "2026-08-27"
description: "L'architecture de sécurité d'openDesk Edu — gestion des secrets avec SOPS et chiffrement age, politiques réseau, RBAC, journalisation d'audit et mapping de conformité vers BSI IT-Grundschutz, RGPD et ISO 27001."
categories: ["architecture", "infrastructure", "security"]
tags: ["architecture", "sécurité", "sops", "rbac", "politiques-réseau", "audit-logging", "conformité", "bsi", "rgpd", "iso-27001", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/security-architecture-teaser.svg"
---

# Architecture de sécurité

La sécurité n'est pas une fonctionnalité unique — c'est une architecture en couches qui englobe les secrets, l'isolation réseau, le contrôle d'accès, les pistes d'audit et les cadres de conformité. Cet article consolide le modèle de sécurité de la plateforme en une référence unique : comment les secrets sont gérés, comment l'accès est contrôlé, comment le trafic est isolé et comment l'architecture se mappe aux cadres de conformité reconnus.

Pour la couche d'identité qui authentifie les utilisateurs, consultez [Architecture d'identité et d'authentification](/architecture/identity-authentication). Pour l'entrée et le routage du trafic, voir [Architecture réseau et flux de trafic](/architecture/networking-traffic-flow). Pour le stockage et les sauvegardes de données, voir [Architecture de stockage et de gestion des données](/architecture/storage-data-management).

## Gestion des secrets

### Le problème des secrets dans GitOps

Un flux GitOps stocke toute la configuration dans Git — y compris les charts Helm, les fichiers de valeurs et les manifestes de déploiement. Mais certaines configurations contiennent des secrets : mots de passe de base de données, clés API, clés privées TLS et jetons d'authentification. Les stocker en clair dans Git est un risque de sécurité : toute personne ayant accès au dépôt peut les lire, et l'historique Git les conserve indéfiniment.

### SOPS avec chiffrement age

La plateforme utilise SOPS (Secrets OPerationS) avec le chiffrement age pour gérer les secrets dans Git. SOPS chiffre les valeurs des clés secrètes tout en laissant les noms de clés et la structure en clair. Cela signifie :

- **La structure du fichier secret est visible** — les opérateurs peuvent voir quels secrets existent sans déchiffrer
- **Les valeurs des secrets sont chiffrées** — seules les valeurs sont illisibles sans la clé privée age
- **L'historique Git est sûr** — les valeurs chiffrées dans les anciens commits restent chiffrées

La clé de chiffrement age est stockée en dehors de Git (généralement sur le serveur de déploiement ou dans un module de sécurité matériel). Le contrôleur GitOps (ArgoCD) utilise un sidecar CMP (Config Management Plugin) pour déchiffrer les secrets au moment du déploiement. Le déchiffrement se fait dans le cluster, et les secrets déchiffrés ne sont jamais écrits sur disque ou dans Git.

### Modèle de sidecar CMP ArgoCD

Le flux de déchiffrement fonctionne comme suit :

1. **Secrets chiffrés dans Git** : Les fichiers de secrets chiffrés avec SOPS sont stockés dans le dépôt Git avec les autres configurations
2. **ArgoCD détecte les changements** : ArgoCD surveille le dépôt Git et détecte quand les fichiers de secrets changent
3. **Le sidecar CMP déchiffre** : Le sidecar Config Management Plugin s'exécute dans le pod du serveur de dépôt ArgoCD. Il reçoit le secret chiffré, utilise la clé privée age pour le déchiffrer et produit un manifeste de Secret Kubernetes
4. **Le Secret Kubernetes est créé** : Le manifeste de Secret déchiffré est appliqué au cluster. Le Secret existe uniquement dans l'etcd du cluster, jamais dans Git
5. **Les pods montent le Secret** : Les pods d'application référencent le Secret dans leurs manifestes de déploiement et le montent en tant que variables d'environnement ou fichiers

Ce modèle garantit que :
- Aucun secret en clair n'existe dans Git (uniquement des valeurs chiffrées)
- Aucun secret en clair n'existe sur disque en dehors du cluster (la clé age est séparée)
- Le déchiffrement se fait au moment du déploiement, pas au moment de la construction
- La clé age peut être rotée sans re-chiffrer tous les secrets (age prend en charge la rotation des destinataires)

### Rotation des secrets

Les secrets doivent être rotés périodiquement. L'approche de la plateforme :

- **Mots de passe de base de données** : Rotés en générant un nouveau mot de passe, en mettant à jour le secret chiffré SOPS et en laissant ArgoCD déployer le changement. La base de données accepte brièvement l'ancien et le nouveau mot de passe pendant la transition.
- **Clés API** : Rotées par le service qui les a émises. L'ancienne clé est révoquée après le déploiement de la nouvelle clé.
- **Clés privées TLS** : Rotées en même temps que le renouvellement du certificat (voir [Architecture réseau et flux de trafic](/architecture/networking-traffic-flow) pour la gestion des certificats).
- **Clé de chiffrement age** : Rotée en générant une nouvelle clé, en re-chiffrant tous les secrets avec la nouvelle clé et en mettant à jour le sidecar CMP ArgoCD. C'est une opération de fenêtre de maintenance.

## Sécurité réseau et isolation

### Politiques réseau

La plateforme utilise des politiques réseau Kubernetes pour appliquer la segmentation réseau. Le modèle de refus par défaut signifie que tout le trafic pod-à-pod est refusé sauf s'il est explicitement autorisé. Pour une description détaillée des politiques réseau et du chemin de flux de trafic, voir [Architecture réseau et flux de trafic](/architecture/networking-traffic-flow).

Du point de vue de la sécurité, les politiques réseau fournissent :

- **Confinement du rayon d'impact** : Si un pod est compromis, l'attaquant ne peut pas atteindre d'autres pods à moins qu'une politique réseau ne l'autorise
- **Moindre privilège** : Chaque service ne peut atteindre que les services et ports spécifiques dont il a besoin
- **Piste d'audit** : Les politiques réseau sont déclaratives (stockées dans Git), donc la posture de sécurité réseau est versionnée et vérifiable

### Isolation par namespace

Les services s'exécutent dans des namespaces Kubernetes séparés, fournissant une isolation logique :

- Chaque service principal (ou groupe de services liés) a son propre namespace
- Le trafic inter-namespace nécessite une politique réseau explicite
- Les quotas de ressources peuvent être appliqués par namespace pour empêcher un service compromis de consommer toutes les ressources du cluster

### Chiffrement en transit

Tout le trafic externe est chiffré avec TLS (voir [Architecture réseau et flux de trafic](/architecture/networking-traffic-flow) pour les détails TLS). Le trafic interne pod-à-pod n'est pas chiffré par défaut mais peut être mis à niveau vers mTLS (mutual TLS) pour les services qui le nécessitent.

### Chiffrement au repos

Les données au repos sont chiffrées via :

- **PersistentVolumes** : Dépend de la classe de stockage. Ceph prend en charge les volumes chiffrés. Le stockage local et NFS s'appuient sur le chiffrement du stockage sous-jacent (par exemple, LUKS sur le nœud).
- **Stockage de base de données** : Les fichiers de base de données sur PersistentVolumes héritent du chiffrement PV. Le chiffrement au niveau application (par exemple, chiffrement au niveau des colonnes dans PostgreSQL) est spécifique au service.
- **Sauvegardes** : Toutes les sauvegardes restic sont chiffrées avec une clé configurable. La clé de sauvegarde est séparée de la clé de chiffrement age utilisée pour les secrets GitOps.

## Contrôle d'accès basé sur les rôles (RBAC)

La plateforme a deux couches de RBAC : RBAC Kubernetes pour les opérations de cluster et RBAC Keycloak pour l'accès au niveau application.

### RBAC Kubernetes

Le RBAC Kubernetes contrôle qui peut effectuer quelles actions sur les ressources du cluster. La plateforme définit des rôles à trois niveaux :

- **Administrateur de cluster** : Accès complet à toutes les ressources du cluster. Utilisé par les opérateurs de plateforme pour la gestion au niveau du cluster.
- **Administrateur de namespace** : Accès complet aux ressources dans un namespace spécifique. Utilisé par les opérateurs de service qui gèrent un service unique ou un groupe de services.
- **Lecture seule** : Accès en visualisation aux ressources sans modification. Utilisé pour la surveillance, l'audit et le débogage.

Chaque rôle est lié à des utilisateurs ou des groupes via des RoleBindings (à l'échelle du namespace) ou des ClusterRoleBindings (à l'échelle du cluster). Les comptes de service (utilisés par les pods et l'automatisation) obtiennent leurs propres rôles avec des permissions minimales.

### RBAC Keycloak

Keycloak gère l'accès au niveau application via des rôles de realm et des rôles de client :

- **Rôles de realm** : Rôles définis au niveau du realm Keycloak (par exemple, `admin`, `user`, `student`, `staff`)
- **Rôles de client** : Rôles spécifiques à un service (par exemple, `nextcloud-admin`, `moodle-teacher`)
- **Appartenances à des groupes** : Les utilisateurs peuvent être membres de groupes, qui accordent des rôles sur plusieurs services

Lorsqu'un utilisateur s'authentifie (voir [Architecture d'identité et d'authentification](/architecture/identity-authentication)), Keycloak inclut ses rôles dans le jeton OIDC. Les services lisent ces rôles et appliquent le contrôle d'accès :

- **Nextcloud** : Vérifie les rôles Keycloak pour l'accès admin vs utilisateur
- **Moodle** : Mappe les rôles Keycloak aux rôles de cours (enseignant, étudiant, gestionnaire)
- **OpenProject** : Mappe les rôles Keycloak aux permissions de projet

### Principe du moindre privilège

Le RBAC Kubernetes et le RBAC Keycloak suivent tous deux le principe du moindre privilège :

- **Kubernetes** : Les comptes de service n'ont que les permissions nécessaires pour fonctionner. Un service qui lit les ConfigMaps n'a pas les permissions pour supprimer des Pods.
- **Keycloak** : Les utilisateurs n'ont que les rôles nécessaires pour leur fonction. Un étudiant n'a pas de rôles d'administration. Un enseignant n'a pas de rôles de cluster-admin.
- **Politiques réseau** : Un service ne peut atteindre que les services et ports spécifiques dont il a besoin (voir [Architecture réseau et flux de trafic](/architecture/networking-traffic-flow))

## Journalisation d'audit

La journalisation d'audit fournit une piste de qui a fait quoi et quand. La plateforme a plusieurs sources de journaux d'audit :

### Journalisation d'audit Kubernetes

Kubernetes peut journaliser toutes les requêtes API vers le cluster. Le journal d'audit capture :

- **Qui** : L'utilisateur authentifié (ou compte de service) faisant la requête
- **Quoi** : La ressource accédée (par exemple, `pods`, `secrets`, `configmaps`)
- **Quand** : Horodatage de la requête
- **Comment** : Le verbe HTTP (GET, POST, PUT, DELETE)
- **Résultat** : Si la requête a été autorisée ou refusée

La journalisation d'audit est configurée au niveau du serveur API Kubernetes. Les journaux peuvent être envoyés à un système de journalisation central (par exemple, Loki, Elasticsearch) pour le stockage à long terme et l'analyse.

### Journalisation des événements Keycloak

Keycloak journalise les événements d'authentification :

- Connexions réussies et échouées
- Émission et rafraîchissement des jetons
- Création et terminaison de session
- Modifications d'appartenance à des rôles et groupes
- Événements de fédération (connexions IdP, mappage d'attributs)

Ces journaux soutiennent l'investigation des incidents (qui s'est connecté quand, d'où) et les preuves de conformité (modèles d'accès pour les auditeurs).

### Journaux d'audit au niveau application

Chaque service maintient son propre journal d'audit :

- **Nextcloud** : Accès aux fichiers, partages, suppressions
- **Moodle** : Accès aux cours, modifications de notes, modifications de contenu
- **OpenProject** : Modifications de projets, affectations de tâches
- **Zammad** : Accès aux tickets et modifications

Les journaux d'audit d'application sont spécifiques au service et stockés dans la base de données du service ou dans des fichiers journaux. Ils sont inclus dans le planning de sauvegarde de la plateforme (voir [Architecture de stockage et de gestion des données](/architecture/storage-data-management)).

### Agrégation centralisée des journaux

Pour les déploiements de production, les journaux de tous les services peuvent être agrégés dans un système de journalisation central :

- **Loki** : Agrégation de journaux avec tableaux de bord Grafana
- **Prometheus** : Métriques (pas des journaux, mais lié à l'observabilité)
- **Alertmanager** : Alertes sur des modèles de journaux (par exemple, connexions échouées répétées, accès API inhabituel)

L'agrégation centralisée des journaux est facultative mais recommandée pour les déploiements plus importants. Elle permet la corrélation inter-services (par exemple, « l'utilisateur X s'est connecté à Keycloak, puis a accédé à Nextcloud, puis a supprimé un fichier ») et la rétention à long terme des journaux.

## Mapping des cadres de conformité

Les contrôles de sécurité de la plateforme se mappent aux cadres de conformité reconnus. Ce mapping est factuel — il décrit quelles caractéristiques architecturales satisfont quelles exigences de conformité. Ce n'est pas une certification ou une recommandation.

### BSI IT-Grundschutz (profil enseignement supérieur ZKI)

BSI IT-Grundschutz est la norme de sécurité fédérale allemande. Le profil enseignement supérieur ZKI (Zentrum für Konsortiale IT-Dienste) adapte IT-Grundschutz pour les universités. Les contrôles de sécurité de la plateforme se mappent à plusieurs modules IT-Grundschutz :

| Module IT-Grundschutz | Contrôle de la plateforme |
|----------------------|-----------------|
| ORP.4 (Authentification) | Fédération DFN-AAI, SSO Keycloak, support MFA |
| CON.1 (Concept cryptographique) | TLS pour le transit, SOPS/age pour les secrets, chiffrement restic pour les sauvegardes |
| CON.6 (Clés cryptographiques) | Gestion des clés age, cycle de vie des certificats TLS, rotation des clés |
| OPS.1 (Opération) | GitOps avec ArgoCD, configuration déclarative, modifications versionnées |
| OPS.4 (Administration) | RBAC Kubernetes, isolation par namespace, comptes de service à privilèges minimaux |
| APP.3 (Applications web) | En-têtes de sécurité (HSTS, CSP, X-Frame-Options), limitation de débit, validation des entrées |
| SYS.1 (Serveurs) | Durcissement Kubernetes, politiques réseau, modèle de refus par défaut |
| INF.2 (Systèmes IT) | Chiffrement PersistentVolume, chiffrement des sauvegardes |
| DER.4 (Continuité d'activité) | Planning de sauvegarde k8up, sauvegarde hors site restic, procédures de restauration |

### RGPD / DSGVO

Le Règlement général sur la protection des données (RGPD / DSGVO en allemand) réglemente le traitement des données personnelles. La plateforme prend en charge la conformité RGPD via :

- **Minimisation des données** : La plateforme ne demande que les attributs dont elle a besoin auprès de la fédération (voir [Architecture d'identité et d'authentification](/architecture/identity-authentication) pour le mappage des attributs). Elle ne stocke pas d'attributs sensibles (par exemple, numéros d'identité nationale) de la fédération.
- **Pas de stockage de mot de passe pour les utilisateurs fédérés** : La plateforme ne voit ni ne stocke jamais le mot de passe institutionnel de l'utilisateur. L'authentification se fait à l'IdP ; la plateforme ne reçoit que des assertions.
- **Droit à l'effacement** : Lorsqu'un compte utilisateur est supprimé, la plateforme supprime les données de l'utilisateur sur tous les services (voir [Architecture de stockage et de gestion des données](/architecture/storage-data-management) pour le processus de suppression).
- **Portabilité des données** : Les données utilisateur peuvent être exportées depuis chaque service (export de fichiers Nextcloud, export de cours Moodle, etc.).
- **Piste d'audit** : La journalisation des événements Keycloak et les journaux d'audit d'application fournissent des preuves de qui a accédé à quelles données et quand.
- **Chiffrement** : Les données sont chiffrées en transit (TLS) et au repos (chiffrement PV, chiffrement des sauvegardes).

La plateforme est un sous-traitant de données ; l'institution est le responsable du traitement. L'institution est responsable de la base légale du traitement, des analyses d'impact sur la protection des données et des droits des personnes concernées. La plateforme fournit les contrôles techniques pour soutenir ces obligations.

### ISO 27001

ISO/IEC 27001 est la norme internationale pour les systèmes de management de la sécurité de l'information (SMSI). Les contrôles de la plateforme se mappent à plusieurs contrôles de l'Annexe A de l'ISO 27001 :

| Contrôle ISO 27001 | Contrôle de la plateforme |
|------------------|-----------------|
| A.5.15 (Contrôle d'accès) | RBAC Keycloak, RBAC Kubernetes, politiques réseau |
| A.5.17 (Informations d'authentification) | Gestion des secrets SOPS/age, pas de secrets en clair dans Git |
| A.5.18 (Droits d'accès) | Comptes de service à privilèges minimaux, isolation par namespace |
| A.5.21 (Transfert d'informations) | TLS pour tout le transit, mTLS pour le trafic interne (si activé) |
| A.5.30 (Préparation TIC pour la continuité d'activité) | Sauvegardes k8up, stockage hors site restic, procédures de restauration |
| A.5.33 (Protection des enregistrements) | Journalisation d'audit (Kubernetes, Keycloak, niveau application) |
| A.5.34 (Confidentialité et protection des données personnelles) | Contrôles de conformité RGPD (minimisation des données, droit à l'effacement) |
| A.8.1 (Terminaux utilisateur) | N/A (les terminaux sont gérés par l'institution, pas par la plateforme) |
| A.8.2 (Droits d'accès privilégiés) | Administrateur de cluster Kubernetes, administrateur de namespace, rôles en lecture seule |
| A.8.3 (Restriction d'accès à l'information) | Politiques réseau, RBAC, isolation par namespace |
| A.8.4 (Accès au code source) | Contrôle d'accès au dépôt Git, GitOps ArgoCD |
| A.8.5 (Authentification sécurisée) | Fédération DFN-AAI, SSO Keycloak, support MFA |
| A.8.7 (Protection contre les logiciels malveillants) | Analyse antivirus ClamAV (si déployé) |
| A.8.9 (Gestion de la configuration) | GitOps avec ArgoCD, charts Helm déclaratifs, configuration versionnée |
| A.8.12 (Prévention des fuites de données) | Politiques réseau, isolation par namespace, modèle de refus par défaut |
| A.8.13 (Sauvegarde des informations) | Planning de sauvegarde k8up, sauvegardes chiffrées restic |
| A.8.14 (Redondance du traitement de l'information) | Réplication de base de données (MariaDB, PostgreSQL), réplication PV (Ceph) |
| A.8.15 (Journalisation) | Journalisation d'audit Kubernetes, journalisation des événements Keycloak, journaux d'audit d'application |
| A.8.24 (Utilisation de la cryptographie) | TLS, SOPS/age, chiffrement restic |

## Liste de contrôle de durcissement de sécurité

La liste de contrôle suivante résume les contrôles de sécurité qui doivent être vérifiés pour tout déploiement :

- [ ] **Secrets chiffrés** : Tous les secrets stockés dans Git sont chiffrés avec SOPS et age. Aucun secret en clair dans aucun dépôt Git.
- [ ] **TLS appliqué** : Tout le trafic externe utilise TLS 1.2+. HTTP est redirigé vers HTTPS. HSTS est activé.
- [ ] **Politiques réseau** : Le modèle de refus par défaut est actif. Chaque service a des politiques réseau explicites n'autorisant que le trafic nécessaire.
- [ ] **RBAC configuré** : Les rôles RBAC Kubernetes sont limités au moindre privilège. Les comptes de service ont des permissions minimales.
- [ ] **Journalisation d'audit activée** : La journalisation d'audit Kubernetes, la journalisation des événements Keycloak et les journaux d'audit d'application sont actifs et collectés.
- [ ] **Sauvegardes chiffrées** : Toutes les sauvegardes restic sont chiffrées. La clé de sauvegarde est séparée de la clé age.
- [ ] **Surveillance des sauvegardes** : Les alertes Prometheus sont configurées pour les échecs de sauvegarde. L'horodatage de la dernière sauvegarde réussie est surveillé.
- [ ] **Procédure de rotation des clés documentée** : La clé age, les certificats TLS, les mots de passe de base de données et les clés API ont des procédures de rotation documentées.
- [ ] **Isolation par namespace** : Les services s'exécutent dans des namespaces séparés. Le trafic inter-namespace est explicite.
- [ ] **Images de conteneurs scannées** : Les images de conteneurs sont scannées pour les vulnérabilités (par exemple, Kubescape, Trivy) avant le déploiement.

---

## Pour aller plus loin

- [Architecture d'identité et d'authentification](/architecture/identity-authentication) — la chaîne d'authentification, la fédération et le mappage d'attributs
- [Architecture réseau et flux de trafic](/architecture/networking-traffic-flow) — flux de trafic, TLS, ingress et politiques réseau
- [Architecture de stockage et de gestion des données](/architecture/storage-data-management) — stockage persistant, bases de données et intégration de sauvegarde
- [Vue d'ensemble de l'architecture système](/architecture/overview) — l'architecture complète de la plateforme
- [Sécurité et conformité](/blog/security-compliance) — article de blog sur l'approche sécurité et conformité de la plateforme
- [Gestion des secrets SOPS avec ArgoCD CMP](/blog/sops-secret-management-argocd-cmp) — article de blog sur le modèle SOPS + age + ArgoCD
- [Conformité BSI IT-Grundschutz](/blog/zki-it-grundschutz-compliance) — article de blog sur l'alignement BSI IT-Grundschutz

---

*La sécurité est une architecture en couches, pas une fonctionnalité unique. Chaque couche — secrets, réseau, contrôle d'accès, audit, conformité — renforce les autres. Aucune couche seule n'est suffisante ; ensemble, elles fournissent une défense en profondeur.*
