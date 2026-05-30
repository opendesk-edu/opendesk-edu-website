# Contributing to openDesk Edu Website

Thank you for considering contributing to the openDesk Edu website!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/opendesk-edu/opendesk-edu-website.git`
3. Install dependencies: `npm install`
4. Start the dev server: `npm run dev`

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Build to verify: `npm run build`
6. Commit and push your branch
7. Open a pull request

## Code Style

- TypeScript strict mode
- Follow existing patterns in the codebase
- Use Tailwind CSS for styling (utility-first approach)
- Components should be in `src/components/`
- i18n strings go in `messages/{locale}.json`

## Content Contributions

For blog posts or documentation articles:
1. Create a `.md` file in `content/{locale}/{section}/`
2. Add required frontmatter (title, date, description, categories, tags)
3. Submit via pull request

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new functionality
- Update documentation if needed
- Ensure all CI checks pass

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.