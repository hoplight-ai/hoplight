# Hoplight

Marketing site for **[hoplight.ai](https://hoplight.ai)** — Hoplight builds production AI systems for labor unions, political campaigns, and mission-driven organizations operating under high-stakes regulatory and compliance constraints.

[![CI](https://github.com/hoplight-ai/hoplight/actions/workflows/ci.yml/badge.svg)](https://github.com/hoplight-ai/hoplight/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## Tech stack

- **[Next.js](https://nextjs.org/) 16** (App Router) with **React 19**
- **TypeScript 5** in `strict` mode
- Plain CSS (`src/app/globals.css`) with self-hosted GT America web fonts
- JSON-LD structured data for SEO / generative-engine optimization
- Deployed on **[Vercel](https://vercel.com/)** (`output: 'standalone'`)

## Getting started

Requires **Node.js 22+** (see [`.nvmrc`](./.nvmrc)).

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
```

Edit any file under `src/app/` and the browser refreshes automatically.

## Scripts

| Command                | What it does                               |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start the local dev server with hot reload |
| `npm run build`        | Production build                           |
| `npm start`            | Serve the production build                 |
| `npm run lint`         | Lint with ESLint (`eslint-config-next`)    |
| `npm run format`       | Format the codebase with Prettier          |
| `npm run format:check` | Check formatting without writing changes   |

## Project structure

```
src/
  app/                # Routes — one folder per page (App Router)
    layout.tsx        # Shared shell: <Nav>, <main>, <Footer>, global metadata
    page.tsx          # Home (/)
    about/page.tsx    # /about
    services/page.tsx # /services
    work/page.tsx     # /work
    contact/page.tsx  # /contact
    faq/page.tsx      # /faq
    globals.css       # Global styles + CSS variables
  components/         # Shared UI (Nav, Footer, HoplightSymbol)
public/
  fonts/             # Self-hosted GT America fonts
```

Each folder under `src/app/` maps to a URL automatically — Next.js App Router convention.

## Deployment

The site deploys to Vercel. Pushing to the default branch triggers a
production deploy; pull requests get preview deployments. To deploy
manually:

```bash
npx vercel
```

## License

[MIT](./LICENSE) © Hoplight LLC
