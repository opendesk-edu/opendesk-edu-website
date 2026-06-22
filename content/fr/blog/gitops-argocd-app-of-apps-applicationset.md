---
title: "GitOps à l'Échelle : App of Apps vs ApplicationSet pour openDesk"
date: "2026-06-19"
description: "Alors qu'openDesk Edu dépasse les 30 services, notre application ArgoCD monolithique unique atteint ses limites. Cet article compare les motifs App of Apps et ApplicationSet, en pesant le pour et le contre pour un déploiement éducatif ciblant plusieurs clusters et environnements."
image: "/static/blog/gitops-argocd-app-of-apps-applicationset-teaser.svg"
categories: ["technique", "architecture", "devops"]
tags: ["gitops", "argocd", "kubernetes", "app-of-apps", "applicationset", "helmfile", "architecture"]
---

# GitOps à l'Échelle : App of Apps vs ApplicationSet pour openDesk

> **État actuel :** Une application ArgoCD, un helmfile, 30+ services, 8 phases de synchronisation.
> **État cible :** Une architecture GitOps multi-cluster et multi-environnement qui passe à l'échelle.

Cet article examine où nous en sommes, où nous voulons aller, et les deux principaux motifs ArgoCD — App of Apps et ApplicationSet — qui peuvent nous y mener.

## Où Nous en Sommes Aujourd'hui

openDesk Edu se déploie actuellement via une **application ArgoCD monolithique** soutenue par le [plugin helmfile](https://github.com/travisghansen/argo-cd-helmfile). Une seule ressource Application dans ArgoCD pointe vers un helmfile qui orchestre les 30+ services à travers 8 phases de synchronisation :

| Phase | Ce qui est déployé |
|-------|-------------------|
| 0 | Jobs de migration pré-déploiement |
| 1 | Services cœur (accueil, certificats, alertes) |
| 2 | Bases de données, caches, S3, relais de messagerie |
| 3 | Nubus IAM, Keycloak, portail |
| 4–5 | Groupware, applications (Nextcloud, Jitsi, OX, etc.) |
| 6–7 | Jobs d'amorçage et post-migrations |

Cela fonctionne. Le cluster tourne, les services sont sains et les sauvegardes s'exécutent. Mais à mesure que nous passons à l'échelle — plus d'environnements (dev/staging/prod), plus de clusters (HRZ, futurs sites), et plus de services (il nous en manque encore 6) — les limites d'une application unique deviennent évidentes.

### Ce qui Casse à l'Échelle

- **Rayon unique d'explosion :** Une mauvaise modification du helmfile affecte tous les services. Il n'y a pas de déploiement progressif.
- **Pas en libre-service :** Ajouter un service signifie éditer le helmfile central et attendre l'approbation des mainteneurs.
- **Synchronisations lentes :** L'application racine reconcilie les 30+ services à la fois. Les timeouts de synchronisation et la contention de ressources sont réels.
- **Pas de politique de synchronisation par service :** Vous ne pouvez pas synchroniser automatiquement un service tout en promouvant manuellement un autre. C'est tout ou rien.
- **Pas de différenciation par environnement :** Les surcharges d'environnement vivent dans un seul fichier `global.yaml.gotmpl`. Vous pouvez élaborer des conditionnelles, mais la structure ne passe pas à l'échelle pour N environnements.

La communauté a convergé vers deux motifs pour résoudre ces problèmes : **App of Apps** et **ApplicationSets**. Ils ne sont pas mutuellement exclusifs, mais ils répondent à des besoins différents.

## Motif 1 : App of Apps

Le motif App of Apps utilise une application ArgoCD racine qui synchronise un répertoire contenant d'autres manifests d'Application. L'application racine découvre les applications enfants, les crée et surveille leur état. Supprimer un manifest enfant de Git fait qu'ArgoCD le nettoie.

```yaml
# Application racine
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-opendesk
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/opendesk-edu/gitops-config.git
    path: apps/
  destination:
    server: https://kubernetes.default.svc
  syncPolicy:
    automated:
      prune: true
```

```yaml
# apps/keycloak.yaml — Application enfant
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: keycloak
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/opendesk-edu/gitops-config.git
    path: charts/keycloak/
  destination:
    server: https://kubernetes.default.svc
    namespace: opendesk
  syncPolicy:
    automated:
      selfHeal: true
```

### Avantages

- **Contrôle complet par application.** Chaque application enfant a sa propre politique de synchronisation, ses ondes de synchronisation, ses différences ignorées et son projet. Vous pouvez synchroniser automatiquement Keycloak tout en promouvant manuellement Nextcloud.
- **Templating Helm/Kustomize.** Le répertoire apps peut lui-même être un chart Helm, vous pouvez donc templater les manifests d'Application avec `values.yaml`. Une modification de valeur se propage à toutes les applications générées.
- **Modèle mental simple.** Ce sont simplement des Applications qui gèrent des Applications. Pas de nouvelles CRD, pas de générateurs, pas de langage de templating. Tout utilisateur d'ArgoCD comprend cela.
- **Ordonnancement des dépendances.** Les ondes de synchronisation fonctionnent au niveau de l'Application. Vous définissez `sync-wave: 1` sur les bases de données, `sync-wave: 5` sur les applications qui en dépendent.
- **Éprouvé.** Ce motif est en production depuis ArgoCD v1.x. Les mainteneurs ont explicitement déclaré qu'il **n'est pas déprécié** ([discussion #11892](https://github.com/argoproj/argo-cd/discussions/11892)).

### Inconvénients

- **Un YAML par application par environnement.** Pour 30 services × 3 environnements = 90 manifests d'Application. Même avec le templating Helm, cela fait beaucoup de fichiers à maintenir.
- **Pas de découverte dynamique.** Ajouter un service signifie valider un nouveau YAML d'Application. Il n'y a pas de « scannez ce répertoire et créez les applications automatiquement ».
- **Capacité réservée aux administrateurs.** Créer des Applications dans différents projets nécessite des privilèges d'administration. Donner le libre-service aux équipes signifie leur faire confiance pour les manifests d'Application, y compris les champs sensibles comme `project`, `cluster` et `namespace`.
- **L'application racine peut devenir un goulot d'étranglement.** L'application parente synchronise tous les enfants. Si un enfant est mal configuré, la racine peut s'afficher comme dégradée même si le reste est sain.

### Quand il Excelle

- Cluster unique avec un ensemble fixe de services
- Équipes qui ont besoin d'un contrôle fin par application
- Chaînes de dépendances complexes avec un ordonnancement strict
- Migration depuis une application monolithique — la structure reflète ce que vous avez déjà

## Motif 2 : ApplicationSet

Les ApplicationSets sont l'approche native d'ArgoCD basée sur des générateurs. Au lieu d'écrire N manifests d'Application, vous définissez un ApplicationSet avec un **template** et un **générateur** qui produit les paramètres. Le contrôleur crée, met à jour et supprime les Applications automatiquement.

### Types de Générateurs Pertinents pour openDesk

**Générateur de Répertoire Git** — découvre automatiquement les services en scannant les répertoires du dépôt :

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: opendesk-services
  namespace: argocd
spec:
  goTemplate: true
  generators:
    - git:
        repoURL: https://github.com/opendesk-edu/gitops-config.git
        revision: main
        directories:
          - path: services/*
  template:
    metadata:
      name: '{{.path.basename}}'
    spec:
      project: opendesk
      source:
        repoURL: https://github.com/opendesk-edu/gitops-config.git
        path: '{{.path.path}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{.path.basename}}'
      syncPolicy:
        automated:
          selfHeal: true
```

Nouveau service ? Créez un répertoire `services/nextcloud/` avec votre overlay Kustomize. ArgoCD le prend en charge. Aucune modification de configuration, aucune revue de PR pour l'ApplicationSet lui-même.

**Générateur Matriciel** — combine clusters et services pour des déploiements multi-environnements :

```yaml
generators:
  - matrix:
      generators:
        - git:
            repoURL: https://github.com/opendesk-edu/gitops-config.git
            directories:
              - path: services/*
        - clusters:
            selector:
              matchLabels:
                env: prod
```

Cela produit chaque combinaison de service × cluster. Trois clusters × 30 services = 90 Applications à partir d'un seul manifest.

**Générateur de Clusters** — déploie le même ensemble de services sur chaque cluster correspondant à un sélecteur d'étiquette. Ajoutez un cluster, étiquetez-le `env: staging`, et chaque service se déploie automatiquement.

**Générateur de Liste** — contrôle explicite pour quand les structures de répertoire ne suffisent pas. Définissez une simple liste YAML d'ensembles de paramètres.

### Avantages

- **Découverte dynamique.** Les services apparaissent et disparaissent en fonction de la structure du dépôt Git. Zéro gestion manuelle d'Application.
- **Multi-cluster natif.** Un seul ApplicationSet peut cibler 10 clusters. Le générateur de Clusters découvre automatiquement les clusters enregistrés dans ArgoCD.
- **Libre-service sécurisé.** Les administrateurs verrouillent les champs sensibles (`project`, `cluster`, `namespace`) dans le template. Les développeurs contrôlent uniquement ce qui va dans le dépôt source. C'est le modèle de libre-service officiel recommandé par la documentation ArgoCD.
- **DRY à grande échelle.** Un template remplace 30+ manifests d'Application. Avec les générateurs Matriciels, un manifest en remplace 90+.
- **Préserver les ressources à la suppression.** L'option `preserveResourcesOnDeletion` empêche la suppression en cascade des charges de travail actives lorsqu'un ApplicationSet est supprimé.

### Inconvénients

- **Plus difficile à déboguer.** Les erreurs d'ApplicationSet apparaissent dans les logs du contrôleur, pas dans l'interface ArgoCD. Si la génération échoue silencieusement, vous pouvez ne pas vous en rendre compte avant que des services ne manquent. Comme l'a noté un membre de la communauté : *« s'il ne génère rien, vous ne le saurez pas avant d'avoir fouillé les logs »* ([discussion #11892](https://github.com/argoproj/argo-cd/discussions/11892)).
- **Personnalisation limitée par application.** Le template s'applique uniformément à toutes les Applications générées. Vous voulez Keycloak avec une politique de synchronisation différente de Nextcloud ? Vous avez besoin d'ApplicationSets séparés ou de contournements basés sur des sélecteurs.
- **Complexité du templating.** Les templates Go avec des générateurs imbriqués peuvent devenir difficiles à lire et à maintenir. L'option `missingkey=error` aide, mais déboguer le rendu des templates est une compétence en soi.
- **Les ondes de synchronisation sont par ApplicationSet, pas par application.** Vous ne pouvez pas définir des ondes de synchronisation différentes pour différents services au sein du même ApplicationSet sans les diviser en plusieurs ApplicationSets.
- **Rayon d'explosion.** Un template d'ApplicationSet mal configuré peut affecter des dizaines ou des centaines d'Applications à la fois. Un linting CI rigoureux est essentiel.

### Quand il Excelle

- Déploiements multi-clusters (5+ clusters)
- Services qui suivent un motif cohérent (même disposition de dépôt, même politique de synchronisation)
- Flux de travail en libre-service où les équipes ajoutent des services indépendamment
- Environnements d'aperçu par pull request (Générateur PR)
- Tout scénario où l'inventaire des clusters ou des services change fréquemment

## Motif 3 : Hybride (Le Consensus de la Communauté)

En lisant la discussion GitHub et en parlant aux équipes qui utilisent ArgoCD en production, la recommandation la plus courante est **ni l'un ni l'autre des motifs purs** — c'est un hybride en couches :

> *« J'utilise app-of-apps et ApplicationSet en même temps : app-of-apps pour le tout premier amorçage, avec en fait deux niveaux d'app-of-apps, puis AppSet pour le libre-service par les équipes. »* — Membre de la communauté, discussion #11892

> *« J'utilise généralement AppSets au niveau supérieur et App-of-Apps comme deuxième niveau. Le niveau supérieur garantit que toutes les régions ont le produit. Le deuxième niveau garantit que le produit est déployé de manière cohérente dans la région. »* — @nastacio, discussion #11892

Une architecture en couches pratique :

```
ApplicationSet (Générateur de Clusters)
  └── par cluster : Application racine (App of Apps)
        └── par service : Application enfant
              └── Déploiement Helm/Kustomize
```

Ou inversé selon où vous avez besoin du dynamisme :

```
Application racine (App of Apps)
  └── ApplicationSet (Générateur de Répertoire Git)
        └── par service : Application
              └── Déploiement Helm/Kustomize
```

## Matrice de Décision

| Facteur | App of Apps | ApplicationSet |
|---------|-------------|----------------|
| **Courbe d'apprentissage** | Faible | Moyenne |
| **Personnalisation par application** | Complète | Limitée (nécessite division) |
| **Multi-cluster** | Duplication manuelle | Natif (Générateur de Clusters) |
| **Sécurité du libre-service** | Faible (permissions admin) | Élevée (template verrouille les champs) |
| **Débogage** | Facile (l'interface montre tout) | Difficile (logs du contrôleur) |
| **Passage à l'échelle (100+ apps)** | Pénible (nombre de fichiers) | Naturel (un seul manifest) |
| **Support des ondes de synchro.** | Par Application | Par ApplicationSet |
| **Découverte dynamique** | Non (YAML manuel) | Oui (scan de répertoire Git) |
| **Maturité** | Depuis ArgoCD v1.x | Depuis ArgoCD v2.x |

## Ce Que Nous Recommandons pour openDesk

Pour le contexte spécifique d'openDesk Edu — 30+ services, ciblant 1 à 3 clusters, avec un besoin de différenciation par environnement et éventuellement de libre-service — nous voyons **deux phases naturelles** :

### Phase 1 : App of Apps (maintenant)

Migrez de l'application helmfile monolithique vers une structure App of Apps. C'est la migration au risque le plus faible :

- Enveloppez chaque release helmfile de service en tant qu'Application ArgoCD séparée
- Regroupez l'infrastructure partagée (bases de données, caches) dans une phase de synchronisation commune
- Gardez l'orchestration helmfile mais décomposez-la en Applications enfants
- Gardez le contrôle sur l'ordonnancement de la synchronisation et les politiques par service

### Phase 2 : ApplicationSet (prochaine)

Une fois la structure App of Apps opérationnelle et stable, introduisez des ApplicationSets pour les motifs répétitifs :

- Utilisez un générateur de Répertoire Git pour découvrir automatiquement les services qui suivent une disposition standard
- Utilisez un générateur Matriciel (Git × Cluster) pour le déploiement multi-environnement (dev → staging → prod)
- Déléguez le libre-service pour les services spécifiques à l'éducation aux équipes via des ApplicationSets verrouillés avec templates

### Ce Que Nous Ne Faisons Pas

- **Supprimer helmfile entièrement.** Le plugin helmfile gère déjà bien l'ordonnancement des dépendances et le templating des valeurs. La couche Application (App of Apps ou ApplicationSet) doit orchestrer les releases helmfile, pas les remplacer.
- **Passer entièrement en ApplicationSet dès le premier jour.** La complexité de débogage et de templating n'en vaut pas la peine pour un déploiement mono-cluster avec un nombre fixe de services. ApplicationSet devient rentable à partir de 10+ clusters ou 50+ services.

## Références

- [Discussion ArgoCD #11892 — ApplicationSets vs App-of-apps vs Kustomize](https://github.com/argoproj/argo-cd/discussions/11892)
- [Documentation ArgoCD — ApplicationSet](https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/)
- [Documentation ArgoCD — Amorçage de cluster](https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/cluster-bootstrapping.md)
- [Motifs d'Application ArgoCD : App of Apps, ApplicationSets et au-delà — DevOpsil](https://devopsil.com/articles/2026-03-21-gitops-argocd-application-patterns)
- [Guide ApplicationSet Multi-Cluster ArgoCD — Opsio](https://opsiocloud.com/blogs/argocd-applicationset-multi-cluster/)
- [Comment implémenter le motif App-of-Apps à grande échelle — OneUptime](https://oneuptime.com/blog/post/2026-02-26-argocd-app-of-apps-pattern-at-scale/view)
- [Un Manifest, des Centaines d'Apps : Comment les ApplicationSets ArgoCD fonctionnent — Burrell Tech](https://burrell.tech/blog/argocd-applicationsets/)
- [Premiers pas avec les ApplicationSets — Red Hat](https://www.redhat.com/en/blog/getting-started-with-applicationsets)
- [openDesk Edu — Déploiement ArgoCD actuel](https://codeberg.org/opendesk-edu/argocd-opendesk)
