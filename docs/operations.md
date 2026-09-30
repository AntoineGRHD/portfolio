# Operations

How the site is configured, built and deployed, and where the generated files live.

## Configuration

The build reads two variables. Locally they come from `.env` (copy `.env.example`); in CI, from the GitHub repository settings.

| Variable | Required | In CI | Effect |
|---|---|---|---|
| `CONTACT_EMAIL` | yes, the build fails if it is empty | repository **secret** | Contact address. Encoded at build time: it never appears as text in the source or the site's HTML and JavaScript. It does appear in plain text in the CV PDFs. |
| `SHOW_CV_DOWNLOAD` | must be defined locally, even as `false` | repository **variable** (unset means hidden) | `true` shows the CV download link in the contact section. The PDFs are published either way. |

Changing them in CI:

```sh
# from a normal terminal: it prompts for the value
gh secret set CONTACT_EMAIL -R AntoineGRHD/portfolio
gh variable set SHOW_CV_DOWNLOAD --body true -R AntoineGRHD/portfolio
```

Run `gh secret set` from a real terminal. Without one (for example through a `!` shell in an assistant) it reads an empty value from standard input and stores it; the next build then stops on the empty-address check. To set it non-interactively, pipe the value: `printf '%s' 'address' | gh secret set CONTACT_EMAIL -R AntoineGRHD/portfolio`.

Both are read at build time only, so after a change, redeploy: Actions → *Deploy to GitHub Pages* → *Run workflow*, or `gh workflow run deploy.yml -R AntoineGRHD/portfolio`.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: `npm ci`, `npm run build`, `npm run check`, `npm run lint`, then `node scripts/build-cv.mjs`, and publishes `build/` to GitHub Pages. If any step fails, nothing is published and the live site stays on the previous version.

Domain: `antoinegourhand.com`, set in three places that must agree:
- `siteUrl` in `src/lib/site.ts`, which feeds the canonical and hreflang links, Open Graph URLs, `sitemap.xml` and `robots.txt`;
- `static/CNAME`;
- the repository's *Settings → Pages* (source: GitHub Actions, custom domain, Enforce HTTPS).

## CV PDFs

A hidden page, `src/routes/cv/+page.svelte` (`/cv/` and `/fr/cv/`, not indexed, not in the sitemap), lays out an A4 CV from the same data as the site. Its short texts come from the `short` and `points` fields in `src/data/experiences.ts`, which only the CV uses.

`scripts/build-cv.mjs` serves `build/`, prints that page with Chrome in each locale and theme, and writes:

```
build/cv/antoine-gourhand-cv-{en,fr}-{light,dark}.pdf
```

Published at `https://antoinegourhand.com/cv/antoine-gourhand-cv-<locale>-<theme>.pdf`, whether or not the site links to them.

- `npm run cv` builds the site, then prints. It reports the space left on the page per locale and **fails if the content outgrows one A4 page**, with the overflow in millimetres.
- The file names are defined twice: `fileName` in `scripts/build-cv.mjs` and `cvPath` in `src/lib/site.ts`. Keep them in sync.
- Chrome defaults to `google-chrome`; override it with `CHROME=/path/to/chrome`.
- The prerender step ignores links to `/cv/*.pdf` (`handleHttpError` in `svelte.config.js`), since the PDFs only exist after the build.

Viewing them locally: `npm run preview` does **not** serve them, because it serves SvelteKit's internal output rather than `build/`. After `npm run cv`, serve `build/` as GitHub Pages does:

```sh
python3 -m http.server -d build 4173
```

## Social preview images

`static/og-en.png` and `static/og-fr.png` (1200×630, used as `og:image`) are screenshots of the hero, **committed and not regenerated on deploy**. After changing anything visible in the hero (texts, colours, fonts), regenerate and commit them:

```sh
npm run capture:og
```

LinkedIn and other sites cache previews; LinkedIn's Post Inspector refreshes its copy.
