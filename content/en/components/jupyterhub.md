---
title: "JupyterHub"
date: "2026-05-29"
description: "Multi-user Jupyter notebook server with kernels for Python, R, Julia, SageMath, and Octave."
categories: ["scientific-computing", "research"]
tags: ["jupyter", "notebooks", "python", "r", "julia", "scientific-computing"]
version: "5.2"
---

# JupyterHub

JupyterHub is a multi-user Jupyter notebook server that provides interactive computing environments for students and researchers. It supports kernels for Python, R, Julia, SageMath, and GNU Octave, making it a versatile platform for data science, scientific computing, and teaching.

## Key Features

- **Multi-kernel support**: Python, R, Julia, SageMath, and GNU Octave kernels available out of the box.
- **User isolation**: Each user gets their own dedicated notebook server with isolated environments.
- **Native OIDC authentication**: Integrates with Keycloak via OAuthenticator for seamless single sign-on.
- **Scalable architecture**: Spawns user pods on demand with configurable resource limits.
- **Persistent storage**: User notebooks and data persist across sessions via PVC mounts.

## Integration with openDesk Edu

JupyterHub is part of the Collab Services suite and deploys via its upstream Helm chart (`hub.jupyter.org`). It authenticates through Keycloak using native OIDC (OAuthenticator GenericOAuthenticator) and is accessible at `jupyter.*` under the institution's wildcard DNS. Users access their notebooks directly from the unified Nubus portal.

## Learn More

- [Official Documentation](https://jupyter.org/hub) — JupyterHub docs and resources
- [OAuthenticator](https://oauthenticator.readthedocs.io/) — OIDC authentication configuration
