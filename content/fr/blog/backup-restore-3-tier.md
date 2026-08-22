---
title: "Sauvegarde & restauration pour openDesk Edu – l'approche à 3 niveaux pour la souveraineté des données universitaires"
date: "2026-08-22"
description: "La souveraineté des données se joue au niveau de la sauvegarde : openDesk Edu protège les services critiques avec k8up et un modèle à 3 niveaux (RPO/RTO/rétention) sur S3, vérifie les restaurations en production et montre honnêtement ce qui manque encore – 29 PVC RWO attendent les snapshots CSI."
categories: ["Exploitation", "Souveraineté des données"]
tags: ["backup", "restore", "k8up", "restic", "s3", "ceph", "csi-snapshots", "rpo", "rto", "universite", "souverainete-donnees"]
image: "/static/blog/backup-restore-3-tier-teaser.svg"
---

# Sauvegarde & restauration pour openDesk Edu – l'approche à 3 niveaux pour la souveraineté des données universitaires

> **La thèse :** La souveraineté des données ne se joue pas à la connexion, mais au niveau de la sauvegarde. Si vous ne récupérez pas vos données en cas d'urgence, vous ne les possédez pas vraiment – quelle que soit la souveraineté de la plateforme par ailleurs.
>
> **La réalité :** Une plateforme universitaire construite à partir de plus de 20 services open source contient des classes de données très diverses : des magasins clé-valeur dont la panne se propage en quelques secondes, des fichiers au volume téraoctet et des bacs à sable IA expérimentaux. Une stratégie de sauvegarde unique ne peut convenir à aucune de ces classes.
>
> **Notre approche :** Au lieu d'une sauvegarde unique standardisée, nous exploitons un **modèle à 3 niveaux** – des classes de données avec leur propre RPO, RTO et rétention, mis en œuvre avec l'opérateur k8up sur Kubernetes, reposant sur **Ceph** et **S3**, avec des restaurations vérifiées et une analyse honnête des lacunes.

## Pourquoi la sauvegarde est la véritable question de la souveraineté des données

Quitter Microsoft 365, Google Workspace ou Zoom est la partie visible de la bascule vers la souveraineté. La partie invisible commence là où la décision perd de son éclat : dans le centre de calcul, à 3 heures du matin, devant un contrôleur de stockage défaillant ou une table supprimée par erreur.

La souveraineté des données au sens juridique signifie : le responsable décide **où** les données résident et **qui** peut y accéder. La souveraineté des données au sens opérationnel signifie : le responsable récupère ses données même **quand quelque chose tourne mal**. Les pannes ne sont pas une question de « si » mais de « quand » – et c'est exactement pourquoi on construit un système de sauvegarde qui est plus qu'un job périodique qui écrit joyeusement dans un trou mémoire.

Pour les universités, il y a en plus une dimension cruciale : une grande partie des données est **irremplaçable** – résultats d'examens, données de recherche, thèses, archives de courriels s'étendant sur des semestres. Un cluster oublié se reconstruit ; une thèse perdue, non. C'est pourquoi la stratégie de sauvegarde fait partie, aux côtés du SSO et de la supervision, des trois piliers d'un campus ouvert exploité en production.

## k8up : la sauvegarde comme ressource native GitOps

Au lieu de cron jobs sur une VM, openDesk Edu modélise les sauvegardes comme partie intégrante de la plateforme Kubernetes – avec **k8up** (v2.13.0), l'opérateur de sauvegarde du projet K8up :

```yaml
apiVersion: k8up.io/v1
kind: Schedule
metadata:
  name: backup-live
spec:
  backup:
    schedule: "15 2 * * *"          # chaque nuit dès 02:15
    backend:
      repoPasswordSecretRef:
        name: backup-credentials
        key: password
      s3:
        endpoint: s3.hrz.uni-marburg.de
        bucket: backups
        accessKeyIDSecretRef:
          name: backup-credentials
          key: accessKey
        secretAccessKeySecretRef:
          name: backup-credentials
          key: secretKey
```

L'avantage est d'ordre architectural : les sauvegardes sont **déclarées, versionnées et relisables** – elles vivent sous forme de YAML dans le dépôt Git, à côté des services qu'elles protègent. La sauvegarde nocturne devient aussi traçable que le processus de déploiement. **Restic** prend en charge le stockage effectif des données : dédupliqué, chiffré, avec des instantanés qui restent cohérents pendant des années. La cible est un **bucket S3** (en production : `s3.hrz.uni-marburg.de`) situé **à l'extérieur** du cluster – ainsi la sauvegarde survit même à la perte totale de la plateforme elle-même.

En production, k8up protège actuellement **6 PVC RWX** directement vers S3 – y compris les volumes partagés de Nextcloud, OpenProject et des services de groupware. Un **tableau de bord Grafana** rend l'état des planifications et des instantanés visible, au lieu de se fier à « ça devrait aller ».

## Le modèle à 3 niveaux : RPO, RTO et rétention par classe de données

Le cœur de notre approche est la conviction qu'« une sauvegarde » n'est pas une unité pertinente pour une plateforme de cette taille. Les données d'openDesk Edu diffèrent fondamentalement selon trois dimensions :

- **Quelle perte est acceptable ?** (RPO – Recovery Point Objective)
- **À quelle vitesse faut-il revenir ?** (RTO – Recovery Time Objective)
- **Combien de temps conserver ?** (rétention)

C'est pourquoi nous avons défini un **modèle à 3 niveaux** :

| Niveau | Exemples de services | RPO | RTO | Rétention |
|:-------|:---------------------|:----|:----|:----------|
| **A – critique** | Keycloak, PostgreSQL, Redis, MariaDB, MinIO | 1 h | 2 h | 30 jours |
| **B – important** | Nextcloud, OX App Suite, OpenProject, ILIAS, Moodle | 1 h | 4 h | 14 jours |
| **C – expérimental** | JupyterHub, Ollama, Dask | 24 h | 1 jour | 7 jours |

### Niveau A – le cœur identité et données

Les fournisseurs d'identité (Keycloak), les bases de données (PostgreSQL, MariaDB, Redis) et le stockage objet (MinIO) sont le cœur de la plateforme. Si Keycloak tombe, toutes les connexions échouent ; si la base de configuration tombe, les services perdent leur identité. Ici, la règle est : **sauvegarde horaire, récupération rapide, 30 jours de rétention** – car avec les systèmes d'identité, on veut pouvoir remonter loin, par exemple pour annuler des actions de provisionnement erronées.

### Niveau B – l'espace de travail collaboratif

Nextcloud, OX App Suite, OpenProject, ILIAS et Moodle forment l'espace de travail réel de l'université. La récupération est plus lourde que pour une base de données – des fichiers à l'échelle du téraoctet ne s'« importent » pas en deux heures. Avec un **RPO horaire et un RTO de 4 heures**, nous équilibrons l'effort : aucune journée de travail n'est perdue et la fenêtre de redémarrage reste planifiable. 14 jours de rétention couvrent les fenêtres d'erreur typiques (suppression accidentelle, clients obsolètes, mises à jour défectueuses).

### Niveau C – un espace d'expérimentation

JupyterHub, Ollama et Dask sont conçus délibérément comme des **environnements jetables**. Ce qui est perdu ici est reproductible – depuis Git, depuis Nix, depuis un runbook documenté. Un **RPO de 24 heures** signifie : un jour perdu de données expérimentales est acceptable s'il préserve l'infrastructure d'une charge inutile. Cette classification est une décision consciente – et elle économise des ressources pour les niveaux où les données comptent vraiment.

## Le défi RWO : 29 PVC qui ne se sauvegardent pas « comme ça »

Jusqu'ici, tout est en ordre – et voici la lacune honnête. Parmi les PVC de la plateforme, **29 ne sont actuellement pas couverts par k8up** parce qu'ils sont en **RWO** (ReadWriteOnce). Un volume RWO est lié à un nœud unique et ne peut pas être monté en parallèle par un pod de sauvegarde ailleurs. L'approche classique « on monte un volume, voilà » échoue structurellement.

Deux voies sont sur la table, toutes deux documentées :

**Option A – snapshots CSI VolumeSnapshots (préférée).** Ceph fournit des VolumeSnapshots via son pilote CSI `rbd.csi.ceph.com`. Cela permet de créer automatiquement des instantanés **cohérents-crash** des volumes RWO – sans montage, sans interruption :

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: csi-rbd-snapclass
  annotations:
    k8up.io/snapshot-class: "true"
driver: rbd.csi.ceph.com
deletionPolicy: Delete
```

**Option B – planifications par nœud.** Là où aucune classe d'instantanés n'existe, chaque PVC RWO peut être protégé par sa propre planification k8up ciblant via `nodeSelector` exactement le nœud auquel le volume est lié. Plus d'effort, mais aucune dépendance au backend de stockage.

La décision entre A et B repose sur une seule condition : une `VolumeSnapshotClass` existe-t-elle dans le cluster ? Si oui, la voie CSI est la recommandation claire – et les 29 PVC peuvent sortir du mode d'exclusion (`k8up.io/exclude: "true"`) vers une exploitation régulière.

## Vérification de la restauration : le test qui crée la confiance

Une sauvegarde qui n'est jamais restaurée est une opinion. Nous vérifions les restaurations en production – sur la plateforme **Maui**, **33 instantanés** ont été vérifiés avec succès : bases de données restaurées et contrôlées, chemins de fichiers vérifiés dans leur intégralité, services testés après restauration.

Il aide que k8up modélise aussi les restaurations comme ressources natives :

```yaml
apiVersion: k8up.io/v1
kind: Restore
metadata:
  name: restore-verify
spec:
  restoreMethod:
    folder:
      claimName: restore-target
  backend:
    repoPasswordSecretRef:
      name: backup-credentials
      key: password
    s3:
      endpoint: s3.hrz.uni-marburg.de
      bucket: backups
      accessKeyIDSecretRef:
        name: backup-credentials
        key: accessKey
      secretAccessKeySecretRef:
        name: backup-credentials
        key: secretKey
```

La règle pour l'exploitation à grande échelle est : **toute planification dont la restauration n'a pas été testée dans une cible au moins une fois par trimestre n'existe que sur le papier.** Compter les instantanés est agréable ; les rejouer avec succès est la preuve.

## Perspectives : de la sauvegarde de cluster à la reprise après sinistre

La configuration actuelle protège le cluster – délibérément vers une cible S3 **externe**. L'étape suivante est la question de savoir ce qui se passe si ce n'est pas seulement un service mais le site lui-même qui tombe. Trois briques sont à l'ordre du jour :

1. **Fermer la lacune RWO :** snapshots CSI pour les 29 PVC RWO (option A), afin que chaque classe de données du cluster ait un chemin défini.
2. **Géoredondance :** réplication des buckets S3 vers un second site ou un second centre de calcul – contre le feu, l'eau et ce seul moment malheureux.
3. **Manuel d'exploitation :** runbooks de restauration pour chaque niveau, avec objectifs de délais, responsabilités et une journée DR pratiquée annuellement où le cluster entier est reconstruit sur une cible vide.

Pour les décideurs qui remplacent Microsoft 365, le message central est simple : **ce que vous devez acheter par des contrats chez M365, vous le construisez vous-même chez openDesk Edu – et cela vous appartient.** La stratégie de sauvegarde n'est pas un appendice mais un composant de première classe de la plateforme : déclarée dans le dépôt Git, vérifiée en production, documentée honnêtement.

## Conclusion

La sauvegarde et la restauration chez openDesk Edu ne sont pas un produit unique mais un **système gradué avec des décisions claires** :

- **k8up** transforme les sauvegardes en ressources natives GitOps et relisables, au lieu de cron jobs oubliés.
- **Restic + S3** fournissent des instantanés dédupliqués, chiffrés et externes.
- Le **modèle à 3 niveaux** répartit judicieusement RPO, RTO et rétention entre identité, collaboration et espace d'expérimentation.
- Les **restaurations vérifiées** (33 instantanés) transforment le papier en pratique.
- La **lacune RWO** (29 PVC) est nommée, munie de deux chemins de solution documentés – et la prochaine étape est la mise en œuvre via les snapshots CSI.

La souveraineté des données n'est pas une case juridique à cocher. C'est une performance opérationnelle que l'on prouve – et la preuve est l'instantané restauré avec succès.

---

## Liens

- **k8up** – l'opérateur de sauvegarde : [k8up.io](https://k8up.io)
- **Restic** – sauvegarde dédupliquée et chiffrée : [restic.net](https://restic.net)
- **Ceph** – base de stockage du cluster : [ceph.io](https://ceph.io)
- **Community of Practice** – session infrastructure de sauvegarde : [Codeberg](https://codeberg.org/opendesk-edu/opendesk-cop)
- **openDesk Edu** : [opendesk-edu.org](https://opendesk-edu.org/)
