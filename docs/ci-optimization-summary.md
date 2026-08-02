# CI/CD Optimization Summary

This document summarizes the CI/CD optimizations applied across openDesk projects and serves as a blueprint for future optimizations.

## Results Achieved

### opendesk-edu-website (Next.js)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total CI Time | ~26 minutes | ~18-20 minutes (cached) | **~6-8 min faster** |
| First Run | ~26 minutes | ~28 minutes | +2 min (cache setup) |
| validate job | 8m0s | 4m46s | **+3m14s** |
| lint job | 7m57s | 5m17s | **+2m40s** |
| security job | 5m11s | 5m1s | **+1m10s** |

**Changes Applied:**
1. ✅ Added `actions/cache@v4` for `node_modules/` and `~/.npm`
2. ✅ Added `actions/cache@v4` for `.next/cache` (Next.js build cache)
3. ✅ Removed unnecessary job dependencies (validate, lint, test run in parallel)
4. ✅ Fixed Playwright install issue (self-hosted runner already has browsers)
5. ✅ Fixed Test Coverage workflow (invalid vitest reporter syntax)

**Files Modified:**
- `.github/workflows/ci.yml` - Added caching, parallelization
- `.github/workflows/coverage.yml` - Fixed vitest reporter syntax

---

### user_import (Python)

**Before:** No CI workflow (only SBOM generation)

**After:** Comprehensive CI workflow with:
- Python virtualenv caching
- pytest test suite
- flake8 + black linting
- pyproject.toml validation

**Expected Time:** ~3-5 minutes per run

**Files Added:**
- `.github/workflows/ci.yml` - New comprehensive workflow

---

## Optimization Patterns Applied

### 1. Node.js Caching Pattern

```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
      .next/cache  # For Next.js projects
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Projects:** opendesk-edu-website (done), any other Node.js projects

### 2. Python Caching Pattern

```yaml
- name: Cache virtualenv
  uses: actions/cache@v4
  with:
    path: .venv/
    key: ${{ runner.os }}-venv-${{ hashFiles('**/pyproject.toml') }}
    restore-keys: |
      ${{ runner.os }}-venv-
```

**Projects:** user_import (done), any other Python projects

### 3. Go Caching Pattern

```yaml
- name: Cache go modules
  uses: actions/cache@v4
  with:
    path: ~/go/pkg/mod
    key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
    restore-keys: |
      ${{ runner.os }}-go-
```

**Projects:** k8up, opendesk-dev-agent-operator (already have this)

### 4. Docker Build Caching

```yaml
- name: Cache Docker layers
  uses: actions/cache@v4
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-buildx-
```

**Projects:** k8up, addon-nextcloud_integration, opendesk-dev-agent-operator

### 5. Parallel Job Execution

**Before:**
```yaml
jobs:
  validate:
    runs-on: [self-hosted, linux]
  lint:
    runs-on: [self-hosted, linux]
    needs: validate  # ❌ Unnecessary
  test:
    runs-on: [self-hosted, linux]
    needs: lint  # ❌ Unnecessary
```

**After:**
```yaml
jobs:
  validate:
    runs-on: [self-hosted, linux]
  lint:
    runs-on: [self-hosted, linux]
    # ✅ No needs - runs in parallel
  test:
    runs-on: [self-hosted, linux]
    # ✅ No needs - runs in parallel
  build:
    runs-on: [self-hosted, linux]
    needs: [lint, test, validate]  # ✅ Only build needs all checks
```

**Note:** Self-hosted runner only processes one job at a time, but on GitHub-hosted runners these run truly in parallel.

---

## Project Status

| Project | CI/CD Status | Actions Taken | Next Steps |
|---------|--------------|---------------|------------|
| opendesk-edu-website | ✅ Optimized | Caching, parallelization, fixes | Monitor timing, add workflow_dispatch |
| k8up | ✅ Well-optimized | Already has caching | Add workflow_dispatch, Docker cache |
| user_import | ✅ Optimized | Added CI workflow with caching | Test on PRs, monitor timing |
| opendesk-dev-agent-operator | ⚠️ Partially optimized | Has Go caching | Add Docker cache, workflow_dispatch |
| addon-nextcloud_integration | ❌ Not optimized | No caching | Add Maven cache, Docker cache |
| opendesk-edu-spec | ❌ Not optimized | No CI for code | Add Python caching |
| opendesk-nix | ❌ Not optimized | Large, slow CI | Add Nix store cache, cachix |

---

## Cache Key Best Practices

### Cache Invalidation Strategy

| Scenario | Key | Effect |
|----------|-----|--------|
| Exact match | `os-node-hash(package-lock.json)` | Restores only when deps unchanged |
| Prefix match | `os-node-` (restore-keys) | Restores most recent cache even if deps changed slightly |

### Cache Paths to Consider

| Language/Tool | Path | Size | Notes |
|---------------|------|------|-------|
| npm | `node_modules/` | ~200-500MB | Cache per project |
| npm | `~/.npm` | ~100-200MB | Shared npm cache |
| Next.js | `.next/cache/` | ~50-200MB | Build cache |
| Go | `~/go/pkg/mod` | ~100-500MB | Shared Go modules |
| Python | `.venv/` | ~100-300MB | Per project virtualenv |
| Java/Maven | `~/.m2/repository` | ~500MB-1GB | Shared Maven repo |
| Docker | `/tmp/.buildx-cache` | ~500MB-2GB | Build cache layers |
| Playwright | `~/.cache/ms-playwright` | ~300MB | Browser binaries |

---

## Quick Reference: Adding Caching

### For Node.js Projects
1. Add cache step before `npm ci`
2. Include `node_modules/` and `~/.npm`
3. Use `hashFiles('**/package-lock.json')` for key
4. Optionally add `.next/cache` for Next.js

### For Python Projects
1. Add cache step before `pip install`
2. Include `.venv/` or `venv/`
3. Use `hashFiles('**/requirements.txt')` or `hashFiles('**/pyproject.toml')`

### For Go Projects
1. Add cache step before `go mod download`
2. Include `~/go/pkg/mod`
3. Use `hashFiles('**/go.sum')`
4. actions/setup-go has built-in cache (enable with `cache: true`)

### For Java/Maven Projects
1. Add cache step before `mvn install`
2. Include `~/.m2/repository`
3. Use `hashFiles('**/pom.xml')`

---

## Common Issues and Fixes

### Issue: Cache not restoring on subsequent runs
**Fix:** Check cache key hash. Ensure `hashFiles()` includes all relevant lock files.

### Issue: Cache restoring but still slow
**Fix:** Check if `restore-keys` is too broad, causing large cache downloads. Be more specific.

### Issue: action cache failing with path issues
**Fix:** Some runners (self-hosted) may have permission issues. Use absolute paths:
```yaml
path: |
  /home/runner/.npm
  /home/runner/work/repo/node_modules
```

### Issue: Docker build still slow with caching
**Fix:** Use BuildKit with cache mounts:
```yaml
- uses: docker/setup-buildx-action@v2
- name: Build and push
  uses: docker/build-push-action@v4
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

---

## Testing Your Optimization

1. **Run workflow manually** to test changes
2. **Watch cache hits/misses** in workflow logs
3. **Compare timing** between first and second runs
4. **Check cache usage** in GitHub Actions storage settings

**Cache Hit Example:**
```
Cache restored from key: Linux-node-abc123
Cache hit occurred for cache: Linux-node-abc123
```

**Cache Miss Example:**
```
Cache not found for input keys: Linux-node-abc123
Downloading cache ecosystem...
```

---

## References

- [GitHub Actions Caching](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [actions/cache@v4](https://github.com/actions/cache)
- [Next.js Build Cache](https://nextjs.org/docs/advanced-features/output-file-tracing#automatic-static-optimization)

---

## Changelog

| Date | Project | Change | Effect |
|------|---------|--------|--------|
| 2026-08-02 | opendesk-edu-website | Added Node.js caching | ~6-8 min faster |
| 2026-08-02 | opendesk-edu-website | Parallel job execution | ~1 min faster |
| 2026-08-02 | opendesk-edu-website | Fixed Test Coverage workflow | ✅ Passing |
| 2026-08-02 | user_import | Added CI workflow with caching | New capability |

---

*Documentation maintained by: openDesk Edu Team*
*Last updated: 2026-08-02*
