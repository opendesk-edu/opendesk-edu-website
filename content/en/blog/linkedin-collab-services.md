---
title: "LinkedIn: Collab Services — Scientific Computing on openDesk Edu"
date: "2026-05-29"
description: "LinkedIn article version of the Collab Services announcement."
categories: ["linkedin"]
tags: ["opendesk", "scientific-computing", "kubernetes", "opensource"]
draft: true
---

# Collab Services: Scientific Computing Tools Join openDesk Edu

We just shipped the biggest update to openDesk Edu since its launch: **Collab Services** — 11 open-source scientific computing tools, all integrated with Keycloak SSO and deployable via a single `helmfile apply`.

**What's new:**
JupyterHub, Overleaf (LaTeX), RStudio Server, code-server (VS Code), Open WebUI + Ollama (local AI), ttyd (web terminal), Slidev (presentations), KasmVNC (Linux desktop), Dask (distributed computing), and Excalidraw (whiteboard).

**Why this matters:**
Universities running openDesk Edu can now offer their students and researchers Jupyter notebooks, collaborative LaTeX editing, browser-based IDEs, and private AI assistants — all on infrastructure they control, with SSO through their existing Shibboleth federation (DFN-AAI / eduGAIN).

**The architecture:**
- 7 upstream Helm charts + 4 custom charts
- oauth2-proxy sidecars for Keycloak SSO
- Native OIDC for JupyterHub and Open WebUI
- HAProxy ingress with wildcard TLS
- OpenCloud storage integration for RStudio

**Verified:** All 9 services pass smoke tests, all 5 custom charts pass Helm connectivity checks.

**Try it:**
```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
helmfile -e prod apply --selector name=jupyterhub
```

Full details: https://opendesk-edu.org/en/blog/collab-services-scientific-tools

#OpenSource #Kubernetes #HigherEd #ScientificComputing #DigitalSovereignty
