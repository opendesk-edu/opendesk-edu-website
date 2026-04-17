---
title: "Element"
date: "2026-04-17"
description: "Matrix-based chat with Nordeck education widgets for real-time messaging, rooms, and file sharing."
categories: ["communication", "base"]
tags: ["element", "matrix", "chat", "messaging"]
---

# Element

Element is a Matrix-based chat client powered by the Element Web frontend with Nordeck widgets tailored for education. It provides real-time messaging, threaded conversations, and file sharing within a federated, open protocol. As a base openDesk CE component, it ships stable and production-ready.

## Key Features

- **Real-time messaging**: Instant messaging with read receipts, typing indicators, and message threading.
- **Rooms and channels**: Organize conversations by topic, class, or project with dedicated rooms.
- **File sharing**: Drag-and-drop file uploads with in-line previews for images, PDFs, and documents.
- **Nordeck education widgets**: Interactive widgets for polls, quizzes, and collaborative activities within chat rooms.
- **Federation support**: Connect with other Matrix servers for cross-organization communication.

## Integration with openDesk Edu

Element integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users access the chat directly from the unified Nubus portal with a single sign-on experience. It deploys as a modular Helm chart alongside the Synapse Matrix homeserver. Persistent message data is backed up through k8up.
