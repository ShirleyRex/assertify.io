# Assertify - AI-Powered Test Case Generation

<br />
<br />
<a href="https://vercel.com/oss">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
</a>

Assertify is an intelligent testing assistant that analyzes your project description, asks clarifying questions, and generates comprehensive test suites across multiple testing styles and frameworks.

## Features

- **AI project analysis** that classifies your work and requests extra context before any generation starts.
- **Dynamic question generation** with a resilient fallback list so you never get stuck when the API is unavailable.
- **Configurable settings** for persistent default context, disabling unwanted test types, and tailoring boilerplate sample sizes.
- **Comprehensive test coverage** spanning unit, integration, feature, performance, and manual scenarios with prioritization metadata.
- **Boilerplate code generation** for eight popular frameworks, respecting the frameworks you disable in settings.
- **Flexible exports and saving** allowing JSON/CSV downloads plus local storage history.
- **Responsive, themable UI** that works on desktop, tablet, and mobile with light/dark theme support.

## Supported Testing Frameworks

- Vitest (JavaScript/TypeScript)
- Jest (JavaScript/TypeScript)
- Pytest (Python)
- Unittest (Python)
- JUnit (Java)
- PHPUnit (PHP)
- RSpec (Ruby)
- Mocha (JavaScript)

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API

## Installation

1. Install dependencies: `npm install`
2. Copy the environment file: `cp .env.example .env.local`
3. Add your OpenAI API key to `.env.local`
4. Start the dev server: `npm run dev`
5. Open http://localhost:3000 in your browser

## How to Use

1. Provide your project description from the landing page; the app automatically classifies the category.
2. Answer the context questions (or skip) so the generator can tailor scenarios to your needs.
3. Review generated tests on the results page, filter by type or priority, and inspect the suggested testing strategy and risk areas.
4. Generate boilerplate code for your preferred frameworks or export the dataset as JSON/CSV.
5. Manage settings at `/settings` to define default context, disable frameworks, and control boilerplate sample sizes.

## Future Improvements

- Allow selecting different LLM providers and models per generation so teams can optimize for latency or cost.
- Offer more granular configuration for question generation (e.g., required question count, tone, or domain presets).
- Optimize large test suites by streaming responses and deduplicating similar scenarios before persistence.
- Provide deeper integrations with CI/CD by exporting ready-to-run suites or syncing with test management tools.

## License

MIT
