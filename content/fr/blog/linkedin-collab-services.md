---
title: "LinkedIn: Collab Services — Calcul scientifique sur openDesk Edu"
date: "2026-05-29"
description: "Version LinkedIn de l'annonce des Collab Services."
categories: ["linkedin"]
tags: ["opendesk", "calcul-scientifique", "kubernetes", "opensource"]
draft: false
---

# Collab Services : Les outils de calcul scientifique rejoignent openDesk Edu

Nous venons de déployer la plus grande mise à jour d'openDesk Edu depuis son lancement : **Collab Services** — 11 outils open-source de calcul scientifique, tous intégrés avec Keycloak SSO et déployables via une seule commande `helmfile apply`.

**Nouveautés :**
JupyterHub, Overleaf (LaTeX), RStudio Server, code-server (VS Code), Open WebUI + Ollama (IA locale), ttyd (terminal web), Slidev (présentations), KasmVNC (bureau Linux), Dask (calcul distribué) et Excalidraw (tableau blanc).

**Pourquoi c'est important :**
Les universités utilisant openDesk Edu peuvent désormais offrir à leurs étudiants et chercheurs des notebooks Jupyter, l'édition collaborative LaTeX, des IDE dans le navigateur et des assistants IA privés — sur une infrastructure qu'ils contrôlent, avec SSO via leur fédération Shibboleth existante (DFN-AAI / eduGAIN).

**L'architecture :**
- 7 charts Helm upstream + 4 charts personnalisés
- Sidecars oauth2-proxy pour Keycloak SSO
- OIDC natif pour JupyterHub et Open WebUI
- Ingress HAProxy avec TLS wildcard
- Intégration stockage OpenCloud pour RStudio

**Vérifié :** Les 9 services passent les tests de fumée, les 5 charts personnalisés passent les tests de connectivité Helm.

**Essayez-le :**
```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
helmfile -e prod apply --selector name=jupyterhub
```

Détails complets : https://opendesk-edu.org/fr/blog/collab-services-scientific-tools

#OpenSource #Kubernetes #EnseignementSupérieur #CalculScientifique #SouverainetéNumérique
