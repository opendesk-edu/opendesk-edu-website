---
title: "Conformité ZKI IT-Grundschutz : le parcours d'openDesk Edu vers la baseline de sécurité de l'enseignement supérieur"
date: "2026-08-07"
description: "openDesk Edu s'aligne systématiquement sur le profil ZKI IT-Grundschutz — l'adaptation pour l'enseignement supérieur de la baseline BSI — grâce à des politiques Kyverno exécutoires, une pipeline GitOps durcie et une analyse d'écart transparente. Voici où nous en sommes."
categories: ["Sécurité", "Conformité"]
tags: ["zki", "it-grundschutz", "bsi", "conformité", "kyverno", "sécurité", "enseignement-supérieur", "isms"]
image: "/static/blog/zki-it-grundschutz-compliance-teaser.svg"
---

# Conformité ZKI IT-Grundschutz : le parcours d'openDesk Edu vers la baseline de sécurité de l'enseignement supérieur

> **La baseline :** Chaque centre informatique universitaire allemand travaille selon le profil ZKI IT-Grundschutz — l'adaptation pour l'enseignement supérieur de la méthodologie BSI IT-Grundschutz.
>
> **La réalité :** Pour une plateforme composée d'une suite complète de services open-source, la conformité n'est pas une case à cocher une fois pour toutes. C'est une propriété architecturale qui doit être appliquée en continu — par des politiques, des pipelines et une documentation transparente.
>
> **Notre approche :** Plutôt qu'une déclaration de conformité, nous avons construit un système de conformité : plus de 20 politiques Kyverno exécutoires, une pipeline GitOps durcie et une analyse d'écart publique qui montre exactement où nous en sommes — y compris les lacunes.

## Qu'est-ce que le profil ZKI IT-Grundschutz ?

Le **profil ZKI IT-Grundschutz** est le cadre de référence pour la sécurité des établissements d'enseignement supérieur allemands. Il adapte la méthodologie **BSI IT-Grundschutz** — la baseline fédérale allemande pour la sécurité de l'information — aux réalités spécifiques des universités :

- **Données de recherche** avec des exigences de protection uniques
- **Données étudiantes** et systèmes d'examen soumis à des règles particulières
- **Collaboration ouverte** qui doit rester possible malgré les contrôles de sécurité
- **Administration décentralisée** entre facultés et instituts

Là où le BSI IT-Grundschutz fournit des modules génériques pour toutes les organisations, le profil ZKI les adapte aux opérations universitaires — aligné sur le RGPD, le HDSG et ISIS12, les normes de sécurité de l'information pour l'enseignement supérieur allemand.

Pour openDesk Edu, ce n'est pas un exercice théorique. Les universités allemandes ne peuvent pas adopter une plateforme de travail numérique qui ne s'aligne pas sur la baseline de sécurité à laquelle leurs propres centres informatiques sont mesurés.

## Nix et container.gov.de : la conformité par conception

Un pilier central de notre stratégie de conformité est la **pipeline de build basée sur Nix** avec une conformité **container.gov.de** complète. Le BSI a développé container.gov.de comme une norme pour les images de conteneurs sécurisées qui définit huit exigences (BG-1 à BG-8). openDesk Edu implémente les huit exigences dans Nix :

```mermaid
graph TD
    subgraph Nix["Nix + container.gov.de Pipeline"]
        direction TB
        
        subgraph Row1[" "]
            BG1["BG-1<br/>Trusted Base Images"]
            BG2["BG-2<br/>Non-Root User"]
            BG3["BG-3<br/>Minimal Rights"]
        end
        
        subgraph Row2[" "]
            BG4["BG-4<br/>No Sensitive Data"]
            BG5["BG-5<br/>Updates Strategy"]
            BG6["BG-6<br/>SBOM Generation<br/>SPDX + CycloneDX"]
        end
        
        subgraph Row3[" "]
            BG7["BG-7<br/>Image Signing<br/>Cosign"]
            BG8["BG-8<br/>Vulnerability Scanning<br/>Grype + Trivy"]
            COMPLIANT["✅ 100% COMPLIANT<br/>container.gov.de + Nix"]
        end
    end
    
    BG1 --> BG2 --> BG3
    BG3 --> BG4
    BG4 --> BG5 --> BG6
    BG6 --> BG7
    BG7 --> BG8
    BG8 --> COMPLIANT
    
    style Nix fill:#f5f5f5,stroke:#333,stroke-width:2px
    style COMPLIANT fill:#90EE90,stroke:#228B22,stroke-width:2px
```

### Les huit exigences container.gov.de dans Nix

| Exigence | Implémentation dans Nix | Preuve de conformité |
|----------|------------------------|---------------------|
| **BG-1** : Images de base de confiance | `nixpkgs` avec builds reproductibles | `nix flake check` |
| **BG-2** : Utilisateur non-root | `runAsNonRoot: true` dans le contexte de sécurité | Politique Kyverno `zki-require-non-root` |
| **BG-3** : Droits minimaux | `drop: ["ALL"]` pour les capabilities | Politique Kyverno `zki-drop-all-capabilities` |
| **BG-4** : Pas de données sensibles dans l'image | Builds multi-étapes, secrets externes | Scan SBOM, rapport Grype |
| **BG-5** : Stratégie de mise à jour | Nix Flakes avec fichiers de lock | Builds reproductibles |
| **BG-6** : Génération de SBOM | SPDX 2.3 + CycloneDX automatique | `nix build .#sbom-<service>` |
| **BG-7** : Signature d'images | Cosign avec GitHub OIDC | `cosign verify` |
| **BG-8** : Scan de vulnérabilités | Grype + Trivy en CI | PolicyReports dans le cluster |

### Fonctionnement minimal du registre

Une autre étape vers la conformité est la **réduction du registre de production** au minimum essentiel. Au lieu de 78 images dans le registre de production, nous exploitons désormais :

- **5 images de production** : sogo5, sogo6, dev-agent, stalwart, opencloud
- **73 images prêtes à être buildées** : Toutes les définitions Nix disponibles, buildables à la demande

Cela réduit la surface d'attaque et rend le registre gérable et auditable — un pilier important pour la conformité ZKI.

**URL du registre :** `registry.opencode.de/umr/opendesk-edu/opendesk-nix/`

## Où openDesk Edu en est déjà

Avant d'écrire une seule nouvelle politique, nous avons audité ce que la plateforme applique déjà. Les résultats sont encourageants — de nombreuses mesures ZKI sont implémentées par conception :

### Gestion des identités et des accès ✅
- **Keycloak** comme fournisseur d'identité central avec OIDC et SAML
- **Identités fédérées** via Shibboleth et DFN-AAI
- **Authentification multi-facteurs**, politiques de mots de passe et verrouillage de compte
- **Contrôle d'accès basé sur les rôles** avec permissions fines
- **Gestion des sessions** avec délais configurables

### Sécurité réseau ✅
- **HAProxy** comme ingress avec terminaison TLS
- **Traefik** comme couche d'ingress supplémentaire
- **Network Policies** restreignant le trafic service-à-service
- **Pod Security Admission (PSA)** appliquée à l'échelle du cluster
- Segmentation réseau entre namespaces

### Durcissement système ✅
- **Conteneurs non-root** (`runAsNonRoot: true`)
- **Suppression des capabilities** (`drop: ["ALL"]`)
- **Systèmes de fichiers root en lecture seule** là où c'est applicable
- **Profils seccomp** (`RuntimeDefault`)
- **Limites de ressources** sur chaque workload

### Protection des données ✅
- **Stockage Ceph** avec chiffrement au repos
- **Opérateur de sauvegarde k8up** avec restic — chiffré, planifié, testé
- **Politiques de rétention** et annotations de sauvegarde PVC
- **Secrets chiffrés SOPS** dans Git

### Observabilité ✅
- **Prometheus** pour les métriques
- **Grafana** pour les tableaux de bord
- **Loki** pour l'agrégation centralisée des journaux
- **Alertmanager** pour le routage des alertes

## L'écart : des bonnes pratiques à une conformité appliquée

Une posture par défaut solide est nécessaire — mais pas suffisante. La conformité ZKI exige que les propriétés de sécurité soient *appliquées*, *vérifiables* et *validées en continu*. C'est là que nous avons identifié les lacunes.

### La checklist de 111 points

Nous avons traduit les modules ZKI/BSI pertinents en **111 points de contrôle concrets** répartis en dix catégories, chacun mappé à un module BSI et un niveau de priorité :

| Priorité | Catégorie | Statut |
|----------|-----------|--------|
| **P0** | IAM & Authentification | ⚠️ Partiel |
| **P0** | Sécurité réseau | ✅ Bon |
| **P0** | Protection des données | ⚠️ Partiel |
| **P1** | Audit & Journalisation | ⚠️ Partiel |
| **P1** | Réponse aux incidents | ❌ Manquant |
| **P1** | Gestion du changement | ⚠️ Partiel |
| **P2** | Sécurité applicative | ⚠️ Partiel |
| **P2** | Sécurité physique | ✅ Bon |
| **P2** | Sensibilisation & Formation | ❌ Manquant |

Notre point de départ interne (auto-évaluation, pas un audit certifié) : **~37 % de conformité globale**, avec une couverture des modules BSI d'environ **~81 %** là où la plateforme opère déjà. Ces chiffres sont des estimations internes, pas un constat d'audit officiel.

## Ce que nous avons construit : la politique comme code

La pièce maîtresse de l'implémentation est constituée de **plus de 20 ClusterPolicies Kyverno** qui transforment les exigences de conformité en contrôles d'admission exécutoires. Chaque workload déployé sur le cluster est validé contre ces politiques — avant d'atteindre l'exécution.

### Sécurité des pods (8 politiques)

| Politique | Ce qu'elle applique | Module BSI |
|-----------|---------------------|------------|
| `zki-require-non-root` | Pas de conteneurs root | INF.1 |
| `zki-require-readonly-rootfs` | Systèmes de fichiers root immuables | INF.1 |
| `zki-drop-all-capabilities` | Suppression de TOUTES les capabilities Linux | INF.1 |
| `zki-require-seccomp` | Profils seccomp requis | INF.1 |
| `zki-prevent-privilege-escalation` | Pas d'escalade de privilèges | INF.1 |
| `zki-restrict-capabilities` | Pas de ré-ajout de capabilities | INF.1 |
| `zki-require-pod-security-context` | Contexte de sécurité pod obligatoire | INF.1 |
| `zki-require-sidecar-logging` | Sidecars de journalisation imposés | INF.1 |

### Sécurité réseau (4 politiques)

| Politique | Ce qu'elle applique | Module BSI |
|-----------|---------------------|------------|
| `zki-require-network-policy` | NetworkPolicy pour chaque namespace | INF.5 |
| `zki-default-deny-all` | Déni par défaut pour tout le trafic | INF.5 |
| `zki-restrict-ingress-to-haproxy` | Ingress uniquement via HAProxy | INF.5 |
| `zki-require-tls-for-ingress` | TLS requis sur tous les ingresses | INF.5 |

### Contrôle d'accès (3 politiques)

| Politique | Ce qu'elle applique | Module BSI |
|-----------|---------------------|------------|
| `zki-restrict-host-path` | Pas de volumes hostPath | INF.1 |
| `zki-restrict-host-network` | Pas d'utilisation de hostNetwork | INF.1 |
| `zki-require-loki-labels` | Labels de journalisation obligatoires | INF.1 |

### Protection des données (3 politiques)

| Politique | Ce qu'elle applique | Module BSI |
|-----------|---------------------|------------|
| `zki-require-storage-encryption` | Stockage chiffré uniquement | DS |
| `zki-require-data-classification` | Labels de classification des données | DS |
| `zki-k8up-backup-annotation` | Annotations de sauvegarde requises | DS |

### Sécurité applicative (2 politiques)

| Politique | Ce qu'elle applique | Module BSI |
|-----------|---------------------|------------|
| `zki-require-security-headers` | En-têtes de sécurité (CSP, HSTS, X-Frame-Options) | INF.14 |
| `zki-require-probe-timeouts` | Configuration correcte des sondes | INF.14 |

Toutes les politiques fonctionnent d'abord en **mode audit**, sont validées contre des workloads réels en CI, puis promues en application. Les violations sont signalées via PolicyReports et remontées dans la pile de surveillance.

## Gouvernance : les documents qui rendent la conformité réelle

Les politiques sans gouvernance sont de la décoration. Nous avons écrit la couche de gouvernance en conséquence :

### Politique de sécurité informatique (14 chapitres)

La politique couvre l'objet et le champ d'application, les principes de sécurité, l'organisation, le contrôle d'accès, la sécurité réseau, la sécurité système, la protection des données, la sécurité applicative, la gestion des incidents, la continuité d'activité, la conformité, la sensibilisation, les exceptions et la maintenance — alignée sur les modules BSI IT-Grundschutz et ISO/IEC 27001:2022.

### Plan de réponse aux incidents (norme BSI 200-3)

Une matrice de classification à quatre niveaux (niveaux 0-3), un processus de réponse en six phases, les procédures de notification RGPD et dix modèles de communication. Aligné sur BSI 200-3, NIST SP 800-61 et ISO/IEC 27035.

### GitOps comme gestion du changement

La gestion du changement d'openDesk Edu *est* sa pipeline GitOps :

- **ArgoCD** pour des déploiements déclaratifs et auditable
- **Discipline de revue** — les modifications de code et de charts ne se mélangent jamais
- **Épinglage des versions** — images épinglées par digest
- **SOPS** pour les secrets dans Git avec chiffrement age/OpenPGP
- **Conformité REUSE** avec en-têtes SPDX sur chaque fichier

Chaque changement est un commit ; chaque commit est une piste d'audit.

## Le travail P0 restant : ce qui doit se passer avant la production

Nous sommes transparents sur ce qui reste à faire. Cinq éléments critiques (P0) séparent l'état actuel de l'application complète en production :

1. **Approbations légales et d'autorité** — DPO, service juridique et direction de l'université doivent approuver le cadre de politique de sécurité (le seul véritable blocage).
2. **Authentification du webhook Kyverno** — TLS et certificats clients pour le webhook d'admission, afin que les politiques ne puissent pas être contournées.
3. **Sauvegarde des politiques Kyverno** — sauvegarde automatisée et restaurable de toutes les politiques (la preuve de conformité l'exige).
4. **Processus de gestion du changement des politiques** — workflow documenté de demande, revue et approbation.
5. **Procédure de désactivation d'urgence des politiques** — procédures d'urgence contrôlées, journalisées et réversibles.

## Feuille de route vers 90 %+

Notre feuille de route est concrète — quatre phases sur environ seize semaines :

| Phase | Focus | Objectif |
|-------|-------|----------|
| **Préparation** | Terminer toutes les actions P0 | Prêt pour la production |
| **Phase 1** | Fondation : ISMS, gestion des risques | 60 % de conformité |
| **Phase 2** | Exploitation : journalisation, réponse aux incidents, gestion des correctifs | 75 % de conformité |
| **Phase 3** | Avancé : mTLS, SIEM, gestion des vulnérabilités | 85 % de conformité |
| **Phase 4** | Maturité : IDS/IPS, WAF, programme de sensibilisation | **90 %+ de conformité** |

## Et avec Microsoft 365 ? Jusqu'où pourrait-on aller ?

Une question que nous entendons constamment lors des évaluations par les universités : *« Ne pourrions-nous pas atteindre le même niveau de conformité avec Microsoft 365 ? »* La réponse honnête mérite sa propre section — car elle est en grande partie *oui*, et l'écart est instructif.

### Ce que M365 couvre bien

Microsoft 365, combiné à la pile de conformité complète (Entra ID P2, Purview, Defender, Compliance Manager), peut selon notre estimation satisfaire **~60–70 % des 111 points de contrôle directement** (estimation interne, pas un audit officiel) :

- **IAM & accès** — potentiellement plus solide qu'une configuration Keycloak maison : MFA, accès conditionnel, gestion des identités privilégiées, RBAC fine.
- **Protection des données** — étiquettes de confidentialité Purview, DLP sur Exchange/SharePoint/Teams/endpoints, conservation et blocage légal, clés gérées par le client, Customer Lockbox.
- **Durcissement des appareils** — politiques de conformité Intune, BitLocker, anneaux de correctifs couvrent le côté client.
- **Sécurité physique** — couverte par les centres de données Microsoft et leurs attestations BSI C5 Type 2 et ISO 27001.

### Ce que M365 ne peut pas couvrir

Encore **~15–20 %** ne sont atteignables que par *attestation du fournisseur* plutôt que par une application directe — le pont accepté sous le module cloud IT-Grundschutz OPS.3.1. Et un **résidu structurel de ~10–15 %** subsiste qu'aucune configuration de locataire ne peut combler :

| Domaine | Pourquoi M365 seul ne suffit pas |
|---------|----------------------------------|
| Sécurité réseau (INF.5) | Vous n'avez pas de réseau à segmenter — les contrôles au niveau du locataire (accès conditionnel, partage externe) ne remplacent pas votre propre segmentation et vos pare-feux. |
| Durcissement système (INF.1) | Pas de pods, pas de seccomp, pas de suppression de capabilities — les points de durcissement des workloads sont simplement sans objet. |
| Auditabilité complète | Le journal d'audit unifié est limité (90 jours par défaut), comporte des lacunes et vit dans le cloud Microsoft plutôt que dans votre propre Loki/SIEM. |
| Souveraineté | La limite de données européenne (EU Data Boundary) fixe la *résidence*, pas la *juridiction* — les autorités américaines peuvent toujours contraindre l'accès (CLOUD Act). Le BSI a publié en 2023 un [avis sur l'utilisation de Microsoft 365 dans l'administration publique](https://www.bsi.bund.de/SharedDocs/CyberSicherheitswarnungen/TechnischeWarnungen/2023/Hinweis_Microsoft_365_public_cloud.html) soulignant ces risques. |
| Services auto-hébergés | ILIAS, Moodle, JupyterHub, Nextcloud, Matrix n'ont pas d'équivalent M365 — ils tournent sur votre propre infrastructure et nécessitent exactement le traitement Kyverno/GitOps/k8up décrit ici. |
| Sauvegarde | La conservation native n'est pas une sauvegarde — vous avez besoin d'un outil tiers (Veeam, AvePoint, …). |

### Le cadre honnête

Une **voie hybride** est ce que les universités allemandes font réellement : M365 A3/A5 pour la collaboration, des services open-source souverains pour les workloads sensibles, une sauvegarde tierce, Sentinel comme SIEM et votre propre documentation de gouvernance. Cela atteint selon notre estimation la bande des ~85–90 % — mais ce n'est plus une histoire purement M365, et les derniers ~10 % sont de la politique, pas de la technologie.

La réponse à « Jusqu'où avec M365 ? » est donc : *~70 % des contrôles via la pile de conformité Microsoft, ~20 % via l'attestation BSI C5, ~10 % de résidu structurel qui exige des décisions de souveraineté — et c'est précisément ce résidu qui explique l'existence d'openDesk.* (Tous les pourcentages sont des estimations internes, pas des valeurs d'audit certifiées.)

## Pourquoi c'est important pour les universités

Pour une université évaluant openDesk Edu, l'histoire de la conformité compte de quatre manières concrètes :

1. **C'est vérifiable.** L'analyse d'écart, les politiques et la feuille de route sont publiques. Vous n'avez pas à faire confiance à une affirmation marketing — vous pouvez inspecter le code des politiques.
2. **C'est votre baseline, pas celle d'un fournisseur.** ZKI IT-Grundschutz est le cadre sous lequel *votre* centre informatique travaille. L'alignement signifie qu'openDesk Edu parle le même langage de sécurité que votre institution.
3. **C'est continu.** La conformité est appliquée dans la pipeline, pas affirmée dans un document. Quand la plateforme change, les politiques appliquent la baseline automatiquement.
4. **C'est reproductible.** Avec Nix et container.gov.de, tous les builds sont déterministes et vérifiables — un avantage décisif par rapport aux builds Dockerfile manuels.

## Contribuer

Le travail de conformité ZKI est open-source comme tout chez openDesk Edu. Si votre institution a de l'expérience avec BSI IT-Grundschutz, les groupes de travail ZKI ou ISIS12 — ou si vous voulez aider à combler les lacunes P0 restantes — nous apprécierions votre revue.

**Explorez le dépôt, examinez les politiques et aidez-nous à atteindre 90 %+.**

[Visitez opendesk-edu.org pour la documentation d'architecture et les guides de déploiement](https://opendesk-edu.org)

---

## Notes et sources

- **Pas un audit officiel :** Les pourcentages mentionnés dans cet article (37 %, 81 %, 60–70 %, 85–90 %) sont des auto-évaluations internes de l'équipe openDesk Edu, pas des constats d'audit certifiés et pas une évaluation officielle du BSI ou du ZKI.
- **Aucune recommandation du ZKI ou du BSI :** L'utilisation de « ZKI » dans les noms de politiques (par ex. `zki-require-non-root`) est une référence au profil ZKI IT-Grundschutz, pas une certification ou une recommandation officielle du ZKI ou du BSI. openDesk Edu n'est pas certifié par le ZKI ou le BSI.
- **Avis sur les marques :** Toutes les marques et désignations de produits et services mentionnées dans cet article (Microsoft 365, Entra ID, Purview, Defender, Compliance Manager, Sentinel, Veeam, AvePoint, Keycloak, ArgoCD, Shibboleth, DFN-AAI, Loki, Prometheus, Grafana, BitLocker, Intune, ILIAS, Moodle, JupyterHub, Nextcloud, Matrix) sont des marques ou des marques déposées de leurs propriétaires respectifs. Elles sont mentionnées à titre informatif et de description technique uniquement.
- **Sources :** [Avis du BSI sur Microsoft 365 (2023)](https://www.bsi.bund.de/SharedDocs/CyberSicherheitswarnungen/TechnischeWarnungen/2023/Hinweis_Microsoft_365_public_cloud.html) · [BSI IT-Grundschutz](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/IT-Grundschutz_node.html) · [Attestation BSI C5](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Cloud-Computing/C5/c5_node.html) · [CLOUD Act](https://www.congress.gov/bill/115th-congress/house-bill/4943)
- **Avertissement comparatif :** La comparaison avec Microsoft 365 est fournie à titre informatif uniquement et n'a pas pour but de dénigrer Microsoft ou ses produits. Les propriétés attribuées à Microsoft 365 sont basées sur sa documentation publique.
