# Remaining Sprints — Execution Plan

## Sprint 2: Speed & Images
- **6**: Replace `<img>` with `next/image` for blog teasers in PostCard, ArticlePage, RelatedPosts
- **8**: Add bundle analysis to CI pipeline

## Sprint 3: Engagement
- **9**: Social share buttons (copy link, Matrix, X, LinkedIn) on article pages
- **11**: Author byline on article pages

## Sprint 4: Infrastructure
- **13**: Scheduled uptime check cron workflow (5min)
- **14**: Docker image tag with commit SHA for rollback
- **15**: Accessibility check (pa11y-ci) in CI

## File Groups (conflict avoidance)
- **Group A** — ArticlePage.tsx: next/image, share buttons, author byline
- **Group B** — PostCard.tsx: next/image
- **Group C** — RelatedPosts.tsx: next/image
- **Group D** — CI/CD: ci.yml (bundle analysis, a11y), deploy.yml (docker tag), new uptime.yml
