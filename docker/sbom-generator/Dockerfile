# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2026 openDesk Edu
# Licensed under the Apache License, Version 2.0

# SBOM Generator Image for openDesk Edu
# This image contains all tools needed to generate SBOMs for the complete openDesk Edu ecosystem
#
# Usage:
#   docker build -t sbom-generator .
#   docker run --rm -v $(pwd):/workspace -w /workspace sbom-generator \
#     ./scripts/generate-sbom.sh both /workspace/sbom-output
#
# Or use the published image:
#   docker run --rm -v $(pwd):/workspace -w /workspace \
#     ghcr.io/opendesk-edu/sbom-generator:latest \
#     ./scripts/generate-sbom.sh both /workspace/sbom-output

FROM ubuntu:24.04

# Metadata
LABEL org.opencontainers.image.title="openDesk Edu SBOM Generator"
LABEL org.opencontainers.image.description="Container image for generating SBOMs for openDesk Edu components"
LABEL org.opencontainers.image.vendor="openDesk Edu"
LABEL org.opencontainers.image.license="Apache-2.0"
LABEL org.opencontainers.image.url="https://opendesk-edu.org"
LABEL org.opencontainers.image.source="https://github.com/opendesk-edu/opendesk-edu-website"
LABEL org.opencontainers.image.version="1.0.0"
LABEL maintainer="openDesk Edu Team <info@opendesk-edu.org>"

# Environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    NODE_VERSION=20 \
    GO_VERSION=1.23 \
    PYTHON_VERSION=3.11

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    gnupg \
    jq \
    make \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    rm -rf /var/lib/apt/lists/*

# Install Go
RUN curl -fsSL https://go.dev/dl/go$GO_VERSION.linux-amd64.tar.gz | tar -xz -C /usr/local && \
    echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile.d/go.sh && \
    ln -s /usr/local/go/bin/go /usr/local/bin/go
ENV PATH=/usr/local/go/bin:$PATH

# Install Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set Python as default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 10 && \
    curl -sS https://bootstrap.pypa.io/get-pip.py | python
ENV PYTHON=python3

# Install SBOM tools
RUN npm install -g @cyclonedx/cyclonedx-npm@latest && \
    go install github.com/CycloneDX/cyclonedx-gomod/cmd/cyclonedx-gomod@latest && \
    pip install cyclonedx-bom && \
    curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Install Cosign for signing
RUN curl -LO https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64 && \
    mv cosign-linux-amd64 /usr/local/bin/cosign && \
    chmod +x /usr/local/bin/cosign

# Install additional useful tools
RUN curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin && \
    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Install CycloneDX CLI
RUN curl -sL https://github.com/CycloneDX/cyclonedx-cli/releases/latest/download/cyclonedx-cli-linux-x64 -o /usr/local/bin/cyclonedx && \
    chmod +x /usr/local/bin/cyclonedx

# Install SPDX tools
RUN npm install -g @spdx/tools

# Create working directory
WORKDIR /workspace

# Copy scripts
COPY scripts/generate-sbom.sh /usr/local/bin/generate-sbom.sh
RUN chmod +x /usr/local/bin/generate-sbom.sh

# Set default command
ENTRYPOINT ["/usr/local/bin/generate-sbom.sh"]
CMD ["both", "sbom-output"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --version && go version && python --version && cyclonedx --version || exit 1

# SBOM for this image itself
RUN cyclonedx convert -i /dev/null -f cyclonedx-json -o /sbom-image.json 2>/dev/null || true
