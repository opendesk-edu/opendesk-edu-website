---
title: "Jitsi"
date: "2026-03-13"
description: "Lightweight, browser-based video conferencing for quick meetings without registration."
categories: ["communication", "base"]
tags: ["jitsi", "video-conferencing", "meetings", "webinar"]
---

# Jitsi

Jitsi is a lightweight, browser-based video conferencing platform designed for quick meetings without requiring user registration. It supports screen sharing, chat, and background blur out of the box. As a base openDesk CE component, it is the default video conferencing option and ships production-ready.

## Key Features

- **No registration required**: Start or join meetings instantly from a browser link without creating an account.
- **Screen sharing**: Share your entire screen, a window, or a specific application during meetings.
- **In-meeting chat**: Text chat alongside video with file sharing support.
- **Background blur and effects**: Built-in background processing for privacy and distraction reduction.
- **Dial-in support**: Connect to meetings via telephone using SIP gateway integration.

## Integration with openDesk Edu

Jitsi integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users can launch meetings directly from the unified Nubus portal. It deploys as a modular Helm chart and is the default video conferencing option alongside the Beta alternative BigBlueButton for lecture-style teaching.

## Learn More

- [Official Documentation](https://jitsi.github.io/handbook/docs/intro) — Official docs and resources
