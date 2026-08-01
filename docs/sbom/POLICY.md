# SBOM Policy für openDesk Edu

## 1. Purpose

Diese Richtlinie definiert die **Verantwortlichkeiten, Prozesse und Anforderungen** für die Generierung, Verwaltung und Veröffentlichung von **Software Bill of Materials (SBOMs)** im openDesk Edu-Projekt. SBOMs sind essenziell für **Sicherheit, Transparenz und Compliance** in der Software-Lieferkette.

## 2. Scope

Diese Richtlinie gilt für:
- ✅ Alle **Software-Komponenten** des openDesk Edu-Projekts
- ✅ Alle **Entwickler:innen**, die am Projekt mitwirken
- ✅ Alle **Releases** und Versions-updates
- ✅ Alle **Abhängigkeiten** (direkt und transitive)
- ✅ Alle **Drittanbieter-Komponenten**

## 3. Responsibilities

### 3.1 Overall Responsibility

| Rolle | Verantwortung | Kontakt |
|-------|---------------|---------|
| **Project Lead** | Gesamtverantwortung für SBOM-Compliance | project-lead@opendesk-edu.org |
| **Security Team** | Sicherheit und Vulnerability Management | security@opendesk-edu.org |
| **DevOps Team** | CI/CD Integration und Automatisierung | devops@opendesk-edu.org |
| **Developers** | SBOM-Aktualisierung bei Code-Änderungen | Alle Entwickler:innen |
| **Compliance Officer** | Einhaltung von Standards und Vorschriften | compliance@opendesk-edu.org |

### 3.2 Specific Responsibilities

#### 3.2.1 Project Lead
- Genehmigung dieser Richtlinie
- Bereitstellung notwendiger Ressourcen
- Eskalation bei Compliance-Problemen
- Regelmäßige Überprüfung der SBOM-Prozesse

#### 3.2.2 Security Team
- **SBOM-Generierung** bei jedem Release
- **Validierung** der SBOM-Inhalte
- **Vulnerability Scanning** basierend auf SBOMs
- **Incident Response** bei Sicherheitsvorfällen
- **Signierung** der SBOMs
- **Veröffentlichung** auf container.gov.de

#### 3.2.3 DevOps Team
- **Automatisierung** der SBOM-Generierung in CI/CD
- **Integration** mit Build-Pipelines
- **Bereitstellung** der SBOM-Tools
- **Wartung** der SBOM-Infrastruktur
- **Monitoring** der SBOM-Generierung

#### 3.2.4 Developers
- **Aktualisierung** der SBOMs bei Änderungen an Abhängigkeiten
- **Dokumentation** neuer Komponenten
- **Einhaltung** der Lizenzanforderungen
- **Meldung** von Sicherheitsbedenken

## 4. SBOM Generation Requirements

### 4.1 When to Generate SBOMs

SBOMs **MÜSSEN** generiert werden in folgenden Fällen:

| Event | SBOM Generation Required | Trigger |
|-------|--------------------------|---------|
| **New Release** | ✅ **Ja** | Git Tag Push |
| **Dependency Update** | ✅ **Ja** | `package.json`, `go.mod`, `requirements.txt` Änderungen |
| **Security Patch** | ✅ **Ja** | Bei jedem Security Fix |
| **Component Addition** | ✅ **Ja** | Neue Komponente hinzugefügt |
| **Regular Schedule** | ✅ **Ja** | Monatlich für aktive Projekte |
| **Manual Request** | ✅ **Ja** | Auf Anfrage |
| **Component Removal** | ⚠️ **Optional** | Bei Entfernung von Komponenten |
| **Code Refactoring** | ❌ **Nein** | Ohne Abhängigkeitsänderungen |
| **Documentation Only** | ❌ **Nein** | Keine Code-Änderungen |

### 4.2 When SBOM Updates Can Be Delayed

SBOM-Updates **KÖNNEN** verzögert werden für:
- 🟡 **Minor Documentation Updates** (max. 7 Tage)
- 🟡 **Internal Refactoring** ohne Abhängigkeitsänderungen (max. 7 Tage)
- 🟡 **CI/CD Pipeline Changes** ohne Software-Änderungen (max. 3 Tage)

**Achtung:** Für **Sicherheitsrelevante Änderungen** ist **keine Verzögerung** erlaubt!

### 4.3 SBOM Generation Frequency

| Component Type | Generation Frequency | Reason |
|----------------|----------------------|--------|
| **Production Releases** | Bei jedem Release | Compliance-Anforderung |
| **Active Development Branches** | Wöchentlich | Aktualität |
| **Maintenance Branches** | Monatlich | Low Risk |
| **Archived Components** | Bei Bedarf | Keine aktiven Änderungen |

### 4.4 SBOM Update SLA

| Priority | SLA | Examples |
|----------|-----|----------|
| **P0 - Critical** | 4 Stunden | Sicherheitslücken, Compliance-Verpflichtungen |
| **P1 - High** | 24 Stunden | Major Release, neue Hauptkomponenten |
| **P2 - Medium** | 72 Stunden | Minor Release, Abhängigkeits-Updates |
| **P3 - Low** | 7 Tage | Dokumentation, interne Tools |

## 5. SBOM Content Requirements

### 5.1 Required Information

Jede Komponente in einem SBOM **MUSS** folgende Informationen enthalten:

#### 5.1.1 Component Identification
- ✅ **Name** - Name der Komponente
- ✅ **Version** - genaue Version (kein "latest")
- ✅ **Type** - Typ (library, framework, application, etc.)
- ✅ **BOM Reference** - Eindeutige ID in der SBOM
- ✅ **Package URL (purl)** - Standardisiertes Format

#### 5.1.2 Component Details
- ✅ **Description** - Beschreibung der Komponente
- ✅ **Licenses** - SPDX-LizenzIdentifier
- ✅ **Author/Supplier** - Herausgeber der Komponente
- ✅ **External References** - Website, Repository, Dokumentation

#### 5.1.3 Dependency Information
- ✅ **Direct Dependencies** - Alle direkten Abhängigkeiten
- ⚠️ **Transitive Dependencies** - Empfohlen, mindestens 2 Ebenen
- ✅ **Dependency Relationships** - Abhängigkeitsbeziehungen

### 5.2 Optional Information

Folgende Informationen **SOLLTEN** enthalten sein, wenn verfügbar:

- 🟡 **Homepage** - Offizielle Website
- 🟡 **Source Code Repository** - Git Repository URL
- 🟡 **Documentation URL** - Link zur Dokumentation
- 🟡 **Vulnerability Database References** - CVE, NVD, etc.
- 🟡 **Security Contact** - Kontakt für Sicherheitsfragen
- 🟡 **Support Information** - Support-Optionen
- 🟡 **End-of-Life Information** - EOL-Datum
- 🟡 **Security Advisories** - Bekannte Sicherheitsprobleme

### 5.3 Quality Requirements

| Requirement | CycloneDX | SPDX | Validation Method |
|-------------|-----------|------|-------------------|
| **Valid JSON** | ✅ | ✅ | JSON Schema Validation |
| **Correct Format** | ✅ | ✅ | cyclonedx-validator, spdx-validate |
| **All Required Fields** | ✅ | ✅ | Schema Validation |
| **Unique IDs** | ✅ | ✅ | BOM-Ref/SPDXID Uniqueness |
| **License Validity** | ✅ | ✅ | SPDX License List |
| **purl Validity** | ✅ | ✅ | purl-spec |

## 6. SBOM Formats

### 6.1 Supported Formats

| Format | Status | Use Case | File Extension |
|--------|--------|----------|----------------|
| **CycloneDX 1.5** | ✅ Primary | Alle Komponenten | `*.cyclonedx.json` |
| **SPDX 2.3** | ✅ Secondary | Lizenz-Compliance | `*.spdx.json` |
| **CycloneDX 1.4** | ⚠️ Legacy | Abwärtskompatibilität | `*.cdx.json` |
| **SPDX 2.2** | ⚠️ Legacy | Abwärtskompatibilität | `*.spdx22.json` |

### 6.2 Format Selection Guide

| Use Case | Recommended Format | Reason |
|----------|-------------------|--------|
| **container.gov.de Upload** | CycloneDX 1.5 | Empfohlenes Format |
| **License Compliance** | SPDX 2.3 | Bessere Lizenzunterstützung |
| **Vulnerability Scanning** | CycloneDX 1.5 | Grype, Dependency-Track |
| **Supply Chain Security** | CycloneDX 1.5 | NTIA Minimum Elements |
| **EU CRA Compliance** | CycloneDX 1.5 | Offiziell empfohlen |
| **US Government** | CycloneDX 1.5 | NIST Empfehlung |

## 7. SBOM Generation Processes

### 7.1 Automated Generation (Recommended)

#### 7.1.1 GitHub Actions Workflow
```yaml
# .github/workflows/sbom.yml
name: Generate SBOM
on:
  workflow_dispatch:  # Manual trigger
  push:
    tags: ['*']      # On release
    paths:
      - 'package.json'
      - 'go.mod'
      - 'requirements.txt'
      - 'Chart.yaml'
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: make ci-generate
```

#### 7.1.2 Local Generation
```bash
# Alle SBOMs generieren
make all

# Nur CycloneDX für Website
make website

# Alle SBOMs mit Signierung
make ci-generate
```

### 7.2 Manual Generation

Falls automatisierte Generierung nicht möglich ist:

1. **Website (Next.js/Node.js)**
   ```bash
   cd opendesk-edu-website
   npx @cyclonedx/cyclonedx-npm@latest -o ../sbom-output/sbom-website.json
   ```

2. **Go Applications**
   ```bash
   cd opendesk-dev-agent-operator
   cyclonedx-gomod mod -output ../sbom-output/sbom-operator.json
   ```

3. **Python Applications**
   ```bash
   cd user_import
   cyclonedx-py -r requirements.txt -o ../sbom-output/sbom-python.json
   ```

4. **Helm Charts**
   ```bash
   make helm
   ```

### 7.3 SBOM Validation

Jede generierte SBOM **MUSS** validiert werden:

```bash
# Alle SBOMs validieren
make validate

# Einzelne SBOM validieren
cyclonedx-validator sbom-website.json
spdx-validate sbom-website-spdx.json
```

## 8. SBOM Signing

### 8.1 Signing Requirements

| Scenario | Signing Required | Reason |
|----------|-----------------|--------|
| **Production Releases** | ✅ **Ja** | Authentizität und Integrität |
| **container.gov.de Upload** | ✅ **Ja** | Vertrauenswürdigkeit |
| **Internal Use Only** | ⚠️ Optional | Abhängig von Risiko |
| **Development Builds** | ❌ **Nein** | Keine Produktion |

### 8.2 Signing Process

```bash
# 1. Schlüsselpaar generieren (einmalig)
cosign generate-key-pair

# 2. SBOMs signieren
make sign

# 3. Signatur überprüfen
cosign verify-blob --key cosign.pub --signature sbom.json.sig sbom.json
```

### 8.3 Key Management

- **Private Key** (`cosign.key`)
  - ✅ **Sicher speichern** (GitHub Secrets, Vault)
  - ✅ **Nie committen** in Git Repository
  - ✅ **Nur für CI/CD-Westöße** zugänglich
  - ✅ **Regelmäßig rotieren** (jährlich)

- **Public Key** (`cosign.pub`)
  - ✅ **Öffentlich verfügbar** (Repository, container.gov.de)
  - ✅ **Dokumentiert** im `SIGNATURES.md`
  - ✅ **Versioniert** mit den SBOMs

## 9. SBOM Distribution

### 9.1 Distribution Channels

| Channel | Purpose | Access | Format |
|---------|---------|--------|--------|
| **GitHub Releases** | Öffentliche Releases | Public | CycloneDX + SPDX |
| **container.gov.de** | Compliance & Transparenz | Public | CycloneDX |
| **GitHub Artifacts** | CI/CD Ergebnisse | Private | CycloneDX + SPDX |
| **Project Website** | Downloads | Public | CycloneDX |
| **Internal Repository** | Backup & Archiv | Private | CycloneDX + SPDX |

### 9.2 Upload to container.gov.de

```bash
# Umgebungsvariablen setzen
export CONTAINER_GOV_DE_API_TOKEN="your-api-token"
export CONTAINER_GOV_DE_PROJECT_ID="your-project-id"

# Hochladen
make upload
```

### 9.3 Retention Policy

| SBOM Type | Retention Period | Reason |
|-----------|-----------------|--------|
| **Production Releases** | **Unbegrenzt** | Compliance |
| **Development Builds** | 90 Tage | temporäre Builds |
| **CI/CD Artifacts** | 30 Tage | onderzoek |
| **Archived Versions** | 7 Jahre | gesetzliche Anforderungen |

## 10. SBOM Verification

### 10.1 Verification Processes

#### 10.1.1 Content Verification
```bash
# Alle SBOMs validieren
make validate

# JSON Schema prüfen
jq empty sbom-website.json
```

#### 10.1.2 Signature Verification
```bash
# Alle Signaturen prüfen
for file in sbom-*.json; do
  cosign verify-blob --key cosign.pub --signature "$file.sig" "$file"
done
```

#### 10.1.3 Completeness Check
```bash
# Überprüfen, ob alle erwarteten Dateien vorhanden sind
ls -la sbom-output/ | grep -E "sbom-.*\.json"
```

### 10.2 Third-Party Verification

#### 10.2.1 container.gov.de
- ✅ **Format Validation** - Automatisch
- ✅ **Content Check** - Automatisch
- ✅ **Signature Verification** - Automatisch
- ⚠️ **Manual Review** - Bei Neuregistrierung

#### 10.2.2 Dependency-Track
- ✅ **Vulnerability Scanning**
- ✅ **License Analysis**
- ✅ **Component Analysis**
- ✅ **Risk Scoring**

## 11. SBOM Updates

### 11.1 Update Process

1. **Änderung identifizieren**
   - Code-Änderung mit Abhängigkeitsupdate
   - Neue Komponente hinzugefügt
   - Release geplant

2. **SBOM generieren**
   ```bash
   make all
   ```

3. **SBOM validieren**
   ```bash
   make validate
   ```

4. **Änderungen prüfen**
   ```bash
   # Unterschiede zwischen alter und neuer SBOM
   diff sbom-old.json sbom-new.json
   ```

5. **Signieren (falls erforderlich)**
   ```bash
   make sign
   ```

6. **Veröffentlichen**
   ```bash
   make upload
   git add sbom-output/
   git commit -m "chore: Update SBOMs"
   ```

### 11.2 Versioning

SBOMs folgen derselben Versionierung wie das Projekt:
- **Major Version Change** → Neue Major SBOM-Version
- **Minor Version Change** → Neue Minor SBOM-Version
- **Patch Version Change** → Neue Patch SBOM-Version
- **Dependency Update Only** →SBOM Version beibehalten, Datumsstempel aktualisieren

## 12. SBOM Security

### 12.1 SBOM Protection

- ✅ **SBOM-Dateien sind öffentlich** (keine Geheimhaltung nötig)
- ✅ **Signaturen schützen vor Manipulation**
- ✅ **Hashes für Integritätsprüfung**
- ⚠️ **Keine sensiblen Informationen** in SBOMs (Tokens, Keys, etc.)

### 12.2 SBOM Tampering

| Protection | Implementation | Status |
|------------|----------------|--------|
| **Digital Signatures** | cosign | ✅ Implemented |
| **Checksums** | SHA-256 Hashes | ✅ Implemented |
| **Immutable Storage** | Git, container.gov.de | ✅ Implemented |
| **Timestamping** | Signiert mit Zeitstempel | 🟡 Planned |
| **Blockchain** | Optional für kritische Komponenten | ❌ Not Required |

### 12.3 SBOM Access Control

| Data | Access | Reason |
|------|--------|--------|
| **SBOM Content** | Public | Transparenz |
| **Signing Keys** | Private | Sicherheit |
| **Upload Tokens** | Restricted | Autorisierung |
| **CI/CD Configuration** | Private | Sicherheit |

## 13. SBOM Compliance

### 13.1 Compliance Standards

| Standard | Status | Evidence |
|----------|--------|----------|
| **CycloneDX 1.5** | ✅ Compliant | Validierte SBOMs |
| **SPDX 2.3** | ✅ Compliant | Validierte SBOMs |
| **ISO/IEC 5962** | ✅ Compliant | Dokumentation |
| **NIST SSDF** | ✅ Compliant | Prozesse |
| **EU CRA** | ✅ Ready | SBOMs & Prozesse |
| **BSI TR-03183** | ✅ Compliant | Dokumentation |
| **OMB M-22-18** | ✅ Compliant | NTIA Minimum Elements |

### 13.2 Compliance Audits

**Interne Audits:**
- **Frequenz:** Vierteljährlich
- **Durchgeführt von:** Security Team
- **Dokumentation:** Audit Reports

**Externe Audits:**
- **Frequenz:** Jährlich (bei Bedarf)
- **Durchgeführt von:** Dritte Partei oder BSI
- **Zweck:** Zertifizierung, Compliance-Nachweis

### 13.3 Audit Checklist

- [ ] Alle Komponenten sind in SBOMs enthalten
- [ ] Alle Abhängigkeiten (direkt und transitiv) sind dokumentiert
- [ ] Alle Lizenzen sind korrekt angegeben
- [ ] SBOMs sind aktuell (nicht älter als 30 Tage)
- [ ] SBOMs sind signiert
- [ ] SBOMs sind validiert
- [ ] SBOMs sind veröffentlicht (container.gov.de, GitHub)
- [ ] Prozesse sind dokumentiert
- [ ] Verantwortlichkeiten sind klar definiert

## 14. Incident Management

### 14.1 SBOM-Related Incidents

| Incident Type | Severity | Response Time | Response |
|---------------|----------|---------------|----------|
| **SBOM Manipulation** | Critical | 4 Stunden | Signatur prüfen, SBOM neu generieren |
| **Missing SBOM** | High | 24 Stunden | SBOM generieren und veröffentlichen |
| **SBOM Validation Failure** | Medium | 72 Stunden | Ursache analysieren, SBOM korrigieren |
| **SBOM Generation Error** | Medium | 72 Stunden | Tools prüfen, Konfiguration anpassen |
| **License Non-Compliance** | High | 24 Stunden | Lizenzprüfung, Komponente entfernen/ersetzen |

### 14.2 Incident Response Process

1. **Erkennen** - Automatisierte Alerts oder manuelle Meldung
2. **Klassifizieren** - Severity und Typ bestimmten
3. **Bewerten** - Impact Analysis
4. **Reagieren** - Sofortmaßnahmen (SBOM neu generieren, etc.)
5. **Kommunizieren** - Stakeholder informieren
6. **Beheben** - Root Cause Analysis und Fix
7. **Dokumentieren** - Incident Report erstellen
8. **Lernen** - Lessons Learned, Prozessverbesserung

## 15. Training & Awareness

### 15.1 Required Training

| Role | Training | Frequency |
|------|----------|-----------|
| **All Developers** | SBOM Basics | Jährlich |
| **Security Team** | SBOM Generation & Validation | Halbjährlich |
| **DevOps Team** | SBOM CI/CD Integration | Halbjährlich |
| **Compliance Team** | SBOM Standards & Regulations | Jährlich |

### 15.2 Training Materials

- **Documentation**: [docs/sbom/README.md](README.md)
- **Workflows**: [.github/workflows/sbom.yml](/.github/workflows/sbom.yml)
- **Examples**: [sbom-output/](sbom-output/)
- **Standards**: [docs/sbom/STANDARDS_COMPLIANCE.md](STANDARDS_COMPLIANCE.md)
- **container.gov.de**: [docs/sbom/CONTAINER_GOV_DE_INTEGRATION.md](CONTAINER_GOV_DE_INTEGRATION.md)

## 16. Continuous Improvement

### 16.1 Metrics

| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| **SBOM Completeness** | 100% | TBD | % aller Komponenten |
| **SBOM Accuracy** | 100% | TBD | Validierungsrate |
| **SBOM Update SLA** | 95% | TBD | Einhaltung der SLAs |
| **SBOM Coverage** | 100% | TBD | % aller Projekte |
| **Automation Rate** | 100% | TBD | % automatisierte Generierung |

### 16.2 Improvement Initiatives

**2026:**
- [ ] Automatische SBOM-Generierung für alle新Projekte
- [ ] Integration mit Dependency-Track
- [ ] Offizielle Zertifizierung nach ISO/IEC 5962

**2027:**
- [ ] SBOM für Container-Images
- [ ] SBOM für Kubernetes Manifests
- [ ] Automatische Vulnerability-Alerts

**2028:**
- [ ] SBOM für Nix-Builds
- [ ] Integration mit Software Heritage
- [ ] Blockchain-basierte SBOM-Verifizierung (optional)

## 17. Appendix

### 17.1 Glossary

| Term | Definition |
|------|------------|
| **SBOM** | Software Bill of Materials - Inventarliste aller Software-Komponenten |
| **purl** | Package URL - Standardisiertes Format für Paketidentifikation |
| **CycloneDX** | Leichtgewichtiger SBOM-Standard |
| **SPDX** | Software Package Data Exchange - Umfassender SBOM-Standard |
| **Signierung** | Digitales Signieren von SBOMs zur Authentizitätsprüfung |
| **Compliance** | Einhaltung von Standards und Vorschriften |

### 17.2 References

**Internal Documents:**
- [SBOM README](README.md)
- [Standards Compliance](STANDARDS_COMPLIANCE.md)
- [container.gov.de Integration](CONTAINER_GOV_DE_INTEGRATION.md)
- [GitHub Workflow](/.github/workflows/sbom.yml)
- [Makefile](Makefile)

**External References:**
- [CycloneDX Specification](https://cyclonedx.org/specification/)
- [SPDX Specification](https://spdx.github.io/spdx-spec/)
- [ISO/IEC 5962](https://www.iso.org/standard/83245.html)
- [NIST SSDF](https://csrc.nist.gov/projects/ssdf)
- [EU Cyber Resilience Act](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)
- [container.gov.de](https://container.gov.de/)

### 17.3 Templates

**SBOM Generation Template:**
```bash
#!/bin/bash
# Skript für neue Komponenten
COMPONENT_NAME="new-component"
VERSION="1.0.0"
FORMAT="cyclonedx"

# Hier SBOM-Generierungslogik einfügen
echo "Generating SBOM for $COMPONENT_NAME@$VERSION..."
```

**SBOM Review Checklist:**
- [ ] Alle Abhängigkeiten sind enthalten
- [ ] Versionen sind korrekt
- [ ] Lizenzen sind angegeben
- [ ] Format ist gültig
- [ ] Signatur ist vorhanden (falls erforderlich)
- [ ] SBOM ist aktuell

## 18. Document Information

| Field | Value |
|-------|-------|
| **Title** | SBOM Policy für openDesk Edu |
| **Version** | 1.0.0 |
| **Status** | Active |
| **Effective Date** | 2026-08-01 |
| **Last Updated** | 2026-08-01 |
| **Next Review Date** | 2027-08-01 |
| **Owner** | Security Team |
| **Approver** | Project Lead |
| **Classification** | Public |
| **License** | Apache-2.0 |

### 18.1 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-01 | openDesk Edu Team | Initial version |

### 18.2 Approval

**Approved by:**
- **Project Lead**:______________________ Date: _________
- **Security Team**:____________________ Date: _________
- **Compliance Officer**:_______________ Date: _________

---

## Acknowledgment

Als Entwickler:in, Mitwirkende:r oder Nutzer:in von openDesk Edu bestätige ich, dass ich diese SBOM-Policy gelesen und verstanden habe und mich an die darin festgelegten Anforderungen halte.

**Name:** ___________________________
**Role:** ___________________________
**Signature:** _______________________
**Date:** ___________________________

---

*"Transparency is not an option, it's a requirement for modern software development."*

*"Security starts with knowing what you have."*

---

**Questions?** Contact: security@opendesk-edu.org
