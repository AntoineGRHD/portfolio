# antoinegourhand.com

My personal portfolio: a bilingual (English/French) single-page site presenting my experience as a tech lead and fullstack developer.

**Live:** [antoinegourhand.com](https://antoinegourhand.com)

![Portfolio home page](https://antoinegourhand.com/og-en.png)

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) with Svelte 5 and TypeScript
- Paraglide for internationalization
- SCSS
- Prerendered as a static site, deployed to GitHub Pages with GitHub Actions

Content (experience, skills) lives in `src/data/`, interface text in `messages/`.

## Running locally

Requires Node.js 24 or later.

```sh
cp .env.example .env   # then set CONTACT_EMAIL
npm ci
npm run dev
```

Other scripts: `npm run build`, `npm run check` (type checking) and `npm run lint`.

## Deployment

Every push to `main` builds and deploys the site through GitHub Actions. The build reads the contact address from the `CONTACT_EMAIL` repository secret, and shows the CV download link only when the `SHOW_CV_DOWNLOAD` repository variable is `true` (the CV PDFs are published either way).

---

Built with the help of AI coding agents (Claude Code).
