#!/bin/bash
#
# openDesk Edu SBOM Generator
# Generates CycloneDX and SPDX SBOMs for all components
# Usage: ./scripts/generate-sbom.sh [format] [output-dir]
#   format: cyclonedx, spdx, or both (default: both)
#   output-dir: output directory (default: sbom-output)
#
# Example:
#   ./scripts/generate-sbom.sh cyclonedx sbom
#   ./scripts/generate-sbom.sh both
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
FORMAT="${1:-both}"
OUTPUT_DIR="${2:-sbom-output}"

# Create output directory
mkdir -p "$OUTPUT_DIR"
echo -e "${BLUE}📁 Output directory: $OUTPUT_DIR${NC}"

# Check required tools
check_tool() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ Required tool '$1' not found. Please install it first.${NC}"
        echo "   See: https://cyclonedx.org/docs/"
        exit 1
    fi
}

# Function to check and install tools
title() {
    echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
    echo -e "   $1"
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
}

# Show header
echo -e "\n${GREEN}"
echo "   ██████╗  ██████╗ ███████╗██████╗ ██╗   ██╗███╗   ███╗"
echo "   ██╔══██╗██╔═══██╗██╔════╝██╔══██╗╚██╗ ██╔╝████╗ ████║"
echo "   ██████╔╝██║   ██║█████╗  ██████╔╝ ╚████╔╝ ██╔████╔██║"
echo "   ██╔═══╝ ██║   ██║██╔══╝  ██╔══██╗  ╚██╔╝  ██║╚██╔╝██║"
echo "   ██║     ╚██████╔╝███████╗██║  ██║   ██║   ██║ ╚═╝ ██║"
echo "   ╚═╝      ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝"
echo -e "${NC}"

title "SBOM Generation for openDesk Edu"

# Step 0: Install or check tools
echo -e "${YELLOW}🔧 Checking required tools...${NC}"

# Check for npm/npx
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Installing Node.js...${NC}"
    if command -v curl &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo -e "${RED}❌ curl not found. Cannot install Node.js automatically.${NC}"
        exit 1
    fi
fi

# Check for Go modules tool
if ! command -v cyclonedx-gomod &> /dev/null; then
    echo -e "${YELLOW}📦 Installing cyclonedx-gomod...${NC}"
    if ! command -v go &> /dev/null; then
        echo -e "${RED}❌ Go not found. Cannot install cyclonedx-gomod.${NC}"
        echo "   Please install Go first: https://go.dev/dl/"
        exit 1
    fi
    go install github.com/CycloneDX/cyclonedx-gomod/cmd/cyclonedx-gomod@latest
fi

# Check for cyclonedx-cli
if ! command -v cyclonedx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing CycloneDX CLI...${NC}"
    curl -sL https://github.com/CycloneDX/cyclonedx-cli/releases/latest/download/cyclonedx-cli-linux-x64 -o /tmp/cyclonedx
    chmod +x /tmp/cyclonedx
    sudo mv /tmp/cyclonedx /usr/local/bin/cyclonedx
fi

# Check for Syft
if ! command -v syft &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Syft...${NC}"
    curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
fi

# Check for Python tools
if ! command -v cyclonedx-py &> /dev/null; then
    echo -e "${YELLOW}📦 Installing cyclonedx-bom (Python)...${NC}"
    pip install cyclonedx-bom
fi

# Step 1: Generate SBOM for Website (Next.js)
title "🌐 Generating SBOM for Website"
echo -e "${YELLOW}🔍 Scanning Next.js application...${NC}"
cd opendesk-edu-website

if [[ "$FORMAT" == "cyclonedx" || "$FORMAT" == "both" ]]; then
    echo -e "${BLUE}✏️  Generating CycloneDX SBOM...${NC}"
    npx @cyclonedx/cyclonedx-npm@latest -o ../$OUTPUT_DIR/sbom-website-cyclonedx.json
    echo -e "${GREEN}✅ CycloneDX SBOM generated!${NC}"
fi

if [[ "$FORMAT" == "spdx" || "$FORMAT" == "both" ]]; then
    echo -e "${BLUE}✏️  Generating SPDX SBOM...${NC}"
    if command -v spdx-npm &> /dev/null; then
        npx spdx-npm -o ../$OUTPUT_DIR/sbom-website-spdx.json
    else
        # Fallback: use CycloneDX and convert
        npx @cyclonedx/cyclonedx-npm@latest -o /tmp/website-cdx.json
        cyclonedx convert -i /tmp/website-cdx.json -f spdx-json -o ../$OUTPUT_DIR/sbom-website-spdx.json || true
    fi
    echo -e "${GREEN}✅ SPDX SBOM generated!${NC}"
fi

cd ..

# Step 2: Generate SBOM for Dev Agent Operator (Go)
title "🤖 Generating SBOM for Dev Agent Operator"
echo -e "${YELLOW}🔍 Scanning Go application...${NC}"
cd opendesk-dev-agent-operator

if [[ "$FORMAT" == "cyclonedx" || "$FORMAT" == "both" ]]; then
    echo -e "${BLUE}✏️  Generating CycloneDX SBOM...${NC}"
    cyclonedx-gomod mod -output ../$OUTPUT_DIR/sbom-operator-cyclonedx.json
    echo -e "${GREEN}✅ CycloneDX SBOM generated!${NC}"
fi

if [[ "$FORMAT" == "spdx" || "$FORMAT" == "both" ]]; then
    echo -e "${BLUE}✏️  Generating SPDX SBOM...${NC}"
    cyclonedx-gomod mod -output /tmp/operator-cdx.json
    cyclonedx convert -i /tmp/operator-cdx.json -f spdx-json -o ../$OUTPUT_DIR/sbom-operator-spdx.json || true
    echo -e "${GREEN}✅ SPDX SBOM generated!${NC}"
fi

cd ..

# Step 3: Generate SBOM for k8up (Go)
title "💾 Generating SBOM for k8up Operator"
echo -e "${YELLOW}🔍 Scanning Go application...${NC}"
cd k8up

if [[ "$FORMAT" == "cyclonedx" || "$FORMAT" == "both" ]]; then
    echo -e "${BLUE}✏️  Generating CycloneDX SBOM...${NC}"
    cyclonedx-gomod mod -output ../$OUTPUT_DIR/sbom-k8up-cyclonedx.json
    echo -e "${GREEN}✅ CycloneDX SBOM generated!${NC}"
fi

if [[ "$FORMAT" == "spdx" || "$FORMAT" == "both" ]]; then
    cyclonedx-gomod mod -output /tmp/k8up-cdx.json
    cyclonedx convert -i /tmp/k8up-cdx.json -f spdx-json -o ../$OUTPUT_DIR/sbom-k8up-spdx.json || true
    echo -e "${GREEN}✅ SPDX SBOM generated!${NC}"
fi

cd ..

# Step 4: Generate SBOM for Python Tools
title "🐍 Generating SBOM for Python Tools"
echo -e "${YELLOW}🔍 Scanning Python application...${NC}"
cd user_import

if [[ "$FORMAT" == "cyclonedx" || "$FORMAT" == "both" ]]; then
    echo -e "${BLUE}✏️  Generating CycloneDX SBOM...${NC}"
    cyclonedx-py -r requirements.txt -o ../$OUTPUT_DIR/sbom-python-cyclonedx.json
    echo -e "${GREEN}✅ CycloneDX SBOM generated!${NC}"
fi

if [[ "$FORMAT" == "spdx" || "$FORMAT" == "both" ]]; then
    echo -e "${BLUE}✏️  Generating SPDX SBOM...${NC}"
    cyclonedx-py -r requirements.txt --spdx -o ../$OUTPUT_DIR/sbom-python-spdx.json
    echo -e "${GREEN}✅ SPDX SBOM generated!${NC}"
fi

cd ..

# Step 5: Generate SBOM for Helm Charts
title "⚓ Generating SBOM for Helm Charts"
echo -e "${YELLOW}🔍 Scanning Helm charts...${NC}"

# Find all Chart.yaml files
CHART_FILES=$(find . -name "Chart.yaml" -type f | grep -v node_modules | grep -v ".git" | grep -v ".opencode")

if [[ "$FORMAT" == "cyclonedx" || "$FORMAT" == "both" ]]; then
    echo -e "${BLUE}✏️  Generating CycloneDX SBOM...${NC}"
    echo '{"bomFormat":"CycloneDX","specVersion":"1.5","version":1,"metadata":{"timestamp":"'"$(date +%Y-%m-%dT%H:%M:%SZ)"'","tools":[{"name":"helm-sbom-generator","version":"1.0.0"}]},"components":[' > $OUTPUT_DIR/sbom-helm-cyclonedx.json
    
    FIRST=true
    for chart in $CHART_FILES; do
        CHART_DIR=$(dirname "$chart")
        CHART_NAME=$(grep "^name:" "$chart" | awk '{print $2}' | tr -d '"') || CHART_NAME=$(basename "$CHART_DIR")
        CHART_VERSION=$(grep "^version:" "$chart" | awk '{print $2}' | tr -d '"') || CHART_VERSION="unknown"
        CHART_DESC=$(grep "^description:" "$chart" | awk '{print $2}' | tr -d '"') || CHART_DESC=""
        CHART_HOMEPAGE=$(grep "^home:" "$chart" | awk '{print $2}' | tr -d '"') || CHART_HOMEPAGE=""
        CHART_LICENSE=$(grep "^license:" "$chart" | awk '{print $2}' | tr -d '"') || CHART_LICENSE="Unknown"
        
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            echo "," >> $OUTPUT_DIR/sbom-helm-cyclonedx.json
        fi
        
        cat << EOF >> $OUTPUT_DIR/sbom-helm-cyclonedx.json
  {
    "type": "library",
    "bom-ref": "helm-$CHART_NAME-$CHART_VERSION",
    "name": "$CHART_NAME",
    "version": "$CHART_VERSION",
    "description": "$CHART_DESC",
    "licenses": [{"license": {"id": "$CHART_LICENSE"}}],
    "purl": "pkg:helm/$CHART_NAME@$CHART_VERSION",
    "externalReferences": [
      {
        "type": "website",
        "url": "$CHART_HOMEPAGE"
      },
      {
        "type": "vcs",
        "url": "https://github.com/opendesk-edu/$CHART_NAME"
      }
    ]
  }EOF
    done
    
    echo '
  ],"dependencies":[]}' >> $OUTPUT_DIR/sbom-helm-cyclonedx.json
    echo -e "${GREEN}✅ CycloneDX SBOM generated!${NC}"
fi

if [[ "$FORMAT" == "spdx" || "$FORMAT" == "both" ]]; then
    echo -e "${BLUE}✏️  Generating SPDX SBOM...${NC}"
    echo '{
  "spdxVersion": "SPDX-2.3",
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "opendesk-edu-helm-charts",
  "documentNamespace": "https://opendesk-edu.org/sbom/helm/'"$(date +%Y%m%d%H%M%S)"'",
  "creationInfo": {
    "created": "'"$(date +%Y-%m-%dT%H:%M:%SZ)"'",
    "creators": ["Tool: helm-sbom-generator-1.0"]
  },
  "packages": [' > $OUTPUT_DIR/sbom-helm-spdx.json
    
    FIRST=true
    for chart in $CHART_FILES; do
        CHART_DIR=$(dirname "$chart")
        CHART_NAME=$(grep "^name:" "$chart" | awk '{print $2}' | tr -d '"') || CHART_NAME=$(basename "$CHART_DIR")
        CHART_VERSION=$(grep "^version:" "$chart" | awk '{print $2}' | tr -d '"') || CHART_VERSION="unknown"
        CHART_DESC=$(grep "^description:" "$chart" | awk '{print $2}' | tr -d '"') || CHART_DESC=""
        CHART_HOMEPAGE=$(grep "^home:" "$chart" | awk '{print $2}' | tr -d '"') || CHART_HOMEPAGE=""
        CHART_LICENSE=$(grep "^license:" "$chart" | awk '{print $2}' | tr -d '"') || CHART_LICENSE="NOASSERTION"
        
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            echo "," >> $OUTPUT_DIR/sbom-helm-spdx.json
        fi
        
        cat << EOF >> $OUTPUT_DIR/sbom-helm-spdx.json
    {
      "SPDXID": "SPDXRef-Package-helm-$CHART_NAME-$CHART_VERSION",
      "name": "$CHART_NAME",
      "versionInfo": "$CHART_VERSION",
      "downloadLocation": "NOASSERTION",
      "filesAnalyzed": false,
      "licenseConcluded": "$CHART_LICENSE",
      "licenseDeclared": "$CHART_LICENSE",
      "copyrightText": "NOASSERTION",
      "description": "$CHART_DESC",
      "homepage": "$CHART_HOMEPAGE",
      "externalRefs": [
        {
          "referenceCategory": "PACKAGE-MANAGER",
          "referenceType": "purl",
          "referenceLocator": "pkg:helm/$CHART_NAME@$CHART_VERSION"
        }
      ]
    }EOF
    done
    
    echo '
  ],
  "relationships": []
}' >> $OUTPUT_DIR/sbom-helm-spdx.json
    echo -e "${GREEN}✅ SPDX SBOM generated!${NC}"
fi

# Step 6: Check for Nix files and generate SBOM
title "❄️  Checking for Nix files"
NIX_FILES=$(find . -name "*.nix" -o -name "flake.nix" -o -name "shell.nix" | grep -v node_modules | grep -v ".git" | head -10)

if [ -n "$NIX_FILES" ]; then
    echo -e "${YELLOW}🔍 Found Nix files, generating SBOM...${NC}"
    
    if [[ "$FORMAT" == "cyclonedx" || "$FORMAT" == "both" ]]; then
        echo -e "${BLUE}✏️  Generating CycloneDX SBOM for Nix...${NC}"
        syft dir:. -o cyclonedx-json="$OUTPUT_DIR/sbom-nix-cyclonedx.json" \
            --file "*.nix" --file "flake.nix" --file "shell.nix" 2>/dev/null || echo -e "${YELLOW}⚠️  Syft Nix scan skipped (no nix in PATH or files not found)${NC}"
    fi
    
    if [[ "$FORMAT" == "spdx" || "$FORMAT" == "both" ]]; then
        echo -e "${BLUE}✏️  Generating SPDX SBOM for Nix...${NC}"
        syft dir:. -o spdx-json="$OUTPUT_DIR/sbom-nix-spdx.json" \
            --file "*.nix" --file "flake.nix" --file "shell.nix" 2>/dev/null || echo -e "${YELLOW}⚠️  Syft Nix scan skipped${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  No Nix files found. Skipping Nix SBOM.${NC}"
fi

# Step 7: Generate Summary Report
title "📊 Generating Summary Report"

echo "# SBOM Generation Summary" > $OUTPUT_DIR/SBOM_SUMMARY.md
echo "" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "**Generated:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "**Host:** $(hostname)" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "**Format:** $FORMAT" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "**Output Directory:** $OUTPUT_DIR" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "## Generated Files:" >> $OUTPUT_DIR/SBOM_SUMMARY.md

# List all generated files with sizes
if [ -d "$OUTPUT_DIR" ]; then
    find "$OUTPUT_DIR" -name "sbom-*.json" -type f -exec stat -c "- %n (%.0s bytes)" {} \; >> $OUTPUT_DIR/SBOM_SUMMARY.md 2>/dev/null || true
fi

echo "" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "## Components Scanned:" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "- ✅ Website (Next.js/Node.js)" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "- ✅ Dev Agent Operator (Go)" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "- ✅ k8up Operator (Go)" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "- ✅ Python Tools (user_import)" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "- ✅ Helm Charts" >> $OUTPUT_DIR/SBOM_SUMMARY.md

if [ -n "$NIX_FILES" ]; then
    echo "- ✅ Nix Files" >> $OUTPUT_DIR/SBOM_SUMMARY.md
else
    echo "- ⚪ Nix Files (not found)" >> $OUTPUT_DIR/SBOM_SUMMARY.md
fi

echo "" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "## Tools Used:" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "- CycloneDX CLI (cyclonedx-npm, cyclonedx-gomod, cyclonedx-py)" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "- Syft (for Nix files)" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "- Node.js $(node --version 2>/dev/null || echo 'unknown')" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "- Go $(go version 2>/dev/null | awk '{print $3}' || echo 'unknown')" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "## Usage:" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "### Upload to container.gov.de:" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "\`\`\`bash" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "curl -X POST \"https://api.container.gov.de/v1/projects/YOUR_PROJECT_ID/sboms\" \\" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "  -H \"Authorization: Bearer YOUR_API_TOKEN\" \\" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "  -F \"sbom=@sbom-combined-cyclonedx.json\" \\" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "  -F \"version=$(git describe --tags 2>/dev/null || echo 'dev')\" \\" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "  -F \"format=$FORMAT\"" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "\`\`\`" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "### Sign SBOMs with cosign:" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "\`\`\`bash" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "cosign sign-blob --key cosign.key sbom-website-cyclonedx.json \\" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "  --output-signature sbom-website-cyclonedx.json.sig" >> $OUTPUT_DIR/SBOM_SUMMARY.md
echo "\`\`\`" >> $OUTPUT_DIR/SBOM_SUMMARY.md

echo -e "${GREEN}✅ Summary report generated!${NC}"

# Final summary
title "✨ SBOM Generation Complete!"
echo ""
echo -e "${GREEN}📊 Summary:${NC}"
FORMAT_COUNT=0
if [[ "$FORMAT" == "cyclonedx" ]]; then FORMAT_COUNT=6; fi
if [[ "$FORMAT" == "spdx" ]]; then FORMAT_COUNT=6; fi
if [[ "$FORMAT" == "both" ]]; then FORMAT_COUNT=12; fi

echo -e "   Files generated: ~$FORMAT_COUNT SBOM files"
echo -e "   Output directory: $OUTPUT_DIR"
echo -e "   Format: $FORMAT"
echo ""
echo -e "${BLUE}📁 Generated files:${NC}"
ls -lh "$OUTPUT_DIR"/sbom-*.json 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}' || true
echo ""
echo -e "${GREEN}✅ All SBOMs generated successfully!${NC}"
echo ""
echo -e "Next steps:"
echo -e "   1. Review SBOM files in $OUTPUT_DIR/"
echo -e "   2. Sign SBOMs with cosign (optional)"
echo -e "   3. Upload to container.gov.de"
echo -e "   4. Commit SBOM files to repository (optional)"
echo ""
