---
title: "Compte-rendu : openDesk Community of Practice — Juin 2026"
date: "2026-06-22"
description: "Merci à tous les participants de la session openDesk Community of Practice d'hier. Voici le résumé de la session avec les sujets clés, les liens vers la documentation et le sondage pour le prochain rendez-vous."
categories: ["communauté"]
tags: ["community-of-practice", "opendesk", "échange", "communauté", "campus"]
image: "/static/diagrams/architecture.svg"
---

# Compte-rendu : openDesk Community of Practice — Juin 2026

Merci à tous ceux qui ont participé hier à la session openDesk Community of Practice ! Les échanges ont été riches et les retours des différentes universités montrent combien openDesk Edu est déjà largement déployé.

Voici un résumé des principaux sujets abordés.

---

## 1. Stabilisation d'ILIAS

Une erreur récurrente `Connection refused` de MariaDB avec les pods nouvellement créés (cronjobs ILIAS) a été résolue par une boucle de réessai à 5 tentatives avec un délai de 10 s — le système est stable depuis. La mise à jour et les tests de versions plus récentes d'ILIAS restent en suspens.

## 2. OIDC / SSO

Keycloak dans le realm `opendesk` sert d'IdP central avec les mappers `email` et `preferred_username`. La discussion a porté sur les prochains services à connecter via OIDC (OpenProject ? Nextcloud ? Etherpad ?) et les expériences existantes avec SAML vs. OIDC.

## 3. Infrastructure de sauvegarde (k8up)

L'opérateur k8up (v2.13.0) sauvegarde actuellement 6 PVC RWX vers S3. 29 PVC RWO sont encore exclus et nécessitent une stratégie distincte (snapshots CSI ou plannings par nœud). Un **modèle à 3 niveaux** a été proposé :

| Niveau | Exemples | RPO | RTO | Rétention |
|:-------|:---------|:----|:----|:----------|
| **A** (critique) | Keycloak, PostgreSQL, Redis, MariaDB, MinIO | 1h | 2h | 30j |
| **B** (important) | Nextcloud, OX, OpenProject, ILIAS, Moodle | 1h | 4h | 14j |
| **C** (expérimental) | JupyterHub, Ollama, Dask | 24h | 1j | 7j |

## 4. Surveillance

Collabora dispose de métriques, d'alertes et d'un tableau de bord. Nextcloud manque encore d'alertes et d'un tableau de bord. Des lacunes existent pour les tableaux de bord de santé des sauvegardes et les alertes de ressources (CPU > 80 %, Mémoire > 85 %, Disque > 80 %).

## 5. Problèmes connus du HRZ

- **Chaînes CNAME DNS** : CoreDNS → SERVFAIL, contournement via `hostAliases`
- **Bug de probe Nextcloud AIO** : `initialDelaySeconds` incorrect
- **Ingress Planka** : `nginx` codé en dur, annotation à supprimer
- **Classe d'ingress Grafana** : basculer vers haproxy
- **Boucle de redémarrage ClamAV ICAP** : nettoyage du conteneur nécessaire
- **PVC RWO k8up** : le pod de sauvegarde ne peut pas monter → exclus

## 6. Upstream et état du cluster

**openDesk 1.15.0** (actuel, 28.05.2026) a apporté SeaweedFS comme stockage objet S3, OX App Suite 8.48, Nextcloud 32.0.9 et le support HAProxy Ingress. **v1.16.0** est en préparation avec l'optimisation des workers Nextcloud et le LoadBalancerIP Dovecot/Postfix.

Le cluster HRZ fonctionne sous K3s v1.32.3 (9 nœuds, Debian 12) avec le stockage Ceph, kube-prometheus-stack et ArgoCD.

## 7. Secteur éducatif

ILIAS fonctionne en production, Moodle est prêt en tant que Helm chart (déploiement en attente). Le groupe a discuté des services manquants — tels que Stud.IP, HIS ou d'autres systèmes de l'enseignement supérieur — et de l'évolution des exigences en matière de protection des données (RGPD, cloud dans l'enseignement supérieur).

## 8. Architecture

L'**architecture actuelle d'openDesk Edu** avec l'IAM, les applications, les intégrations et le flux de messagerie est présentée dans le diagramme d'architecture :

➡️ [Diagramme d'architecture (SVG)](/static/diagrams/architecture.svg)

L'architecture d'exécution détaillée, y compris la topologie de stockage et la matrice de sauvegarde, est disponible dans le [dépôt CoP](https://codeberg.org/opendesk-edu/opendesk-cop).

---

## Liens

- **📄 Documentation de l'appel** : [Codeberg — Session CoP 2025-06-19](https://codeberg.org/opendesk-edu/opendesk-cop/src/branch/main/2025-06-19-community-of-practice-session.md)
- **📋 Sondage pour la prochaine date CoP** : [DFN Terminplaner](https://terminplaner6.dfn.de/de/p/1509a06af2198fc680b2cac353ecca55-1808219)
- **🏗️ Diagramme d'architecture** : [/static/diagrams/architecture.svg](/static/diagrams/architecture.svg)
- **💻 openDesk Edu** : [opendesk-edu.org](https://opendesk-edu.org/)
- **🐘 Codeberg** : [codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu/)

Merci de participer au sondage d'ici la fin de la semaine prochaine — nous reviendrons ensuite vers vous avec la date définitive du prochain appel CoP dans environ trois mois.
