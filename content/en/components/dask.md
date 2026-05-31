---
title: "Dask Gateway"
date: "2026-05-29"
description: "Distributed parallel computing cluster for scaling data science and scientific workloads."
categories: ["scientific-computing", "infrastructure", "planned"]
tags: ["dask", "distributed-computing", "parallel", "big-data", "scientific-computing"]
version: "2024.1"
---

# Dask Gateway

Dask Gateway provides on-demand distributed computing clusters that scale Python and data science workloads across multiple nodes. It is designed for researchers who need to process large datasets, run parallel simulations, or accelerate machine learning training pipelines.

## Key Features

- **On-demand clusters**: Spawn and scale Dask clusters dynamically based on workload requirements.
- **Python-native**: Full integration with the Python data science ecosystem (NumPy, Pandas, Scikit-learn, Xarray).
- **Job queue**: Manage and prioritize multiple user submissions with configurable resource limits.
- **Dashboard**: Real-time monitoring of cluster health, task progress, and resource utilization.
- **Scalable**: From single-node development to multi-node production clusters.

## Integration with openDesk Edu

Dask Gateway is part of the Collab Services suite (Phase C — planned) and deploys via its upstream Helm chart (`helm.dask.org`). It will be accessible at `compute.*` under the institution's wildcard DNS and integrate with Keycloak for authentication.

## Learn More

- [Official Documentation](https://gateway.dask.org/) — Dask Gateway docs and resources
- [Dask Project](https://dask.org/) — Parallel computing in Python
