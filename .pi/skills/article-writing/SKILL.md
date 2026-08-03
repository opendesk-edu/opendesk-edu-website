---
name: article-writing
description: >
  Write or revise blog articles for the openDesk Edu website. Use when creating,
  editing, translating, or reviewing any content under content/{locale}/blog/,
  content/{locale}/components/, content/{locale}/architecture/, or
  content/{locale}/get-started/. Enforces institutional neutrality, internal-data
  protection, and vendor-neutrality rules.
---

# Article Writing Skill

## When to Use

- Creating a new blog post in `content/{en,de,fr,zh}/blog/`
- Revising or translating an existing article
- Reviewing an article for publication readiness
- Generating article frontmatter, teasers, or SVG images

## The Four Core Rules

These rules are **non-negotiable**. Every article must satisfy all four before
publication.

### Rule 1 — No Institutional Branding

Never reference the hosting institution, its internal names, or its staff in
published content.

| Forbidden | Why | Replacement |
|-----------|-----|-------------|
| HRZ, HRZ Marburg, Hochschulrechenzentrum Marburg | Names the operator | "the openDesk Edu community", "the project team", "production deployment" |
| University of Marburg, Philipps-Universität Marburg, Universität Marburg, Université Philipps de Marbourg, 马尔堡大学 | Names the institution | "a German university", "the institution", or omit |
| HRZ Maui, Maui cluster, vhrz2331–2339, node names | Internal infrastructure names | "the production cluster", "production" |
| HRZ network admins, HRZ-Netzadministration | Internal team names | "the network team", "network administrators" |
| `*.hrz.uni-marburg.de` domains | Internal hostnames | `opendesk-edu.org`, `*.example.edu` |
| `weblogin.uni-marburg.de`, `jupyter.uni-marburg.de`, etc. | Internal service hostnames | `weblogin.example.edu`, `jupyter.example.edu`, etc. |
| Copyright "HRZ Uni Marburg" / "HRZ Marburg" | Attribution to institution | "openDesk Edu Contributors" |

**Exception — Matrix channel:** The Matrix channel reference
`#opendesk-ce-public:matrix.uni-marburg.de` is the **only** permitted
`uni-marburg.de` reference. It is a public community channel, not an
institutional identifier. Do not remove or alter it.

**Exception — Generic term:** The German word "Hochschulrechenzentrum" used
generically (meaning "any university computing centre", not naming a specific
one) is permitted.

### Rule 2 — No Internal Data Leaks

Never expose operational internals, infrastructure details, or sensitive
configuration in published content.

**Never publish:**
- Internal IP addresses (e.g., `192.168.3.x`, `137.248.x.x`)
- Internal node names or hostnames (e.g., `vhrz2331`)
- Internal cluster topology (node counts, control-plane/worker layout)
- Credentials, secrets, tokens, or API keys
- Internal network topology, proxy addresses, or DNS configurations
- Internal storage class names or PVC details
- Backup targets or S3 endpoints
- ArgoCD internal URLs or admin console paths
- Any value from a Kubernetes `Secret` or `ConfigMap`

**Safe to publish (as general architecture descriptions):**
- Service names (Nextcloud, Keycloak, MariaDB, etc.)
- Technology choices (Kubernetes, Helm, ArgoCD, k8up, etc.)
- Architecture patterns (GitOps, SAML federation, OIDC)
- Open-source project names and versions
- Public domain names (`opendesk-edu.org`)
- Public documentation links
- High-level metrics (number of services, pod counts as general figures — not
  tied to a specific cluster's real-time state)

**When in doubt:** Describe the *pattern*, not the *deployment*. Write "a
3-node control plane with 6 workers" not "vhrz2331–2333 (control) and
vhrz2334–2339 (workers)".

### Rule 3 — No Fixed Service Counts

Never use a fixed number to describe the size of the openDesk Edu service
suite. The platform's value is its **breadth** — there is an open-source
alternative for every part of the digital workplace stack — not a specific
count that becomes stale the moment a service is added or removed.

**Forbidden patterns:**

| Instead of | Use |
|-----------|-----|
| "25 integrated services" | "a comprehensive suite of integrated open-source services" |
| "25+ services" | "a broad range of integrated services" |
| "The 25 Integrated Services" (heading) | "The Integrated Service Suite" |
| "each of the 25 services" | "each service in the suite" |
| "all 25 services" | "all services in the suite" |
| "25/25 service specs" | "complete service specifications" |
| "57 pods, 33 services" (cluster state) | Describe the architecture pattern, not the live count |
| "deploys 50+ services across 12+ namespaces" | "deploys a comprehensive service suite across multiple namespaces" |

**Why:**
1. **Staleness** — the number changes with every release; articles become
   inaccurate immediately.
2. **Specificity vs. breadth** — the point is that openDesk Edu offers
   alternatives for *every* part of the suite (file sharing, video conferencing,
   LMS, wiki, mail, identity, etc.), not that there is a magic number.
3. **Consistency** — different articles cite different counts (25, 28, 33, 50+),
   which looks unprofessional and invites fact-checking.

**Exception:** Exact counts are permitted inside a **specification or registry
document** (e.g., `openspec/specs/_registry/`) where the number is
authoritative and maintained. Blog articles and marketing pages must use
descriptive language instead.

### Rule 4 — Vendor and Player Neutrality

Reference organizations, vendors, and initiatives by name when relevant, but
**never endorse, criticise, or show favoritism** toward any of them. Articles
must read as neutral, factual, and community-driven.

**Do:**
- Name organizations factually: "ZenDiS (Zentrum für Digitale Souveränität)",
  "BMDS", "the BSI", "DFN-AAI", "the openDesk community"
- Describe what an organization *does* or *provides* without value judgments
- Compare approaches on technical merits with neutral language
- Cite sources with links

**Don't:**
- Endorse a vendor ("ZenDiS is the best choice for…")
- Criticise a competitor ("Unlike Microsoft's locked-down approach…")
- Show favouritism ("We prefer…", "The superior option is…")
- Make unsubstantiated claims about other organizations
- Imply partnership or affiliation without evidence

**Neutral phrasing examples:**

| Instead of | Use |
|------------|-----|
| "We partnered with ZenDiS" | "ZenDiS provides [X]; openDesk Edu integrates [Y]" |
| "Unlike Microsoft's expensive lock-in" | "Proprietary alternatives may involve vendor lock-in and per-user licensing costs" |
| "The best LMS available" | "A widely used LMS in European higher education" |
| "We recommend BigBlueButton over Zoom" | "BigBlueButton provides self-hosted video conferencing; institutions may compare it with commercial alternatives" |

## Article Structure

### Frontmatter (required)

Every article must include YAML frontmatter:

```yaml
---
title: "Article Title in Title Case"
date: "YYYY-MM-DD"
description: "One-sentence summary for SEO and social sharing (max 160 chars)."
categories: ["category-lowercase"]
tags: ["tag1", "tag2", "tag3"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/article-slug-teaser.svg"
---
```

**Rules:**
- `title`: Descriptive, not clickbait. Title Case for EN; appropriate capitalisation for DE/FR/ZH.
- `description`: Factual, no marketing buzzwords, max 160 characters.
- `categories`: 1–3 lowercase categories (e.g., `announcement`, `technical`, `architecture`, `opinion`, `tutorial`, `community`, `security`).
- `tags`: 3–8 lowercase tags relevant to the content.
- `author`: Always `"Tobias Weiß and openDesk Edu Contributors"` — never attribute to an institution.
- `image`: SVG teaser from `/static/blog/`. Must exist in `public/static/blog/`.

### Body Structure

```markdown
# Title (H1 — matches frontmatter title)

Opening paragraph: hook + thesis (2–3 sentences).

## Section Heading (H2)

Body text...

### Subsection (H3)

Body text...

---

## Call to Action

1. **Action item**: What the reader should do
2. **Resource**: Where to go next
3. **Community**: How to get involved

---

*Tagline.* (italic, one sentence summarising the article's theme)
```

### Tone and Style

- **Professional but accessible** — write for CIOs, IT directors, and system
  administrators simultaneously.
- **Data-driven** — cite numbers, metrics, and version numbers where available.
  Round or approximate sensitive figures.
- **Active voice** — "openDesk Edu deploys 25 services" not "25 services are
  deployed by openDesk Edu".
- **No marketing fluff** — avoid "revolutionary", "game-changing", "best-in-class".
  Use factual descriptions.
- **Inclusive language** — "we" refers to the openDesk Edu community, not any
  specific institution.
- **Consistent terminology** — use the same English term throughout an article;
  do not alternate between synonyms.

### Multi-Language Articles

Every article exists in four locales: `content/{en,de,fr,zh}/blog/`.

- The EN article is the source of truth. Translations follow the same structure.
- Translate meaning, not literally — adapt idioms and phrasing for each locale.
- Keep code blocks, command names, and proper nouns (openDesk Edu, Kubernetes,
  Helm) in English across all locales.
- Frontmatter `title` and `description` must be translated.
- Tags may be translated (e.g., `produktion` in DE for `production`).
- File names (slugs) are identical across all locales.

## Abmahnrisiko-Analyse (Cease-and-Desist Risk Analysis)

In the German legal context, an *Abmahnung* is a formal pre-litigation warning
letter. Competitors, rights holders, and consumer-protection associations can
issue Abmahnungen — and recover legal costs — for violations of competition law
(UWG), trademark law (MarkenG), copyright (Urheberrecht), naming rights, and
data protection law (GDPR/DSGVO).

The Three Core Rules above address editorial policy. This section covers the
**legal risks** that go beyond style — areas where an Abmahnung carries
financial consequences. Each risk area cross-references the Core Rule it
extends; only the genuinely new legal content is listed here.

### Risk Areas (with verification questions)

Answer the **Verify** question for each area before publication. If any answer
reveals a risk, rephrase the content. Do not publish an article with an
unresolved Abmahnrisiko finding.

**1. Markenrecht (Trademark law)** — *extends Rule 3*
- Mark third-party trademarks correctly (e.g., `Microsoft 365™`, `BigBlueButton®`).
- Do not use trademarks as generic nouns or verbs.
- Endorsement and affiliation prohibitions are already covered by Rule 3.
- **Verify:** Does the article use any third-party trademark? Are they marked
  (™/®) and used correctly (not as generics)?

**2. Wettbewerbsrecht / UWG (Unfair competition law)** — *extends Rule 3*
- All quantitative claims (cost savings, performance figures, user counts) must
  be sourced, verifiable, or clearly marked as estimates (§ 5a UWG).
- No misleading statements (§ 5a UWG).
- Denigrating comparisons and disparagement are already covered by Rule 3.
- **Verify:** Are all quantitative claims sourced or clearly marked as estimates?

**3. Urheberrecht (Copyright)** — *new*
- All images and SVG teasers must be original or properly licensed (CC-BY, CC0,
  etc.) with attribution.
- Quotations must be short, attributed, and justified (Zitatrecht, § 51 UrhG).
- Do not reproduce substantial parts of third-party works.
- Include SPDX headers on source files in the spec repo.
- **Verify:** Are all images original or properly licensed? Are quotations short
  and attributed? (§ 51 UrhG)

**4. Namensrecht (Naming rights)** — *covered by Rule 1*
- Rule 1 already prohibits naming the institution. No additional content beyond
  the Rule 1 checklist.
- **Verify:** (covered by Rule 1 checklist — no separate check needed)

**5. Datenschutz / DSGVO (Data protection)** — *extends Rule 2*
- No personal data of identifiable individuals (names, emails, photos of staff).
- Infrastructure data leaks are already covered by Rule 2.
- **Verify:** Does the article expose any personal data of identifiable
  individuals? (DSGVO — distinct from Rule 2's infrastructure data)

**6. Bildnachweis (Image attribution)** — *new*
- SVG teasers in `public/static/blog/` must be original or CC-licensed with
  attribution.
- **Verify:** Does each `image:` frontmatter path resolve to a licensed file?

## Pre-Publication Checklist

Before marking any article as ready, verify every item:

### Institutional Neutrality
- [ ] No "HRZ", "Marburg", "Philipps-Universität", "vhrz" anywhere in the article
- [ ] No `*.hrz.uni-marburg.de` or `*.uni-marburg.de` domains (except Matrix channel)
- [ ] No internal node names, IP addresses, or hostnames
- [ ] Copyright/attribution uses "openDesk Edu Contributors", not an institution
- [ ] Tags and categories do not reference the institution

### Internal Data Protection
- [ ] No credentials, secrets, tokens, or API keys
- [ ] No internal network topology, proxy addresses, or DNS details
- [ ] No real-time cluster state (pod counts tied to a specific deployment)
- [ ] No internal storage class names or PVC details
- [ ] No ArgoCD admin paths or internal console URLs
- [ ] Architecture descriptions use general patterns, not specific deployments

### Rule 3 Compliance (No Fixed Service Counts)
- [ ] No fixed service counts ("25 services", "25+ services", "33 services", "50+ services")
- [ ] Service suite described by breadth, not by number ("a comprehensive suite of…")
- [ ] Headings do not contain service counts ("The 25 Integrated Services" → "The Integrated Service Suite")
- [ ] Cluster state numbers (pod counts, service counts) replaced with architectural descriptions

### Vendor Neutrality
- [ ] Organizations named factually (ZenDiS, BMDS, BSI, DFN-AAI, etc.)
- [ ] No endorsements or criticism of specific vendors
- [ ] Comparisons use neutral language and cite technical merits
- [ ] No implied partnerships without evidence

### Structure and Quality
- [ ] Frontmatter complete (title, date, description, categories, tags, author, image)
- [ ] Author field is `"Tobias Weiß and openDesk Edu Contributors"`
- [ ] H1 matches frontmatter title
- [ ] Sections use H2/H3 hierarchy correctly
- [ ] Call to action at the end
- [ ] SVG teaser exists at the `image` path
- [ ] All internal links are valid (no dead links)
- [ ] No TODO markers or placeholder text remaining
- [ ] SPDX header present if the file is in the spec repo (not required for blog content)

### Abmahnrisiko (Legal Risk — additions to the Core Rules)
- [ ] Third-party trademarks marked correctly (™/® where applicable, not used as generics)
- [ ] All quantitative claims sourced or clearly marked as estimates (UWG § 5a)
- [ ] Images and SVG teasers are original or properly licensed with attribution
- [ ] Quotations are short, attributed, and justified (§ 51 UrhG)
- [ ] No personal data of identifiable individuals (DSGVO)

## Helper Commands

### Check an article for institutional references

```bash
# Replace ARTICLE with the file to check
rg -i "hrz|marburg|philipps|vhrz|uni-marburg" content/en/blog/ARTICLE.md \
  | grep -v "matrix.uni-marburg.de"
# Expected: no output (clean)
```

### Check all articles for internal data leaks

```bash
# Scan for IP addresses, node names, internal hostnames
rg -n "\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|vhrz\d|\.internal\b|\.cluster\.local" \
  content/ --include="*.md"
# Expected: no output (clean)
```

### Verify vendor neutrality and legal compliance

```bash
# Combined scan: editorial bias (Rule 3) + trademark markers + UWG comparative/superlative language
rg -in "we recommend|the best|superior to|better than|unlike .* locked|prefer .* over|™|®|beste|überlegen|im Vergleich zu|spart.*%|billiger|günstiger|besser als|übertrifft" \
  content/ --include="*.md"
# Review each hit for proper trademark marking, UWG compliance, and neutral phrasing
```

### Check for fixed service counts (Rule 3)

```bash
# Scan for fixed service counts that should be replaced with descriptive language
rg -in '\b25\b.*service|\b25\+|\b28\b.*service|\b33\b.*service|\b50\+.*service' \
  content/ --glob='*.md'
# Expected: no output (clean) — all service counts should use descriptive language
```

### Verify SVG teaser exists

```bash
# Extract image path from frontmatter and check file exists
IMAGE=$(grep '^image:' content/en/blog/ARTICLE.md | sed 's/.*: "//;s/"//')
ls -la "public${IMAGE}"
```

## References

- [Existing blog articles](content/en/blog/) — use as style reference
- [Existing SVG teasers](public/static/blog/) — visual style reference
- [CONTRIBUTING.md](CONTRIBUTING.md) — general contribution guidelines
- [docs/superpowers/specs/](docs/superpowers/specs/) — article design specs
