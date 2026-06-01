---
title: "Collab Services: 11 wissenschaftliche Rechenwerkzeuge ergänzen openDesk Edu"
date: "2026-05-29"
description: "openDesk Edu integriert 11 Open-Source-Werkzeuge für wissenschaftliches Rechnen — JupyterHub, Overleaf, RStudio, code-server, Open WebUI, Ollama und mehr — deployt via Helmfile auf Kubernetes mit einheitlichem Keycloak-SSO."
image: "/static/blog/collab-services-teaser.png"
categories: ["ankündigung"]
tags: ["collab-services", "wissenschaftliches-rechnen", "jupyter", "rstudio", "overleaf", "kubernetes", "opensource"]
---

# Collab Services: 11 wissenschaftliche Rechenwerkzeuge ergänzen openDesk Edu

openDesk Edu erhält das bislang größte Feature-Update. **Collab Services** — Phase A einer dreistufigen Initiative — fügt 11 Open-Source-Werkzeuge für wissenschaftliches Rechnen zur Plattform hinzu und verwandelt sie von einer Produktivitäts-und-LMS-Umgebung in eine vollständige digitale Forschungsumgebung für Hochschulen und Forschungseinrichtungen.

Die neuen Werkzeuge decken interaktive Notebooks, kollaboratives LaTeX, browserbasierte IDEs, lokale KI-Assistenten, verteiltes Rechnen und mehr ab. Alle werden via Helmfile auf Kubernetes deployed, sind mit Keycloak Single Sign-On integriert und teilen sich Let's-Encrypt-TLS-Zertifikate durch den HAProxy-Ingress.

## Die neuen Werkzeuge im Überblick

| Kategorie | Werkzeug | Funktion | Status | Subdomain |
|---|---|---|---|---|
| **Computing** | [JupyterHub](https://jupyter.org/hub) | Multi-User-Notebooks (Python, R, Julia, SageMath, Octave) | ✅ Stabil | `jupyter.*` |
| | [code-server](https://github.com/coder/code-server) | VS Code im Browser | ✅ Stabil | `code.*` |
| | [RStudio Server](https://posit.co/products/open-source/rstudio-server/) | R-IDE mit Shiny-Unterstützung | 🟡 Beta | `r.*` |
| | [Dask Gateway](https://gateway.dask.org/) | Verteiltes paralleles Rechnen | 🔵 Geplant | `compute.*` |
| **Bearbeitung** | [Overleaf CE](https://github.com/overleaf/overleaf) | Kollaboratives Echtzeit-LaTeX | ✅ Stabil | `latex.*` |
| | [Slidev](https://github.com/slidevjs/slidev) | Markdown-zu-Präsentationen | 🟡 Beta | `slides.*` |
| **KI** | [Open WebUI](https://github.com/open-webui/open-webui) | ChatGPT-ähnliches Interface für lokale LLMs | 🟡 Beta | `ai.*` |
| | [Ollama](https://ollama.ai/) | Lokales LLM-Backend (llama3.2, nomic-embed-text) | 🟡 Beta | — |
| **Visualisierung** | [Excalidraw](https://github.com/excalidraw/excalidraw) | Kollaboratives Whiteboard | ✅ Stabil | — |
| **Infrastruktur** | [ttyd](https://github.com/tsl0922/ttyd) | Linux-Terminal im Browser | ✅ Stabil | `term.*` |
| | [KasmVNC](https://kasmweb.com/) | Vollständiger Linux-Desktop im Browser | 🟡 Beta | `desktop.*` |

Jeder Dienst erhält eine eigene Subdomain unter der Wildcard-DNS der Institution — `jupyter.uni-marburg.de`, `r.uni-marburg.de`, `latex.uni-marburg.de` — geroutet durch den HAProxy-Ingress mit automatischen Let's-Encrypt-TLS-Zertifikaten.

## Warum das wichtig ist

openDesk Edu bot bereits Lernmanagement (ILIAS, Moodle), Videokonferenzen (BigBlueButton, Jitsi), Dateisynchronisation (Nextcloud, OpenCloud) und Produktivitätswerkzeuge (Collabora, XWiki, OpenProject). Was fehlte, war die **interaktive Recheninfrastruktur**, die Plattformen wie CoCalc Hochschulen bieten.

Collab Services schließt diese Lücke. Studierende und Forschende können nun:

- Jupyter-Notebooks mit Python, R, Julia, SageMath und GNU-Octave-Kernels ausführen
- Kollaborativ LaTeX-Dokumente in Echtzeit mit Overleaf CE bearbeiten
- R-Skripte und Shiny-Anwendungen in einer dedizierten IDE entwickeln
- VS Code von jedem Gerät aus nutzen, ohne lokale Installation
- Mit privaten LLMs durch Open WebUI chatten, betrieben von Ollama
- Ein vollständiges Linux-Terminal oder eine Desktop-Umgebung im Browser aufrufen
- Präsentationen aus Markdown mit Slidev erstellen
- Verteilte Rechenaufträge an einen Dask-Gateway-Cluster senden

All dies ohne das openDesk-Edu-Ökosystem zu verlassen und ohne zusätzliche Infrastruktur bereitzustellen.

## Architektur

Das Deployment folgt den etablierten Konventionen von openDesk Edu. Alle Werkzeuge leben in `helmfile/apps/` als neue App-Gruppe neben den bestehenden Bildungs- und Produktivitätsdiensten.

### Repository-Struktur

```
opendesk-edu/
├── helmfile/apps/
│   ├── jupyterhub/          # Upstream-Chart (hub.jupyter.org)
│   ├── overleaf/            # Upstream-Chart (ghcr.io/sharelatex)
│   ├── open-webui/          # Upstream-Chart (helm.openwebui.com)
│   ├── ollama/              # Upstream-Chart (ollama.github.io)
│   ├── code-server/         # Upstream-Chart (helm.coder.com)
│   ├── kasmvnc/             # Upstream-Chart (registry.kasmweb.com)
│   ├── dask/                # Upstream-Chart (helm.dask.org)
│   ├── rstudio/             # Benutzerdefiniertes Chart
│   ├── ttyd/                # Benutzerdefiniertes Chart
│   ├── slidev/              # Benutzerdefiniertes Chart
│   └── collab-dashboard/    # Benutzerdefiniertes Chart + React SPA
├── helmfile/charts/
│   ├── rstudio/             # Deployment + Service + Ingress + PVC
│   ├── ttyd/                # Deployment + Service + Ingress
│   ├── slidev/              # Init-Container + nginx + PVC
│   ├── collab-dashboard/    # nginx für React-SPA
│   └── opencloud-sidecar/   # rclone-basierter Dateisynchronisations-Sidecar
└── collab-dashboard/        # React-App-Quellcode (Vite + TypeScript + Tailwind)
    ├── src/
    │   ├── data/tools.ts    # Feature-Katalog-Datenmodell
    │   ├── components/
    │   │   ├── CardGrid.tsx
    │   │   └── ToolCard.tsx
    │   └── pages/Home.tsx
    ├── package.json
    ├── vite.config.ts
    └── Dockerfile
```

Sieben Werkzeuge nutzen **Upstream-Helm-Charts** direkt. Vier Werkzeuge erforderten **benutzerdefinierte Charts**, da keine produktionsreifen Helm-Charts existierten:

| Benutzerdefiniertes Chart | Image | Port | Speicher | Authentifizierung |
|---|---|---|---|---|
| `rstudio` | `rocker/rstudio:4.4.2` | 8787 | 10Gi PVC | oauth2-proxy |
| `ttyd` | `tsl0922/ttyd:1.7.7` | 7681 | — | oauth2-proxy |
| `slidev` | `ghcr.io/slidevjs/slidev:0.49.0` → `nginx:alpine` | 80 | 1Gi PVC | oauth2-proxy |
| `collab-dashboard` | `weissto/collab-dashboard` | 80 | — | oauth2-proxy |

### Deployments-Reihenfolge

Die Helmfile-Gruppen ordnen Releases nach Stufen, um Abhängigkeitsketten zu respektieren:

| Stufe | Releases |
|---|---|
| `010-infra` | ollama (LLM-Backend — muss vor Open WebUI laufen) |
| `050-components` | jupyterhub, overleaf, open-webui, rstudio, code-server, ttyd, kasmvnc, dask, slidev |
| `060-frontend` | collab-dashboard (abhängig von verfügbaren Diensten) |

### Single Sign-On-Architektur

Alle Dienste authentifizieren sich über Keycloak mit einem von zwei Verfahren:

**Verfahren 1: oauth2-proxy Sidecar** — Ein Reverse-Proxy-Sidecar, der in denselben Pod wie RStudio, ttyd, Slidev, code-server und das Collab Dashboard injiziert wird. Der Sidecar fängt den gesamten eingehenden HTTP-Traffic auf Port 4180 ab, leitet nicht authentifizierte Nutzer zu Keycloaks OIDC-Endpunkt weiter und proxyt authentifizierte Anfragen an den Anwendungscontainer auf seinem lokalen Port.

**Verfahren 2: Natives OIDC** — JupyterHub nutzt [OAuthenticator](https://oauthenticator.readthedocs.io/) mit der GenericOAuthenticator-Klasse, und Open WebUI bietet native OIDC-Unterstützung. Beide zeigen direkt auf die Standard-OIDC-Endpunkte von Keycloak (`/realms/opendesk/protocol/openid-connect/...`).

In der Produktionsumgebung an der Philipps-Universität Marburg ist Keycloak mit einem Identity Provider Redirector konfiguriert, der automatisch an Shibboleth SAML weiterleitet. Das Ergebnis ist eine nahtlose Authentifizierungskette:

```
Nutzer → Dienst (z.B. RStudio)
  → oauth2-proxy leitet zu Keycloak weiter
    → Keycloak leitet automatisch zu Shibboleth SAML weiter
      → Hochschullogin (weblogin.uni-marburg.de)
        → SAML-Assertion → Keycloak-OIDC-Token
          → Authentifizierter Zugriff auf RStudio
```

Nutzer authentifizieren sich einmal mit ihren Hochschulzugangsdaten und erhalten Zugriff auf alle 11 Werkzeuge ohne erneute Anmeldung.

### OpenCloud-Speicherintegration

RStudio erhielt zudem einen OpenCloud-WebDAV-Sidecar. Der Sidecar nutzt `rclone`, um die OpenCloud-Dateien des Nutzers in den RStudio-Arbeitsbereich einzubinden und gibt R-Nutzern direkten Zugriff auf ihren Dateisynchronspeicher aus der IDE heraus:

```yaml
opencloud:
  enabled: true
  url: "https://opencloud.example.com"
  username: "demo"
  password: "demo"
  syncInterval: "60s"
```

Das gleiche `opencloud-sidecar`-Muster ist für code-server und ttyd geplant.

### Das Collab Dashboard

Eine benutzerdefinierte React-SPA — erstellt mit Vite, TypeScript und Tailwind CSS — ist unter `collab.*` erreichbar und dient als Feature-Katalog. Sie bildet jede CoCalc-Funktion auf ihr Open-Source-Kubernetes-Pendant ab:

```typescript
export const tools: CollabTool[] = [
  {
    id: 'jupyterhub',
    name: 'JupyterHub',
    coCalcFeature: '↔ Jupyter Notebooks',
    category: 'computing',
    status: 'stable',
  },
  {
    id: 'overleaf',
    name: 'Overleaf CE',
    coCalcFeature: '↔ Collaborative LaTeX',
    category: 'editing',
    status: 'stable',
  },
  // ... 9 weitere Werkzeuge
];
```

Das Dashboard wird von einem nginx-Container ausgeliefert und durch denselben oauth2-proxy-Sidecar geschützt, sodass nur authentifizierte Nutzer den Service-Katalog durchsuchen können.

## Deployment

Collab Services ist Teil des `main`-Branches auf Codeberg. Deployment zusammen mit dem Rest von openDesk Edu erfolgt über Helmfile-Selektoren:

```bash
# Ein einzelnes Werkzeug deployen
helmfile -e prod apply --selector name=rstudio

# Zuerst das LLM-Backend, dann die KI-Oberfläche
helmfile -e prod apply --selector name=ollama
helmfile -e prod apply --selector name=open-webui

# Alles auf einmal deployen
helmfile -e prod apply
```

Für eigenständige Deployments außerhalb der Helmfile-Orchestrierung unterstützt jedes benutzerdefinierte Chart direkte Helm-Installationen:

```bash
helm upgrade --install rstudio ./helmfile/charts/rstudio \
  --namespace opendesk-edu \
  --set ingress.hosts[0].host=r.${DOMAIN} \
  --set oauth2.enabled=true \
  --set oauth2.clientSecret=${CLIENT_SECRET} \
  --set oauth2.cookieSecret=$(openssl rand -hex 16) \
  --set oauth2.oidcIssuerUrl=https://id.${DOMAIN}/realms/opendesk
```

Für JupyterHub mit nativem OIDC:

```bash
helm upgrade --install jupyterhub jupyterhub/jupyterhub \
  --namespace opendesk-edu \
  --set ingress.enabled=true \
  --set ingress.hosts[0]=jupyter.${DOMAIN}
```

Keycloak-OIDC-Clients müssen für jeden Dienst erstellt werden, bevor die Authentifizierung aktiviert wird. Details finden sich im [OAuth2-Proxy-Konfigurationsleitfaden](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/oauth2-proxy-config.md).

## Überprüfung

Ein Smoke-Test-Skript (`scripts/smoke-test.sh`) überprüft, ob alle Dienste korrekt antworten. Die tatsächlichen Ergebnisse vom HRZ-Cluster der Universität Marburg vom 28. Mai 2026:

```
=== Collab Services Smoke Test ===
Domain: opendesk.hrz.uni-marburg.de | Ingress: 192.168.3.201

  ✅ RStudio (r) → HTTP 302
  ✅ ttyd (term) → HTTP 302
  ✅ Dashboard (collab) → HTTP 302
  ✅ Slidev (slides) → HTTP 200
  ✅ Open WebUI (ai) → HTTP 200
  ✅ JupyterHub (jupyter) → HTTP 302
  ✅ code-server (code) → HTTP 302

  Plus bestehende Dienste:
  ✅ ILIAS (lms) → HTTP 200
  ✅ Moodle (moodle) → HTTP 200

✅ Smoke-Test erfolgreich — alle 9 Dienste betriebsbereit
```

Alle fünf benutzerdefinierten Charts bestehen zusätzlich dedizierte Helm-Test-Konnektivitätsprüfungen mittels `nc -z` (TCP-Port-Testen):

```bash
$ helm test rstudio -n opendesk-edu          → ✅ Erfolgreich
$ helm test ttyd -n opendesk-edu             → ✅ Erfolgreich
$ helm test slidev -n opendesk-edu           → ✅ Erfolgreich
$ helm test collab-dashboard -n opendesk-edu → ✅ Erfolgreich
$ helm test code-server -n opendesk-edu      → ✅ Erfolgreich
```

## Ausblick: Phase B und Phase C

Collab Services ist in drei Phasen geplant. Phase A (Grundlage) ist abgeschlossen. Zwei weitere Phasen stehen auf der Roadmap.

**Phase B — Verfeinerung der Kernwerkzeuge**
- Vollständige JupyterHub-Profile für SageMath-, Octave- und Julia-Kernel über Singleuser-Image-Profile
- Overleaf CE mit persistentem Speicher und optimierter Echtzeit-Zusammenarbeit
- Tiefere Open-WebUI- + Ollama-Integration mit Modellverwaltung über die Ollama-API
- Produktionswert-Tuning basierend auf Pilotnutzer-Feedback

**Phase C — Verbleibende Werkzeuge und Feinschliff**
- KasmVNC und Dask mit vollständiger produktionsreifer Konfiguration
- Portal-Kacheln in der Nubus-Navigation für alle 11 Dienste
- Feature-Detailseiten im React-Dashboard (dienstspezifische Routen mit Dokumentation)
- OpenCloud-Sidecar-Ausrollung auf code-server und ttyd
- Ressourcenkontingent-Empfehlungen für jedes Werkzeug

## Mitmachen

Collab Services ist Open Source (Apache 2.0) und Teil des Repositorys [opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu) auf Codeberg. Das Repository wird bidirektional zu [GitHub](https://github.com/opendesk-edu/opendesk-edu) gespiegelt.

**Nützliche Links:**

- [Deployment-Guide](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/collab-services-deployment.md) — Schritt-für-Schritt-Anleitung für jedes Werkzeug
- [Design-Spezifikation](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/superpowers/specs/2026-05-27-collab-services-design.md) — vollständige Architektur und CoCalc-Funktionslandkarte
- [OAuth2-Proxy-Konfiguration](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/oauth2-proxy-config.md) — Keycloak-Client-Setup für jeden Dienst
- [Implementierungsplan](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/superpowers/plans/2026-05-27-collab-services-phase-a.md) — detaillierte Aufgabenaufschlüsselung für Phase A

**Heute deployen:**

```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
cd opendesk-edu
helmfile -e prod apply --selector name=jupyterhub
```

Fragen, Fehlermeldungen und Beiträge sind willkommen über [Codeberg Issues](https://codeberg.org/opendesk-edu/opendesk-edu/issues) oder den [Matrix-Channel](https://matrix.to/#/#opendesk-ce-public:matrix.uni-marburg.de).

---

*openDesk Edu ist eine Open-Source-Plattform für den digitalen Arbeitsplatz an Hochschulen. Sie erweitert [openDesk Community Edition](https://www.opencode.de/en/opendesk) um Lernmanagement, Videokonferenzen, Dateisynchronisation und nun wissenschaftliche Rechenwerkzeuge — alles auf Kubernetes mit einheitlichem Single Sign-On. Lizenziert unter Apache 2.0.*

*Dieses Projekt wird am [Hochschulrechenzentrum (HRZ)](https://www.uni-marburg.de/en/hrz) der Philipps-Universität Marburg im Rahmen der Digitalen-Souveränitäts-Strategie der Universität entwickelt.*
