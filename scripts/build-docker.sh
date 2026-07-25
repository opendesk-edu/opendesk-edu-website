#!/usr/bin/env bash
# Docker build script for openDesk Edu website
# Handles BuildKit compatibility and tagging with commit SHA

set -euo pipefail

# Get current commit SHA (short version)
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")

# Determine if we're in CI or local development
IN_CI=${CI:-false}

# Build arguments
IMAGE_NAME="opendesk-edu"
IMAGE_TAG="latest"
FULL_TAG="${IMAGE_NAME}:${IMAGE_TAG}"
SHA_TAG="${IMAGE_NAME}:${COMMIT_SHA}"

echo "Building Docker image..."
echo "  Commit SHA: ${COMMIT_SHA}"
echo "  Image tags: ${FULL_TAG}, ${SHA_TAG}"
echo "  In CI: ${IN_CI}"
echo ""

# Try with BuildKit first (recommended)
if docker buildx build --help >/dev/null 2>&1; then
  echo "✓ BuildKit available, using docker buildx"
  
  # Use buildx with BuildKit cache
  docker buildx build \
    --platform linux/amd64 \
    --load \
    -t "${FULL_TAG}" \
    -t "${SHA_TAG}" \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    .
else
  echo "⚠ BuildKit not available, falling back to standard docker build"
  
  # Standard build with BuildKit enabled
  DOCKER_BUILDKIT=1 docker build \
    -t "${FULL_TAG}" \
    -t "${SHA_TAG}" \
    .
fi

echo ""
echo "✓ Build completed successfully"
echo "  Tags: ${FULL_TAG}, ${SHA_TAG}"
echo ""
echo "To run locally:"
echo "  docker compose up -d"
echo ""
echo "To push to registry:"
echo "  docker push ${FULL_TAG}"
echo "  docker push ${SHA_TAG}"
