---
title: "JupyterHub"
date: "2026-05-29"
description: "Mehrbenutzer-Jupyter-Notebook-Server mit Kernels für Python, R, Julia, SageMath und Octave."
categories: ["wissenschaftliches-rechnen", "forschung"]
tags: ["jupyter", "notebooks", "python", "r", "julia", "wissenschaftliches-rechnen"]
version: "5.2"
---

# JupyterHub

JupyterHub ist ein Mehrbenutzer-Jupyter-Notebook-Server, der interaktive Rechenumgebungen für Studierende und Forschende bereitstellt. Er unterstützt Kernels für Python, R, Julia, SageMath und GNU Octave und ist damit eine vielseitige Plattform für Datenwissenschaft, wissenschaftliches Rechnen und Lehre.

## Hauptfunktionen

- **Multi-Kernel-Unterstützung**: Python-, R-, Julia-, SageMath- und GNU-Octave-Kernels sind sofort verfügbar.
- **Benutzerisolierung**: Jeder Benutzer erhält einen eigenen dedizierten Notebook-Server mit isolierten Umgebungen.
- **Native OIDC-Authentifizierung**: Integration mit Keycloak über OAuthenticator für nahtloses Single Sign-On.
- **Skalierbare Architektur**: Benutzer-Pods werden bedarfsorientiert mit konfigurierbaren Ressourcengrenzen gestartet.
- **Persistenter Speicher**: Benutzer-Notebooks und Daten bleiben über PVC-Mounts hinweg sitzungsübergreifend erhalten.

## Integration mit openDesk Edu

JupyterHub ist Teil der Collab Services Suite und wird über das zugehörige upstream Helm-Chart (`hub.jupyter.org`) bereitgestellt. Die Authentifizierung erfolgt über Keycloak mittels nativem OIDC (OAuthenticator GenericOAuthenticator) und ist unter `jupyter.*` des institutionellen Wildcard-DNS erreichbar. Benutzer greifen direkt über das einheitliche Nubus-Portal auf ihre Notebooks zu.

## Mehr erfahren

- [Offizielle Dokumentation](https://jupyter.org/hub) — JupyterHub-Dokumentation und Ressourcen
- [OAuthenticator](https://oauthenticator.readthedocs.io/) — OIDC-Authentifizierungskonfiguration
