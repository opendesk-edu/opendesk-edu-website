---
title: "Component Comparison Matrix"
date: "2025-04-18"
description: "Compare all 25 openDesk Edu services across categories, licenses, and key features."
categories:
  - "Components"
tags:
  - "comparison"
  - "overview"
---

# Component Comparison Matrix

openDesk Edu combines **10 base services** from openDesk Community Edition with **15 education-specific Beta services** and **11 scientific computing tools** from the Collab Services suite, delivering a comprehensive digital workplace tailored for schools, universities, and research institutions. All 36 services integrate through **Keycloak SSO** (SAML 2.0 / OIDC) and are accessible from the unified Nubus portal.

Services within the same category may serve as alternatives to each other — for example, you can choose between Jitsi and BigBlueButton for video conferencing, or between OX App Suite, SOGo, and Grommunio for groupware. **Beta** services are fully functional but still under active development; they may change in future releases. **Planned** services are on the roadmap and not yet available in production.

## Scientific Computing & Research

| Service | Type | Status | License | Key Features |
|---|---|---|---|---|
| JupyterHub | Interactive Notebooks | Stable | BSD-3-Clause | Multi-user notebooks (Python, R, Julia, SageMath, Octave), native OIDC |
| RStudio Server | R IDE | Beta | AGPL-3.0 | Shiny apps, workspace management, OpenCloud WebDAV sync |
| Overleaf CE | LaTeX Editor | Stable | AGPL-3.0 | Real-time collaborative LaTeX, version history, template gallery |
| code-server | Browser IDE | Stable | MIT | Full VS Code in the browser, extension marketplace, built-in terminal |
| Slidev | Presentations | Beta | MIT | Markdown-to-slides, code highlighting, KaTeX math, Mermaid diagrams |
| Open WebUI | LLM Chat Interface | Beta | MIT | ChatGPT-like UI, model switching, native OIDC, document upload |
| Ollama | LLM Backend | Beta | MIT | Local open-source LLMs (llama3.2, Mistral, Gemma), REST API |
| ttyd | Browser Terminal | Stable | MIT | Full Linux terminal in browser, clipboard support, session persistence |
| KasmVNC | Remote Desktop | Beta | GPL-2.0 | Full Linux desktop in browser, GPU acceleration, audio support |
| Dask Gateway | Distributed Computing | Planned | BSD-3-Clause | On-demand parallel clusters, Python-native, job queue |

## Communication & Collaboration

| Service | Type | Status | License | Key Features |
|---|---|---|---|---|
| Element (Matrix) | Chat / Messaging | Stable | Apache 2.0 | Real-time messaging, rooms, file sharing, Nordeck education widgets, federation |
| Jitsi | Video Conferencing | Stable | Apache 2.0 | Browser-based meetings, screen sharing, background blur, dial-in via SIP |
| BigBlueButton | Virtual Classroom | Beta | LGPL-3.0 | Session recording, interactive whiteboard, breakout rooms, polling |
| Etherpad | Collaborative Editing | Beta | Apache 2.0 | Real-time co-editing, color-coded authors, plugin system, export to multiple formats |

## Email & Calendar

| Service | Type | Status | License | Key Features |
|---|---|---|---|---|
| OX App Suite | Groupware | Stable | Proprietary (CE) | Full webmail, shared calendar, contacts with LDAP, task management |
| SOGo | Lightweight Groupware | Beta | LGPL-2.1 | Fast webmail, CalDAV/CardDAV, ActiveSync, low resource footprint |
| Grommunio | Microsoft 365-compatible Groupware | Beta | AGPL-3.0 | ActiveSync 16.1, Outlook/Thunderbird compatibility, MariaDB backend |

## File Management

| Service | Type | Status | License | Key Features |
|---|---|---|---|---|
| Nextcloud | Cloud Storage | Stable | AGPL-3.0 | File sync/share, external storage mounts, version control, Collabora integration |
| OpenCloud | Lightweight Cloud Storage | Beta | Apache 2.0 | CS3-based storage, per-course sharing, WebDAV access, low resource usage |

## Office & Productivity

| Service | Type | Status | License | Key Features |
|---|---|---|---|---|
| Collabora | Online Office | Stable | MPL-2.0 | DOCX/XLSX/PPTX editing, real-time collaboration, format compatibility, browser-native |
| CryptPad | Privacy-first Office | Stable | AGPL-3.0 | End-to-end encryption, collaborative editing, integrated diagrams.net, drive |
| Notes | Note-taking | Stable | MIT | Fast distraction-free editor, markdown support, simple organization |
| Draw.io | Diagramming | Beta | Apache 2.0 | Extensive shape libraries, export to PDF/VSDX/SVG, import from Lucidchart/Gliffy |
| Excalidraw | Whiteboard | Beta | MIT | Hand-drawn style, real-time collaboration, shape recognition, instant loading |

## Learning & Education

| Service | Type | Status | License | Key Features |
|---|---|---|---|---|
| ILIAS | Learning Management System | Beta | GPL-3.0 | Course management, assessments, SCORM compliance, forums, wikis |
| Moodle | Learning Management System | Beta | GPL-3.0+ | Course builder, assignments, gradebook, workshop peer assessment, plugin ecosystem |
| XWiki | Enterprise Wiki | Stable | LGPL-2.1 | Structured content, WYSIWYG editor, scripting, extension marketplace |

## Project & Knowledge Management

| Service | Type | Status | License | Key Features |
|---|---|---|---|---|
| OpenProject | Project Management | Stable | GPL-3.0 | Agile boards, Gantt charts, time tracking, built-in wiki, bug tracking |
| Planka | Kanban Board | Beta | AGPL-3.0 | Drag-and-drop boards, real-time updates, labels, checklists, due dates |
| BookStack | Documentation Wiki | Beta | MIT | Shelf/book/chapter hierarchy, WYSIWYG + markdown, full-text search, role-based permissions |

## IT & Administration

| Service | Type | Status | License | Key Features |
|---|---|---|---|---|
| Nubus | Portal & IAM | Stable | Apache 2.0 (Keycloak) | Unified portal, SAML 2.0/OIDC, user provisioning, role-based access control |
| Zammad | Ticket System | Beta | AGPL-3.0 | Multi-channel support, workflow automation, knowledge base, SLA management |
| LimeSurvey | Survey Platform | Beta | GPL-2.0+ | Rich question types, conditional logic, quota management, multi-language surveys |
| TYPO3 | Content Management System | Beta | GPL-2.0+ | Multi-site management, flexible content modeling, frontend editing, extensibility |
| LTB SSP | Self-Service Password | Beta | GPL-2.0+ | Password reset via email, security questions, account unlock, LDAP backend |
