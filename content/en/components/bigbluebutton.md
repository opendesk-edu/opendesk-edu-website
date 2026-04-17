---
title: "BigBlueButton"
date: "2026-03-27"
description: "Virtual classroom platform with recording, whiteboard, breakout rooms, and polling for lecture-style teaching."
categories: ["education", "communication", "beta"]
tags: ["bigbluebutton", "lectures", "virtual-classroom", "video-conferencing", "alternative"]
---

# BigBlueButton

BigBlueButton is a virtual classroom platform built specifically for online lectures and teaching. It provides recording, an interactive whiteboard, breakout rooms, polling, and screen sharing in a single session. BigBlueButton is an education-specific Beta component in openDesk Edu and serves as an alternative to Jitsi for lecture-style teaching.

## Key Features

- **Session recording**: Record entire lectures including audio, video, whiteboard, and chat for later playback.
- **Interactive whiteboard**: Multi-user whiteboard with drawing tools, shapes, and annotation capabilities.
- **Breakout rooms**: Split participants into smaller groups for collaborative exercises.
- **Polling and quizzes**: Run in-session polls and quizzes to gauge student understanding.
- **Presentation upload**: Upload PDF and Office presentations for display within the virtual classroom.

## Integration with openDesk Edu

BigBlueButton integrates with openDesk Edu as a SAML 2.0 service provider using Shibboleth, authenticating users through Keycloak. Users access lectures from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. BigBlueButton is an alternative to Jitsi for institutions that need recording, breakout rooms, and structured lecture features. Persistent recording data is backed up through k8up.

## Learn More

- [Official Documentation](https://docs.bigbluebutton.org) — Official docs and resources

