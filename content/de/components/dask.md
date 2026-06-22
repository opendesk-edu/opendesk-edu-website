---
title: "Dask Gateway"
date: "2026-05-29"
description: "Verteilter Cluster für paralleles Rechnen zur Skalierung von Data-Science- und wissenschaftlichen Workloads."
categories: ["wissenschaftliches-rechnen", "infrastruktur", "geplant"]
tags: ["dask", "distributed-computing", "parallel", "big-data", "scientific-computing"]
version: "2024.1"
---

# Dask Gateway

Dask Gateway stellt bedarfsorientierte verteilte Rechencluster bereit, die Python- und Data-Science-Workloads über mehrere Knoten skalieren. Es richtet sich an Forschende, die große Datenmengen verarbeiten, parallele Simulationen durchführen oder Machine-Learning-Training-Pipelines beschleunigen müssen.

## Hauptfunktionen

- **Bedarfsorientierte Cluster**: Dask-Cluster dynamisch je nach Workload-Anforderungen erstellen und skalieren.
- **Python-nativ**: Vollständige Integration mit dem Python-Data-Science-Ökosystem (NumPy, Pandas, Scikit-learn, Xarray).
- **Job-Warteschlange**: Mehrere Benutzereinreichungen mit konfigurierbaren Ressourcengrenzen verwalten und priorisieren.
- **Dashboard**: Echtzeit-Überwachung des Cluster-Zustands, Aufgabenfortschritts und der Ressourcennutzung.
- **Skalierbar**: Von der Einzelknoten-Entwicklung bis hin zu Multi-Node-Produktionsclustern.

## Integration mit openDesk Edu

Dask Gateway ist Teil der Collab Services Suite (Phase C — geplant) und wird über das offizielle Helm-Chart (`helm.dask.org`) bereitgestellt. Es wird unter `compute.*` der Wildcard-DNS der Einrichtung erreichbar sein und zur Authentifizierung in Keycloak integriert.

## Weitere Informationen

- [Offizielle Dokumentation](https://gateway.dask.org/) — Dask Gateway-Dokumentation und Ressourcen
- [Dask-Projekt](https://dask.org/) — Paralleles Rechnen in Python
