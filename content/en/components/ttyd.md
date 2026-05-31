---
title: "ttyd"
date: "2026-05-29"
description: "Browser-based Linux terminal providing full command-line access from any device."
categories: ["infrastructure", "scientific-computing"]
tags: ["ttyd", "terminal", "ssh", "cli", "scientific-computing"]
version: "1.7"
---

# ttyd

ttyd is a lightweight tool that shares a full Linux terminal over the web browser. It provides students and researchers with command-line access to the server environment from any device, enabling SSH access, script execution, and system administration without installing a terminal emulator.

## Key Features

- **Browser-based terminal**: Full xterm-compatible terminal in any modern web browser.
- **No client installation**: Works on Chromebooks, tablets, and restricted devices with just a browser.
- **File access**: Full filesystem access to user storage and shared research data.
- **Clipboard support**: Copy and paste between the local machine and the browser terminal.
- **Session persistence**: Terminal sessions persist across page reloads with tmux integration.

## Integration with openDesk Edu

ttyd is part of the Collab Services suite and deploys via a custom local Helm chart (`helmfile/charts/ttyd`). It authenticates through Keycloak using an oauth2-proxy sidecar and is accessible at `term.*` under the institution's wildcard DNS.

## Learn More

- [Official Documentation](https://github.com/tsl0922/ttyd) — ttyd docs and resources
