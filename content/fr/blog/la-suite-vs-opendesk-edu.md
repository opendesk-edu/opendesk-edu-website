---
title: "La Suite vs. openDesk Edu : points communs et différences"
date: "2026-08-02"
description: "La France a La Suite numérique, l'Allemagne a openDesk Edu. Les deux poursuivent la souveraineté numérique par l'open source — mais leurs architectures, publics cibles et modèles de déploiement divergent fortement. Une analyse comparative des deux principales initiatives européennes d'espace de travail souverain."
categories: ["Souveraineté Numérique", "Comparaison", "Collaboration Européenne"]
tags: ["la-suite", "souverainete-numerique", "open-source"]
author: "Tobias Weiß et les contributeurs d'openDesk Edu"
image: "/static/blog/la-suite-vs-opendesk-edu-teaser.svg"
---

# La Suite vs. openDesk Edu : points communs et différences

> **Le contexte :** Deux nations européennes, deux initiatives d'espace de travail numérique souverain — toutes deux construites sur l'open source, toutes deux refusant la dépendance aux GAFAM, toutes deux revendiquant la protection des données du secteur public.
>
> **La question :** La Suite numérique et openDesk Edu convergent-elles vers un modèle européen commun, ou s'agit-il de projets fondamentalement différents qui partagent par hasard une philosophie ?
>
> **La réponse :** Plus de points communs que les deux côtés ne l'admettent — et les différences sont précisément là où la collaboration européenne devrait commencer.

## Deux projets, une conviction

En 2023, le gouvernement français a lancé **La Suite numérique** — un espace de travail numérique souverain pour l'administration publique, piloté par la DINUM (Direction interministérielle du numérique). La promesse : remplacer Google Workspace et Microsoft 365 par un ensemble d'outils open source curatés, hébergés sur une infrastructure souveraine française.

En Allemagne, **openDesk Edu** est né dans un autre contexte — celui de l'enseignement supérieur. Construit sur la plateforme openDesk CE, il intègre une suite complète de services open source pour les universités : non seulement des outils de collaboration, mais aussi des systèmes de gestion de l'apprentissage, du calcul scientifique et de l'infrastructure de recherche.

Les deux projets naissent de la même conviction : **les institutions publiques européennes ne devraient pas dépendre des fournisseurs de cloud américains pour leur infrastructure numérique de base.** Les deux rejettent l'exposition au CLOUD Act, l'enfermement propriétaire et l'escalade des coûts de licence du stack GAFAM. Les deux misent sur l'open source comme voie vers la souveraineté.

Mais comment ils y sont arrivés — et où ils vont — révèle une divergence fascinante.

## Les points communs

### 1. L'open source comme fondation

La Suite et openDesk Edu sont toutes deux construites sur les mêmes briques open source :

| Composant | La Suite | openDesk Edu |
|-----------|----------|--------------|
| Synchronisation et partage de fichiers | Nextcloud (via Wimi) | Nextcloud (OpenCloud) |
| Édition de documents | LibreOffice / Collabora | Collabora Online |
| Visioconférence | Jitsi Meet (via Visio) | BigBlueButton + Jitsi |
| Messagerie | Tchap (basé sur Matrix) | Matrix (Element) |
| Courriel | Calypso (Beta) | Dovecot + Postfix |
| Identité | AgentConnect / ProConnect | Keycloak + DFN-AAI |

Le chevauchement est frappant. Les deux ont choisi Nextcloud pour la gestion de fichiers, les deux ont adopté la messagerie basée sur Matrix, les deux utilisent la visioconférence open source. L'écosystème open source européen est suffisamment restreint pour que les mêmes projets reviennent régulièrement — et c'est une force, pas une faiblesse.

### 2. La souveraineté numérique comme principe moteur

Les deux initiatives existent en raison des mêmes pressions juridiques et politiques :

- **Conformité RGPD** — le droit européen de protection des données rend les services hébergés aux États-Unis juridiquement risqués pour les données du secteur public
- **Exposition au CLOUD Act** — les fournisseurs américains peuvent être contraints de remettre des données aux autorités américaines, même stockées en Europe
- **Arrêt Schrems II** — a invalidé le Privacy Shield, rendant les transferts de données transatlantiques juridiquement incertains
- **Stratégies nationales de souveraineté** — la France et l'Allemagne ont toutes deux publié des stratégies de souveraineté numérique qui imposent une préférence pour les solutions souveraines

Le BSI (Allemagne) et l'ANSSI (France) ont tous deux publié des recommandations critiques à l'égard de Microsoft 365 pour l'administration publique. Le BSI a publié en 2023 une évaluation détaillée questionnant la pertinence de M365 pour le gouvernement ; l'ANSSI a été encore plus explicite, recommandant des alternatives souveraines.

### 3. Soutien institutionnel

Aucun des deux projets n'est une initiative citoyenne. Les deux ont un poids institutionnel :

- **La Suite** est opérée par la DINUM, l'unité de transformation numérique du gouvernement français, avec un financement du budget de l'État français et un mandat couvrant tous les fonctionnaires français (~5,7 millions d'utilisateurs potentiels)
- **openDesk Edu** est opéré par une équipe universitaire allemande, avec le soutien du ministère de la Science et de l'Art de Hesse, et est conçu pour les universités allemandes (~3 millions d'étudiants et personnels)

### 4. L'ennemi commun

Les deux projets se définissent par opposition à la même chose : **la dépendance aux GAFAM.** Le récit est identique des deux côtés du Rhin :

- Les fournisseurs américains offrent des remises agressives pour capturer les comptes du secteur public
- Une fois enfermé, les coûts augmentent et la sortie devient impossible
- La souveraineté des données est compromise par la juridiction américaine
- L'argent public finance des entreprises étrangères au lieu de l'économie locale

## Là où elles divergent

### 1. Modèle de déploiement : SaaS centralisé vs. auto-hébergement fédéré

C'est la différence la plus importante.

**La Suite** est une **plateforme SaaS centralisée.** La DINUM héberge les services sur une infrastructure souveraine française (actuellement sur Bleu, la co-entreprise de cloud souverain entre Thales et OVHcloud, ou sur Outscale). Les fonctionnaires français se connectent à une instance unique gérée par la DINUM. Il n'y a pas de déploiement local — vous utilisez l'instance du gouvernement ou vous n'utilisez pas La Suite.

**openDesk Edu** est une **plateforme d'auto-hébergement fédérée.** Chaque université déploie sa propre instance sur son propre cluster Kubernetes. Le déploiement de référence est exploité par l'équipe du projet, mais chaque institution peut — et est encouragée à — exploiter le sien. Le pipeline GitOps (ArgoCD + Helmfile) rend cela reproductible, mais le déploiement vous appartient.

| Aspect | La Suite | openDesk Edu |
|--------|----------|--------------|
| Hébergement | Centralisé (DINUM) | Fédéré (par institution) |
| Infrastructure | Cloud souverain français | Kubernetes sur site |
| Cycle de mise à jour | Contrôlé par la DINUM | Contrôlé par l'institution |
| Personnalisation | Limitée (multi-tenant) | Complète (par instance) |
| Résidence des données | France (Bleu/Outscale) | Centre de données de chaque institution |

Ce n'est pas un détail architectural mineur. Il reflète des philosophies fondamentalement différentes :

- **La France** fait confiance à l'État pour exploiter un service central pour tous les fonctionnaires. L'État a les ressources, le mandat et la volonté politique d'opérer à l'échelle nationale.
- **L'Allemagne** fait confiance à chaque institution d'exploiter la sienne. La structure fédérale de l'enseignement supérieur allemand — chaque université est autonome — rend un modèle centralisé politiquement impossible. L'équipe du projet peut construire une référence, mais ne peut pas imposer l'adoption.

### 2. Public cible : fonctionnaires vs. milieu académique

**La Suite** cible les **fonctionnaires français** — ministères, agences, gouvernements régionaux, hôpitaux. Les cas d'usage sont administratifs : courriel, édition de documents, réunions vidéo, partage de fichiers, messagerie. Il n'y a pas de concept de « cours » ou de « conférence » ou de « projet de recherche. »

**openDesk Edu** cible l'**enseignement supérieur allemand** — universités, instituts de recherche, services étudiants. La plateforme inclut :

- **ILIAS et Moodle** — systèmes de gestion de l'apprentissage utilisés par des millions d'étudiants
- **JupyterHub** — calcul scientifique et analyse de données
- **BigBlueButton** — conçu pour l'enseignement en ligne
- **XWiki** — gestion collaborative des connaissances pour les groupes de recherche
- **OpenProject** — gestion de projet pour la recherche

Ce ne sont pas des outils de productivité — ce sont des **outils d'éducation et de recherche.** Le périmètre d'openDesk Edu est plus large et plus spécialisé que celui de La Suite. Une université a besoin de LMS, de cahiers de laboratoire et de gestion de données de recherche. Un ministère n'en a pas besoin.

### 3. Identité et fédération

**La Suite** utilise **AgentConnect** (désormais en transition vers **ProConnect**) — la fédération d'identité nationale française pour les fonctionnaires. Elle se connecte aux fournisseurs d'identité des ministères français via SAML/OIDC. La fédération est nationale et centralisée.

**openDesk Edu** utilise **DFN-AAI** — la fédération nationale allemande de recherche et d'éducation — qui se connecte à **eduGAIN**, la fédération inter-globale. Un étudiant de n'importe quelle université allemande (ou de n'importe quelle institution participante à eduGAIN dans le monde) peut s'authentifier à openDesk Edu via le IdP de son établissement d'origine.

La différence de portée est significative : DFN-AAI/eduGAIN donne à openDesk Edu accès à des milliers d'institutions dans le monde. AgentConnect/ProConnect se concentre sur l'administration publique française et ne participe pas à eduGAIN.

### 4. Maturité et périmètre

**La Suite** a lancé ses premiers services en 2023 et est encore en déploiement progressif. En 2026, les services principaux sont :

- **Visio** — visioconférence (basé sur Jitsi, GA)
- **Messagerie** — courriel (Calypso, en bêta)
- **Wimi** — espace de travail collaboratif (basé sur Nextcloud, GA)
- **Tchap** — messagerie (basé sur Matrix, GA)
- **Drive** — partage de fichiers (basé sur Nextcloud, GA)

Le catalogue de services est volontairement restreint — la DINUM privilégie la qualité et l'adoption à l'ampleur.

**openDesk Edu** intègre une suite complète de services et est en production. La plateforme comprend :

- Suite de collaboration complète (Nextcloud, Collabora, Matrix, courriel)
- Outils éducatifs (ILIAS, Moodle, BigBlueButton, XWiki)
- Calcul scientifique (JupyterHub)
- Gestion de projet (OpenProject, Planka, BookStack)
- Infrastructure (Keycloak, Kubernetes, ArgoCD, sauvegardes k8up)
- Sécurité (politiques Kyverno, conformité ZKI IT-Grundschutz)

La différence de périmètre reflète la cible : les universités ont besoin d'un ensemble d'outils plus large que les administrations.

### 5. Gouvernance et communauté

**La Suite** est un **projet gouvernemental descendant.** La DINUM définit la feuille de route, choisit les outils et contrôle le déploiement. Les retours des utilisateurs passent par des canaux formels. Le code est open source, mais la gouvernance est centralisée.

**openDesk Edu** est un **projet piloté par la communauté.** Bien que l'équipe du projet dirige le développement, le projet est ouvert sur GitHub et Codeberg, accepte les contributions et publie sa feuille de route publiquement. L'accord de contributeur, les réunions de la communauté de pratique et l'analyse d'écart transparente (le travail de conformité ZKI) reflètent un modèle de gouvernance différent — celui où les institutions collaborent plutôt que reçoivent un service.

### 6. Cadres de sécurité et de conformité

Les deux projets prennent la sécurité au sérieux, mais s'alignent sur des cadres nationaux différents :

| Cadre | La Suite | openDesk Edu |
|-------|----------|--------------|
| Norme de sécurité nationale | Recommandations ANSSI (France) | BSI IT-Grundschutz / ZKI (Allemagne) |
| Protection des données | RGPD (CNIL française) | DSGVO (BfDI allemand) |
| Certification cloud | SecNumCloud (cloud souverain français) | Pas d'équivalent — auto-hébergement |
| Modèle d'audit | L'ANSSI audite la DINUM | ISMS universitaire + profil ZKI |
| Application des politiques | Contrôles internes DINUM | Kyverno ClusterPolicies (GitOps) |

L'approche d'openDesk Edu en matière de conformité — plus de 20 politiques Kyverno exécutoires, une checklist ZKI/BSI de 111 points, une analyse d'écart publique — est plus transparente que celle de La Suite. La DINUM publie des recommandations de sécurité, mais les mécanismes d'application sont internes. openDesk Edu rend son code de politiques public.

## Ce que la France et l'Allemagne pourraient apprendre l'une de l'autre

### Ce qu'openDesk Edu pourrait apprendre de La Suite

1. **L'évaluation centralisée abaisse la barrière.** L'instance unique de La Suite signifie qu'un ministère français peut essayer la plateforme sans rien déployer. Le modèle d'auto-hébergement d'openDesk Edu nécessite une expertise Kubernetes — une barrière élevée pour les petites institutions. Une instance d'évaluation partagée (comme proposé dans l'article DFN-AAI) y remédierait.

2. **Catalogue de services restreint.** La Suite se concentre sur 5 services principaux et les fait bien. La suite de services complète d'openDesk Edu est une force mais aussi une charge de maintenance. Toutes les universités n'ont pas besoin de tous — un modèle de déploiement par paliers (cœur, étendu, recherche) pourrait aider.

3. **Mandat gouvernemental comme moteur d'adoption.** La Suite bénéficie d'un mandat explicite du gouvernement français pour les outils numériques souverains. openDesk Edu s'appuie sur l'adoption individuelle des universités — plus lent, mais plus durable.

### Ce que La Suite pourrait apprendre d'openDesk Edu

1. **Outils spécifiques à l'éducation.** La Suite n'a pas de LMS, pas de calcul scientifique, pas de gestion de données de recherche. Les universités françaises qui ont besoin de ces outils doivent chercher ailleurs. L'intégration par openDesk Edu d'ILIAS, Moodle et JupyterHub est un modèle à étudier.

2. **Auto-hébergement fédéré pour les données de recherche.** Les données de recherche ne peuvent souvent pas quitter l'institution (contraintes éthiques, juridiques ou techniques). Le modèle centralisé de La Suite rend cela plus difficile. Le déploiement par institution d'openDesk Edu donne à chaque université un contrôle total sur les données de recherche sensibles.

3. **Conformité transparente.** openDesk Edu publie son analyse d'écart ZKI, ses politiques Kyverno et sa feuille de route de conformité. La posture de sécurité de La Suite est moins publiquement documentée. La transparence construit la confiance — surtout dans le monde académique.

4. **Intégration eduGAIN.** L'AgentConnect/ProConnect de La Suite est national. S'il se fédérait avec eduGAIN, les chercheurs français pourraient collaborer de manière transparente avec des partenaires internationaux. L'intégration DFN-AAI/eduGAIN d'openDesk Edu est un modèle éprouvé.

## La vue d'ensemble : une pile numérique souveraine européenne ?

Les différences entre La Suite et openDesk Edu ne sont pas des bugs — elles reflètent des différences authentiques entre les cultures administratives française et allemande. Mais elles représentent aussi une opportunité manquée.

Imaginez une **pile numérique souveraine européenne** où :

- La Suite et openDesk Edu partagent les mêmes composants open source (Nextcloud, Collabora, Matrix, Jitsi/BigBlueButton)
- Un chercheur français visitant une université allemande s'authentifie via eduGAIN — pas de nouveau compte nécessaire
- Les deux plateformes adoptent le même vocabulaire de conformité (en reliant les recommandations ANSSI au BSI IT-Grundschutz)
- Une infrastructure d'évaluation partagée permet aux institutions d'essayer les deux avant de s'engager
- Les programmes de financement de la Commission européenne (Digital Europe Programme, Horizon Europe) soutiennent la collaboration transfrontalière entre les deux initiatives

Ce n'est pas utopique. Les composants sont déjà partagés. Les projets open source (Nextcloud, Matrix, Collabora) sont les mêmes. La volonté politique existe à Paris comme à Berlin. Ce qui manque, c'est le **tissu conjonctif** : une couche d'identité partagée, un cadre de conformité commun et un engagement commun envers l'interopérabilité.

### La connexion GAIA-X

Les deux projets s'alignent avec la vision GAIA-X de souveraineté des données européenne — mais sous des angles différents :

- **La Suite** opère sur Bleu, un cloud souverain compatible GAIA-X
- **openDesk Edu** fonctionne sur Kubernetes sur site, qui pourrait se fédérer avec l'infrastructure GAIA-X

Une fédération GAIA-X qui connecte les services centralisés de La Suite avec les déploiements fédérés d'openDesk Edu pourrait créer un espace de travail numérique véritablement européen — un où la souveraineté n'est pas seulement nationale, mais continentale.

## Un appel à l'action pratique

L'équipe d'openDesk Edu a pris contact informellement avec ses homologues de la DINUM. La réponse a été positive — il y a un véritable intérêt pour la collaboration. Voici ce que nous proposons :

1. **Un atelier conjoint** sur les espaces de travail numériques souverains dans l'administration publique européenne, co-organisé par la DINUM et l'équipe openDesk Edu
2. **Une matrice de composants partagée** — cartographiant les services open source utilisés par chaque plateforme, identifiant les opportunités de développement conjoint
3. **Intégration eduGAIN pour La Suite** — étendre AgentConnect/ProConnect pour participer à la fédération de recherche mondiale
4. **Une évaluation transfrontalière** — laisser une université française piloter openDesk Edu et une agence allemande piloter La Suite, pour apprendre des deux modèles
5. **Un mapping de conformité conjoint** — relier les recommandations ANSSI au BSI IT-Grundschutz, créant une baseline de sécurité européenne pour les espaces de travail numériques souverains

Le moment est propice. Les vents politiques favorisent la souveraineté. La technologie est éprouvée. Les communautés sont disposées. Ce qui manque, c'est l'engagement institutionnel — et quelques personnes courageuses des deux côtés du Rhin prêtes à construire le pont.

## Conclusion

La Suite et openDesk Edu ne sont pas concurrentes. Elles sont des **expressions complémentaires de la même idée européenne** : les institutions publiques méritent une infrastructure numérique qu'elles contrôlent, l'open source est la voie vers la souveraineté, et la collaboration transfrontalière nous rend tous plus forts.

La France a choisi la centralisation ; l'Allemagne a choisi la fédération. La France a choisi un catalogue de services restreint ; l'Allemagne a choisi l'ampleur. La France a choisi un mandat gouvernemental ; l'Allemagne a choisi l'adoption communautaire. Les deux choix sont légitimes — et les deux ont quelque chose à apprendre de l'autre.

La vraie concurrence n'est pas La Suite contre openDesk Edu. C'est la **souveraineté européenne contre la dépendance aux GAFAM.** Et sur ce terrain, nous sommes du même côté.

---

*openDesk Edu est un projet open source. Nous accueillons les contributions de toute l'Europe — pas seulement d'Allemagne. Si vous travaillez sur l'infrastructure numérique souveraine en France, en Belgique, aux Pays-Bas ou ailleurs, nous serions ravis d'avoir de vos nouvelles.*

[Explorez l'architecture et les guides de déploiement d'openDesk Edu](https://opendesk-edu.org)

[En savoir plus sur La Suite numérique (en français)](https://www.numerique.gouv.fr/services/la-suite-numerique/)

[Voir le projet openDesk CE en amont](https://opendesk.eu)

## Avertissement et notice de marque

**Marques :** La Suite numérique est une initiative de la DINUM (Direction interministérielle du numérique), l'unité de transformation numérique du gouvernement français. openDesk et openDesk Edu sont des projets open source. Tous les noms de produits et marques commerciales sont la propriété de leurs propriétaires respectifs. Cet article est une analyse indépendante et n'est ni affilié à, ni approuvé par, ni sponsorisé par la DINUM ou le gouvernement français.

**Avis sur la publicité comparative :** Cet article compare La Suite numérique et openDesk Edu. La comparaison est basée sur des informations publiquement disponibles et l'évaluation des auteurs. Les deux initiatives ont des forces et des faiblesses, et le meilleur choix dépend des circonstances institutionnelles.

**Opinion et évaluation :** Cet article reflète l'opinion et l'évaluation de l'équipe openDesk Edu. Il ne constitue pas un conseil juridique, technique ou d'achat.
