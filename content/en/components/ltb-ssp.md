---
title: "LTB SSP"
date: "2026-03-16"
description: "Self-service password reset solution for secure password recovery."
categories: ["productivity", "security"]
tags: ["ltb-ssp", "password", "security", "self-service"]
version: "1.7"
---

# LTB SSP

LTB SSP (Self-Service Password) is a simple web application that allows users to reset their own LDAP passwords without contacting the helpdesk. It supports password changes, resets via security questions or email tokens, and account unlock. LTB SSP is an education-specific Beta component in openDesk Edu.

## Key Features

- **Password reset**: Users reset forgotten passwords via email verification or security questions.
- **Password change**: Authenticated users can change their current password from the web interface.
- **Account unlock**: Unlock accounts that have been locked due to failed login attempts.
- **Security questions**: Configurable security questions as an alternative password recovery method.
- **LDAP backend**: Works directly with the LDAP directory that backs the openDesk Edu identity infrastructure.

## Integration with openDesk Edu

LTB SSP integrates with openDesk Edu by connecting directly to the LDAP directory used by Keycloak. It deploys as a modular Helm chart as an education-specific Beta component. By reducing password-related helpdesk tickets, it lightens the administrative burden for IT staff at educational institutions.

## Learn More

- [Official Documentation](https://ltb-project.org/documentation/self-service-password) — Official docs and resources
