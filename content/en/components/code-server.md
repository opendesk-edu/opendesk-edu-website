---
title: "code-server"
date: "2026-05-29"
description: "VS Code in the browser — a full-featured browser-based IDE for development and education."
categories: ["scientific-computing", "productivity"]
tags: ["code-server", "vscode", "ide", "development", "scientific-computing"]
version: "4.99"
---

# code-server

code-server brings Microsoft Visual Studio Code to the browser, providing a full-featured IDE that runs entirely on the server. Students and researchers can write, debug, and run code from any device with a web browser, with no local installation required.

## Key Features

- **Full VS Code experience**: All editor features, extensions, themes, and keybindings work in the browser.
- **Extension marketplace**: Install thousands of extensions for language support, linters, debuggers, and themes.
- **Built-in terminal**: Access a server-side terminal directly from the IDE.
- **Git integration**: Full source control with commit, push, pull, and diff operations.
- **Multi-language**: Supports Python, R, Julia, JavaScript, Go, Rust, and hundreds of other languages via extensions.

## Integration with openDesk Edu

code-server is part of the Collab Services suite and deploys via its upstream Helm chart (`helm.coder.com`). It authenticates through Keycloak using an oauth2-proxy sidecar and is accessible at `code.*` under the institution's wildcard DNS.

## Learn More

- [Official Documentation](https://github.com/coder/code-server) — code-server docs and resources
