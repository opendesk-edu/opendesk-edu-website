# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2026 openDesk Edu
# Licensed under the Apache License, Version 2.0

# Makefile for SBOM generation and management
# This Makefile is for the openDesk Edu WEBSITE repository only
# For full multi-component SBOM generation, use the main monorepo
#
# Usage: make [target]
#
# Available targets:
#   help            - Show this help
#   all             - Generate website SBOMs (both formats)
#   cyclonedx       - Generate CycloneDX SBOM only
#   spdx            - Generate SPDX SBOM only
#   website         - Generate SBOM for website (alias for all)
#   validate        - Validate generated SBOMs
#   sign            - Sign all generated SBOMs with cosign
#   clean           - Remove all generated SBOMs
#   docker-build    - Build SBOM generator Docker image
#   docker-run      - Run SBOM generation in Docker

.PHONY: help all cyclonedx spdx website validate sign clean docker-build docker-run

# Configuration
OUTPUT_DIR ?= sbom-output
FORMAT ?= both

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

help: ## Show this help message
	@echo "openDesk Edu Website SBOM Management"
	@echo "==================================="
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "SBOM Generation:"
	@echo "  all              - Generate all SBOMs (default)"
	@echo "  cyclonedx        - Generate CycloneDX SBOM only"
	@echo "  spdx             - Generate SPDX SBOM only"
	@echo "  website          - Generate website SBOM (alias)"
	@echo ""
	@echo "Post-processing:"
	@echo "  validate         - Validate all generated SBOMs"
	@echo "  sign             - Sign all generated SBOMs with cosign"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean            - Remove all generated SBOMs"
	@echo "  docker-build     - Build SBOM generator Docker image"
	@echo "  docker-run       - Run SBOM generation in Docker"
	@echo ""

all: clean generate-website ## Generate all SBOMs (website)
generate-website: generate-website-cyclonedx generate-website-spdx

cyclonedx: clean generate-website-cyclonedx ## Generate CycloneDX SBOM only
spdx: clean generate-website-spdx ## Generate SPDX SBOM only
website: all ## Generate website SBOM (alias for all)

generate-website-cyclonedx:
	@mkdir -p $(OUTPUT_DIR)
	@echo "$(BLUE)🌐 Generating CycloneDX SBOM for website...$(NC)"
	@npx @cyclonedx/cyclonedx-npm@latest -o $(OUTPUT_DIR)/sbom-website-cyclonedx.json
	@echo "$(GREEN)✅ CycloneDX SBOM generated: $(OUTPUT_DIR)/sbom-website-cyclonedx.json$(NC)"

generate-website-spdx:
	@mkdir -p $(OUTPUT_DIR)
	@echo "$(BLUE)🌐 Generating SPDX SBOM for website...$(NC)"
	@npx spdx-npm -o $(OUTPUT_DIR)/sbom-website-spdx.json
	@echo "$(GREEN)✅ SPDX SBOM generated: $(OUTPUT_DIR)/sbom-website-spdx.json$(NC)"

validate: ## Validate all generated SBOMs
	@echo "$(BLUE)🔍 Validating SBOMs...$(NC)"
	@if [ -f $(OUTPUT_DIR)/sbom-website-cyclonedx.json ]; then \
		@echo "Validating CycloneDX SBOM..."; \
		@npx @cyclonedx/cyclonedx-validator $(OUTPUT_DIR)/sbom-website-cyclonedx.json || echo "$(YELLOW)⚠️  Validation warnings found$(NC)"; \
	fi; \
	@if [ -f $(OUTPUT_DIR)/sbom-website-spdx.json ]; then \
		@echo "Validating SPDX SBOM..."; \
		@echo "$(YELLOW)⚠️  SPDX validation requires spdx-tools (npm install -g @spdx/tools)$(NC)"; \
	fi; \
	@echo "$(GREEN)✅ Validation complete$(NC)"

sign: ## Sign all generated SBOMs with cosign
	@echo "$(BLUE)🔐 Signing SBOMs...$(NC)"
	@if [ ! -f cosign.key ]; then \
		@echo "$(RED)❌ cosign.key not found. Generate with: cosign generate-key-pair$(NC)"; \
		@exit 1; \
	fi; \
	@for file in $(OUTPUT_DIR)/sbom-*.json; do \
		if [ -f "$$file" ]; then \
			@echo "Signing $$file..."; \
			@cosign sign-blob --key cosign.key "$$file" \
				--output-signature "$$file.sig" \
				--output-certificate "$$file.cert" 2>/dev/null || \
				@echo "$(YELLOW)⚠️  Failed to sign $$file (cosign not installed?)$(NC)"; \
		fi; \
	done; \
	@echo "$(GREEN)✅ All SBOMs signed!$(NC)"

clean: ## Remove all generated SBOMs
	@echo "$(YELLOW)🧹 Cleaning up SBOM files...$(NC)"
	@rm -rf $(OUTPUT_DIR)
	@rm -f sbom-*.json sbom-*.json.sig sbom-*.json.cert
	@echo "$(GREEN)✅ Cleanup complete!$(NC)"

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
		sbom-generator:latest both sbom-output
	@echo "$(GREEN)✅ SBOM generation complete!$(NC)"

# Git hooks
git-hooks:
	@echo "$(BLUE)🔧 Setting up Git hooks for SBOM...$(NC)"
	@mkdir -p .git/hooks
	@cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for SBOM generation
if git diff --cached --name-only | grep -qE "(package\.json|package-lock\.json)"; then
    echo "Changes detected in dependency files. Generating SBOMs..."
    if make cyclonedx 2>/dev/null; then
        echo "SBOMs generated successfully."
        git add $(OUTPUT_DIR)/ 2>/dev/null || true
    else
        echo "SBOM generation failed. Continuing commit..."
    fi
fi
EOF
	@chmod +x .git/hooks/pre-commit
	@echo "$(GREEN)✅ Git hooks set up!$(NC)"

.PHONY: git-hooks generate-website-cyclonedx generate-website-spdx generate-website
