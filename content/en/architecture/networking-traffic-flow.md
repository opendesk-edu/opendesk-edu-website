---
title: "Networking & Traffic Flow Architecture"
date: "2026-08-27"
description: "How network traffic enters the openDesk Edu cluster, traverses DNS, TLS termination, ingress routing, and network policies to reach services — the complete traffic flow path."
categories: ["architecture", "infrastructure"]
tags: ["architecture", "networking", "dns", "tls", "ingress", "traefik", "certificates", "network-policies", "kubernetes"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/networking-traffic-flow-teaser.svg"
---

# Networking & Traffic Flow Architecture

Every request to the platform — whether from a student checking email, a professor uploading lecture materials, or an administrator configuring services — traverses the same network path. Understanding that path is essential for operators who need to troubleshoot connectivity issues, plan capacity, or implement security policies. This article documents the complete traffic flow: from DNS resolution through TLS termination, ingress routing, and network policy enforcement, down to the individual service pod.

For the identity layer that authenticates traffic once it arrives, see [Identity & Authentication Architecture](/architecture/identity-authentication). For the full platform overview, see [System Architecture Overview](/architecture/overview).

## The Traffic Flow Path

When a user's browser requests `https://cloud.example.edu`, the request passes through several layers before reaching the application pod. Each layer has a specific responsibility, and understanding them in order is the key to diagnosing any connectivity issue.

```
User Browser
    │
    ▼
DNS Resolution ──► IP address of the ingress controller
    │
    ▼
TLS Termination ──► Certificate presented, HTTPS handshake
    │
    ▼
Ingress Controller (Traefik) ──► Route rule matched, Host header inspected
    │
    ▼
Network Policy ──► Pod-to-pod traffic allowed/denied
    │
    ▼
Service (Kubernetes Service) ──► Load-balanced to a healthy pod
    │
    ▼
Application Pod ──► Request processed, response returned
```

### Layer 1: DNS Resolution

The journey begins with DNS. When a user types `cloud.example.edu` into their browser, the browser queries its configured DNS resolver, which follows the chain from the root zone through the top-level domain (`.edu`) to the institution's authoritative nameservers.

The institution's DNS configuration maps each service hostname to the cluster's ingress IP address. A typical setup uses wildcard DNS or individual A/AAAA records:

- `cloud.example.edu` → ingress IP (Nextcloud)
- `meet.example.edu` → ingress IP (BigBlueButton)
- `auth.example.edu` → ingress IP (Keycloak)
- `portal.example.edu` → ingress IP (Nubus)

All services share the same ingress IP. The differentiation happens at the ingress controller layer (Layer 3), which inspects the `Host` header to route traffic to the correct service. This means a single IP address serves the entire platform — the ingress controller acts as a reverse proxy, distributing traffic based on the hostname.

Some institutions use a wildcard DNS record (`*.example.edu`) pointing to the ingress IP, which simplifies configuration when adding new services. Others prefer individual records for tighter control. Both approaches work; the choice is an operational preference.

### Layer 2: TLS Termination

When the browser connects to the ingress IP on port 443, the ingress controller presents a TLS certificate. This certificate proves the server's identity and encrypts the connection. The platform handles TLS at the ingress layer — individual application pods do not need their own certificates.

#### Certificate Sources

The platform supports multiple certificate sources:

- **openDesk Certificates (Bundesdruckerei)**: The default and recommended source. The institution obtains TLS certificates from Bundesdruckerei, which provides certificates under institutional control. This keeps the trust chain entirely within the institution — no external certificate authority is involved.
- **cert-manager with Let's Encrypt**: For institutions that prefer automated certificate issuance. cert-manager integrates with the ACME protocol to obtain and renew Let's Encrypt certificates automatically. This is suitable for evaluation environments or institutions that do not have an existing PKI.
- **Custom CA / institutional PKI**: Institutions with their own certificate authority can import certificates directly. This is common in larger universities that operate their own PKI infrastructure.

#### Certificate Management

Regardless of the source, certificates are managed as Kubernetes TLS secrets. The ingress controller references these secrets in its TLS configuration. Certificate renewal is automated:

- **openDesk Certificates**: Renewed through the institution's procurement process. The platform monitors certificate expiry and alerts operators before renewal is needed.
- **cert-manager / Let's Encrypt**: Renewed automatically 30 days before expiry. cert-manager handles the ACME challenge (HTTP-01 or DNS-01) and updates the TLS secret without operator intervention.
- **Custom CA**: Renewal depends on the institution's CA policies. Operators must manually replace the TLS secret before expiry.

#### TLS Configuration

The platform enforces modern TLS standards:

- **TLS 1.2 minimum** (TLS 1.3 preferred where supported)
- **HSTS** (HTTP Strict Transport Security) with a long max-age, including subdomains
- **Modern cipher suite** (no RC4, no 3DES, no SHA1)
- **OCSP stapling** where supported by the certificate source

All HTTP traffic is redirected to HTTPS. No unencrypted traffic reaches the application pods. The ingress controller handles the redirect (301) before forwarding any request.

### Layer 3: Ingress Controller (Traefik)

The ingress controller is the platform's front door. It receives all incoming HTTPS traffic, inspects the `Host` header, matches routing rules, and forwards the request to the appropriate Kubernetes Service.

#### Why Traefik

Traefik is the platform's default ingress controller. It was chosen for its:

- **Dynamic configuration**: Traefik reads Ingress resources from the Kubernetes API in real time. Adding a new service does not require reloading the controller — Traefik detects the new Ingress and routes traffic immediately.
- **Let's Encrypt integration**: Built-in ACME client for automatic certificate management (when using Let's Encrypt as the certificate source).
- **Middleware support**: Traefik middlewares handle rate limiting, authentication forwarding, header manipulation, and redirect enforcement.
- **Native Kubernetes integration**: Traefik uses the standard Kubernetes Ingress API and supports IngressRoute (Traefik's Custom Resource) for advanced configurations.
- **Observability**: Built-in metrics (Prometheus) and tracing (OpenTelemetry) for traffic analysis and troubleshooting.

Some institutions deploy HAProxy alongside Traefik for specific load-balancing scenarios (e.g., BigBlueButton's UDP traffic for video, which Traefik does not handle natively). In these setups, Traefik handles HTTP/HTTPS, and HAProxy handles the non-HTTP traffic.

#### Routing Rules

Routing is configured through Kubernetes Ingress resources (or IngressRoute CRDs). Each service has its own Ingress definition that specifies:

- **Host**: The hostname that triggers this route (e.g., `cloud.example.edu`)
- **Path**: Optional path-based routing (e.g., `/api` vs `/web`)
- **Service**: The target Kubernetes Service and port
- **TLS**: Reference to the TLS secret for this host
- **Middlewares**: Rate limiting, header manipulation, etc.

The ingress controller evaluates these rules for every incoming request. The first matching rule wins. If no rule matches, the controller returns a 404.

#### Rate Limiting and Security Middlewares

The ingress controller applies several middlewares to every request:

- **Rate limiting**: Protects against brute-force attacks and abuse. Limits are configured per-service and can be tuned based on the service's traffic patterns.
- **Security headers**: Adds `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and `Content-Security-Policy` headers.
- **Request size limits**: Prevents oversized payloads from overwhelming services.
- **Timeout enforcement**: Prevents slow-loris attacks by enforcing connection and read timeouts.

### Layer 4: Network Policies

Once the ingress controller forwards traffic to a Kubernetes Service, network policies govern which pods can communicate with which other pods. Network policies are the Kubernetes-native way to enforce network segmentation.

#### Default-Deny Model

The platform uses a default-deny model: all pod-to-pod traffic is denied unless explicitly allowed. This means:

- A web frontend pod can reach the database pod (because a policy allows it)
- A web frontend pod cannot reach another tenant's database pod (because no policy allows it)
- An external attacker who compromises one pod cannot pivot to arbitrary services (because the network policies restrict lateral movement)

#### Namespace Isolation

The platform uses Kubernetes namespaces to provide logical isolation between service groups:

- Each major service (or group of related services) runs in its own namespace
- Network policies control inter-namespace traffic
- Cross-namespace communication is explicit (a policy must allow it) rather than implicit

This namespace structure provides blast-radius containment: if one service is compromised, the attacker's ability to reach other services is limited by the network policies between namespaces.

#### Typical Policy Patterns

Common network policy patterns include:

- **Frontend → Backend**: A policy allowing the web frontend namespace to reach the backend API namespace on specific ports
- **Backend → Database**: A policy allowing the backend namespace to reach the database namespace on the database port only
- **Ingress → All**: A policy allowing the ingress controller namespace to reach all service namespaces on HTTP/HTTPS ports
- **Monitoring → All**: A policy allowing the monitoring namespace (Prometheus) to scrape metrics endpoints in all namespaces

Each policy is scoped to the minimum necessary permissions. No policy allows "all traffic to all pods" — that would defeat the purpose of network segmentation.

### Layer 5: Service and Pod

The final layer is the application pod itself. After traffic passes through DNS, TLS, ingress, and network policies, it reaches the Kubernetes Service, which load-balances across healthy pods.

#### Service Discovery

Kubernetes Services provide stable virtual IP addresses (ClusterIPs) that route traffic to healthy pods. When a pod is created, destroyed, or becomes unhealthy, the Service automatically updates its endpoint list. The application does not need to know about pod lifecycle changes — it just serves requests.

#### Pod-Level Communication

Within a pod, containers communicate via `localhost`. Between pods in the same namespace, communication uses the ClusterIP. Between namespaces, communication uses the fully-qualified service name (e.g., `database.backend-namespace.svc.cluster.local`).

## DNS Architecture

### External DNS

The institution's external DNS configuration maps public hostnames to the cluster's ingress IP. This is the entry point for all external traffic.

### Internal DNS (CoreDNS)

Inside the cluster, CoreDNS handles service discovery. Every Kubernetes Service gets a DNS record:

- `servicename.namespace.svc.cluster.local` — the fully-qualified name
- `servicename.namespace` — the short name (within the same cluster)
- `servicename` — the shortest name (within the same namespace)

Applications use these DNS names to reach other services. For example, a frontend pod connects to the database using `database.backend:3306` rather than an IP address. This abstraction means pods can move, restart, and scale without configuration changes.

### Custom DNS Entries

The platform supports custom DNS entries for services that need specific hostname configurations (e.g., Keycloak's SAML endpoints require exact hostname matching). These are configured through CoreDNS custom configurations or ExternalName services.

## TLS Certificate Management

### The Trust Chain

The platform's TLS trust chain is designed to keep all control within the institution:

1. **Root of trust**: The institution's certificate authority (or Bundesdruckerei for openDesk Certificates) signs the TLS certificates
2. **Certificate storage**: Certificates are stored as Kubernetes TLS secrets, accessible only to the ingress controller and services that need them
3. **Certificate presentation**: The ingress controller presents the certificate to clients during the TLS handshake
4. **Certificate renewal**: Renewal is automated (cert-manager) or monitored (custom CA), ensuring no certificate expires without intervention

### Certificate Scope

Each hostname gets its own certificate, or a wildcard certificate covers all subdomains. The choice depends on the institution's PKI:

- **Individual certificates**: Tighter security (each certificate is independent), but more certificates to manage
- **Wildcard certificates**: Simpler management (one certificate for all subdomains), but a compromised wildcard certificate affects all services

The platform supports both approaches. The default configuration uses individual certificates per service, but wildcard certificates are supported for institutions that prefer them.

## Network Security Posture

### Encryption in Transit

All traffic is encrypted:

- **External traffic**: HTTPS (TLS 1.2+) between the user's browser and the ingress controller
- **Internal traffic**: Traffic between pods can be encrypted using mTLS (mutual TLS), though this depends on the service mesh configuration. By default, pod-to-pod traffic within the cluster is unencrypted (relying on network policies for isolation), but mTLS can be enabled for services that require it.

### DDoS Protection

The ingress controller provides basic DDoS protection through rate limiting and connection limits. For institutions facing sophisticated attacks, an external DDoS protection service (e.g., the institution's upstream provider or a dedicated DDoS mitigation service) can be placed in front of the cluster.

### Firewall Integration

The cluster's host firewall (e.g., iptables, nftables, or the cloud provider's security groups) restricts inbound traffic to only the ports the platform needs:

- **Port 443 (HTTPS)**: All user traffic
- **Port 80 (HTTP)**: Redirect to HTTPS only (no application traffic)
- **Port 22 (SSH)**: Administrative access only, restricted to management networks

All other inbound ports are closed. Inter-pod traffic is governed by Kubernetes network policies, not by the host firewall.

## Failure Modes and Troubleshooting

### DNS Resolution Failure

**Symptom**: Users see "This site can't be reached" or `NXDOMAIN` errors.
**Cause**: DNS records are misconfigured or the DNS provider is unavailable.
**Resolution**: Verify the A/AAAA records point to the correct ingress IP. Check DNS propagation with `dig` or `nslookup`.

### TLS Certificate Expiry

**Symptom**: Users see "Your connection is not private" or `NET::ERR_CERT_DATE_INVALID`.
**Cause**: A TLS certificate has expired.
**Resolution**: For cert-managed certificates, check the cert-manager logs and the Certificate resource status. For custom CA certificates, replace the TLS secret with a renewed certificate.

### Ingress Routing Failure

**Symptom**: Users see a 404 or 502 error.
**Cause**: The Ingress resource is misconfigured, the target Service has no healthy pods, or the Ingress class is wrong.
**Resolution**: Check the Ingress resource (`kubectl get ingress`), verify the Service has endpoints (`kubectl get endpoints`), and check the Traefik dashboard for routing rules.

### Network Policy Denial

**Symptom**: A service cannot reach another service (timeout or connection refused).
**Cause**: A network policy is blocking the traffic.
**Resolution**: Check the network policies in both the source and destination namespaces. Use `kubectl exec` to test connectivity from the source pod. Temporarily relax the policy to confirm the diagnosis, then tighten it to the minimum necessary permissions.

---

## Further Reading

- [System Architecture Overview](/architecture/overview) — the full platform architecture
- [Identity & Authentication Architecture](/architecture/identity-authentication) — how authentication works once traffic arrives
- [Security Architecture](/architecture/security) — security controls, secrets, RBAC, and compliance
- [Storage & Data Management Architecture](/architecture/storage-data-management) — persistent storage, databases, and backups
- [Security and Compliance](/blog/security-compliance) — blog post on the platform's security and compliance approach
- [Sovereign Cloud: SCS vs Proxmox + K3s](/blog/scs-vs-proxmox-k3s) — blog post on infrastructure platform comparison

---

*Every request tells a story as it travels from browser to pod. Knowing the path means knowing where to look when something goes wrong.*
