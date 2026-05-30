---
title: "ILIAS"
date: "2026-02-25"
description: "Modular learning management system for resource management, testing, and interactive learning experiences."
categories: ["lms", "teaching", "e-learning", "base"]
tags: ["ilias", "lms", "learning-management", "education"]
version: "9"
---

# ILIAS

ILIAS is a powerful open-source learning management system (LMS) that provides a comprehensive platform for teaching and learning. It offers tools for course management, assessment, collaboration, and communication. ILIAS is an education-specific Beta component in openDesk Edu.

## Key Features

- **Course Management**: Create and organize courses with flexible content structures.
- **Assessment**: Built-in test and survey tools with extensive question types.
- **Collaboration**: Forums, wikis, group rooms, and file sharing.
- **Communication**: Integrated messaging and notification systems.
- **SCORM Compliance**: Full support for SCORM 1.2 and 2004 content packages.

## Integration with openDesk Edu

ILIAS integrates with openDesk Edu as a SAML 2.0 service provider using Shibboleth, authenticating users through Keycloak. Users access courses from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. Persistent course data, user submissions, and assessment results are backed up through k8up.

## Learn More

- [Official Documentation](https://docu.ilias.de) — Official docs and resources
