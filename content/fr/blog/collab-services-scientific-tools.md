---
title: "Collab Services : 11 Outils de Calcul Scientifique Rejoignent openDesk Edu"
date: "2026-05-29"
description: "openDesk Edu ajoute 11 outils open-source de calcul scientifique — JupyterHub, Overleaf, RStudio, code-server, Open WebUI, Ollama, et plus — déployés via Helmfile sur Kubernetes avec SSO Keycloak unifié."
image: "/static/blog/collab-services-teaser.png"
categories: ["announcement"]
tags: ["collab-services", "scientific-computing", "jupyter", "rstudio", "overleaf", "kubernetes", "opensource"]
---

# Collab Services : 11 Outils de Calcul Scientifique Rejoignent openDesk Edu

openDesk Edu a déployé sa plus grande mise à jour fonctionnelle à ce jour. **Collab Services** — Phase A d'une initiative en trois phases — ajoute 11 outils open-source de calcul scientifique à la plateforme, la transformant d'un système de productivité et de gestion de l'apprentissage en un environnement de recherche numérique complet pour les universités et les instituts de recherche.

Les nouveaux outils couvrent les carnets interactifs, le LaTeX collaboratif, les IDE dans le navigateur, les assistants IA locaux, le calcul distribué, et plus encore. Tous sont déployés via Helmfile sur Kubernetes, intégrés avec l'authentification unique Keycloak, et partagent des certificats TLS Let's Encrypt via HAProxy ingress.

## Ce Qui Est Ajouté

| Catégorie | Outil | Fonction | Statut | Sous-domaine |
|---|---|---|---|---|
| **Calcul** | [JupyterHub](https://jupyter.org/hub) | Carnets multi-utilisateurs (Python, R, Julia, SageMath, Octave) | ✅ Stable | `jupyter.*` |
| | [code-server](https://github.com/coder/code-server) | VS Code dans le navigateur | ✅ Stable | `code.*` |
| | [RStudio Server](https://posit.co/products/open-source/rstudio-server/) | IDE R avec support d'applications Shiny | 🟡 Bêta | `r.*` |
| | [Dask Gateway](https://gateway.dask.org/) | Clusters de calcul parallèle distribué | 🔵 Planifié | `compute.*` |
| **Édition** | [Overleaf CE](https://github.com/overleaf/overleaf) | LaTeX collaboratif en temps réel | ✅ Stable | `latex.*` |
| | [Slidev](https://github.com/slidevjs/slidev) | Markdown vers présentations | 🟡 Bêta | `slides.*` |
| **IA** | [Open WebUI](https://github.com/open-webui/open-webui) | Interface type ChatGPT pour LLM locaux | 🟡 Bêta | `ai.*` |
| | [Ollama](https://ollama.ai/) | Moteur LLM local (llama3.2, nomic-embed-text) | 🟡 Bêta | — |
| **Visualisation** | [Excalidraw](https://github.com/excalidraw/excalidraw) | Tableau blanc collaboratif | ✅ Stable | — |
| **Infrastructure** | [ttyd](https://github.com/tsl0922/ttyd) | Terminal Linux dans le navigateur | ✅ Stable | `term.*` |
| | [KasmVNC](https://kasmweb.com/) | Bureau Linux complet dans le navigateur | 🟡 Bêta | `desktop.*` |

Chaque service obtient son propre sous-domaine sous le DNS wildcard de l'établissement — `jupyter.universite-marburg.de`, `r.universite-marburg.de`, `latex.universite-marburg.de`, etc. — routé via HAProxy ingress avec des certificats TLS Let's Encrypt automatiques.

## Pourquoi C'est Important

openDesk Edu fournissait déjà la gestion de l'apprentissage (ILIAS, Moodle), la visioconférence (BigBlueButton, Jitsi), la synchronisation de fichiers (Nextcloud, OpenCloud) et les outils de productivité (Collabora, XWiki, OpenProject). Ce qui manquait était **l'infrastructure de calcul interactif** que des plateformes comme CoCalc offrent aux universités.

Collab Services comble cette lacune. Les étudiants et chercheurs peuvent désormais :

- Exécuter des carnets Jupyter avec les noyaux Python, R, Julia, SageMath et GNU Octave
- Rédiger des documents LaTeX collaboratifs en temps réel avec Overleaf CE
- Développer des scripts R et des applications Shiny dans un IDE dédié
- Coder dans VS Code depuis n'importe quel appareil sans installation locale
- Discuter avec des LLM privés via Open WebUI, propulsé par Ollama
- Accéder à un terminal Linux complet ou un environnement de bureau depuis un navigateur
- Créer des présentations à partir de Markdown avec Slidev
- Soumettre des jobs de calcul distribué à un cluster Dask Gateway

Le tout sans quitter l'écosystème openDesk Edu et sans provisionner d'infrastructure supplémentaire.

## Architecture

Le déploiement suit les conventions établies d'openDesk Edu. Tous les outils résident dans `helmfile/apps/` en tant que nouveau groupe d'applications aux côtés des services éducation et productivité existants.

### Structure du Dépôt

```
opendesk-edu/
├── helmfile/apps/
│   ├── jupyterhub/          # Chart amont (hub.jupyter.org)
│   ├── overleaf/            # Chart amont (ghcr.io/sharelatex)
│   ├── open-webui/          # Chart amont (helm.openwebui.com)
│   ├── ollama/              # Chart amont (ollama.github.io)
│   ├── code-server/         # Chart amont (helm.coder.com)
│   ├── kasmvnc/             # Chart amont (registry.kasmweb.com)
│   ├── dask/                # Chart amont (helm.dask.org)
│   ├── rstudio/             # Chart local personnalisé
│   ├── ttyd/                # Chart local personnalisé
│   ├── slidev/              # Chart local personnalisé
│   └── collab-dashboard/    # Chart local personnalisé + SPA React
├── helmfile/charts/
│   ├── rstudio/             # Deployment + Service + Ingress + PVC
│   ├── ttyd/                # Deployment + Service + Ingress
│   ├── slidev/              # Conteneur init + nginx + PVC
│   ├── collab-dashboard/    # nginx servant la SPA React
│   └── opencloud-sidecar/   # Sidecar de synchronisation de fichiers basé sur rclone
└── collab-dashboard/        # Source de l'application React (Vite + TypeScript + Tailwind)
    ├── src/
    │   ├── data/tools.ts    # Modèle de données du catalogue de fonctionnalités
    │   ├── components/
    │   │   ├── CardGrid.tsx
    │   │   └── ToolCard.tsx
    │   └── pages/Home.tsx
    ├── package.json
    ├── vite.config.ts
    └── Dockerfile
```

Sept outils utilisent des **charts Helm amont** directement. Quatre outils ont nécessité des **charts personnalisés** car aucun chart Helm de qualité production n'existait :

| Chart personnalisé | Image | Port | Stockage | Auth |
|---|---|---|---|---|---|
| `rstudio` | `rocker/rstudio:4.4.2` | 8787 | PVC 10Gi | oauth2-proxy |
| `ttyd` | `tsl0922/ttyd:1.7.7` | 7681 | — | oauth2-proxy |
| `slidev` | `ghcr.io/slidevjs/slidev:0.49.0` → `nginx:alpine` | 80 | PVC 1Gi | oauth2-proxy |
| `collab-dashboard` | `weissto/collab-dashboard` (construction personnalisée) | 80 | — | oauth2-proxy |

### Ordre de Déploiement

Le helmfile groupe les releases par étape pour respecter les chaînes de dépendance :

| Étape | Releases |
|---|---|
| `010-infra` | ollama (moteur LLM — doit être en cours d'exécution avant Open WebUI) |
| `050-components` | jupyterhub, overleaf, open-webui, rstudio, code-server, ttyd, kasmvnc, dask, slidev |
| `060-frontend` | collab-dashboard (dépend de la disponibilité des services) |

### Architecture d'Authentification Unique

Tous les services s'authentifient via Keycloak en utilisant l'un des deux schémas suivants :

**Schéma 1 : Sidecar oauth2-proxy** — Un proxy inverse sidecar injecté dans le même pod que RStudio, ttyd, Slidev, code-server et le Collab Dashboard. Le sidecar intercepte tout le trafic HTTP entrant sur le port 4180, redirige les utilisateurs non authentifiés vers le point de terminaison OIDC de Keycloak, et proxyfie les requêtes authentifiées vers le conteneur d'application sur son port local.

**Schéma 2 : OIDC natif** — JupyterHub utilise [OAuthenticator](https://oauthenticator.readthedocs.io/) avec la classe GenericOAuthenticator, et Open WebUI a un support OIDC intégré. Les deux pointent directement vers les points de terminaison OIDC standard de Keycloak (`/realms/opendesk/protocol/openid-connect/...`).

Dans l'environnement de production de l'Université Philipps de Marbourg, Keycloak est configuré avec un redirecteur de fournisseur d'identité qui redirige automatiquement vers Shibboleth SAML. Le résultat est une chaîne d'authentification transparente :

```
Utilisateur → Service (ex. RStudio)
  → oauth2-proxy redirige vers Keycloak
    → Keycloak redirige automatiquement vers Shibboleth SAML
      → Connexion universitaire (weblogin.uni-marburg.de)
        → Assertion SAML → Jeton OIDC Keycloak
          → Accès authentifié à RStudio
```

Les utilisateurs s'authentifient une fois avec leurs identifiants universitaires et accèdent aux 11 outils sans réauthentification.

### Intégration du Stockage OpenCloud

RStudio a également reçu un sidecar OpenCloud WebDAV. Le sidecar utilise `rclone` pour monter les fichiers OpenCloud de l'utilisateur dans l'espace de travail RStudio, donnant aux utilisateurs de R un accès direct à leur stockage de synchronisation de fichiers depuis l'IDE :

```yaml
opencloud:
  enabled: true
  url: "https://opencloud.example.com"
  username: "demo"
  password: "demo"
  syncInterval: "60s"
```

Le même schéma `opencloud-sidecar` est prévu pour code-server et ttyd.

### Le Collab Dashboard

Une SPA React personnalisée — construite avec Vite, TypeScript et Tailwind CSS — se trouve à `collab.*` et sert de catalogue de fonctionnalités. Elle fait correspondre chaque fonctionnalité de CoCalc à son alternative open-source native Kubernetes :

```typescript
export const tools: CollabTool[] = [
  {
    id: 'jupyterhub',
    name: 'JupyterHub',
    description: 'Carnets multi-utilisateurs avec noyaux Python, R, Julia, SageMath et Octave.',
    coCalcFeature: '↔ Jupyter Notebooks',
    category: 'computing',
    status: 'stable',
  },
  {
    id: 'overleaf',
    name: 'Overleaf CE',
    coCalcFeature: '↔ LaTeX collaboratif',
    category: 'editing',
    status: 'stable',
  },
  // ... 9 autres outils
];
```

Le dashboard est servi par un conteneur nginx et protégé derrière le même sidecar oauth2-proxy, garantissant que seuls les utilisateurs authentifiés peuvent parcourir le catalogue de services.

## Comment Déployer

Collab Services fait partie de la branche `main` sur Codeberg. Déployez-le aux côtés du reste d'openDesk Edu avec les sélecteurs Helmfile :

```bash
# Déployer un seul outil
helmfile -e prod apply --selector name=rstudio

# Déployer d'abord le moteur LLM, puis l'interface IA
helmfile -e prod apply --selector name=ollama
helmfile -e prod apply --selector name=open-webui

# Tout déployer en une fois
helmfile -e prod apply
```

Pour les déploiements autonomes en dehors de l'orchestration Helmfile, chaque chart personnalisé prend en charge les installations Helm directes :

```bash
helm upgrade --install rstudio ./helmfile/charts/rstudio \
  --namespace opendesk-edu \
  --set ingress.hosts[0].host=r.${DOMAIN} \
  --set oauth2.enabled=true \
  --set oauth2.clientSecret=${CLIENT_SECRET} \
  --set oauth2.cookieSecret=$(openssl rand -hex 16) \
  --set oauth2.oidcIssuerUrl=https://id.${DOMAIN}/realms/opendesk
```

Pour JupyterHub avec OIDC natif :

```bash
helm upgrade --install jupyterhub jupyterhub/jupyterhub \
  --namespace opendesk-edu \
  --set ingress.enabled=true \
  --set ingress.hosts[0]=jupyter.${DOMAIN} \
  --set hub.config.GenericOAuthenticator.client_id=opendesk-jupyterhub \
  --set hub.config.GenericOAuthenticator.client_secret=${JH_CLIENT_SECRET} \
  --set hub.config.GenericOAuthenticator.oauth_callback_url=https://jupyter.${DOMAIN}/hub/oauth_callback \
  --set hub.config.GenericOAuthenticator.authorize_url=https://id.${DOMAIN}/realms/opendesk/protocol/openid-connect/auth
```

Les clients OIDC Keycloak doivent être créés pour chaque service avant d'activer l'authentification. Voir le [guide de configuration OAuth2-proxy](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/oauth2-proxy-config.md) pour plus de détails.

## Vérification

Un script de test de vérification (`scripts/smoke-test.sh`) vérifie que tous les services répondent correctement. Résultats réels du cluster HRZ de l'Université de Marburg le 28 mai 2026 :

```
=== Test de Vérification Collab Services ===
Domaine : opendesk.hrz.uni-marburg.de | Ingress : 192.168.3.201

  ✅ RStudio (r) → HTTP 302
  ✅ ttyd (term) → HTTP 302
  ✅ Dashboard (collab) → HTTP 302
  ✅ Slidev (slides) → HTTP 200
  ✅ Open WebUI (ai) → HTTP 200
  ✅ JupyterHub (jupyter) → HTTP 302
  ✅ code-server (code) → HTTP 302

  Plus services existants :
  ✅ ILIAS (lms) → HTTP 200
  ✅ Moodle (moodle) → HTTP 200

✅ Test de vérification terminé — les 9 services sont opérationnels
```

Les cinq charts personnalisés réussissent en outre des tests de connectivité Helm dédiés utilisant `nc -z` (sondage de port TCP) :

```bash
$ helm test rstudio -n opendesk-edu          → ✅ Réussi
$ helm test ttyd -n opendesk-edu             → ✅ Réussi
$ helm test slidev -n opendesk-edu           → ✅ Réussi
$ helm test collab-dashboard -n opendesk-edu → ✅ Réussi
$ helm test code-server -n opendesk-edu      → ✅ Réussi
```

## Prochaines Étapes : Phases B et C

Collab Services est prévu en trois phases. La Phase A (Fondation) est terminée. Deux autres phases sont sur la feuille de route.

**Phase B — Affinage des Outils Principaux**
- Profils JupyterHub complets pour les noyaux SageMath, Octave et Julia via les profils d'image singleuser
- Overleaf CE avec stockage persistant et réglage de la collaboration en temps réel
- Intégration plus profonde Open WebUI + Ollama avec gestion de modèles via l'API Ollama
- Réglage des valeurs de production basé sur les retours des utilisateurs pilotes

**Phase C — Outils Restants et Polish**
- KasmVNC et Dask avec configuration complète prête pour la production
- Tuiles de portail dans la navigation Nubus pour les 11 services
- Pages de détail des fonctionnalités dans le tableau de bord React (routes par outil avec documentation)
- Déploiement du sidecar OpenCloud vers code-server et ttyd
- Recommandations de quota de ressources pour chaque outil

## Contribuer

Collab Services est open-source (Apache 2.0) et fait partie du dépôt [opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu) sur Codeberg. Le dépôt est mis en miroir de manière bidirectionnelle vers [GitHub](https://github.com/opendesk-edu/opendesk-edu).

**Liens utiles :**

- [Guide de déploiement](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/collab-services-deployment.md) — instructions pas à pas pour chaque outil
- [Spécification de conception](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/superpowers/specs/2026-05-27-collab-services-design.md) — architecture complète et carte des fonctionnalités CoCalc
- [Configuration OAuth2-proxy](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/oauth2-proxy-config.md) — configuration client Keycloak pour chaque service
- [Plan d'implémentation](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/superpowers/plans/2026-05-27-collab-services-phase-a.md) — ventilation détaillée des tâches pour la Phase A

**Déployez aujourd'hui :**

```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
cd opendesk-edu
helmfile -e prod apply --selector name=jupyterhub
```

Les questions, rapports de bogues et contributions sont les bienvenus via [Codeberg Issues](https://codeberg.org/opendesk-edu/opendesk-edu/issues) ou le [canal Matrix](https://matrix.to/#/#opendesk-ce-public:matrix.uni-marburg.de).

---

*openDesk Edu est une plateforme de travail numérique open-source pour l'enseignement supérieur. Elle étend [openDesk Community Edition](https://www.opencode.de/en/opendesk) avec la gestion de l'apprentissage, la visioconférence, la synchronisation de fichiers et désormais des outils de calcul scientifique — le tout sur Kubernetes avec authentification unique unifiée. Sous licence Apache 2.0.*

*Ce projet est développé au [Hochschulrechenzentrum (HRZ)](https://www.uni-marburg.de/en/hrz) de l'Université Philipps de Marburg dans le cadre de la stratégie de souveraineté numérique de l'université.*
