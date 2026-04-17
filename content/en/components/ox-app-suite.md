---
title: "OX App Suite"
date: "2026-03-09"
description: "Full enterprise groupware suite with email, calendar, contacts, and document management."
categories: ["communication", "productivity", "base"]
tags: ["ox-app-suite", "groupware", "email", "calendar"]
---

# OX App Suite

OX App Suite is a full enterprise groupware suite providing email, calendar, contacts, and document management in a single web interface. It is the default groupware option in openDesk Edu, built for organizations that need a comprehensive messaging and scheduling platform. As a base openDesk CE component, it ships stable and production-ready.

## Key Features

- **Email**: Full-featured webmail with IMAP/SMTP, folder management, and search.
- **Calendar**: Shared calendars with free/busy lookup, resource booking, and invitation workflows.
- **Contacts**: Shared address books with LDAP integration and contact groups.
- **Document management**: Create, edit, and share documents, spreadsheets, and presentations online.
- **Task management**: Built-in task lists with priorities, due dates, and assignments.

## Integration with openDesk Edu

OX App Suite integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users access email, calendar, and contacts directly from the unified Nubus portal. It deploys as a modular Helm chart and is the default groupware option alongside alternatives like SOGo and Grommunio. Persistent mail and calendar data is backed up through k8up.

## Learn More

- [Official Documentation](https://docs.open-xchange.com) — Official docs and resources
