---
title: "Collab Services: 11 wissenschaftliche Rechenwerkzeuge ergänzen openDesk Edu"
date: "2026-05-29"
description: "openDesk Edu integriert 11 Open-Source-Werkzeuge für wissenschaftliches Rechnen — JupyterHub, Overleaf, RStudio, code-server, Open WebUI, Ollama und mehr — deployt via Helmfile mit Keycloak SSO."
categories: ["ankündigung"]
tags: ["collab-services", "wissenschaftliches-rechnen", "jupyter", "rstudio", "overleaf", "kubernetes"]
---

# Collab Services: 11 wissenschaftliche Rechenwerkzeuge ergänzen openDesk Edu

openDesk Edu erhält das bislang größte Feature-Update. **Collab Services** — Phase A einer dreistufigen Initiative — fügt **11 wissenschaftliche Rechenwerkzeuge** zur openDesk-Edu-Plattform hinzu und verwandelt sie von einer Produktivitäts-und-LMS-Umgebung in eine vollständige digitale Forschungsumgebung für Hochschulen.

Die neuen Werkzeuge umfassen interaktive Notebooks, kollaboratives LaTeX, browserbasierte IDEs, lokale KI-Assistenten, verteiltes Rechnen und mehr — alle integriert mit dem bestehenden Keycloak-SSO und deployt via Helmfile auf Kubernetes.

## Die Werkzeuge im Überblick

| Kategorie | Werkzeug | Funktion | Status |
|---|---|---|---|
| Computing | **JupyterHub** | Multi-User-Notebooks mit Python, R, Julia, SageMath, Octave | Stabil |
| Computing | **code-server** | VS Code im Browser | Stabil |
| Computing | **RStudio Server** | R-IDE mit Shiny-Unterstützung | Beta |
| Computing | **Dask Gateway** | Verteiltes paralleles Rechnen | Geplant |
| Bearbeitung | **Overleaf CE** | Kollaboratives Echtzeit-LaTeX | Stabil |
| Bearbeitung | **Slidev** | Markdown-zu-Präsentationen | Beta |
| KI | **Open WebUI** | ChatGPT-ähnliches Interface für lokale LLMs | Beta |
| KI | **Ollama** | Lokales LLM-Backend (llama3.2, nomic-embed-text) | Beta |
| Visualisierung | **Excalidraw** | Kollaboratives Whiteboard | Stabil |
| Infrastruktur | **ttyd** | Linux-Terminal im Browser | Stabil |
| Infrastruktur | **KasmVNC** | Vollständiger Linux-Desktop im Browser | Beta |

Jedes Werkzeug erhält eine eigene Subdomain — `jupyter.*`, `r.*`, `code.*`, `latex.*`, `ai.*` — und wird durch den HAProxy-Ingress mit automatischen Let's-Encrypt-TLS-Zertifikaten geroutet.

## Warum Collab Services?

openDesk Edu bot bereits Lernmanagement (ILIAS, Moodle), Videokonferenzen (BBB, Jitsi), Dateisynchronisation (Nextcloud, OpenCloud) und Produktivitätswerkzeuge. Was fehlte, war die **interaktive Recheninfrastruktur**, die Plattformen wie CoCalc Hochschulen bieten.

Collab Services schließt diese Lücke. Das Collab Dashboard — eine React-SPA mit Vite, TypeScript und Tailwind CSS — erreicht man unter `collab.*` und bildet jede CoCalc-Funktion auf ihr Open-Source-Kubernetes-Pendant ab.

## Architektur

Das Deployment folgt denselben Konventionen wie alle openDesk-Edu-Komponenten. Sieben Werkzeuge nutzen direkte Upstream-Helm-Charts: JupyterHub, Overleaf, Open WebUI, Ollama, code-server, KasmVNC und Dask. Vier Werkzeuge erforderte benutzerdefinierte Charts — RStudio, ttyd, Slidev und das Collab Dashboard — da keine produktionsreifen Helm-Charts existierten.

### Deploymentsstruktur

```
helmfile/apps/
├── jupyterhub/          # Upstream-Chart
├── overleaf/            # Upstream-Chart
├── open-webui/          # Upstream-Chart
├── ollama/              # Upstream-Chart
├── code-server/         # Upstream-Chart
├── kasmvnc/             # Upstream-Chart
├── dask/                # Upstream-Chart
├── rstudio/             # Eigenes Chart
├── ttyd/                # Eigenes Chart
├── slidev/              # Eigenes Chart
└── collab-dashboard/    # Eigenes Chart + React-SPA
```

### Single Sign-On

Alle Dienste authentifizieren sich über Keycloak mit zwei Verfahren:

- **oauth2-proxy Sidecar** — In die Pods von RStudio, ttyd, Slidev, code-server und dem Collab Dashboard injiziert. Der Sidecar fängt den Traffic ab, leitet nicht authentifizierte Nutzer zu Keycloak weiter und proxyt authentifizierte Anfragen an die Anwendung.

- **Native OIDC** — JupyterHub nutzt OAuthenticator und Open WebUI bietet native OIDC-Unterstützung, beide zeigen direkt auf Keycloaks `/realms/opendesk`-Endpunkte.

In der Produktionsumgebung an der Universität Marburg kettet Keycloak selbst an Shibboleth-SAML — Nutzer authentifizieren sich einmal mit ihren Hochschulzugangsdaten und erhalten Zugriff auf alle Werkzeuge.

```
Nutzer → Dienst (z.B. RStudio)
  → oauth2-proxy leitet zu Keycloak weiter
    → Keycloak leitet automatisch zu Shibboleth SAML weiter
      → Hochschullogin → SAML-Assertion → Keycloak-OIDC-Token
        → Authentifizierter Zugriff auf RStudio
```

### OpenCloud-Speicherintegration

RStudio erhielt zudem eine OpenCloud-WebDAV-Sidecar-Integration, die R-Nutzern direkten Zugriff auf ihren Dateisynchronspeicher aus der IDE heraus gibt. Das gleiche `opencloud-sidecar`-Muster ist für code-server und ttyd geplant.

## Überprüfung

Ein Smoke-Test bestätigt, dass alle Dienste korrekt antworten. Ergebnisse vom HRZ-Cluster vom 28. Mai 2026:

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

Alle fünf benutzerdefinierten Charts bestehen zusätzlich dedizierte Helm-Test-Konnektivitätsprüfungen.

## Selbst Ausprobieren

Collab Services ist Teil des Hauptbranches auf Codeberg. Zum Deployen:

```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
cd opendesk-edu

# Einzelne Werkzeuge deployen
helmfile -e prod apply --selector name=rstudio
helmfile -e prod apply --selector name=jupyterhub
helmfile -e prod apply --selector name=ollama
```

Oder ein einzelnes Werkzeug standalone mit Helm deployen:

```bash
helm upgrade --install rstudio ./helmfile/charts/rstudio \
  --namespace opendesk-edu \
  --set ingress.hosts[0].host=r.ihre-domain.example.com \
  --set oauth2.enabled=true
```

Die vollständige Dokumentation findet sich im [Deployment-Guide](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/collab-services-deployment.md) und im [Design-Spec](https://codeberg.org/opendesk-edu/opendesk-edu/src/branch/main/docs/superpowers/specs/2026-05-27-collab-services-design.md).

## Ausblick

Phase B wird vollständige JupyterHub-Profile für SageMath, Octave und Julia-Kernel, eine verfeinerte Overleaf-CE-Konfiguration mit persistentem Speicher und eine tiefere Open-WebUI- + Ollama-Integration bringen. Phase C fügt KasmVNC und Dask in produktionsreifer Konfiguration, Portal-Tiles für alle 11 Dienste sowie Feature-Detailseiten im React-Dashboard hinzu.

---

*openDesk Edu ist eine Open-Source-Plattform für den digitalen Arbeitsplatz an Hochschulen. Sie erweitert openDesk CE um Lernmanagement, Videokonferenzen, Dateisynchronisation und nun wissenschaftliche Rechenwerkzeuge — alles auf Kubernetes mit einheitlichem SSO. Lizenziert unter Apache-2.0.*

**Repository:** [codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu)
**Website:** [opendesk-edu.org](https://opendesk-edu.org)
