---
title: "Grommunio"
date: "2026-04-17"
description: "Microsoft 365-compatible groupware with ActiveSync 16.1 for native mobile sync."
categories: ["communication", "education", "beta"]
tags: ["grommunio", "groupware", "email", "activesync", "alternative"]
---

# Grommunio

Grommunio is a Microsoft 365-compatible groupware suite that offers email, calendar, contacts, and task management with native ActiveSync 16.1 support for mobile devices. It uses MariaDB as its database backend and targets institutions looking for a drop-in Microsoft Exchange replacement. Grommunio is an education-specific Beta component in openDesk Edu.

## Key Features

- **ActiveSync 16.1**: Full ActiveSync support for native email, calendar, and contact sync on iOS, Android, and desktop clients.
- **Microsoft 365 compatibility**: Works with Outlook, Thunderbird, and other standard mail clients without plugins.
- **Calendar and contacts**: Shared calendaring with free/busy lookup and global address lists.
- **MariaDB backend**: Reliable open-source database for mail and user data storage.
- **Exchange migration path**: Designed to simplify migration from Microsoft Exchange environments.

## Integration with openDesk Edu

Grommunio integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users access mail and calendar from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. Grommunio is an alternative email and groupware option alongside OX App Suite and SOGo. Persistent data stored in MariaDB is backed up through k8up.
