---
title: "RStudio Server"
date: "2026-05-29"
description: "Professional R IDE with Shiny app support, workspace management, and OpenCloud file sync."
categories: ["scientific-computing", "research", "beta"]
tags: ["rstudio", "r", "shiny", "statistics", "data-science", "scientific-computing"]
version: "2024.12.0"
---

# RStudio Server

RStudio Server provides a professional integrated development environment for R, accessible from any web browser. It includes a console, syntax-highlighting editor, plotting tools, workspace management, and Shiny application support — all running on the server.

## Key Features

- **Full R IDE**: Console, editor, environment viewer, plot history, and file browser in the browser.
- **Shiny app support**: Develop, test, and deploy interactive Shiny web applications.
- **Package management**: Install and manage CRAN packages with dependency resolution.
- **OpenCloud integration**: Mounts the user's OpenCloud storage via rclone WebDAV sidecar for direct file access.
- **Data import/export**: Native support for CSV, Excel, SPSS, SAS, and Stata file formats.

## Integration with openDesk Edu

RStudio Server is part of the Collab Services suite and deploys via a custom local Helm chart (`helmfile/charts/rstudio`). It authenticates through Keycloak using an oauth2-proxy sidecar and is accessible at `r.*` under the institution's wildcard DNS. An OpenCloud WebDAV sidecar provides seamless file sync with the user's cloud storage.

## Learn More

- [Official Documentation](https://posit.co/products/open-source/rstudio-server/) — RStudio Server docs and resources
