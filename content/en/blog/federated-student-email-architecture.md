---
title: "A Federal Architecture for Sovereign Student Email in German Higher Education"
date: "2026-08-26"
description: "A conservative analysis of a federated, open-source email and collaboration platform for 2.8 million students, modelled on Germany's federal education structure with one instance per Bundesland."
categories: ["architecture", "digital-sovereignty", "education"]
tags: ["federation", "email", "digital-sovereignty", "higher-education", "stalwart-mail", "kubernetes", "german-higher-education", "cost-analysis"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/federated-student-email-architecture-teaser.svg"
---

# A Federal Architecture for Sovereign Student Email in German Higher Education

Roughly 2.8 million students are enrolled at German higher-education institutions. Each requires an email address. Most institutions provide one, but the prevailing model — individual mail servers at each of approximately 400 institutions, or outsourcing to commercial cloud providers — produces fragmentation, duplicated operational overhead, and data flows that leave student communications outside German jurisdiction.

This article examines whether a federated, open-source architecture could address these problems *within the constraints of Germany's federal education system*. It does not advocate a single centralised platform. Instead, it proposes a model that mirrors the federal structure: one instance per Bundesland, institutional autonomy preserved, and federation via standard protocols. The analysis is intentionally conservative — cost figures are given as ranges with stated assumptions, not as precise claims.

## The Federal Context

Any proposal for national-scale infrastructure in German higher education must contend with a structural reality: education policy is a state responsibility (*Kulturhoheit der Länder*). The 16 Bundesländer hold sovereign competence over their education systems, including higher education. The federal government (*Bund*) cannot mandate participation, nor would such a mandate be desirable — it would conflict with the constitutional distribution of competences (Articles 30 and 70 of the Basic Law).

This is not merely a legal technicality. It shapes every aspect of the proposal:

- **Governance:** No federal authority can impose a unified email platform. Participation must be voluntary, organised at the Land level, and coordinated through existing federal structures.
- **Data protection:** Each Land has its own data protection authority (*Landesdatenschutzbeauftragter*). A centralised solution operating across all 16 Länder would need to satisfy up to 16 separate supervisory authorities, plus the federal commissioner. A federal model — one instance per Land — keeps data within each Land's jurisdiction and under its own data protection authority.
- **Procurement:** Public procurement in Germany is governed by EU directives and national law (VgV, UVgO). A Land-level instance procured by each Land's IT organisation follows procurement rules that are already familiar to state authorities.
- **University autonomy:** Article 5(3) of the Basic Law guarantees the autonomy of research and teaching. Universities are not mere administrative units of their Land; they have institutional autonomy. The model must allow individual institutions to self-host or to operate as tenants within a Land instance, as they choose.

The DFN (*Deutsches Forschungsnetz*) already operates the national research and education network and the DFN-AAI federated identity infrastructure. It is a natural candidate for the coordinating layer — not as a central operator, but as a neutral backbone providing shared services (network connectivity, identity federation, shared security) that all Land instances can build upon.

## Scale and Current Spending

Concrete figures help ground the discussion, but they should be treated as estimates with significant uncertainty.

| Metric | Estimate | Uncertainty |
|---|---|---|
| Higher-education institutions | ~400 | Includes universities, Fachhochschulen, and other providers |
| Students | ~2.8 million | Fluctuates by semester |
| Mail storage (email only, 1 GB/student) | ~2.8 PB usable | After archiving and cleanup |
| Inbound messages (pre-filter, 100/mailbox/day) | ~280 million/day | 2.8M x 100; 60% rejected at edge |
| Current aggregate spending | €40–80 million/year | Distributed across ~400 budgets; difficult to verify precisely |

The message volume figure warrants clarification: 2.8 million mailboxes receiving an estimated 100 messages per day (legitimate and spam, pre-filter) yields approximately 280 million messages per day, not 100 million. Of these, roughly 60% can be rejected at the network edge (invalid HELO, DNSBL, SPF failure) before content scanning, leaving approximately 110 million for further processing.

Current spending is the hardest figure to verify, as it is distributed across hundreds of institutional budgets with varying accounting practices. The range of €40–80 million per year covers licensing, staffing, and hardware for email and basic collaboration. It is indicative, not authoritative.

## A Federal Three-Tier Model

The proposed architecture has three tiers, each mapping to an existing structural unit in German education.

### Tier 1 — DFN Shared Services (Neutral Backbone)

The DFN operates the national research network and the DFN-AAI identity federation. In this model, DFN provides shared services that benefit all Land instances without operating any instance directly:

- **Network connectivity** (already in place)
- **Identity federation** via DFN-AAI and eduPerson attributes (already in place)
- **Shared security services**: DNSBL reputation, MTA-STS policy distribution, DKIM/DMARC monitoring, and threat-intelligence sharing across all Land instances
- **Coordination**: technical standards, interoperability testing, and a forum for Land IT organisations

DFN does not store student mailboxes. It provides the connective tissue. This respects its existing role and avoids creating a new central authority.

### Tier 2 — Land Instances (One per Bundesland)

Each Bundesland operates its own instance, serving the students enrolled at institutions within that Land. Small Länder (Bremen, Saarland) may pool resources or share an instance with a neighbouring Land, reducing the effective count to approximately 10–13 operational instances.

A Land instance provides:

- **Email** (SMTP, IMAP, POP3, JMAP) with spam and antivirus filtering
- **File storage** (Nextcloud)
- **Calendar and contacts** (CalDAV, CardDAV)
- **Messaging** (Matrix, federated)
- **Collaborative document editing**
- **Single sign-on** integrated with the Land's identity provider, federated via DFN-AAI

Each Land instance is operated by the Land's IT organisation (or a designated service provider) under the Land's data protection authority. The instance is sized for that Land's student population, not for the national total.

### Tier 3 — Institutional Autonomy (Tenants or Self-Hosted)

Within a Land instance, each university operates as a tenant — with its own domain, user management, and administrative policies. Institutions that prefer full operational control can deploy the same open-source stack on their own hardware and federate with the Land instance and with other institutions.

This is the critical design choice for respecting university autonomy: no institution is compelled to use the Land instance, and those that participate retain administrative control over their own domain, users, and policies.

### Federation

The three tiers are connected by standard protocols, not by a central authority:

- **SMTP**: Email is natively federated — a student at a Land instance can email a staff member at a self-hosted institution without either party leaving their environment.
- **Matrix**: Federated messaging across instances and self-hosted deployments.
- **CalDAV/CardDAV**: Calendar and contact sharing across institutional boundaries.
- **Nextcloud Federation**: File sharing between Land instances and self-hosted instances.
- **DFN-AAI**: Identity federation — students authenticate with their institutional credentials, validated through their home institution's identity provider.

Federation is the mechanism that replaces centralisation. No single operator holds all student data. Each Land controls its own instance. Each institution controls its own domain. Interoperability is ensured by open standards, not by a central authority.

## Cost Estimate

The following estimates are deliberately conservative, with ranges reflecting uncertainty in hardware pricing, staffing models, and storage allocation. They cover the federal model (Land instances + DFN shared services), not a single central deployment.

### Per-Land Instance (3-Year TCO)

| Component | Lower bound | Upper bound |
|---|---|---|
| Hardware (mail, collaboration, storage, control plane) | €80,000 | €150,000 |
| Colocation and connectivity | €45,000 | €90,000 |
| Operations (0.5–1 FTE, shared with existing Land IT) | €120,000 | €225,000 |
| **Per instance (3 years)** | **€245,000** | **€465,000** |

### Shared Services (DFN-Level, 3-Year TCO)

| Component | Lower bound | Upper bound |
|---|---|---|
| Security infrastructure (shared DNSBL, MTA-STS, monitoring) | €100,000 | €200,000 |
| Coordination and development (3–5 FTE) | €675,000 | €1,125,000 |
| **Shared (3 years)** | **€775,000** | **€1,325,000** |

### Aggregate (13 Instances + Shared, 3-Year TCO)

| Scenario | Total (3 years) | Per student per month |
|---|---|---|
| Lower bound (13 x €245k + €775k) | ~€4.0 million | ~€0.04 |
| Central estimate (13 x €355k + €1,050k) | ~€5.7 million | ~€0.06 |
| Upper bound (13 x €465k + €1,325k) | ~€7.4 million | ~€0.07 |

These figures assume email-focused deployment (1 GB/student). Including collaboration storage (file storage, versioning, backups) at 10–20 GB/student would increase storage costs substantially — potentially doubling the lower bound. Migration, training, and institutional integration costs are not included and would add to the initial deployment phase.

For comparison, current aggregate spending is estimated at €40–80 million per year (€120–240 million over three years). The federal model represents a significant reduction in aggregate infrastructure cost, though direct comparison is imperfect: current spending includes institutional overhead (local IT staff, individual procurement, per-institution licensing) that would not be entirely eliminated but would be substantially reduced through consolidation.

The per-student cost is approximately €0.04–€0.07 per month for email-focused deployment — roughly two orders of magnitude below typical commercial cloud licensing. This reflects the commodity nature of email at scale: the marginal cost of storing and delivering email is very low. The dominant cost is not infrastructure but coordination — which is precisely what the federal model is designed to address.

## Technical Foundations

The individual components are in production use today:

- **Stalwart Mail** (AGPL-3.0): a Rust-based mail server providing IMAP, POP3, SMTP, and JMAP with native full-text search. The AGPL-3.0 licence ensures that modifications remain open; a commercial licence is available for organisations that cannot comply with AGPL terms.
- **Nextcloud** (AGPL-3.0): file storage, sharing, and collaboration.
- **Matrix/Element** (AGPL-3.0): federated messaging.
- **Keycloak** (Apache-2.0): identity and access management, SAML/OIDC.
- Additional components for calendar, contacts, and video conferencing, deployed via container-native packaging (Kubernetes, Helm) and configuration management (Ansible).

The open-source licences are mixed (AGPL-3.0, Apache-2.0, MPL-2.0). The AGPL-3.0 components (Stalwart, Nextcloud, Matrix) require that any modifications distributed to users over the network be published under the same licence — a stronger copyleft than Apache-2.0, and one that reinforces rather than undermines sovereignty: institutions that modify the software are obliged to share their modifications, preventing private forks from undermining the commons.

The technical challenge at scale is operational orchestration — provisioning mailboxes across multiple Land instances, handling ~280 million inbound messages per day, and maintaining responsive IMAP performance. These are scaling problems with known solutions; the open-source ecosystem has addressed them at comparable scales in other sectors.

## Governance

A federal model requires federal governance. The proposed structure:

- **Each Land** operates its own instance under its own data protection authority (*Landesdatenschutzbeauftragter*). No central authority holds student data.
- **DFN** provides shared services and coordinates technical standards, operating in its existing role as the neutral research-network organisation.
- **A coordination body** (technical advisory board, drawn from Land IT organisations and DFN) sets interoperability standards and manages shared security services. It does not operate instances.
- **Funding** combines Land-level budgets (proportional to student counts), voluntary institutional contributions for enhanced services, and — if available — federal start-up financing through a *Digitalpakt*-style mechanism under Article 104b of the Basic Law (Bund finances, Länder execute). Note that the existing Digitalpakt Schule is specific to schools; a comparable instrument for higher education would need to be established or an existing higher-education funding line repurposed.

Participation is voluntary at every level. No Land is compelled to join. No institution is compelled to use its Land's instance. Data export via standard protocols (IMAP, CalDAV) is always available. There is no vendor lock-in: the entire stack is open-source, and the AGPL-3.0 licence ensures modifications remain open.

## Open Questions and Limitations

This analysis is a starting point, not a finished proposal. Several questions require further investigation:

1. **Cost validation.** The estimates above are based on production benchmarks for individual components, extrapolated to national scale. A proof-of-concept deployment — for example, 5,000 simulated mailboxes over 30 days on a single Land instance — would validate capacity assumptions and identify operational edge cases.

2. **Land-level adoption.** The model assumes voluntary Land participation. In practice, each Land has its own IT strategy, procurement rules, and political priorities. A pilot with three to five Länder of varying size would test the governance model and reveal coordination challenges.

3. **Data protection across jurisdictions.** While a Land instance keeps data within its Land, federation across instances means that metadata (routing information, calendar sharing) may cross Land boundaries. A data protection impact assessment (*Datenschutz-Folgenabschätzung* under Art. 35 GDPR) should evaluate the federated metadata flow before any pilot.

4. **Migration.** Migrating approximately 2.8 million mailboxes from existing systems — commercial cloud, institutional mail servers, or other providers — is a significant operational undertaking. Migration tooling, user communication, and a transition period (parallel operation) would be required.

5. **Small Länder.** Bremen (~20,000 students) and Saarland (~35,000) may not justify a dedicated instance. Pooling arrangements (shared instance with a neighbouring Land, or a DFN-hosted instance for small Länder) need to be defined.

6. **University autonomy in practice.** The model allows self-hosting, but a university that self-hosts forgoes the cost advantages of the Land instance. The balance between autonomy and consolidation is a political question for each institution.

## Conclusion

A sovereign, federated email and collaboration platform for German higher education is technically feasible and economically plausible. The per-student cost is a small fraction of current aggregate spending. The open-source stack eliminates vendor dependency. Data sovereignty is achieved by design — each Land controls its own instance under its own jurisdiction.

The federal model is not a compromise forced by constitutional constraints. It is the natural architecture for a system built on Land sovereignty, university autonomy, and voluntary cooperation. One instance per Bundesland, coordinated through the DFN, preserves political accountability while sharing the operational burden of a commodity service. Federation via standard protocols ensures that no institution is isolated — a student at a Land instance can collaborate with a staff member at a self-hosted university as naturally as two students on the same platform.

What remains is not a technical question. It is a question of coordination: aligning the political will of 16 Länder, establishing governance through the DFN, and validating the model with a pilot. The technology is ready. The federal structure is ready. The economics are favourable. The next step is a conversation.

---

## Further Reading

1. **Companion document.** A detailed capacity analysis and governance model is available as a companion technical document.
2. **Evaluate the stack.** The open-source components can be deployed from Ansible playbooks on a single node for evaluation.
3. **Discuss with Land IT organisations.** The model is designed for voluntary adoption; the more Land IT organisations that examine the numbers, the faster coordination can begin.

---

*Federation is not centralisation. It is cooperation without surrender.*
