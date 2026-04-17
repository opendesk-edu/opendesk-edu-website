---
title: "Planka"
date: "2026-04-04"
description: "Kanban board application with OIDC support for student projects and research planning."
categories: ["education", "productivity", "beta"]
tags: ["planka", "kanban", "project-management", "boards"]
---

# Planka

Planka is a focused Kanban board application that provides drag-and-drop task management with real-time updates. It supports labels, checklists, due dates, and attachments on cards. Planka is an education-specific Beta component in openDesk Edu.

## Key Features

- **Drag-and-drop boards**: Create boards, lists, and cards with intuitive drag-and-drop interactions.
- **Real-time updates**: Changes appear instantly for all board members without page refreshes.
- **Labels and filters**: Color-coded labels and filter options for organizing and finding tasks.
- **Checklists and due dates**: Add checklists to cards for subtask tracking and set due dates for deadlines.
- **Card attachments**: Attach files, images, and documents directly to cards for context.

## Integration with openDesk Edu

Planka integrates with openDesk Edu through Keycloak-based SSO using OIDC. Users access boards from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. Planka is a lighter alternative to OpenProject for student projects and research groups that only need Kanban boards. Persistent board data is backed up through k8up.

## Learn More

- [Official Documentation](https://docs.planka.cloud) — Official docs and resources
