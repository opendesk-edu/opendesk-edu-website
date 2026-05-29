---
title: "Collab Services: 11 Scientific Computing Tools Join openDesk Edu"
date: "2026-05-29"
description: "openDesk Edu adds 11 open-source scientific computing tools — JupyterHub, Overleaf, RStudio, code-server, Open WebUI, Ollama and more — all deployed via Helmfile with Keycloak SSO."
categories: ["announcement"]
tags: ["collab-services", "scientific-computing", "jupyter", "rstudio", "overleaf", "kubernetes"]
---

# Collab Services: 11 Scientific Computing Tools Join openDesk Edu

openDesk Edu has landed its largest feature update to date. **Collab Services** — Phase A of a three-phase initiative — adds **11 scientific computing tools** to the openDesk Edu platform, transforming it from a productivity-and-LMS system into a full digital research environment for universities.

The new tools cover interactive notebooks, collaborative LaTeX, browser-based IDEs, local AI assistants, distributed computing, and more — all integrated with openDesk Edu's existing Keycloak SSO and deployed via Helmfile on Kubernetes.

## The Tool Lineup

| Category | Tool | What It Does | Status |
|---|---|---|---|
| Computing | **JupyterHub** | Multi-user notebooks with Python, R, Julia, SageMath, Octave | Stable |
| Computing | **code-server** | VS Code in the browser | Stable |
| Computing | **RStudio Server** | R IDE with Shiny app support | Beta |
| Computing | **Dask Gateway** | Distributed parallel computing clusters | Planned |
| Editing | **Overleaf CE** | Collaborative real-time LaTeX | Stable |
| Editing | **Slidev** | Markdown-to-presentations with live preview | Beta |
| AI | **Open WebUI** | ChatGPT-like interface for local LLMs | Beta |
| AI | **Ollama** | Local LLM backend (llama3.2, nomic-embed-text) | Beta |
| Visualisation | **Excalidraw** | Collaborative whiteboard | Stable |
| Infrastructure | **ttyd** | Browser-based Linux terminal | Stable |
| Infrastructure | **KasmVNC** | Full Linux desktop in the browser | Beta |

Each tool gets its own subdomain under the institution's domain — `jupyter.*`, `r.*`, `code.*`, `latex.*`, `ai.*`, and so on — routed through HAProxy ingress with automatic Let's Encrypt TLS.

## Why Collab Services?

openDesk Edu already provided learning management (ILIAS, Moodle), video conferencing (BBB, Jitsi), file sync (Nextcloud, OpenCloud), and productivity tools. But it lacked the **interactive computing** capabilities that platforms like CoCalc offer to universities.

Collab Services closes that gap. The Collab Dashboard — a React SPA built with Vite, TypeScript, and Tailwind CSS — sits at `collab.*` and explicitly maps each CoCalc feature to its open-source Kubernetes-native alternative.

## Architecture

The deployment follows the same conventions as all openDesk Edu components. Seven tools use upstream Helm charts directly: JupyterHub, Overleaf, Open WebUI, Ollama, code-server, KasmVNC, and Dask. Four tools required custom charts — RStudio, ttyd, Slidev, and the Collab Dashboard — because no production-quality Helm charts existed for them.

### Deployment Structure

```
helmfile/apps/
├── jupyterhub/          # Upstream chart
├── overleaf/            # Upstream chart
├── open-webui/          # Upstream chart
├── ollama/              # Upstream chart
├── code-server/         # Upstream chart
├── kasmvnc/             # Upstream chart
├── dask/                # Upstream chart
├── rstudio/             # Custom local chart
├── ttyd/                # Custom local chart
├── slidev/              # Custom local chart
└── collab-dashboard/    # Custom local chart + React SPA
```

### Single Sign-On

All services authenticate through Keycloak using two patterns:

- **oauth2-proxy sidecar** — Injected into RStudio, ttyd, Slidev, code-server, and the Collab Dashboard pods. The sidecar intercepts traffic, redirects unauthenticated users to Keycloak, and proxies authenticated requests to the application.

- **Native OIDC** — JupyterHub uses OAuthenticator and Open WebUI has built-in OIDC support, both pointing directly at Keycloak's `/realms/opendesk` endpoints.

In the production environment at Universität Marburg, Keycloak itself chains through to Shibboleth SAML — users authenticate once with their university credentials and gain access to all tools.

```
User → Service (e.g. RStudio)
  → oauth2-proxy redirects to Keycloak
    → Keycloak auto-redirects to Shibboleth SAML
      → University login → SAML assertion → Keycloak OIDC token
        → Authenticated access to RStudio
```

### OpenCloud Storage Integration

RStudio also received an OpenCloud WebDAV sidecar integration, giving R users direct access to their file sync storage from within the IDE. The same `opencloud-sidecar` pattern is planned for code-server and ttyd.

## Verification

A smoke test script confirms all services respond correctly. Results from the HRZ cluster on 28 May 2026:

```
✅ RStudio (r) → HTTP 302
✅ ttyd (term) → HTTP 302
✅ Dashboard (collab) → HTTP 302
✅ Slidev (slides) → HTTP 200
✅ Open WebUI (ai) → HTTP 200
✅ JupyterHub (jupyter) → HTTP 302
✅ code-server (code) → HTTP 302
✅ ILIAS (lms) → HTTP 200
✅ Moodle (moodle) → HTTP 200
```

All five custom charts additionally pass dedicated Helm test connectivity checks.

## Try It Yourself

Collab Services is part of the main branch on Codeberg. To deploy:

```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
cd opendesk-edu

# Deploy individual tools
helmfile -e prod apply --selector name=rstudio
helmfile -e prod apply --selector name=jupyterhub
helmfile -e prod apply --selector name=ollama
```

Or deploy a single tool standalone with Helm:

```bash
helm upgrade --install rstudio ./helmfile/charts/rstudio \
  --namespace opendesk-edu \
  --set ingress.hosts[0].host=r.your-domain.example.com \
  --set oauth2.enabled=true
```

For full documentation, see the [deployment guide](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/collab-services-deployment.md) and the [design spec](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/superpowers/specs/2026-05-27-collab-services-design.md).

## What's Next

Phase B will add full JupyterHub profiles for SageMath, Octave, and Julia kernels, refined Overleaf CE configuration with persistent storage, and deeper Open WebUI + Ollama integration. Phase C will add KasmVNC and Dask in production-ready configuration, portal tiles for all 11 services, and feature detail pages in the React dashboard.

---

*openDesk Edu is an open-source digital workplace platform for higher education. It extends openDesk CE with learning management, video conferencing, file sync, and now scientific computing tools — all on Kubernetes with unified SSO. Licensed under Apache-2.0.*

**Repository:** [codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu)
**Website:** [opendesk-edu.org](https://opendesk-edu.org)
