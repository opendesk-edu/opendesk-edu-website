---
title: "LimeSurvey"
date: "2026-04-08"
description: "Survey platform for course evaluations, academic research, and institutional feedback collection."
categories: ["education", "productivity", "beta"]
tags: ["limesurvey", "surveys", "evaluations", "research"]
---

# LimeSurvey

LimeSurvey is a full-featured survey platform for creating, deploying, and analyzing online surveys. It supports a wide range of question types, conditional logic, and quota management. LimeSurvey is an education-specific Beta component in openDesk Edu.

## Key Features

- **Rich question types**: Multiple choice, rating scales, matrix questions, file upload, and free text with validation.
- **Conditional logic**: Show or skip questions based on previous answers for dynamic survey paths.
- **Quota management**: Set response quotas and close surveys automatically when targets are reached.
- **Data export**: Export results to CSV, Excel, SPSS, R, and PDF formats for analysis.
- **Multi-language surveys**: Create surveys in multiple languages with automatic string translation support.

## Integration with openDesk Edu

LimeSurvey integrates with openDesk Edu through Keycloak-based SSO using SAML 2.0 and OIDC. Users access the survey platform from the unified Nubus portal. It deploys as a modular Helm chart as an education-specific Beta component. Persistent survey data and response sets are backed up through k8up.

## Learn More

- [Official Documentation](https://manual.limesurvey.org) — Official docs and resources

