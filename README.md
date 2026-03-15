# Assertify - AI-Powered Test Case Generation

<br />
<br />
<div align="center">
  <a href="https://vercel.com/oss">
    <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
  </a>
</div>
<br />
<br />
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
- Multi-LLM Support (OpenAI, Anthropic Claude, Google Gemini)

## Installation

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open http://localhost:3000 in your browser
4. **Enter your API key in the UI**. Keys are stored in your browser's `sessionStorage` in plaintext for convenience; they are not encrypted or transmitted to our servers. Be aware that browser extensions or any cross-site scripting (XSS) vulnerability in this tab could potentially access this session data.

## How to Use

1. Select your preferred LLM provider (OpenAI, Anthropic, or Gemini) and model from the landing page or settings.
2. Provide your project description from the landing page; the app automatically classifies the category.
3. Answer the context questions (or skip) so the generator can tailor scenarios to your needs.
4. Review generated tests on the results page, filter by type or priority, and inspect the suggested testing strategy and risk areas.
5. Generate boilerplate code for your preferred frameworks or export the dataset as JSON/CSV.
6. Manage settings at `/settings` to define default context, disable frameworks, and control boilerplate sample sizes.

## Future Improvements

- Offer more granular configuration for question generation (e.g., required question count, tone, or domain presets).
- Optimize large test suites by streaming responses and deduplicating similar scenarios before persistence.
- Provide deeper integrations with CI/CD by exporting ready-to-run suites or syncing with test management tools.

## License

MIT
