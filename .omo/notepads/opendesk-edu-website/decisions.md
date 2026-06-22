# Decisions

## [2026-04-14] Wave 1 Strategy
- Tasks 1-7 are project scaffolding, but Tasks 2-6 depend on Task 1 (npm init must come first)
- Executing Task 1 first, then Tasks 2-7 in parallel
- Actually: `npm create next-app` already creates tsconfig, eslint, tailwind, etc. So Task 1 will create the base, and Tasks 2-6 will MODIFY what was created.
- Task 7 (Docker) is independent and can run after Task 1
