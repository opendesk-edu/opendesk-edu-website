---
title: "KasmVNC"
date: "2026-05-29"
description: "Full Linux desktop environment in the browser with near-native performance."
categories: ["infrastructure", "scientific-computing", "beta"]
tags: ["kasmvnc", "desktop", "vnc", "remote-access", "scientific-computing"]
version: "1.16"
---

# KasmVNC

KasmVNC delivers a full Linux desktop environment directly in the browser using WebAssembly-based streaming. It provides students and researchers with access to GUI applications, development tools, and scientific software that requires a desktop environment, all without installing anything on the client device.

## Key Features

- **Full desktop in browser**: Stream a complete Linux desktop (XFCE) with near-native performance.
- **GPU acceleration**: WebGL support for 3D visualization and GPU-accelerated applications.
- **Pre-configured workspaces**: Desktop images pre-loaded with scientific tools and IDEs.
- **Clipboard and file transfer**: Bidirectional clipboard and file upload/download between client and desktop.
- **Audio support**: Stream audio from the remote desktop to the browser.

## Integration with openDesk Edu

KasmVNC is part of the Collab Services suite and deploys via its upstream Helm chart (`registry.kasmweb.com`). It authenticates through Keycloak using an oauth2-proxy sidecar and is accessible at `desktop.*` under the institution's wildcard DNS.

## Learn More

- [Official Documentation](https://kasmweb.com/) — KasmVNC docs and resources
