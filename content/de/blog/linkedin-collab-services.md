---
title: "LinkedIn: Collab Services — Wissenschaftliches Rechnen auf openDesk Edu"
date: "2026-05-29"
description: "LinkedIn-Artikelversion der Collab Services-Ankündigung."
categories: ["linkedin"]
tags: ["opendesk", "wissenschaftliches-rechnen", "kubernetes", "opensource"]
draft: false
---

# Collab Services: Wissenschaftliche Rechenwerkzeuge ergänzen openDesk Edu

Wir haben gerade das größte Update für openDesk Edu seit dem Launch ausgerollt: **Collab Services** — 11 Open-Source-Werkzeuge für wissenschaftliches Rechnen, alle integriert mit Keycloak SSO und bereitstellbar per `helmfile apply`.

**Was ist neu:**
JupyterHub, Overleaf (LaTeX), RStudio Server, code-server (VS Code), Open WebUI + Ollama (lokale KI), ttyd (web terminal), Slidev (Präsentationen), KasmVNC (Linux-Desktop), Dask (verteiltes Rechnen) und Excalidraw (Whiteboard).

**Warum das wichtig ist:**
Hochschulen, die openDesk Edu betreiben, können ihren Studierenden und Forschenden jetzt Jupyter-Notebooks, kollaborative LaTeX-Bearbeitung, browserbasierte IDEs und private KI-Assistenten anbieten — auf eigener Infrastruktur, mit SSO über die bestehende Shibboleth-Föderation (DFN-AAI / eduGAIN).

**Die Architektur:**
- 7 upstream Helm-Charts + 4 benutzerdefinierte Charts
- oauth2-proxy Sidecars für Keycloak SSO
- Natives OIDC für JupyterHub und Open WebUI
- HAProxy-Ingress mit Wildcard-TLS
- OpenCloud-Speicherintegration für RStudio

**Verifiziert:** Alle 9 Dienste bestehen Smoke-Tests, alle 5 benutzerdefinierten Charts bestehen Helm-Konnektivitätstests.

**Teste es:**
```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
helmfile -e prod apply --selector name=jupyterhub
```

Vollständige Details: https://opendesk-edu.org/de/blog/collab-services-scientific-tools

#OpenSource #Kubernetes #Hochschule #WissenschaftlichesRechnen #DigitaleSouveränität
