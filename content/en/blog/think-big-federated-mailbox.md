---
title: "Think Big: A Federated, Sovereign Mailbox for Every Student in Germany"
date: "2026-08-26"
description: "2.8 million German students rely on fragmented email infrastructure. A federated open-source approach could consolidate this into a single sovereign platform -- at an estimated five euros per student per month."
categories: ["Opinion", "Digital Sovereignty", "Education"]
tags: ["federation", "email", "digital-sovereignty", "higher-education", "stalwart-mail", "kubernetes", "german-higher-education", "cost-analysis"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/think-big-federated-mailbox-teaser.svg"
---

# Think Big: A Federated, Sovereign Mailbox for Every Student in Germany

Roughly 2.8 million students are enrolled at German higher-education institutions. Each one needs an email address. Each institution provides one -- or outsources the job to a commercial provider. The result is a landscape of roughly 400 separate email deployments, many of them running on infrastructure that stores student data outside German jurisdiction.

This does not need to be the case. The technology to run a sovereign, federated email and collaboration platform at national scale exists today. The economics work. The legal foundation is already in place. What is missing is the decision to do it.

## The Problem Is Not Technical

Germany's higher-education IT landscape is characterised by duplication. Every university operates its own mail server -- or pays a commercial cloud provider to do so. The administrative overhead is staggering: each institution employs staff to manage identity, storage, spam filtering, compliance, and backup for what is, at its core, the same service delivered thousands of times over.

The cost is not only financial. Student data -- emails, calendar entries, files -- flows through commercial platforms whose data centres sit in the United States, Ireland, or the Netherlands. The CLOUD Act allows US authorities to access data held by US-based providers regardless of where the physical servers are located. The European Court of Justice has repeatedly signalled that Standard Contractual Clauses alone may not be sufficient to protect against this.

For a research system that prides itself on data protection and scientific independence, this is a structural contradiction.

## The Numbers: How Big Is This, Really?

Putting concrete figures to the problem helps move the discussion from abstract sovereignty rhetoric to actionable planning.

**Scale.** Germany has around 400 higher-education institutions (universities, Fachhochschulen, and dual-system providers) serving approximately 2.8 million students. The average student mailbox, after archiving and cleanup, occupies roughly 1 GB. That is a total of about 2.8 PB of mail storage.

**Traffic.** A typical student account receives an estimated 10 legitimate emails per day. With spam and automated messages, the pre-filter volume reaches roughly 100 messages per mailbox per day -- or around 100 million messages per day across the entire student population. Roughly 60% of these can be rejected at the edge (invalid HELO, DNSBL, SPF failure) before any content scanning takes place.

**Current spending.** Published IT budgets suggest that German universities collectively spend an estimated 40 to 80 million euros per year on email and collaboration infrastructure, including licensing, staff, and hardware. This figure is distributed across hundreds of individual budgets and is difficult to verify precisely, but even the lower bound represents significant expenditure.

## A Federated Two-Pillar Model

The proposal is straightforward: a central service for students, complemented by an optional on-premises option for staff.

**Pillar 1 -- the central student service.** A single Kubernetes cluster (or a pair for geographic redundancy) hosted on the DFN backbone provides email, file storage, calendar, messaging, and office-suite capabilities to all participating students. Authentication integrates with DFN-AAI via eduPerson attributes. Students log in with their institutional credentials; their mailbox lives on sovereign infrastructure.

**Pillar 2 -- on-premises for staff.** Institutions that prefer to keep employee data on their own hardware can deploy the same open-source stack locally. The two pillars federate: Matrix for messaging, CalDAV and CardDAV for calendar and contacts, Nextcloud for file sharing. A student at one institution can message an employee at another without either party leaving their respective environment.

This two-pillar design respects the federal structure of German education policy. The central service is a voluntary offering; no institution is forced to join. But the economic case strengthens with every participant.

## What Does It Cost?

A capacity estimate for the central service, based on production benchmarks from Stalwart Mail (a Rust-based mail server that is significantly more resource-efficient than traditional Postfix/Dovecot setups), yields the following approximate hardware requirements:

| Component | Quantity | Role |
|---|---|---|
| Storage nodes | 14--16 | Ceph erasure-coded storage (approx. 7.5 PB raw) |
| Mail workers | 5--6 | SMTP ingestion, IMAP serving, spam/AV scanning |
| Control plane + load balancers | 12 | K8s management and traffic distribution |
| Monitoring | 3--4 | Observability stack |

Over a three-year period, the estimated total cost of ownership -- hardware, colocation, and roughly six full-time-equivalent staff for operations and development -- comes to approximately 1.8 million euros. Distributed across 2.8 million students over 36 months, that translates to roughly five euros per student per month.

This is an estimate. Actual costs will depend on the precise hardware chosen, colocation pricing, and staffing model. But even if the real figure were 50% higher, the per-student cost would remain well below what most institutions currently spend on fragmented, less scalable solutions.

For institutions that choose the on-premises pillar, a small university with around 500 employees can run the full stack on a single server starting at roughly 3,000 euros in hardware costs, plus existing IT staff.

## The Technical Foundations Are Ready

The individual components are not theoretical. Stalwart Mail is in production use and handles IMAP, POP3, SMTP, and JMAP with native full-text search. The broader openDesk Edu platform provides file storage, video conferencing, collaborative document editing, SSO integration, and a comprehensive suite of other collaboration services -- all container-native and deployable via Ansible and Helm charts on Kubernetes.

The key challenge at national scale is not individual component maturity but operational orchestration: provisioning 2.8 million mailboxes, handling 100 million inbound messages per day, and maintaining sub-second IMAP response times across a geographically distributed storage cluster. These are scaling problems, not research problems, and the open-source ecosystem has solved them at comparable scales in other sectors.

## Governance: Who Runs It?

A central service for 2.8 million students needs a governance structure that is acceptable to all 16 federal states. Education policy in Germany is a state responsibility (Kulturhoheit), so a federal mandate is neither realistic nor desirable.

A practical model: a non-profit association (e.V.) under the umbrella of an existing research-network organisation, governed by a technical advisory board drawn from state IT organisations, a data protection council, and a student representative body. Funding would combine federal start-up financing (potentially through the Digitalpakt programme), ongoing contributions from participating states proportional to their student counts, and voluntary contributions from institutions that opt for enhanced services.

Participation is voluntary. Data export via standard protocols (IMAP, CalDAV) is always available. There is no vendor lock-in -- the entire stack is Apache-2.0 licensed.

## What Needs to Happen Next

The technology is not the bottleneck. The bottleneck is institutional coordination.

1. **A conversation between federal and state education ministries and the DFN.** The proposal needs a political sponsor. The DFN already operates the national research network and has experience with federated identity infrastructure.

2. **A data-protection impact assessment.** Centralising 2.8 million mailboxes changes the data-protection calculus. An external data-protection officer should evaluate the architecture before any pilot.

3. **A proof of concept.** A 30-day test deployment with 5,000 simulated mailboxes on the proposed infrastructure would validate the capacity estimates and identify operational edge cases.

4. **Pilot institutions.** Three to five universities of varying size and from different federal states could validate the model with real users before wider rollout.

## Conclusion

Running a sovereign email and collaboration platform for every student in Germany is not a question of technical feasibility. It is a question of political will and institutional coordination. The per-student cost is a fraction of what institutions currently spend in aggregate. The data-sovereignty benefits are immediate and irreversible. The open-source stack eliminates vendor dependency entirely.

The numbers are large. That is the point. Thinking at the scale of the national student population is unfamiliar in a system built around institutional autonomy. But autonomy and federation are not opposites. A well-designed federated platform gives each institution full control over its on-premises data while pooling the operational burden of a commodity service at a scale that none of them could achieve alone.

---

## What You Can Do

1. **Read the full proposal:** The detailed capacity analysis and governance model is available as a companion document.
2. **Test the stack:** openDesk Edu deploys from a single Ansible playbook. Start with a single-node instance and evaluate.
3. **Join the conversation:** Share this with your institution's IT leadership. The more decision-makers see the numbers, the faster coordination can begin.

---

*The most scalable infrastructure is the one you build once and share with everyone.*
