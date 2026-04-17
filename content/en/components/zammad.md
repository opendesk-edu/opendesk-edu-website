---
title: "Zammad"
date: "2026-04-06"
description: "Helpdesk and ticketing system with multi-channel support and SAML authentication for IT and student support."
categories: ["education", "communication", "beta"]
tags: ["zammad", "helpdesk", "ticketing", "support"]
---

# Zammad

Zammad is a helpdesk and ticketing system that consolidates support requests from email, chat, phone, and social media into a single interface. It includes workflow automation, knowledge base, and customer self-service features. Zammad is an education-specific Beta component in openDesk Edu.

## Key Features

- **Multi-channel support**: Handle tickets from email, web forms, live chat, telephone, and social media in one place.
- **Workflow automation**: Define triggers and automations for ticket routing, escalation, and status changes.
- **Knowledge base**: Built-in knowledge base for self-service articles and FAQs.
- **SLA management**: Set service level agreements with response and resolution time tracking.
- **Customer portal**: Self-service portal where users can submit and track their own tickets.

## Integration with openDesk Edu

Zammad integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Support staff and users access the helpdesk from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. Persistent ticket data and the knowledge base are backed up through k8up.

## Learn More

- [Official Documentation](https://docs.zammad.org) — Official docs and resources
