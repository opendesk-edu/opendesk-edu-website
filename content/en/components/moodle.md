---
title: "Moodle"
date: "2026-03-25"
description: "Plugin-rich learning management system with assignments, workshops, gradebook, and Shibboleth authentication."
categories: ["education", "beta"]
tags: ["moodle", "lms", "learning-management", "e-learning"]
---

# Moodle

Moodle is a plugin-rich learning management system (LMS) designed for creating and delivering online courses. It supports assignments, quizzes, workshops, forums, gradebook, and a vast library of community plugins. Moodle is an education-specific Beta component in openDesk Edu.

## Key Features

- **Course management**: Create courses with activities, resources, and enrollment methods.
- **Assessment tools**: Assignments, quizzes, workshops with peer assessment, and grading workflows.
- **Gradebook**: Centralized grade tracking with custom scales, categories, and calculations.
- **Plugin ecosystem**: Thousands of community and third-party plugins for extended functionality.
- **Shibboleth authentication**: Connects as a SAML service provider to the Keycloak identity provider.

## Integration with openDesk Edu

Moodle integrates with openDesk Edu as a SAML 2.0 service provider using Shibboleth, authenticating users through Keycloak. Users access courses from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. Persistent course data, user submissions, and the gradebook are backed up through k8up.

## Learn More

- [Official Documentation](https://docs.moodle.org) — Official docs and resources
