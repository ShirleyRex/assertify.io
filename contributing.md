# Contributing to Assertify

Thanks for considering a contribution to Assertify! This document outlines how to set up a local environment, the coding standards we follow, and what we expect from every pull request.

## Ways to Contribute

- Report bugs or request features by opening an Issue with clear reproduction steps or user stories.
- Improve documentation, copy, or accessibility anywhere in the repo.
- Tackle open issues that are tagged `good first issue`, `help wanted`, or any topic you feel comfortable owning.

## Prerequisites

- **Node.js 18.x** and the matching npm release (the CI pipeline pins Node 18).
- An OpenAI API key stored in `.env.local` so you can exercise AI-powered features locally.
- `git` and GitHub access so you can fork and open pull requests.

## Local Development

1. Fork the repository on GitHub and clone your fork.
2. Install dependencies: `npm install`.
3. Copy the example environment file: `cp .env.example .env.local`, then add your OpenAI API key.
4. Launch the dev server with `npm run dev` and visit `http://localhost:3000`.
5. Run `npm run build` before opening a pull request to ensure Next.js can compile.

## Branching, Commits, and Style

- Create feature branches off `master` using the pattern `type/short-description` (e.g., `feat/context-questions`).
- Keep commits focused; prefer smaller commits that describe _why_ a change exists.
- Follow the existing TypeScript, React, and Tailwind conventions already present in the code you touch.

## Quality Checks

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs linting and formatting on every pull request. Run the same commands locally before pushing:

```bash
npm run lint
npm run format:check
```

Use `npm run format` to auto-format files. Please fix all warnings or explain why they cannot be resolved in the pull request description.

## Pull Request Checklist

- [ ] Explain the motivation and link the Issue being addressed.
- [ ] Include screenshots or recordings for UI changes (desktop + mobile where relevant).
- [ ] Update documentation (README, docs, or component stories) when behavior changes.
- [ ] Ensure `npm run build`, `npm run lint`, and `npm run format:check` succeed locally.
- [ ] Request at least one review and be responsive to feedback.

## Reporting Issues

When filing an Issue, include:

- Expected vs. actual behavior and reproduction steps.
- Environment details (OS, browser, Node version) if applicable.
- Logs, stack traces, or screenshots that make the problem easier to diagnose.

## Questions

Unsure about the best approach or need clarification before opening a PR? Start a GitHub Discussion or comment on the related Issue so we can align on a solution before you invest significant time.

Happy testing!
