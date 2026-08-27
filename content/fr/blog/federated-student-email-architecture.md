---
title: "Une architecture fédérale pour la messagerie souveraine des étudiants dans l'enseignement supérieur allemand"
date: "2026-08-26"
description: "Une analyse conservatrice d'une plateforme de messagerie et collaboration open source fédérée pour 2,8 millions d'étudiants, modélisée sur la structure fédérale de l'enseignement allemand avec une instance par Land."
categories: ["architecture", "souveraineté-numérique", "éducation"]
tags: ["fédération", "e-mail", "souveraineté-numérique", "enseignement-supérieur", "stalwart-mail", "kubernetes", "allemagne", "analyse-des-coûts"]
author: "Tobias Weiß et openDesk Edu Contributors"
image: "/static/blog/federated-student-email-architecture-teaser.svg"
---

# Une architecture fédérale pour la messagerie souveraine des étudiants dans l'enseignement supérieur allemand

Environ 2,8 millions d'étudiants sont inscrits dans les établissements d'enseignement supérieur allemands. Chacun a besoin d'une adresse électronique. La plupart des établissements en fournissent une, mais le modèle dominant — serveurs mail individuels dans chacun des 400 établissements environ, ou externalisation vers des prestataires cloud commerciaux — produit de la fragmentation, une duplication des coûts opérationnels, et des flux de données qui laissent les communications étudiantes hors de la juridiction allemande.

Cet article examine si une architecture fédérée et open source pourrait répondre à ces problèmes *dans le cadre du système éducatif fédéral allemand*. Il ne plaide pas pour une plateforme centralisée unique. Il propose un modèle qui reflète la structure fédérale : une instance par Land, l'autonomie institutionnelle préservée, et une fédération via des protocoles standards. L'analyse est volontairement conservatrice — les coûts sont donnés sous forme de fourchettes avec des hypothèses explicitées, et non comme des affirmations précises.

## Le contexte fédéral

Toute proposition d'infrastructure à l'échelle nationale dans l'enseignement supérieur allemand doit composer avec une réalité structurelle : la politique éducative est une compétence des Länder (*Kulturhoheit der Länder*). Les 16 Länder détiennent la souveraineté sur leurs systèmes éducatifs, y compris l'enseignement supérieur. Le gouvernement fédéral (*Bund*) ne peut imposer la participation, et un tel mandat ne serait pas souhaitable — il contredirait la répartition constitutionnelle des compétences (articles 30 et 70 de la Loi fondamentale).

Ce n'est pas une simple technicalité juridique. Cela façonne chaque aspect de la proposition :

- **Gouvernance :** Aucune autorité fédérale ne peut imposer une plateforme de messagerie unifiée. La participation doit être volontaire, organisée au niveau des Länder et coordonnée via les structures fédérales existantes.
- **Protection des données :** Chaque Land dispose de sa propre autorité de protection des données (*Landesdatenschutzbeauftragter*). Une solution centralisée opérant sur les 16 Länder devrait satisfaire jusqu'à 16 autorités de contrôle distinctes, plus le commissaire fédéral. Un modèle fédéral — une instance par Land — maintient les données dans la juridiction de chaque Land et sous son autorité de protection.
- **Marchés publics :** Les marchés publics en Allemagne sont régis par les directives EU et le droit national (VgV, UVgO). Une instance acquise au niveau de chaque Land suit des règles de passation déjà familières aux autorités locales.
- **Autonomie universitaire :** L'article 5(3) de la Loi fondamentale garantit l'autonomie de la recherche et de l'enseignement. Les universités ne sont pas de simples unités administratives de leur Land ; elles disposent d'une autonomie institutionnelle. Le modèle doit permettre à chaque établissement de s'auto-héberger ou d'opérer comme locataire au sein d'une instance de Land, selon son choix.

Le DFN (*Deutsches Forschungsnetz*) exploite déjà le réseau national de recherche et d'éducation et l'infrastructure d'identité fédérée DFN-AAI. C'est un candidat naturel pour la couche de coordination — non comme opérateur central, mais comme dorsale neutre fournissant des services partagés (connectivité réseau, fédération d'identité, sécurité partagée) sur lesquels toutes les instances de Land peuvent s'appuyer.

## Échelle et dépenses actuelles

Des chiffres concrets aident à fonder la discussion, mais ils doivent être traités comme des estimations comportant une incertitude significative.

| Indicateur | Estimation | Incertitude |
|---|---|---|
| Établissements d'enseignement supérieur | ~400 | Universités, Fachhochschulen et autres |
| Étudiants | ~2,8 millions | Fluctue selon le semestre |
| Stockage mail (courriel seul, 1 Go/étudiant) | ~2,8 Po utiles | Après archivage et nettoyage |
| Messages entrants (pré-filtre, 100/boîte/jour) | ~280 millions/jour | 2,8 M × 100 ; 60 % rejetés en périphérie |
| Dépenses agrégées actuelles | 40–80 M€/an | Réparties sur ~400 budgets ; difficile à vérifier |

Le volume de messages mérite clarification : 2,8 millions de boîtes recevant un estimé de 100 messages par jour (légitimes et spam, pré-filtre) donnent environ 280 millions de messages par jour, et non 100 millions. Environ 60 % peuvent être rejetés en périphérie du réseau (HELO invalide, DNSBL, échec SPF) avant tout scan de contenu, laissant environ 110 millions de messages pour un traitement ultérieur.

Les dépenses actuelles sont le chiffre le plus difficile à vérifier, car réparties sur des centaines de budgets institutionnels aux pratiques comptables variées. La fourchette de 40 à 80 millions d'euros par an couvre les licences, le personnel et le matériel pour la messagerie et la collaboration de base. Elle est indicative, non autoritaire.

## Un modèle fédéral à trois niveaux

L'architecture proposée comporte trois niveaux, chacun correspondant à une unité structurelle existante du système éducatif allemand.

### Niveau 1 — Services partagés DFN (dorsale neutre)

Le DFN exploite le réseau national de recherche et la fédération d'identité DFN-AAI. Dans ce modèle, le DFN fournit des services partagés bénéficiant à toutes les instances de Land sans exploiter d'instance lui-même :

- **Connectivité réseau** (déjà en place)
- **Fédération d'identité** via DFN-AAI et attributs eduPerson (déjà en place)
- **Services de sécurité partagés** : réputation DNSBL, distribution de politiques MTA-STS, surveillance DKIM/DMARC, partage de threat intelligence entre toutes les instances de Land
- **Coordination** : normes techniques, tests d'interopérabilité et forum pour les organisations IT des Länder

Le DFN ne stocke pas de boîtes mail étudiantes. Il fournit le tissu conjonctif. Cela respecte son rôle existant et évite de créer une nouvelle autorité centrale.

### Niveau 2 — Instances de Land (une par Bundesland)

Chaque Land exploite sa propre instance, desservant les étudiants inscrits dans les établissements de ce Land. Les petits Länder (Brême, Sarre) peuvent mutualiser leurs ressources ou partager une instance avec un Land voisin, réduisant le nombre effectif à environ 10–13 instances opérationnelles.

Une instance de Land fournit :

- **Messagerie** (SMTP, IMAP, POP3, JMAP) avec filtrage anti-spam et antivirus
- **Stockage de fichiers** (Nextcloud)
- **Calendrier et contacts** (CalDAV, CardDAV)
- **Messagerie instantanée** (Matrix, fédéré)
- **Édition collaborative de documents**
- **Authentification unique** intégrée au fournisseur d'identité du Land, fédérée via DFN-AAI

Chaque instance de Land est exploitée par l'organisation IT du Land (ou un prestataire désigné) sous l'autorité de protection des données du Land. L'instance est dimensionnée pour la population étudiante de ce Land, non pour le total national.

### Niveau 3 — Autonomie institutionnelle (locataires ou auto-hébergement)

Au sein d'une instance de Land, chaque université opère comme locataire — avec son propre domaine, sa gestion d'utilisateurs et ses politiques administratives. Les établissements qui préfèrent un contrôle opérationnel complet peuvent déployer la même pile open source sur leur propre matériel et se fédérer avec l'instance de Land et avec d'autres établissements.

C'est le choix de conception déterminant pour préserver l'autonomie universitaire : aucun établissement n'est contraint d'utiliser l'instance de Land, et ceux qui participent conservent le contrôle administratif de leur propre domaine, de leurs utilisateurs et de leurs politiques.

### Fédération

Les trois niveaux sont reliés par des protocoles standards, non par une autorité centrale :

- **SMTP** : Le courriel est nativement fédéré — un étudiant d'une instance de Land peut écrire à un membre du personnel d'un établissement auto-hébergé sans qu'aucun des deux ne quitte son environnement.
- **Matrix** : Messagerie fédérée entre instances et déploiements auto-hébergés.
- **CalDAV/CardDAV** : Partage de calendriers et de contacts entre établissements.
- **Fédération Nextcloud** : Partage de fichiers entre instances de Land et instances auto-hébergées.
- **DFN-AAI** : Fédération d'identité — les étudiants s'authentifient avec leurs identifiants institutionnels, validés via le fournisseur d'identité de leur établissement.

La fédération est le mécanisme qui remplace la centralisation. Aucun opérateur unique ne détient toutes les données étudiantes. Chaque Land contrôle sa propre instance. Chaque établissement contrôle son propre domaine. L'interopérabilité est assurée par des standards ouverts, non par une autorité centrale.

## Estimation des coûts

Les estimations suivantes sont volontairement conservatrices, avec des fourchettes reflétant l'incertitude sur les prix matériels, les modèles de personnel et l'allocation de stockage. Elles couvrent le modèle fédéral (instances de Land + services partagés DFN), non un déploiement centralisé unique.

### Instance de Land (TCO sur 3 ans)

| Composant | Borne inférieure | Borne supérieure |
|---|---|---|
| Matériel (messagerie, collaboration, stockage, plan de contrôle) | 80 000 € | 150 000 € |
| Colocation et connectivité | 45 000 € | 90 000 € |
| Exploitation (0,5–1 ETP, partagé avec l'IT du Land existant) | 120 000 € | 225 000 € |
| **Par instance (3 ans)** | **245 000 €** | **465 000 €** |

### Services partagés (niveau DFN, TCO sur 3 ans)

| Composant | Borne inférieure | Borne supérieure |
|---|---|---|
| Infrastructure de sécurité (DNSBL partagé, MTA-STS, supervision) | 100 000 € | 200 000 € |
| Coordination et développement (3–5 ETP) | 675 000 € | 1 125 000 € |
| **Partagé (3 ans)** | **775 000 €** | **1 325 000 €** |

### Agrégat (13 instances + partagé, TCO sur 3 ans)

| Scénario | Total (3 ans) | Par étudiant/mois |
|---|---|---|
| Borne inférieure (13 × 245 000 € + 775 000 €) | ~4,0 M€ | ~0,04 € |
| Estimation centrale (13 × 355 000 € + 1 050 000 €) | ~5,7 M€ | ~0,06 € |
| Borne supérieure (13 × 465 000 € + 1 325 000 €) | ~7,4 M€ | ~0,07 € |

Ces chiffres supposent un déploiement axé sur la messagerie (1 Go/étudiant). Inclure le stockage de collaboration (fichiers, versioning, sauvegardes) à 10–20 Go/étudiant augmenterait considérablement les coûts de stockage — potentiellement un doublement de la borne inférieure. Les coûts de migration, de formation et d'intégration institutionnelle ne sont pas inclus et s'ajouteraient à la phase de déploiement initiale.

À titre de comparaison, les dépenses agrégées actuelles sont estimées à 40–80 millions d'euros par an (120–240 millions d'euros sur trois ans). Le modèle fédéral représente une réduction significative des coûts d'infrastructure agrégés, bien que la comparaison directe soit imparfaite : les dépenses actuelles incluent des frais généraux institutionnels (personnel IT local, achats individuels, licences par établissement) qui ne seraient pas entièrement éliminés mais substantiellement réduits par la consolidation.

Le coût par étudiant est d'environ 0,04–0,07 € par mois pour un déploiement axé sur la messagerie — soit environ deux ordres de grandeur en dessous des licences cloud commerciales typiques. Cela reflète la nature de commodité du courriel à grande échelle : le coût marginal de stockage et de livraison est très faible. Le coût dominant n'est pas l'infrastructure mais la coordination — c'est précisément ce que le modèle fédéral est conçu pour adresser.

## Fondations techniques

Les composants individuels sont en production aujourd'hui :

- **Stalwart Mail** (AGPL-3.0) : un serveur mail en Rust offrant IMAP, POP3, SMTP et JMAP avec recherche plein texte native. La licence AGPL-3.0 garantit que les modifications restent ouvertes ; une licence commerciale est disponible pour les organisations qui ne peuvent pas se conformer aux termes AGPL.
- **Nextcloud** (AGPL-3.0) : stockage, partage et collaboration de fichiers.
- **Matrix/Element** (AGPL-3.0) : messagerie fédérée.
- **Keycloak** (Apache-2.0) : gestion d'identité et d'accès, SAML/OIDC.
- Des composants supplémentaires pour le calendrier, les contacts et la visioconférence, déployés via des conteneurs natifs (Kubernetes, Helm) et la gestion de configuration (Ansible).

Les licences open source sont mixtes (AGPL-3.0, Apache-2.0, MPL-2.0). Les composants AGPL-3.0 (Stalwart, Nextcloud, Matrix) exigent que les modifications distribuées aux utilisateurs via le réseau soient publiées sous la même licence — un copyleft plus fort qu'Apache-2.0, et qui renforce plutôt qu'il ne mine la souveraineté : les établissements qui modifient le logiciel sont tenus de partager leurs modifications, empêchant les forks privés de saper les communs.

Le défi technique à grande échelle est l'orchestration opérationnelle — provisionner des boîtes mail à travers plusieurs instances de Land, traiter ~280 millions de messages entrants par jour et maintenir des temps de réponse IMAP réactifs. Ce sont des problèmes de mise à l'échelle avec des solutions connues ; l'écosystème open source les a résolus à des échelles comparables dans d'autres secteurs.

## Gouvernance

Un modèle fédéral nécessite une gouvernance fédérale. La structure proposée :

- **Chaque Land** exploite sa propre instance sous sa propre autorité de protection des données (*Landesdatenschutzbeauftragter*). Aucune autorité centrale ne détient les données étudiantes.
- **Le DFN** fournit des services partagés et coordonne les normes techniques, dans son rôle existant d'organisation neutre de réseau de recherche.
- **Un organe de coordination** (conseil consultatif technique, composé d'organisations IT des Länder et du DFN) fixe les normes d'interopérabilité et gère les services de sécurité partagés. Il n'exploite pas d'instances.
- **Financement** combinant des budgets de Land (proportionnels aux effectifs étudiants), des contributions institutionnelles volontaires pour des services étendus, et — si disponible — un financement fédéral de démarrage via un mécanisme de type *Digitalpakt* selon l'article 104b de la Loi fondamentale (le Bund finance, les Länder exécutent). Le Digitalpakt existant concerne les écoles ; un instrument comparable pour l'enseignement supérieur devrait être créé ou une ligne de financement existante réaffectée.

La participation est volontaire à tous les niveaux. Aucun Land n'est contraint de rejoindre. Aucun établissement n'est contraint d'utiliser l'instance de son Land. L'export des données via des protocoles standards (IMAP, CalDAV) est toujours disponible. Il n'y a pas de verrouillage fournisseur : toute la pile est open source, et la licence AGPL-3.0 garantit que les modifications restent ouvertes.

## Questions ouvertes et limites

Cette analyse est un point de départ, non une proposition finalisée. Plusieurs questions nécessitent des investigations supplémentaires :

1. **Validation des coûts.** Les estimations ci-dessus sont basées sur des benchmarks de production de composants individuels, extrapolés à l'échelle nationale. Un déploiement de preuve de concept — par exemple 5 000 boîtes mail simulées sur 30 jours sur une seule instance de Land — validerait les hypothèses de capacité et identifierait les cas limites opérationnels.

2. **Adoption par les Länder.** Le modèle suppose une participation volontaire des Länder. En pratique, chaque Land a sa propre stratégie IT, ses règles de passation et ses priorités politiques. Un pilote avec trois à cinq Länder de tailles variées testerait le modèle de gouvernance et révélerait les défis de coordination.

3. **Protection des données transfrontalière.** Bien qu'une instance de Land maintienne les données dans son Land, la fédération entre instances signifie que des métadonnées (informations de routage, partages de calendrier) peuvent franchir les frontières des Länder. Une analyse d'impact sur la protection des données (*Datenschutz-Folgenabschätzung* selon l'art. 35 RGPD) devrait évaluer le flux de métadonnées fédéré avant tout pilote.

4. **Migration.** Migrer environ 2,8 millions de boîtes mail depuis des systèmes existants — cloud commercial, serveurs mail institutionnels ou autres prestataires — est un effort opérationnel significatif. Des outils de migration, une communication aux utilisateurs et une période de transition (fonctionnement parallèle) seraient nécessaires.

5. **Petits Länder.** Brême (~20 000 étudiants) et la Sarre (~35 000) peuvent ne pas justifier une instance dédiée. Des arrangements de mutualisation (instance partagée avec un Land voisin, ou instance hébergée par le DFN pour les petits Länder) doivent être définis.

6. **Autonomie universitaire en pratique.** Le modèle permet l'auto-hébergement, mais une université qui s'auto-héberge renonce aux avantages de coût de l'instance de Land. L'équilibre entre autonomie et consolidation est une question politique pour chaque établissement.

## Conclusion

Une plateforme de messagerie et de collaboration souveraine et fédérée pour l'enseignement supérieur allemand est techniquement faisable et économiquement plausible. Le coût par étudiant est une fraction des dépenses agrégées actuelles. La pile open source élimine la dépendance fournisseur. La souveraineté des données est obtenue par conception — chaque Land contrôle sa propre instance sous sa propre juridiction.

Le modèle fédéral n'est pas un compromis imposé par des contraintes constitutionnelles. C'est l'architecture naturelle pour un système construit sur la souveraineté des Länder, l'autonomie universitaire et la coopération volontaire. Une instance par Bundesland, coordonnée via le DFN, préserve la responsabilité politique tout en partageant la charge opérationnelle d'un service de commodité. La fédération via des protocoles standards garantit qu'aucun établissement n'est isolé — un étudiant d'une instance de Land peut collaborer avec un membre du personnel d'une université auto-hébergée aussi naturellement que deux étudiants sur la même plateforme.

Ce qui reste n'est pas une question technique. C'est une question de coordination : aligner la volonté politique de 16 Länder, établir une gouvernance via le DFN et valider le modèle avec un pilote. La technologie est prête. La structure fédérale est prête. L'économie est favorable. La prochaine étape est une conversation.

---

## Pour aller plus loin

1. **Document compagnon.** Une analyse de capacité détaillée et le modèle de gouvernance sont disponibles en tant que document technique compagnon.
2. **Évaluer la pile.** Les composants open source peuvent être déployés depuis des playbooks Ansible sur un nœud unique pour évaluation.
3. **Discuter avec les organisations IT des Länder.** Le modèle est conçu pour une adoption volontaire ; plus les organisations IT des Länder examinent les chiffres, plus la coordination peut commencer rapidement.

---

*La fédération n'est pas la centralisation. C'est la coopération sans renoncement.*
