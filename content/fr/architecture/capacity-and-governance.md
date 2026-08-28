---
title: "Analyse de capacité et modèle de gouvernance"
date: "2026-08-27"
description: "Un document technique compagnon. Planification de capacité détaillée pour les déploiements de toute taille, et le modèle de gouvernance pour l'exploitation d'une plateforme openDesk Edu."
categories: ["architecture", "infrastructure", "operations"]
tags: ["architecture", "capacité", "gouvernance", "mise-à-l’échelle", "operations", "cycle-de-vie"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/capacity-and-governance-teaser.svg"
---

# Analyse de capacité et modèle de gouvernance

Ceci est le document technique compagnon du [Aperçu de l'architecture système](/architecture/overview). Il fournit des directives détaillées de planification de capacité pour les déploiements de toute taille, et décrit le modèle de gouvernance pour l'exploitation d'une plateforme openDesk Edu.

## Analyse de capacité

### Philosophie de dimensionnement

openDesk Edu est conçu comme une architecture de référence. Chaque service est dimensionné indépendamment, puis les exigences sont additionnées (avec surcharge pour les opérations du cluster).

### Niveaux de déploiement

| Niveau | Utilisateurs simultanés actifs | Utilisateurs totaux | Nœuds du cluster | CPU typique | RAM typique | Stockage typique |
|--------|-------------------------------|---------------------|-----------------|-------------|-------------|-------------------|
| **Niveau 0 (Pilote)** | 0–500 | 2,000 | 1–2 | 4–8 vCPU | 16–32 GB | 500 GB–2 TB |
| **Niveau 1 (École)** | 500–5,000 | 2,000–10,000 | 3–5 | 16–32 vCPU | 64–128 GB | 2–10 TB |
| **Niveau 2 (Université)** | 5,000–50,000 | 10,000–100,000 | 8–15 | 64–256 vCPU | 256–1024 GB | 10–100 TB |
| **Niveau 3 (Grande Université)** | 50,000+ | 100,000+ | 20+ | 512+ vCPU | 2+ TB | 100+ TB |

### Exigences spécifiques aux services

#### Identité et authentification

| Service | CPU | RAM | Stockage | Notes |
|---------|-----|-----|----------|-------|
| Keycloak | 0.5–2 vCPU | 1–4 GB | 5–10 GB | Évolutivité avec les sessions actives |
| Shibboleth SP | 0.25–1 vCPU | 0.5–2 GB | 1–2 GB | Par service SAML |
| Nubus | 0.5–2 vCPU | 1–4 GB | 5–10 GB | Portail et IAM |

#### Stockage de fichiers

| Service | CPU | RAM | Stockage | Notes |
|---------|-----|-----|----------|-------|
| Nextcloud (App) | 2–8 vCPU | 4–16 GB | 1–5 GB | PV pour les fichiers |
| Nextcloud (DB) | 2–4 vCPU | 4–8 GB | 20–50 GB | Métadonnées |
| Nextcloud (Redis) | 0.5–1 vCPU | 1–2 GB | 1 GB | Cache |
| OpenCloud | 1–4 vCPU | 2–8 GB | 5–10 GB | Plus léger que Nextcloud |

**Formule de stockage :** Total ≈ Utilisateurs × GoMoyen × 1,7 (versioning + surcharge)

#### Messagerie et groupware

| Service | CPU | RAM | Stockage | Postal max | Notes |
|---------|-----|-----|----------|-------------|-------|
| OX App Suite | 4–16 vCPU | 8–32 GB | 50–200 GB | 10k–100k | Groupware d'entreprise |
| SOGo | 2–4 vCPU | 4–8 GB | 20–50 GB | 5k–25k | Webmail léger |
| Grommunio | 4–8 vCPU | 8–16 GB | 30–100 GB | 5k–50k | ActiveSync inclus |
| MariaDB | 4–16 vCPU | 8–32 GB | 50–200 GB | – | Base de données groupware |

#### Systèmes de gestion de l'apprentissage

| Service | CPU | RAM | Stockage | Concurrents max | Notes |
|---------|-----|-----|----------|------------------|-------|
| Moodle | 2–8 vCPU | 4–16 GB | 20–100 GB | 500–5k | Pile LAMP |
| Moodle (DB) | 4–16 vCPU | 8–32 GB | 50–200 GB | – | PostgreSQL recommandé |
| ILIAS | 4–16 vCPU | 8–32 GB | 50–200 GB | 1k–10k | Basé sur Java |
| ILIAS (DB) | 4–16 vCPU | 8–32 GB | 100–500 GB | – | Surcharge Java DB |

#### Visioconférence

| Service | CPU | RAM | Bande passante | Concurrents max | Notes |
|---------|-----|-----|----------------|------------------|-------|
| Jitsi | 2–8 par réunion | 4–16 GB | 1–8 Mbps/participant | 50–100 par instance | Transcodage WebRTC |
| BigBlueButton | 4–16 vCPU | 8–32 GB | 0,5–2 Mbps/participant | 100–200 par instance | GPU recommandé pour transcodage |

#### Collaboration

| Service | CPU | RAM | Stockage | Notes |
|---------|-----|-----|----------|-------|
| Collabora | 2–8 vCPU | 4–16 GB | 1–5 GB | Instances WOPI |
| Etherpad | 0.5–2 vCPU | 1–4 GB | 1–5 GB | Léger |
| CryptPad | 1–4 vCPU | 2–8 GB | 5–10 GB | Chiffrement bout en bout |
| XWiki | 2–4 vCPU | 4–8 GB | 10–50 GB | CMS Java |
| BookStack | 1–2 vCPU | 2–4 GB | 5–20 GB | Wiki léger |
| OpenProject | 2–4 vCPU | 4–8 GB | 10–50 GB | Gestion de projet Ruby |

#### Communication en temps réel

| Service | CPU | RAM | Stockage | Concurrents max | Notes |
|---------|-----|-----|----------|------------------|-------|
| Element/Matrix | 0,5–2 vCPU | 1–4 GB | 5–10 GB | 500–5k | Serveur Synapse |
| Zammad | 2–4 vCPU | 4–8 GB | 10–50 GB | 500–2k | Helpdesk |

#### Infrastructure

| Service | CPU | RAM | Stockage | Notes |
|---------|-----|-----|----------|-------|
| PostgreSQL | 2–8 vCPU | 4–16 GB | 20–100 GB | Par instance |
| MariaDB | 2–8 vCPU | 4–16 GB | 20–100 GB | Par instance |
| Redis | 0,5–2 vCPU | 1–4 GB | 1–5 GB | Par instance |

### Planification du stockage

**Formule :** StockageTotal = (DonnéesUtilisateur × Croissance) + SurchargeService + SurchargeSauvegarde + Tampon

- DonnéesUtilisateur = N × GoMoyen × (1 + tauxCroissanceAnnuel × années)
- SurchargeService ≈ 15% des DonnéesUtilisateur
- SurchargeSauvegarde ≈ 250% des DonnéesUtilisateur (2× quotidien + 1× hebdomadaire)
- Tampon = 20% du total

**Simplifié :** 40–60 GB par utilisateur incluant sauvegardes et surcharge pour 3 ans.

**Classes de stockage :**

| Classe | Cas d'usage | Modèle d'accès | Coût | Performance |
|--------|-------------|----------------|------|-------------|
| SSD local | Bases de données | Lecture/écriture aléatoire fréquente | Élevé | Très élevé |
| Ceph/RBD | PV | Mixte | Moyen | Élevé |
| CephFS | Stockage mutualisé | Lecture/écriture mutualisée | Moyen | Moyen |
| NFS | Hébergement | Lecture fréquente, écriture occasionnelle | Faible | Moyen |
| S3 | Sauvegardes/Archives | Accès rare, lecture séquentielle | Faible | Faible |

### Planification du réseau

#### Bande passante externe

| Activité | Bande passante par utilisateur |
|----------|--------------------------------|
| Navigation basique | 100–500 kbps |
| Édition de documents | 200–1000 kbps |
| Visioconférence (Jitsi) | 500–8000 kbps |
| Visioconférence (BigBlueButton) | 0,5–2 Mbps |
| Lecture vidéo | 1–5 Mbps |
| Téléchargement de fichiers | 1–10 Mbps |

**Formule :** BandePassanteTotale = UtilisateursMaximal × BandePassanteMoyenne × FacteurDePique (1,5–3,0)

**Exemple Niveau 2 (5,000 utilisateurs):** 5,000 × 0,5 Mbps × 2 = **5 Gbps Égress requis**

### surcharge Kubernetes

| Composant | CPU | RAM | Stockage | Notes |
|-----------|-----|-----|----------|-------|
| etcd | 2–4 | 8–16 GB | 20–50 GB | 3–5 nœuds HA |
| Control Plane | 2–4 | 4–8 GB | 5–10 GB | Par nœud |
| OS du nœud | 0,5 par worker | 1–2 GB par worker | 20–50 GB | Système d'exploitation |
| CNI | 0,5 par nœud | 1 GB par nœud | – | Calico/Flannel |
| Prometheus | 2–4 | 8–16 GB | 50–100 GB | Évolutif avec la taille |
| Loki | 2–8 | 8–32 GB | 100–500 GB | Évolutif avec les logs |
| Traefik | 1–2 | 2-4 GB | 1 GB | Par ingress |

**surcharge totale :** 10–20 vCPU, 20–40 GB RAM (hors OS des nœuds)

### Stratégies de mise à l'échelle

#### Horizontale

- **Sans état :** Ajouter des répliques de pod
- **Avec état :** Répliques de lecture ou sharding
- **Stockage :** Ajouter des OSD Ceph ou des serveurs NFS
- **Ingress :** Ajouter des contrôleurs d'ingress

Exemple HPA:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nextcloud
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nextcloud
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

#### Verticale

- Augmenter vCPU et RAM par pod
- Utiliser des tailles de nœuds plus grandes
- Séparer les charges de travail de lecture/écriture

#### Cluster Autoscaler

- **Scale-up :** Lorsque les pods ne peuvent pas être planifiés
- **Scale-down :** Lorsque les nœuds sont sous-utilisés (par défaut 10 min)
- **Min/Max nœuds :** Définir des limites

---

## Modèle de gouvernance

### Modèle opérationnel

openDesk Edu est conçu pour un hébergement auto-géré. La plateforme fournit des charts Helm de référence, des fichiers de valeurs et de la documentation. L'**institution** est responsable de : déploiement, exploitation, gestion des utilisateurs, surveillance, support, mises à jour, et maintenance.

### Rôles organisationnels

| Rôle | Responsabilités | Équipe typique |
|------|-----------------|----------------|
| **Propriétaire de la plateforme** | Orientation stratégique, budget, responsabilité globale | Direction informatique, CIO |
| **Opérateur de la plateforme** | Exploitation quotidienne, surveillance, réponse aux incidents | Équipe infrastructure, DevOps |
| **Administrateur de service** | Configuration et gestion des services individuels | Équipe applicative |
| **Administrateur fédératif** | Connexions IdP, configurations SAML/OIDC | Équipe IAM |
| **Administrateur du stockage** | Stockage, Ceph/NFS, sauvegardes | Équipe stockage |
| **Responsable de la sécurité** | Politiques, conformité, Gestion des vulnérabilités | Équipe sécurité |
| **Administrateur de base de données** | Tuning DB, sauvegardes, réplication | Équipe DBA |

### Processus décisionnel

1. Proposition (ticket/problème/demande de changement)
2. Évaluation de l'impact (utilisateurs, services, infrastructure, dépendances)
3. Étude de faisabilité (technique et ressources)
4. Approbation (selon le risque et l'impact)
5. Planification (implémentation, retour arrière, calendrier)
6. Communication (informer les parties prenantes)
7. Implémentation (fenêtre de maintenance si nécessaire)
8. Vérification (tests, validation)
9. Documentation (mettre à jour la documentation)
10. Clôture (revue post-implémentation)

### Matrice d'approbation

| Type de changement | Approbation requise | délai | Fenêtre de maintenance |
|--------------------|---------------------|--------|-------------------------|
| Urgent (sécurité/incident) | Opérateur + Responsable sécurité | 0–1 h | Selon besoin |
| Mineur (configuration, petite mise à jour) | Opérateur | 1–3 jours | Optionnelle |
| Standard (nouveau service, mise à jour majeure) | Propriétaire + Opérateur | 1–2 semaines | Requise |
| Majeur (architecture, version Kubernetes) | Opérateur + Propriétaire | 2–4 semaines | Requise, étendue |

### Gestion des changements (basée sur ITIL)

#### Catégories

| Catégorie | Description | Risque | Exemple |
|-----------|-------------|--------|---------|
| Standard | Pré-approuvé, faible risque | Faible | Changement de configuration |
| Normal | Nécessite approbation | Moyen | Nouveau service |
| Urgence | Urgent, impact élevé | Élevé | Correctif de sécurité |

#### Workflow — Standard

1. Enregistrer dans le système de gestion des changements
2. Sélectionner un modèle pré-approuvé
3. Implémenter à l'heure prévue
4. Marquer comme terminé

#### Workflow — Normal

1. Créer un RFC (Request for Change)
2. Revue par le Change Advisory Board (CAB)
3. Approbation ou refus
4. Si approuvé : créer un plan et un calendrier d'implémentation
5. Implémenter pendant la fenêtre de maintenance
6. Vérifier et documenter
7. Revue par le CAB (Post-implémentation)

#### Workflow — Urgence

1. Identifier l'incident
2. Planifier et tester la correction (dans staging si possible)
3. Revue et approbation par l'Emergency CAB (ECAB)
4. Implémenter la correction
5. Revue post-implémentation avec le CAB complet
6. Appliquer rétroactivement le processus standard de changement

### Fenêtres de maintenance

- **Planifiée :** Hebdomadaire ou bihebdomadaire, 2–4 heures, en dehors des heures ouvrables (02h00–06h00)
- **Étendue :** Trimestrielle ou selon besoin, 4–12 heures, le week-end (samedi 02h00–14h00)
- **Urgence :** Selon besoin, durée variable, immédiatement ou dès que possible

### Gestion des mises à jour et du cycle de vie

#### Politiques de mise à jour

| Composant | Fréquence | Processus | Temps d'arrêt | Retour arrière |
|-----------|-----------|-----------|---------------|----------------|
| Kubernetes | Trimestrielle | Blue-Green ou Rolling | Requise | Requise (Snapshot) |
| Charts Helm | Par version | Rolling | Optionnelle | Optionnelle |
| Applications | Par version | Rolling | Optionnelle | Optionnelle |
| Bases de données | Si nécessaire | Blue-Green | Requise | Requise (Dump) |
| Ceph Stockage | Si nécessaire | Rolling | Aucune (avec réplication) | Basée sur Snapshot |
| Certificats | Trimestrielle | Automatique (cert-manager) | Aucune | Automatique |

**Stratégie :**
- Kubernetes : Politique de support N-2
- Applications : Suivre la politique de support upstream
- Bases de données : Même version majeure pour tous les services
- Dépendances : Mises à jour régulières pour les correctifs de sécurité

### Gestion de la sécurité

#### Gestion des vulnérabilités

- **Analyse :** Images conteneur (Trivy, Kubescape), dépendances (audit npm, OWASP), configuration (kube-bench), réseau (Nmap)
- **Correction :** Critique (24 h), Élevée (7 jours), Moyenne (30 jours), Faible (90 jours)
- **Exemption :** Documentée avec date d'expiration

#### Contrôle d'accès

- Revues d'accès : Trimestrielles
- Journalisation audit : Activée pour l'API Kubernetes, Keycloak, services critiques
- Durée de conservation : 1 an (plus long pour la conformité)
- Protection d'intégrité : Lecture seule, stockage séparé

#### Conformité

- Cartographier les exigences de conformité vers les contrôles de la plateforme
- Évaluations de conformité régulières
- Documentation et preuves
- Adresser les écarts
- Fournir des rapports aux auditeurs

### Gouvernance des sauvegardes et de la reprise après sinistre

#### Politique de sauvegarde

- **Fréquence :** Quotidienne pour les bases de données, hebdomadaire pour les données moins critiques
- **Conservation :** 30 jours au quotidien, 12 mois par semaine, 7 ans par mois
- **Test :** Restauration testée trimestriellement
- **Chiffrement :** Toutes les sauvegardes chiffrées avec une clé séparée
- **Hors site :** Toutes les sauvegardes stockées hors site
- **Immuable :** Sauvegardes critiques WORM (Write Once Read Many)

#### Objectifs de reprise

| Niveau | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|--------|-------------------------------|-------------------------------|
| 0 | Non défini (Pilote) | 24 h |
| 1 | 4–8 h (critique) / 24 h (tous) | 1 h |
| 2 | 1–4 h (critique) / 8–24 h (tous) | 15 min |
| 3 | < 1 h (critique) / 4–12 h (tous) | 5 min |

#### Plan de reprise après sinistre

1. Déclarer l'incident, activer le plan de reprise
2. Évaluer l'impact et la portée de l'incident
3. Restaurer les services par ordre de priorité
4. Vérifier et tester les services restaurés
5. Notifier les utilisateurs et les parties prenantes
6. Effectuer une revue post-incident

### Gestion des incidents

#### Niveaux de gravité

| Gravité | Impact | Temps de réponse | Escalade |
|---------|--------|-------------------|-----------|
| SEV-1 | Arrêt total / Perte de données / Violation de sécurité | Immédiat | 24/7, toutes mains sur le pont |
| SEV-2 | Dégradation majeure / Plusieurs services affectés | 15 min | Équipe élargie |
| SEV-3 | Dégradation mineure / Service unique affecté | 1 h | Équipe standard |
| SEV-4 | Problèmes cosmétiques / Bugs non critiques | 4 h | Contributeur individuel |

#### Processus de réponse aux incidents

1. Détection (surveillance, rapport utilisateur)
2. Triage (gravité, impact, portée)
3. Déclaration (gravité, attribuer un propriétaire)
4. Escalade (équipe, parties prenantes)
5. Enquête (identifier la cause racine)
6. Atténuation (solution temporaire)
7. Résolution (solution permanente)
8. Récupération (service entièrement opérationnel)
9. Post-mortem (documentation, identifier les améliorations)
10. Clôture (toutes les actions de suivi terminées)

#### Communication

- **Interne :** Chat d'équipe, système de gestion des incidents
- **Externe (utilisateurs) :** Page de statut avec temps de résolution estimé
- **Parties prenantes :** Mises à jour régulières par e-mail/téléphone pour SEV-1/2
- **Post-incident :** Rapport post-mortem pour SEV-1/2

### Documentation et gestion des connaissances

- **Architecture :** Architecture système, dépendances, flux de données
- **Exploitation :** Déploiement, configuration, dépannage, procédures de maintenance
- **Sécurité :** Politiques, procédures, normes
- **Conformité :** Exigences, contrôles, preuves
- **Changements :** Modèles de demandes de changement, processus d'approbation, comptes-rendus du CAB
- **Incidents :** Rapports d'incidents, post-mortems, leçons apprises
- **Utilisateurs :** Guides, FAQ, tutoriels

**Normes :**
- Dans le contrôle de version Git
- Format Markdown
- Mettre à jour avec chaque changement
- Maintenir à jour

### Communauté et contribution

openDesk Edu est un projet dirigé par la communauté. Les contributions sont les bienvenues :

- Rapports de bugs / Demandes de fonctionnalités via GitHub Issues
- Améliorations de la documentation
- Contributions de code via des pull requests
- Support communautaire sur Matrix (`#opendesk-ce-public:matrix.opendesk-edu.org`)
- Présentations, articles de blog, conférences

**Processus de contribution :**
1. Forker le dépôt, créer une branche de fonctionnalité
2. Valider les changements avec des messages clairs
3. Ouvrir une pull request avec description et contexte
4. Discuter les retours avec les mainteneurs
5. Traiter les retours et effectuer des mises à jour
6. Fusionner une fois approuvé et tous les tests passés

**Lignes directrices des mainteneurs :**
- Répondre en temps voulu aux issues et PRs
- Fournir des retours clairs et constructifs
- Être accueillant et inclusif envers tous les contributeurs
- Suivre le code de conduite
- Prendre des décisions de version en consensus avec la communauté

---

## Résumé

Ce document compagnon vous donne les outils pour **planifier** et **exploiter** un déploiement openDesk Edu réussi :

- **Analyse de capacité :** Vous aide à dimensionner votre infrastructure
- **Modèle de gouvernance :** Décrit comment gérer la plateforme tout au long de son cycle de vie

**Prochaines étapes :**
1. Planifier votre déploiement : utiliser les descriptions de niveaux et les tableaux de services
2. Concevoir votre gouvernance : adapter les processus à votre institution
3. Déployer : utiliser [Aperçu de l'architecture système](/architecture/overview) comme guide
4. Surveiller : mettre en place l'observabilité et les alertes
5. Itérer : revoir régulièrement la capacité et la gouvernance, faire des améliorations

---

*La planification de la capacité porte sur la préparation. La gouvernance porte sur la durabilité. Ensemble, elles garantissent que votre plateforme openDesk Edu peut grandir avec votre institution et rester fiable année après année.*
