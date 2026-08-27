---
title: "Architecture d'identité et d'authentification"
date: "2026-08-27"
description: "La chaîne d'authentification complète dans openDesk Edu — de la fédération DFN-AAI via l'SSO Keycloak jusqu'aux connexions de service SAML et OIDC, mappage d'attributs et scénarios multi-IdP."
categories: ["architecture", "infrastructure"]
tags: ["architecture", "identité", "authentification", "saml", "oidc", "keycloak", "fédération", "dfn-aai", "edugain", "shibboleth", "nubus"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/identity-authentication-teaser.svg"
---

# Architecture d'identité et d'authentification

L'identité est la première chose que chaque utilisateur touche. Avant qu'un étudiant n'ouvre un fichier, ne rejoigne une conférence ou ne modifie un document, il s'authentifie. Dans l'enseignement supérieur, cette authentification se produit rarement sur la plateforme elle-même — elle a lieu dans l'établissement d'origine de l'utilisateur, fédérée via des réseaux d'identité nationaux et internationaux. Cet article documente la manière dont openDesk Edu gère ce flux de bout en bout : de la couche de fédération via Keycloak comme courtier d'identité central, jusqu'au service qui reçoit finalement les attributs d'identité de l'utilisateur.

Pour un aperçu général de l'architecture complète de la plateforme, consultez [Vue d'ensemble de l'architecture système](/architecture/overview). Pour une comparaison des choix de composants (email, vidéo, fichiers), voir [Alternatives de composants](/architecture/component-alternatives).

## La chaîne d'authentification

La plateforme utilise une architecture d'authentification à trois couches. Chaque couche a une responsabilité distincte, et les frontières entre elles constituent les frontières de sécurité du système.

### Couche 1 : Fédération (Externe)

La couche la plus externe est la fédération d'identité. En Allemagne, il s'agit de DFN-AAI (Deutsches Forschungsnetz — Authentication and Authorization Infrastructure), opéré par le DFN-Verein. DFN-AAI connecte les fournisseurs d'identité (IdP) universitaires avec les fournisseurs de services (SP) via l'échange de métadonnées SAML 2.0. Il fait partie d'eduGAIN, l'inter-fédération mondiale qui étend le réseau de confiance aux institutions participantes du monde entier.

Lorsqu'un étudiant d'une université allemande se connecte, son navigateur est redirigé vers l'IdP de son établissement (généralement un IdP Shibboleth). L'IdP authentifie l'utilisateur (via la méthode locale de l'établissement — LDAP, mot de passe, MFA) et émet une assertion SAML contenant des attributs sur l'utilisateur : son nom, son email, son affiliation et son établissement d'origine. Cette assertion transite via la fédération jusqu'au point de terminaison du fournisseur de services de la plateforme.

La couche de fédération est la racine de confiance. La plateforme n'authentifie pas l'utilisateur directement — elle fait confiance à l'assertion de la fédération. Cela signifie qu'aucune université n'a besoin de créer ou de gérer des comptes sur la plateforme ; les comptes institutionnels existants fonctionnent automatiquement.

### Couche 2 : Courtier d'identité (Keycloak)

Keycloak se trouve au centre de la pile d'identité de la plateforme. Il agit à la fois comme fournisseur de services SAML (auprès de la fédération) et comme fournisseur d'identité OpenID Connect (OIDC) (auprès des services internes). Ce double rôle est la clé architecturale : il permet à la plateforme de parler SAML vers l'extérieur tout en parlant OIDC à ses propres services.

Le flux d'authentification via Keycloak fonctionne comme suit :

1. **Le service redirige vers Keycloak** : Lorsqu'un utilisateur accède à un service (par exemple, Nextcloud, Moodle), le service vérifie s'il existe une session valide. Si ce n'est pas le cas, il redirige l'utilisateur vers le point de terminaison d'autorisation de Keycloak avec une demande d'autorisation OIDC.
2. **Keycloak vérifie la session existante** : Si l'utilisateur a déjà une session Keycloak (d'une connexion précédente à un service), Keycloak émet un jeton OIDC immédiatement. C'est l'authentification unique (SSO) — l'utilisateur s'authentifie une fois et accède à tous les services.
3. **Keycloak redirige vers la fédération** : Si aucune session n'existe, Keycloak redirige l'utilisateur vers le courtier d'identité configuré (DFN-AAI / eduGAIN). L'utilisateur sélectionne son établissement d'origine via une interface de découverte et s'authentifie auprès de l'IdP de son institution.
4. **La fédération renvoie l'assertion SAML** : L'IdP émet une assertion SAML contenant les attributs de l'utilisateur. Keycloak reçoit cette assertion, la valide par rapport aux métadonnées de fédération et crée une session utilisateur locale avec les attributs mappés.
5. **Keycloak émet le jeton OIDC** : Keycloak traduit les attributs SAML en claims OIDC et émet un jeton d'accès, un jeton de rafraîchissement et un jeton d'identité au service demandeur. Le service utilise ces jetons pour identifier l'utilisateur et appliquer l'autorisation.

Ce flux est transparent pour l'utilisateur. Il voit la page de connexion de son institution, puis il est sur la plateforme. La traduction SAML-vers-OIDC, le mappage d'attributs et l'émission de jetons se produisent en coulisses.

### Couche 3 : Services (Interne)

Chaque service de la plateforme reçoit l'identité de l'utilisateur via l'un de deux protocoles :

- **OpenID Connect (OIDC)** : Les services modernes (Nextcloud, OpenProject, XWiki, Planka, Zammad, CryptPad, OpenCloud) se connectent directement à Keycloak via le flux de code d'autorisation OIDC standard. Ils reçoivent des jetons d'accès JWT et des jetons d'identité qu'ils valident contre les clés publiques de Keycloak.

- **SAML 2.0** : Les services éducatifs qui nécessitent un fournisseur de services SAML dédié (ILIAS, Moodle, BigBlueButton) utilisent Shibboleth comme SP. Shibboleth se situe entre Keycloak et le service, traduisant les assertions SAML de Keycloak dans le format attendu par chaque application. Chaque service a sa propre configuration Shibboleth avec des filtres d'attributs spécifiques au service.

Le choix du protocole est déterminé par le service, pas par la plateforme. Les services qui prennent en charge OIDC l'utilisent directement ; les services qui ne prennent en charge que SAML obtiennent un SP Shibboleth devant eux. Keycloak gère les deux simultanément.

## Intégration de la fédération

### DFN-AAI

DFN-AAI est la fédération d'identité académique nationale allemande. Elle connecte plus de 400 universités et institutions de recherche via l'échange de métadonnées SAML 2.0. Pour openDesk Edu, l'intégration avec DFN-AAI signifie :

- **Enregistrement de l'Entity ID** : L'instance Keycloak de la plateforme est enregistrée comme fournisseur de services dans les métadonnées de la fédération DFN-AAI. Cet enregistrement inclut l'Entity ID, l'URL du Assertion Consumer Service (ACS) et le certificat de signature.
- **Échange de métadonnées** : La plateforme consomme les métadonnées de fédération DFN-AAI (un fichier XML signé listant tous les IdP de confiance) et publie ses propres métadonnées SP. Keycloak actualise automatiquement les métadonnées de fédération selon un calendrier configurable.
- **Libération d'attributs** : Chaque IdP institutionnel configure quels attributs il libère vers la plateforme. La plateforme demande un ensemble standard d'attributs eduGAIN (voir Mappage d'attributs ci-dessous), mais l'IdP décide finalement de ce qui est libéré en fonction de ses propres politiques.

### eduGAIN

eduGAIN est l'inter-fédération mondiale qui connecte les fédérations nationales (DFN-AAI en Allemagne, SWAMID en Suède, InCommon aux États-Unis, la UK Access Management Federation au Royaume-Uni, et d'autres). Via eduGAIN, un utilisateur de любую fédération participante peut s'authentifier auprès de la plateforme — pas seulement les institutions allemandes.

L'enregistrement DFN-AAI de la plateforme inclut automatiquement la participation eduGAIN. Aucun enregistrement séparé n'est nécessaire ; les métadonnées eduGAIN sont intégrées dans le flux de métadonnées DFN-AAI.

### Scénarios multi-fédérations

Une institution peut avoir besoin d'accepter des utilisateurs de plusieurs fédérations nationales simultanément — par exemple, une université allemande collaborant avec des partenaires suédois et néerlandais. Keycloak prend en charge cela via plusieurs configurations de courtier d'identité :

- Chaque fédération est configurée comme un fournisseur d'identité distinct dans Keycloak
- La page de connexion présente une interface de découverte IdP où les utilisateurs sélectionnent leur fédération et leur établissement d'origine
- Keycloak achemine la demande d'authentification vers la fédération sélectionnée
- Au retour, Keycloak normalise les attributs (différentes fédérations peuvent utiliser des noms d'attributs légèrement différents) et crée la session locale

Cette configuration multi-fédération est de la configuration, pas du code. Ajouter une nouvelle fédération consiste à importer ses métadonnées et à configurer les mappeurs d'attributs dans la console d'administration de Keycloak.

## Mappage d'attributs

Lorsqu'un utilisateur s'authentifie via la fédération, son IdP libère un ensemble d'attributs SAML. Keycloak mappe ces attributs vers des attributs utilisateur internes, puis vers des claims OIDC que les services consomment. Le mappage est le chemin critique : si les attributs n'arrivent pas correctement, les utilisateurs ne peuvent pas s'authentifier, les rôles ne sont pas attribués et la personnalisation échoue.

### Attributs eduGAIN standard

| Attribut | Description | Mapping Keycloak | Claim OIDC |
|-----------|-------------|------------------|------------|
| `eduPersonPrincipalName` | Identifiant utilisateur unique et persistant | `eppn` | `eppn` |
| `mail` | Adresse e-mail | `email` | `email` |
| `displayName` | Nom d'affichage complet | `name` | `name` |
| `givenName` | Prénom | `firstName` | `given_name` |
| `sn` | Nom de famille | `lastName` | `family_name` |
| `eduPersonAffiliation` | Rôle (student, staff, faculty, member) | `affiliation` | `affiliation` |
| `eduPersonScopedAffiliation` | Affiliation avec domaine de portée | `scopedAffiliation` | `scoped_affiliation` |
| `eduPersonEntitlement` | URN d'habilitation (appartenances à des groupes) | `entitlement` | `entitlement` |
| `preferredLanguage` | Préférence de langue | `locale` | `locale` |
| `schacHomeOrganization` | Domaine de l'établissement d'origine | `organization` | `home_organization` |

Les cinq premiers attributs (eppn, mail, displayName, givenName, sn) sont obligatoires pour l'enregistrement DFN-AAI. Les cinq autres sont recommandés et améliorent l'expérience utilisateur mais ne sont pas requis pour l'authentification de base.

### Configuration des mappeurs d'attributs

Keycloak utilise des mappeurs d'attributs pour traduire entre SAML et OIDC. Chaque mappeur définit :

- **Attribut source** : Le nom d'attribut SAML de la fédération (au format `urn:oasis:names:tc:SAML:2.0:attrname-format:uri`)
- **Claim cible** : Le nom de claim OIDC que les services reçoivent
- **Transformation** : Optionnelle — certains attributs nécessitent une normalisation (par exemple, tronquer la portée de `eduPersonScopedAffiliation` pour extraire la valeur d'affiliation)

Les mappeurs sont configurés une fois dans les paramètres de realm de Keycloak et s'appliquent à tous les services. Cela centralise la gestion des attributs — les services n'ont pas besoin de connaître SAML ou les attributs de fédération ; ils reçoivent des claims OIDC standard.

## Double pile de protocoles : SAML et OIDC

La plateforme exploite simultanément SAML 2.0 et OpenID Connect. Ce n'est pas de la redondance — c'est une nécessité dictée par le paysage hétérogène des services dans l'enseignement supérieur.

### Pourquoi les deux protocoles

Les applications web modernes (Nextcloud, OpenProject, Zammad, CryptPad) prennent en charge OIDC nativement. OIDC offre des jetons Web JSON (JWT), une surface de configuration plus simple et un meilleur support pour les clients mobiles et SPA. Pour ces services, OIDC est le choix naturel.

Cependant, de nombreuses applications spécifiques à l'éducation (ILIAS, Moodle, BigBlueButton) ont des intégrations SAML profondes construites au fil des années de travail de fédération. Leurs plugins d'authentification attendent des assertions SAML, des flux initiés par le SP et des déclarations d'attributs dans un format spécifique. Les réécrire pour utiliser OIDC serait un effort significatif et briserait la compatibilité avec les configurations de fédération existantes.

Keycloak résout cela en parlant les deux protocoles. Il reçoit SAML de la fédération et peut émettre soit SAML soit OIDC aux services en aval. Les services qui nécessitent SAML obtiennent un SP Shibboleth ; les services qui préfèrent OIDC se connectent directement à Keycloak.

### Fournisseur de services Shibboleth

Shibboleth agit comme le SP SAML pour les services qui en ont besoin. Le flux est :

1. L'utilisateur accède à un service basé sur SAML (par exemple, Moodle)
2. Le service redirige vers le SP Shibboleth
3. Le SP Shibboleth redirige vers Keycloak (agissant comme IdP)
4. Keycloak authentifie l'utilisateur (via la fédération si pas de session, ou via SSO si session existante)
5. Keycloak émet une assertion SAML au SP Shibboleth
6. Le SP Shibboleth transmet l'assertion au service avec les attributs qu'il attend

Chaque service basé sur SAML a sa propre configuration SP Shibboleth avec des filtres d'attributs spécifiques au service. Cela signifie qu'ILIAS, Moodle et BigBlueButton reçoivent chacun uniquement les attributs dont ils ont besoin — pas l'ensemble complet des attributs de la fédération.

## Nubus : Le portail orienté utilisateur

Tandis que Keycloak gère l'authentification au niveau du protocole, Nubus fournit la couche orientée utilisateur de la pile d'identité. Nubus (v1.18.1, AGPL-3.0) est un portail libre-service qui se situe devant Keycloak et offre aux utilisateurs finaux un emplacement unique pour gérer leur identité.

### Ce que fait Nubus

- **Réinitialisation de mot de passe en libre-service** : Les utilisateurs peuvent réinitialiser leur mot de passe sans contacter un administrateur, via un flux de vérification (e-mail ou questions de sécurité)
- **Gestion de profil** : Les utilisateurs consultent et modifient leur profil (nom d'affichage, e-mail, préférence de langue)
- **Gestion de groupes** : Les utilisateurs peuvent voir leurs appartenances à des groupes et, le cas échéant, rejoindre ou quitter des groupes
- **Lanceur d'applications** : Un tableau de bord des services disponibles, avec des liens directs qui contournent le flux de connexion (le SSO gère l'authentification)
- **Journal d'audit** : Les actions administratives sont journalisées pour la conformité et le dépannage

### Ce que fait Keycloak (vs. Nubus)

Keycloak reste le fournisseur d'identité. Il gère :
- La fédération (SAML vers DFN-AAI/eduGAIN)
- L'émission de jetons (OIDC vers les services)
- La gestion de session (SSO entre services)
- Le courtage de protocoles (SAML ↔ OIDC)
- Le stockage et le mappage des attributs utilisateur

Nubus ne remplace pas Keycloak — il l'enveloppe. Nubus appelle l'API REST d'administration de Keycloak pour effectuer des opérations orientées utilisateur, offrant une interface plus conviviale que la console d'administration de Keycloak elle-même (qui est conçue pour les administrateurs, pas pour les utilisateurs finaux).

## Frontières de sécurité et modes de défaillance

### Frontières de confiance

La plateforme a trois frontières de confiance :

1. **Fédération → Plateforme** : La plateforme fait confiance aux assertions SAML de la fédération. Si un IdP DFN-AAI affirme qu'un utilisateur est `max.mustermann@uni-example.de` avec l'affiliation `student`, la plateforme l'accepte. La confiance est ancrée dans les métadonnées de fédération, qui sont signées cryptographiquement.

2. **Keycloak → Services** : Les services font confiance aux jetons OIDC de Keycloak. Chaque service valide la signature JWT contre les clés publiques de Keycloak. Un service ne voit jamais les attributs de fédération directement — il ne voit que les claims OIDC normalisés que Keycloak émet.

3. **Utilisateur → IdP** : L'utilisateur s'authentifie auprès de son IdP d'origine en utilisant la méthode que son institution fournit (mot de passe, MFA, carte à puce). La plateforme n'a aucune visibilité sur cette interaction.

### Modes de défaillance

**IdP indisponible** : Si l'IdP d'origine de l'utilisateur est en panne, la connexion fédérée échoue. Keycloak affiche un message d'erreur. Les utilisateurs configurés localement (administrateurs, comptes de service) peuvent toujours se connecter directement via Keycloak, de sorte que la plateforme reste gérable.

**Métadonnées de fédération obsolètes** : Les métadonnées de fédération ont une période de validité. Si la copie de la plateforme est obsolète (par exemple, DFN-AAI a roté ses clés de signature et la plateforme n'a pas actualisé), l'authentification échoue pour tous les utilisateurs fédérés. Keycloak actualise les métadonnées automatiquement selon un calendrier configurable (généralement toutes les 6–12 heures), mais les administrateurs devraient surveiller la fraîcheur des métadonnées.

**Attributs insuffisants** : Si l'IdP libère moins d'attributs que prévu (par exemple, `eduPersonAffiliation` manque), les mappeurs de Keycloak gèrent l'écart gracieusement — l'utilisateur est authentifié mais peut avoir des fonctionnalités réduites (pas de contrôle d'accès basé sur les rôles, pas d'interface personnalisée). La plateforme journalise les attributs manquants afin que les administrateurs puissent travailler avec l'IdP pour les libérer.

**Expiration des jetons** : Les jetons d'accès OIDC ont une durée de vie courte (généralement 5–15 minutes). Les services utilisent des jetons de rafraîchissement pour obtenir de nouveaux jetons d'accès sans se réauthentifier. Si le jeton de rafraîchissement expire également, l'utilisateur est redirigé à travers le flux d'authentification complet. Cela est transparent pour l'utilisateur s'il a une session Keycloak active (SSO).

## Comptes utilisateurs locaux

Tous les utilisateurs ne proviennent pas de la fédération. La plateforme prend en charge les comptes configurés localement dans Keycloak pour :

- **Administrateurs** : Les opérateurs de plateforme qui ont besoin d'un accès indépendamment de l'état de la fédération
- **Comptes de service** : Les systèmes automatisés qui s'authentifient via des informations d'identification client (pas de connexion interactive)
- **Utilisateurs de test** : Comptes pour les tests et l'évaluation avant que la fédération ne soit configurée

Les comptes locaux sont gérés dans la console d'administration de Keycloak ou via le portail Nubus. Ils coexistent avec les comptes fédérés — les deux types peuvent être actifs simultanément, et le même utilisateur peut avoir à la fois une identité fédérée et locale (bien que cela soit rare et nécessite un mappage d'attributs careful pour éviter les doublons).

## Conformité et protection des données

L'architecture d'identité est conçue selon les principes de protection des données :

- **Libération minimale d'attributs** : La plateforme demande uniquement les attributs dont elle a besoin. Elle ne stocke pas d'attributs sensibles (par exemple, numéros d'identification nationale, données biométriques) de la fédération.
- **Pas de stockage de mot de passe pour les utilisateurs fédérés** : La plateforme ne voit ni ne stocke jamais le mot de passe institutionnel de l'utilisateur. L'authentification a lieu à l'IdP ; la plateforme ne reçoit que des assertions.
- **Alignement RGPD/DSGVO** : Les données utilisateur (nom, e-mail, affiliation) sont traitées aux fins d'authentification et de prestation de service. Les établissements sont responsables de leur base légale de traitement en tant que responsable du traitement.
- **Piste d'audit** : Keycloak journalise les événements d'authentification (connexions réussies et échouées, émission de jetons, création de session). Ces journaux soutiennent l'investigation des incidents et les preuves de conformité.

Pour une vue plus large de la sécurité et de la conformité à travers la plateforme, consultez l'article [Architecture de sécurité](/architecture/security).

---

## Pour aller plus loin

- [Vue d'ensemble de l'architecture système](/architecture/overview) — l'architecture complète de la plateforme
- [Alternatives de composants](/architecture/component-alternatives) — choix email, vidéo, stockage de fichiers et tableau blanc
- [Identité fédérée pour l'éducation](/blog/dfn-aai-federation-shared-evaluation) — article de blog sur l'intégration DFN-AAI et l'appel pour une instance d'évaluation partagée
- [Architecture réseau et flux de trafic](/architecture/networking-traffic-flow) — comment le trafic entre dans le cluster et atteint les services
- [Architecture de stockage et de gestion des données](/architecture/storage-data-management) — stockage persistant, bases de données et intégration de sauvegarde

---

*L'authentification est la passerelle vers chaque service. Quand elle fonctionne, les utilisateurs n'y pensent jamais. Quand elle échoue, rien d'autre n'a d'importance.*
