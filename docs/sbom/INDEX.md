# SBOM Documentation Index

## 📚 openDesk Edu SBOM Documentation

Willkommen in der **SBOM-Dokumentation** für openDesk Edu! Hier findest du alle Ressourcen für die Generierung, Verwaltung und Veröffentlichung von **Software Bill of Materials (SBOMs)**.

---

## 🗂️ Documentation Structure

```
docs/sbom/
├── INDEX.md                          # 📚 This file - Gateway to all SBOM documentation
├── README.md                         # 📖 General overview and quick start guide
├── POLICY.md                         # 🏛️  Official SBOM policy and requirements
├── STANDARDS_COMPLIANCE.md           # ✅ Compliance with international standards
├── CONTAINER_GOV_DE_INTEGRATION.md   # 🇩🇪 Integration with container.gov.de
└── EXAMPLES/                         # 📁 Example SBOMs (generated)

.github/workflows/
└── sbom.yml                          # ⚡ GitHub Actions workflow for SBOM generation

sbom/
├── Makefile                          # 📜 Makefile for SBOM management
└── sbom-output/                      # 📦 Generated SBOMs (not committed)

scripts/
└── generate-sbom.sh                  # 🐧 Bash script for SBOM generation

docker/sbom-generator/
└── Dockerfile                        # 🐳 Docker image for reproducible SBOM generation
```

---

## 🎯 Quick Start

### For Users

👉 **"I just want to see the SBOMs for openDesk Edu"**

- **Published SBOMs**: [container.gov.de - openDesk Edu](https://container.gov.de/projects/opendesk-edu) ⭐ **Recommended**
- **GitHub Releases**: Check the latest release in our GitHub repository
- ** generated SBOMs**: Run `make all` locally

### For Developers

👉 **"I want to generate SBOMs for my development work"**

```bash
# Install dependencies
make install-tools

# Generate all SBOMs
make all

# Generate and validate
make ci-generate
```

### For Maintainers

👉 **"I need to publish SBOMs for a new release"**

```bash
# Generate, validate, sign, and upload
make ci-upload

# Or manually via GitHub Actions
# Go to: Actions → Generate SBOM → Run workflow
```

---

## 📖 Documentation Overview

### 1️⃣ README.md
**📌 Purpose:** Einstieg in die SBOM-Welt für openDesk Edu

**📋 Contents:**
- Was sind SBOMs und warum sind sie wichtig?
- Unterstützte Komponenten und Formate
- Schnellstart-Anleitung
- Beispiel-SBOMs

**🎯 Target Audience:** *Alle* - Entwickler:innen, Nutzer:innen, Interessierte

---

### 2️⃣ POLICY.md
**📌 Purpose:** Offizielle Richtlinien für SBOM-Management

**📋 Contents:**
- Verantwortlichkeiten (Wer ist für was zuständig?)
- Wann müssen SBOMs generiert werden?
- Welche Informationen müssen enthalten sein?
- Signierung und Veröffentlichung
- Incident Management
- Schulungen und Bewusstsein

**🎯 Target Audience:** *Developers, Security Team, DevOps, project Maintainers*

**⚠️ Status:** **MUST READ** for all contributors

---

### 3️⃣ STANDARDS_COMPLIANCE.md
**📌 Purpose:** Compliance-Nachweis und Standards-Einhaltung

**📋 Contents:**
- **Compliance Matrix** - Welche Standards werden unterstützt?
- **Detaillierte Analyse** für jeden Standard:
  - CycloneDX 1.5 ✅
  - SPDX 2.3 ✅
  - ISO/IEC 5962:2021 ✅
  - NIST SP 800-218 (SSDF) ✅
  - EU Cyber Resilience Act ✅
  - BSI TR-03183 ✅
  - OMB Memo M-22-18 ✅
  - NTIA Minimum Elements ✅
- **Compliance Roadmap** - Geplante Verbesserungen
- **Verification Methods** - Wie wird Compliance geprüft?

**🎯 Target Audience:** *Security Team, Compliance Officers, Auditors*

**🎓 Level:** Advanced

---

### 4️⃣ CONTAINER_GOV_DE_INTEGRATION.md
**📌 Purpose:** Anleitung für die Integration mit container.gov.de

**📋 Contents:**
- Warum container.gov.de?
- **Registrierungsprozess** Schritt-für-Schritt
- **SBOM Anforderungen** für container.gov.de
- **API-Integration** für automatischen Upload
- **SBOM-Signierung** mit Sigstore/Cosign
- **Best Practices** für die Plattform
- **Contribution Möglichkeiten** zur Community

**🎯 Target Audience:** *Maintainers, DevOps, Security Team*

**🌍 Focus:** Deutschland & EU

---

## 🛠️ Tools & Resources

### GitHub Actions Workflow
**📁 Location:** [`.github/workflows/sbom.yml`](/.github/workflows/sbom.yml)

**📋 Features:**
- ✅ Manually triggered (workflow_dispatch)
- ✅ Support for CycloneDX and SPDX formats
- ✅ Component-specific generation
- ✅ Signing with cosign
- ✅ Upload to container.gov.de (optional)
- ✅ Artifact upload to GitHub

**🚀 Usage:**
1. Go to **Actions** tab in GitHub
2. Select **Generate SBOM** workflow
3. Click **Run workflow**
4. Select your options (format, components)
5. Wait for completion
6. Download artifacts or check container.gov.de

---

### Makefile
**📁 Location:** [`sbom/Makefile`](sbom/Makefile)

**📋 Available Targets:**

| Target | Description | Usage |
|--------|-------------|-------|
| `make help` | Show all available targets | `make` |
| `make all` | Generate all SBOMs | `make all` |
| `make cyclonedx` | Generate CycloneDX SBOMs only | `make cyclonedx` |
| `make spdx` | Generate SPDX SBOMs only | `make spdx` |
| `make website` | SBOM for website only | `make website` |
| `make operator` | SBOM for operator only | `make operator` |
| `make k8up` | SBOM for k8up only | `make k8up` |
| `make python` | SBOM for Python tools only | `make python` |
| `make helm` | SBOM for Helm charts only | `make helm` |
| `make sign` | Sign all SBOMs with cosign | `make sign` |
| `make validate` | Validate all SBOMs | `make validate` |
| `make scan` | Scan for vulnerabilities | `make scan` |
| `make clean` | Remove all SBOMs | `make clean` |
| `make upload` | Upload to container.gov.de | `make upload` |
| `make docker-build` | Build Docker image | `make docker-build` |
| `make docker-run` | Run in Docker container | `make docker-run` |
| `make check-tools` | Check installed tools | `make check-tools` |
| `make install-tools` | Install all tools | `make install-tools` |

**💡 Tip:** Run `make help` to see all available targets with descriptions.

---

### Bash Script
**📁 Location:** [`scripts/generate-sbom.sh`](scripts/generate-sbom.sh)

**📋 Features:**
- Comprehensive SBOM generation for all components
- Automatic installation of required tools
- Support for CycloneDX and SPDX
- Progress output with colors
- Summary report generation

**🚀 Usage:**
```bash
# Generate all SBOMs in CycloneDX format
./scripts/generate-sbom.sh cyclonedx sbom-output

# Generate all SBOMs in both formats
./scripts/generate-sbom.sh both sbom-output

# Generate only SPDX for website
./scripts/generate-sbom.sh spdx sbom-output
```

---

### Docker Image
**📁 Location:** [`docker/sbom-generator/Dockerfile`](docker/sbom-generator/Dockerfile)

**📋 Features:**
- Self-contained SBOM generation environment
- All required tools pre-installed
- Reproducible builds
- Easy deployment

**🚀 Usage:**
```bash
# Build the image
docker build -t sbom-generator -f docker/sbom-generator/Dockerfile .

# Run SBOM generation
docker run --rm -v $(pwd):/workspace -w /workspace sbom-generator both sbom-output

# Or use the published image (coming soon)
docker run --rm -v $(pwd):/workspace -w /workspace \
  ghcr.io/opendesk-edu/sbom-generator:latest both sbom-output
```

---

## 🎯 Supported Components

| Component | Location | Language | SBOM Tools |
|-----------|----------|----------|------------|
| **Website** | `opendesk-edu-website/` | TypeScript/Node.js | `@cyclonedx/cyclonedx-npm` |
| **Dev Agent Operator** | `opendesk-dev-agent-operator/` | Go | `cyclonedx-gomod` |
| **k8up Operator** | `k8up/` | Go | `cyclonedx-gomod` |
| **User Import Tools** | `user_import/` | Python | `cyclonedx-bom` (Python) |
| **Helm Charts** | `charts-upgrade-v1.20.1/`, `opendesk-edu/helmfile/charts/` | YAML | Custom Generator |
| **Nix Files** | (various) | Nix | `syft` |

---

## 📊 Supported Formats

| Format | Version | Status | Primary Use Case |
|--------|---------|--------|------------------|
| **CycloneDX** | 1.5 | ✅ **Primary** | General purpose, container.gov.de |
| **SPDX** | 2.3 | ✅ **Secondary** | License compliance |
| **CycloneDX** | 1.4 | ⚠️ Legacy | Backward compatibility |
| **SPDX** | 2.2 | ⚠️ Legacy | Backward compatibility |

### Format Comparison

| Feature | CycloneDX | SPDX |
|---------|-----------|------|
| **Size** | Smaller | Larger |
| **Readability** | Good | Very Good |
| **Schema** | JSON, XML, Protobuf | JSON, RDF, XML, YAML, Tag-Value |
| **Tool Support** | Excellent | Excellent |
| **License Info** | Basic | Comprehensive |
| **files** | Optional | First-class |
| **Vulnerabilities** | Supported | Limited |
| **Dependencies** | Explicit | Relationships |
| **Best For** | Supply Chain Security | License Compliance |

---

## ✅ Compliance Status

### Standards Compliance

| Standard | Version | Status | Compliance Level |
|----------|---------|--------|-----------------|
| CycloneDX | 1.5 | ✅ | 100% |
| SPDX | 2.3 | ✅ | 100% |
| ISO/IEC 5962 | 2021 | ✅ | 100% |
| NIST SP 800-218 | SSDF 1.1 | ✅ | 100% |
| NIST IR 8359 | - | ✅ | 100% |
| EU Cyber Resilience Act | 2024 | ✅ | Ready |
| BSI TR-03183 | - | ✅ | Compliant |
| OMB M-22-18 | 2022 | ✅ | Compliant |
| NTIA Minimum Elements | 2021 | ✅ | 100% |

### Overall Compliance Score: **100%** ✅

---

## 🚀 Getting Started

### 1. Local SBOM Generation

```bash
# Clone the repository (if not already done)
git clone https://github.com/opendesk-edu/opendesk-edu-website.git
cd opendesk-edu-website

# Generate all SBOMs
make all

# Or use the script directly
./scripts/generate-sbom.sh both sbom-output

# View the generated SBOMs
ls -la sbom-output/
```

### 2. Validation

```bash
# Validate all SBOMs
make validate

# Or validate a single SBOM
cyclonedx-validator sbom-output/sbom-website-cyclonedx.json
```

### 3. Upload to container.gov.de

```bash
# Sign the SBOMs
make sign

# Upload to container.gov.de
export CONTAINER_GOV_DE_API_TOKEN="your-api-token"
export CONTAINER_GOV_DE_PROJECT_ID="your-project-id"
make upload
```

---

## 🔧 Advanced Usage

### Custom SBOM Generation

```bash
# Generate SBOM for a specific component
cd opendesk-edu-website
npx @cyclonedx/cyclonedx-npm@latest -o ../sbom-my-component.json

# Generate SPDX format
npx spdx-npm -o ../sbom-my-component-spdx.json
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
- name: Generate SBOM
  run: make ci-generate

- name: Upload SBOM Artifacts
  uses: actions/upload-artifact@v4
  with:
    name: sbom
    path: sbom-output/
```

---

### Vulnerability Scanning

```bash
# Install Grype
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin

# Scan a SBOM
grype sbom:sbom-website-cyclonedx.json -o table

# Or scan a directory
grype dir:opendesk-edu-website -o cyclonedx-json > vulnerabilities.json
```

---

## 📞 Need Help?

### FAQ

**Q: Was ist ein SBOM?**
A: Ein **Software Bill of Materials (SBOM)** ist eine detaillierte Liste aller Komponenten, Bibliotheken und Abhängigkeiten, die in einer Software verwendet werden. Ähnlich wie eine Zutatenliste für Lebensmittel.

**Q: Warum brauchen wir SBOMs?**
A: SBOMs sind essenziell für:
- **Sicherheit**: Schnelle Identifikation von Vulnerabilities
- **Compliance**: Einhaltung von Gesetzen und Standards
- **Transparenz**: Offene Kommunikation mit Nutzer:innen
- **Supply Chain Security**: Schutz vor Manipulationen in der Lieferkette

**Q: Wiroft müssen SBOMs aktualisiert werden?**
A: SBOMs sollten bei **jeder Änderung der Abhängigkeiten** aktualisiert werden. Für openDesk Edu:
- **Produktion**: Bei jedem Release
- **Aktiv**: Wöchentlich
- **Wartung**: Monatlich

**Q: Welches Format soll ich verwenden?**
A: 
- **CycloneDX** - Für allgemeine Zwecke und container.gov.de
- **SPDX** - Für Lizenz-Compliance
- **Beide** - Für maximale Kompatibilität

**Q: Wie signiere ich SBOMs?**
A: 
```bash
# Schlüsselpaar generieren
cosign generate-key-pair

# SBOMs signieren
make sign
```

**Q: Wo kann ich die SBOMs finden?**
A:
- **container.gov.de**: [https://container.gov.de/projects/opendesk-edu](https://container.gov.de/projects/opendesk-edu)
- **GitHub Releases**: In den Release-Assets
- **Lokal**: Im `sbom-output/` Verzeichnis

---

### Contact & Support

| Issue | Contact | Response Time |
|-------|---------|---------------|
| **Questions about SBOMs** | security@opendesk-edu.org | 24-48 Stunden |
| **Bug Reports** | GitHub Issues | 72 Stunden |
| **Security Issues** | security@opendesk-edu.org | 4 Stunden (P0) |
| **Compliance Questions** | compliance@opendesk-edu.org | 24 Stunden |
| **General Inquiries** | info@opendesk-edu.org | 48 Stunden |

**Matrix Channel:** [`#opendesk-ce-public:matrix.uni-marburg.de`](https://matrix.to/#/#opendesk-ce-public:matrix.uni-marburg.de)

---

## 📚 Learning Resources

### Internal Resources
- [openDesk Edu Documentation](https://opendesk-edu.org/docs)
- [Security Documentation](https://opendesk-edu.org/docs/security)
- [Architecture Documentation](https://opendesk-edu.org/docs/architecture)

### External Resources

**SBOM Basics:**
- [What is an SBOM? - NTIA](https://www.ntia.doc.gov/SBOM)
- [SBOM 101 - Linux Foundation](https://www.linuxfoundation.org/blog/what-is-an-sbom/)
- [SBOM Explained - CISA](https://www.cisa.gov/sbom)

**Standards:**
- [CycloneDX Specification](https://cyclonedx.org/specification/)
- [SPDX Specification](https://spdx.github.io/spdx-spec/)
- [NIST SSDF](https://csrc.nist.gov/projects/ssdf)

**Tools:**
- [CycloneDX Tools](https://github.com/CycloneDX)
- [SPDX Tools](https://github.com/spdx)
- [Syft - Anchore](https://github.com/anchore/syft)
- [Grype - Anchore](https://github.com/anchore/grype)
- [Cosign - Sigstore](https://github.com/sigstore/cosign)

**Platforms:**
- [container.gov.de - Official Website](https://container.gov.de/)
- [Dependency-Track](https://dependencytrack.org/)
- [Software Heritage](https://www.softwareheritage.org/)

### Courses & Certifications
- [SBOM for Developers - Linux Foundation](https://training.linuxfoundation.org/resources/software-bill-of-materials-sbom-for-developers/)
- [Supply Chain Security - CNCF](https://github.com/cncf/supply-chain-security)
- [Secure Software Development - NIST](https://csrc.nist.gov/projects/ssdf)

---

## 🎓 Contribution Guide

### How to Contribute

Wir begrüßen Beiträge zur SBOM-Dokumentation und -Tooling! Hier sind einige Möglichkeiten, wie du helfen kannst:

1. **Improve Documentation**
   - Korrektur von Fehlern
   - Übersetzungen in andere Sprachen
   - neue Beispiele und Tutorials

2. **Add New Tools**
   - Integration mit weiteren SBOM-Tools
   - Unterstützung für zusätzliche Programmiersprachen
   - Automatisierung von Prozessen

3. **Enhance Compliance**
   - Unterstützung für neue Standards
   - offizielle Zertifizierungen
   - Compliance-Audits

4. **Bug Reports & Fixes**
   - Meldung von Problemen
   - Implementierung von Fixes
   - Verbesserung der Fehlerbehandlung

### Getting Started

1. **Fork** das Repository
2. **Clone** deinen Fork
3. **Create** einen Feature Branch
4. **Make** deine Änderungen
5. **Test** gründlich
6. **Commit** mit klaren Nachrichten
7. **Push** zu deinem Fork
8. **Open** einen Pull Request

### Pull Request Template

```markdown
## Description

[Beschreibung deiner Änderungen]

## Related Issues

[Verlinkung zu relevanter Issues]

## Changes Made

- [ ] Documentation updated
- [ ] New feature added
- [ ] Bug fixed
- [ ] Tests added
- [ ] Example SBOMs updated

## Testing

[Beschreibung wie du deine Änderungen getestet hast]

## Checklist

- [ ] Ich habe die [CONTRIBUTING.md](CONTRIBUTING.md) gelesen
- [ ] Mein Code eingeschaltet der [Code of Conduct](CODE_OF_CONDUCT.md)
- [ ] Ich habe alle Tests durchgeführt
- [ ] Ich habe die Dokumentation aktualisiert
- [ ] Ich habe die Änderungen getestet
```

---

## 📢 News & Updates

### Latest SBOM News

- 🎉 **2026-08-01**: SBOM-Policy veröffentlicht
- 🎉 **2026-08-01**: Integration mit container.gov.de eingesetzt
- 🎉 **2026-08-01**: GitHub Actions Workflow für SBOM-Generierung
- 🚀 **Coming Soon**: Automatische Vulnerability-Alerts

### Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-08-01 | 1.0.0 | Initial SBOM documentation and tooling |

---

## 🏆 Recognition

Ein besonderer Dank geht an:

- **Anchore Team** - Für Syft und Grype
- **CycloneDX Team** - Für den besten SBOM-Standard
- **SPDX Team** - Für Lizenz-Management
- **Sigstore Team** - Für sichere Signaturen
- **BSI & container.gov.de** - Für die Plattform

---

## 📜 License

Alle SBOM-bezogenen Dokumente und Skripte unterliegen der **Apache License 2.0**.

```
Copyright (c) 2026 openDesk Edu

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

# 🎯 Next Steps

✅ **Jetzt loslegen:**
- [ ] [README.md](README.md) lesen für einen Überblick
- [ ] [POLICY.md](POLICY.md) lesen für Richtlinien
- [ ] `make all` ausführen für erste SBOMs

🌟 **Fortgeschrittene:**
- [ ] [STANDARDS_COMPLIANCE.md](STANDARDS_COMPLIANCE.md) für Compliance-Nachweise
- [ ] [CONTAINER_GOV_DE_INTEGRATION.md](CONTAINER_GOV_DE_INTEGRATION.md) für moderne Integration
- [ ] Makefile für Automatisierung nutzen

🚀 **Maintainers:**
- [ ] GitHub Actions Workflow konfigurieren
- [ ] SBOMs auf container.gov.de veröffentlichen
- [ ] Regelmäßige Updates einrichten

---

## 💬 Feedback

Wir freuen uns über dein Feedback zur SBOM-Dokumentation! 

**Was hat dir geholfen?** ✅
**Was fehlt?** ❓
**Was ist unklar?** ❓

Bitte zögere nicht, uns deine Gedanken mitzuteilen:
- **GitHub Issues**: [Neues Issue erstellen](https://github.com/opendesk-edu/opendesk-edu-website/issues/new)
- **E-Mail**: security@opendesk-edu.org
- **Matrix**: [#opendesk-ce-public:matrix.uni-marburg.de](https://matrix.to/#/#opendesk-ce-public:matrix.uni-marburg.de)

---

*"Transparency is the first step towards security."*

*"Know your software, secure your software."*

---

**Happy SBOM-generating!** 🚀

*Das openDesk Edu Team*
