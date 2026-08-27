---
title: "Architecture réseau et flux de trafic"
date: "2026-08-27"
description: "Comment le trafic réseau entre dans le cluster openDesk Edu, traverse DNS, terminaison TLS, routage d'ingress et politiques réseau pour atteindre les services — le chemin complet du flux de trafic."
categories: ["architecture", "infrastructure"]
tags: ["architecture", "réseau", "dns", "tls", "ingress", "traefik", "certificats", "politiques-réseau", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/networking-traffic-flow-teaser.svg"
---

# Architecture réseau et flux de trafic

Chaque requête vers la plateforme — qu'elle vienne d'un étudiant consultant ses emails, d'un professeur téléversant du matériel de cours, ou d'un administrateur configurant des services — traverse le même chemin réseau. Comprendre ce chemin est essentiel pour les opérateurs qui doivent diagnostiquer les problèmes de connectivité, planifier la capacité ou implémenter des politiques de sécurité. Cet article documente le flux de trafic complet : de la résolution DNS à la terminaison TLS, au routage d'ingress et à l'application des politiques réseau, jusqu'au pod de service individuel.

Pour la couche d'identité qui authentifie le trafic une fois arrivé, consultez [Architecture d'identité et d'authentification](/architecture/identity-authentication). Pour un aperçu complet de la plateforme, voir [Vue d'ensemble de l'architecture système](/architecture/overview).

## Le chemin du flux de trafic

Lorsque le navigateur d'un utilisateur demande `https://cloud.example.edu`, la requête traverse plusieurs couches avant d'atteindre le pod d'application. Chaque couche a une responsabilité spécifique, et les comprendre dans l'ordre est la clé pour diagnostiquer tout problème de connectivité.

```
Navigateur utilisateur
    │
    ▼
Résolution DNS ──► adresse IP du contrôleur d'ingress
    │
    ▼
Terminaison TLS ──► certificat présenté, handshake HTTPS
    │
    ▼
Contrôleur d'ingress (Traefik) ──► règle de routage correspondante, en-tête Host inspecté
    │
    ▼
Politique réseau ──► trafic pod-à-pod autorisé/refusé
    │
    ▼
Service (Kubernetes Service) ──► réparti sur un pod sain
    │
    ▼
Pod d'application ──► requête traitée, réponse renvoyée
```

### Couche 1 : Résolution DNS

Le voyage commence avec le DNS. Lorsqu'un utilisateur tape `cloud.example.edu` dans son navigateur, le navigateur interroge son résolveur DNS configuré, qui suit la chaîne de la zone racine à travers le domaine de premier niveau (`.edu`) jusqu'aux serveurs de noms faisant autorité de l'institution.

La configuration DNS de l'institution mappe chaque nom d'hôte de service à l'adresse IP d'ingress du cluster. Une configuration typique utilise un DNS générique ou des enregistrements A/AAAA individuels :

- `cloud.example.edu` → IP d'ingress (Nextcloud)
- `meet.example.edu` → IP d'ingress (BigBlueButton)
- `auth.example.edu` → IP d'ingress (Keycloak)
- `portal.example.edu` → IP d'ingress (Nubus)

Tous les services partagent la même adresse IP d'ingress. La différenciation se fait au niveau du contrôleur d'ingress (Couche 3), qui inspecte l'en-tête `Host` pour acheminer le trafic vers le bon service. Cela signifie qu'une seule adresse IP dessert l'ensemble de la plateforme — le contrôleur d'ingress agit comme un proxy inverse, distribuant le trafic en fonction du nom d'hôte.

Certaines institutions utilisent un enregistrement DNS générique (`*.example.edu`) pointant vers l'IP d'ingress, ce qui simplifie la configuration lors de l'ajout de nouveaux services. D'autres préfèrent des enregistrements individuels pour un contrôle plus strict. Les deux approches fonctionnent ; le choix est une préférence opérationnelle.

### Couche 2 : Terminaison TLS

Lorsque le navigateur se connecte à l'IP d'ingress sur le port 443, le contrôleur d'ingress présente un certificat TLS. Ce certificat prouve l'identité du serveur et chiffre la connexion. La plateforme gère TLS au niveau de la couche d'ingress — les pods d'application individuels n'ont pas besoin de leurs propres certificats.

#### Sources de certificats

La plateforme prend en charge plusieurs sources de certificats :

- **openDesk Certificates (Bundesdruckerei)** : La source par défaut et recommandée. L'institution obtient des certificats TLS auprès de Bundesdruckerei, qui fournit des certificats sous contrôle institutionnel. Cela maintient la chaîne de confiance entièrement au sein de l'institution — aucune autorité de certification externe n'est impliquée.
- **cert-manager avec Let's Encrypt** : Pour les institutions qui préfèrent l'émission automatique de certificats. cert-manager s'intègre au protocole ACME pour obtenir et renouveler automatiquement les certificats Let's Encrypt. Cela convient aux environnements d'évaluation ou aux institutions sans PKI existante.
- **CA personnalisée / PKI institutionnelle** : Les institutions avec leur propre autorité de certification peuvent importer des certificats directement. C'est courant dans les grandes universités qui exploitent leur propre infrastructure PKI.

#### Gestion des certificats

Quelle que soit la source, les certificats sont gérés comme des secrets TLS Kubernetes. Le contrôleur d'ingress référence ces secrets dans sa configuration TLS. Le renouvellement des certificats est automatisé :

- **openDesk Certificates** : Renouvelés via le processus d'achat de l'institution. La plateforme surveille l'expiration des certificats et alerte les opérateurs avant que le renouvellement ne soit nécessaire.
- **cert-manager / Let's Encrypt** : Renouvelés automatiquement 30 jours avant l'expiration. cert-manager gère le défi ACME (HTTP-01 ou DNS-01) et met à jour le secret TLS sans intervention de l'opérateur.
- **CA personnalisée** : Le renouvellement dépend des politiques de CA de l'institution. Les opérateurs doivent remplacer manuellement le secret TLS avant l'expiration.

#### Configuration TLS

La plateforme applique des normes TLS modernes :

- **TLS 1.2 minimum** (TLS 1.3 préféré là où il est pris en charge)
- **HSTS** (HTTP Strict Transport Security) avec un max-age long, incluant les sous-domaines
- **Suite de chiffrement moderne** (pas de RC4, pas de 3DES, pas de SHA1)
- **OCSP stapling** là où il est pris en charge par la source du certificat

Tout le trafic HTTP est redirigé vers HTTPS. Aucun trafic non chiffré n'atteint les pods d'application. Le contrôleur d'ingress gère la redirection (301) avant de transférer toute requête.

### Couche 3 : Contrôleur d'ingress (Traefik)

Le contrôleur d'ingress est la porte d'entrée de la plateforme. Il reçoit tout le trafic HTTPS entrant, inspecte l'en-tête `Host`, fait correspondre les règles de routage et transfère la requête au service Kubernetes approprié.

#### Pourquoi Traefik

Traefik est le contrôleur d'ingress par défaut de la plateforme. Il a été choisi pour :

- **Configuration dynamique** : Traefik lit les ressources Ingress de l'API Kubernetes en temps réel. L'ajout d'un nouveau service ne nécessite pas de recharger le contrôleur — Traefik détecte le nouvel Ingress et achemine le trafic immédiatement.
- **Intégration Let's Encrypt** : Client ACME intégré pour la gestion automatique des certificats (lors de l'utilisation de Let's Encrypt comme source de certificats).
- **Support middleware** : Les middlewares Traefik gèrent la limitation de débit, le transfert d'authentification, la manipulation d'en-têtes et l'application des redirections.
- **Intégration Kubernetes native** : Traefik utilise l'API Ingress Kubernetes standard et prend en charge IngressRoute (la Custom Resource de Traefik) pour les configurations avancées.
- **Observabilité** : Métriques intégrées (Prometheus) et tracing (OpenTelemetry) pour l'analyse du trafic et le dépannage.

Certaines institutions déploient HAProxy alongside Traefik pour des scénarios spécifiques d'équilibrage de charge (par exemple, le trafic UDP de BigBlueButton pour la vidéo, que Traefik ne gère pas nativement). Dans ces configurations, Traefik gère HTTP/HTTPS et HAProxy gère le trafic non-HTTP.

#### Règles de routage

Le routage est configuré via des ressources Ingress Kubernetes (ou des CRD IngressRoute). Chaque service a sa propre définition Ingress qui spécifie :

- **Hôte** : Le nom d'hôte qui déclenche cette route (par exemple, `cloud.example.edu`)
- **Chemin** : Routage basé sur le chemin optionnel (par exemple, `/api` vs `/web`)
- **Service** : Le service Kubernetes cible et le port
- **TLS** : Référence au secret TLS pour cet hôte
- **Middlewares** : Limitation de débit, manipulation d'en-têtes, etc.

Le contrôleur d'ingress évalue ces règles pour chaque requête entrante. La première règle correspondante gagne. Si aucune règle ne correspond, le contrôleur renvoie un 404.

#### Limitation de débit et middlewares de sécurité

Le contrôleur d'ingress applique plusieurs middlewares à chaque requête :

- **Limitation de débit** : Protège contre les attaques par force brute et les abus. Les limites sont configurées par service et peuvent être ajustées en fonction des modèles de trafic du service.
- **En-têtes de sécurité** : Ajoute `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection` et `Content-Security-Policy`.
- **Limites de taille de requête** : Empêche les charges utiles surdimensionnées de submerger les services.
- **Application des délais d'attente** : Empêche les attaques slow-loris en appliquant des délais de connexion et de lecture.

### Couche 4 : Politiques réseau

Une fois que le contrôleur d'ingress transfère le trafic vers un service Kubernetes, les politiques réseau régissent quels pods peuvent communiquer avec quels autres pods. Les politiques réseau sont la méthode native Kubernetes pour appliquer la segmentation réseau.

#### Modèle de refus par défaut

La plateforme utilise un modèle de refus par défaut : tout le trafic pod-à-pod est refusé sauf s'il est explicitement autorisé. Cela signifie :

- Un pod frontal web peut atteindre le pod de base de données (parce qu'une politique l'autorise)
- Un pod frontal web ne peut pas atteindre le pod de base de données d'un autre locataire (parce qu'aucune politique ne l'autorise)
- Un attaquant externe qui compromet un pod ne peut pas pivoter vers des services arbitraires (parce que les politiques réseau limitent le mouvement latéral)

#### Isolation par namespace

La plateforme utilise des namespaces Kubernetes pour fournir une isolation logique entre les groupes de services :

- Chaque service principal (ou groupe de services liés) s'exécute dans son propre namespace
- Les politiques réseau contrôlent le trafic inter-namespace
- La communication inter-namespace est explicite (une politique doit l'autoriser) plutôt qu'implicite

Cette structure de namespace fournit un confinement du rayon d'impact : si un service est compromis, la capacité de l'attaquant à atteindre d'autres services est limitée par les politiques réseau entre les namespaces.

#### Modèles de politiques typiques

Les modèles de politiques réseau courants incluent :

- **Frontend → Backend** : Une politique autorisant le namespace frontal web à atteindre le namespace de l'API backend sur des ports spécifiques
- **Backend → Base de données** : Une politique autorisant le namespace backend à atteindre le namespace de base de données uniquement sur le port de base de données
- **Ingress → Tous** : Une politique autorisant le namespace du contrôleur d'ingress à atteindre tous les namespaces de service sur les ports HTTP/HTTPS
- **Monitoring → Tous** : Une politique autorisant le namespace de monitoring (Prometheus) à scraper les endpoints de métriques dans tous les namespaces

Chaque politique est limitée aux permissions minimales nécessaires. Aucune politique n'autorise « tout le trafic vers tous les pods » — cela annulerait l'objectif de la segmentation réseau.

### Couche 5 : Service et Pod

La dernière couche est le pod d'application lui-même. Après que le trafic a traversé DNS, TLS, ingress et politiques réseau, il atteint le service Kubernetes, qui répartit la charge sur les pods sains.

#### Découverte de services

Les services Kubernetes fournissent des adresses IP virtuelles stables (ClusterIP) qui acheminent le trafic vers les pods sains. Lorsqu'un pod est créé, détruit ou devient défectueux, le service met automatiquement à jour sa liste de points de terminaison. L'application n'a pas besoin de connaître les changements de cycle de vie des pods — elle sert simplement les requêtes.

#### Communication au niveau du pod

Au sein d'un pod, les conteneurs communiquent via `localhost`. Entre les pods du même namespace, la communication utilise la ClusterIP. Entre les namespaces, la communication utilise le nom de service complet (par exemple, `database.backend-namespace.svc.cluster.local`).

## Architecture DNS

### DNS externe

La configuration DNS externe de l'institution mappe les noms d'hôte publics à l'IP d'ingress du cluster. C'est le point d'entrée pour tout le trafic externe.

### DNS interne (CoreDNS)

À l'intérieur du cluster, CoreDNS gère la découverte de services. Chaque service Kubernetes obtient un enregistrement DNS :

- `servicename.namespace.svc.cluster.local` — le nom complet
- `servicename.namespace` — le nom court (au sein du même cluster)
- `servicename` — le nom le plus court (au sein du même namespace)

Les applications utilisent ces noms DNS pour atteindre d'autres services. Par exemple, un pod frontal se connecte à la base de données en utilisant `database.backend:3306` plutôt qu'une adresse IP. Cette abstraction signifie que les pods peuvent être déplacés, redémarrés et mis à l'échelle sans changement de configuration.

### Entrées DNS personnalisées

La plateforme prend en charge les entrées DNS personnalisées pour les services qui nécessitent des configurations de nom d'hôte spécifiques (par exemple, les endpoints SAML de Keycloak nécessitent une correspondance exacte de nom d'hôte). Celles-ci sont configurées via des configurations CoreDNS personnalisées ou des services ExternalName.

## Gestion des certificats TLS

### La chaîne de confiance

La chaîne de confiance TLS de la plateforme est conçue pour garder tout le contrôle au sein de l'institution :

1. **Racine de confiance** : L'autorité de certification de l'institution (ou Bundesdruckerei pour openDesk Certificates) signe les certificats TLS
2. **Stockage des certificats** : Les certificats sont stockés en tant que secrets TLS Kubernetes, accessibles uniquement au contrôleur d'ingress et aux services qui en ont besoin
3. **Présentation du certificat** : Le contrôleur d'ingress présente le certificat au client lors du handshake TLS
4. **Renouvellement des certificats** : Le renouvellement est automatisé (cert-manager) ou surveillé (CA personnalisée), garantissant qu'aucun certificat n'expire sans intervention

### Portée des certificats

Chaque nom d'hôte obtient son propre certificat, ou un certificat générique couvre tous les sous-domaines. Le choix dépend de la PKI de l'institution :

- **Certificats individuels** : Sécurité plus stricte (chaque certificat est indépendant), mais plus de certificats à gérer
- **Certificats génériques** : Gestion plus simple (un seul certificat pour tous les sous-domaines), mais un certificat générique compromis affecte tous les services

La plateforme prend en charge les deux approches. La configuration par défaut utilise des certificats individuels par service, mais les certificats génériques sont pris en charge pour les institutions qui les préfèrent.

## Posture de sécurité réseau

### Chiffrement en transit

Tout le trafic est chiffré :

- **Trafic externe** : HTTPS (TLS 1.2+) entre le navigateur de l'utilisateur et le contrôleur d'ingress
- **Trafic interne** : Le trafic entre les pods peut être chiffré avec mTLS (mutual TLS), bien que cela dépende de la configuration du service mesh. Par défaut, le trafic pod-à-pod au sein du cluster n'est pas chiffré (reposant sur les politiques réseau pour l'isolation), mais mTLS peut être activé pour les services qui le nécessitent.

### Protection DDoS

Le contrôleur d'ingress fournit une protection DDoS de base via la limitation de débit et les limites de connexion. Pour les institutions confrontées à des attaques sophistiquées, un service externe de protection DDoS (par exemple, le fournisseur en amont de l'institution ou un service dédié d'atténuation DDoS) peut être placé devant le cluster.

### Intégration du pare-feu

Le pare-feu hôte du cluster (par exemple, iptables, nftables ou les groupes de sécurité du fournisseur cloud) restreint le trafic entrant aux seuls ports dont la plateforme a besoin :

- **Port 443 (HTTPS)** : Tout le trafic utilisateur
- **Port 80 (HTTP)** : Redirection vers HTTPS uniquement (pas de trafic d'application)
- **Port 22 (SSH)** : Accès administratif uniquement, restreint aux réseaux de gestion

Tous les autres ports entrants sont fermés. Le trafic inter-pods est régi par les politiques réseau Kubernetes, non par le pare-feu hôte.

## Modes de défaillance et dépannage

### Échec de résolution DNS

**Symptôme** : Les utilisateurs voient « Ce site est inaccessible » ou des erreurs `NXDOMAIN`.
**Cause** : Les enregistrements DNS sont mal configurés ou le fournisseur DNS est indisponible.
**Résolution** : Vérifiez que les enregistrements A/AAAA pointent vers la bonne IP d'ingress. Vérifiez la propagation DNS avec `dig` ou `nslookup`.

### Expiration du certificat TLS

**Symptôme** : Les utilisateurs voient « Votre connexion n'est pas privée » ou `NET::ERR_CERT_DATE_INVALID`.
**Cause** : Un certificat TLS a expiré.
**Résolution** : Pour les certificats gérés par cert-manager, vérifiez les journaux cert-manager et le statut de la ressource Certificate. Pour les certificats CA personnalisés, remplacez le secret TLS par un certificat renouvelé.

### Échec de routage d'ingress

**Symptôme** : Les utilisateurs voient une erreur 404 ou 502.
**Cause** : La ressource Ingress est mal configurée, le service cible n'a pas de pods sains, ou la classe Ingress est incorrecte.
**Résolution** : Vérifiez la ressource Ingress (`kubectl get ingress`), vérifiez que le service a des endpoints (`kubectl get endpoints`), et consultez le tableau de bord Traefik pour les règles de routage.

### Refus de politique réseau

**Symptôme** : Un service ne peut pas atteindre un autre service (délai d'attente ou connexion refusée).
**Cause** : Une politique réseau bloque le trafic.
**Résolution** : Vérifiez les politiques réseau dans les deux namespaces (source et destination). Utilisez `kubectl exec` pour tester la connectivité depuis le pod source. Relâchez temporairement la politique pour confirmer le diagnostic, puis resserrez-la aux permissions minimales nécessaires.

---

## Pour aller plus loin

- [Vue d'ensemble de l'architecture système](/architecture/overview) — l'architecture complète de la plateforme
- [Architecture d'identité et d'authentification](/architecture/identity-authentication) — comment l'authentification fonctionne une fois le trafic arrivé
- [Architecture de sécurité](/architecture/security) — contrôles de sécurité, secrets, RBAC et conformité
- [Architecture de stockage et de gestion des données](/architecture/storage-data-management) — stockage persistant, bases de données et sauvegardes
- [Sécurité et conformité](/blog/security-compliance) — article de blog sur l'approche sécurité et conformité de la plateforme
- [Sovereign Cloud : SCS vs Proxmox + K3s](/blog/scs-vs-proxmox-k3s) — article de blog sur la comparaison des plateformes d'infrastructure

---

*Chaque requête raconte une histoire en voyageant du navigateur au pod. Connaître le chemin, c'est savoir où regarder quand quelque chose ne va pas.*
