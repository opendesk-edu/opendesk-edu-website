---
title: "Deploying openDesk Edu on Your University Infrastructure"
date: "2026-04-18"
description: "A step-by-step guide to deploying openDesk Edu — from setting up your Kubernetes cluster to configuring SAML federation with DFN-AAI and eduGAIN."
categories: ["Tutorial"]
tags: ["deployment", "infrastructure", "kubernetes"]
---

# Deploying openDesk Edu on Your University Infrastructure

This guide walks you through deploying openDesk Edu on your university's Kubernetes infrastructure. By the end, you will have a fully functional digital workplace with 25 integrated services — all connected through unified Keycloak SSO.

## Prerequisites

Before you start, make sure you have the following in place:

- **Kubernetes cluster** — version 1.28 or later. This can be a bare-metal cluster, a cloud-managed offering, or an on-premises deployment like Proxmox VE or OpenStack.
- **Helm 3** — the package manager for Kubernetes. Install it from [helm.sh](https://helm.sh).
- **Helmfile** — the orchestration layer that manages all openDesk Edu charts. Install it from [helmfile.readthedocs.io](https://helmfile.readthedocs.io/).
- **A domain and DNS records** — you need a base domain (e.g., `desk.uni-example.de`) with wildcard DNS pointing to your ingress controller. TLS certificates will be provisioned automatically.
- **Sufficient resources** — plan for at least 8 CPU cores and 16 GB of RAM for a production deployment. Storage requirements depend on your user count and which services you enable.

## Step 1: Clone the Repository

Start by cloning the openDesk Edu repository:

```bash
git clone https://codeberg.org/opendesk-edu/opendesk-edu.git
cd opendesk-edu
```

Take a moment to browse the directory structure. The key directories are:

- `helmfile/` — contains all helmfile configurations and environments
- `charts/` — individual Helm charts for each service
- `docs/` — detailed documentation on configuration, scaling, and monitoring

## Step 2: Configure Values

The central configuration file is `helmfile/environments/default/global.yaml.gotmpl`. This Go template file controls settings for every service in the stack. Open it in your editor and adjust the following:

**Domain configuration:**

```yaml
global:
  domain: "desk.uni-example.de"
```

**Mail settings** — required for groupware and notification services:

```yaml
global:
  mail:
    host: "smtp.uni-example.de"
    port: 587
    fromAddress: "noreply@uni-example.de"
```

**Storage class** — set this to match your cluster's storage provider:

```yaml
global:
  storageClass: "ceph-rbd"
```

**Service selection** — you can enable or disable individual services. If your university already uses Moodle elsewhere, you can turn it off and keep ILIAS. If you only need file sharing and video conferencing, disable the LMS charts entirely:

```yaml
services:
  ilias:
    enabled: true
  moodle:
    enabled: false
  bigbluebutton:
    enabled: true
```

The template system propagates these values to all dependent charts, so you never need to edit individual chart values files.

## Step 3: Deploy with Helmfile

With your configuration in place, run the deployment:

```bash
helmfile -e default apply
```

This single command renders all Helm charts with your configuration, resolves dependency ordering, and deploys the full stack to your cluster. Helmfile handles the rollout sequence — infrastructure services like Keycloak and the ingress controller are deployed first, followed by application services.

The initial deployment typically takes 10 to 20 minutes depending on your cluster's capacity and network speed. You can monitor progress with:

```bash
kubectl get pods -n opendesk -w
```

Wait until all pods show a `Running` state before proceeding.

## Step 4: Configure SAML/SSO with Keycloak

openDesk Edu uses Keycloak as its central identity provider. For university deployments, the recommended approach is to integrate with your institution's existing SAML federation — DFN-AAI in Germany, or eduGAIN internationally.

**Configure the SAML identity provider in Keycloak:**

1. Access the Keycloak admin console at `https://keycloak.desk.uni-example.de`
2. Navigate to your realm and add a new SAML identity provider
3. Import your federation metadata XML (available from your DFN-AAI or eduGAIN management interface)
4. Map SAML attributes to Keycloak user attributes:

| SAML Attribute | Keycloak Mapping | Purpose |
|---|---|---|
| `eduPersonPrincipalName` | username | Unique identifier |
| `eduPersonAffiliation` | roles | Student/staff/faculty |
| `eduPersonEntitlement` | groups | Course and permission groups |
| `mail` | email | Contact address |

**For ILIAS, Moodle, and BigBlueButton**, openDesk Edu deploys Shibboleth as a SAML proxy. These services receive their attributes through Shibboleth rather than directly from Keycloak. The proxy handles attribute filtering and per-service policies, keeping your federation metadata clean.

After configuring the identity provider, test the login flow by accessing the Nubus portal. You should be redirected to your institution's login page and returned to the portal with your federation attributes populated.

## Step 5: Verify the Deployment

Run through this checklist to confirm everything is working:

1. **Portal access** — open `https://desk.uni-example.de` in your browser. The Nubus portal should load with all enabled services listed.
2. **SSO login** — click on any service. You should be authenticated through Keycloak without being prompted for credentials again.
3. **File sharing** — create a test file in Nextcloud or OpenCloud and verify it persists across page reloads.
4. **Video conferencing** — start a test meeting in Jitsi or BigBlueButton and verify audio and video work.
5. **LMS access** — log into ILIAS or Moodle and confirm your federation attributes (name, email, role) are correctly displayed.

If any service shows errors, check the pod logs:

```bash
kubectl logs -n opendesk -l app.kubernetes.io/name=<service-name> --tail=50
```

## Troubleshooting

Here are the most common issues and how to resolve them:

**Pods stuck in `Pending`** — usually a resource or storage issue. Check node capacity with `kubectl describe pod <name>` and verify your storage class is available.

**Certificate errors** — the openDesk Certificates operator handles TLS automatically. If certificates fail to provision, verify your domain's DNS records are correct and that the operator can reach the Bundesdruckerei CA. Alternatively, configure cert-manager with Let's Encrypt as a fallback.

**SSO redirect loop** — this typically means the SAML identity provider metadata is misconfigured or the assertion consumer service URL does not match your domain. Double-check the Keycloak identity provider settings and ensure your service URLs use HTTPS.

**High memory usage** — BigBlueButton and Collabora are the most resource-intensive services. If you are running on limited hardware, consider disabling BigBlueButton and using Jitsi instead, or setting resource limits in the global configuration.

**Backup failures** — openDesk Edu uses k8up for automated backups. If backups fail, check the k8up operator logs and verify your S3-compatible storage endpoint is accessible from the cluster.

## What's Next

Once your deployment is running, consider these follow-up steps:

- Set up monitoring with Prometheus and Grafana dashboards for service health
- Configure backup schedules and test restore procedures
- Customize the portal theme to match your university's branding
- Review the permissions documentation to set up role-based access control

For more details, consult the full documentation at [codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu).
