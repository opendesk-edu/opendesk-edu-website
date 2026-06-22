---
title: "Dask Gateway"
date: "2026-05-29"
description: "Cluster de calcul parallèle distribué pour passer à l'échelle les charges de travail en science des données et calcul scientifique."
categories: ["calcul-scientifique", "infrastructure", "planifié"]
tags: ["dask", "distributed-computing", "parallel", "big-data", "scientific-computing"]
version: "2024.1"
---

# Dask Gateway

Dask Gateway fournit des clusters de calcul distribués à la demande qui passent à l'échelle les charges de travail Python et de science des données sur plusieurs nœuds. Il est conçu pour les chercheurs qui ont besoin de traiter de grands ensembles de données, d'exécuter des simulations parallèles ou d'accélérer les pipelines d'apprentissage automatique.

## Fonctionnalités clés

- **Clusters à la demande** : Créez et dimensionnez des clusters Dask dynamiquement en fonction des besoins de la charge de travail.
- **Natife Python** : Intégration complète avec l'écosystème Python de science des données (NumPy, Pandas, Scikit-learn, Xarray).
- **File d'attente de jobs** : Gérez et priorisez les soumissions multi-utilisateurs avec des limites de ressources configurables.
- **Tableau de bord** : Supervision en temps réel de l'état du cluster, de la progression des tâches et de l'utilisation des ressources.
- **Évolutif** : Du développement mono-nœud aux clusters de production multi-nœuds.

## Intégration avec openDesk Edu

Dask Gateway fait partie de la suite Collab Services (Phase C — planifié) et se déploie via son chart Helm amont (`helm.dask.org`). Il sera accessible à `compute.*` sous le DNS wildcard de l'établissement et s'intégrera à Keycloak pour l'authentification.

## En savoir plus

- [Documentation officielle](https://gateway.dask.org/) — Documentation et ressources Dask Gateway
- [Projet Dask](https://dask.org/) — Calcul parallèle en Python
