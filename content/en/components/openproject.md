---
title: "OpenProject"
date: "2026-04-17"
description: "Project management platform with agile boards, Gantt charts, time tracking, and team collaboration."
categories: ["productivity", "base"]
tags: ["openproject", "project-management", "agile", "gantt", "kanban"]
---

# OpenProject

OpenProject is a comprehensive project management platform that supports agile methodologies, traditional waterfall planning, and hybrid workflows. It includes Gantt charts, Kanban boards, time tracking, and built-in wiki pages for project documentation. As a base openDesk CE component, it ships stable and production-ready.

## Key Features

- **Agile boards**: Scrum and Kanban boards with drag-and-drop story and task management.
- **Gantt charts**: Interactive Gantt chart for project scheduling with dependency tracking.
- **Time tracking**: Log time on tasks and projects with reporting and export capabilities.
- **Wiki and meeting notes**: Built-in wiki pages for project documentation and meeting minutes.
- **Bug tracking**: Integrated bug tracker with custom fields, workflows, and notifications.

## Integration with openDesk Edu

OpenProject integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users access project boards directly from the unified Nubus portal. It deploys as a modular Helm chart and is the default project management tool alongside the Beta alternative Planka for lighter Kanban use cases. Persistent project data is backed up through k8up.
