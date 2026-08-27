## Purpose

Canonical reference documentation for the openDesk Edu networking and traffic-flow architecture, describing how external traffic enters the cluster, how TLS is managed, how internal routing works, and how services are exposed.

## ADDED Requirements

### Requirement: Article covers the full traffic flow path

The article SHALL document the complete traffic path: external client → DNS → ingress controller → TLS termination → internal routing (Kubernetes services) → target pod. Each stage SHALL be explained with its purpose and configuration surface.

#### Scenario: Reader understands traffic flow

- **WHEN** an architect or administrator reads the article
- **THEN** they can trace a request from the public internet to the correct service pod and explain each component in the path

### Requirement: TLS certificate management is documented

The article SHALL describe how TLS certificates are provisioned and managed, including the role of openDesk Certificates (Bundesdruckerei), certificate renewal, and the chain of trust. It SHALL NOT include internal certificate details, private keys, or CA configurations.

#### Scenario: Institution plans certificate strategy

- **WHEN** an institution needs to understand how TLS is handled
- **THEN** the article explains the certificate authority, renewal cycle, and what happens when a certificate expires

### Requirement: Ingress and routing architecture is documented

The article SHALL describe the ingress controller pattern, how host-based and path-based routing work, how services are exposed (ClusterIP, Ingress, port forwarding), and how internal service-to-service communication works within the cluster.

#### Scenario: Administrator troubleshoots a routing issue

- **WHEN** a service is not reachable from outside the cluster
- **THEN** the article provides the conceptual model to diagnose: DNS → ingress rule → service → pod

### Requirement: DNS architecture is documented

The article SHALL describe the DNS setup: how external DNS records point to the cluster, how internal DNS (CoreDNS or equivalent) resolves service names, and how wildcard certificates or SAN entries cover multiple services.

#### Scenario: Institution configures DNS

- **WHEN** an institution sets up DNS for their deployment
- **THEN** the article explains which records are needed (A/AAAA, CNAME, MX for email) and how they map to the ingress

### Requirement: Network segmentation and policies are documented at a conceptual level

The article SHALL describe how network policies isolate services, which namespaces exist, and how traffic between namespaces is controlled. It SHALL NOT include internal network topologies, IP ranges, or specific policy YAML.

#### Scenario: Security review

- **WHEN** a security reviewer asks how services are isolated
- **THEN** the article explains the network policy model and namespace separation at a conceptual level

### Requirement: Article follows editorial rules

The article SHALL comply with the article-writing skill rules: institutional neutrality (Rule 1), no internal data leaks (Rule 2), no fixed service counts (Rule 3), vendor neutrality (Rule 4), and Abmahnrisiko compliance.

#### Scenario: Pre-publication checklist passes

- **WHEN** the article is reviewed before publication
- **THEN** it contains no internal IP addresses, node names, hostnames, or network topologies; all technical details are described as patterns, not specific deployments

### Requirement: Article exists in all four locales

The article SHALL be written in English (source of truth) and translated to German, French, and Chinese. File names (slugs) SHALL be identical across locales.

#### Scenario: Multi-locale availability

- **WHEN** a user navigates to the article in any of the four locales
- **THEN** the article is available in the respective language with the same structure and technical accuracy
