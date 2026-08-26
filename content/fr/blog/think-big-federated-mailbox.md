---
title: "Penser grand : une boîte mail fédérée et souveraine pour chaque étudiant en Allemagne"
date: "2026-08-26"
description: "2,8 millions d'étudiants allemands dépendent d'une infrastructure mail fragmentée. Une approche open source fédérée pourrait la consolider en une plateforme souveraine -- à environ cinq euros par étudiant et par mois."
categories: ["Opinion", "Souveraineté numérique", "Éducation"]
tags: ["fédération", "e-mail", "souveraineté-numérique", "enseignement-supérieur", "stalwart-mail", "kubernetes", "allemagne", "analyse-des-coûts"]
author: "Tobias Weiß et openDesk Edu Contributors"
image: "/static/blog/think-big-federated-mailbox-teaser.svg"
---

# Penser grand : une boîte mail fédérée et souveraine pour chaque étudiant en Allemagne

Environ 2,8 millions d'étudiants sont inscrits dans les établissements d'enseignement supérieur allemands. Chacun d'entre eux a besoin d'une adresse électronique. Chaque établissement en fournit une -- ou sous-traite la tâche à un prestataire commercial. Le résultat est un paysage d'environ 400 déploiements mail séparés, dont beaucoup stockent les données étudiantes hors de la juridiction allemande.

Cela n'a pas besoin d'être le cas. La technologie pour faire fonctionner une plateforme de messagerie et de collaboration souveraine et fédérée à l'échelle nationale existe aujourd'hui. L'économie est viable. Le fondement juridique est en place. Ce qui manque, c'est la décision de le faire.

## Le problème n'est pas technique

Le paysage IT de l'enseignement supérieur allemand se caractérise par la duplication. Chaque université fait fonctionner son propre serveur mail -- ou paie un fournisseur de cloud commercial pour le faire. La charge administrative est considérable : chaque établissement emploie du personnel pour gérer l'identité, le stockage, le filtrage anti-spam, la conformité et les sauvegardes pour ce qui est, au fond, le même service fourni des milliers de fois.

Le coût n'est pas seulement financier. Les données étudiantes -- courriels, entrées de calendrier, fichiers -- transitent par des plateformes commerciales dont les centres de données se trouvent aux États-Unis, en Irlande ou aux Pays-Bas. Le CLOUD Act permet aux autorités américaines d'accéder aux données gérées par des prestataires américains, quel que soit le lieu des serveurs physiques. La Cour de justice européenne a signalé à plusieurs reprises que les clauses contractuelles types seules pourraient ne pas suffire à protéger contre cela.

Pour un système de recherche qui s'enorgueillit de la protection des données et de l'indépendance scientifique, c'est une contradiction structurelle.

## Les chiffres : quelle est la véritable ampleur ?

Des chiffres concrets aident à faire passer la discussion d'une rhétorique abstraite sur la souveraineté à une planification actionnable.

**Échelle.** L'Allemagne compte environ 400 établissements d'enseignement supérieur (universités, Fachhochschulen, fournisseurs duales) desservant environ 2,8 millions d'étudiants. La boîte mail moyenne d'un étudiant occupe environ 1 Go après archivage et nettoyage. Cela représente environ 2,8 Po de stockage mail.

**Trafic.** Un compte étudiant typique reçoit environ 10 courriels légitimes par jour. Avec le spam et les messages automatisés, le volume avant filtrage atteint environ 100 messages par boîte et par jour -- soit environ 100 millions de messages par jour pour l'ensemble de la population étudiante. Environ 60 % de ces messages peuvent être rejetés en périphérie du réseau (HELO invalide, DNSBL, échec SPF) avant tout scan de contenu.

**Dépenses actuelles.** Les budgets IT publiés suggèrent que les universités allemandes dépensent collectivement environ 40 à 80 millions d'euros par an pour l'infrastructure de messagerie et de collaboration, y compris les licences, le personnel et le matériel. Ce chiffre est réparti sur des centaines de budgets individuels et est difficile à vérifier précisément, mais même la borne inférieure représente une dépense considérable.

## Un modèle fédéré à deux piliers

La proposition est simple : un service central pour les étudiants, complété par une option en local pour le personnel.

**Pilier 1 -- le service central étudiant.** Un cluster Kubernetes unique (ou une paire pour la redondance géographique), hébergé sur le backbone du DFN, fournit messagerie, stockage de fichiers, calendrier, messagerie instantanée et suite bureautique à tous les étudiants participants. L'authentification s'intègre au DFN-AAI via les attributs eduPerson. Les étudiants se connectent avec leurs identifiants institutionnels ; leur boîte mail réside sur une infrastructure souveraine.

**Pilier 2 -- en local pour le personnel.** Les établissements qui préfèrent conserver les données de leur personnel sur leur propre matériel peuvent déployer la même pile open source localement. Les deux piliers se fédèrent : Matrix pour la messagerie, CalDAV et CardDAV pour le calendrier et les contacts, Nextcloud pour le partage de fichiers. Un étudiant d'un établissement peut envoyer un message à un membre du personnel d'un autre sans qu'aucun des deux ne quitte son environnement.

Ce modèle à deux piliers respecte la structure fédérale de la politique éducative allemande. Le service central est une offre volontaire ; aucun établissement n'est contraint d'y participer. Mais l'avantage économique s'accentue avec chaque participant.

## Quel est le coût ?

Une estimation de capacité pour le service central, basée sur les benchmarks de production de Stalwart Mail (un serveur mail écrit en Rust, nettement plus économe en ressources que les configurations Postfix/Dovecot traditionnelles), donne les besoins matériels approximatifs suivants :

| Composant | Quantité | Rôle |
|---|---|---|
| Nœuds de stockage | 14--16 | Stockage Ceph en erasure coding (env. 7,5 Po brut) |
| Workers mail | 5--6 | Réception SMTP, service IMAP, scan spam/antivirus |
| Plan de contrôle + répartiteurs de charge | 12 | Gestion K8s et distribution du trafic |
| Surveillance | 3--4 | Pile d'observabilité |

Sur une période de trois ans, le coût total de possession estimé -- matériel, colocation et environ six équivalents temps plein pour l'exploitation et le développement -- s'élève à environ 1,8 million d'euros. Réparti sur 2,8 millions d'étudiants sur 36 mois, cela représente environ cinq euros par étudiant et par mois.

Il s'agit d'une estimation. Les coûts réels dépendront du matériel choisi, des tarifs de colocation et du modèle de personnel. Mais même si le chiffre réel était 50 % plus élevé, le coût par étudiant resterait bien inférieur à ce que la plupart des établissements dépensent actuellement pour des solutions fragmentées et moins évolutives.

Pour les établissements qui choisissent le pilier en local, une petite université d'environ 500 employés peut faire fonctionner la pile complète sur un seul serveur à partir d'environ 3 000 euros de coûts matériels, en plus du personnel IT existant.

## Les fondations techniques sont prêtes

Les composants individuels ne sont pas théoriques. Stalwart Mail est en production et gère IMAP, POP3, SMTP et JMAP avec une recherche plein texte native. La plateforme openDesk Edu plus large fournit le stockage de fichiers, la visioconférence, l'édition collaborative de documents, l'intégration SSO et une suite complète d'autres services de collaboration -- le tout natif conteneur et déployable via Ansible et Helm Charts sur Kubernetes.

Le défi principal à l'échelle nationale n'est pas la maturité des composants individuels, mais l'orchestration opérationnelle : le provisionnement de 2,8 millions de boîtes mail, le traitement de 100 millions de messages entrants par jour et le maintien de temps de réponse IMAP inférieurs à la seconde sur un cluster de stockage géographiquement distribué. Ce sont des problèmes de mise à l'échelle, pas des problèmes de recherche -- et l'écosystème open source les a résolus à des échelles comparables dans d'autres secteurs.

## Gouvernance : qui le gère ?

Un service central pour 2,8 millions d'étudiants nécessite une structure de gouvernance acceptable par les 16 Länder. La politique éducative en Allemagne étant une compétence des Länder (Kulturhoheit), un mandat fédéral n'est ni réaliste ni souhaitable.

Un modèle pratique : une association à but non lucratif (e.V.) sous l'égide d'une organisation de réseau de recherche existante, gouvernée par un conseil consultatif technique issu des organisations IT des Länder, un conseil de protection des données et un organe représentatif étudiant. Le financement combinerait un démarrage fédéral (potentiellement via le programme Digitalpakt), des contributions courantes des Länder participants proportionnellement à leurs effectifs étudiants, et des contributions volontaires des établissements bénéficiant de services étendus.

La participation est volontaire. L'export de données via des protocoles standards (IMAP, CalDAV) est toujours disponible. Il n'y a pas de verrouillage fournisseur -- la pile complète est sous licence Apache-2.0.

## Ce qui doit se passer ensuite

La technologie n'est pas le goulot d'étranglement. Le goulot d'étranglement est la coordination institutionnelle.

1. **Un dialogue entre les ministères fédéraux et régionaux de l'éducation et le DFN.** La proposition a besoin d'un sponsor politique. Le DFN exploite déjà le réseau de recherche national et possède une expérience de l'infrastructure d'identité fédérée.

2. **Une analyse d'impact sur la protection des données.** La centralisation de 2,8 millions de boîtes mail modifie l'équation en matière de protection des données. Un délégué à la protection des données externe devrait évaluer l'architecture avant tout pilote.

3. **Une preuve de concept.** Un déploiement de test de 30 jours avec 5 000 boîtes mail simulées sur l'infrastructure proposée validerait les estimations de capacité et identifierait les cas limites opérationnels.

4. **Établissements pilotes.** Trois à cinq universités de tailles variées et issues de différents Länder pourraient valider le modèle avec de vrais utilisateurs avant un déploiement plus large.

## Conclusion

Faire fonctionner une plateforme de messagerie et de collaboration souveraine pour chaque étudiant en Allemagne n'est pas une question de faisabilité technique. C'est une question de volonté politique et de coordination institutionnelle. Le coût par étudiant est une fraction de ce que les établissements dépensent actuellement collectivement. Les avantages en matière de souveraineté des données sont immédiats et irréversibles. La pile open source élimine entièrement la dépendance envers un fournisseur.

Les chiffres sont grands. C'est le propos. Penser à l'échelle de la population étudiante nationale est inhabituel dans un système construit sur l'autonomie institutionnelle. Mais autonomie et fédération ne sont pas des opposés. Une plateforme fédérée bien conçue donne à chaque établissement le contrôle total de ses données en local tout en mutualisant la charge opérationnelle d'un service standardisé à une échelle qu'aucun d'entre eux ne pourrait atteindre seul.

---

## Ce que vous pouvez faire

1. **Lire la proposition complète :** L'analyse de capacité détaillée et le modèle de gouvernance sont disponibles en tant que document compagnon.
2. **Tester la pile :** openDesk Edu se déploie à partir d'un seul playbook Ansible. Commencez avec une instance à nœud unique et évaluez.
3. **Participer à la conversation :** Partagez cet article avec la direction IT de votre établissement. Plus de décideurs verront les chiffres, plus vite la coordination pourra commencer.

---

*L'infrastructure la plus évolutive est celle que l'on construit une fois et que l'on partage avec tous.*
