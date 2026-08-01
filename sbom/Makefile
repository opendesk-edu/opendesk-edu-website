# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2026 openDesk Edu
# Licensed under the Apache License, Version 2.0

# Makefile for SBOM generation and management
# Usage: make [target]
#
# Available targets:
#   help            - Show this help
#   all             - Generate all SBOMs
#   cyclonedx       - Generate CycloneDX SBOMs only
#   spdx            - Generate SPDX SBOMs only
#   website         - Generate SBOM for website only
#   operator        - Generate SBOM for operator only
#   k8up            - Generate SBOM for k8up only
#   python          - Generate SBOM for Python tools only
#   helm            - Generate SBOM for Helm charts only
#   nix             - Generate SBOM for Nix files only
#   sign            - Sign all generated SBOMs
#   validate        - Validate all generated SBOMs
#   clean           - Remove all generated SBOMs
#   upload          - Upload SBOMs to container.gov.de
#

.PHONY: help all cyclonedx spdx website operator k8up python helm nix sign validate clean upload

# Configuration
SBOM_SCRIPT := scripts/generate-sbom.sh
OUTPUT_DIR := sbom-output
FORMAT ?= both

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

help: ## Show this help message
	@echo "openDesk Edu SBOM Management"
	@echo "============================"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "SBOM Generation:"
	@echo "  all              - Generate all SBOMs (default)"
	@echo "  cyclonedx        - Generate CycloneDX SBOMs only"
	@echo "  spdx             - Generate SPDX SBOMs only"
	@echo ""
	@echo "Component-specific:"
	@echo "  website          - Generate SBOM for website only"
	@echo "  operator         - Generate SBOM for operator only"
	@echo "  k8up             - Generate SBOM for k8up only"
	@echo "  python           - Generate SBOM for Python tools only"
	@echo "  helm             - Generate SBOM for Helm charts only"
	@echo "  nix              - Generate SBOM for Nix files only"
	@echo ""
	@echo "Post-processing:"
	@echo "  sign             - Sign all generated SBOMs with cosign"
	@echo "  validate         - Validate all generated SBOMs"
	@echo "  scan             - Scan SBOMs for vulnerabilities with Grype"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean            - Remove all generated SBOMs"
	@echo "  upload          - Upload SBOMs to container.gov.de"
	@echo "  docker-build     - Build SBOM generator Docker image"
	@echo "  docker-run       - Run SBOM generation in Docker"
	@echo ""
	@echo "Configuration:"
	@echo "  OUTPUT_DIR = $(OUTPUT_DIR)"
	@echo "  FORMAT = $(FORMAT)"
	@echo ""

all: clean generate ## Generate all SBOMs
	@echo "$(GREEN)✅ All SBOMs generated in $(OUTPUT_DIR)/$(NC)"

generate: generate-all ## Generate all SBOMs (alias)
generate-all:
	@mkdir -p $(OUTPUT_DIR)
	@echo "$(BLUE)🚀 Generating all SBOMs...$(NC)"
	@$(SBOM_SCRIPT) $(FORMAT) $(OUTPUT_DIR)

cyclonedx: clean ## Generate CycloneDX SBOMs only
	@echo "$(BLUE)🚀 Generating CycloneDX SBOMs...$(NC)"
	@$(SBOM_SCRIPT) cyclonedx $(OUTPUT_DIR)

spdx: clean ## Generate SPDX SBOMs only
	@echo "$(BLUE)🚀 Generating SPDX SBOMs...$(NC)"
	@$(SBOM_SCRIPT) spdx $(OUTPUT_DIR)

website: clean ## Generate SBOM for website only
	@echo "$(BLUE)🌐 Generating SBOM for website...$(NC)"
	@mkdir -p $(OUTPUT_DIR)
	@cd opendesk-edu-website && \
		npx @cyclonedx/cyclonedx-npm@latest -o ../$(OUTPUT_DIR)/sbom-website-cyclonedx.json && \
		cd ..
	@echo "$(GREEN)✅ Website SBOM generated!$(NC)"

operator: clean ## Generate SBOM for operator only
	@echo "$(BLUE)🤖 Generating SBOM for operator...$(NC)"
	@mkdir -p $(OUTPUT_DIR)
	@cd opendesk-dev-agent-operator && \
		cyclonedx-gomod mod -output ../$(OUTPUT_DIR)/sbom-operator-cyclonedx.json && \
		cd ..
	@echo "$(GREEN)✅ Operator SBOM generated!$(NC)"

k8up: clean ## Generate SBOM for k8up only
	@echo "$(BLUE)💾 Generating SBOM for k8up...$(NC)"
	@mkdir -p $(OUTPUT_DIR)
	@cd k8up && \
		cyclonedx-gomod mod -output ../$(OUTPUT_DIR)/sbom-k8up-cyclonedx.json && \
		cd ..
	@echo "$(GREEN)✅ k8up SBOM generated!$(NC)"

python: clean ## Generate SBOM for Python tools only
	@echo "$(BLUE)🐍 Generating SBOM for Python tools...$(NC)"
	@mkdir -p $(OUTPUT_DIR)
	@cd user_import && \
		cyclonedx-py -r requirements.txt -o ../$(OUTPUT_DIR)/sbom-python-cyclonedx.json && \
		cd ..
	@echo "$(GREEN)✅ Python SBOM generated!$(NC)"

helm: clean ## Generate SBOM for Helm charts only
	@echo "$(BLUE)⚓ Generating SBOM for Helm charts...$(NC)"
	@mkdir -p $(OUTPUT_DIR)
	@$(MAKE) -f sbom/Makefile helm-only

helm-only:
	@echo "Generating Helm Charts SBOM..."
	@CHART_FILES=$$(find . -name "Chart.yaml" -type f | grep -v node_modules | grep -v ".git" | grep -v ".opencode"); \
	if [ -n "$$CHART_FILES" ]; then \
		echo '{"bomFormat":"CycloneDX","specVersion":"1.5","version":1,"metadata":{"timestamp":"'"$$(date +%Y-%m-%dT%H:%M:%SZ)"'","tools":[{"name":"helm-sbom-generator","version":"1.0.0"}]},"components":[' > $(OUTPUT_DIR)/sbom-helm-cyclonedx.json; \
		FIRST=true; \
		for chart in $$CHART_FILES; do \
			CHART_DIR=$$(dirname "$$chart"); \
			CHART_NAME=$$(grep "^name:" "$$chart" | awk '{print $$2}' | tr -d '"') || CHART_NAME=$$(basename "$$CHART_DIR"); \
			CHART_VERSION=$$(grep "^version:" "$$chart" | awk '{print $$2}' | tr -d '"') || CHART_VERSION="unknown"; \
			CHART_DESC=$$(grep "^description:" "$$chart" | awk '{print $$2}' | tr -d '"') || CHART_DESC=""; \
			if [ "$$FIRST" = true ]; then \
				FIRST=false; \
			else \
				echo "," >> $(OUTPUT_DIR)/sbom-helm-cyclonedx.json; \
			fi; \
			cat << EOF >> $(OUTPUT_DIR)/sbom-helm-cyclonedx.json
n  {
    "type": "library",
    "bom-ref": "helm-$$CHART_NAME-$$CHART_VERSION",
    "name": "$$CHART_NAME",
    "version": "$$CHART_VERSION",
    "description": "$$CHART_DESC",
    "licenses": [{"license": {"id": "Apache-2.0"}}],
    "purl": "pkg:helm/$$CHART_NAME@$$CHART_VERSION"
  }EOF\n		done; \
		echo '
  ],"dependencies":[]}' >> $(OUTPUT_DIR)/sbom-helm-cyclonedx.json; \
		@echo "$(GREEN)✅ Helm SBOM generated!$(NC)"; \
	else \
		@echo "$(YELLOW)⚠️  No Chart.yaml files found.$(NC)"; \
	fi

nix: clean ## Generate SBOM for Nix files only
	@echo "$(BLUE)❄️  Generating SBOM for Nix files...$(NC)"
	@mkdir -p $(OUTPUT_DIR)
	@if [ -n "$$(find . -name '*.nix' -o -name 'flake.nix' -o -name 'shell.nix' | grep -v node_modules | grep -v '.git' | head -1)" ]; then \
		syft dir:. -o cyclonedx-json="$(OUTPUT_DIR)/sbom-nix-cyclonedx.json" --file "*.nix" 2>/dev/null || \
		@echo "$(YELLOW)⚠️  Syft Nix scan skipped (tool not available)$(NC)"; \
	else \
		@echo "$(YELLOW)⚠️  No Nix files found.$(NC)"; \
	fi

sign: ## Sign all generated SBOMs with cosign
	@echo "$(BLUE)🔐 Signing SBOMs...$(NC)"
	@if [ ! -f cosign.key ]; then \
		@echo "$(RED)❌ cosign.key not found. Please generate with: cosign generate-key-pair$(NC)"; \
		@exit 1; \
	fi; \
	@for file in $(OUTPUT_DIR)/sbom-*.json; do \
		if [ -f "$$file" ]; then \
			@echo "Signing $$file..."; \
			@cosign sign-blob --key cosign.key "$$file" \
				--output-signature "$$file.sig" \
				--output-certificate "$$file.cert" 2>/dev/null || \
				@echo "$(YELLOW)⚠️  Failed to sign $$file (cosign not available?)$(NC)"; \
		fi; \
	done; \
	@echo "$(GREEN)✅ All SBOMs signed!$(NC)"

validate: ## Validate all generated SBOMs
	@echo "$(BLUE)🔍 Validating SBOMs...$(NC)"
	@if command -v cyclonedx-validator &>/dev/null; then \
		@for file in $(OUTPUT_DIR)/sbom-*-cyclonedx.json; do \
			if [ -f "$$file" ]; then \
				@echo "Validating $$file..."; \
				@cyclonedx-validator "$$file" || echo "$(YELLOW)⚠️  Validation failed for $$file$(NC)"; \
			fi; \
		done; \
	else \
		@echo "$(YELLOW)⚠️  cyclonedx-validator not found. Install with: npm install -g @cyclonedx/cyclonedx-validator$(NC)"; \
	fi; \
	@if command -v spdx-validate &>/dev/null; then \
		@for file in $(OUTPUT_DIR)/sbom-*-spdx.json; do \
			if [ -f "$$file" ]; then \
				@echo "Validating $$file..."; \
				@spdx-validate "$$file" || echo "$(YELLOW)⚠️  Validation failed for $$file$(NC)"; \
			fi; \
		done; \
	else \
		@echo "$(YELLOW)⚠️  spdx-validate not found. Install with: npm install -g @spdx/tools-validator$(NC)"; \
	fi; \
	@echo "$(GREEN)✅ SBOM validation complete!$(NC)"

scan: ## Scan SBOMs for vulnerabilities with Grype
	@echo "$(BLUE)🛡️  Scanning SBOMs for vulnerabilities...$(NC)"
	@if command -v grype &>/dev/null; then \
		@for file in $(OUTPUT_DIR)/sbom-*.json; do \
			if [ -f "$$file" ]; then \
				@echo "Scanning $$file..."; \
				@grype sbom:"$$file" -o table || echo "$(YELLOW)⚠️  Scan failed for $$file$(NC)"; \
			fi; \
		done; \
	else \
		@echo "$(YELLOW)⚠️  Grype not found. Install with: curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin$(NC)"; \
	fi; \
	@echo "$(GREEN)✅ Vulnerability scan complete!$(NC)"

clean: ## Remove all generated SBOMs
	@echo "$(YELLOW)🧹 Cleaning up SBOM files...$(NC)"
	@rm -rf $(OUTPUT_DIR)
	@rm -f sbom-*.json sbom-*.json.sig sbom-*.json.cert
	@echo "$(GREEN)✅ Cleanup complete!$(NC)"

upload: sign ## Upload SBOMs to container.gov.de
	@echo "$(BLUE)📤 Uploading SBOMs to container.gov.de...$(NC)"
	@if [ -z "$(CONTAINER_GOV_DE_API_TOKEN)" ]; then \
		@echo "$(RED)❌ CONTAINER_GOV_DE_API_TOKEN not set. Please set environment variable.$(NC)"; \
		@echo "   Get token from: https://container.gov.de/account/api-tokens"; \
		@exit 1; \
	fi; \
	@if [ -z "$(CONTAINER_GOV_DE_PROJECT_ID)" ]; then \
		@echo "$(RED)❌ CONTAINER_GOV_DE_PROJECT_ID not set. Please set environment variable.$(NC)"; \
		@echo "   Find project ID in: https://container.gov.de/projects"; \
		@exit 1; \
	fi; \
	@for file in $(OUTPUT_DIR)/sbom-*-cyclonedx.json; do \
		if [ -f "$$file" ]; then \
			@echo "Uploading $$file..."; \
			@curl -X POST "https://api.container.gov.de/v1/projects/$(CONTAINER_GOV_DE_PROJECT_ID)/sboms" \
				-H "Authorization: Bearer $(CONTAINER_GOV_DE_API_TOKEN)" \
				-H "Content-Type: multipart/form-data" \
				-F "sbom=@$$file" \
				-F "version=$(shell git describe --tags 2>/dev/null || echo 'dev')" \
				-F "format=cyclonedx" \
				-F "signature=@$$file.sig" \
				-F "certificate=@$$file.cert" 2>/dev/null || \
				@echo "$(YELLOW)⚠️  Upload failed for $$file$(NC)"; \
		fi; \
	done; \
	@echo "$(GREEN)✅ Upload complete!$(NC)"

summary: ## Show SBOM summary
	@echo "$(BLUE)📊 SBOM Summary$(NC)"
	@echo "=================="
	@if [ -d "$(OUTPUT_DIR)" ]; then \
		@echo "Output Directory: $(OUTPUT_DIR)"; \
		@echo "Files:"; \
		@ls -lh $(OUTPUT_DIR)/sbom-*.json 2>/dev/null | awk '{print "  " $$9 " (" $$5 ")"}' || echo "  No SBOM files found."; \
	else \
		@echo "No SBOM output directory found. Run 'make all' first."; \
	fi

list: summary ## List all generated SBOM files

# Docker targets
docker-build: ## Build SBOM generator Docker image
	@echo "$(BLUE)🐳 Building SBOM generator Docker image...$(NC)"
	@docker build -t sbom-generator -f docker/sbom-generator/Dockerfile .
	@echo "$(GREEN)✅ Docker image built: sbom-generator$(NC)"

docker-run: ## Run SBOM generation in Docker
	@echo "$(BLUE)🐳 Running SBOM generation in Docker...$(NC)"
	@docker run --rm \
		-v $(shell pwd):/workspace \
		-w /workspace \
		-e HOME=/tmp \
		sbom-generator both /workspace/$(OUTPUT_DIR)
	@echo "$(GREEN)✅ SBOM generation complete!$(NC)"

# Utility targets
check-tools: ## Check if all SBOM tools are installed
	@echo "$(BLUE)🔧 Checking SBOM tools...$(NC)"
	@echo "Required Tools:"; \
	@echo "  cyclonedx-npm:     $(shell command -v npx 2>/dev/null && echo "$(GREEN)✅$(NC) (via npx)" || echo "$(RED)❌$(NC)")"; \
	@echo "  cyclonedx-gomod:   $(shell command -v cyclonedx-gomod 2>/dev/null && echo "$(GREEN)✅$(NC)" || echo "$(RED)❌$(NC)")"; \
	@echo "  cyclonedx-py:      $(shell command -v cyclonedx-py 2>/dev/null && echo "$(GREEN)✅$(NC)" || echo "$(RED)❌$(NC)")"; \
	@echo "  syft:              $(shell command -v syft 2>/dev/null && echo "$(GREEN)✅$(NC)" || echo "$(RED)❌$(NC)")"; \
	@echo "  cosign:            $(shell command -v cosign 2>/dev/null && echo "$(GREEN)✅$(NC)" || echo "$(RED)❌$(NC)")"; \
	@echo "  grype:             $(shell command -v grype 2>/dev/null && echo "$(GREEN)✅$(NC)" || echo "$(RED)❌$(NC)")"; \
	@echo ""
	@echo "Optional Tools:"; \
	@echo "  cyclonedx-validator: $(shell command -v cyclonedx-validator 2>/dev/null && echo "$(GREEN)✅$(NC)" || echo "$(YELLOW)⚪$(NC)")"; \
	@echo "  spdx-validate:      $(shell command -v spdx-validate 2>/dev/null && echo "$(GREEN)✅$(NC)" || echo "$(YELLOW)⚪$(NC)")";

install-tools: ## Install all required SBOM tools
	@echo "$(BLUE)📦 Installing SBOM tools...$(NC)"
	@echo "Installing Node.js tools..."
	@npm install -g @cyclonedx/cyclonedx-npm @cyclonedx/cyclonedx-validator @spdx/tools
	@echo "Installing Go tools..."
	@go install github.com/CycloneDX/cyclonedx-gomod/cmd/cyclonedx-gomod@latest
	@echo "Installing Python tools..."
	@pip install cyclonedx-bom
	@echo "Installing Syft..."
	@curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
	@echo "Installing Cosign..."
	@curl -LO https://github.com/sigstore/cosign/releases/latest/download/cosign-$(shell uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m)
	@sudo mv cosign-$(shell uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m) /usr/local/bin/cosign
	@chmod +x /usr/local/bin/cosign
	@echo "Installing Grype..."
	@curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
	@echo "$(GREEN)✅ All tools installed!$(NC)"

# Git hooks
git-hooks:
	@echo "$(BLUE)🔧 Setting up Git hooks for SBOM...$(NC)"
	@mkdir -p .git/hooks
	@cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for SBOM generation
if git diff --cached --name-only | grep -qE "(package\.json|go\.mod|requirements\.txt|Chart\.yaml)"; then
    echo "Changes detected in dependency files. Generating SBOMs..."
    if make cyclonedx 2>/dev/null; then
        echo "SBOMs generated successfully."
        git add sbom-output/ 2>/dev/null || true
    else
        echo "SBOM generation failed. Continuing commit..."
    fi
fi
EOF
	@chmod +x .git/hooks/pre-commit
	@echo "$(GREEN)✅ Git hooks set up!$(NC)"

# CI/CD targets
ci-generate: clean generate validate sign ## Generate SBOMs for CI/CD
ci-upload: ci-generate upload ## Generate and upload SBOMs for CI/CD

.PHONY: git-hooks ci-generate ci-upload check-tools install-tools summary list
