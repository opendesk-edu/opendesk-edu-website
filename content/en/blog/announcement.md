---
title: "Announcing openDesk Edu"
date: "2026-04-15"
description: "openDesk Edu brings the openDesk digital workplace to higher education — 25 open-source services, unified SSO, one-command deployment."
categories: ["announcement", "community"]
tags: ["announcement", "opendesk", "education", "open-source"]
---

# Announcing openDesk Edu

We are excited to announce the launch of openDesk Edu, a new project that brings the openDesk digital workplace to higher education institutions. openDesk Edu combines 25 open-source services into a single, cohesive platform with unified single sign-on, SAML federation support, and one-command deployment. Everything is licensed under Apache-2.0 and ready for universities, research institutions, and education networks to adopt and extend.

## What is openDesk Edu?

openDesk Edu builds on top of openDesk Community Edition (CE) and adds 15 education-specific services on top of the existing workplace stack. The result is one platform that covers learning management, video conferencing, real-time collaboration, file sharing, productivity, and more. Instead of stitching together a patchwork of proprietary tools, institutions get a fully open-source digital environment that respects data sovereignty and interoperability standards.

## What's Included

openDesk Edu ships 25 services across several categories:

- **Learning Management** with ILIAS and Moodle, two of the most widely used LMS platforms in European higher education.
- **Video Conferencing** with Jitsi Meet and BigBlueButton, covering both lightweight meetings and full-featured virtual classrooms with whiteboards, breakout rooms, and recording.
- **Collaboration** with Nextcloud for file sync and sharing, Etherpad for real-time collaborative editing, and CryptPad for end-to-end-end encrypted document collaboration.
- **Productivity** with a choice of groupware stacks: Open-Xchange, SOGo, or Grommunio for email and calendaring, paired with Collabora Online for browser-based document editing.
- **Additional tools** including Draw.io for diagramming, Excalidraw for sketching, BookStack for knowledge management, Planka for project boards, Zammad for support tickets, LimeSurvey for assessments, and TYPO3 for institutional websites.

## Key Features

**One-command deployment.** The entire stack deploys via a single `helmfile apply` command onto any Kubernetes cluster. No manual service-by-service setup, no fragile shell scripts. Helmfile orchestrates 25 modular Helm charts with declarative configuration.

**Unified Keycloak SSO.** Every service authenticates through a central Keycloak instance. Users sign in once and access every application without re-entering credentials. Keycloak supports both SAML 2.0 and OpenID Connect, so it integrates cleanly with institutional identity providers.

**DFN-AAI and eduGAIN federation.** openDesk Edu connects to the DFN-AAI infrastructure and the broader eduGAIN federation. Students and staff authenticate using their home institution's credentials, with attributes like affiliation and entitlement mapped automatically.

**Data sovereignty.** All services run on infrastructure you control. No data leaves your cluster unless you configure it to. This matters for institutions subject to GDPR and national data protection regulations.

**Modular architecture.** Not every institution needs all 25 services. The configuration system lets you enable only what your users need. Run just ILIAS and Nextcloud, or deploy the full stack. The choice is yours.

## Education Services in Beta

The 15 services added on top of openDesk CE are released as beta. This means they are functional and tested for basic use cases, but may not yet have the same level of polish and hardening as the core openDesk CE services. We are actively seeking feedback from early adopters.

Beta services include: ILIAS, Moodle, BigBlueButton, OpenCloud (a Nextcloud-based file sharing variant), Grommunio, Etherpad, BookStack, Planka, Zammad, LimeSurvey, LTB SSP, Draw.io, Excalidraw, and TYPO3.

If your institution is interested in testing these services, we would love to hear from you. Bug reports, feature requests, and deployment experiences all help shape the project.

## Get Involved

openDesk Edu is developed in the open, and contributions are welcome. Whether you are a developer, system administrator, educator, or institution looking to adopt open-source digital infrastructure, there are many ways to participate.

The primary development happens on Codeberg:

[https://codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu)

A GitHub mirror is available as well:

[https://github.com/opendesk-edu/opendesk-edu](https://github.com/opendesk-edu/opendesk-edu)

Issues, pull requests, documentation improvements, and translations are all appreciated.

## What's Next

The roadmap for the coming months focuses on stabilizing the beta services based on real-world feedback from early adopters. We are also working on expanding federation support to cover additional national identity federations beyond DFN-AAI, and on streamlining the onboarding process for institutions that want to evaluate openDesk Edu without a full production deployment.

Stay tuned for a follow-up post that dives into the technical architecture in detail.
