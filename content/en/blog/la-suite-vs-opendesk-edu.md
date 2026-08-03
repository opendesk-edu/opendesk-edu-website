---
title: "La Suite vs. openDesk Edu: What France and Germany Have in Common — and What Not"
date: "2026-08-02"
description: "France has La Suite numérique, Germany has openDesk Edu. Both pursue digital sovereignty through open source — but their architectures, target audiences, and deployment models diverge sharply. A comparative analysis of Europe's two leading sovereign workplace initiatives."
categories: ["Digital Sovereignty", "Comparison", "European Collaboration"]
tags: ["la-suite", "france", "germany", "digital-sovereignty", "open-source", "dinum", "european-collaboration", "public-sector", "higher-education", "zendis"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/la-suite-vs-opendesk-edu-teaser.svg"
---

# La Suite vs. openDesk Edu: What France and Germany Have in Common — and What Not

> **The context:** Two European nations, two sovereign digital workplace initiatives — both built on open source, both rejecting GAFAM dependency, both claiming to protect public-sector data.
>
> **The question:** Are La Suite numérique and openDesk Edu converging toward a common European model, or are they fundamentally different projects that happen to share a philosophy?
>
> **The answer:** More in common than either side admits — and the differences are exactly where European collaboration should begin.

## Two Projects, One Conviction

In 2023, the French government launched **La Suite numérique** — a sovereign digital workspace for public administration, led by DINUM (Direction interministérielle du numérique). The promise: replace Google Workspace and Microsoft 365 with a curated set of open-source tools hosted on French sovereign infrastructure.

In Germany, **openDesk Edu** emerged from the **openDesk CE** upstream project — a modular, extensible platform for deploying open-source digital services. Built on Kubernetes with GitOps, openDesk provides the foundation, with Helm charts distributed via the **opencode.de** registry. openDesk Edu extends it with 25+ education and research services, including learning management systems, scientific computing, and research infrastructure. The platform is used in production at **Zendis**, demonstrating its readiness for real-world deployments.

Both projects are born from the same conviction: **European public institutions should not depend on US cloud providers for their core digital infrastructure**. Both reject the CLOUD Act exposure, the vendor lock-in, and the escalating licensing costs of the GAFAM stack. Both bet on open source as the path to sovereignty.

But how they got there — and where they're going — reveals a fascinating divergence.

## The Common Ground

### 1. Open Source as the Foundation

Both La Suite and openDesk Edu are built on the same open-source building blocks:

| Component | La Suite | openDesk Edu |
|-----------|----------|--------------|
| File sync & share | Resana (in production) | Nextcloud (OpenCloud) |
| Document editing | LibreOffice / Collabora | Collabora Online |
| Video conferencing | Visio (LiveKit-based, in-house development) | BigBlueButton + Jitsi |
| Messaging | Tchap (Matrix-based) | Matrix (Element) |
| Email | Messagerie (in-house development) | Dovecot + Postfix |
| Identity | AgentConnect / ProConnect | Keycloak + DFN-AAI |

The overlap is notable, though La Suite has developed several proprietary components. Both platforms use Matrix-based messaging (Tchap for La Suite, Element for openDesk Edu). The European open-source ecosystem provides a common foundation, even as La Suite has created custom solutions for several core services.

### 2. Digital Sovereignty as the Driving Principle

Both initiatives exist because of the same legal and political pressures:

- **GDPR compliance** — EU data protection law makes US-hosted services legally risky for public sector data
- **CLOUD Act exposure** — US providers can be compelled to hand over data to US authorities, even when stored in Europe
- **Schrems II ruling** — invalidated the Privacy Shield, making transatlantic data transfers legally uncertain
- **National sovereignty strategies** — both France and Germany have published digital sovereignty strategies that mandate preference for sovereign solutions

The BSI (Germany) and ANSSI (France) have both issued guidance critical of Microsoft 365 for public administration. The BSI published a detailed assessment in 2023 questioning the suitability of M365 for government use; ANSSI has been even more explicit, recommending sovereign alternatives.

### 3. Government and Institutional Backing

Neither project is a grassroots initiative. Both have institutional weight:

- **La Suite** is operated by DINUM, the French government's digital transformation unit, with funding from the French state budget and a mandate covering all French civil servants (~5.7 million potential users)
- **openDesk Edu** builds on the openDesk CE upstream project and is deployed at Zendis, demonstrating its enterprise readiness and scalability for educational and research institutions

### 4. The Common Enemy

Both projects define themselves in opposition to the same thing: **GAFAM dependency**. The narrative is identical on both sides of the Rhine:

- US providers offer aggressive discounts to capture public-sector accounts
- Once locked in, costs escalate and exit becomes impossible
- Data sovereignty is compromised by US jurisdiction
- Public money flows to foreign corporations instead of local economies

## Where They Diverge

### 1. Deployment Model: Centralized SaaS vs. Federated Self-Hosting

This is the single most important difference.

**La Suite** is a **centralized SaaS platform**. DINUM hosts the services on French sovereign infrastructure (currently on Bleu, the French sovereign cloud joint venture between Thales and OVHcloud, or on Outscale). French public servants connect to a single instance managed by DINUM. There is no local deployment — you use the government's instance or you don't use La Suite.

**openDesk Edu** is a **federated self-hosting platform**. Each institution deploys its own instance on its own Kubernetes cluster, built on the openDesk CE foundation. The platform's GitOps pipeline (ArgoCD + Helmfile) makes this reproducible, but the deployment is yours. As demonstrated by the Zendis deployment, openDesk Edu can scale from single institutions to larger consortia.

| Aspect | La Suite | openDesk Edu |
|--------|----------|--------------|
| Hosting | Centralized (DINUM) | Federated (per institution) |
| Infrastructure | French sovereign cloud | On-premise Kubernetes / any cloud |
| Upgrade cycle | DINUM-controlled | Institution-controlled |
| Customization | Limited (multi-tenant) | Full (per-instance) |
| Data residency | France (Bleu/Outscale) | Each institution's data center |

This is not a minor architectural detail. It reflects fundamentally different philosophies:

- **France** trusts the state to run a central service for all public servants. The state has the resources, the mandate, and the political will to operate at national scale.
- **Germany** trusts each institution to run its own. The federal structure of German higher education — each university is autonomous — makes a centralized model politically difficult. openDesk Edu's upstream openDesk CE project provides a foundation that any institution can use, as proven by Zendis.

### 2. Target Audience: Civil Servants vs. Academia

**La Suite** targets **French public sector employees** — ministers, agencies, regional governments, hospitals. The use cases are administrative: email, document editing, video meetings, file sharing, messaging. There is no concept of a "course" or a "lecture" or a "research project."

**openDesk Edu** targets **German higher education and research** — universities, research institutes, student services. The platform includes:

- **ILIAS and Moodle** — learning management systems used by millions of students
- **JupyterHub** — scientific computing and data analysis
- **BigBlueButton** — purpose-built for online teaching
- **XWiki** — collaborative knowledge management for research groups
- **OpenProject** — project management for research projects

These are not productivity tools — they are **education and research tools**. openDesk Edu's scope is broader and more specialized than La Suite's. A university needs LMS, lab notebooks, and research data management. A ministry does not.

### 3. Identity and Federation

**La Suite** uses **AgentConnect** (now transitioning to **ProConnect**) — France's national identity federation for public servants. It connects to French ministry identity providers via SAML/OIDC. The federation is domestic and centralized.

**openDesk Edu** uses **DFN-AAI** — the German national research and education federation — which connects to **eduGAIN**, the global inter-federation. A student at any German university (or any eduGAIN-participating institution worldwide) can authenticate to openDesk Edu via their home institution's IdP.

The difference in reach is significant: DFN-AAI/eduGAIN gives openDesk Edu access to thousands of institutions globally. AgentConnect/ProConnect is focused on French public administration and does not participate in eduGAIN.

### 4. Maturity and Scope

**La Suite** launched its first services in 2023 and is still in gradual rollout. As of 2026, the core services are:

- **Visio** — video conferencing (LiveKit-based, in-house development, GA)
- **Messagerie** — email (in-house development, in beta)
- **Resana** — file sharing (in-house development, in production)
- **Drive** — file sharing (in development and test rollout)
- **Tchap** — messaging (Matrix-based, GA)

The service catalog is intentionally lean — DINUM prioritizes quality and adoption over breadth.

**openDesk Edu** integrates 25+ services and builds on the proven openDesk CE foundation. The platform includes:

- Full collaboration suite (Nextcloud, Collabora, Matrix, email)
- Education tools (ILIAS, Moodle, BigBlueButton, XWiki)
- Scientific computing (JupyterHub)
- Project management (OpenProject, Planka, BookStack)
- Infrastructure (Keycloak, Kubernetes, ArgoCD, k8up backups)
- Security (Kyverno policies, ZKI IT-Grundschutz compliance)

The scope difference reflects the target: universities need a broader toolset than government offices. The Zendis deployment proves that this breadth can be managed effectively in production.

### 5. Governance and Community

**La Suite** is a **top-down government project**. DINUM sets the roadmap, chooses the tools, and controls the deployment. User feedback flows through formal channels. The code is open source, but the governance is centralized.

**openDesk Edu** is a **community-driven project**. While it builds on the openDesk CE upstream, the project is open on GitHub and Codeberg, accepts contributions, and publishes its roadmap publicly. The contributor agreement, the community-of-practice meetings, and the transparent gap analysis (the ZKI compliance work) all reflect a different governance model — one where institutions collaborate rather than receive a service. The Zendis deployment is a testament to this community-driven approach. The openDesk CE community also coordinates via the **opencode.de** platform, where charts and release artifacts are published.

### 6. Security and Compliance Frameworks

Both projects take security seriously, but they align to different national frameworks:

| Framework | La Suite | openDesk Edu |
|-----------|----------|--------------|
| National security standard | ANSSI guidance (France) | BSI IT-Grundschutz / ZKI (Germany) |
| Data protection | RGPD (French DPA: CNIL) | DSGVO (German DPA: BfDI) |
| Cloud certification | SecNumCloud (French sovereign cloud) | No equivalent — self-hosted |
| Audit model | ANSSI audits DINUM | University ISMS + ZKI profile |
| Policy enforcement | DINUM internal controls | Kyverno ClusterPolicies (GitOps) |

openDesk Edu's approach to compliance — 20+ enforceable Kyverno policies, a 111-point ZKI/BSI checklist, a public gap analysis — is more transparent than La Suite's. DINUM publishes security guidance, but the enforcement mechanisms are internal. openDesk Edu makes its policy code public.

## What France and Germany Could Learn From Each Other

### What openDesk Edu Could Learn From La Suite

1. **Centralized evaluation lowers the barrier.** La Suite's single instance means a French ministry can try the platform without deploying anything. openDesk Edu's self-hosting model requires Kubernetes expertise — a high barrier for smaller institutions. A shared evaluation instance would address this.

2. **Lean service catalog.** La Suite focuses on 5 core services and does them well. openDesk Edu's 25+ services are a strength but also a maintenance burden. Not every institution needs all of them — a tiered deployment model (core, extended, research) could help.

3. **Government mandate as an adoption driver.** La Suite benefits from an explicit French government mandate for sovereign digital tools. openDesk Edu relies on community adoption — slower, but more sustainable and flexible.

### What La Suite Could Learn From openDesk Edu

1. **Education-specific tools.** La Suite has no LMS, no scientific computing, no research data management. French universities that need these tools must look elsewhere. openDesk Edu's integration of ILIAS, Moodle, and JupyterHub is a model worth studying.

2. **Federated self-hosting for research data.** Research data often cannot leave the institution (ethical, legal, or technical constraints). La Suite's centralized model makes this harder. openDesk Edu's per-institution deployment gives each organization full control over sensitive research data.

3. **Transparent compliance.** openDesk Edu publishes its ZKI gap analysis, its Kyverno policies, and its compliance roadmap. La Suite's security posture is less publicly documented. Transparency builds trust — especially in academia.

4. **eduGAIN integration.** La Suite's AgentConnect/ProConnect is domestic. If it federated with eduGAIN, French researchers could collaborate seamlessly with international partners. openDesk Edu's DFN-AAI/eduGAIN integration is a proven model.

5. **Upstream-first development.** openDesk Edu builds on and contributes back to the openDesk CE upstream project. This ensures that improvements benefit the broader community and that deployments like Zendis can leverage shared advancements.

## The Bigger Picture: A European Sovereign Digital Stack?

The differences between La Suite and openDesk Edu are not bugs — they reflect genuine differences between French and German public-sector cultures. But they also represent a missed opportunity.

Imagine a **European sovereign digital stack** where:

- La Suite and openDesk Edu share the same open-source components (Nextcloud, Collabora, Matrix, Jitsi/BigBlueButton) with contributions flowing back to upstream projects like openDesk CE
- A French researcher visiting a German university authenticates via eduGAIN — no new account needed
- Both platforms adopt the same compliance vocabulary (mapping ANSSI guidance to BSI IT-Grundschutz)
- A shared evaluation infrastructure lets institutions try both before committing
- The European Commission's funding programs (Digital Europe Programme, Horizon Europe) support cross-border collaboration between the two initiatives

This is not utopian. The components are already shared. The open-source projects (Nextcloud, Matrix, Collabora) are the same. The political will exists in Paris and Berlin. What's missing is the **connective tissue**: a shared identity layer, a shared compliance framework, and a shared commitment to interoperability.

### The GAIA-X Connection

Both projects align with the GAIA-X vision of European data sovereignty — but from different angles:

- **La Suite** operates on Bleu, a GAIA-X-compatible sovereign cloud
- **openDesk Edu** runs on on-premise Kubernetes and can federate with GAIA-X infrastructure, as its upstream openDesk CE project supports flexible deployment models

A GAIA-X federation that connects La Suite's centralized services with openDesk Edu's federated deployments could create a genuinely European digital workplace — one where sovereignty is not just national, but continental.

## A Practical Call to Action

The openDesk Edu team has reached out to DINUM counterparts informally. The response has been positive — there is genuine interest in collaboration. Here's what we propose:

1. **A joint workshop** on sovereign digital workplaces in European public administration and research, highlighting both centralized (La Suite) and federated (openDesk Edu) approaches
2. **A shared component matrix** — mapping which open-source services each platform uses, identifying opportunities for joint development and upstream contributions to projects like openDesk CE
3. **eduGAIN integration for La Suite** — extending AgentConnect/ProConnect to participate in the global research federation, enabling cross-border collaboration
4. **A cross-border evaluation** — letting a French university pilot openDesk Edu (as Zendis has done) and a German institution pilot La Suite, to learn from both models
5. **A joint compliance mapping** — mapping ANSSI guidance to BSI IT-Grundschutz, creating a European security baseline for sovereign digital workplaces that both platforms can adopt

The time is right. The political winds favor sovereignty. The technology is proven. The communities are willing. What's needed is institutional commitment — and a few brave people on both sides of the Rhine willing to build the bridge.

## Conclusion

La Suite and openDesk Edu are not competitors. They are **complementary expressions of the same European idea**: that public institutions deserve digital infrastructure they control, that open source is the path to sovereignty, and that collaboration across borders makes all of us stronger.

France chose centralization; Germany chose federation through community-driven development on top of the openDesk CE upstream. France chose a lean service catalog; Germany chose breadth through a modular platform. France chose a government mandate; Germany chose community adoption. Both choices are legitimate — and both have something to teach the other.

The real competition is not La Suite vs. openDesk Edu. It's **European sovereignty vs. GAFAM dependency**. And on that front, we're on the same side.

The openDesk CE upstream project, with deployments like Zendis, proves that a modular, extensible foundation can support both centralized and federated deployment models — opening the door for true European collaboration.

---

*openDesk Edu is an open-source project, built on the openDesk CE upstream. We welcome contributions from across Europe — not just Germany. If you're working on sovereign digital infrastructure in France, Belgium, the Netherlands, or anywhere else, we'd love to hear from you.*

[Explore the openDesk Edu architecture and deployment guides](https://opendesk-edu.org)

[Learn more about La Suite numérique (in French)](https://www.numerique.gouv.fr/services/la-suite-numerique/)

[View the openDesk CE upstream project](https://opendesk.eu)

## Disclaimer and Trademark Notice

**Trademarks:** La Suite numérique is an initiative of DINUM (Direction interministérielle du numérique), the French government's digital transformation unit. openDesk and openDesk Edu are open-source projects. All product names and trademarks are the property of their respective owners. This article is an independent analysis and is not affiliated with, endorsed by, or sponsored by DINUM or the French government.

**Comparative advertising notice:** This article compares La Suite numérique and openDesk Edu. The comparison is based on publicly available information and the authors' assessment. Both initiatives have strengths and limitations, and the best choice depends on institutional circumstances.

**Opinion and assessment:** This article reflects the opinion and assessment of the openDesk Edu team. It is not legal, technical, or procurement advice.
