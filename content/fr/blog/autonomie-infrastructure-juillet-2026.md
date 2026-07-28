---
title: "Autonomie de l'Infrastructure — Rapport de Progrès Juillet 2026"
date: "2026-07-28"
description: "Stalwart v0.16 remplace Postfix, tous les services connectés via SSO Keycloak, ArgoCD GitOps étendu et dépôts d'infrastructure personnalisés créés."
categories: ["Infrastructure"]
tags: ["stalwart", "oidc", "keycloak", "argocd", "gitops"]
image: "/static/blog/infrastructure-autonomy-july-2026-teaser.svg"
---

# Autonomie de l'Infrastructure — Rapport de Progrès Juillet 2026

Le déploiement openDesk Edu au HRZ Marburg a atteint deux jalons majeurs ce mois-ci : l'intégration SSO complète de tous les services et une autonomie quasi totale vis-à-vis des registries externes.

## Stalwart v0.16 Remplace Postfix

Stalwart Mail Server a été mis à niveau de v0.15 à **v0.16.15** et a repris le rôle de MTA principal. Postfix a été désactivé.

**Nouveautés :** 9 listeners actifs, configuration JSON avec RocksDB, probes TCP socket, sécurité adaptée à K3s v1.32.3.

Les services utilisent désormais Stalwart comme relais SMTP :
- SOGo — `smtp://stalwart-stalwart:587`
- OpenCloud — `stalwart-stalwart.opendesk.svc.cluster.local:587`

## SSO Unifié via Keycloak

Tous les services s'authentifient via le realm central Keycloak (`opendesk`) : OpenCloud, Stalwart, SOGo, Element/Matrix, XWiki, et le portail.

## Expansion ArgoCD GitOps

La gestion ArgoCD est passée de 2 à **27 applications edu** en convertissant les apps basées sur CMP en apps Helm.

## Dépôts d'Infrastructure Personnalisés

Quatre dépôts indépendants ont été créés pour se déconnecter des registries externes :

- **opendesk-kubectl** — Image kubectl minimale (~30MB)
- **opendesk-helm-charts** — Charts personnalisés + outillage de miroir OCI
- **opendesk-sogo-image** — Image SOGo avec support OIDC/SSO
- **opendesk-collab-dashboard** — Tableau de bord des services edu

## Surveillance et Sauvegardes

- **28/29 tests de contrat réussis**
- **11 règles d'alerte Prometheus**
- **Opérateur k8up** — 0 redémarrages
- **Plans de sauvegarde** — quotidiens à 00:42 et 01:00

---

*Déployé sur K3s v1.32.3 · 9 nœuds · Stockage Ceph CSI · HRZ Marburg*
